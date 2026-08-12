<?php
require_once 'db.php';
require_once 'auth_helper.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
// [v1.26.0] Endpoint ora anche pubblico (pagine /tag/:slug): stessa politica
// degli altri endpoint dinamici, così una rinomina tag si propaga subito.
header('Cache-Control: no-store, no-cache, must-revalidate');

$pdo = Database::connect();
$method = $_SERVER['REQUEST_METHOD'];

function generateTagSlug($title, $pdo) {
    $accents      = ['à','è','é','ì','ò','ù','À','È','É','Ì','Ò','Ù','â','ê','î','ô','û','ä','ë','ï','ö','ü'];
    $replacements = ['a','e','e','i','o','u','a','e','e','i','o','u','a','e','i','o','u','a','e','i','o','u'];
    $title = str_replace($accents, $replacements, $title);
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
    
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM tags WHERE slug = ?");
    $stmt->execute([$slug]);
    $count = $stmt->fetchColumn();
    
    if ($count > 0) {
        $slug .= '-' . time();
    }
    return $slug;
}

try {
    if ($method === 'GET') {
        // [v1.26.0] Lookup pubblico per slug — alimenta la pagina archivio /tag/:slug.
        // Restituisce 404 se il tag non esiste, così il loader React può alzare
        // una Response 404 invece di mostrare un archivio vuoto (soft-404).
        if (isset($_GET['slug'])) {
            $stmt = $pdo->prepare("SELECT id, name, slug FROM tags WHERE slug = ? LIMIT 1");
            $stmt->execute([trim($_GET['slug'])]);
            $tag = $stmt->fetch();
            if (!$tag) {
                http_response_code(404);
                echo json_encode(['error' => 'Tag non trovato']);
                exit;
            }
            echo json_encode($tag);
            exit;
        }

        // Elenco completo. Con ?with_counts=1 aggiunge il numero di articoli
        // PUBBLICATI per tag (usato per non generare pagine tag vuote).
        if (isset($_GET['with_counts'])) {
            date_default_timezone_set('Europe/Rome');
            $stmt = $pdo->prepare(
                "SELECT t.id, t.name, t.slug,
                        (SELECT COUNT(*) FROM article_tags at2
                          JOIN articles a2 ON a2.id = at2.article_id
                         WHERE at2.tag_id = t.id
                           AND a2.status = 'published'
                           AND (a2.published_at IS NULL OR a2.published_at <= ?)) AS article_count
                 FROM tags t ORDER BY t.name ASC"
            );
            $stmt->execute([date('Y-m-d H:i:s')]);
            echo json_encode($stmt->fetchAll());
            exit;
        }

        $stmt = $pdo->query("SELECT id, name, slug FROM tags ORDER BY name ASC");
        echo json_encode($stmt->fetchAll());
    }
    elseif ($method === 'POST') {
        Auth::check();
        $data = json_decode(file_get_contents('php://input'), true);

        // ── [v1.27.0] UNISCI DUE TAG ────────────────────────────────
        // Sposta tutti gli articoli dal tag assorbito a quello di destinazione
        // e cancella il primo. Serve a rientrare dai 208 tag usati una volta sola
        // (refusi compresi: "leonaardo" → "leonardo") senza ritoccare gli articoli
        // uno per uno.
        if (($data['action'] ?? '') === 'merge') {
            $fromId = (int)($data['from_id'] ?? 0);
            $toId   = (int)($data['to_id'] ?? 0);

            if (!$fromId || !$toId || $fromId === $toId) {
                http_response_code(400);
                echo json_encode(['error' => 'Servono due tag diversi']);
                exit;
            }

            $chk = $pdo->prepare("SELECT id, name FROM tags WHERE id IN (?, ?)");
            $chk->execute([$fromId, $toId]);
            if (count($chk->fetchAll()) !== 2) {
                http_response_code(404);
                echo json_encode(['error' => 'Uno dei due tag non esiste']);
                exit;
            }

            $pdo->beginTransaction();
            try {
                // INSERT IGNORE: se un articolo ha già entrambi i tag la riga
                // duplicata viene scartata invece di far fallire l'unione.
                $pdo->prepare(
                    "INSERT IGNORE INTO article_tags (article_id, tag_id)
                     SELECT article_id, ? FROM article_tags WHERE tag_id = ?"
                )->execute([$toId, $fromId]);

                $moved = $pdo->prepare("DELETE FROM article_tags WHERE tag_id = ?");
                $moved->execute([$fromId]);
                $affected = $moved->rowCount();

                $pdo->prepare("DELETE FROM tags WHERE id = ?")->execute([$fromId]);

                // Riallinea la colonna legacy 'tags' degli articoli coinvolti:
                // la usa ancora search.php per la ricerca testuale.
                $pdo->exec(
                    "UPDATE articles a
                        SET a.tags = COALESCE((
                            SELECT GROUP_CONCAT(t.name ORDER BY t.name ASC SEPARATOR ', ')
                              FROM article_tags atx JOIN tags t ON t.id = atx.tag_id
                             WHERE atx.article_id = a.id
                        ), '')
                      WHERE a.id IN (SELECT article_id FROM article_tags WHERE tag_id = $toId)"
                );

                $pdo->commit();
                echo json_encode(['status' => 'success', 'moved' => $affected]);
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            exit;
        }

        $name = $data['name'] ?? null;
        if (!$name) { http_response_code(400); echo json_encode(['error' => 'Nome tag mancante']); exit; }

        $slug = $data['slug'] ?? generateTagSlug($name, $pdo);
        $stmt = $pdo->prepare("INSERT INTO tags (name, slug) VALUES (?, ?)");
        $stmt->execute([$name, $slug]);
        
        echo json_encode(['status' => 'success', 'id' => $pdo->lastInsertId(), 'slug' => $slug]);
    }
    elseif ($method === 'PUT') {
        Auth::check();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? ($data['id'] ?? null);
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID mancante']); exit; }

        $name = $data['name'] ?? null;
        if (!$name) { http_response_code(400); echo json_encode(['error' => 'Nome tag mancante']); exit; }

        $slug = $data['slug'] ?? generateTagSlug($name, $pdo);

        // Per non rompere chi usa il vecchio tag CSV salvato negli articles legacy, non ci sogniamo
        // (le articles legacy si aggiorneranno via via, chi migra lo converte).
        $stmt = $pdo->prepare("UPDATE tags SET name=?, slug=? WHERE id=?");
        $stmt->execute([$name, $slug, $id]);
        
        echo json_encode(['status' => 'success']);
    }
    elseif ($method === 'DELETE') {
        Auth::check();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? ($data['id'] ?? null);
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID mancante']); exit; }
        
        $stmt = $pdo->prepare("DELETE FROM tags WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    error_log(basename(__FILE__, '.php') . ' error: ' . $e->getMessage());
    echo json_encode(['error' => 'Errore interno del server.']);
}
?>

<?php
require_once 'db.php';
require_once 'auth_helper.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH');

$pdo = Database::connect();
$method = $_SERVER['REQUEST_METHOD'];

// [V1.5.5] Forzatura Fuso Orario Italiano (Bypass orario server Los Angeles)
date_default_timezone_set('Europe/Rome');
$ita_now_str = date('Y-m-d H:i:s');
$ita_now_time = time();

// Valida URL bottoni CTA: accetta solo http/https/mailto, rigetta javascript: e simili
function sanitizeUrl(string $url): string {
    $url = trim($url);
    if (empty($url)) return '';
    if (preg_match('/^mailto:/i', $url)) return $url;
    if (!preg_match('/^https?:\/\//i', $url)) return '';
    return filter_var($url, FILTER_VALIDATE_URL) ? $url : '';
}

// Helper per generare slug unici
function generateSlug($title, $pdo) {
    // [v1.5.10] Normalizzazione accenti italiani prima del replace (evita slug come "caf-" da "caffè")
    $accents      = ['à','è','é','ì','ò','ù','À','È','É','Ì','Ò','Ù','â','ê','î','ô','û','ä','ë','ï','ö','ü'];
    $replacements = ['a','e','e','i','o','u','a','e','e','i','o','u','a','e','i','o','u','a','e','i','o','u'];
    $title = str_replace($accents, $replacements, $title);
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
    
    // Verifica pendenza
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM articles WHERE slug = ?");
    $stmt->execute([$slug]);
    $count = $stmt->fetchColumn();
    
    if ($count > 0) {
        $slug .= '-' . time();
    }
    return $slug;
}

// Helper per i tag dinamici
function syncArticleTags($pdo, $article_id, $tags_input) {
    // Pulisci i vecchi tag
    $stmtDel = $pdo->prepare("DELETE FROM article_tags WHERE article_id = ?");
    $stmtDel->execute([$article_id]);

    $tags_array = is_array($tags_input) ? $tags_input : (is_string($tags_input) && !empty($tags_input) ? explode(',', $tags_input) : []);
    if (empty($tags_array)) return;

    // Aggiorniamo pure il campo legacy come "cache sicura" per retrocompatibilità in emergenza (opzionale)
    $cleanNames = [];

    $stmtFindTag = $pdo->prepare("SELECT id FROM tags WHERE name = ? OR slug = ? limit 1");
    $stmtInsertTag = $pdo->prepare("INSERT INTO tags (name, slug) VALUES (?, ?)");
    $stmtInsertLink = $pdo->prepare("INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)");

    foreach ($tags_array as $tagName) {
        $tagName = trim($tagName);
        if (empty($tagName)) continue;
        $cleanNames[] = $tagName;

        $slugObj = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', str_replace(['à','è','é','ì','ò','ù'], ['a','e','e','i','o','u'], $tagName))));
        
        $stmtFindTag->execute([$tagName, $slugObj]);
        $tagId = $stmtFindTag->fetchColumn();

        if (!$tagId) {
            try {
                $stmtInsertTag->execute([$tagName, $slugObj]);
                $tagId = $pdo->lastInsertId();
            } catch (Exception $e) { $tagId = null; }
        }

        if ($tagId) {
            $stmtInsertLink->execute([$article_id, $tagId]);
        }
    }

    // Backup sul campo storico 'tags' per sicurezza/legacy
    $cacheString = implode(', ', $cleanNames);
    $stmtUpdateLegacy = $pdo->prepare("UPDATE articles SET tags = ? WHERE id = ?");
    $stmtUpdateLegacy->execute([$cacheString, $article_id]);
}

try {
    if ($method === 'GET') {
        // Parametri query avanzati (v1.8.5)
        $category = $_GET['category'] ?? null;
        $tag      = $_GET['tag'] ?? null;
        $startDate = $_GET['start_date'] ?? null;
        $endDate   = $_GET['end_date'] ?? null;
        $q         = $_GET['q'] ?? null;
        
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $offset = ($page - 1) * $limit;
        
        // Modalità GET per singolo articolo (!is_admin = solo pubblicato)
        if (isset($_GET['slug'])) {
            $stmt = $pdo->prepare("SELECT a.*, (SELECT GROUP_CONCAT(t2.name SEPARATOR ', ') FROM article_tags at2 JOIN tags t2 ON at2.tag_id = t2.id WHERE at2.article_id = a.id) as dyn_tags FROM articles a WHERE a.slug = ?");
            $stmt->execute([$_GET['slug']]);
            $article = $stmt->fetch();
            if ($article && $article['dyn_tags']) $article['tags'] = $article['dyn_tags'];
            
            if ($article) {
                $is_admin = isset($_SESSION['user_id']);
                $is_published = $article['status'] === 'published' && (empty($article['published_at']) || strtotime($article['published_at']) <= $ita_now_time);
                if (!$is_admin && !$is_published) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Articolo non trovato']);
                    exit;
                }
                echo json_encode($article);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Articolo non trovato']);
            }
            exit;
        }

        if (isset($_GET['id'])) {
            Auth::check();
            $stmt = $pdo->prepare("SELECT a.*, (SELECT GROUP_CONCAT(t2.name SEPARATOR ', ') FROM article_tags at2 JOIN tags t2 ON at2.tag_id = t2.id WHERE at2.article_id = a.id) as dyn_tags FROM articles a WHERE a.id = ?");
            $stmt->execute([$_GET['id']]);
            $article = $stmt->fetch();
            if ($article && $article['dyn_tags']) $article['tags'] = $article['dyn_tags'];
            if ($article) echo json_encode($article);
            else { http_response_code(404); echo json_encode(['error' => 'Articolo non trovato']); }
            exit;
        }

        // [MODIFICA v1.8.5] Supporto Ricerca Avanzata
        $query = "SELECT a.id, a.title, a.slug, a.content, a.excerpt, a.cover_image, a.category, 
                  (SELECT GROUP_CONCAT(t2.name SEPARATOR ', ') FROM article_tags at2 JOIN tags t2 ON at2.tag_id = t2.id WHERE at2.article_id = a.id) as tags, 
                  a.is_featured, a.status, a.published_at, a.created_at 
                  FROM articles a";
        
        $params = [];
        $conditions = [];
        $is_admin_dashboard = isset($_SESSION['user_id']) && isset($_GET['admin']) && $_GET['admin'] === 'true';

        if (!$is_admin_dashboard) {
           $conditions[] = "a.status = 'published'"; 
           $conditions[] = "(a.published_at IS NULL OR a.published_at <= ?)";
           $params[] = $ita_now_str;
        }

        if ($category) {
            // [v1.10.2] Supporto gerarchico: se la categoria ha sottocategorie, le includiamo nella ricerca
            $catStmt = $pdo->prepare("SELECT id FROM categories WHERE slug = ? LIMIT 1");
            $catStmt->execute([$category]);
            $parent_cat_id = $catStmt->fetchColumn();
            
            if ($parent_cat_id) {
                $subCatStmt = $pdo->prepare("SELECT slug FROM categories WHERE parent_id = ?");
                $subCatStmt->execute([$parent_cat_id]);
                $subSlugs = $subCatStmt->fetchAll(PDO::FETCH_COLUMN);
                
                if (!empty($subSlugs)) {
                    $allSlugs = array_merge([$category], $subSlugs);
                    $placeholders = implode(',', array_fill(0, count($allSlugs), '?'));
                    $conditions[] = "a.category IN ($placeholders)";
                    foreach ($allSlugs as $s) $params[] = $s;
                } else {
                    $conditions[] = "a.category = ?";
                    $params[] = $category;
                }
            } else {
                $conditions[] = "a.category = ?";
                $params[] = $category;
            }
        }

        if ($tag) {
            $conditions[] = "a.id IN (SELECT article_id FROM article_tags at_f JOIN tags t_f ON at_f.tag_id = t_f.id WHERE t_f.name = ?)";
            $params[] = $tag;
        }

        if ($startDate) {
            $conditions[] = "a.published_at >= ?";
            $params[] = $startDate . ' 00:00:00';
        }

        if ($endDate) {
            $conditions[] = "a.published_at <= ?";
            $params[] = $endDate . ' 23:59:59';
        }

        if ($q) {
            $q = mb_substr($q, 0, 100); // cap: evita query lentissime su stringhe arbitrariamente lunghe
            $conditions[] = "(a.title LIKE ? OR a.content LIKE ? OR a.excerpt LIKE ?)";
            $params[] = "%$q%";
            $params[] = "%$q%";
            $params[] = "%$q%";
        }

        $whereClause = "";
        if (count($conditions) > 0) {
            $whereClause = " WHERE " . implode(" AND ", $conditions);
            $query .= $whereClause;
        }

        // Paginazione Backend-Driven [P3-01]: Calcoliamo il totale assoluto degli articoli filtrati
        $countQuery = "SELECT COUNT(*) FROM articles a" . $whereClause;
        $countStmt = $pdo->prepare($countQuery);
        foreach ($params as $k => $v) {
            $countStmt->bindValue($k+1, $v);
        }
        $countStmt->execute();
        $total = (int)$countStmt->fetchColumn();

        // Ordinamento per data di pubblicazione effettiva.
        // Gli articoli 'in vetrina' vengono portati in cima per coerenza con il frontend.
        // Raggruppiamo esplicitamente per a.id per evitare bug con GROUP_CONCAT.
        $query .= " GROUP BY a.id ORDER BY a.is_featured DESC, CASE WHEN a.published_at IS NOT NULL THEN a.published_at ELSE a.created_at END DESC LIMIT ? OFFSET ?";
        
        $stmt = $pdo->prepare($query);
        
        // Pdo execute con LIMIT params necessita dei tipi espliciti
        foreach ($params as $k => $v) {
            $stmt->bindValue($k+1, $v);
        }
        $stmt->bindValue(count($params)+1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(count($params)+2, $offset, PDO::PARAM_INT);
        
        $stmt->execute();
        $articles = $stmt->fetchAll();
        
        echo json_encode([
            'data' => $articles,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ]);
    } 
    elseif ($method === 'POST') {
        Auth::check();
        
        $json_input = file_get_contents('php://input');
        $data = json_decode($json_input, true);
        
        if ($data === null && !empty($json_input)) {
            http_response_code(400);
            echo json_encode(['error' => 'Dati JSON malformati o troppo grandi per il server. Verifica i limiti di upload del PHP.']);
            exit;
        }

        $title = $data['title'] ?? 'Nuovo Articolo';
        $slug = $data['slug'] ?? generateSlug($title, $pdo);
        $content = $data['content'] ?? '';
        $excerpt = $data['excerpt'] ?? '';
        $cover_image = $data['cover_image'] ?? '';
        $category = $data['category'] ?? 'blog-e-riflessioni';
        $tags = $data['tags'] ?? ''; // Raccogllie array o CSV
        $is_featured = isset($data['is_featured']) ? (int)$data['is_featured'] : 0;
        $button_a_label = substr(trim($data['button_a_label'] ?? ''), 0, 100);
        $button_a_link  = sanitizeUrl($data['button_a_link'] ?? '');
        $button_b_label = substr(trim($data['button_b_label'] ?? ''), 0, 100);
        $button_b_link  = sanitizeUrl($data['button_b_link'] ?? '');
        $status = in_array($data['status'] ?? '', ['draft', 'published']) ? $data['status'] : 'draft';
        $published_at_raw = $data['published_at'] ?? '';
        $published_at = (DateTime::createFromFormat('Y-m-d H:i:s', $published_at_raw) !== false)
            ? $published_at_raw
            : date('Y-m-d H:i:s');

        $stmt = $pdo->prepare("INSERT INTO articles (title, slug, content, excerpt, cover_image, category, tags, is_featured, button_a_label, button_a_link, button_b_label, button_b_link, status, published_at) VALUES (?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title, $slug, $content, $excerpt, $cover_image, $category, $is_featured, $button_a_label, $button_a_link, $button_b_label, $button_b_link, $status, $published_at]);
        
        $new_id = $pdo->lastInsertId();
        syncArticleTags($pdo, $new_id, $tags);

        echo json_encode(['status' => 'success', 'id' => $new_id, 'slug' => $slug]);
    }
    elseif ($method === 'PUT') {
        Auth::check();
        
        $json_input = file_get_contents('php://input');
        $data = json_decode($json_input, true);
        
        if ($data === null && !empty($json_input)) {
            http_response_code(400);
            echo json_encode(['error' => 'Dati JSON malformati o troppo grandi per il server (es. immagini Base64 troppo pesanti).']);
            exit;
        }

        $id = $_GET['id'] ?? ($data['id'] ?? null);
        
        if (!$id) {
            http_response_code(400); echo json_encode(['error' => 'ID mancante']); exit;
        }

        $title = $data['title'] ?? 'Senza Titolo';
        $slug = $data['slug'] ?? ($data['title'] ? generateSlug($data['title'], $pdo) : null);
        $content = $data['content'] ?? '';
        $excerpt = $data['excerpt'] ?? '';
        $cover_image = $data['cover_image'] ?? '';
        $category = $data['category'] ?? 'blog-e-riflessioni';
        $tags = $data['tags'] ?? ''; // Puo essere string o array
        $is_featured = isset($data['is_featured']) ? (int)$data['is_featured'] : 0;
        $button_a_label = substr(trim($data['button_a_label'] ?? ''), 0, 100);
        $button_a_link  = sanitizeUrl($data['button_a_link'] ?? '');
        $button_b_label = substr(trim($data['button_b_label'] ?? ''), 0, 100);
        $button_b_link  = sanitizeUrl($data['button_b_link'] ?? '');
        $status = in_array($data['status'] ?? '', ['draft', 'published']) ? $data['status'] : 'draft';
        $published_at_raw = $data['published_at'] ?? '';
        $published_at = (DateTime::createFromFormat('Y-m-d H:i:s', $published_at_raw) !== false)
            ? $published_at_raw
            : date('Y-m-d H:i:s');

        $stmt = $pdo->prepare("UPDATE articles SET title=?, slug=?, content=?, excerpt=?, cover_image=?, category=?, is_featured=?, button_a_label=?, button_a_link=?, button_b_label=?, button_b_link=?, status=?, published_at=? WHERE id=?");
        $stmt->execute([$title, $slug, $content, $excerpt, $cover_image, $category, $is_featured, $button_a_label, $button_a_link, $button_b_label, $button_b_link, $status, $published_at, $id]);
        
        syncArticleTags($pdo, $id, $tags);

        echo json_encode(['status' => 'success']);
    }
    elseif ($method === 'DELETE') {
        Auth::check();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? ($data['id'] ?? null);
        if (!$id) {
            http_response_code(400); echo json_encode(['error' => 'ID mancante']); exit;
        }
        $stmt = $pdo->prepare("DELETE FROM articles WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success']);
    }
    elseif ($method === 'PATCH') {
        Auth::check();
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        $is_featured = isset($data['is_featured']) ? (int)$data['is_featured'] : 0;
        
        if (!$id) {
            http_response_code(400); echo json_encode(['error' => 'ID mancante']); exit;
        }

        $stmt = $pdo->prepare("UPDATE articles SET is_featured=? WHERE id=?");
        $stmt->execute([$is_featured, $id]);
        
        echo json_encode(['status' => 'success']);
    }

} catch (PDOException $e) {
    error_log('articles.php PDOException: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Errore interno del server.']);
}
?>

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

// Helper per generare slug unici
function generateSlug($title, $pdo) {
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

try {
    if ($method === 'GET') {
        // Parametri query (es. ?category=blog&limit=10)
        $category = $_GET['category'] ?? null;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $offset = ($page - 1) * $limit;
        
        // Modalità GET per singolo articolo (!is_admin = solo pubblicato)
        if (isset($_GET['slug'])) {
            $stmt = $pdo->prepare("SELECT * FROM articles WHERE slug = ?");
            $stmt->execute([$_GET['slug']]);
            $article = $stmt->fetch();
            
            if ($article) {
                // Controllo Autorizzazione Visiva
                $is_admin = isset($_SESSION['user_id']);
                
                // Un articolo si definisce "pubblico" se il suo status è 'published' E la data di uscita è nel passato/presente.
                $is_published = $article['status'] === 'published' && 
                                (empty($article['published_at']) || strtotime($article['published_at']) <= $ita_now_time);
                
                // Se NON è admin e l'articolo NON è pubblico (bozza o programmato futuro), negare fingendo il 404.
                if (!$is_admin && !$is_published) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Articolo non trovato (Bozza/Privato)']);
                    exit;
                }
                
                // Altrimenti, consegna l'articolo per la lettura
                echo json_encode($article);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Articolo non trovato']);
            }
            exit;
        }

        // Modalità GET per singolo articolo via ID (usato da React Editor - solo admin)
        if (isset($_GET['id'])) {
            Auth::check();
            $stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $article = $stmt->fetch();
            if ($article) {
                echo json_encode($article);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Articolo non trovato']);
            }
            exit;
        }

        // Filtro Categoria
        $query = "SELECT id, title, slug, content, excerpt, cover_image, category, tags, is_featured, status, published_at FROM articles";
        $params = [];
        
        $conditions = [];
        $is_admin_dashboard = isset($_SESSION['user_id']) && isset($_GET['admin']) && $_GET['admin'] === 'true';

        // Se la chiamata non proviene espressamente dalla dashboard admin, nascondiamo bozze e futuri.
        if (!$is_admin_dashboard) {
           $conditions[] = "status = 'published'"; 
           $conditions[] = "(published_at IS NULL OR published_at = '' OR published_at <= ?)";
           $params[] = $ita_now_str;
        }

        if ($category) {
            $conditions[] = "category = ?";
            $params[] = $category;
        }
        
        if (count($conditions) > 0) {
            $query .= " WHERE " . implode(" AND ", $conditions);
        }

        // [V1.5.7] Ordinamento per data di pubblicazione effettiva.
        // Gli articoli programmati appaiono in cima al feed nel momento in cui si sbloccano,
        // non sepolti nella posizione della data di creazione.
        // Fallback a created_at per articoli senza published_at (legacy o bozze promosse).
        $query .= " ORDER BY CASE WHEN published_at IS NOT NULL AND published_at != '' THEN published_at ELSE created_at END DESC LIMIT ? OFFSET ?";
        
        $stmt = $pdo->prepare($query);
        
        // Pdo execute con LIMIT params necessita dei tipi espliciti
        foreach ($params as $k => $v) {
            $stmt->bindValue($k+1, $v);
        }
        $stmt->bindValue(count($params)+1, $limit, PDO::PARAM_INT);
        $stmt->bindValue(count($params)+2, $offset, PDO::PARAM_INT);
        
        $stmt->execute();
        $articles = $stmt->fetchAll();
        
        echo json_encode($articles);
    } 
    elseif ($method === 'POST') {
        Auth::check();
        
        $data = json_decode(file_get_contents('php://input'), true);
        
        $title = $data['title'] ?? 'Nuovo Articolo';
        $slug = $data['slug'] ?? generateSlug($title, $pdo);
        $content = $data['content'] ?? '';
        $excerpt = $data['excerpt'] ?? '';
        $cover_image = $data['cover_image'] ?? '';
        $category = $data['category'] ?? 'blog-e-riflessioni';
        $tags = $data['tags'] ?? '';
        $is_featured = isset($data['is_featured']) ? (int)$data['is_featured'] : 0;
        $button_a_label = $data['button_a_label'] ?? '';
        $button_a_link = $data['button_a_link'] ?? '';
        $button_b_label = $data['button_b_label'] ?? '';
        $button_b_link = $data['button_b_link'] ?? '';
        $status = $data['status'] ?? 'draft';
        $published_at = $data['published_at'] ?? date('Y-m-d H:i:s');

        $stmt = $pdo->prepare("INSERT INTO articles (title, slug, content, excerpt, cover_image, category, tags, is_featured, button_a_label, button_a_link, button_b_label, button_b_link, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$title, $slug, $content, $excerpt, $cover_image, $category, $tags, $is_featured, $button_a_label, $button_a_link, $button_b_label, $button_b_link, $status, $published_at]);
        
        echo json_encode(['status' => 'success', 'id' => $pdo->lastInsertId(), 'slug' => $slug]);
    }
    elseif ($method === 'PUT') {
        Auth::check();
        
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? ($data['id'] ?? null);
        
        if (!$id) {
            http_response_code(400); echo json_encode(['error' => 'ID mancante']); exit;
        }

        $title = $data['title'] ?? 'Senza Titolo';
        $slug = $data['slug'] ?? generateSlug($title, $pdo);
        $content = $data['content'] ?? '';
        $excerpt = $data['excerpt'] ?? '';
        $cover_image = $data['cover_image'] ?? '';
        $category = $data['category'] ?? 'blog-e-riflessioni';
        $tags = $data['tags'] ?? '';
        $is_featured = isset($data['is_featured']) ? (int)$data['is_featured'] : 0;
        $button_a_label = $data['button_a_label'] ?? '';
        $button_a_link = $data['button_a_link'] ?? '';
        $button_b_label = $data['button_b_label'] ?? '';
        $button_b_link = $data['button_b_link'] ?? '';
        $status = $data['status'] ?? 'draft';
        $published_at = $data['published_at'] ?? date('Y-m-d H:i:s');

        $stmt = $pdo->prepare("UPDATE articles SET title=?, slug=?, content=?, excerpt=?, cover_image=?, category=?, tags=?, is_featured=?, button_a_label=?, button_a_link=?, button_b_label=?, button_b_link=?, status=?, published_at=? WHERE id=?");
        $stmt->execute([$title, $slug, $content, $excerpt, $cover_image, $category, $tags, $is_featured, $button_a_label, $button_a_link, $button_b_label, $button_b_link, $status, $published_at, $id]);
        
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
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

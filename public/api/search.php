<?php
require_once 'db.php';
require_once 'auth_helper.php';

header('Content-Type: application/json');

$pdo = Database::connect();
$q = $_GET['q'] ?? '';

if (strlen($q) < 2) {
    echo json_encode([]);
    exit;
}

try {
    $results = [];
    $is_admin = isset($_SESSION['user_id']);
    $searchTerm = "%$q%";

    // 1. Cerca negli Articoli
    $articleQuery = "
        SELECT 
            a.id, 
            a.title, 
            a.slug, 
            a.excerpt as description, 
            a.category, 
            a.cover_image,
            a.published_at as date,
            'article' as type
        FROM articles a
        WHERE (a.title LIKE ? OR a.content LIKE ? OR a.excerpt LIKE ? OR a.tags LIKE ?)
    ";
    
    $params = [$searchTerm, $searchTerm, $searchTerm, $searchTerm];

    if (!$is_admin) {
        $articleQuery .= " AND a.status = 'published' AND (a.published_at IS NULL OR a.published_at <= ?)";
        $params[] = date('Y-m-d H:i:s');
    }

    $stmt = $pdo->prepare($articleQuery);
    $stmt->execute($params);
    $articles = $stmt->fetchAll();

    // 2. Cerca nei Progetti
    $projectQuery = "
        SELECT 
            p.id, 
            p.name as title, 
            '' as slug, 
            p.description, 
            p.category, 
            p.cover_image,
            p.created_at as date,
            'project' as type,
            p.button_a_url as url
        FROM projects p
        WHERE (p.name LIKE ? OR p.description LIKE ?)
    ";
    
    $pParams = [$searchTerm, $searchTerm];

    if (!$is_admin) {
        $projectQuery .= " AND p.is_visible = 1";
    }

    $pStmt = $pdo->prepare($projectQuery);
    $pStmt->execute($pParams);
    $projects = $pStmt->fetchAll();

    // Unifica e ordina per rilevanza (titolo esatto prima, etc - qui facciamo un sort semplice per ora)
    $results = array_merge($articles, $projects);
    
    // Sort per data decrescente
    usort($results, function($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });

    echo json_encode($results);

} catch (PDOException $e) {
    http_response_code(500);
    error_log(basename(__FILE__, '.php') . ' error: ' . $e->getMessage());
    echo json_encode(['error' => 'Errore interno del server.']);
}

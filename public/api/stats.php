<?php
require_once 'db.php';
require_once 'auth_helper.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');

$pdo = Database::connect();

try {
    // Solo per la dashboard admin
    Auth::check();

    // Stats Articoli
    $stmt_articles = $pdo->query("SELECT COUNT(*) FROM articles");
    $articles_count = $stmt_articles->fetchColumn();

    // Stats Articoli Pubblicati
    $stmt_pub = $pdo->query("SELECT COUNT(*) FROM articles WHERE status = 'published'");
    $published_count = $stmt_pub->fetchColumn();

    // Stats Media
    $stmt_media = $pdo->query("SELECT COUNT(*) FROM media");
    $media_count = $stmt_media->fetchColumn();

    // TODO: Aggiungere logica Iscritti Newsletter quando implementata, per ora usiamo 0
    // $stmt_sub = $pdo->query("SELECT COUNT(*) FROM subscribers");
    $subs_count = 0; 

    echo json_encode([
        'total_articles' => (int)$articles_count,
        'published_articles' => (int)$published_count,
        'total_media' => (int)$media_count,
        'total_subscribers' => (int)$subs_count,
        'system_status' => 'Online'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

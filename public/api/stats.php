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

    // [v1.7.4] Newsletter attiva — conta solo gli iscritti confermati
    $subs_count = 0;
    try {
        $subs_count = (int)$pdo->query("SELECT COUNT(*) FROM subscribers WHERE status='confirmed'")->fetchColumn();
    } catch (PDOException $_) { /* tabella non ancora migrata */ }

    // Stats Analytics (v1.6.5) — fallback a 0 se le tabelle non esistono ancora
    $total_views  = 0;
    $total_clicks = 0;
    try {
        $total_views  = (int)$pdo->query("SELECT COUNT(*) FROM article_views")->fetchColumn();
        $total_clicks = (int)$pdo->query("SELECT COUNT(*) FROM cta_clicks")->fetchColumn();
    } catch (PDOException $_) { /* tabelle non ancora migrate */ }

    echo json_encode([
        'total_articles'     => (int)$articles_count,
        'published_articles' => (int)$published_count,
        'total_media'        => (int)$media_count,
        'total_subscribers'  => (int)$subs_count,
        'total_views'        => $total_views,
        'total_clicks'       => $total_clicks,
        'system_status'      => 'Online'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

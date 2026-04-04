<?php
require_once 'db.php';

header('Content-Type: application/rss+xml; charset=utf-8');

$pdo = Database::connect();

$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$base_url = $protocol . '://' . $host;

// [V1.5.5] Forzatura Fuso Orario Italiano (Bypass orario server Los Angeles per pubblicazione tempestiva)
date_default_timezone_set('Europe/Rome');
$ita_now_str = date('Y-m-d H:i:s');

// [v1.5.10] Limite articoli nel feed RSS — valore nominato per facile manutenzione futura
define('RSS_FEED_LIMIT', 50);

// Assumiamo che il nome del feed venga dai settings, per ora hardcodiamo un title di base
$site_title = "Simone Pizzi - Blog & Portfolio";
$site_description = "Le ultime pubblicazioni di Simone Pizzi";

echo '<?xml version="1.0" encoding="UTF-8" ?>' . "\n";
echo '<rss version="2.0">' . "\n";
echo '<channel>' . "\n";
echo '  <title>' . htmlspecialchars($site_title) . '</title>' . "\n";
echo '  <link>' . htmlspecialchars($base_url) . '</link>' . "\n";
echo '  <description>' . htmlspecialchars($site_description) . '</description>' . "\n";
echo '  <language>it-IT</language>' . "\n";

try {
    $query = "SELECT title, slug, excerpt, content, cover_image, category, published_at 
              FROM articles 
              WHERE status = 'published' AND (published_at IS NULL OR published_at <= :ita_now)
              ORDER BY published_at DESC 
              LIMIT " . RSS_FEED_LIMIT;
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([':ita_now' => $ita_now_str]);
    $articles = $stmt->fetchAll();

    foreach ($articles as $article) {
        // Formatta la data secondo rfc822
        $pubDate = date(DATE_RSS, strtotime($article['published_at'] ?? 'now'));
        
        $item_url = $base_url . '/' . rawurlencode($article['category']) . '/' . rawurlencode($article['slug']);
        
        echo '  <item>' . "\n";
        echo '    <title>' . htmlspecialchars($article['title']) . '</title>' . "\n";
        echo '    <link>' . htmlspecialchars($item_url) . '</link>' . "\n";
        echo '    <description>' . htmlspecialchars($article['excerpt']) . '</description>' . "\n";
        
        if (!empty($article['cover_image'])) {
            $image_url = (str_starts_with($article['cover_image'], 'http')) ? $article['cover_image'] : $base_url . '/' . ltrim($article['cover_image'], '/');
            echo '    <enclosure url="' . htmlspecialchars($image_url) . '" type="image/jpeg" />' . "\n";
        }
        
        echo '    <pubDate>' . $pubDate . '</pubDate>' . "\n";
        echo '    <guid>' . htmlspecialchars($item_url) . '</guid>' . "\n";
        echo '  </item>' . "\n";
    }
} catch (Exception $e) {
    // Ignoriamo silenti in caso di errore DB nell'RSS
}

echo '</channel>' . "\n";
echo '</rss>';

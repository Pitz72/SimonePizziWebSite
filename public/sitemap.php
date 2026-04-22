<?php
/**
 * GENERATORE DINAMICO SITEMAP XML v1.0.0
 * Recupera categorie e articoli dal database MySQL per garantire SEO sempre aggiornata.
 */
require_once 'api/db.php';

// Imposta l'header come XML
header("Content-type: text/xml; charset=utf-8");

$pdo = Database::connect();
$baseUrl = "https://simonepizzi.runtimeradio.it";

echo '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;

// 1. HOME PAGE
echo "  <url>" . PHP_EOL;
echo "    <loc>$baseUrl/</loc>" . PHP_EOL;
echo "    <changefreq>daily</changefreq>" . PHP_EOL;
echo "    <priority>1.0</priority>" . PHP_EOL;
echo "  </url>" . PHP_EOL;

// 2. PAGINE STATICHE PRINCIPALI
$staticPages = [
    ['url' => '/tutti-i-progetti', 'freq' => 'weekly', 'prio' => '0.8'],
    ['url' => '/contatti', 'freq' => 'monthly', 'prio' => '0.5']
];

foreach ($staticPages as $page) {
    echo "  <url>" . PHP_EOL;
    echo "    <loc>$baseUrl{$page['url']}</loc>" . PHP_EOL;
    echo "    <changefreq>{$page['freq']}</changefreq>" . PHP_EOL;
    echo "    <priority>{$page['prio']}</priority>" . PHP_EOL;
    echo "  </url>" . PHP_EOL;
}

// 3. CATEGORIE DINAMICHE
$stmtCat = $pdo->query("SELECT slug FROM categories ORDER BY sort_order ASC");
while ($cat = $stmtCat->fetch()) {
    echo "  <url>" . PHP_EOL;
    echo "    <loc>$baseUrl/{$cat['slug']}</loc>" . PHP_EOL;
    echo "    <changefreq>weekly</changefreq>" . PHP_EOL;
    echo "    <priority>0.8</priority>" . PHP_EOL;
    echo "  </url>" . PHP_EOL;
}

// 4. ARTICOLI PUBBLICATI
// Recuperiamo solo articoli pubblicati, ordinati per data decrescente
$stmtArt = $pdo->query("
    SELECT slug, category, published_at, updated_at 
    FROM articles 
    WHERE status = 'published' 
    ORDER BY published_at DESC
");

while ($art = $stmtArt->fetch()) {
    $lastMod = date('Y-m-d', strtotime($art['updated_at'] ?? $art['published_at'] ?? 'now'));
    echo "  <url>" . PHP_EOL;
    echo "    <loc>$baseUrl/{$art['category']}/{$art['slug']}</loc>" . PHP_EOL;
    echo "    <lastmod>$lastMod</lastmod>" . PHP_EOL;
    echo "    <changefreq>monthly</changefreq>" . PHP_EOL;
    echo "    <priority>0.7</priority>" . PHP_EOL;
    echo "  </url>" . PHP_EOL;
}

echo '</urlset>';
?>

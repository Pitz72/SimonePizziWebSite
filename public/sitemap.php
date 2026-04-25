<?php
/**
 * GENERATORE DINAMICO SITEMAP XML v2.0
 * 
 * Servito SEMPRE da .htaccess (nessun file fisico necessario).
 * Recupera categorie, sottocategorie e articoli dal database MySQL in tempo reale.
 * 
 * [v2.0] - baseUrl calcolato dinamicamente dal server
 *        - lastmod per categorie (basato sull'articolo più recente)
 *        - supporto sottocategorie
 *        - nessuna dipendenza dal prerendering
 */
require_once __DIR__ . '/api/db.php';

// Imposta l'header come XML solo se richiesto direttamente, non durante il prerendering
if (!defined('IS_PRERENDERING')) {
    header("Content-type: text/xml; charset=utf-8");
}

$pdo = Database::connect();

// Base URL calcolato dinamicamente
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$baseUrl  = $protocol . $_SERVER['HTTP_HOST'];

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

// 3. CATEGORIE DINAMICHE (con lastmod basato sull'articolo più recente)
$stmtCat = $pdo->query(
    "SELECT c.slug, 
            (SELECT MAX(COALESCE(a.published_at, a.created_at)) 
             FROM articles a 
             WHERE a.category = c.slug AND a.status = 'published') as latest_article
     FROM categories c 
     WHERE c.parent_id IS NULL
     ORDER BY c.sort_order ASC"
);

while ($cat = $stmtCat->fetch()) {
    echo "  <url>" . PHP_EOL;
    echo "    <loc>$baseUrl/{$cat['slug']}</loc>" . PHP_EOL;
    if ($cat['latest_article']) {
        echo "    <lastmod>" . date('Y-m-d', strtotime($cat['latest_article'])) . "</lastmod>" . PHP_EOL;
    }
    echo "    <changefreq>weekly</changefreq>" . PHP_EOL;
    echo "    <priority>0.8</priority>" . PHP_EOL;
    echo "  </url>" . PHP_EOL;
}

// 4. SOTTOCATEGORIE (se esistono)
$stmtSubCat = $pdo->query(
    "SELECT c.slug, p.slug as parent_slug,
            (SELECT MAX(COALESCE(a.published_at, a.created_at)) 
             FROM articles a 
             WHERE a.category = c.slug AND a.status = 'published') as latest_article
     FROM categories c 
     JOIN categories p ON c.parent_id = p.id
     ORDER BY c.sort_order ASC"
);

while ($sub = $stmtSubCat->fetch()) {
    echo "  <url>" . PHP_EOL;
    echo "    <loc>$baseUrl/{$sub['slug']}</loc>" . PHP_EOL;
    if ($sub['latest_article']) {
        echo "    <lastmod>" . date('Y-m-d', strtotime($sub['latest_article'])) . "</lastmod>" . PHP_EOL;
    }
    echo "    <changefreq>weekly</changefreq>" . PHP_EOL;
    echo "    <priority>0.7</priority>" . PHP_EOL;
    echo "  </url>" . PHP_EOL;
}

// 5. ARTICOLI PUBBLICATI
$now = date('Y-m-d H:i:s');
$stmtArt = $pdo->prepare("
    SELECT slug, category, published_at, updated_at 
    FROM articles 
    WHERE status = 'published' AND (published_at IS NULL OR published_at <= ?)
    ORDER BY published_at DESC
");
$stmtArt->execute([$now]);

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

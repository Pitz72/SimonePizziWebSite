<?php
/**
 * GENERATORE DINAMICO ROBOTS.TXT v1.0.0
 * Fornisce le direttive ai motori di ricerca e punta alla sitemap dinamica.
 */
header("Content-Type: text/plain; charset=utf-8");

$baseUrl = "https://simonepizzi.runtimeradio.it";

echo "User-agent: *" . PHP_EOL;
echo "Allow: /" . PHP_EOL;
echo "Disallow: /admin/" . PHP_EOL; // Protezione area admin
echo "Disallow: /api/.data/" . PHP_EOL; // Protezione dati sensibili legacy

echo PHP_EOL;
echo "Sitemap: $baseUrl/sitemap.xml" . PHP_EOL;
?>

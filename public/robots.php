<?php
/**
 * GENERATORE DINAMICO ROBOTS.TXT v2.0
 * 
 * Servito SEMPRE da .htaccess (nessun file fisico necessario).
 * Fornisce le direttive ai motori di ricerca e punta alla sitemap dinamica.
 * 
 * [v2.0] - baseUrl calcolato dinamicamente dal server (non più hardcoded)
 */

// Invia header solo se richiesto direttamente, non durante il prerendering
if (!defined('IS_PRERENDERING')) {
    header("Content-Type: text/plain; charset=utf-8");
}

// Base URL calcolato dinamicamente
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$baseUrl  = $protocol . $_SERVER['HTTP_HOST'];

echo "User-agent: *" . PHP_EOL;
echo "Allow: /" . PHP_EOL;
echo "Disallow: /admin/" . PHP_EOL;        // Protezione area admin
echo "Disallow: /api/.data/" . PHP_EOL;    // Protezione dati sensibili legacy
echo "Disallow: /api/" . PHP_EOL;          // Protezione endpoint API

echo PHP_EOL;
echo "Sitemap: $baseUrl/sitemap.xml" . PHP_EOL;
?>

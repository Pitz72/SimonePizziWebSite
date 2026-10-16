<?php
/**
 * robots.txt, generato: /robots.txt (la riscrittura sta nell'.htaccess).
 *
 * Attenzione, e vale dal 2026: a /robots.txt risponde un file gestito da
 * DreamHost prima ancora di Apache, quindi questo in produzione di solito non
 * esce (vedi la memoria project_seo_robots e la revisione del 16 ottobre). Si
 * tiene corretto lo stesso: risponde a /robots.TXT, risponde in sviluppo, e il
 * giorno che l'hosting smette di intercettarlo è già giusto.
 *
 * Dal 16 ottobre 2026 l'indirizzo della sitemap viene da SITO_URL e non
 * dall'header Host, che chiunque può falsificare (revisione del 16 ottobre, M11).
 */

declare(strict_types=1);

require __DIR__ . '/lib/avvio.php';

header('Content-Type: text/plain; charset=utf-8');

echo "User-agent: *\n";
echo "Allow: /\n";
echo "Disallow: /admin/\n";
echo "Disallow: /api/\n";
echo "\n";
echo 'Sitemap: ' . SITO_URL . "/sitemap.xml\n";

<?php
/**
 * Il router del server di sviluppo.
 *
 *   php -S localhost:8000 -t public public/dev-router.php
 *
 * `php -S` non legge .htaccess: senza questo file ogni indirizzo che non è un
 * file vero darebbe 404. Qui si fa quello che in produzione fa mod_rewrite —
 * i file esistenti si servono così come sono, tutto il resto va al front
 * controller — più le due riscritture di sitemap e robots.
 *
 * Non finisce in produzione: è uno strumento da banco.
 */

$percorso = (string)parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file     = __DIR__ . $percorso;

// sitemap.xml e robots.txt sono generati da PHP anche in produzione.
if ($percorso === '/sitemap.xml') { require __DIR__ . '/sitemap.php'; return true; }
if ($percorso === '/robots.txt')  { require __DIR__ . '/robots.php';  return true; }

/* Una cartella con dentro un index.php: in produzione lo serve Apache con
   DirectoryIndex, qui bisogna dirlo. È il caso di /admin/. */
if ($percorso !== '/' && is_dir($file) && is_file(rtrim($file, '/') . '/index.php')) {
    require rtrim($file, '/') . '/index.php';
    return true;
}

// Un file che esiste davvero (css, js, font, immagine, endpoint) si serve.
if ($percorso !== '/' && is_file($file)) {
    // I .php si eseguono, tutto il resto lo passa al server integrato.
    if (str_ends_with($file, '.php')) { require $file; return true; }
    return false;
}

require __DIR__ . '/index.php';

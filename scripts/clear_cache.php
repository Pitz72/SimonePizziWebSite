<?php
/**
 * CACHE FLUSH — Script One-Shot
 *
 * Cancella la cache PHP (OPcache + APCu) sul server DreamHost.
 *
 * ISTRUZIONI:
 *  1. Caricare questo file sul server via FTP in /public/api/clear_cache.php
 *  2. Aprire nel browser: https://simonepizzi.runtimeradio.it/api/clear_cache.php?token=SITO2026
 *  3. Verificare che tutti i risultati siano OK
 *  4. CANCELLARE SUBITO il file dal server via FTP
 *
 * NON lasciare questo file sul server dopo l'uso.
 */

// ── Protezione minima da esecuzioni accidentali ──
define('ACCESS_TOKEN', 'SITO2026');

if (($_GET['token'] ?? '') !== ACCESS_TOKEN) {
    http_response_code(403);
    die('Accesso negato. Aggiungere ?token=SITO2026 all\'URL.');
}

header('Content-Type: text/plain; charset=UTF-8');

$results = [];

// ── 1. PHP OPcache ──
if (function_exists('opcache_reset')) {
    $ok = opcache_reset();
    $results[] = '[OPcache]   ' . ($ok ? 'OK — cache svuotata.' : 'WARN — opcache_reset() ha restituito false.');
} else {
    $results[] = '[OPcache]   SKIP — OPcache non disponibile su questo server.';
}

// ── 2. APCu ──
if (function_exists('apcu_clear_cache')) {
    apcu_clear_cache();
    $results[] = '[APCu]      OK — cache svuotata.';
} else {
    $results[] = '[APCu]      SKIP — APCu non disponibile su questo server.';
}

// ── 3. Header Cache-Control (già gestito da index.php v2.1+) ──
$indexPhp = __DIR__ . '/../index.php';
if (file_exists($indexPhp)) {
    $src = file_get_contents($indexPhp);
    if (strpos($src, 'no-store') !== false) {
        $results[] = '[index.php] OK — header Cache-Control: no-store già presente.';
    } else {
        $results[] = '[index.php] WARN — header Cache-Control non trovato in index.php. Aggiornare alla versione v2.1+.';
    }
}

// ── Report ──
echo "=== CACHE FLUSH — " . date('Y-m-d H:i:s') . " ===\n\n";
foreach ($results as $line) {
    echo $line . "\n";
}
echo "\n=== COMPLETATO ===\n";
echo "\nRICORDA: cancella questo file dal server via FTP appena verificato il risultato.\n";
echo "Path sul server: /public/api/clear_cache.php\n";

<?php
/**
 * Che PHP risponde davvero alle pagine, e con quali impostazioni.
 *
 *     python scripts/server-tools/esegui.py controlla_php.php
 *
 * Da terminale non si vede: il `php` della shell di DreamHost è un altro
 * binario (8.2), e `php83.cgi -i` non legge il phprc come lo legge il web.
 * Solo una richiesta HTTP passa dalla stessa strada di un visitatore.
 *
 * Non scrive niente, quindi non ha bisogno di `--applica`. Nato il 22/10/2026
 * per PHP2Shell (CVE-2026-109618/109619): serve a vedere la versione e a
 * controllare che `session.upload_progress.enabled` resti a 0.
 */
header('Content-Type: text/plain; charset=utf-8');

if (!hash_equals('__TOKEN__', (string)($_GET['token'] ?? ''))) {
    http_response_code(403);
    exit("Token mancante o sbagliato.\n");
}

echo 'PHP ' . PHP_VERSION . ' (' . PHP_SAPI . ")\n";
echo 'php.ini caricato: ' . (php_ini_loaded_file() ?: 'nessuno') . "\n";
echo 'ini aggiuntivi:   ' . trim((string)php_ini_scanned_files()) . "\n\n";

$voci = [
    'session.upload_progress.enabled',
    'memory_limit',
    'post_max_size',
    'upload_max_filesize',
    'file_uploads',
    'max_execution_time',
    'max_input_time',
    'display_errors',
    'expose_php',
];
foreach ($voci as $voce) {
    $valore = ini_get($voce);
    echo str_pad($voce, 34) . ($valore === false ? '(non esiste)' : var_export($valore, true)) . "\n";
}

echo "\nESITO: OK\n";

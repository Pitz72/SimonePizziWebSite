<?php
/** Il download di una copia del database. Solo dal pannello, e solo per i nomi che il sito scrive. */
require __DIR__ . '/_avvio.php';
require_once __DIR__ . '/../lib/manutenzione.php';
richiedi_accesso();

$file = backup_percorso((string)($_GET['f'] ?? ''));
if ($file === null) {
    http_response_code(404);
    exit('Copia non trovata.');
}
header('Content-Type: application/gzip');
header('Content-Disposition: attachment; filename="' . basename($file) . '"');
header('Content-Length: ' . filesize($file));
readfile($file);
exit;

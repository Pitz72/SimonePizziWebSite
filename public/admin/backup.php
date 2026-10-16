<?php
/**
 * Lo scaricamento di una copia: un dump del database o l'archivio delle
 * immagini. Solo dal pannello, e solo per i nomi che il sito scrive
 * (backup_percorso() in lib/manutenzione.php): nessun altro file esce da qui.
 */
require __DIR__ . '/_avvio.php';
require_once __DIR__ . '/../lib/manutenzione.php';
richiedi_accesso();

$file = backup_percorso((string)($_GET['f'] ?? ''));
if ($file === null) {
    http_response_code(404);
    exit('Copia non trovata.');
}
while (ob_get_level()) ob_end_clean();
header('Content-Type: ' . (str_ends_with($file, '.zip') ? 'application/zip' : 'application/gzip'));
header('Content-Disposition: attachment; filename="' . basename($file) . '"');
header('Content-Length: ' . filesize($file));
readfile($file);
exit;

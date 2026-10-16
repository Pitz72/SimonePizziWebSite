<?php
/**
 * Lo scaricamento di un file della libreria con il suo nome originale:
 * GET /api/download.php?id=123
 *
 * Lo usano i pulsanti degli articoli che portano a un file. Non chiede
 * l'accesso: i file sono pubblici, distribuiti ai lettori. La sola fonte di
 * verità è il database, e il percorso deve stare dentro uploads/: nessun
 * modo di uscire dalla cartella.
 *
 * Dal 16 ottobre 2026 passa dalle librerie del sito (lib/), come il resto: la
 * logica è quella della v1.6.1, invariata.
 */

declare(strict_types=1);

require __DIR__ . '/../lib/avvio.php';

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    http_response_code(400);
    exit('Parametro id mancante o non valido.');
}

$q = db()->prepare("SELECT filename, file_path, mime_type FROM media WHERE id = ? LIMIT 1");
$q->execute([$id]);
$file = $q->fetch();
if (!$file) {
    http_response_code(404);
    exit('File non trovato.');
}

$percorso = (string)$file['file_path'];
$fisico = str_starts_with($percorso, '/uploads/') ? realpath(__DIR__ . '/..' . $percorso) : false;
$base   = realpath(__DIR__ . '/../uploads');
if (!$fisico || !$base || !str_starts_with($fisico, $base . DIRECTORY_SEPARATOR) || !is_file($fisico)) {
    http_response_code(404);
    exit('File non trovato.');
}

$nome = str_replace(['"', '\\', "\r", "\n"], '', (string)$file['filename']);
while (ob_get_level()) ob_end_clean();

header('Content-Type: ' . ((string)$file['mime_type'] ?: 'application/octet-stream'));
header('Content-Disposition: attachment; filename="' . $nome . '"');
header('Content-Length: ' . filesize($fisico));
header('X-Content-Type-Options: nosniff');
readfile($fisico);

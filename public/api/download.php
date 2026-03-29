<?php
/**
 * Download Proxy — v1.6.1
 *
 * Serve i file caricati con il nome originale pulito (senza il prefisso uniqid),
 * usando il campo `filename` già salvato nel database dalla prima versione.
 *
 * Uso: /api/download.php?id=123
 *
 * NON richiede autenticazione: i file sono pubblici (distribuiti ai visitatori).
 * La sola fonte di verità è il database — nessun path traversal possibile.
 */

require_once 'db.php';

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    exit('Parametro id mancante o non valido.');
}

try {
    $pdo = Database::connect();
    $stmt = $pdo->prepare("SELECT filename, file_path, mime_type, size FROM media WHERE id = ?");
    $stmt->execute([$id]);
    $media = $stmt->fetch();

    if (!$media) {
        http_response_code(404);
        exit('File non trovato nel database.');
    }

    // Costruisce il percorso fisico dalla file_path (es. /uploads/abc123-nomefile.zip)
    $physicalPath = __DIR__ . '/..' . $media['file_path'];

    if (!file_exists($physicalPath) || !is_readable($physicalPath)) {
        http_response_code(404);
        exit('File non trovato sul disco del server.');
    }

    // Sanifica il nome originale per l'header HTTP (rimuove virgolette e caratteri problematici)
    $cleanName = str_replace(['"', '\\', "\r", "\n"], '', $media['filename']);

    // Disabilita output buffering se attivo (per file grandi)
    if (ob_get_level()) {
        ob_end_clean();
    }

    // Invia il file col nome originale pulito
    header('Content-Type: ' . $media['mime_type']);
    header('Content-Disposition: attachment; filename="' . $cleanName . '"');
    header('Content-Length: ' . filesize($physicalPath));
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('Pragma: no-cache');
    header('Expires: 0');

    readfile($physicalPath);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    exit('Errore interno del server.');
}
?>

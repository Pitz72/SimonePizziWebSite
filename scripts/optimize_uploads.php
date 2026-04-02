<?php
/**
 * optimize_uploads.php — Script batch one-shot per conversione WebP
 *
 * ISTRUZIONI D'USO:
 *  1. Caricare temporaneamente in /public/api/ via FTP
 *  2. Visitare https://simonepizzi.it/api/optimize_uploads.php nel browser
 *  3. Leggere il report ed eliminare subito il file dal server
 *
 * IMPORTANTE: Non lasciare questo file sul server dopo l'esecuzione.
 * Pattern sicurezza standard del progetto (come init_db.php, emergency_pwd.php).
 *
 * Cosa fa:
 *  - Scansiona /public/uploads/ e trova tutti i file JPEG e PNG
 *  - Li converte in WebP (qualità 82, resize max 1920px se necessario)
 *  - Salva il nuovo file .webp, aggiorna il record nel DB (filename, file_path, mime_type, size)
 *  - Elimina il file originale PNG/JPEG
 *  - Produce un report testuale dettagliato con peso prima/dopo
 *  - Salta file già WebP, GIF, SVG, PDF, ZIP, e altri non-immagine
 *
 * Requisiti: GD Library abilitata sul server (extension_loaded('gd'))
 */

// Sicurezza minimale: blocca accesso da IP non localhost in produzione.
// Rimuovere il commento se si vuole restringere ulteriormente.
// if (!in_array($_SERVER['REMOTE_ADDR'], ['127.0.0.1', '::1'])) { die('Accesso negato.'); }

require_once 'db.php';

header('Content-Type: text/plain; charset=utf-8');

echo "=== optimize_uploads.php — Conversione batch WebP ===\n";
echo "Data esecuzione: " . date('Y-m-d H:i:s') . "\n\n";

// Verifica GD Library
if (!extension_loaded('gd') || !function_exists('imagewebp')) {
    echo "ERRORE FATALE: GD Library non disponibile su questo server.\n";
    echo "Verificare con phpinfo() che 'gd' sia caricato e che imagewebp() esista.\n";
    exit(1);
}
echo "GD Library: OK\n\n";

$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    echo "ERRORE: La directory /uploads/ non esiste. Nessun file da processare.\n";
    exit(1);
}

try {
    $pdo = Database::connect();
} catch (Exception $e) {
    echo "ERRORE: Connessione DB fallita: " . $e->getMessage() . "\n";
    exit(1);
}

// Raccoglie tutti i file nella directory uploads
$files = scandir($uploadDir);
$processed  = 0;
$skipped    = 0;
$errors     = 0;
$totalBefore = 0;
$totalAfter  = 0;
$report = [];

foreach ($files as $file) {
    if ($file === '.' || $file === '..') continue;

    $fullPath = $uploadDir . $file;
    if (!is_file($fullPath)) continue;

    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
    $mime = mime_content_type($fullPath);

    // Salta tutto ciò che non è JPEG o PNG (WebP già ok, GIF/SVG/PDF/ZIP ignorati)
    $convertible = [
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png'  => 'image/png',
    ];

    if (!isset($convertible[$ext]) || !in_array($mime, ['image/jpeg', 'image/png'])) {
        $reason = in_array($ext, ['webp', 'gif', 'svg']) ? "già ottimizzato/non convertibile ($ext)" : "non immagine ($ext)";
        $report[] = "  SKIP  $file — $reason";
        $skipped++;
        continue;
    }

    $sizeBefore = filesize($fullPath);
    $totalBefore += $sizeBefore;

    // Carica immagine
    $img = false;
    if ($mime === 'image/jpeg') $img = @imagecreatefromjpeg($fullPath);
    elseif ($mime === 'image/png') $img = @imagecreatefrompng($fullPath);

    if ($img === false) {
        $report[] = "  ERR   $file — impossibile leggere l'immagine (file corrotto?)";
        $errors++;
        $totalBefore -= $sizeBefore; // non conteggiare nei totali
        continue;
    }

    // Resize se larghezza > 1920px
    $origW = imagesx($img);
    $origH = imagesy($img);
    if ($origW > 1920) {
        $newW   = 1920;
        $newH   = (int) round($origH * (1920 / $origW));
        $canvas = imagecreatetruecolor($newW, $newH);
        imagealphablending($canvas, false);
        imagesavealpha($canvas, true);
        imagecopyresampled($canvas, $img, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
        imagedestroy($img);
        $img = $canvas;
        $resized = " (ridimensionata da {$origW}px a 1920px)";
    } else {
        $resized = "";
    }

    // Costruisce path WebP
    $webpFile     = preg_replace('/\.[^.]+$/', '.webp', $file);
    $webpFullPath = $uploadDir . $webpFile;
    $webpPublicUrl = '/uploads/' . $webpFile;

    if (!@imagewebp($img, $webpFullPath, 82)) {
        imagedestroy($img);
        $report[] = "  ERR   $file — imagewebp() fallita (permessi disco?)";
        $errors++;
        $totalBefore -= $sizeBefore;
        continue;
    }
    imagedestroy($img);

    $sizeAfter  = filesize($webpFullPath);
    $totalAfter += $sizeAfter;
    $saving     = round((1 - $sizeAfter / $sizeBefore) * 100, 1);
    $beforeKB   = round($sizeBefore / 1024, 1);
    $afterKB    = round($sizeAfter / 1024, 1);

    // Aggiorna il record nel DB cercando per file_path o filename
    // Il file_path nel DB è /uploads/HASHNAME.ext
    $oldPublicUrl = '/uploads/' . $file;
    $newFilename  = preg_replace('/\.[^.]+$/', '.webp', pathinfo($file, PATHINFO_FILENAME));
    // Recupera il filename originale (quello visibile all'utente) dal DB
    $stmt = $pdo->prepare("SELECT id, filename FROM media WHERE file_path = ?");
    $stmt->execute([$oldPublicUrl]);
    $row = $stmt->fetch();

    if ($row) {
        // Aggiorna filename con estensione .webp e file_path al nuovo path
        $cleanFilename = preg_replace('/\.[^.]+$/', '.webp', $row['filename']);
        $upd = $pdo->prepare("UPDATE media SET filename=?, file_path=?, mime_type='image/webp', size=? WHERE id=?");
        $upd->execute([$cleanFilename, $webpPublicUrl, $sizeAfter, $row['id']]);
        $dbStatus = "DB aggiornato (id={$row['id']})";
    } else {
        $dbStatus = "ATTENZIONE: record non trovato nel DB per $oldPublicUrl";
    }

    // Elimina originale
    unlink($fullPath);

    $report[] = "  OK    $file → $webpFile | {$beforeKB}KB → {$afterKB}KB (-{$saving}%){$resized} | $dbStatus";
    $processed++;
}

// --- Stampa report ---
echo "--- RISULTATI ---\n";
foreach ($report as $line) {
    echo $line . "\n";
}

echo "\n--- RIEPILOGO ---\n";
echo "File convertiti in WebP : $processed\n";
echo "File saltati            : $skipped\n";
echo "Errori                  : $errors\n";

if ($processed > 0) {
    $totalBeforeMB = round($totalBefore / 1024 / 1024, 2);
    $totalAfterMB  = round($totalAfter / 1024 / 1024, 2);
    $totalSaving   = round((1 - $totalAfter / $totalBefore) * 100, 1);
    echo "Peso totale prima       : {$totalBeforeMB} MB\n";
    echo "Peso totale dopo        : {$totalAfterMB} MB\n";
    echo "Risparmio totale        : -{$totalSaving}%\n";
}

echo "\n!!! ELIMINARE QUESTO SCRIPT DAL SERVER IMMEDIATAMENTE DOPO L'ESECUZIONE !!!\n";
?>

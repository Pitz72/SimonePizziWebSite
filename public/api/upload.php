<?php
require_once 'db.php';
require_once 'auth_helper.php';

Auth::check();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'File non fornito o errore nel caricamento']);
    exit;
}

$file = $_FILES['file'];
$fileName = basename($file['name']);
$fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

// Verifica Estensione Sicura. Accetta immagini e documenti specificati.
$allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf', 'zip', 'rar', 'mp3'];
if (!in_array($fileExt, $allowedExts)) {
    http_response_code(400);
    echo json_encode(['error' => 'Formato file non supportato nell\'estensione. File ammessi: ' . implode(', ', $allowedExts)]);
    exit;
}

// Verifica Sicurezza Intrinseca (Magic Bytes / MIME Type) 
// Previene estensioni falsificate es. shell.php.jpg o file text camuffati.
$realMime = mime_content_type($file['tmp_name']);
$allowedMimes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/zip', 'application/x-zip-compressed', 'application/x-zip',
    'application/x-rar-compressed', 'application/vnd.rar',
    'application/octet-stream', // ZIP/RAR su alcuni server vengono rilevati così
    'audio/mpeg'
];

if (!in_array($realMime, $allowedMimes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Il contenuto reale del file non corrisponde all\'estensione dichiarata (Spoofing bloccato).']);
    exit;
}

// Determina la sottocartella di destinazione in base al tipo MIME reale
$subFolder = 'file';
if (strpos($realMime, 'image/') === 0) {
    $subFolder = 'immagini';
} elseif ($realMime === 'application/pdf') {
    $subFolder = 'documenti';
}

// Crea directory uploads specifica (compilata da Vite)
$uploadDir = __DIR__ . '/../uploads/' . $subFolder . '/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true); // [v1.5.10] 0755: rwxr-xr-x
}

// Genera un nome unico per il file per non sovrascrivere
$newFileName = uniqid() . '-' . preg_replace('/[^A-Za-z0-9.\-_]/', '', $fileName);
$destination = $uploadDir . $newFileName;

// Lo URL relativo che React/Browser userà per renderizzare
$publicUrl = '/uploads/' . $subFolder . '/' . $newFileName;

if (move_uploaded_file($file['tmp_name'], $destination)) {

    // --- Ottimizzazione immagini: conversione automatica a WebP ---
    $imageMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (in_array($realMime, $imageMimes) && extension_loaded('gd') && function_exists('imagewebp')) {
        $img = false;
        if ($realMime === 'image/jpeg') $img = @imagecreatefromjpeg($destination);
        elseif ($realMime === 'image/png')  $img = @imagecreatefrompng($destination);
        elseif ($realMime === 'image/gif')  $img = @imagecreatefromgif($destination);

        if ($img !== false) {
            // Resize se larghezza > 1920px
            $origW = imagesx($img);
            $origH = imagesy($img);
            if ($origW > 1920) {
                $newW  = 1920;
                $newH  = (int) round($origH * (1920 / $origW));
                $canvas = imagecreatetruecolor($newW, $newH);
                imagealphablending($canvas, false);
                imagesavealpha($canvas, true);
                imagecopyresampled($canvas, $img, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
                imagedestroy($img);
                $img = $canvas;
            }

            // Salva WebP
            $webpNewFileName = preg_replace('/\.[^.]+$/', '.webp', $newFileName);
            $webpDestination = $uploadDir . $webpNewFileName;
            if (@imagewebp($img, $webpDestination, 82)) {
                unlink($destination);
                $destination = $webpDestination;
                $newFileName  = $webpNewFileName;
                $publicUrl    = '/uploads/' . $subFolder . '/' . $newFileName;
                $fileName = preg_replace('/\.[^.]+$/', '.webp', $fileName);
            }
            imagedestroy($img);
        }
    }
    // --- Fine ottimizzazione immagini ---

    // Traccia nel Database Media
    try {
        $pdo = Database::connect();
        $mime = mime_content_type($destination);
        $size = filesize($destination);

        $stmt = $pdo->prepare("INSERT INTO media (filename, file_path, mime_type, size) VALUES (?, ?, ?, ?)");
        $stmt->execute([$fileName, $publicUrl, $mime, $size]);

        echo json_encode([
            'status' => 'success',
            'url' => $publicUrl,
            'id' => $pdo->lastInsertId(),
            'name' => $fileName
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Errore salvataggio DB media: ' . $e->getMessage()]);
    }
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Impossibile muovere il file uppato. Controllare permessi server.']);
}
?>

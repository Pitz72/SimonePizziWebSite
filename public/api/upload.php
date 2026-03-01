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
    echo json_encode(['error' => 'Formato file non supportato. File ammessi: ' . implode(', ', $allowedExts)]);
    exit;
}

// Crea directory uploads definita nella Public root (compilata da Vite)
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Genera un nome unico per il file per non sovrascrivere
$newFileName = uniqid() . '-' . preg_replace('/[^A-Za-z0-9.\-_]/', '', $fileName);
$destination = $uploadDir . $newFileName;

// Lo URL relativo che React/Browser userà per renderizzare
$publicUrl = '/uploads/' . $newFileName;

if (move_uploaded_file($file['tmp_name'], $destination)) {
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

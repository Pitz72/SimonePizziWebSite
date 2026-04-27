<?php
require_once 'db.php';
require_once 'auth_helper.php';

header('Content-Type: application/json');

try {
    $pdo = Database::connect();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        Auth::check();
        
        // Elenco tutti i media (decrescente)
        $stmt = $pdo->query("SELECT * FROM media ORDER BY created_at DESC");
        $files = $stmt->fetchAll();
        echo json_encode($files);
    } 
    elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        Auth::check();
        
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400); echo json_encode(['error' => 'ID mancante']); exit;
        }
        
        $stmt = $pdo->prepare("SELECT file_path FROM media WHERE id=?");
        $stmt->execute([$id]);
        $media = $stmt->fetch();
        
        if ($media) {
            // Sicurezza: accetta solo path che iniziano con /uploads/ (mai path traversal dal DB)
            $filePath = $media['file_path'];
            if (str_starts_with($filePath, '/uploads/')) {
                $physicalPath = realpath(__DIR__ . '/..' . $filePath);
                $uploadsBase  = realpath(__DIR__ . '/../uploads');
                if ($physicalPath && $uploadsBase && str_starts_with($physicalPath, $uploadsBase)) {
                    unlink($physicalPath);
                }
            }
            
            // Rimozione riga DB SQLite
            $stmt = $pdo->prepare("DELETE FROM media WHERE id=?");
            $stmt->execute([$id]);
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'File Media non trovato nel DB']);
        }
    }
} catch (PDOException $e) {
    error_log('media.php PDOException: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Errore interno del server.']);
}
?>

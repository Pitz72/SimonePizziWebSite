<?php
require_once 'db.php';
require_once 'auth_helper.php';

Auth::check();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$pdo = Database::connect();

if ($method === 'PUT') {
    // Aggiornamento Password
    $data = json_decode(file_get_contents('php://input'), true);
    
    $currentPassword = $data['current_password'] ?? '';
    $newPassword = $data['new_password'] ?? '';
    $userId = $_SESSION['user_id'];

    if (empty($currentPassword) || empty($newPassword)) {
        http_response_code(400); echo json_encode(['error' => 'Campi mancanti']); exit;
    }

    try {
        // Verifica vecchia password
        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if ($user && password_verify($currentPassword, $user['password_hash'])) {
            // Aggiorna con nuova password hashata
            $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
            $updateStmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
            $updateStmt->execute([$newHash, $userId]);
            
            echo json_encode(['status' => 'success', 'message' => 'Password aggiornata con successo!']);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'La password attuale è errata.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Errore DB: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405); echo json_encode(['error' => 'Metodo non supportato']);
}
?>

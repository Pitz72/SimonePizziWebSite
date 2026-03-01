<?php
require_once 'db.php';

session_start();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

try {
    $pdo = Database::connect();

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Modalità GET / Check Auth bypassata con un action param (o via GET preferibile, ma gestiamo qui)
        if (isset($data['action']) && $data['action'] === 'check') {
             if (isset($_SESSION['user_id'])) {
                 echo json_encode(['status' => 'success', 'user' => $_SESSION['username']]);
             } else {
                 http_response_code(401);
                 echo json_encode(['status' => 'error', 'message' => 'Non autenticato']);
             }
             exit;
        }

        // Logout
        if (isset($data['action']) && $data['action'] === 'logout') {
            session_destroy();
            echo json_encode(['status' => 'success']);
            exit;
        }

        // Login Standard
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($username) || empty($password)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Credenziali mancanti']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            // Setup Session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            
            echo json_encode(['status' => 'success', 'message' => 'Login effettuato']);
        } else {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Credenziali non valide']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Errore DB: ' . $e->getMessage()]);
}
?>

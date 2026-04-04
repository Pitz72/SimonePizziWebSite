<?php
require_once 'db.php';

// [v1.5.8] Cookie di sessione con flag di sicurezza: HttpOnly, Secure, SameSite=Strict
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');
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
            // [v1.5.8] Logout completo: svuota i dati, invalida il cookie client, distrugge la sessione
            $_SESSION = [];
            if (ini_get('session.use_cookies')) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000,
                    $params['path'], $params['domain'],
                    $params['secure'], $params['httponly']
                );
            }
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

        // --- INIZIO RATE LIMITING ---
        $ip_address = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        
        // Pulizia vecchi tentativi (più vecchi di 15 minuti)
        $pdo->exec("DELETE FROM login_attempts WHERE attempt_time < DATE_SUB(NOW(), INTERVAL 15 MINUTE)");
        
        // Controllo quanti tentativi errati nell'ultima finestra temporale
        $stmtLimit = $pdo->prepare("SELECT COUNT(*) FROM login_attempts WHERE ip_address = ?");
        $stmtLimit->execute([$ip_address]);
        $attempts = $stmtLimit->fetchColumn();
        
        if ($attempts >= 5) {
            http_response_code(429); // Too Many Requests
            echo json_encode(['status' => 'error', 'message' => 'Too many failed login attempts. Try again in 15 minutes.']);
            exit;
        }
        // --- FINE RATE LIMITING ---

        $stmt = $pdo->prepare("SELECT id, username, password_hash FROM users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            // [v1.5.8] Rigenerazione ID sessione per prevenire Session Fixation Attack
            session_regenerate_id(true);
            // Setup Session
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            
            // Login riuscito: reset tentativi falliti per questo IP
            $stmtReset = $pdo->prepare("DELETE FROM login_attempts WHERE ip_address = ?");
            $stmtReset->execute([$ip_address]);

            echo json_encode(['status' => 'success', 'message' => 'Login effettuato']);
        } else {
            // Registra tentativo fallito
            $stmtFail = $pdo->prepare("INSERT INTO login_attempts (ip_address) VALUES (?)");
            $stmtFail->execute([$ip_address]);

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

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
        
        // Modalità GET / Check Auth bypassata con un action param
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

        // [v1.7.18] Richiesta recupero password
        if (isset($data['action']) && $data['action'] === 'request-recovery') {
            $identifier = trim($data['identifier'] ?? '');
            if (empty($identifier)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Inserisci username o email']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT id, username, email FROM users WHERE username = ? OR email = ?");
            $stmt->execute([$identifier, $identifier]);
            $user = $stmt->fetch();

            if (!$user || empty($user['email'])) {
                // Messaggio generico per sicurezza
                echo json_encode(['status' => 'success', 'message' => 'Se l\'account esiste ed è associato a una mail, riceverai le istruzioni a breve.']);
                exit;
            }

            $token = bin2hex(random_bytes(32));
            $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

            $pdo->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)")
                ->execute([$user['id'], $token, $expires]);

            if (sendRecoveryEmail($user['email'], $user['username'], $token)) {
                echo json_encode(['status' => 'success', 'message' => 'Email di recupero inviata correttamente.']);
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Errore nell\'invio dell\'email.']);
            }
            exit;
        }

        // [v1.7.18] Reset password effettivo
        if (isset($data['action']) && $data['action'] === 'reset-password') {
            $token = $data['token'] ?? '';
            $newPassword = $data['password'] ?? '';

            if (empty($token) || empty($newPassword)) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Dati mancanti']);
                exit;
            }

            $stmt = $pdo->prepare("
                SELECT user_id FROM password_resets 
                WHERE token = ? AND expires_at > NOW()
            ");
            $stmt->execute([$token]);
            $reset = $stmt->fetch();

            if (!$reset) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Token non valido o scaduto']);
                exit;
            }

            $hash = password_hash($newPassword, PASSWORD_DEFAULT);
            $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?")
                ->execute([$hash, $reset['user_id']]);

            $pdo->prepare("DELETE FROM password_resets WHERE token = ?")
                ->execute([$token]);

            echo json_encode(['status' => 'success', 'message' => 'Password aggiornata con successo!']);
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

/**
 * [v1.7.18] Invia email di recupero password
 */
function sendRecoveryEmail($to, $username, $token) {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $link = "{$protocol}://{$host}/admin/reset-password/{$token}";
    
    $subject = "Recupero Password — Simone Pizzi";
    $subjectEncoded = '=?UTF-8?B?' . base64_encode($subject) . '?=';
    
    $from = 'noreply@' . $host;
    $replyTo = 'simonepizzi.1972@proton.me';

    $html = "<!DOCTYPE html><html><body style='background:#0a0a0a; color:#fff; font-family:sans-serif; padding:40px;'>";
    $html .= "<div style='max-width:600px; margin:0 auto; background:#111; border:1px solid #222; border-radius:12px; padding:30px;'>";
    $html .= "<h2 style='color:#22c55e;'>Recupero Password</h2>";
    $html .= "<p>Ciao <strong>{$username}</strong>,</p>";
    $html .= "<p>Hai richiesto il ripristino della password per il tuo accesso al Pannello di Controllo di simonepizzi.it.</p>";
    $html .= "<p>Clicca sul pulsante qui sotto per procedere (il link scadrà tra un'ora):</p>";
    $html .= "<div style='text-align:center; margin:30px 0;'>";
    $html .= "<a href='{$link}' style='background:#22c55e; color:#000; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold; display:inline-block;'>Ripristina Password</a>";
    $html .= "</div>";
    $html .= "<p style='font-size:12px; color:#666;'>Se non hai richiesto tu questo reset, ignora pure questa email.</p>";
    $html .= "</div></body></html>";

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Simone Pizzi <{$from}>\r\n";
    $headers .= "Reply-To: {$replyTo}\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    return mail($to, $subjectEncoded, $html, $headers);
}
?>


<?php
require_once 'db.php';

// [v1.19.0] Flag di sicurezza sul cookie di sessione applicati a OGNI endpoint.
// Prima erano solo in auth.php: un cookie nato da un altro endpoint (es. articles.php)
// veniva emesso senza HttpOnly/Secure/SameSite, indebolendo l'unica difesa CSRF.
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.cookie_samesite', 'Strict');

session_start();

class Auth {
    public static function check() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Non autorizzato']);
            exit;
        }

        // [v1.19.0] Difesa CSRF in profondità: sui metodi mutativi, se il browser
        // dichiara un'origine (Origin o Referer), deve corrispondere al dominio del
        // sito. Richieste senza entrambi gli header (client non-browser) passano.
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        if (!in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
            $source = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
            if ($source !== '') {
                $sourceHost  = parse_url($source, PHP_URL_HOST);
                $allowedHost = parse_url(SITE_URL, PHP_URL_HOST);
                $isLocalDev  = in_array($sourceHost, ['localhost', '127.0.0.1'], true);
                if ($sourceHost !== $allowedHost && !$isLocalDev) {
                    http_response_code(403);
                    echo json_encode(['status' => 'error', 'message' => 'Origine della richiesta non valida']);
                    exit;
                }
            }
        }

        // Verifica session_version: se la password è stata resettata, la sessione corrente è invalidata
        try {
            $pdo = Database::connect();
            $stmt = $pdo->prepare("SELECT session_version FROM users WHERE id = ?");
            $stmt->execute([$_SESSION['user_id']]);
            $row = $stmt->fetch();
            if (!$row || (int)$row['session_version'] !== (int)($_SESSION['session_version'] ?? -1)) {
                session_destroy();
                http_response_code(401);
                echo json_encode(['status' => 'error', 'message' => 'Sessione scaduta. Effettua nuovamente il login.']);
                exit;
            }
        } catch (PDOException $e) {
            // [v1.19.0] Fail-closed: se il DB non conferma la sessione, niente accesso.
            error_log('auth_helper.php session_version check failed: ' . $e->getMessage());
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Sessione non verificabile. Riprova.']);
            exit;
        }
    }
}
?>

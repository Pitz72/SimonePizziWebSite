<?php
require_once 'db.php';

session_start();

class Auth {
    public static function check() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Non autorizzato']);
            exit;
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
            // In caso di errore DB non blocchiamo l'accesso (fail-open accettabile qui)
        }
    }
}
?>

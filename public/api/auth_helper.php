<?php
require_once 'db.php';

session_start();
header('Content-Type: application/json');

// Helper class per validare l'autenticazione dalle API protette
class Auth {
    public static function check() {
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Non autorizzato']);
            exit;
        }
    }
}
?>

<?php
require_once __DIR__ . '/config.php';

class Database {
    private static $pdo = null;

    public static function connect() {
        if (self::$pdo === null) {
            try {
                self::$pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                error_log('db.php connection failed: ' . $e->getMessage());
                echo json_encode(['status' => 'error', 'message' => 'Errore interno del server.']);
                exit;
            }
        }
        return self::$pdo;
    }
}
?>

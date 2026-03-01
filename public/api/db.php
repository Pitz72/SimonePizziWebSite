<?php
class Database {
    private static $pdo = null;

    public static function connect() {
        if (self::$pdo === null) {
            $dbPath = __DIR__ . '/.data/database.sqlite';
            $dir = dirname($dbPath);
            
            if (!is_dir($dir)) {
                mkdir($dir, 0777, true);
            }
            
            // Protezione della cartella .data
            $htaccessPath = $dir . '/.htaccess';
            if (!file_exists($htaccessPath)) {
                file_put_contents($htaccessPath, "Require all denied\n");
            }

            try {
                self::$pdo = new PDO('sqlite:' . $dbPath);
                self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                
                // Utilizzo DELETE mode per prevenire file locking (lessons learned da precedenti progetti SQLite/PHP)
                self::$pdo->exec('PRAGMA journal_mode = DELETE;');
                self::$pdo->exec('PRAGMA foreign_keys = ON;');
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
                exit;
            }
        }
        return self::$pdo;
    }
}
?>

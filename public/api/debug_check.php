<?php
// DIAGNOSTIC TOOL — eliminare subito dopo l'uso
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: text/plain; charset=utf-8');

echo "=== PHP Diagnostic Check ===\n\n";
echo "PHP version: " . PHP_VERSION . "\n";
echo "PDO drivers: " . implode(', ', PDO::getAvailableDrivers()) . "\n\n";

// Test config.php
$config_path = __DIR__ . '/config.php';
echo "config.php exists: " . (file_exists($config_path) ? 'YES' : 'NO') . "\n";
echo "config.php readable: " . (is_readable($config_path) ? 'YES' : 'NO') . "\n\n";

if (file_exists($config_path)) {
    require_once $config_path;
    echo "DB_DSN defined: " . (defined('DB_DSN') ? 'YES' : 'NO') . "\n";
    echo "DB_USER defined: " . (defined('DB_USER') ? 'YES' : 'NO') . "\n";
    echo "DB_PASS defined: " . (defined('DB_PASS') ? 'YES' : 'NO') . "\n\n";

    // Test connessione MySQL
    echo "Tentativo connessione MySQL...\n";
    try {
        $pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
        echo "CONNESSIONE OK\n";
        $count = $pdo->query("SELECT COUNT(*) FROM articles")->fetchColumn();
        echo "Articoli nel DB: $count\n";
    } catch (PDOException $e) {
        echo "ERRORE CONNESSIONE: " . $e->getMessage() . "\n";
    }
}

echo "\n=== Fine diagnostica ===\n";
echo "ELIMINARE QUESTO FILE DAL SERVER.\n";
?>

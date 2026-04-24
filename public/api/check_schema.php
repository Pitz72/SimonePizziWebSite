<?php
require_once 'db.php';
$pdo = Database::connect();
try {
    $stmt = $pdo->query("DESCRIBE categories");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC), JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo $e->getMessage();
}
?>

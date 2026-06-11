<?php
require_once 'db.php';
header('Content-Type: text/plain');

$pdo = Database::connect();

try {
    echo "Inizio migrazione app_settings...\n";

    $pdo->exec("CREATE TABLE IF NOT EXISTS app_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    echo "[OK] Tabella app_settings creata/verificata.\n";

    // Inizializzazione impostazioni di default
    $defaults = [
        'backup_auto' => '0',
        'backup_frequency' => 'weekly',
        'backup_last_run' => ''
    ];

    $stmt = $pdo->prepare("INSERT IGNORE INTO app_settings (setting_key, setting_value) VALUES (?, ?)");
    foreach ($defaults as $key => $val) {
        $stmt->execute([$key, $val]);
        echo "[OK] Inizializzata impostazione: $key\n";
    }

    echo "\nMigrazione completata con successo!\n";
    echo "ELIMINARE QUESTO FILE DAL SERVER.";

} catch (PDOException $e) {
    die("[ERRORE] " . $e->getMessage());
}

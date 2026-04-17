<?php
/**
 * MIGRAZIONE v1.7.4 — Estensione tabella subscribers + nuova tabella newsletter_sends
 *
 * ISTRUZIONI:
 * 1. Copiare questo file in public/api/ prima del deploy
 * 2. Aprire da browser: https://simonepizzi.runtimeradio.it/api/migrate_newsletter.php
 * 3. Verificare che tutti i log riportino "OK"
 * 4. CANCELLARE il file dal server immediatamente dopo
 */

// Il file viene deployato in public/api/ — db.php è nella stessa directory
require_once __DIR__ . '/db.php';

header('Content-Type: text/plain; charset=utf-8');

$pdo  = Database::connect();
$logs = [];

// 1. Aggiunge le colonne mancanti a subscribers
$columns = [
    'name'              => "ADD COLUMN name VARCHAR(255) DEFAULT NULL",
    'confirm_token'     => "ADD COLUMN confirm_token VARCHAR(64) DEFAULT NULL",
    'confirmed_at'      => "ADD COLUMN confirmed_at DATETIME DEFAULT NULL",
    'unsubscribe_token' => "ADD COLUMN unsubscribe_token VARCHAR(64) DEFAULT NULL",
];

foreach ($columns as $col => $definition) {
    try {
        $pdo->exec("ALTER TABLE subscribers {$definition}");
        $logs[] = "[OK] Aggiunta colonna subscribers.{$col}";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false || strpos($e->getMessage(), 'already exists') !== false) {
            $logs[] = "[SKIP] Colonna subscribers.{$col} già esistente";
        } else {
            $logs[] = "[ERR] subscribers.{$col}: " . $e->getMessage();
        }
    }
}

// 2. Crea tabella newsletter_sends
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS newsletter_sends (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        subject     TEXT NOT NULL,
        body        TEXT NOT NULL,
        sent_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
        recipient_count INT DEFAULT 0
    )");
    $logs[] = "[OK] Tabella newsletter_sends creata/verificata";
} catch (PDOException $e) {
    $logs[] = "[ERR] newsletter_sends: " . $e->getMessage();
}

echo "=== MIGRAZIONE v1.7.4 Newsletter ===\n\n";
echo implode("\n", $logs);
echo "\n\n=== COMPLETATA — Elimina questo file dal server. ===\n";
?>

<?php
/**
 * MIGRAZIONE DB v1.5.10 — Aggiunta colonna updated_at alla tabella articles
 *
 * ISTRUZIONI:
 * 1. Carica questo file via FTP in /public/api/ sul server di produzione
 * 2. Visita https://simonepizzi.it/api/migrate_add_updated_at.php nel browser
 * 3. Verifica il JSON di output: status "success"
 * 4. CANCELLA immediatamente questo file dal server FTP
 *
 * NON lasciare questo file sul server. Non ha autenticazione.
 * Il pattern CREATE/ALTER IF NOT EXISTS/EXISTS rende lo script idempotente (sicuro da rieseguire).
 */

require_once 'db.php';
header('Content-Type: application/json');

$logs = [];

try {
    $pdo = Database::connect();

    // Verifica se la colonna updated_at esiste già nella tabella articles
    $stmt = $pdo->query("PRAGMA table_info(articles)");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $columnNames = array_column($columns, 'name');

    if (!in_array('updated_at', $columnNames)) {
        // Aggiunge la colonna updated_at con DEFAULT CURRENT_TIMESTAMP
        $pdo->exec("ALTER TABLE articles ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP");
        $logs[] = "Colonna 'updated_at' aggiunta alla tabella 'articles'.";

        // Popola updated_at per gli articoli esistenti usando published_at (se disponibile) o created_at
        $pdo->exec("UPDATE articles SET updated_at = COALESCE(published_at, created_at)");
        $logs[] = "Colonna 'updated_at' popolata per gli articoli esistenti (COALESCE di published_at/created_at).";
    } else {
        $logs[] = "Colonna 'updated_at' già presente — nessuna modifica effettuata.";
    }

    echo json_encode([
        "status" => "success",
        "message" => "Migrazione completata. CANCELLA questo file dal server ora.",
        "logs" => $logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage(), "logs" => $logs]);
}
?>

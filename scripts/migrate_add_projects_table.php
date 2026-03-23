<?php
/**
 * MIGRAZIONE DB v1.6.0 — Creazione tabella 'projects'
 *
 * ISTRUZIONI:
 * 1. Carica questo file via FTP in /public/api/ sul server di produzione
 * 2. Visita https://simonepizzi.it/api/migrate_add_projects_table.php nel browser
 * 3. Verifica il JSON di output: status "success"
 * 4. CANCELLA immediatamente questo file dal server FTP
 *
 * Lo script è idempotente (CREATE TABLE IF NOT EXISTS): sicuro da rieseguire.
 */

require_once 'db.php';
header('Content-Type: application/json');

$logs = [];

try {
    $pdo = Database::connect();

    $pdo->exec("CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'progetti-software',
        cover_image TEXT,
        button_a_label TEXT DEFAULT 'Scopri',
        button_a_url TEXT,
        button_b_label TEXT,
        button_b_url TEXT,
        is_visible INTEGER DEFAULT 1,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    $logs[] = "Tabella 'projects' creata/verificata con successo.";

    echo json_encode([
        "status" => "success",
        "message" => "Migrazione v1.6.0 completata. CANCELLA questo file dal server ora.",
        "logs" => $logs
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage(), "logs" => $logs]);
}
?>

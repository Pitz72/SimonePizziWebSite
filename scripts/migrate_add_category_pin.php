<?php
/**
 * MIGRAZIONE: Aggiunge is_category_pinned alla tabella articles
 *
 * ISTRUZIONI:
 *  1. Caricare sul server via FTP in /public/api/migrate_add_category_pin.php
 *  2. Aprire nel browser: https://simonepizzi.runtimeradio.it/api/migrate_add_category_pin.php
 *  3. Verificare il messaggio di successo
 *  4. CANCELLARE SUBITO il file dal server via FTP
 */

require_once __DIR__ . '/../public/api/db.php';

header('Content-Type: text/plain; charset=UTF-8');

try {
    $pdo = Database::connect();

    // Verifica se la colonna esiste già
    $check = $pdo->query("SHOW COLUMNS FROM articles LIKE 'is_category_pinned'");
    if ($check->rowCount() > 0) {
        echo "OK — La colonna is_category_pinned esiste già. Nessuna modifica necessaria.\n";
        exit;
    }

    // Aggiunge la colonna dopo is_featured
    $pdo->exec("ALTER TABLE articles ADD COLUMN is_category_pinned TINYINT(1) NOT NULL DEFAULT 0 AFTER is_featured");

    // Indice per velocizzare la query di ordinamento per categoria
    $pdo->exec("ALTER TABLE articles ADD INDEX idx_cat_pin (category, is_category_pinned)");

    echo "OK — Migrazione completata con successo.\n";
    echo "     Colonna 'is_category_pinned' aggiunta alla tabella 'articles'.\n";
    echo "     Indice 'idx_cat_pin' creato.\n";
    echo "\nRICORDA: cancella questo file dal server via FTP.\n";

} catch (Exception $e) {
    http_response_code(500);
    echo "ERRORE: " . $e->getMessage() . "\n";
}

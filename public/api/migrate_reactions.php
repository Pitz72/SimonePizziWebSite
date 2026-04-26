<?php
/**
 * MIGRATION: Crea tabella article_reactions
 * 
 * ⚠️ DA ESEGUIRE UNA SOLA VOLTA via browser dopo il deploy FTP:
 *    https://simonepizzi.runtimeradio.it/api/migrate_reactions.php
 * 
 * Dopo l'esecuzione, questo file può essere eliminato dal server per sicurezza.
 */

require_once 'db.php';

header('Content-Type: application/json');

try {
    $pdo = Database::connect();

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS article_reactions (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            article_id  INT NOT NULL,
            reaction    VARCHAR(20) NOT NULL,
            voter_hash  VARCHAR(64) NOT NULL,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_vote (article_id, voter_hash, reaction),
            INDEX idx_article (article_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ");

    echo json_encode([
        'status'  => 'success',
        'message' => 'Tabella article_reactions creata correttamente (o già esistente).',
        'action'  => 'Puoi eliminare questo file dal server.'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
?>

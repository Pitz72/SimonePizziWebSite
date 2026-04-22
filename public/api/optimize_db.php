<?php
/**
 * SCRIPT DI OTTIMIZZAZIONE DATABASE v1.9.3 (FIXED SYNTAX)
 * Protocollo: Caricare -> Eseguire da browser (admin logged in) -> Cancellare
 */
require_once 'db.php';
require_once 'auth_helper.php';

header('Content-Type: application/json');

try {
    Auth::check();
    $pdo = Database::connect();

    $queries = [
        "ALTER TABLE articles ADD INDEX idx_status (status)",
        "ALTER TABLE article_views ADD INDEX idx_article_id (article_id)",
        "ALTER TABLE article_views ADD INDEX idx_view_date (view_date)",
        "ALTER TABLE article_views ADD INDEX idx_lookup (article_id, ip_hash, view_date)",
        "ALTER TABLE cta_clicks ADD INDEX idx_article_id (article_id)",
        "ALTER TABLE cta_clicks ADD INDEX idx_button_label (button_label)"
    ];

    $results = [];
    foreach ($queries as $sql) {
        try {
            $pdo->exec($sql);
            $results[] = ["query" => $sql, "status" => "Successo"];
        } catch (PDOException $e) {
            // Se l'indice esiste già (errore 1061 in MySQL), lo segnaliamo come saltato ma senza errore fatale
            if ($e->getCode() == '42000' || strpos($e->getMessage(), '1061') !== false) {
                $results[] = ["query" => $sql, "status" => "Saltato", "info" => "Indice già esistente"];
            } else {
                $results[] = ["query" => $sql, "status" => "Errore", "info" => $e->getMessage()];
            }
        }
    }

    echo json_encode([
        "status" => "Ottimizzazione completata",
        "timestamp" => date('Y-m-d H:i:s'),
        "results" => $results
    ]);

} catch (Exception $e) {
    http_response_code(403);
    echo json_encode(["error" => "Accesso negato o errore DB: " . $e->getMessage()]);
}
?>

<?php
// =================================================================
// Script di Migrazione DB - v1.6.5
// -----------------------------------------------------------------
// ISTRUZIONI: Caricare in /public/api/ via FTP, aprire nel browser,
//             leggere l'output, poi ELIMINARE SUBITO il file.
// =================================================================

require_once 'db.php';

header('Content-Type: text/plain; charset=utf-8');

$pdo = Database::connect();
$results = [];

try {
    // ---- 1. Tabella categories ----
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
    )");
    $results[] = "[OK] Tabella 'categories' creata (o già esistente).";

    // ---- 2. Popola categorie di default (le 5 dell'Enum TypeScript) ----
    $default_categories = [
        ['Videogiochi',               'videogiochi',               1],
        ['Progetti Software',         'progetti-software',         2],
        ['Narrativa e Pubblicazioni', 'narrativa-e-pubblicazioni', 3],
        ['Podcast, Audio e Altro',    'podcast-audio-altro',       4],
        ['Blog e Riflessioni',        'blog-e-riflessioni',        5],
    ];

    $stmt = $pdo->prepare("INSERT OR IGNORE INTO categories (name, slug, sort_order) VALUES (?, ?, ?)");
    foreach ($default_categories as $cat) {
        $stmt->execute($cat);
        $results[] = "[OK] Categoria '{$cat[0]}' inserita (o già esistente).";
    }

    // ---- 3. Tabella article_views ----
    $pdo->exec("CREATE TABLE IF NOT EXISTS article_views (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_id INTEGER NOT NULL,
        ip_hash TEXT,
        view_date TEXT,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    )");
    $results[] = "[OK] Tabella 'article_views' creata (o già esistente).";

    // ---- 4. Tabella cta_clicks ----
    $pdo->exec("CREATE TABLE IF NOT EXISTS cta_clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_id INTEGER NOT NULL,
        button_label TEXT,
        clicked_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    )");
    $results[] = "[OK] Tabella 'cta_clicks' creata (o già esistente).";

    echo "=== Migrazione v1.6.5 Completata con Successo ===\n\n";
    foreach ($results as $r) {
        echo $r . "\n";
    }
    echo "\n[ATTENZIONE] ELIMINARE QUESTO FILE DAL SERVER IMMEDIATAMENTE.\n";

} catch (Exception $e) {
    http_response_code(500);
    echo "[ERRORE CRITICO] " . $e->getMessage() . "\n";
}
?>

<?php
// =================================================================
// Migrazione Database: SQLite → MySQL  (v1.7.0)
// -----------------------------------------------------------------
// ISTRUZIONI:
//   1. Assicurarsi che config.php sia presente nella stessa cartella
//   2. Aprire questo file nel browser: simonepizzi.it/api/migrate_to_mysql.php
//   3. Leggere l'output e verificare che tutto sia OK
//   4. ELIMINARE QUESTO FILE DAL SERVER SUBITO DOPO
//   5. NON eliminare config.php — il sito ne ha bisogno
// =================================================================

require_once __DIR__ . '/config.php';

header('Content-Type: text/plain; charset=utf-8');
set_time_limit(180);

echo "================================================================\n";
echo " Migrazione SQLite → MySQL — SimonePizzi Portfolio v1.7.0\n";
echo "================================================================\n\n";

// ----------------------------------------------------------------
// Connessione MySQL
// ----------------------------------------------------------------
try {
    $mysql = new PDO(DB_DSN, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    echo "[OK] Connessione MySQL stabilita.\n\n";
} catch (PDOException $e) {
    die("[ERRORE CRITICO] Connessione MySQL fallita: " . $e->getMessage() . "\n");
}

// ----------------------------------------------------------------
// Connessione SQLite (database di produzione esistente)
// ----------------------------------------------------------------
$sqlite_path = __DIR__ . '/.data/database.sqlite';
if (!file_exists($sqlite_path)) {
    die("[ERRORE CRITICO] File SQLite non trovato in: $sqlite_path\n");
}
try {
    $sqlite = new PDO('sqlite:' . $sqlite_path, null, null, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    echo "[OK] Connessione SQLite stabilita: $sqlite_path\n\n";
} catch (PDOException $e) {
    die("[ERRORE CRITICO] Connessione SQLite fallita: " . $e->getMessage() . "\n");
}

// ----------------------------------------------------------------
// FASE 1: Creazione tabelle MySQL
// ----------------------------------------------------------------
echo "--- FASE 1: Creazione tabelle ---\n\n";

$mysql->exec("SET FOREIGN_KEY_CHECKS = 0");

$schema = [
    'users' => "CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'articles' => "CREATE TABLE IF NOT EXISTS articles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title TEXT NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content LONGTEXT,
        excerpt TEXT,
        cover_image TEXT,
        category VARCHAR(100),
        tags TEXT,
        is_featured TINYINT(1) DEFAULT 0,
        button_a_label VARCHAR(255),
        button_a_link TEXT,
        button_b_label VARCHAR(255),
        button_b_link TEXT,
        status VARCHAR(20) DEFAULT 'draft',
        published_at DATETIME NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'media' => "CREATE TABLE IF NOT EXISTS media (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255),
        file_path TEXT,
        mime_type VARCHAR(100),
        size INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'login_attempts' => "CREATE TABLE IF NOT EXISTS login_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45),
        attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'projects' => "CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category VARCHAR(100),
        cover_image TEXT,
        button_a_label VARCHAR(255),
        button_a_url TEXT,
        button_b_label VARCHAR(255),
        button_b_url TEXT,
        is_visible TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'messages' => "CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        message TEXT,
        is_read TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'subscribers' => "CREATE TABLE IF NOT EXISTS subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'categories' => "CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'article_views' => "CREATE TABLE IF NOT EXISTS article_views (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        ip_hash VARCHAR(64),
        view_date DATE,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",

    'cta_clicks' => "CREATE TABLE IF NOT EXISTS cta_clicks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        article_id INT NOT NULL,
        button_label VARCHAR(100),
        clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
];

foreach ($schema as $table => $sql) {
    try {
        $mysql->exec($sql);
        echo "[OK] Tabella '$table' pronta.\n";
    } catch (PDOException $e) {
        echo "[ERRORE] Tabella '$table': " . $e->getMessage() . "\n";
    }
}

// ----------------------------------------------------------------
// FASE 2: Migrazione dati
// ----------------------------------------------------------------
echo "\n--- FASE 2: Migrazione dati ---\n\n";

// Normalizza valori datetime: stringa vuota → NULL
function normalizeRow(array $row, array $datetimeFields): array {
    foreach ($datetimeFields as $f) {
        if (isset($row[$f]) && trim((string)$row[$f]) === '') {
            $row[$f] = null;
        }
    }
    return $row;
}

function migrateTable(PDO $sqlite, PDO $mysql, string $table, array $columns, array $datetimeCols = []): void {
    // Verifica esistenza tabella in SQLite
    $exists = $sqlite->query("SELECT name FROM sqlite_master WHERE type='table' AND name=" . $sqlite->quote($table))->fetchColumn();
    if (!$exists) {
        echo "[SKIP] '$table' non trovata in SQLite — probabilmente tabella nuova, ignorata.\n";
        return;
    }

    $rows = $sqlite->query("SELECT * FROM $table")->fetchAll();
    if (empty($rows)) {
        echo "[OK] '$table': vuota, niente da migrare.\n";
        return;
    }

    $cols        = implode(', ', $columns);
    $placeholders = implode(', ', array_fill(0, count($columns), '?'));
    $stmt        = $mysql->prepare("INSERT IGNORE INTO $table ($cols) VALUES ($placeholders)");

    $count = 0;
    foreach ($rows as $row) {
        $row    = normalizeRow($row, $datetimeCols);
        $values = array_map(fn($col) => $row[$col] ?? null, $columns);
        $stmt->execute($values);
        $count++;
    }
    echo "[OK] '$table': $count righe migrate.\n";
}

migrateTable($sqlite, $mysql, 'users',
    ['id', 'username', 'password_hash', 'created_at'],
    ['created_at']
);

migrateTable($sqlite, $mysql, 'articles',
    ['id', 'title', 'slug', 'content', 'excerpt', 'cover_image', 'category', 'tags',
     'is_featured', 'button_a_label', 'button_a_link', 'button_b_label', 'button_b_link',
     'status', 'published_at', 'created_at', 'updated_at'],
    ['published_at', 'created_at', 'updated_at']
);

migrateTable($sqlite, $mysql, 'media',
    ['id', 'filename', 'file_path', 'mime_type', 'size', 'created_at'],
    ['created_at']
);

migrateTable($sqlite, $mysql, 'login_attempts',
    ['id', 'ip_address', 'attempt_time'],
    ['attempt_time']
);

migrateTable($sqlite, $mysql, 'projects',
    ['id', 'name', 'description', 'category', 'cover_image',
     'button_a_label', 'button_a_url', 'button_b_label', 'button_b_url',
     'is_visible', 'sort_order', 'created_at'],
    ['created_at']
);

migrateTable($sqlite, $mysql, 'messages',
    ['id', 'name', 'email', 'message', 'is_read', 'created_at'],
    ['created_at']
);

migrateTable($sqlite, $mysql, 'subscribers',
    ['id', 'email', 'status', 'created_at'],
    ['created_at']
);

migrateTable($sqlite, $mysql, 'categories',
    ['id', 'name', 'slug', 'sort_order', 'created_at'],
    ['created_at']
);

migrateTable($sqlite, $mysql, 'article_views',
    ['id', 'article_id', 'ip_hash', 'view_date'],
    ['view_date']
);

migrateTable($sqlite, $mysql, 'cta_clicks',
    ['id', 'article_id', 'button_label', 'clicked_at'],
    ['clicked_at']
);

$mysql->exec("SET FOREIGN_KEY_CHECKS = 1");

// ----------------------------------------------------------------
// Verifica conteggi finali
// ----------------------------------------------------------------
echo "\n--- Verifica conteggi MySQL ---\n\n";
$tables_check = ['users', 'articles', 'media', 'projects', 'categories', 'article_views', 'cta_clicks'];
foreach ($tables_check as $t) {
    try {
        $n = $mysql->query("SELECT COUNT(*) FROM $t")->fetchColumn();
        echo "[OK] $t: $n righe presenti.\n";
    } catch (PDOException $e) {
        echo "[ERRORE] $t: " . $e->getMessage() . "\n";
    }
}

echo "\n================================================================\n";
echo " Migrazione completata!\n\n";
echo " PROSSIMI PASSI:\n";
echo "  1. Verificare che il sito funzioni correttamente\n";
echo "  2. ELIMINARE QUESTO FILE dal server\n";
echo "  3. NON eliminare config.php — il sito ne ha bisogno\n";
echo "================================================================\n";
?>

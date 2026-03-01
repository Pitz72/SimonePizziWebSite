<?php
require_once 'db.php';
header('Content-Type: application/json');

$logs = [];

try {
    $pdo = Database::connect();

    // 1. Tabella Users
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    $logs[] = "Tabella 'users' creata/verificata.";

    // Inserimento utente Admin predefinito se non esiste
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    if ($stmt->fetchColumn() == 0) {
        // Password iniziale: 'admin2026'
        $hash = password_hash('admin2026', PASSWORD_DEFAULT);
        $pdo->exec("INSERT INTO users (username, password_hash) VALUES ('admin', '$hash')");
        $logs[] = "Utente 'admin' predefinito creato (password iniziale: admin2026). Potrai cambiarla dal pannello.";
    }

    // 2. Tabella Articles (Il mini-CMS)
    $pdo->exec("CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        content TEXT,
        excerpt TEXT,
        cover_image TEXT,
        category TEXT DEFAULT 'blog-e-riflessioni',
        tags TEXT,
        is_featured INTEGER DEFAULT 0,
        button_a_label TEXT,
        button_a_link TEXT,
        button_b_label TEXT,
        button_b_link TEXT,
        status TEXT DEFAULT 'draft',
        published_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    $logs[] = "Tabella 'articles' creata/verificata.";

    // 3. Tabella Media (Gestore file)
    $pdo->exec("CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        file_path TEXT NOT NULL,
        mime_type TEXT,
        size INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    $logs[] = "Tabella 'media' creata/verificata.";

    // 4. Tabella Messaggi (Form Contatti)
    $pdo->exec("CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    $logs[] = "Tabella 'messages' creata/verificata.";

    // 5. Tabella Iscritti (Newsletter)
    $pdo->exec("CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    $logs[] = "Tabella 'subscribers' creata/verificata.";

    // 6. Tabella Rate Limiting
    $pdo->exec("CREATE TABLE IF NOT EXISTS login_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_address TEXT NOT NULL,
        attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP
    )");
    $logs[] = "Tabella 'login_attempts' creata/verificata.";

    echo json_encode(["status" => "success", "message" => "Database inizializzato con successo.", "logs" => $logs]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage(), "logs" => $logs]);
}
?>

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
        // [v1.5.9] Password temporanea casuale generata al momento dell'esecuzione (nessuna password hardcoded)
        $tempPassword = bin2hex(random_bytes(12)); // 24 caratteri hex casuali, crittograficamente sicuri
        $hash = password_hash($tempPassword, PASSWORD_DEFAULT);
        $stmtInsert = $pdo->prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)");
        $stmtInsert->execute(['admin', $hash]);
        $logs[] = "Utente 'admin' creato. PASSWORD TEMPORANEA: " . $tempPassword . " — CAMBIARLA IMMEDIATAMENTE dal pannello /admin/settings dopo il primo accesso. Questa password non viene salvata da nessuna parte.";
    } else {
        $logs[] = "Tabella 'users' gia popolata. Nessun utente creato (dati esistenti preservati).";
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

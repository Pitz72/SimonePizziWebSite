<?php
require_once 'db.php';
require_once 'auth_helper.php';

Auth::check();
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$pdo = Database::connect();

if ($method === 'GET' || $method === 'POST') {
    // [v1.7.17] Auto-inizializzazione tabella app_settings se non esiste
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS app_settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        // Inizializzazione valori di default se tabella vuota
        $count = $pdo->query("SELECT COUNT(*) FROM app_settings")->fetchColumn();
        if ($count == 0) {
            $pdo->exec("INSERT IGNORE INTO app_settings (setting_key, setting_value) VALUES 
                ('backup_auto', '0'),
                ('backup_frequency', 'weekly'),
                ('backup_last_run', '')");
        }
    } catch (PDOException $e) {
        // Se non riusciamo a creare la tabella, logghiamo ma proseguiamo (fallirà dopo se manca)
    }
}

if ($method === 'GET') {
    // Recupero tutte le impostazioni app
    try {
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM app_settings");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        echo json_encode($settings);
    } catch (PDOException $e) {
        http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
    }
} 
elseif ($method === 'POST') {
    // Salvataggio impostazioni app
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        http_response_code(400); echo json_encode(['error' => 'Dati mancanti']); exit;
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)");
        foreach ($data as $key => $val) {
            $stmt->execute([$key, (string)$val]);
        }
        echo json_encode(['status' => 'success']);
    } catch (PDOException $e) {
        http_response_code(500); echo json_encode(['error' => $e->getMessage()]);
    }
}
elseif ($method === 'PUT') {
    // Aggiornamento Password
    $data = json_decode(file_get_contents('php://input'), true);
    
    $currentPassword = $data['current_password'] ?? '';
    $newPassword = $data['new_password'] ?? '';
    $userId = $_SESSION['user_id'];

    if (empty($currentPassword) || empty($newPassword)) {
        http_response_code(400); echo json_encode(['error' => 'Campi mancanti']); exit;
    }

    try {
        // Verifica vecchia password
        $stmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if ($user && password_verify($currentPassword, $user['password_hash'])) {
            // Aggiorna con nuova password hashata
            $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
            $updateStmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
            $updateStmt->execute([$newHash, $userId]);
            
            echo json_encode(['status' => 'success', 'message' => 'Password aggiornata con successo!']);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'La password attuale è errata.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Errore DB: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405); echo json_encode(['error' => 'Metodo non supportato']);
}
?>

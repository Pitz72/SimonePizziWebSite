<?php
/**
 * API Messaggi di Contatto (v1.7.8)
 *
 * POST (pubblico) — Salva il messaggio nel DB e invia email a simonepizzi.1972@proton.me
 * GET  (admin)    — Lista messaggi ricevuti (riservato)
 * PUT  ?id=N      — Marca messaggio come letto (admin)
 * DELETE ?id=N    — Elimina messaggio (admin)
 */

require_once 'db.php';
require_once 'auth_helper.php';

date_default_timezone_set('Europe/Rome');

header('Content-Type: application/json');

// ── Crea la tabella se non esiste (idempotente) ──────────────────────────────
function ensureMessagesTable(PDO $pdo): void
{
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS messages (
            id         INT AUTO_INCREMENT PRIMARY KEY,
            name       VARCHAR(120)  NOT NULL,
            email      VARCHAR(254)  NOT NULL,
            subject    VARCHAR(200)  NOT NULL DEFAULT '',
            message    TEXT          NOT NULL,
            read_at    DATETIME      DEFAULT NULL,
            created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    ");
}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET — lista messaggi (admin) ─────────────────────────────────────────────
if ($method === 'GET') {
    Auth::check();
    try {
        $pdo = Database::connect();
        ensureMessagesTable($pdo);
        $rows = $pdo->query(
            "SELECT id, name, email, subject, LEFT(message, 200) AS preview,
                    read_at, created_at
             FROM messages
             ORDER BY created_at DESC"
        )->fetchAll();
        echo json_encode($rows);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// ── POST — nuovo messaggio (pubblico) ────────────────────────────────────────
if ($method === 'POST') {
    $data    = json_decode(file_get_contents('php://input'), true) ?? [];
    $name    = trim(strip_tags($data['name']    ?? ''));
    $email   = trim(filter_var($data['email']   ?? '', FILTER_SANITIZE_EMAIL));
    $subject = trim(strip_tags($data['subject'] ?? ''));
    $message = trim(strip_tags($data['message'] ?? ''));

    // Validazione
    if (empty($name) || strlen($name) < 2) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Il campo nome è obbligatorio (min. 2 caratteri).']);
        exit;
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Indirizzo email non valido.']);
        exit;
    }
    if (empty($message) || strlen($message) < 10) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Il messaggio è troppo breve (min. 10 caratteri).']);
        exit;
    }
    if (empty($subject)) $subject = 'Nessun oggetto';

    try {
        $pdo = Database::connect();
        ensureMessagesTable($pdo);

        // Rate limiting basilare: max 10 messaggi globali in 15 minuti (per evitare spam massivo)
        $stmt_limit = $pdo->query("SELECT COUNT(*) FROM messages WHERE created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)");
        $recent_count = (int)$stmt_limit->fetchColumn();

        if ($recent_count >= 10) {
            http_response_code(429);
            echo json_encode(['status' => 'error', 'message' => 'Troppe richieste. Riprova tra 15 minuti.']);
            exit;
        }

        // Salva nel DB
        $stmt = $pdo->prepare(
            "INSERT INTO messages (name, email, subject, message)
             VALUES (:name, :email, :subject, :message)"
        );
        $stmt->execute([
            ':name'    => $name,
            ':email'   => $email,
            ':subject' => $subject,
            ':message' => $message,
        ]);

        // Invia email di notifica
        sendNotificationEmail($name, $email, $subject, $message);

        echo json_encode([
            'status'  => 'success',
            'message' => 'Messaggio inviato! Ti risponderò al più presto.',
        ]);
    } catch (Throwable $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Errore server: ' . $e->getMessage()]);
    }
    exit;
}

// ── PUT — marca come letto (admin) ───────────────────────────────────────────
if ($method === 'PUT') {
    Auth::check();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID mancante.']);
        exit;
    }
    try {
        $pdo = Database::connect();
        $pdo->prepare("UPDATE messages SET read_at = NOW() WHERE id = :id AND read_at IS NULL")
            ->execute([':id' => $id]);
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// ── DELETE — elimina messaggio (admin) ───────────────────────────────────────
if ($method === 'DELETE') {
    Auth::check();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID mancante.']);
        exit;
    }
    try {
        $pdo = Database::connect();
        $pdo->prepare("DELETE FROM messages WHERE id = :id")->execute([':id' => $id]);
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metodo non supportato.']);

// ── Helper: email di notifica al proprietario ────────────────────────────────
function sendNotificationEmail(
    string $senderName,
    string $senderEmail,
    string $subject,
    string $messageBody
): void {
    $to      = 'simonepizzi.1972@proton.me';
    $subjectEncoded = '=?UTF-8?B?' . base64_encode("[simonepizzi.it] Nuovo messaggio: {$subject}") . '?=';
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host    = $_SERVER['HTTP_HOST'] ?? 'simonepizzi.runtimeradio.it';
    $from    = 'noreply@' . $host;
    $safeMsg = nl2br(htmlspecialchars($messageBody, ENT_QUOTES, 'UTF-8'));

    $html = '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8">
<title>Nuovo messaggio</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:\'Segoe UI\',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center">
  <table width="580" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
    <tr><td style="background:#111;padding:28px 40px;border-bottom:1px solid #1a1a1a;">
      <p style="margin:0;color:#22c55e;font-weight:700;font-size:16px;letter-spacing:2px;text-transform:uppercase;">Simone Pizzi — Form Contatti</p>
    </td></tr>
    <tr><td style="padding:36px 40px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:12px;">
          <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Da</p>
          <p style="margin:4px 0 0;color:#fff;font-size:15px;font-weight:600;">' . htmlspecialchars($senderName) . ' &lt;<a href="mailto:' . htmlspecialchars($senderEmail) . '" style="color:#22c55e;">' . htmlspecialchars($senderEmail) . '</a>&gt;</p>
        </td></tr>
        <tr><td style="padding-bottom:20px;border-bottom:1px solid #1a1a1a;">
          <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Oggetto</p>
          <p style="margin:4px 0 0;color:#fff;font-size:15px;font-weight:600;">' . htmlspecialchars($subject) . '</p>
        </td></tr>
        <tr><td style="padding-top:20px;">
          <p style="margin:0;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Messaggio</p>
          <p style="margin:8px 0 0;color:#d1d5db;font-size:15px;line-height:1.7;">' . $safeMsg . '</p>
        </td></tr>
      </table>
      <table cellpadding="0" cellspacing="0" style="margin-top:28px;"><tr><td>
        <a href="mailto:' . htmlspecialchars($senderEmail) . '"
           style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
          Rispondi a ' . htmlspecialchars($senderName) . '
        </a>
      </td></tr></table>
    </td></tr>
    <tr><td style="padding:20px 40px;border-top:1px solid #1a1a1a;">
      <p style="margin:0;color:#4b5563;font-size:12px;">&copy; ' . date('Y') . ' Simone Pizzi &middot; ' . $host . '</p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>';

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Simone Pizzi <{$from}>\r\n";
    $headers .= "Reply-To: {$senderEmail}\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    mail($to, $subjectEncoded, $html, $headers);
}

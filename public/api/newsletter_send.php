<?php
/**
 * API Newsletter Send (v1.7.4)
 *
 * POST (admin) — Invia newsletter a tutti gli iscritti confermati
 * GET  (admin) — Storico invii (newsletter_sends)
 */

require_once 'db.php';
require_once 'auth_helper.php';

date_default_timezone_set('Europe/Rome');

$method = $_SERVER['REQUEST_METHOD'];

// ──────────────────────────────────────────────────────────────────────────────
// GET — storico newsletter inviate
// ──────────────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    header('Content-Type: application/json');
    Auth::check();
    try {
        $pdo  = Database::connect();
        $rows = $pdo->query(
            "SELECT id, subject, sent_at, recipient_count FROM newsletter_sends ORDER BY sent_at DESC LIMIT 50"
        )->fetchAll();
        echo json_encode($rows);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// ──────────────────────────────────────────────────────────────────────────────
// POST — invio newsletter
// ──────────────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    header('Content-Type: application/json');
    Auth::check();

    $data    = json_decode(file_get_contents('php://input'), true) ?? [];
    $subject = trim($data['subject'] ?? '');
    $body    = trim($data['body'] ?? '');

    if (empty($subject) || empty($body)) {
        http_response_code(400);
        echo json_encode(['error' => 'Oggetto e corpo sono obbligatori.']);
        exit;
    }

    try {
        $pdo = Database::connect();

        // Recupera tutti i confermati con il loro unsubscribe_token
        $stmt = $pdo->query(
            "SELECT email, name, unsubscribe_token FROM subscribers WHERE status='confirmed'"
        );
        $recipients = $stmt->fetchAll();

        if (empty($recipients)) {
            echo json_encode(['status' => 'ok', 'sent' => 0, 'message' => 'Nessun iscritto confermato.']);
            exit;
        }

        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host     = $_SERVER['HTTP_HOST'];
        $from     = 'newsletter@' . $host;
        $replyTo  = 'simonepizzi.1972@proton.me';

        $sent = 0;
        foreach ($recipients as $r) {
            $html = buildNewsletterHtml($subject, $body, $r['name'] ?: 'Amico', $r['unsubscribe_token'], $protocol, $host);
            $encodedSubject = '=?UTF-8?B?' . base64_encode($subject . ' — Simone Pizzi') . '?=';

            $headers  = "MIME-Version: 1.0\r\n";
            $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
            $headers .= "From: Simone Pizzi <{$from}>\r\n";
            $headers .= "Reply-To: {$replyTo}\r\n";
            $headers .= "X-Mailer: PHP/" . phpversion();

            if (mail($r['email'], $encodedSubject, $html, $headers)) {
                $sent++;
            }
        }

        // Salva nell'archivio invii
        $pdo->prepare(
            "INSERT INTO newsletter_sends (subject, body, recipient_count) VALUES (:subject, :body, :count)"
        )->execute([':subject' => $subject, ':body' => $body, ':count' => $sent]);

        echo json_encode(['status' => 'success', 'sent' => $sent]);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metodo non supportato.']);

// ──────────────────────────────────────────────────────────────────────────────
// Helper — template HTML newsletter (dark theme)
// ──────────────────────────────────────────────────────────────────────────────
function buildNewsletterHtml(
    string $subject,
    string $body,
    string $recipientName,
    string $unsubToken,
    string $protocol,
    string $host
): string {
    $unsubLink = $protocol . '://' . $host . '/newsletter/disiscritto?token=' . urlencode($unsubToken);
    $siteLink  = $protocol . '://' . $host;

    // Converte newline in <br> per il corpo (testo semplice → HTML base)
    // Se il body contiene già tag HTML li rispettiamo, altrimenti convertiamo
    $isHtml = preg_match('/<[a-zA-Z][\s\S]*>/', $body);
    $bodyHtml = $isHtml ? $body : nl2br(htmlspecialchars($body));

    return '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8">
<title>' . htmlspecialchars($subject) . '</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:\'Segoe UI\',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">

    <!-- Header -->
    <tr><td style="background:#111;padding:28px 40px;border-bottom:1px solid #1a1a1a;">
      <a href="' . $siteLink . '" style="text-decoration:none;">
        <span style="color:#22c55e;font-weight:700;font-size:18px;letter-spacing:2px;text-transform:uppercase;">Simone Pizzi</span>
        <span style="color:#4b5563;font-size:13px;margin-left:12px;">Newsletter</span>
      </a>
    </td></tr>

    <!-- Titolo -->
    <tr><td style="padding:40px 40px 0;">
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;line-height:1.3;">
        ' . htmlspecialchars($subject) . '
      </h1>
      <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">Ciao, ' . htmlspecialchars($recipientName) . '!</p>
    </td></tr>

    <!-- Corpo -->
    <tr><td style="padding:32px 40px;color:#d1d5db;font-size:16px;line-height:1.8;">
      ' . $bodyHtml . '
    </td></tr>

    <!-- Separatore -->
    <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #1e1e1e;margin:0;"></td></tr>

    <!-- Footer -->
    <tr><td style="padding:24px 40px;">
      <p style="margin:0;color:#4b5563;font-size:12px;line-height:1.6;">
        Hai ricevuto questa email perché sei iscritto alla newsletter di
        <a href="' . $siteLink . '" style="color:#22c55e;text-decoration:none;">simonepizzi.runtimeradio.it</a>.<br>
        <a href="' . htmlspecialchars($unsubLink) . '" style="color:#6b7280;text-decoration:underline;">Cancella iscrizione</a>
        &nbsp;·&nbsp; &copy; ' . date('Y') . ' Simone Pizzi
      </p>
    </td></tr>

  </table>
</td></tr></table>
</body></html>';
}

<?php
/**
 * API Newsletter Subscribers (v1.7.4)
 *
 * GET  ?action=confirm&token=XXX  — Conferma iscrizione (link da email) — pubblico
 * GET  ?action=unsubscribe&token=XXX — Disiscrizione (link da email) — pubblico
 * GET  (admin)                    — Lista iscritti con stats
 * POST (pubblico)                 — Nuova iscrizione con double opt-in
 * DELETE ?id=N (admin)            — Elimina iscritto
 */

require_once 'db.php';
require_once 'auth_helper.php';

date_default_timezone_set('Europe/Rome');

$method = $_SERVER['REQUEST_METHOD'];

// ──────────────────────────────────────────────────────────────────────────────
// GET — conferma, disiscrizione, lista admin
// ──────────────────────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    $token  = trim($_GET['token'] ?? '');

    // Conferma iscrizione via token (link da email di conferma)
    if ($action === 'confirm') {
        header('Content-Type: application/json');
        if (empty($token)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Token mancante.']);
            exit;
        }
        try {
            $pdo  = Database::connect();
            $stmt = $pdo->prepare("SELECT id, status FROM subscribers WHERE confirm_token = :token LIMIT 1");
            $stmt->execute([':token' => $token]);
            $row  = $stmt->fetch();

            if (!$row) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Token non valido o già utilizzato.']);
                exit;
            }
            if ($row['status'] === 'confirmed') {
                echo json_encode(['status' => 'already', 'message' => 'Iscrizione già confermata.']);
                exit;
            }

            $upd = $pdo->prepare(
                "UPDATE subscribers SET status='confirmed', confirmed_at=NOW(), confirm_token=NULL WHERE id=:id"
            );
            $upd->execute([':id' => $row['id']]);
            echo json_encode(['status' => 'success', 'message' => 'Iscrizione confermata!']);
        } catch (Throwable $e) {
            http_response_code(500);
            error_log(basename(__FILE__, '.php') . ' error: ' . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Errore interno del server.']);
        }
        exit;
    }

    // Disiscrizione via token (link in fondo a ogni newsletter)
    if ($action === 'unsubscribe') {
        header('Content-Type: application/json');
        if (empty($token)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Token mancante.']);
            exit;
        }
        try {
            $pdo  = Database::connect();
            $stmt = $pdo->prepare("SELECT id FROM subscribers WHERE unsubscribe_token = :token LIMIT 1");
            $stmt->execute([':token' => $token]);
            $row  = $stmt->fetch();

            if (!$row) {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Token non valido.']);
                exit;
            }

            $upd = $pdo->prepare("UPDATE subscribers SET status='unsubscribed' WHERE id=:id");
            $upd->execute([':id' => $row['id']]);
            echo json_encode(['status' => 'success', 'message' => 'Disiscrizione effettuata.']);
        } catch (Throwable $e) {
            http_response_code(500);
            error_log(basename(__FILE__, '.php') . ' error: ' . $e->getMessage());
            echo json_encode(['status' => 'error', 'message' => 'Errore interno del server.']);
        }
        exit;
    }

    // Lista admin
    header('Content-Type: application/json');
    Auth::check();
    try {
        $pdo = Database::connect();

        $total      = (int)$pdo->query("SELECT COUNT(*) FROM subscribers")->fetchColumn();
        $confirmed  = (int)$pdo->query("SELECT COUNT(*) FROM subscribers WHERE status='confirmed'")->fetchColumn();
        $pending    = (int)$pdo->query("SELECT COUNT(*) FROM subscribers WHERE status='pending'")->fetchColumn();
        $unsub      = (int)$pdo->query("SELECT COUNT(*) FROM subscribers WHERE status='unsubscribed'")->fetchColumn();

        $rows = $pdo->query(
            "SELECT id, email, name, status, confirmed_at, created_at FROM subscribers ORDER BY created_at DESC"
        )->fetchAll();

        echo json_encode([
            'stats' => compact('total', 'confirmed', 'pending', 'unsub'),
            'subscribers' => $rows,
        ]);
    } catch (Throwable $e) {
        http_response_code(500);
        error_log(basename(__FILE__, '.php') . ' error: ' . $e->getMessage());
        echo json_encode(['error' => 'Errore interno del server.']);
    }
    exit;
}

// ──────────────────────────────────────────────────────────────────────────────
// POST — nuova iscrizione (pubblico, double opt-in o admin diretto)
// ──────────────────────────────────────────────────────────────────────────────
if ($method === 'POST') {
    header('Content-Type: application/json');
    $data  = json_decode(file_get_contents('php://input'), true) ?? [];
    $email = trim(filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL));
    $name  = trim(strip_tags($data['name'] ?? ''));

    // Verifica se l'azione è compiuta da un admin per forzare la conferma
    $isAdmin      = isset($_SESSION['user_id']);
    $forceConfirm = $isAdmin && isset($data['force_confirm']) && $data['force_confirm'] === true;

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Indirizzo email non valido.']);
        exit;
    }

    try {
        $pdo = Database::connect();

        // Controlla se esiste già
        $check = $pdo->prepare("SELECT id, status FROM subscribers WHERE email = :email LIMIT 1");
        $check->execute([':email' => $email]);
        $existing = $check->fetch();

        if ($existing) {
            if ($existing['status'] === 'confirmed') {
                echo json_encode(['status' => 'already', 'message' => 'Questa email è già iscritta.']);
            } else {
                if ($forceConfirm) {
                    // Approva forzatamente se esistente ma pending/unsub
                    $pdo->prepare("UPDATE subscribers SET status='confirmed', confirmed_at=NOW(), confirm_token=NULL WHERE id=:id")
                        ->execute([':id' => $existing['id']]);
                    echo json_encode(['status' => 'success', 'message' => 'Iscrizione esistente confermata manualmente.']);
                } else {
                    // Re-invia email di conferma standard
                    $ct = bin2hex(random_bytes(32));
                    $pdo->prepare("UPDATE subscribers SET confirm_token=:ct, status='pending' WHERE id=:id")
                        ->execute([':ct' => $ct, ':id' => $existing['id']]);
                    sendConfirmEmail($email, $name ?: 'Amico', $ct);
                    echo json_encode(['status' => 'pending', 'message' => 'Controlla la tua email per confermare l\'iscrizione.']);
                }
            }
            exit;
        }

        // Nuova iscrizione
        $confirmToken     = $forceConfirm ? null : bin2hex(random_bytes(32));
        $unsubscribeToken = bin2hex(random_bytes(32));
        $status           = $forceConfirm ? 'confirmed' : 'pending';
        $confirmedAt      = $forceConfirm ? date('Y-m-d H:i:s') : null;

        $stmt = $pdo->prepare(
            "INSERT INTO subscribers (email, name, status, confirm_token, unsubscribe_token, confirmed_at)
             VALUES (:email, :name, :status, :ct, :ut, :ca)"
        );
        $stmt->execute([
            ':email'  => $email,
            ':name'   => $name ?: null,
            ':status' => $status,
            ':ct'     => $confirmToken,
            ':ut'     => $unsubscribeToken,
            ':ca'     => $confirmedAt
        ]);

        if (!$forceConfirm) {
            sendConfirmEmail($email, $name ?: 'Amico', $confirmToken);
            echo json_encode([
                'status'  => 'success',
                'message' => 'Quasi fatto! Controlla la tua email e clicca il link per confermare l\'iscrizione.',
            ]);
        } else {
            echo json_encode([
                'status'  => 'success',
                'message' => 'Iscritto aggiunto correttamente come confermato.',
            ]);
        }
    } catch (Throwable $e) {
        http_response_code(500);
        error_log(basename(__FILE__, '.php') . ' error: ' . $e->getMessage());
        echo json_encode(['status' => 'error', 'message' => 'Errore interno del server.']);
    }
    exit;
}

// ──────────────────────────────────────────────────────────────────────────────
// PATCH — approvazione manuale (admin)
// ──────────────────────────────────────────────────────────────────────────────
if ($method === 'PATCH') {
    header('Content-Type: application/json');
    Auth::check();
    $data = json_decode(file_get_contents('php://input'), true) ?? [];
    $id   = (int)($data['id'] ?? 0);

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID mancante.']);
        exit;
    }

    try {
        $pdo = Database::connect();
        $upd = $pdo->prepare(
            "UPDATE subscribers SET status='confirmed', confirmed_at=NOW(), confirm_token=NULL WHERE id=:id"
        );
        $upd->execute([':id' => $id]);
        echo json_encode(['status' => 'success', 'message' => 'Iscritto approvato con successo.']);
    } catch (Throwable $e) {
        http_response_code(500);
        error_log(basename(__FILE__, '.php') . ' error: ' . $e->getMessage());
        echo json_encode(['error' => 'Errore interno del server.']);
    }
    exit;
}

// ──────────────────────────────────────────────────────────────────────────────
// DELETE — elimina iscritto (admin)
// ──────────────────────────────────────────────────────────────────────────────
if ($method === 'DELETE') {
    header('Content-Type: application/json');
    Auth::check();
    $id = (int)($_GET['id'] ?? 0);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID mancante.']);
        exit;
    }
    try {
        $pdo = Database::connect();
        $pdo->prepare("DELETE FROM subscribers WHERE id=:id")->execute([':id' => $id]);
        echo json_encode(['status' => 'success']);
    } catch (Throwable $e) {
        http_response_code(500);
        error_log(basename(__FILE__, '.php') . ' error: ' . $e->getMessage());
        echo json_encode(['error' => 'Errore interno del server.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metodo non supportato.']);

// ──────────────────────────────────────────────────────────────────────────────
// Helper — email di conferma iscrizione
// ──────────────────────────────────────────────────────────────────────────────
function sendConfirmEmail(string $email, string $name, string $token): void
{
    $protocol    = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host        = $_SERVER['HTTP_HOST'];
    $confirmLink = $protocol . '://' . $host . '/newsletter/confermato?token=' . urlencode($token);
    $from        = 'newsletter@' . $host;
    $subject     = '=?UTF-8?B?' . base64_encode('Conferma la tua iscrizione — Simone Pizzi') . '?=';

    $html = '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8">
<title>Conferma iscrizione</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:\'Segoe UI\',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center">
  <table width="580" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
    <tr><td style="background:#111;padding:32px 40px;border-bottom:1px solid #1a1a1a;">
      <p style="margin:0;color:#22c55e;font-weight:700;font-size:18px;letter-spacing:2px;text-transform:uppercase;">Simone Pizzi</p>
    </td></tr>
    <tr><td style="padding:40px;">
      <h1 style="margin:0 0 16px;color:#fff;font-size:24px;font-weight:700;">Ciao, ' . htmlspecialchars($name) . '!</h1>
      <p style="margin:0 0 24px;color:#9ca3af;font-size:16px;line-height:1.6;">
        Hai richiesto di iscriverti alla newsletter di <strong style="color:#fff;">simonepizzi.runtimeradio.it</strong>.<br>
        Clicca il pulsante qui sotto per confermare e iniziare a ricevere gli aggiornamenti.
      </p>
      <table cellpadding="0" cellspacing="0"><tr><td>
        <a href="' . htmlspecialchars($confirmLink) . '"
           style="display:inline-block;background:#22c55e;color:#000;font-weight:700;font-size:16px;
                  padding:14px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.5px;">
          Conferma Iscrizione
        </a>
      </td></tr></table>
      <p style="margin:32px 0 0;color:#6b7280;font-size:13px;line-height:1.5;">
        Se non sei stato tu a richiedere l\'iscrizione, ignora questa email.<br>
        Il link scade se non viene utilizzato. Non verrà inviato nulla prima della conferma.
      </p>
    </td></tr>
    <tr><td style="padding:24px 40px;border-top:1px solid #1a1a1a;">
      <p style="margin:0;color:#4b5563;font-size:12px;">
        &copy; ' . date('Y') . ' Simone Pizzi · simonepizzi.runtimeradio.it
      </p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>';

    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Simone Pizzi <{$from}>\r\n";
    $headers .= "Reply-To: {$from}\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();

    mail($email, $subject, $html, $headers);
}

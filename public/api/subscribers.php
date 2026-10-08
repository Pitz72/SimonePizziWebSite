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

// ──────────────────────────────────────────────────────────────────────────────
// POST — iscrizione dal sito. Prima dei require della vecchia API: questo ramo
// non deve dipendere dalla connessione MySQL di api/db.php.
// Il consenso è una casella da spuntare, e la prova si scrive nella libreria
// (lib/newsletter.php). Il GET più sotto resta per i link delle email già inviate.
// ──────────────────────────────────────────────────────────────────────────────
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    header('Content-Type: application/json');
    require_once dirname(__DIR__) . '/lib/avvio.php';
    require_once dirname(__DIR__) . '/lib/newsletter.php';

    if (!newsletter_richiesta_ammessa($_SERVER['REMOTE_ADDR'] ?? 'sconosciuto')) {
        http_response_code(429);
        echo json_encode(['status' => 'error', 'message' => 'Troppe richieste. Riprova tra qualche minuto.']);
        exit;
    }
    $data     = json_decode(file_get_contents('php://input'), true) ?? [];
    $consenso = in_array($data['consent'] ?? null, [true, '1', 1, 'on'], true);
    [$ok, $messaggio] = newsletter_iscrivi((string)($data['email'] ?? ''), (string)($data['name'] ?? ''), $consenso, 'sito');
    if (!$ok) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => $messaggio]);
        exit;
    }
    echo json_encode(['status' => 'success', 'message' => $messaggio]);
    exit;
}

require_once 'db.php';
require_once 'auth_helper.php';
require_once dirname(__DIR__) . '/lib/mailer.php';

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

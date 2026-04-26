<?php
/**
 * API Reazioni Articoli v1.0.0
 * 
 * GET  ?article_id=X  → Restituisce i conteggi di tutte le reazioni per l'articolo
 * POST {article_id, reaction} → Aggiunge o rimuove (toggle) una reazione
 * 
 * Protezione anti-spam:
 * - UNIQUE KEY (article_id, voter_hash, reaction) sul DB impedisce duplicati
 * - voter_hash = SHA256(IP + User-Agent) — anonimo e GDPR-compliant
 * - Rate limiting: max 20 azioni per IP al minuto
 */

require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// Reazioni consentite (corrispondono alle chiavi nel frontend)
const ALLOWED_REACTIONS = ['thumb', 'heart', 'fire', 'think', 'game'];

$pdo    = Database::connect();
$method = $_SERVER['REQUEST_METHOD'];

// Hash anonimo del visitatore (nessun dato personale memorizzato)
$voter_hash = hash('sha256',
    ($_SERVER['REMOTE_ADDR'] ?? 'unknown') .
    ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown')
);

// ─── GET: Conteggi reazioni per un articolo ───────────────────────────────────
if ($method === 'GET') {
    $article_id = isset($_GET['article_id']) ? (int)$_GET['article_id'] : 0;

    if (!$article_id) {
        http_response_code(400);
        echo json_encode(['error' => 'article_id mancante']);
        exit;
    }

    // Conteggi per ogni tipo di reazione
    $stmt = $pdo->prepare(
        "SELECT reaction, COUNT(*) as count
         FROM article_reactions
         WHERE article_id = ?
         GROUP BY reaction"
    );
    $stmt->execute([$article_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Struttura risposta con tutti i tipi inizializzati a 0
    $counts = array_fill_keys(ALLOWED_REACTIONS, 0);
    foreach ($rows as $row) {
        if (isset($counts[$row['reaction']])) {
            $counts[$row['reaction']] = (int)$row['count'];
        }
    }

    // Reazioni già date da questo visitatore
    $stmtOwn = $pdo->prepare(
        "SELECT reaction FROM article_reactions
         WHERE article_id = ? AND voter_hash = ?"
    );
    $stmtOwn->execute([$article_id, $voter_hash]);
    $myReactions = $stmtOwn->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'counts'       => $counts,
        'my_reactions' => $myReactions
    ]);
    exit;
}

// ─── POST: Toggle reazione (aggiungi o rimuovi) ───────────────────────────────
if ($method === 'POST') {
    $data       = json_decode(file_get_contents('php://input'), true);
    $article_id = isset($data['article_id']) ? (int)$data['article_id'] : 0;
    $reaction   = trim($data['reaction'] ?? '');

    if (!$article_id || !$reaction) {
        http_response_code(400);
        echo json_encode(['error' => 'article_id e reaction sono obbligatori']);
        exit;
    }

    if (!in_array($reaction, ALLOWED_REACTIONS, true)) {
        http_response_code(400);
        echo json_encode(['error' => 'Tipo di reazione non valido']);
        exit;
    }

    // Rate limiting: max 20 azioni per IP nell'ultimo minuto
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $stmtRate = $pdo->prepare(
        "SELECT COUNT(*) FROM article_reactions
         WHERE voter_hash = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)"
    );
    $stmtRate->execute([$voter_hash]);
    if ((int)$stmtRate->fetchColumn() >= 20) {
        http_response_code(429);
        echo json_encode(['error' => 'Troppe richieste. Attendi un momento.']);
        exit;
    }

    // Verifica se la reazione esiste già (per il toggle)
    $stmtCheck = $pdo->prepare(
        "SELECT id FROM article_reactions
         WHERE article_id = ? AND voter_hash = ? AND reaction = ?"
    );
    $stmtCheck->execute([$article_id, $voter_hash, $reaction]);
    $existing = $stmtCheck->fetchColumn();

    if ($existing) {
        // Rimuovi (toggle off)
        $stmtDel = $pdo->prepare(
            "DELETE FROM article_reactions
             WHERE article_id = ? AND voter_hash = ? AND reaction = ?"
        );
        $stmtDel->execute([$article_id, $voter_hash, $reaction]);
        $action = 'removed';
    } else {
        // Aggiungi
        $stmtIns = $pdo->prepare(
            "INSERT IGNORE INTO article_reactions (article_id, reaction, voter_hash)
             VALUES (?, ?, ?)"
        );
        $stmtIns->execute([$article_id, $reaction, $voter_hash]);
        $action = 'added';
    }

    // Restituisce i conteggi aggiornati
    $stmtCount = $pdo->prepare(
        "SELECT reaction, COUNT(*) as count
         FROM article_reactions
         WHERE article_id = ?
         GROUP BY reaction"
    );
    $stmtCount->execute([$article_id]);
    $rows = $stmtCount->fetchAll(PDO::FETCH_ASSOC);

    $counts = array_fill_keys(ALLOWED_REACTIONS, 0);
    foreach ($rows as $row) {
        if (isset($counts[$row['reaction']])) {
            $counts[$row['reaction']] = (int)$row['count'];
        }
    }

    $stmtOwn = $pdo->prepare(
        "SELECT reaction FROM article_reactions
         WHERE article_id = ? AND voter_hash = ?"
    );
    $stmtOwn->execute([$article_id, $voter_hash]);
    $myReactions = $stmtOwn->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'action'       => $action,
        'counts'       => $counts,
        'my_reactions' => $myReactions
    ]);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Metodo non consentito']);
?>

<?php
require_once 'db.php';
require_once 'auth_helper.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST');

$pdo = Database::connect();
$method = $_SERVER['REQUEST_METHOD'];

date_default_timezone_set('Europe/Rome');

try {
    if ($method === 'POST') {
        // Tracking pubblico (nessun Auth richiesto): view o click
        $data = json_decode(file_get_contents('php://input'), true);
        $type       = $data['type']       ?? '';
        $article_id = isset($data['article_id']) ? (int)$data['article_id'] : 0;

        if (!$article_id) {
            http_response_code(400);
            echo json_encode(['error' => 'article_id richiesto']);
            exit;
        }

        if ($type === 'view') {
            // Dedup: stesso IP (hashed) + stesso articolo + stesso giorno -> non conta
            $ip_hash   = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . date('Y-m-d'));
            $view_date = date('Y-m-d');

            $check = $pdo->prepare("SELECT COUNT(*) FROM article_views WHERE article_id=? AND ip_hash=? AND view_date=?");
            $check->execute([$article_id, $ip_hash, $view_date]);

            if ((int)$check->fetchColumn() === 0) {
                $stmt = $pdo->prepare("INSERT INTO article_views (article_id, ip_hash, view_date) VALUES (?, ?, ?)");
                $stmt->execute([$article_id, $ip_hash, $view_date]);
            }

            echo json_encode(['status' => 'ok']);
        }
        elseif ($type === 'click') {
            $button_label = substr(trim($data['button_label'] ?? 'unknown'), 0, 100);
            $stmt = $pdo->prepare("INSERT INTO cta_clicks (article_id, button_label) VALUES (?, ?)");
            $stmt->execute([$article_id, $button_label]);
            echo json_encode(['status' => 'ok']);
        }
        else {
            http_response_code(400);
            echo json_encode(['error' => "type deve essere 'view' o 'click'"]);
        }
    }
    elseif ($method === 'GET') {
        Auth::check();

        // ── Modalità per-articolo: GET ?article_id=X&period=30 ──────────────────
        if (isset($_GET['article_id'])) {
            $article_id = (int)$_GET['article_id'];
            $period     = min((int)($_GET['period'] ?? 30), 365); // max 365 giorni

            // Visualizzazioni giornaliere nell'arco del periodo
            $stmt = $pdo->prepare("
                SELECT view_date, COUNT(*) AS count
                FROM article_views
                WHERE article_id = ?
                  AND view_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                GROUP BY view_date
                ORDER BY view_date ASC
            ");
            $stmt->execute([$article_id, $period]);
            $daily_views = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Totale visualizzazioni dell'articolo
            $stmtTotal = $pdo->prepare("SELECT COUNT(*) FROM article_views WHERE article_id = ?");
            $stmtTotal->execute([$article_id]);
            $total = (int)$stmtTotal->fetchColumn();

            echo json_encode([
                'article_id'  => $article_id,
                'period_days' => $period,
                'total_views' => $total,
                'daily_views' => $daily_views,
            ]);
            exit;
        }

        // ── Modalità globale (Dashboard) ────────────────────────────────────────

        // Top 10 articoli per visualizzazioni
        $top_articles = $pdo->query("
            SELECT a.id, a.title, a.slug, COUNT(av.id) AS view_count
            FROM articles a
            LEFT JOIN article_views av ON a.id = av.article_id
            WHERE a.status = 'published'
            GROUP BY a.id
            ORDER BY view_count DESC
            LIMIT 10
        ")->fetchAll();

        $total_views  = (int)$pdo->query("SELECT COUNT(*) FROM article_views")->fetchColumn();
        $total_clicks = (int)$pdo->query("SELECT COUNT(*) FROM cta_clicks")->fetchColumn();
        $total_reactions = (int)$pdo->query("SELECT COUNT(*) FROM article_reactions")->fetchColumn();

        // Click raggruppati per etichetta bottone
        $clicks_by_button = $pdo->query("
            SELECT button_label, COUNT(*) AS count
            FROM cta_clicks
            GROUP BY button_label
            ORDER BY count DESC
            LIMIT 10
        ")->fetchAll();

        // Reazioni raggruppate per tipo
        $reactions_by_type = $pdo->query("
            SELECT reaction, COUNT(*) AS count
            FROM article_reactions
            GROUP BY reaction
            ORDER BY count DESC
        ")->fetchAll();

        // Top articoli per reazioni
        $top_articles_by_reactions = $pdo->query("
            SELECT a.id, a.title, a.slug, COUNT(ar.id) AS reaction_count
            FROM articles a
            JOIN article_reactions ar ON a.id = ar.article_id
            GROUP BY a.id
            ORDER BY reaction_count DESC
            LIMIT 10
        ")->fetchAll();

        // Visualizzazioni giornaliere ultimi 7 giorni
        $weekly_views = $pdo->query("
            SELECT view_date, COUNT(*) AS count
            FROM article_views
            WHERE view_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            GROUP BY view_date
            ORDER BY view_date ASC
        ")->fetchAll();

        echo json_encode([
            'total_views'               => $total_views,
            'total_clicks'              => $total_clicks,
            'total_reactions'           => $total_reactions,
            'top_articles'              => $top_articles,
            'top_articles_by_reactions' => $top_articles_by_reactions,
            'clicks_by_button'          => $clicks_by_button,
            'reactions_by_type'         => $reactions_by_type,
            'weekly_views'              => $weekly_views,
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

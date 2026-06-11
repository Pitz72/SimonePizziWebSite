<?php
require_once 'db.php';
require_once 'auth_helper.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST');

$pdo = Database::connect();
$method = $_SERVER['REQUEST_METHOD'];

date_default_timezone_set('Europe/Rome');

// [v1.19.0] Rimossa la migrazione idempotente (ALTER TABLE a ogni richiesta pubblica):
// le colonne ip_hash e clicked_at esistono dalla v1.x. Le migrazioni vivono in scripts/.

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

        // [v1.19.0] L'articolo deve esistere: evita di gonfiare il DB con ID inventati
        $existsStmt = $pdo->prepare("SELECT COUNT(*) FROM articles WHERE id = ?");
        $existsStmt->execute([$article_id]);
        if ((int)$existsStmt->fetchColumn() === 0) {
            http_response_code(400);
            echo json_encode(['error' => 'article_id non valido']);
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
            // Rate limiting per-IP: max 10 click per articolo al minuto
            $ip_hash = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . date('Y-m-d H:i'));
            $stmtRate = $pdo->prepare(
                "SELECT COUNT(*) FROM cta_clicks
                 WHERE article_id = ? AND ip_hash = ? AND clicked_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)"
            );
            $stmtRate->execute([$article_id, $ip_hash]);
            if ((int)$stmtRate->fetchColumn() >= 10) {
                echo json_encode(['status' => 'ok']); // risposta neutra: non riveliamo il blocco
                exit;
            }

            $button_label = substr(trim($data['button_label'] ?? 'unknown'), 0, 100);
            $stmt = $pdo->prepare("INSERT INTO cta_clicks (article_id, button_label, ip_hash) VALUES (?, ?, ?)");
            $stmt->execute([$article_id, $button_label, $ip_hash]);
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

        // [v1.19.0] Periodo selezionabile per la serie giornaliera (7/30/90 giorni)
        $period = (int)($_GET['period'] ?? 30);
        if (!in_array($period, [7, 30, 90], true)) {
            $period = 30;
        }

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

        // ── [v1.19.0] Statistiche estese ────────────────────────────────────────

        // Serie giornaliera sul periodo selezionato (7/30/90 giorni)
        $stmtDaily = $pdo->prepare("
            SELECT view_date, COUNT(*) AS count
            FROM article_views
            WHERE view_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
            GROUP BY view_date
            ORDER BY view_date ASC
        ");
        $stmtDaily->execute([$period - 1]);
        $daily_views = $stmtDaily->fetchAll(PDO::FETCH_ASSOC);

        // Views di oggi e di ieri
        $views_today = (int)$pdo->query("
            SELECT COUNT(*) FROM article_views WHERE view_date = CURDATE()
        ")->fetchColumn();
        $views_yesterday = (int)$pdo->query("
            SELECT COUNT(*) FROM article_views WHERE view_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        ")->fetchColumn();

        // Confronto: ultimi 7 giorni vs 7 precedenti
        $views_last_7 = (int)$pdo->query("
            SELECT COUNT(*) FROM article_views
            WHERE view_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        ")->fetchColumn();
        $views_prev_7 = (int)$pdo->query("
            SELECT COUNT(*) FROM article_views
            WHERE view_date >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
              AND view_date <  DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        ")->fetchColumn();

        // Visitatori unici (ip_hash distinti) nel periodo selezionato
        $stmtUnique = $pdo->prepare("
            SELECT COUNT(DISTINCT ip_hash) FROM article_views
            WHERE view_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        ");
        $stmtUnique->execute([$period - 1]);
        $unique_visitors = (int)$stmtUnique->fetchColumn();

        // Contenuti: articoli pubblicati/bozze, progetti visibili
        $published_articles = (int)$pdo->query("SELECT COUNT(*) FROM articles WHERE status = 'published'")->fetchColumn();
        $draft_articles     = (int)$pdo->query("SELECT COUNT(*) FROM articles WHERE status = 'draft'")->fetchColumn();
        $visible_projects   = 0;
        try {
            $visible_projects = (int)$pdo->query("SELECT COUNT(*) FROM projects WHERE is_visible = 1")->fetchColumn();
        } catch (PDOException $_) { /* tabella non ancora migrata */ }

        // Newsletter: confermati, pending, nuovi negli ultimi 30 giorni
        $newsletter = ['confirmed' => 0, 'pending' => 0, 'new_last_30' => 0];
        try {
            $newsletter['confirmed']   = (int)$pdo->query("SELECT COUNT(*) FROM subscribers WHERE status = 'confirmed'")->fetchColumn();
            $newsletter['pending']     = (int)$pdo->query("SELECT COUNT(*) FROM subscribers WHERE status = 'pending'")->fetchColumn();
            $newsletter['new_last_30'] = (int)$pdo->query("
                SELECT COUNT(*) FROM subscribers
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            ")->fetchColumn();
        } catch (PDOException $_) { /* tabella non ancora migrata */ }

        // Messaggi: totali e non letti (read_at IS NULL — mai confrontare DATETIME con '')
        $messages = ['total' => 0, 'unread' => 0];
        try {
            $messages['total']  = (int)$pdo->query("SELECT COUNT(*) FROM messages")->fetchColumn();
            $messages['unread'] = (int)$pdo->query("SELECT COUNT(*) FROM messages WHERE read_at IS NULL")->fetchColumn();
        } catch (PDOException $_) { /* tabella non ancora migrata */ }

        // Media views per articolo pubblicato
        $avg_views_per_published = $published_articles > 0
            ? round($total_views / $published_articles, 1)
            : 0;

        // Top categorie per visualizzazioni
        $top_categories = $pdo->query("
            SELECT COALESCE(NULLIF(a.category, ''), 'Senza categoria') AS category,
                   COUNT(av.id) AS view_count
            FROM articles a
            JOIN article_views av ON av.article_id = a.id
            WHERE a.status = 'published'
            GROUP BY COALESCE(NULLIF(a.category, ''), 'Senza categoria')
            ORDER BY view_count DESC
            LIMIT 8
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
            // [v1.19.0] Nuove statistiche (additive, retrocompatibili)
            'period_days'               => $period,
            'daily_views'               => $daily_views,
            'views_today'               => $views_today,
            'views_yesterday'           => $views_yesterday,
            'views_last_7'              => $views_last_7,
            'views_prev_7'              => $views_prev_7,
            'unique_visitors'           => $unique_visitors,
            'content'                   => [
                'published_articles' => $published_articles,
                'draft_articles'     => $draft_articles,
                'visible_projects'   => $visible_projects,
            ],
            'newsletter'                => $newsletter,
            'messages'                  => $messages,
            'avg_views_per_published'   => $avg_views_per_published,
            'top_categories'            => $top_categories,
        ]);
    }
} catch (PDOException $e) {
    error_log('analytics.php PDOException: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Errore interno del server.']);
}
?>

<?php
/**
 * SIMONE PIZZI PORTFOLIO - SEO ENGINE SERVER-SIDE (v1.7.3)
 * Questo file intercetta le richieste di React Router (grazie ad .htaccess), interroga il database
 * e popola i metatag HTML primari (OpenGraph/Twitter) prima di passare il controllo a React (SPA).
 *
 * [v1.7.3] FIX CRITICO: migrato da SQLite (obsoleto dalla v1.7.0) a MySQL via db.php.
 *          Il vecchio approccio file_exists($dbPath) restituiva sempre false in produzione
 *          causando il fallback permanente ai meta della homepage su qualsiasi condivisione social.
 */

// [v1.7.3] Inclusione del layer DB MySQL (config.php + PDO singleton)
require_once __DIR__ . '/api/db.php';

// Default Meta (Fallback — usati per homepage e pagine non-articolo)
$protocol   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$metaTitle  = "Simone Pizzi - Videogiochi, Software e Narrativa";
$metaDesc   = "Portfolio Creativo, Game Design, Sviluppo Software e Pubblicazioni";
$metaImage  = $protocol . $_SERVER['HTTP_HOST'] . "/Simone-Pizzi.png";
$currentUrl = $protocol . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
$ogType     = "website";

$slug = null;

// Estrae l'ultimo segmento dell'URL come potenziale slug articolo
$request_uri = trim($_SERVER['REQUEST_URI'], '/');
// Rimuove query string dal path (es. ?foo=bar non fa parte dello slug)
$request_uri = strtok($request_uri, '?');
$uri_parts   = explode('/', $request_uri);

// Area admin: nessun match SEO, lascia partire l'SPA pulita
if (isset($uri_parts[0]) && $uri_parts[0] === 'admin') {
    $slug = null;
} elseif (count($uri_parts) === 2 && $uri_parts[1] !== '') {
    // Pattern standard: /categoria/slug
    $slug = $uri_parts[1];
} elseif (count($uri_parts) === 1 && $uri_parts[0] !== '') {
    // Pattern corto: /slug (gestione futura)
    $slug = $uri_parts[0];
}

// Tenta connessione MySQL e match dello slug
if ($slug) {
    try {
        $pdo = Database::connect();

        $cleanSlug = strip_tags(trim($slug));

        $stmt = $pdo->prepare(
            "SELECT title, excerpt, cover_image FROM articles
             WHERE slug = :slug AND status = 'published'
             LIMIT 1"
        );
        $stmt->execute([':slug' => $cleanSlug]);
        $article = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($article) {
            $ogType    = "article";
            $metaTitle = htmlspecialchars($article['title'], ENT_QUOTES, 'UTF-8') . " | Simone Pizzi";

            $rawDesc  = $article['excerpt'] ?: "Leggi l'articolo completo sul portfolio di Simone Pizzi.";
            $metaDesc = htmlspecialchars(strip_tags($rawDesc), ENT_QUOTES, 'UTF-8');

            if (!empty($article['cover_image'])) {
                $img = filter_var($article['cover_image'], FILTER_SANITIZE_URL);
                if (strpos($img, 'http') !== 0) {
                    $prefix    = (substr($img, 0, 1) !== '/') ? '/' : '';
                    $img       = $protocol . $_SERVER['HTTP_HOST'] . $prefix . $img;
                }
                $metaImage = $img;
            }
        }
    } catch (Exception $e) {
        // Fallback silenzioso: i meta default sono già impostati
        error_log("SEO Engine DB Error: " . $e->getMessage());
    }
}

// Recupera l'HTML compilato da Vite
$htmlFile = __DIR__ . '/index.html';

if (!file_exists($htmlFile)) {
    die("Error: Production index.html not found. Assicurati di aver generato la build Vite.");
}

$htmlContent = file_get_contents($htmlFile);

// Iniezione SEO nell'<head>
$seoInjection = "
    <title>{$metaTitle}</title>
    <!-- Primary Meta Tags -->
    <meta name=\"title\" content=\"{$metaTitle}\" />
    <meta name=\"description\" content=\"{$metaDesc}\" />

    <!-- Open Graph / Facebook / Telegram -->
    <meta property=\"og:type\" content=\"{$ogType}\" />
    <meta property=\"og:site_name\" content=\"Simone Pizzi\" />
    <meta property=\"og:locale\" content=\"it_IT\" />
    <meta property=\"og:url\" content=\"{$currentUrl}\" />
    <meta property=\"og:title\" content=\"{$metaTitle}\" />
    <meta property=\"og:description\" content=\"{$metaDesc}\" />
    <meta property=\"og:image\" content=\"{$metaImage}\" />
    <meta property=\"og:image:width\" content=\"1200\" />
    <meta property=\"og:image:height\" content=\"630\" />

    <!-- Twitter / X -->
    <meta name=\"twitter:card\" content=\"summary_large_image\" />
    <meta name=\"twitter:url\" content=\"{$currentUrl}\" />
    <meta name=\"twitter:title\" content=\"{$metaTitle}\" />
    <meta name=\"twitter:description\" content=\"{$metaDesc}\" />
    <meta name=\"twitter:image\" content=\"{$metaImage}\" />
</head>";

$htmlContent = str_replace('</head>', $seoInjection, $htmlContent);
$htmlContent = preg_replace('/<title>.*?<\/title>/s', '', $htmlContent, 1);

echo $htmlContent;
?>

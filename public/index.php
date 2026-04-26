<?php
/**
 * SIMONE PIZZI PORTFOLIO — SEO ENGINE v2.0 (Dynamic Rendering Ibrido)
 * 
 * Questo file intercetta TUTTE le richieste non-file di React Router (grazie ad .htaccess).
 * 
 * COMPORTAMENTO:
 * - Visitatori UMANI → Inietta meta OG/Twitter nell'<head> e serve la SPA React normalmente.
 * - CRAWLER (Googlebot, Bingbot, ecc.) → Genera un HTML completo con contenuto reale nel <body>,
 *   dati strutturati JSON-LD e canonical URL, senza bisogno di eseguire JavaScript.
 * 
 * Questo approccio è chiamato "Dynamic Rendering" ed è raccomandato da Google per le SPA.
 * NON è cloaking perché il contenuto mostrato ai crawler è identico a quello degli utenti.
 * 
 * [v2.0] Riscrittura completa. Sostituisce il vecchio approccio "solo meta tag" della v1.7.3.
 *        Rende obsoleto prerender.php (non più necessario).
 */

require_once __DIR__ . '/api/db.php';

// ─────────────────────────────────────────────
// 1. COSTANTI E CONFIGURAZIONE
// ─────────────────────────────────────────────

date_default_timezone_set('Europe/Rome');

$protocol   = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
$baseUrl    = $protocol . $_SERVER['HTTP_HOST'];
$currentUrl = $baseUrl . $_SERVER['REQUEST_URI'];

// Meta tag di default (Homepage / fallback)
$metaTitle  = "Simone Pizzi - Videogiochi, Software e Narrativa";
$metaDesc   = "Portfolio Creativo, Game Design, Sviluppo Software e Pubblicazioni";
$metaImage  = $baseUrl . "/Simone-Pizzi.webp";
$ogType     = "website";
$canonicalUrl = $currentUrl;

// ─────────────────────────────────────────────
// 2. HELPER FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Rileva se la richiesta proviene da un crawler/bot.
 * Lista basata sulla documentazione ufficiale di Google, Bing, e social crawler.
 */
function isCrawler(): bool {
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    if (empty($ua)) return false;

    $crawlers = [
        // Motori di ricerca
        'Googlebot',
        'Googlebot-Image',
        'Googlebot-News',
        'Googlebot-Video',
        'Google-InspectionTool',
        'Storebot-Google',
        'Bingbot',
        'Slurp',           // Yahoo
        'DuckDuckBot',
        'Baiduspider',
        'YandexBot',
        
        // Social media crawler
        'facebookexternalhit',
        'Facebot',
        'Twitterbot',
        'LinkedInBot',
        'TelegramBot',
        'WhatsApp',
        'Discordbot',
        'Slackbot',
        
        // SEO / Performance tools
        'Lighthouse',
        'PageSpeed',
        'Google-AMPHTML',
    ];

    foreach ($crawlers as $bot) {
        if (stripos($ua, $bot) !== false) {
            return true;
        }
    }
    return false;
}

/**
 * Tronca un testo a N caratteri preservando parole intere, rimuovendo tag HTML.
 */
function truncateText(string $text, int $maxLen = 160): string {
    $clean = strip_tags($text);
    $clean = html_entity_decode($clean, ENT_QUOTES, 'UTF-8');
    $clean = preg_replace('/\s+/', ' ', trim($clean));
    if (mb_strlen($clean) <= $maxLen) return $clean;
    $cut = mb_substr($clean, 0, $maxLen);
    $lastSpace = mb_strrpos($cut, ' ');
    if ($lastSpace !== false) $cut = mb_substr($cut, 0, $lastSpace);
    return $cut . '…';
}

/**
 * Escapa una stringa per uso sicuro in attributi HTML.
 */
function esc(string $str): string {
    return htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
}

/**
 * Normalizza un URL immagine relativo in assoluto.
 */
function absImageUrl(string $img, string $baseUrl): string {
    if (empty($img)) return $baseUrl . '/Simone-Pizzi.webp';
    if (strpos($img, 'http') === 0) return $img;
    $prefix = (substr($img, 0, 1) !== '/') ? '/' : '';
    return $baseUrl . $prefix . $img;
}

// ─────────────────────────────────────────────
// 3. ROUTING — Parsing dell'URL
// ─────────────────────────────────────────────

$request_uri = trim($_SERVER['REQUEST_URI'], '/');
$request_uri = strtok($request_uri, '?'); // Rimuove query string
$uri_parts   = array_filter(explode('/', $request_uri), fn($p) => $p !== '');
$uri_parts   = array_values($uri_parts); // Re-indicizza

// Tipo di pagina rilevato
$pageType = 'homepage'; // default
$slug     = null;
$catSlug  = null;

if (count($uri_parts) === 0) {
    $pageType = 'homepage';
} elseif ($uri_parts[0] === 'admin') {
    $pageType = 'admin'; // Nessun SEO per l'admin
} elseif ($uri_parts[0] === 'tutti-i-progetti') {
    $pageType = 'projects';
} elseif ($uri_parts[0] === 'contatti') {
    $pageType = 'contact';
} elseif ($uri_parts[0] === 'newsletter') {
    $pageType = 'static';
} elseif ($uri_parts[0] === 'privacy') {
    $pageType = 'legal_privacy';
} elseif ($uri_parts[0] === 'cookie-policy') {
    $pageType = 'legal_cookies';
} elseif (count($uri_parts) === 2) {
    $pageType = 'article';
    $catSlug  = $uri_parts[0];
    $slug     = $uri_parts[1];
} elseif (count($uri_parts) === 1) {
    $pageType = 'category';
    $catSlug  = $uri_parts[0];
}

// ─────────────────────────────────────────────
// 4. DATABASE QUERIES — Recupero dati per la pagina
// ─────────────────────────────────────────────

$article      = null;
$articles     = [];
$categoryName = null;
$projects     = [];
$jsonLd       = null;

try {
    $pdo = Database::connect();
    $now = date('Y-m-d H:i:s');

    // ── ARTICOLO SINGOLO ──
    if ($pageType === 'article' && $slug) {
        $stmt = $pdo->prepare(
            "SELECT id, title, slug, content, excerpt, cover_image, category, published_at, created_at 
             FROM articles 
             WHERE slug = :slug AND status = 'published' AND (published_at IS NULL OR published_at <= :now)
             LIMIT 1"
        );
        $stmt->execute([':slug' => strip_tags(trim($slug)), ':now' => $now]);
        $article = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($article) {
            $ogType     = "article";
            $metaTitle  = esc($article['title']) . " | Simone Pizzi";
            $rawDesc    = $article['excerpt'] ?: truncateText($article['content']);
            $metaDesc   = esc(truncateText(strip_tags($rawDesc)));
            $metaImage  = absImageUrl($article['cover_image'] ?? '', $baseUrl);
            $canonicalUrl = $baseUrl . '/' . esc($article['category']) . '/' . esc($article['slug']);

            // JSON-LD Article
            $jsonLd = [
                '@context' => 'https://schema.org',
                '@type' => 'Article',
                'headline' => $article['title'],
                'description' => truncateText(strip_tags($article['excerpt'] ?: $article['content']), 200),
                'image' => absImageUrl($article['cover_image'] ?? '', $baseUrl),
                'datePublished' => date('c', strtotime($article['published_at'] ?: $article['created_at'])),
                'author' => [
                    '@type' => 'Person',
                    'name' => 'Simone Pizzi',
                    'url' => $baseUrl
                ],
                'publisher' => [
                    '@type' => 'Person',
                    'name' => 'Simone Pizzi'
                ],
                'mainEntityOfPage' => [
                    '@type' => 'WebPage',
                    '@id' => $canonicalUrl
                ]
            ];
        }
    }

    // ── CATEGORIA ──
    if ($pageType === 'category' && $catSlug) {
        // Verifica che la categoria esista
        $catStmt = $pdo->prepare("SELECT id, name, slug FROM categories WHERE slug = :slug LIMIT 1");
        $catStmt->execute([':slug' => strip_tags(trim($catSlug))]);
        $cat = $catStmt->fetch(PDO::FETCH_ASSOC);

        if ($cat) {
            $categoryName = $cat['name'];
            $metaTitle = esc($cat['name']) . " | Simone Pizzi";
            $metaDesc  = esc("Esplora tutti gli articoli nella sezione " . $cat['name'] . " del portfolio di Simone Pizzi.");
            $canonicalUrl = $baseUrl . '/' . esc($cat['slug']);

            // Recupera articoli della categoria (per i crawler)
            $artStmt = $pdo->prepare(
                "SELECT id, title, slug, excerpt, cover_image, category, published_at 
                 FROM articles 
                 WHERE category = :cat AND status = 'published' AND (published_at IS NULL OR published_at <= :now)
                 ORDER BY published_at DESC 
                 LIMIT 50"
            );
            $artStmt->execute([':cat' => $cat['slug'], ':now' => $now]);
            $articles = $artStmt->fetchAll(PDO::FETCH_ASSOC);

            // JSON-LD CollectionPage
            $jsonLd = [
                '@context' => 'https://schema.org',
                '@type' => 'CollectionPage',
                'name' => $cat['name'],
                'description' => "Articoli nella categoria " . $cat['name'],
                'url' => $canonicalUrl,
                'isPartOf' => [
                    '@type' => 'WebSite',
                    'name' => 'Simone Pizzi Portfolio',
                    'url' => $baseUrl
                ]
            ];
        }
    }

    // ── HOMEPAGE ──
    if ($pageType === 'homepage') {
        $canonicalUrl = $baseUrl . '/';

        // Articoli recenti per il crawler
        $homeStmt = $pdo->prepare(
            "SELECT id, title, slug, excerpt, cover_image, category, published_at 
             FROM articles 
             WHERE status = 'published' AND (published_at IS NULL OR published_at <= :now)
             ORDER BY is_featured DESC, published_at DESC 
             LIMIT 7"
        );
        $homeStmt->execute([':now' => $now]);
        $articles = $homeStmt->fetchAll(PDO::FETCH_ASSOC);

        // Progetti recenti
        $projStmt = $pdo->query(
            "SELECT id, name, category, description, cover_url 
             FROM projects 
             WHERE is_visible = 1 
             ORDER BY sort_order ASC 
             LIMIT 4"
        );
        $projects = $projStmt->fetchAll(PDO::FETCH_ASSOC);

        // JSON-LD WebSite + Person
        $jsonLd = [
            '@context' => 'https://schema.org',
            '@graph' => [
                [
                    '@type' => 'WebSite',
                    'name' => 'Simone Pizzi — Portfolio Creativo',
                    'url' => $baseUrl,
                    'description' => $metaDesc,
                    'inLanguage' => 'it-IT'
                ],
                [
                    '@type' => 'Person',
                    'name' => 'Simone Pizzi',
                    'url' => $baseUrl,
                    'jobTitle' => 'Game Designer, Sviluppatore Software, Scrittore',
                    'sameAs' => []
                ]
            ]
        ];
    }

    // ── TUTTI I PROGETTI ──
    if ($pageType === 'projects') {
        $metaTitle = "Tutti i Progetti | Simone Pizzi";
        $metaDesc  = "Scopri tutti i progetti di Simone Pizzi: videogiochi, software, narrativa e produzioni creative.";
        $canonicalUrl = $baseUrl . '/tutti-i-progetti';

        $projStmt = $pdo->query(
            "SELECT id, name, category, description, cover_url 
             FROM projects 
             WHERE is_visible = 1 
             ORDER BY sort_order ASC"
        );
        $projects = $projStmt->fetchAll(PDO::FETCH_ASSOC);

        $jsonLd = [
            '@context' => 'https://schema.org',
            '@type' => 'CollectionPage',
            'name' => 'Tutti i Progetti',
            'description' => $metaDesc,
            'url' => $canonicalUrl
        ];
    }

    // ── CONTATTI ──
    if ($pageType === 'contact') {
        $metaTitle = "Contatti | Simone Pizzi";
        $metaDesc  = "Contatta Simone Pizzi per collaborazioni, richieste di consulenza o semplicemente per dire ciao.";
        $canonicalUrl = $baseUrl . '/contatti';

        $jsonLd = [
            '@context' => 'https://schema.org',
            '@type' => 'ContactPage',
            'name' => 'Contatti',
            'url' => $canonicalUrl,
            'mainEntity' => [
                '@type' => 'Person',
                'name' => 'Simone Pizzi'
            ]
        ];
    }

    // ── PAGINE LEGALI ──
    if ($pageType === 'legal_privacy') {
        $metaTitle = "Privacy Policy | Simone Pizzi";
        $metaDesc  = "Informativa sul trattamento dei dati personali ai sensi del GDPR (Reg. UE 2016/679).";
        $canonicalUrl = $baseUrl . '/privacy';
    }

    if ($pageType === 'legal_cookies') {
        $metaTitle = "Cookie Policy | Simone Pizzi";
        $metaDesc  = "Informativa sull'uso dei cookie del sito Simone Pizzi. Solo cookie tecnici essenziali.";
        $canonicalUrl = $baseUrl . '/cookie-policy';
    }

} catch (Exception $e) {
    // Fallback silenzioso: i meta default sono già impostati
    error_log("SEO Engine v2.0 DB Error: " . $e->getMessage());
}

// ─────────────────────────────────────────────
// 5. RENDERING — Decisione crawler vs umano
// ─────────────────────────────────────────────

$isCrawler = isCrawler();

// Per le pagine legali, serve direttamente il file PHP (non React SPA)
if ($pageType === 'legal_privacy') {
    require __DIR__ . '/privacy.php';
    exit;
}
if ($pageType === 'legal_cookies') {
    require __DIR__ . '/cookie-policy.php';
    exit;
}

if ($isCrawler && $pageType !== 'admin') {
    // ═══════════════════════════════════════════
    // PERCORSO CRAWLER: HTML completo server-side
    // ═══════════════════════════════════════════

    $bodyContent = '';

    // ── Body per ARTICOLO ──
    if ($pageType === 'article' && $article) {
        $pubDate = date('d/m/Y', strtotime($article['published_at'] ?: $article['created_at']));
        $catLabel = ucwords(str_replace('-', ' ', $article['category']));
        $coverUrl = absImageUrl($article['cover_image'] ?? '', $baseUrl);

        $bodyContent = '
        <nav aria-label="Breadcrumb">
            <ol>
                <li><a href="' . $baseUrl . '/">Home</a></li>
                <li><a href="' . $baseUrl . '/' . esc($article['category']) . '">' . esc($catLabel) . '</a></li>
                <li>' . esc($article['title']) . '</li>
            </ol>
        </nav>
        <article>
            <header>
                <h1>' . esc($article['title']) . '</h1>
                <p><time datetime="' . esc($article['published_at'] ?: $article['created_at']) . '">' . $pubDate . '</time> · ' . esc($catLabel) . '</p>
                <img src="' . esc($coverUrl) . '" alt="' . esc($article['title']) . '" />
            </header>
            <section>' . ($article['excerpt'] ? '<p><strong>' . esc(strip_tags($article['excerpt'])) . '</strong></p>' : '') . '</section>
            <div>' . $article['content'] . '</div>
        </article>';
    }

    // ── Body per CATEGORIA ──
    elseif ($pageType === 'category' && $categoryName) {
        $bodyContent = '
        <nav aria-label="Breadcrumb">
            <ol>
                <li><a href="' . $baseUrl . '/">Home</a></li>
                <li>' . esc($categoryName) . '</li>
            </ol>
        </nav>
        <main>
            <h1>' . esc($categoryName) . '</h1>
            <p>Articoli nella sezione ' . esc($categoryName) . '</p>';

        if (!empty($articles)) {
            $bodyContent .= '<ul>';
            foreach ($articles as $art) {
                $artUrl = $baseUrl . '/' . esc($art['category']) . '/' . esc($art['slug']);
                $bodyContent .= '
                <li>
                    <article>
                        <h2><a href="' . $artUrl . '">' . esc($art['title']) . '</a></h2>'
                        . ($art['excerpt'] ? '<p>' . esc(truncateText(strip_tags($art['excerpt']), 200)) . '</p>' : '') .
                    '</article>
                </li>';
            }
            $bodyContent .= '</ul>';
        }
        $bodyContent .= '</main>';
    }

    // ── Body per HOMEPAGE ──
    elseif ($pageType === 'homepage') {
        $bodyContent = '
        <main>
            <h1>Simone Pizzi — Portfolio Creativo</h1>
            <p>Videogiochi, Software e Narrativa. Esplora i miei progetti e articoli.</p>';

        if (!empty($articles)) {
            $bodyContent .= '<section><h2>Articoli Recenti</h2><ul>';
            foreach ($articles as $art) {
                $artUrl = $baseUrl . '/' . esc($art['category']) . '/' . esc($art['slug']);
                $bodyContent .= '
                <li>
                    <article>
                        <h3><a href="' . $artUrl . '">' . esc($art['title']) . '</a></h3>'
                        . ($art['excerpt'] ? '<p>' . esc(truncateText(strip_tags($art['excerpt']), 160)) . '</p>' : '') .
                    '</article>
                </li>';
            }
            $bodyContent .= '</ul></section>';
        }

        if (!empty($projects)) {
            $bodyContent .= '<section><h2>Progetti</h2><ul>';
            foreach ($projects as $proj) {
                $bodyContent .= '
                <li>
                    <h3>' . esc($proj['name']) . '</h3>'
                    . ($proj['description'] ? '<p>' . esc(truncateText(strip_tags($proj['description']), 160)) . '</p>' : '') .
                '</li>';
            }
            $bodyContent .= '</ul></section>';
        }

        $bodyContent .= '</main>';
    }

    // ── Body per TUTTI I PROGETTI ──
    elseif ($pageType === 'projects') {
        $bodyContent = '
        <nav aria-label="Breadcrumb">
            <ol>
                <li><a href="' . $baseUrl . '/">Home</a></li>
                <li>Tutti i Progetti</li>
            </ol>
        </nav>
        <main>
            <h1>Tutti i Progetti</h1>
            <p>I progetti creativi di Simone Pizzi.</p>';

        if (!empty($projects)) {
            $bodyContent .= '<ul>';
            foreach ($projects as $proj) {
                $bodyContent .= '
                <li>
                    <article>
                        <h2>' . esc($proj['name']) . '</h2>'
                        . ($proj['description'] ? '<p>' . esc(truncateText(strip_tags($proj['description']), 200)) . '</p>' : '') .
                    '</article>
                </li>';
            }
            $bodyContent .= '</ul>';
        }
        $bodyContent .= '</main>';
    }

    // ── Body per CONTATTI ──
    elseif ($pageType === 'contact') {
        $bodyContent = '
        <nav aria-label="Breadcrumb">
            <ol>
                <li><a href="' . $baseUrl . '/">Home</a></li>
                <li>Contatti</li>
            </ol>
        </nav>
        <main>
            <h1>Contatti</h1>
            <p>Contatta Simone Pizzi per collaborazioni, richieste di consulenza o semplicemente per dire ciao.</p>
        </main>';
    }

    // ── Costruzione HTML completo per crawler ──
    $jsonLdScript = $jsonLd ? '<script type="application/ld+json">' . json_encode($jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . '</script>' : '';

    $crawlerHtml = '<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <title>' . $metaTitle . '</title>
    <meta name="description" content="' . esc($metaDesc) . '" />
    <link rel="canonical" href="' . esc($canonicalUrl) . '" />
    
    <!-- Open Graph / Facebook / Telegram -->
    <meta property="og:type" content="' . $ogType . '" />
    <meta property="og:site_name" content="Simone Pizzi" />
    <meta property="og:locale" content="it_IT" />
    <meta property="og:url" content="' . esc($canonicalUrl) . '" />
    <meta property="og:title" content="' . esc($metaTitle) . '" />
    <meta property="og:description" content="' . esc($metaDesc) . '" />
    <meta property="og:image" content="' . esc($metaImage) . '" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    
    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="' . esc($canonicalUrl) . '" />
    <meta name="twitter:title" content="' . esc($metaTitle) . '" />
    <meta name="twitter:description" content="' . esc($metaDesc) . '" />
    <meta name="twitter:image" content="' . esc($metaImage) . '" />
    
    ' . $jsonLdScript . '
</head>
<body>
    ' . $bodyContent . '
</body>
</html>';

    echo $crawlerHtml;
    exit;

} else {
    // ═══════════════════════════════════════════
    // PERCORSO UMANO: SPA React con meta iniettati
    // ═══════════════════════════════════════════

    $htmlFile = __DIR__ . '/index.html';

    if (!file_exists($htmlFile)) {
        die("Error: Production index.html not found. Assicurati di aver generato la build Vite.");
    }

    $htmlContent = file_get_contents($htmlFile);

    // Iniezione SEO nell'<head>
    $seoInjection = '
    <title>' . $metaTitle . '</title>
    <meta name="title" content="' . esc($metaTitle) . '" />
    <meta name="description" content="' . esc($metaDesc) . '" />
    <link rel="canonical" href="' . esc($canonicalUrl) . '" />

    <!-- Open Graph / Facebook / Telegram -->
    <meta property="og:type" content="' . $ogType . '" />
    <meta property="og:site_name" content="Simone Pizzi" />
    <meta property="og:locale" content="it_IT" />
    <meta property="og:url" content="' . esc($canonicalUrl) . '" />
    <meta property="og:title" content="' . esc($metaTitle) . '" />
    <meta property="og:description" content="' . esc($metaDesc) . '" />
    <meta property="og:image" content="' . esc($metaImage) . '" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter / X -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="' . esc($canonicalUrl) . '" />
    <meta name="twitter:title" content="' . esc($metaTitle) . '" />
    <meta name="twitter:description" content="' . esc($metaDesc) . '" />
    <meta name="twitter:image" content="' . esc($metaImage) . '" />';

    // JSON-LD anche per gli umani (Google esegue JS ma apprezza JSON-LD server-side)
    if ($jsonLd) {
        $seoInjection .= '
    <script type="application/ld+json">' . json_encode($jsonLd, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>';
    }

    // Iniezione cookie banner per visitatori umani (non crawler)
    $seoInjection .= "\n    <script src=\"/js/cookie-banner.js\" defer></script>";
    $seoInjection .= "\n</head>";

    $htmlContent = str_replace('</head>', $seoInjection, $htmlContent);
    // Rimuove il <title> originale generato da Vite per evitare duplicati
    $htmlContent = preg_replace('/<title>.*?<\/title>/s', '', $htmlContent, 1);

    echo $htmlContent;
}
?>

<?php
/**
 * SIMONE PIZZI PORTFOLIO - SEO ENGINE SERVER-SIDE (v1.4.0)
 * Questo file intercetta le richieste di React Router (grazie ad .htaccess), interroga il database 
 * e popola i metatag HTML primari (OpenGraph/Twitter) prima di passare il raggio a React (SPA).
 */
$dbPath = __DIR__ . '/api/.data/database.sqlite';

// Default Meta (Fallback)
$metaTitle = "Simone Pizzi - Videogiochi, Software e Narrativa";
$metaDescription = "Portfolio Creativo, Game Design, Sviluppo Software e Pubblicazioni";
$metaImage = "https://simonepizzi.it/cover-default.jpg"; // Da sostituire con URL reale in prod
$currentUrl = "https://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];

$slug = null;

// Estrarre l'ultimo segmento dell'URL come potenziale slug di un articolo (Ignora la root category)
$request_uri = trim($_SERVER['REQUEST_URI'], '/');
$uri_parts = explode('/', $request_uri);

// Se siamo nell'area di amministrazione, non fare alcun match SEO, lascia che l'SPA parta pulita
if (isset($uri_parts[0]) && $uri_parts[0] === 'admin') {
    $slug = null;
} else if (count($uri_parts) == 2) { 
    // Meno probabilità di scontri, assumiamo uri tipo: /videogiochi/mio-slug
    $slug = end($uri_parts);
} elseif (count($uri_parts) == 1 && $uri_parts[0] !== '') {
    // Gestione URL corti (se implementato) /mio-slug
     $slug = end($uri_parts);
}

// 1. TENTA CONNESSIONE AL DATABASE E MATCH DELLA SLUG
if ($slug && file_exists($dbPath)) {
    try {
        $pdo = new PDO('sqlite:' . $dbPath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Prepariamo la stringa per farla sfuggire da attacchi (anche col PDO param funziona)
        $cleanSlug = filter_var($slug, FILTER_SANITIZE_STRING);
        
        $stmt = $pdo->prepare("SELECT title, excerpt, cover_image FROM articles WHERE slug = :slug AND status = 'published' LIMIT 1");
        $stmt->execute([':slug' => $cleanSlug]);
        $article = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($article) {
            // MATCH TROVATO! Sovrascriviamo i meta base
            $metaTitle = htmlspecialchars($article['title'], ENT_QUOTES, 'UTF-8') . " | Simone Pizzi";
            
            // Per la descrizione, esegui uno strip tag per sicurezza
            $rawDesc = $article['excerpt'] ? $article['excerpt'] : "Leggi l'articolo completo di Simone Pizzi.";
            $metaDescription = htmlspecialchars(strip_tags($rawDesc), ENT_QUOTES, 'UTF-8');
            
            if (!empty($article['cover_image'])) {
                $metaImage = filter_var($article['cover_image'], FILTER_SANITIZE_URL);
                if (strpos($metaImage, 'http') !== 0) {
                     // Rendi la copertina dell'articolo un path assoluto (necessario per Social Bots)
                     $metaImage = "https://" . $_SERVER['HTTP_HOST'] . $metaImage; 
                }
            }
        }
    } catch (PDOException $e) {
        // Fallback silenzioso: proseguiamo col render dei metas default se il DB crascia.
        error_log("SEO Engine DB Error: " . $e->getMessage());
    }
}

// 2. RECUPERA L'HTML COMPILATO DI VITE
// Durante `npm run build`, Vite genera index.html, non index.php. 
// Leggeremo l'index.html finale generato da Vite (dist/index.html fisicamente, ma noi siamo dentro /public/ ora. 
// A build chiusa tutto `public` e i compilati andranno nella root)
$htmlFile = __DIR__ . '/index.html'; 

if (!file_exists($htmlFile)) {
    // Fallback disperato per l'ambiente dev o errori di build
    die("Error: Production index.html not found. Assicurati di aver generato la build Vite.");
}

$htmlContent = file_get_contents($htmlFile);

// 3. INIEZIONE SEO MANUALE NELL'HEAD
// Sostituiamo il <title> originale di Vite e iniettiamo tutto il pacchetto SEO Dinamico
$seoInjection = "
    <title>{$metaTitle}</title>
    <!-- Primary Meta Tags -->
    <meta name=\"title\" content=\"{$metaTitle}\" />
    <meta name=\"description\" content=\"{$metaDescription}\" />

    <!-- Open Graph / Facebook -->
    <meta property=\"og:type\" content=\"website\" />
    <meta property=\"og:url\" content=\"{$currentUrl}\" />
    <meta property=\"og:title\" content=\"{$metaTitle}\" />
    <meta property=\"og:description\" content=\"{$metaDescription}\" />
    <meta property=\"og:image\" content=\"{$metaImage}\" />

    <!-- Twitter -->
    <meta property=\"twitter:card\" content=\"summary_large_image\" />
    <meta property=\"twitter:url\" content=\"{$currentUrl}\" />
    <meta property=\"twitter:title\" content=\"{$metaTitle}\" />
    <meta property=\"twitter:description\" content=\"{$metaDescription}\" />
    <meta property=\"twitter:image\" content=\"{$metaImage}\" />
</head>";

// Operazione chirugica sull'HTML
$htmlContent = str_replace('</head>', $seoInjection, $htmlContent);
// Togliamo il title pre-esistente per non averne due.
$htmlContent = preg_replace('/<title>.*?<\/title>/s', '', $htmlContent, 1);

// Erova la SPA di React con il pacco regalo per i Bot inserito!
echo $htmlContent;
?>

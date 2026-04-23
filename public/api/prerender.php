<?php
/**
 * Script Prerendering - Genera HTML statici per tutte le route
 * Eseguibile via browser: https://simonepizzi.runtimeradio.it/api/prerender.php
 * 
 * NOTA: Protetto con autenticazione admin
 */

require_once 'db.php';
require_once 'auth_helper.php';

// Definizione costante per evitare l'invio di header dai file inclusi (robots, sitemap)
define('IS_PRERENDERING', true);

header('Content-Type: application/json');
set_time_limit(300); // 5 minuti di timeout

// Verifica autenticazione admin
try {
    Auth::check(); // Solo utenti loggati
} catch (Exception $e) {
    http_response_code(403);
    echo json_encode(['error' => 'Accesso negato. Devi essere autenticato.']);
    exit;
}

$pdo = Database::connect();

function getCategories($pdo) {
    $stmt = $pdo->query("SELECT id, name, slug, sort_order FROM categories ORDER BY sort_order ASC");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getArticlesByCategory($pdo, $categorySlug) {
    $stmt = $pdo->prepare("
        SELECT id, slug, title, excerpt, content, cover_image, category, published_at 
        FROM articles 
        WHERE category = ? AND status = 'published'
        ORDER BY published_at DESC
    ");
    $stmt->execute([$categorySlug]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function generateRoutes($pdo) {
    $routes = [
        '/',
        '/tutti-i-progetti',
        '/contatti',
        '/newsletter/confermato',
        '/newsletter/disiscritto',
    ];

    try {
        $categories = getCategories($pdo);
        foreach ($categories as $cat) {
            $routes[] = '/' . $cat['slug'];
            
            $articles = getArticlesByCategory($pdo, $cat['slug']);
            foreach ($articles as $article) {
                $routes[] = '/' . $cat['slug'] . '/' . $article['slug'];
            }
        }
    } catch (Exception $e) {
        throw new Exception('Errore nel recupero dati: ' . $e->getMessage());
    }

    return array_unique($routes);
}

try {
    // Recupera lista completa di route
    $routes = generateRoutes($pdo);

    // Root del sito = DOCUMENT_ROOT
    $rootPath = $_SERVER['DOCUMENT_ROOT'];
    $indexHtmlPath = $rootPath . '/index.html';

    if (!file_exists($indexHtmlPath)) {
        http_response_code(500);
        echo json_encode([
            'error' => 'File index.html non trovato in root del sito',
            'attempted_path' => $indexHtmlPath,
            'document_root' => $rootPath,
            'files_in_root' => array_slice(scandir($rootPath), 0, 10)
        ]);
        exit;
    }

    // Rimuoviamo la lettura statica di index.html qui sopra, lo faremo dinamicamente nel loop
    $created = 0;
    $skipped = 0;
    $errors = [];

    // La root del sito è il distPath
    $distPath = $rootPath;
    $indexPhpPath = dirname(__DIR__) . '/index.php';

    if (!file_exists($indexPhpPath)) {
        throw new Exception("File index.php non trovato in: $indexPhpPath");
    }

    // Crea un file index.html per ogni route
    foreach ($routes as $route) {
        try {
            $routePath = ($route === '/') ? '' : trim($route, '/');
            $filePath = $distPath . '/' . $routePath . '/index.html';
            $dirPath = dirname($filePath);

            // Crea directory se non esiste
            if (!is_dir($dirPath)) {
                if (!mkdir($dirPath, 0755, true)) {
                    throw new Exception("Impossibile creare directory: $dirPath");
                }
            }

            // Se il file esiste già e non è la root, potremmo volerlo saltare o sovrascrivere.
            // In questo caso, lo sovrascriviamo per assicurarci che sia aggiornato con i nuovi meta.
            // Ma saltiamo la root per evitare loop se lo script è in esecuzione (anche se improbabile)
            if ($route === '/' && file_exists($filePath)) {
                $skipped++;
                continue;
            }

            // --- CATTURA OUTPUT SEO DA index.php ---
            // Simuliamo la richiesta impostando l'URI corretto
            $originalUri = $_SERVER['REQUEST_URI'] ?? '/';
            $_SERVER['REQUEST_URI'] = $route;
            
            ob_start();
            // Includiamo index.php che farà il lavoro di fetching DB e iniezione Meta
            include $indexPhpPath;
            $renderedHtml = ob_get_clean();

            // Ripristiniamo l'URI originale
            $_SERVER['REQUEST_URI'] = $originalUri;

            if (empty($renderedHtml)) {
                throw new Exception("L'output di index.php per la route '$route' è vuoto.");
            }

            // Scrivi il file
            if (!file_put_contents($filePath, $renderedHtml)) {
                throw new Exception("Impossibile scrivere file: $filePath");
            }

            $created++;
        } catch (Exception $e) {
            $errors[] = "Route '$route': " . $e->getMessage();
        }
    }

    // --- GENERAZIONE FILE SEO STATICI (robots.txt e sitemap.xml) ---
    // Questo assicura che Google trovi i file fisici senza dipendere solo dal rewrite .htaccess
    $seoFiles = [
        ['src' => '/robots.php', 'dest' => '/robots.txt'],
        ['src' => '/sitemap.php', 'dest' => '/sitemap.xml']
    ];

    foreach ($seoFiles as $seoFile) {
        try {
            $srcPath = dirname(__DIR__) . $seoFile['src'];
            $destPath = $rootPath . $seoFile['dest'];

            if (file_exists($srcPath)) {
                // Impostiamo l'URI per coerenza se i file usano $_SERVER['REQUEST_URI']
                $_SERVER['REQUEST_URI'] = $seoFile['dest'];
                
                ob_start();
                include $srcPath;
                $content = ob_get_clean();

                if (!empty($content)) {
                    if (file_put_contents($destPath, $content)) {
                        $created++;
                    } else {
                        throw new Exception("Impossibile scrivere il file: " . $seoFile['dest']);
                    }
                }
            }
        } catch (Exception $e) {
            $errors[] = "SEO File '{$seoFile['dest']}': " . $e->getMessage();
        }
    }

    // Risposta di successo
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Prerendering con iniezione SEO e generazione file core completata',
        'stats' => [
            'total_routes' => count($routes),
            'seo_files' => count($seoFiles),
            'files_created' => $created,
            'files_skipped' => $skipped,
            'errors' => $errors
        ],
        'routes' => $routes
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Errore durante il prerendering: ' . $e->getMessage()
    ]);
}
?>
<?php
/**
 * Script Prerendering - Genera HTML statici per tutte le route
 * Eseguibile via browser: https://simonepizzi.runtimeradio.it/api/prerender.php
 * 
 * NOTA: Protetto con autenticazione admin
 */

require_once 'db.php';
require_once 'auth_helper.php';

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

    // Leggi il contenuto del file index.html
    $indexHtml = file_get_contents($indexHtmlPath);
    $created = 0;
    $skipped = 0;
    $errors = [];

    // La root del sito è il distPath
    $distPath = $rootPath;

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

            // Se il file esiste già, salta
            if (file_exists($filePath)) {
                $skipped++;
                continue;
            }

            // Scrivi il file
            if (!file_put_contents($filePath, $indexHtml)) {
                throw new Exception("Impossibile scrivere file: $filePath");
            }

            $created++;
        } catch (Exception $e) {
            $errors[] = "Route '$route': " . $e->getMessage();
        }
    }

    // Risposta di successo
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Prerendering completato',
        'stats' => [
            'total_routes' => count($routes),
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
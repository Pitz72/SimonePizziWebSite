<?php
require_once __DIR__ . '/config.php';

// [v1.19.0] URL canonico del sito, usato per costruire i link nelle email
// (recupero password, conferma newsletter). Mai derivarlo da HTTP_HOST:
// un header Host falsificato finirebbe dentro email legittime (link poisoning).
// Sovrascrivibile da config.php per ambienti diversi.
if (!defined('SITE_URL')) {
    define('SITE_URL', 'https://simonepizzi.runtimeradio.it');
}

// [v1.27.0] Soglia di indicizzazione delle pagine tag.
// Un tag usato in uno o due articoli non produce un archivio: produce una pagina
// che ripete un contenuto già presente altrove ("thin content"). Quelle pagine
// restano navigabili per i lettori ma escono da sitemap e indice.
// Da 3 articoli in su il tag raggruppa davvero qualcosa e viene indicizzato.
// La soglia è condivisa fra index.php (meta robots) e sitemap.php: cambiarla qui
// li tiene automaticamente allineati.
if (!defined('TAG_INDEX_MIN_ARTICLES')) {
    define('TAG_INDEX_MIN_ARTICLES', 3);
}

class Database {
    private static $pdo = null;

    public static function connect() {
        if (self::$pdo === null) {
            try {
                self::$pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                error_log('db.php connection failed: ' . $e->getMessage());
                echo json_encode(['status' => 'error', 'message' => 'Errore interno del server.']);
                exit;
            }
        }
        return self::$pdo;
    }
}
?>

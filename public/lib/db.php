<?php
/**
 * La connessione, una sola per richiesta.
 *
 * In produzione c'è MySQL, e le credenziali stanno in lib/config.php, che è
 * fuori da git. In sviluppo MySQL non è raggiungibile — DreamHost non accetta
 * connessioni da fuori — quindi si apre il file SQLite costruito da
 * scripts/sviluppo/crea-db-sviluppo.php con i dati veri del sito.
 *
 * Il codice del sito non sa quale dei due ha davanti: chiede a PDO e basta.
 * Il prezzo di questa comodità è una regola da rispettare nelle query: solo
 * SQL che MySQL e SQLite parlano entrambi. In pratica significa formattare le
 * date in PHP invece che con DATE_FORMAT — cosa che per l'italiano serviva
 * comunque — e non usare le estensioni di MySQL (INSERT IGNORE, REPLACE) nelle
 * pagine pubbliche, che tanto leggono e basta.
 */

declare(strict_types=1);

function db(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $opzioni = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    if (IN_SVILUPPO) {
        $file = __DIR__ . '/../../scratch/sviluppo.sqlite';
        if (!is_file($file)) {
            muori_con_istruzioni(
                'Manca il database di sviluppo.',
                "Costruiscilo con:\n\n"
                . "    bash scripts/sviluppo/scarica-dati.sh\n"
                . "    php  scripts/sviluppo/crea-db-sviluppo.php"
            );
        }
        $pdo = new PDO('sqlite:' . $file, null, null, $opzioni);
        // In SQLite le chiavi esterne sono spente di suo.
        $pdo->exec('PRAGMA foreign_keys = ON');
        return $pdo;
    }

    // Produzione. config.php definisce DB_DSN, DB_USER, DB_PASS.
    $config = __DIR__ . '/config.php';
    if (!is_file($config)) {
        // Durante la migrazione le credenziali vivono ancora in api/config.php:
        // finché non si sposta il file, si legge da lì.
        $config = __DIR__ . '/../api/config.php';
    }
    require_once $config;

    try {
        $pdo = new PDO(DB_DSN, DB_USER, DB_PASS, $opzioni);
        $pdo->exec("SET NAMES utf8mb4");
    } catch (PDOException $e) {
        error_log('db(): connessione fallita — ' . $e->getMessage());
        http_response_code(503);
        exit('Il sito non riesce a raggiungere il database. Riprova fra poco.');
    }

    return $pdo;
}

/** Errore di configurazione in sviluppo: si spiega come si aggiusta. */
function muori_con_istruzioni(string $titolo, string $dettaglio): never {
    http_response_code(500);
    header('Content-Type: text/plain; charset=utf-8');
    exit($titolo . "\n\n" . $dettaglio . "\n");
}

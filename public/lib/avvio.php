<?php
/**
 * L'avvio: il primo file che ogni richiesta esegue.
 *
 * Mette in piedi le poche cose che valgono per tutte le pagine — fuso orario,
 * segnalazione degli errori, il nonce della CSP, la connessione — e carica le
 * librerie. Da qui in poi una pagina può limitarsi a chiedere i suoi dati e a
 * stamparli.
 */

declare(strict_types=1);

/* ── Ambiente ─────────────────────────────────────────────────────────────
   Il server di sviluppo di PHP (`php -S`) si riconosce dal SAPI. È l'unica
   cosa che distingue sviluppo e produzione, e la distinzione serve in due
   punti soli: quale database aprire (lib/db.php) e se mostrare gli errori. */
define('IN_SVILUPPO', PHP_SAPI === 'cli-server');

error_reporting(E_ALL);
ini_set('display_errors', IN_SVILUPPO ? '1' : '0');
ini_set('log_errors', '1');

date_default_timezone_set('Europe/Rome');
mb_internal_encoding('UTF-8');
setlocale(LC_ALL, 'it_IT.UTF-8', 'it_IT', 'Italian_Italy');

/* ── Costanti del sito ────────────────────────────────────────────────────
   L'indirizzo canonico non si ricava mai da HTTP_HOST: un header Host
   falsificato finirebbe dentro i link delle email e dentro i tag canonical.
   La regola arriva dalla v1.19.0 e resta valida. */
const SITO_NOME    = 'Simone Pizzi';
const SITO_URL     = 'https://simonepizzi.runtimeradio.it';
const SITO_MOTTO   = 'Portfolio e blog · dal 2010';
const SITO_DESCR   = 'Podcaster dal 2010. Scrittore di storie e racconti. Sviluppatore sperimentale con AI. Fondatore di Runtime Radio e Italian Podcast Network.';

/** In sviluppo i link assoluti devono puntare al server locale, non al sito vero. */
function base_url(): string {
    if (IN_SVILUPPO) {
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
        return 'http://' . $host;
    }
    return SITO_URL;
}

/* ── Il nonce della CSP ───────────────────────────────────────────────────
   Ogni richiesta genera un numero usato una volta sola. Gli script scritti
   dentro la pagina lo dichiarano; tutto ciò che viene iniettato da fuori non
   lo conosce e il browser lo rifiuta. Va poi ripetuto identico nell'header
   Content-Security-Policy: se ne occupa partials/head.php. */
function nonce(): string {
    static $n = null;
    if ($n === null) $n = base64_encode(random_bytes(16));
    return $n;
}

/* ── Le librerie ──────────────────────────────────────────────────────────
   Sono poche e si caricano tutte: un autoloader qui servirebbe solo a
   nascondere quante sono. */
require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/safe_html.php';
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/query.php';
require_once __DIR__ . '/sommario.php';
require_once __DIR__ . '/seo.php';
require_once __DIR__ . '/../partials/blocchi.php';

/* Il pannello carica in più auth.php, db_maintenance.php e pannello.php:
   li chiede admin/_avvio.php, non serve che li porti ogni pagina pubblica. */

/* ── L'anteprima dell'amministratore ──────────────────────────────────────
   Chi sta guardando il sito è l'amministratore già entrato nel pannello?

   Serve a una cosa sola: lasciargli aprire gli articoli che il pubblico non
   può vedere — le bozze e quelli programmati nel futuro — al loro indirizzo
   vero, che è l'unico modo di vedere davvero come verranno. Per tutto il
   resto il sito si comporta identico per lui e per chiunque altro.

   La sessione si apre SOLO se il browser porta già il cookie del pannello.
   Senza questo freno ogni visita di ogni lettore aprirebbe una sessione PHP e
   ne scriverebbe il file su disco: un costo pagato da tutti per servire uno.
   Il nome del cookie è quello fissato da session_name() in lib/auth.php. */
function admin_in_ascolto(): bool {
    static $risposta = null;
    if ($risposta !== null) return $risposta;

    if (!isset($_COOKIE['sp_admin'])) return $risposta = false;

    require_once __DIR__ . '/auth.php';
    return $risposta = dentro();
}

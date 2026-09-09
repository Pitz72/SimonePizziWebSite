<?php
/**
 * ONE-SHOT — corregge i refusi nei NOMI delle categorie in produzione.
 *
 *     python scripts/server-tools/esegui.py correggi_refusi_categorie.php
 *     python scripts/server-tools/esegui.py correggi_refusi_categorie.php --applica
 *
 * Tocca SOLTANTO `categories.name`. Lo slug non si sfiora: è l'indirizzo
 * pubblico della sezione, e cambiarlo romperebbe i link già in giro e la
 * posizione su Google di tutti gli articoli che stanno dentro.
 *
 * Il nome invece si vede nel <title>, nella meta description, negli og: e nel
 * JSON-LD della pagina di sezione — quindi il refuso arriva fino ai risultati
 * di ricerca. È per questo che vale la pena correggerlo.
 *
 * Prima di scrivere lo script guarda anche ALTROVE: se la stessa stringa
 * sbagliata compare nei progetti o dentro il testo degli articoli, correggere
 * solo la categoria lascerebbe il sito che si contraddice da solo. Quelle
 * occorrenze non le tocca — le segnala e basta, perché sono testo d'autore.
 */

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');

$atteso = '__TOKEN__';
if (!isset($_GET['token']) || !hash_equals($atteso, (string)$_GET['token'])) {
    http_response_code(403);
    exit("403 — token mancante o sbagliato.\n");
}

$APPLICA = (($_GET['applica'] ?? '') === '1');

/**
 * [nome sbagliato esatto, nome giusto].
 *
 * DUE TRAPPOLE, tutte e due prese in faccia il 09/09/2026.
 *
 * 1. Il confronto dev'essere sensibile alle maiuscole, e in MySQL non lo è di
 *    suo: la collazione predefinita (utf8mb4_*_ci) fa sì che «=» e LIKE
 *    trattino «SIlente» e «Silente» come la stessa parola. Senza BINARY questo
 *    script giurava di aver trovato il refuso in diciotto articoli, dove
 *    invece la parola era scritta giusta. Di qui il BINARY in ogni confronto.
 *
 * 2. Nelle stringhe a doppi apici la variabile va SEMPRE fra graffe quando
 *    segue un carattere non ASCII: in PHP i byte ≥ 0x80 sono caratteri validi
 *    negli identificatori, quindi "«$male»" cerca la variabile «$male»» — che
 *    non esiste — e stampa il vuoto senza dire niente.
 */
$REFUSI = [
    ['Il Relitto SIlente', 'Il Relitto Silente'],
    ['Good VIbrations',    'Good Vibrations'],
];

/* ── Il database ─────────────────────────────────────────────────────────── */
$config = __DIR__ . '/../lib/config.php';
if (!is_file($config)) $config = __DIR__ . '/config.php';
require_once $config;

try {
    $pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    $pdo->exec('SET NAMES utf8mb4');
} catch (PDOException $e) {
    http_response_code(500);
    exit('500 — connessione fallita: ' . $e->getMessage() . "\n");
}

/* ── Che cosa si tocca, e che cosa no ────────────────────────────────────── */
$daFare   = [];
$problemi = [];

foreach ($REFUSI as $i => [$male, $bene]) {
    $n = $i + 1;
    $q = $pdo->prepare('SELECT id, name, slug FROM categories WHERE BINARY name = ?');
    $q->execute([$male]);
    $righe = $q->fetchAll();

    if (!$righe) {
        // Non è un errore da fermare tutto: può darsi che sia già corretto.
        $problemi[] = "#{$n}: nessuna categoria si chiama «{$male}» (già corretta?)";
        continue;
    }
    foreach ($righe as $r) {
        $daFare[] = [$r, $male, $bene];
        echo "#$n  categoria id {$r['id']}\n";
        echo "    slug   {$r['slug']}   (NON si tocca)\n";
        echo "    –  {$male}\n";
        echo "    +  {$bene}\n\n";
    }
}

/* ── Lo stesso refuso, altrove: si guarda e si riferisce ─────────────────── */
echo str_repeat('─', 72) . "\n";
echo "LO STESSO REFUSO ALTROVE (non lo tocco: è testo d'autore)\n";
echo str_repeat('─', 72) . "\n";

$altrove = [
    ['projects', 'name'], ['projects', 'description'],
    ['articles', 'title'], ['articles', 'excerpt'], ['articles', 'content'],
];
$trovatoAltrove = 0;
foreach ($REFUSI as [$male, $bene]) {
    foreach ($altrove as [$tab, $col]) {
        try {
            $q = $pdo->prepare("SELECT COUNT(*) FROM `{$tab}` WHERE BINARY `{$col}` LIKE ?");
            $q->execute(['%' . $male . '%']);
            $quanti = (int)$q->fetchColumn();
        } catch (Throwable $e) {
            echo "  $tab.$col — non leggibile ({$e->getMessage()})\n";
            continue;
        }
        if ($quanti > 0) {
            $trovatoAltrove += $quanti;
            echo "  ⚠ «{$male}» compare in {$tab}.{$col} — {$quanti} righe\n";
        }
    }
}
if ($trovatoAltrove === 0) echo "  nessuna: il refuso stava solo nel nome della categoria.\n";
echo "\n";

if ($problemi) foreach ($problemi as $p) echo "  nota — $p\n";
if (!$daFare) exit("\nNiente da correggere.\nESITO: OK\n");

/* ── Il backup, dentro la risposta ───────────────────────────────────────── */
echo str_repeat('═', 72) . "\n";
echo "BACKUP — i nomi PRIMA\n";
echo str_repeat('═', 72) . "\n";
echo json_encode(array_map(fn($x) => ['id' => (int)$x[0]['id'], 'slug' => $x[0]['slug'],
                                      'name' => $x[0]['name']], $daFare),
                 JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . "\n\n";

/* ── La scrittura ────────────────────────────────────────────────────────── */
$pdo->beginTransaction();
try {
    $u = $pdo->prepare('UPDATE categories SET name = ? WHERE id = ?');
    $toccate = 0;
    foreach ($daFare as [$r, $male, $bene]) {
        $u->execute([$bene, (int)$r['id']]);
        $toccate += $u->rowCount();
    }

    if ($APPLICA) {
        $pdo->commit();
        echo "SCRITTO davvero. Righe toccate: $toccate.\n";
    } else {
        $pdo->rollBack();
        echo "ANTEPRIMA: rollback fatto, il database non è cambiato.\n";
        echo "Per scrivere davvero: aggiungere --applica.\n";
    }
} catch (Throwable $e) {
    $pdo->rollBack();
    http_response_code(500);
    exit('500 — ' . $e->getMessage() . "\nESITO: INTERROTTO\n");
}

echo "\nESITO: OK\n";

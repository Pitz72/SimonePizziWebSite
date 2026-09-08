<?php
/**
 * ONE-SHOT — corregge il testo di un articolo in produzione.
 *
 * Si esegue col runner, che lo carica, lo lancia e lo cancella:
 *
 *     python scripts/server-tools/esegui.py correggi_articolo_react.php
 *     python scripts/server-tools/esegui.py correggi_articolo_react.php --applica
 *
 * Senza --applica fa tutto il lavoro dentro una transazione e poi ROLLBACK:
 * quello che stampa è esattamente quello che scriverebbe.
 *
 * COME LAVORA. Le correzioni sono coppie «cerca → sostituisci» su `content`,
 * `excerpt` e `title`, e ognuna dev'essere ESATTA e UNICA: se una stringa non
 * si trova, o si trova più volte, lo script si ferma e non scrive niente.
 * Un str_replace applicato a una stringa che compare due volte è il modo
 * classico di rovinare un testo senza accorgersene.
 *
 * Il backup del testo di prima esce nella risposta HTTP, non resta sul server.
 */

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');

/* ── La porta ────────────────────────────────────────────────────────────── */
$atteso = '__TOKEN__';
if (!isset($_GET['token']) || !hash_equals($atteso, (string)$_GET['token'])) {
    http_response_code(403);
    exit("403 — token mancante o sbagliato.\n");
}

$APPLICA = (($_GET['applica'] ?? '') === '1');

/* ── Che cosa si tocca ───────────────────────────────────────────────────── */
const SLUG = 'ho-scritto-un-manuale-su-react-ora-costruisco-senza-react';

/**
 * Le correzioni, in ordine. Ogni riga: [campo, testo esatto da trovare, nuovo].
 * Campi ammessi: content, excerpt, title.
 *
 * VUOTA AL PRIMO GIRO: così la prima esecuzione serve solo a leggere il testo
 * vero. Le stringhe da cercare si copiano da lì, non si ricostruiscono a
 * memoria — un accento o uno spazio diverso e la sostituzione non aggancia.
 */
$CORREZIONI = [
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

$q = $pdo->prepare('SELECT id, title, slug, excerpt, content, category, status, published_at
                    FROM articles WHERE slug = ? LIMIT 1');
$q->execute([SLUG]);
$a = $q->fetch();

if (!$a) { http_response_code(404); exit('404 — nessun articolo con slug ' . SLUG . "\n"); }

echo "ARTICOLO\n";
echo "  id            {$a['id']}\n";
echo "  titolo        {$a['title']}\n";
echo "  categoria     {$a['category']}\n";
echo "  stato         {$a['status']}\n";
echo "  esce il       " . ($a['published_at'] ?: '—') . "\n";
echo "  adesso sono le " . date('Y-m-d H:i:s') . " (fuso del server)\n";
echo '  content       ' . strlen($a['content']) . " byte\n\n";

/* ── Primo giro: non c'è niente da correggere, si legge e basta ──────────── */
if (!$CORREZIONI) {
    echo str_repeat('─', 72) . "\n";
    echo "TITLE\n" . str_repeat('─', 72) . "\n{$a['title']}\n\n";
    echo str_repeat('─', 72) . "\n";
    echo "EXCERPT\n" . str_repeat('─', 72) . "\n{$a['excerpt']}\n\n";
    echo str_repeat('─', 72) . "\n";
    echo "CONTENT\n" . str_repeat('─', 72) . "\n{$a['content']}\n\n";
    echo "(nessuna correzione impostata: questo giro era solo per leggere)\n";
    echo "ESITO: OK\n";
    exit;
}

/* ── I controlli, prima di toccare qualunque cosa ────────────────────────── */
$nuovi   = ['title' => $a['title'], 'excerpt' => (string)$a['excerpt'], 'content' => $a['content']];
$problemi = [];

foreach ($CORREZIONI as $i => [$campo, $cerca, $metti]) {
    $n = $i + 1;
    if (!array_key_exists($campo, $nuovi)) { $problemi[] = "#$n: campo «$campo» non ammesso"; continue; }

    $quante = substr_count($nuovi[$campo], $cerca);
    if ($quante === 0) { $problemi[] = "#$n ($campo): NON TROVATA — «" . mb_substr($cerca, 0, 70) . "…»"; continue; }
    if ($quante > 1)   { $problemi[] = "#$n ($campo): trovata $quante volte, dev'essere unica — «" . mb_substr($cerca, 0, 70) . "…»"; continue; }

    $nuovi[$campo] = str_replace($cerca, $metti, $nuovi[$campo]);
    echo "#$n  $campo\n";
    echo "    –  $cerca\n";
    echo "    +  $metti\n\n";
}

if ($problemi) {
    http_response_code(409);
    echo "FERMO: non scrivo niente. Ogni ricerca dev'essere esatta e unica.\n\n";
    foreach ($problemi as $p) echo "  $p\n";
    exit("\nESITO: INTERROTTO\n");
}

/* ── Il backup, dentro la risposta: sul server non resta niente ──────────── */
echo str_repeat('═', 72) . "\n";
echo "BACKUP — il testo PRIMA (per rimettere tutto com'era, se serve)\n";
echo str_repeat('═', 72) . "\n";
echo json_encode(
    ['id' => (int)$a['id'], 'slug' => $a['slug'], 'title' => $a['title'],
     'excerpt' => $a['excerpt'], 'content' => $a['content']],
    JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n\n";

/* ── La scrittura ────────────────────────────────────────────────────────── */
$pdo->beginTransaction();
try {
    $u = $pdo->prepare('UPDATE articles SET title = ?, excerpt = ?, content = ? WHERE id = ?');
    $u->execute([$nuovi['title'], $nuovi['excerpt'], $nuovi['content'], (int)$a['id']]);
    $toccate = $u->rowCount();

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

<?php
/**
 * ONE-SHOT — i link ai PDF rotti in due articoli pubblicati (22 ottobre 2026).
 *
 *     python scripts/server-tools/esegui.py correggi_link_pdf.php
 *     python scripts/server-tools/esegui.py correggi_link_pdf.php --applica
 *
 * Trovati confrontando le funzioni perse del React: i PDF caricati dal
 * pannello React stanno in uploads/documenti/, ma due articoli li linkano altrove.
 *
 *   21 «Ho scritto un manuale, e forse era inevitabile»: il PDF del manuale
 *      esiste, il link nel testo dimentica «documenti/» e dà 404.
 *   19 «Ritorno tra le stelle: Frequenza di servizio…»: il racconto è stato
 *      ritirato da Simone (farà parte di una raccolta più grande). Via il
 *      «CLICCA QUI PER LEGGERE O SCARICARE» e il pulsante «Scarica il
 *      Racconto», e in testa una riga datata che lo dice. Testo della riga
 *      scelto da Simone il 22/10.
 *
 * Come correggi_articolo_react.php: anteprima per default (tutto dentro una
 * transazione, poi ROLLBACK), ogni ricerca ESATTA e UNICA o non si scrive
 * niente, il backup dei campi toccati nella risposta HTTP. Le stringhe da
 * cercare sono copiate dal testo vero, letto il 22/10 da /api/articles.php.
 * Il sito lo mostra entro cinque minuti (CACHE_DURATA in lib/cache.php).
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

/* ── Che cosa si tocca ───────────────────────────────────────────────────── */
const NOTA_FREQUENZA = '<p><em>Aggiornamento del 22 ottobre 2026: il racconto non si scarica più. '
                     . 'Tornerà dentro una raccolta più grande.</em></p>';

$LAVORI = [
    21 => [
        'slug' => 'ho-scritto-un-manuale-e-forse-era-inevitabile-',
        'sostituzioni' => [
            ['https://simonepizzi.runtimeradio.it/uploads/69c4ea9ec86de-React-PHP-The-Thin-Stack.pdf',
             'https://simonepizzi.runtimeradio.it/uploads/documenti/69c4ea9ec86de-React-PHP-The-Thin-Stack.pdf'],
        ],
        'in_testa' => '',
        'pulsanti' => [],
    ],
    19 => [
        'slug' => 'ritorno-tra-le-stelle-frequenza-di-servizio-e-l-inizio-di-un-nuovo-viaggio',
        'sostituzioni' => [
            ['<p><a target="_blank" rel="noopener noreferrer nofollow" href="/uploads/69c15c14a347d-Frequenza_di_servizio.pdf"><strong>CLICCA QUI PER LEGGERE O SCARICARE</strong></a></p>',
             ''],
        ],
        'in_testa' => NOTA_FREQUENZA,
        // Il pulsante A portava al PDF ritirato; il B («Tutti i Progetti») resta.
        'pulsanti' => ['button_a_label' => '', 'button_a_link' => ''],
        'pulsante_atteso' => 'https://simonepizzi.runtimeradio.it/uploads/69c15c14a347d-Frequenza_di_servizio.pdf',
    ],
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

/* ── I controlli, prima di toccare qualunque cosa ────────────────────────── */
$problemi = [];
$nuovi = [];
$backup = [];

foreach ($LAVORI as $id => $lavoro) {
    $q = $pdo->prepare('SELECT id, slug, title, content, button_a_label, button_a_link, button_b_label,
                               button_b_link, updated_at FROM articles WHERE id = ? LIMIT 1');
    $q->execute([$id]);
    $a = $q->fetch();
    if (!$a)                             { $problemi[] = "#{$id}: l'articolo non c'è"; continue; }
    if ($a['slug'] !== $lavoro['slug'])  { $problemi[] = "#{$id}: lo slug è «{$a['slug']}», non quello atteso"; continue; }

    echo "ARTICOLO {$id} — {$a['title']}\n";
    $testo = (string)$a['content'];
    foreach ($lavoro['sostituzioni'] as $n => [$cerca, $metti]) {
        $quante = substr_count($testo, $cerca);
        if ($quante !== 1) {
            $problemi[] = "#{$id}.{$n}: trovata {$quante} volte, dev'essere una — «" . mb_substr($cerca, 0, 80) . "…»";
            continue;
        }
        $testo = str_replace($cerca, $metti, $testo);
        echo "  –  {$cerca}\n  +  " . ($metti === '' ? '(niente)' : $metti) . "\n";
    }
    if ($lavoro['in_testa'] !== '') {
        if (str_contains($testo, $lavoro['in_testa'])) {
            $problemi[] = "#{$id}: la nota in testa c'è già";
        } else {
            $testo = $lavoro['in_testa'] . "\n" . $testo;
            echo "  +  in testa: {$lavoro['in_testa']}\n";
        }
    }
    if (isset($lavoro['pulsante_atteso']) && (string)$a['button_a_link'] !== $lavoro['pulsante_atteso']) {
        $problemi[] = "#{$id}: il pulsante A porta a «{$a['button_a_link']}», non al PDF atteso";
    }
    foreach ($lavoro['pulsanti'] as $campo => $valore) {
        echo "  pulsante  {$campo}: «{$a[$campo]}» → «{$valore}»\n";
    }
    echo "\n";

    $nuovi[$id] = ['content' => $testo] + $lavoro['pulsanti'];
    $backup[$id] = $a;
}

if ($problemi) {
    http_response_code(409);
    echo "FERMO: non scrivo niente.\n\n";
    foreach ($problemi as $p) echo "  {$p}\n";
    exit("\nESITO: INTERROTTO\n");
}

/* ── Il backup, dentro la risposta: sul server non resta niente ──────────── */
echo str_repeat('═', 72) . "\nBACKUP — i campi PRIMA (per rimettere tutto com'era, se serve)\n"
   . str_repeat('═', 72) . "\n";
echo json_encode($backup, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n\n";

/* ── La scrittura ────────────────────────────────────────────────────────── */
$pdo->beginTransaction();
try {
    $toccate = 0;
    foreach ($nuovi as $id => $campi) {
        $campi['updated_at'] = date('Y-m-d H:i:s');
        $set = implode(', ', array_map(fn($c) => "{$c} = ?", array_keys($campi)));
        $u = $pdo->prepare("UPDATE articles SET {$set} WHERE id = ?");
        $u->execute([...array_values($campi), $id]);
        $toccate += $u->rowCount();
    }
    if ($APPLICA) {
        $pdo->commit();
        echo "SCRITTO davvero. Righe toccate: {$toccate}.\n";
    } else {
        $pdo->rollBack();
        echo "ANTEPRIMA: rollback fatto, il database non è cambiato. Righe che toccherei: {$toccate}.\n";
        echo "Per scrivere davvero: aggiungere --applica.\n";
    }
} catch (Throwable $e) {
    $pdo->rollBack();
    http_response_code(500);
    exit('500 — ' . $e->getMessage() . "\nESITO: INTERROTTO\n");
}

echo "\nESITO: OK\n";

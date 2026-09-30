<?php
/**
 * ONE-SHOT — toglie gli indirizzi email dal testo degli articoli in produzione.
 *
 *     python scripts/server-tools/esegui.py togli_email_articoli.php
 *     python scripts/server-tools/esegui.py togli_email_articoli.php --applica
 *
 * Il sito non scrive più nessun indirizzo: chi vuole contattare Simone usa il
 * modulo di /contatti (docs/2026-09-30-messaggistica.md). Quattro articoli però
 * ne avevano uno dentro il testo. Questo script sostituisce SOLTANTO i quattro
 * passaggi noti, ciascuno con la stessa frase ma con il link al modulo.
 *
 * Nessun cerca-e-sostituisci: è testo d'autore. Ogni passaggio deve comparire
 * UNA volta sola, identico al carattere; se in produzione il testo è cambiato
 * nel frattempo, lo script non lo tocca e lo dice. Poi guarda TUTTO il testo dei
 * contenuti (articoli, progetti, categorie) e riferisce ogni altro indirizzo
 * che trova, senza toccarlo: quelli si decidono a mano.
 *
 * Confronti esatti (BINARY nelle query, str_replace nel PHP): vedi le due
 * trappole in correggi_refusi_categorie.php.
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

/* Il link sta dentro <a> senza target: è una pagina di questo sito, non serve
   aprirla altrove. Le frasi restano quelle di Simone. */
$MODULO = '<a href="/contatti">modulo dei contatti</a>';
$LINK_MAIL = '<a target="_blank" rel="noopener noreferrer nofollow" href="mailto:%s">%s</a>';

/** [id articolo, passaggio com'è, passaggio come diventa] */
$SOSTITUZIONI = [
    [15,
     'Le nostre porte sono aperte presso <em>runtimeradio@gmail.com</em> e <em>info@runtimeradio.it</em>.',
     "Le nostre porte sono aperte dal {$MODULO}."],
    [30,
     'scrivimi direttamente a ' . sprintf($LINK_MAIL, 'simonepizzi.1972@proton.me', 'simonepizzi.1972@proton.me') . '.',
     "scrivimi dal {$MODULO}."],
    [78,
     'per posta a ' . sprintf($LINK_MAIL, 'runtimeradio@gmail.com', 'runtimeradio@gmail.com') . ', oppure su Telegram',
     "dal {$MODULO}, oppure su Telegram"],
    [79,
     'si chiede a ' . sprintf($LINK_MAIL, 'runtimeradio@gmail.com', 'runtimeradio@gmail.com') . ' o su Telegram',
     "si chiede dal {$MODULO} o su Telegram"],
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

$RE_EMAIL = '/[A-Za-z0-9._%+\-]+@[A-Za-z0-9\-]+(?:\.[A-Za-z0-9\-]+)*\.[A-Za-z]{2,}|mailto:/i';

/* ── I quattro passaggi ──────────────────────────────────────────────────── */
echo str_repeat('─', 72) . "\nI QUATTRO PASSAGGI\n" . str_repeat('─', 72) . "\n";

$daScrivere = [];   // id => nuovo contenuto
$backup     = [];
$problemi   = 0;
$nuovoPerId = [];   // per il controllo dei residui

foreach ($SOSTITUZIONI as [$id, $vecchio, $nuovo]) {
    $q = $pdo->prepare('SELECT id, title, slug, content FROM articles WHERE id = ?');
    $q->execute([$id]);
    $a = $q->fetch();
    if (!$a) { echo "#{$id}  NON TROVATO: niente da fare\n\n"; $problemi++; continue; }

    $contenuto = $nuovoPerId[$id] ?? (string)$a['content'];
    $quante = substr_count($contenuto, $vecchio);
    echo "#{$id}  {$a['title']}  (/{$a['slug']})\n";

    if ($quante === 1) {
        $nuovoPerId[$id] = str_replace($vecchio, $nuovo, $contenuto);
        $daScrivere[$id] = $nuovoPerId[$id];
        $backup[] = ['id' => $id, 'prima' => $vecchio, 'dopo' => $nuovo];
        echo "    –  {$vecchio}\n    +  {$nuovo}\n\n";
    } elseif ($quante === 0 && substr_count($contenuto, $nuovo) >= 1) {
        $nuovoPerId[$id] = $contenuto;
        echo "    già fatto: il passaggio nuovo c'è e quello vecchio no\n\n";
    } else {
        echo "    ⚠ NON LO TOCCO: il passaggio compare {$quante} volte invece di una (testo cambiato?)\n\n";
        $problemi++;
    }
}

/* ── Tutto il resto: si guarda e si riferisce ────────────────────────────── */
echo str_repeat('─', 72) . "\nALTRI INDIRIZZI NEI CONTENUTI (non li tocco)\n" . str_repeat('─', 72) . "\n";

$residui = 0;
$tabelle = ['articles' => null, 'projects' => null, 'categories' => null];
foreach ($tabelle as $tab => $_) {
    $cols = $pdo->prepare("SELECT COLUMN_NAME FROM information_schema.COLUMNS
                           WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                             AND DATA_TYPE IN ('varchar','text','mediumtext','longtext','tinytext')");
    $cols->execute([$tab]);
    $colonne = $cols->fetchAll(PDO::FETCH_COLUMN);
    if (!$colonne) { echo "  {$tab}: tabella o colonne non trovate\n"; continue; }

    $righe = $pdo->query('SELECT * FROM `' . $tab . '`')->fetchAll();
    foreach ($righe as $r) {
        foreach ($colonne as $c) {
            $testo = (string)($r[$c] ?? '');
            // Per gli articoli dei quattro passaggi si guarda il testo come sarebbe DOPO.
            if ($tab === 'articles' && $c === 'content' && isset($nuovoPerId[(int)$r['id']])) {
                $testo = $nuovoPerId[(int)$r['id']];
            }
            if ($testo === '' || !preg_match_all($RE_EMAIL, $testo, $m)) continue;
            $residui++;
            $titolo = $r['title'] ?? $r['name'] ?? $r['slug'] ?? '';
            echo "  ⚠ {$tab} #{$r['id']} ({$titolo}) — colonna {$c}: " . implode(', ', array_unique($m[0])) . "\n";
        }
    }
}
if ($residui === 0) echo "  nessuno: dopo questi quattro passaggi il sito non ha più indirizzi nel testo.\n";
echo "\n";

if (!$daScrivere) exit("Niente da scrivere.\nESITO: " . ($problemi ? 'CON PROBLEMI' : 'OK') . "\n");

/* ── Il backup, dentro la risposta ───────────────────────────────────────── */
echo str_repeat('═', 72) . "\nBACKUP — i passaggi PRIMA e DOPO (per tornare indietro: si rimette «prima»)\n" . str_repeat('═', 72) . "\n";
echo json_encode($backup, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . "\n\n";

/* ── La scrittura ────────────────────────────────────────────────────────── */
$pdo->beginTransaction();
try {
    $u = $pdo->prepare('UPDATE articles SET content = ? WHERE id = ?');
    $toccate = 0;
    foreach ($daScrivere as $id => $contenuto) {
        $u->execute([$contenuto, $id]);
        $toccate += $u->rowCount();
    }
    if ($APPLICA) {
        $pdo->commit();
        echo "SCRITTO davvero. Articoli toccati: {$toccate}.\n";
    } else {
        $pdo->rollBack();
        echo "ANTEPRIMA: rollback fatto, il database non è cambiato.\nPer scrivere davvero: aggiungere --applica.\n";
    }
} catch (Throwable $e) {
    $pdo->rollBack();
    http_response_code(500);
    exit('500 — ' . $e->getMessage() . "\nESITO: INTERROTTO\n");
}

echo "\nESITO: " . ($problemi ? 'CON PROBLEMI' : 'OK') . "\n";

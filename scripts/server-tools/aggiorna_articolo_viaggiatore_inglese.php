<?php
/**
 * ONE-SHOT — aggiunge all'articolo di Il Viaggiatore la sezione sull'inglese (lavoro in corso).
 *
 * Il Viaggiatore 1.40.0 (31 ottobre 2026) si gioca anche in inglese: il testo è tradotto, la voce
 * inglese è in lavorazione; e da quella versione il gioco si scarica e basta. Simone ha chiesto di
 * dirlo nell'articolo del Viaggiatore, che è PROGRAMMATO fra i prossimi in uscita (status 'published'
 * con published_at nel futuro, come lo intende lib/query.php): la sezione deve leggersi bene il giorno
 * in cui esce, non come un aggiornamento.
 *
 *     python scripts/server-tools/esegui.py scripts/server-tools/aggiorna_articolo_viaggiatore_inglese.php
 *     python scripts/server-tools/esegui.py scripts/server-tools/aggiorna_articolo_viaggiatore_inglese.php --applica
 *
 * Che cosa fa (in una transazione; in anteprima per default, ROLLBACK alla fine):
 *  - cerca gli articoli programmati (non ancora usciti) col Viaggiatore nel titolo: se è uno solo lavora su
 *    quello; se nessuno o più d'uno si ferma e li elenca (allora si scrive l'id in ID_ARTICOLO);
 *  - non tocca la data di uscita né lo stato;
 *  - se la sezione c'è già (il commento <!-- viaggiatore-inglese-1.40 -->) non fa niente: lanciarlo due
 *    volte non la raddoppia;
 *  - stampa il corpo di prima per intero (il backup torna nella risposta, non resta sul server);
 *  - aggiunge la sezione in fondo al corpo e aggiorna updated_at, come il pannello quando si salva;
 *  - elenca i punti del corpo e i pulsanti che portano ancora alla versione nel browser (GitHub Pages):
 *    non li tocca, perché il testo intorno va riletto da Simone.
 * L'articolo non è ancora uscito: la cache delle pagine pubbliche non lo tiene. Nel pannello si vede subito.
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

/** L'id dell'articolo, se la ricerca automatica non basta (null: l'unico programmato col Viaggiatore nel titolo). */
const ID_ARTICOLO = null;
const SEGNO = '<!-- viaggiatore-inglese-1.40 -->';

$SEZIONE = SEGNO . "\n" . <<<'HTML'
<h2>In corso: Il Viaggiatore in inglese</h2>
<p>Dalla versione 1.40.0, del 31 ottobre 2026, Il Viaggiatore si gioca anche in inglese, ed è un lavoro ancora in corso. Al primo avvio, prima dei loghi, una finestra chiede la lingua del testo, italiano o inglese, e la voce: il doppiaggio italiano, nessuna voce, o il lettore di schermo. Poi tutto si cambia dalle opzioni, anche a partita aperta.</p>
<p>La scelta di fondo è stata non toccare né il motore né i file <code>.fav</code>: la storia gira in italiano come sempre, e il gioco traduce il testo che il motore stampa nel momento in cui lo mostra, riconoscendolo frase per frase come già faceva il doppiaggio. Così le partite, i salvataggi e i trofei sono gli stessi nelle due lingue. Sono tradotti il racconto intero (circa diecimila parole), i nomi dei luoghi, delle cose e delle persone, l'interfaccia, il trailer e i titoli di coda; un collaudo gioca tutti i percorsi e pretende che ogni riga stampata abbia la sua traduzione.</p>
<p>In inglese si gioca coi pulsanti, perché il parser di FAVELLA capisce l'italiano: per questo c'è un trofeo solo dell'inglese, «Parola per parola», che prende il posto di quello dei comandi scritti e chiede di prendere dal testo, toccando la sua parola, ogni strada che il testo nomina. Il nome resta «Il Viaggiatore», in tutte e due le lingue.</p>
<p>Che cosa manca: la voce recitata in inglese, in lavorazione (per ora, col testo inglese, si ascolta il doppiaggio italiano o si gioca senza voce), e la rilettura di un madrelingua della traduzione, fatta come il resto del progetto con l'ausilio dei modelli Claude.</p>
<p>E da questa versione il gioco si scarica e basta, per Windows e Linux, dalla <a href="https://github.com/Pitz72/il-viaggiatore-favella/releases/latest">pagina delle release</a>: la versione da giocare nel browser, ferma alla 1.23.0 e solo in italiano, non si offre più.</p>
HTML;

/* ── Controlli prima di toccare qualcosa ─────────────────────────────────── */
$adesso = date('Y-m-d H:i:s');
$tutti = $pdo->query("SELECT id, title, status, published_at FROM articles WHERE title LIKE '%iaggiatore%' ORDER BY id DESC")->fetchAll();
echo "ARTICOLI COL VIAGGIATORE NEL TITOLO\n";
foreach ($tutti as $x) {
    $quando = $x['status'] === 'published' && $x['published_at'] !== null && $x['published_at'] > $adesso ? 'programmato' : $x['status'];
    echo "  {$x['id']}  {$quando}  " . ($x['published_at'] ?? '—') . "  {$x['title']}\n";
}
echo "\n";
if (ID_ARTICOLO !== null) {
    $id = ID_ARTICOLO;
} else {
    $programmati = array_values(array_filter($tutti, fn($x) => $x['status'] === 'published' && $x['published_at'] !== null && $x['published_at'] > $adesso));
    if (count($programmati) !== 1) {
        exit("Articoli programmati col Viaggiatore nel titolo: " . count($programmati) . ". Ne serve uno solo: scrivi il suo id in ID_ARTICOLO.\nESITO: INTERROTTO\n");
    }
    $id = (int)$programmati[0]['id'];
}
$q = $pdo->prepare('SELECT * FROM articles WHERE id = ? LIMIT 1');
$q->execute([$id]);
$a = $q->fetch();
if (!$a) exit("L'articolo {$id} non c'è.\nESITO: INTERROTTO\n");
if (mb_stripos((string)$a['title'], 'viaggiatore') === false) {
    exit("L'articolo {$id} si intitola «{$a['title']}»: non è quello del Viaggiatore.\nESITO: INTERROTTO\n");
}

echo "ARTICOLO\n";
echo "  id         {$a['id']}\n";
echo "  titolo     {$a['title']}\n";
echo "  slug       {$a['slug']}\n";
echo "  stato      {$a['status']}" . ($a['published_at'] !== null && $a['published_at'] > $adesso ? " (programmato: esce il {$a['published_at']})" : '') . "\n";
echo "  corpo      " . mb_strlen((string)$a['content']) . " caratteri\n";
echo "  modificato " . ($a['updated_at'] ?? '—') . "\n\n";

if (str_contains((string)$a['content'], SEGNO)) {
    exit("La sezione sull'inglese c'è già: non la aggiungo una seconda volta.\nESITO: OK\n");
}

// I punti che portano ancora alla versione nel browser: da rileggere, non da toccare alla cieca.
$web = [];
if (preg_match_all('~[^.<>]{0,90}(?:pitz72\.github\.io/il-viaggiatore-favella|nel browser|favella\.eu/esperimento)[^.<>]{0,90}~iu', (string)$a['content'], $m)) {
    $web = $m[0];
}
foreach (['a', 'b'] as $p) {
    $link = (string)($a["button_{$p}_link"] ?? '');
    if ($link !== '' && preg_match('~pitz72\.github\.io/il-viaggiatore-favella|/esperimento~i', $link)) {
        $web[] = "pulsante {$p}: «" . ($a["button_{$p}_label"] ?? '') . "» → {$link}";
    }
}
echo "DA RILEGGERE (la versione nel browser non si offre più)\n";
echo $web ? "  · " . implode("\n  · ", array_map('trim', $web)) . "\n\n" : "  niente\n\n";

/* ── La scrittura ────────────────────────────────────────────────────────── */
$nuovo = rtrim((string)$a['content']) . "\n\n" . $SEZIONE . "\n";
$pdo->beginTransaction();
try {
    $u = $pdo->prepare('UPDATE articles SET content = ?, updated_at = ? WHERE id = ?');
    $u->execute([$nuovo, $adesso, $id]);
    echo "SEZIONE AGGIUNTA IN FONDO (" . mb_strlen($SEZIONE) . " caratteri; il corpo passa a " . mb_strlen($nuovo) . ")\n\n";
    if ($APPLICA) {
        $pdo->commit();
        echo "Scritto.\n\n";
    } else {
        $pdo->rollBack();
        echo "ANTEPRIMA: niente è stato scritto (ROLLBACK). Per scrivere: --applica\n\n";
    }
} catch (Throwable $e) {
    $pdo->rollBack();
    exit("Errore: " . $e->getMessage() . "\nESITO: INTERROTTO\n");
}

echo "BACKUP — IL CORPO DI PRIMA, PER INTERO\n";
echo "----------------------------------------\n";
echo $a['content'] . "\n";
echo "----------------------------------------\n";
echo "ESITO: OK\n";

<?php
/**
 * UNIONE TAG DOPPIONI — fix di dati one-shot.
 *
 * Non è una migrazione di schema: non tocca colonne né tabelle, quindi NON va in
 * `db_maintenance.php`. È esattamente il caso in cui il pattern
 * "script in /api/ → esegui → cancella" resta valido.
 *
 * Fa per tutte le coppie quello che il pulsante *Unisci* del pannello fa per una
 * (`public/api/tags.php`, ramo `action === 'merge'`). Quattro passi, in ordine,
 * dentro UNA transazione:
 *
 *   1. INSERT IGNORE delle righe di `article_tags` dal tag assorbito a quello di
 *      destinazione (IGNORE perché un articolo può già avere entrambi i tag);
 *   2. DELETE delle righe del tag assorbito da `article_tags`;
 *   3. DELETE del tag assorbito da `tags`;
 *   4. riallineamento della colonna legacy `articles.tags`.
 *
 * Il passo 4 non è decorativo: `search.php` cerca ancora dentro quella colonna
 * CSV. Uno script che si ferma al passo 3 lascia la ricerca a puntare a un tag
 * che non esiste più.
 *
 * USO — non a mano: lo carica, lo esegue e lo cancella
 * `scripts/server-tools/esegui_unione_tag.py`, che genera un token nuovo a ogni
 * giro e non lascia il file online più dei secondi che servono.
 *
 *   ?token=…            anteprima: fa tutto il lavoro e poi ROLLBACK
 *   ?token=…&applica=1  esegue davvero e fa COMMIT
 *
 * L'anteprima non è una simulazione: i numeri che stampa sono quelli veri,
 * misurati sulle righe toccate, buttati via alla fine.
 */

require_once 'db.php';

// Il runner sostituisce il segnaposto con un token casuale a ogni caricamento.
define('TOKEN', '__TOKEN__');

header('Content-Type: text/plain; charset=UTF-8');

if (!hash_equals(TOKEN, (string)($_GET['token'] ?? ''))) {
    http_response_code(403);
    exit("Accesso negato.\n");
}

$applica = (($_GET['applica'] ?? '') === '1');

// ── PIANO DI UNIONE ──────────────────────────────────────────────────────────
// [id_assorbito, id_destinazione, nota] — la DESTINAZIONE sopravvive, col suo
// nome e il suo slug; l'assorbito sparisce e il suo /tag/<slug> inizia a dare 404.
//
// Criterio deciso il 20/08/2026: vince la forma leggibile, con gli spazi, anche
// quando ha meno articoli dell'altra. I tag attaccati sono il residuo dell'epoca
// in cui il pannello SEO premiava gli hashtag, ed è proprio quello che la v1.27.0
// ha smesso di fare. Unica eccezione: 'webradio', che è parola unica corretta.
$PIANO = [
    [122,   4, "avventuratestuale -> Avventura Testuale"],
    [205, 190, "canalitelegram -> canali telegram (recupera un tag orfano)"],
    [289, 288, "favella1 -> Favella 1"],
    [115,  52, "frequenzadichiamata -> Frequenza di Chiamata"],
    [206,  25, "IlRelittoSilente -> Il Relitto Silente"],
    [173,  29, "intelligenzaartificiale -> intelligenza artificiale"],
    [124, 125, "interactivefiction -> interactive fiction"],
    [ 86,  84, "lawebradiogeek -> la web radio geek"],
    [100,  19, "linguaggiodiprogrammazione -> Linguaggio di Programmazione"],
    [103, 101, "linguaggioesoterico -> linguaggio esoterico"],
    [175,   9, "narrativainterattiva -> Narrativa Interattiva"],
    [113,  54, "raccontiliberi -> Racconti Liberi"],
    [114,  53, "raccontodifantascienza -> Racconto di Fantascienza"],
    [163,  15, "regiaaudio -> Regia Audio"],
    [ 83,  30, "runtimeradio -> runtime radio"],
    [119,  73, "runtimetelegrambot -> runtime telegrambot"],
    [189, 120, "runtimetelegrambottitanedition -> runtime telegrambot titan edition"],
    [107,  56, "simonepizzi -> simone pizzi"],
    [108,  60, "simonepizziwebsite -> simone pizzi web site"],
    [183,  41, "sitoweb -> sito web"],
    [141,  45, "sviluppoweb -> sviluppo web"],
    [249,  79, "web radio -> webradio (eccezione: parola unica corretta)"],
];

try {
    $pdo = Database::connect();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo $applica ? "MODALITA': ESECUZIONE REALE\n" : "MODALITA': ANTEPRIMA (rollback finale)\n";
    echo str_repeat('=', 78) . "\n\n";

    $prima = (int)$pdo->query("SELECT COUNT(*) FROM tags")->fetchColumn();

    // Backup della colonna legacy: torna a casa nella risposta, così non resta
    // niente sul server e Simone ha di che ricostruire se qualcosa va storto.
    echo "--- BACKUP articles.tags (id<TAB>tags) ---\n";
    foreach ($pdo->query("SELECT id, tags FROM articles ORDER BY id") as $r) {
        echo $r['id'] . "\t" . str_replace(["\r", "\n"], ' ', (string)$r['tags']) . "\n";
    }
    echo "--- FINE BACKUP ---\n\n";

    $pdo->beginTransaction();

    $insert = $pdo->prepare(
        "INSERT IGNORE INTO article_tags (article_id, tag_id)
         SELECT article_id, ? FROM article_tags WHERE tag_id = ?"
    );
    $svuota    = $pdo->prepare("DELETE FROM article_tags WHERE tag_id = ?");
    $cancella  = $pdo->prepare("DELETE FROM tags WHERE id = ?");
    $riallinea = $pdo->prepare(
        "UPDATE articles a
            SET a.tags = COALESCE((
                SELECT GROUP_CONCAT(t.name ORDER BY t.name ASC SEPARATOR ', ')
                  FROM article_tags atx JOIN tags t ON t.id = atx.tag_id
                 WHERE atx.article_id = a.id
            ), '')
          WHERE a.id IN (SELECT article_id FROM article_tags WHERE tag_id = ?)"
    );
    $esiste = $pdo->prepare("SELECT id, name FROM tags WHERE id = ?");

    $fatte = 0; $spostate = 0; $saltate = 0;

    foreach ($PIANO as [$da, $a, $nota]) {
        $esiste->execute([$da]); $tagDa   = $esiste->fetch();
        $esiste->execute([$a]);  $tagVerso = $esiste->fetch();

        if (!$tagDa || !$tagVerso) {
            // Il piano è del 20/08/2026: se un tag è già stato unito a mano
            // saltiamo la riga invece di far fallire tutto il giro.
            echo sprintf("SALTATO  %-64s (id assente)\n", $nota);
            $saltate++;
            continue;
        }

        $insert->execute([$a, $da]);
        $svuota->execute([$da]);
        $n = $svuota->rowCount();
        $cancella->execute([$da]);
        $riallinea->execute([$a]);

        echo sprintf("ok       %-64s %3d righe\n", $nota, $n);
        $fatte++;
        $spostate += $n;
    }

    $dopo = (int)$pdo->query("SELECT COUNT(*) FROM tags")->fetchColumn();

    echo "\n" . str_repeat('-', 78) . "\n";
    echo "Unioni: $fatte" . ($saltate ? " (saltate: $saltate)" : '') . "\n";
    echo "Righe di article_tags spostate: $spostate\n";
    echo "Tag: $prima -> $dopo\n";

    if ($applica) {
        $pdo->commit();
        echo "\nCOMMIT eseguito. Le modifiche sono definitive.\n";
    } else {
        $pdo->rollBack();
        echo "\nROLLBACK eseguito: il database e' esattamente com'era.\n";
        echo "Per applicare davvero, rilanciare con --applica.\n";
    }

    echo "\nESITO: OK\n";

} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    error_log('unisci_tag_doppioni: ' . $e->getMessage());
    echo "\nERRORE: " . $e->getMessage() . "\n";
    echo "Transazione annullata, il database e' com'era prima.\n";
    echo "\nESITO: ERRORE\n";
}

<?php
/**
 * MIGRAZIONE v1.27.0 — colonna articles.focus_keyword
 *
 * Aggiunge la "parola chiave principale" dell'articolo: il termine su cui il
 * pezzo vuole posizionarsi. Fino alla v1.26.1 quel ruolo era svolto — male —
 * dal PRIMO TAG: il pannello SEO assegnava il punto solo se tags[0] compariva
 * letteralmente nel titolo o nell'excerpt. Risultato: un tag inventato per ogni
 * articolo (208 tag usati una volta sola) solo per far salire il punteggio.
 * La parola chiave è un dato dell'articolo, non una tassonomia: qui diventa una
 * colonna sua e i tag tornano a fare i tag.
 *
 * COME SI USA (procedura standard del progetto, vedi README di questa cartella):
 *   1. Caricare questo file via SFTP in  ~/simonepizzi.runtimeradio.it/api/
 *   2. Aprirlo nel browser DA LOGGATO nel pannello admin:
 *        https://simonepizzi.runtimeradio.it/api/migrate_focus_keyword.php
 *      (di default è una PROVA A VUOTO: mostra cosa farebbe, senza toccare nulla)
 *   3. Se il referto è quello atteso, rieseguire con  ?go=1  per applicare.
 *   4. ELIMINARE SUBITO il file dal server e verificare che dia 404.
 *
 * È idempotente: rieseguirlo non fa danni, si accorge se la colonna c'è già.
 */

require_once 'db.php';
require_once 'auth_helper.php';
Auth::check(); // sessione admin obbligatoria

header('Content-Type: text/plain; charset=utf-8');

$apply = isset($_GET['go']) && $_GET['go'] === '1';
$pdo   = Database::connect();

echo "MIGRAZIONE focus_keyword — " . ($apply ? "APPLICAZIONE" : "PROVA A VUOTO (aggiungi ?go=1 per applicare)") . "\n";
echo str_repeat('-', 68) . "\n\n";

try {
    // 1. La colonna esiste già?
    $exists = $pdo->query("SHOW COLUMNS FROM articles LIKE 'focus_keyword'")->fetch();

    if ($exists) {
        echo "[=] La colonna 'focus_keyword' esiste già. Niente da fare.\n";
    } else {
        echo "[ ] Colonna 'focus_keyword' assente.\n";
        echo "    SQL: ALTER TABLE articles ADD COLUMN focus_keyword VARCHAR(120) NULL AFTER excerpt\n";
        if ($apply) {
            $pdo->exec("ALTER TABLE articles ADD COLUMN focus_keyword VARCHAR(120) NULL AFTER excerpt");
            echo "[OK] Colonna creata.\n";
        } else {
            echo "    (non applicata: prova a vuoto)\n";
        }
    }

    echo "\n";

    // 2. Proposta di valore iniziale: il primo tag di ogni articolo è, di fatto,
    //    la parola chiave che il vecchio pannello valutava. Lo riusiamo come
    //    punto di partenza SOLO se compare davvero nel titolo o nell'excerpt —
    //    altrimenti non era una parola chiave, era un'etichetta qualsiasi.
    $rows = $pdo->query(
        "SELECT a.id, a.title, a.excerpt,
                (SELECT t.name FROM article_tags atx
                   JOIN tags t ON t.id = atx.tag_id
                  WHERE atx.article_id = a.id
                  ORDER BY atx.tag_id ASC LIMIT 1) AS first_tag
           FROM articles a"
    )->fetchAll(PDO::FETCH_ASSOC);

    $proposed = 0;
    $skipped  = 0;

    $upd = $exists || $apply
        ? $pdo->prepare("UPDATE articles SET focus_keyword = ? WHERE id = ? AND (focus_keyword IS NULL OR focus_keyword = '')")
        : null;

    foreach ($rows as $r) {
        $tag = trim((string)$r['first_tag']);
        if ($tag === '') { $skipped++; continue; }

        $haystack = mb_strtolower($r['title'] . ' ' . strip_tags((string)$r['excerpt']));
        if (mb_strpos($haystack, mb_strtolower($tag)) === false) { $skipped++; continue; }

        $proposed++;
        if ($apply && $upd) $upd->execute([mb_substr($tag, 0, 120), $r['id']]);
    }

    echo "Articoli totali:                      " . count($rows) . "\n";
    echo "Parola chiave proposta dal primo tag: $proposed\n";
    echo "Lasciati vuoti (da compilare a mano): $skipped\n";
    echo "\n";
    echo $apply
        ? "[OK] Migrazione completata. ORA ELIMINA QUESTO FILE DAL SERVER.\n"
        : "Nessuna modifica scritta. Rieseguire con ?go=1 per applicare.\n";

} catch (Exception $e) {
    http_response_code(500);
    echo "\n[ERRORE] " . $e->getMessage() . "\n";
    echo "Nessuna modifica parziale da temere: l'ALTER TABLE è atomico.\n";
}

<?php
// public/api/db_maintenance.php
//
// [v1.27.0] MIGRAZIONI PIGRE — schema che si aggiorna da solo al primo uso.
//
// Prima di questo file ogni modifica allo schema richiedeva uno script one-shot
// caricato via SFTP in api/, aperto dal browser e cancellato subito dopo: tre
// passaggi manuali, ognuno dimenticabile, con uno script pericoloso che resta
// online nel frattempo. Lo stesso schema adottato su SitoRuntime elimina il
// problema alla radice: la migrazione vive dentro l'endpoint che ne ha bisogno
// e si applica alla prima chiamata utile. Il deploy è di nuovo un solo passaggio.
//
// Regole:
// - ogni ensure* è idempotente e protetta da uno `static $done` (una sola
//   verifica per richiesta, non una per chiamata);
// - ogni ensure* registra il proprio nome in `schema_version`, così lo schema
//   è ricostruibile leggendo il database invece dei nomi dei file;
// - una migrazione non deve MAI rompere l'endpoint che la ospita: se fallisce
//   (permessi mancanti, tabella bloccata) si registra nel log e si prosegue
//   con il comportamento "colonna assente".

/**
 * Registro delle migrazioni applicate.
 */
function ensureSchemaVersionTable(PDO $db): void {
    static $done = false;
    if ($done) return;
    $db->exec("CREATE TABLE IF NOT EXISTS schema_version (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration VARCHAR(190) NOT NULL UNIQUE,
        note VARCHAR(255) NULL,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $done = true;
}

/** Idempotente: annota una migrazione se non è già registrata. */
function recordMigration(PDO $db, string $name, string $note = ''): void {
    try {
        ensureSchemaVersionTable($db);
        $db->prepare("INSERT IGNORE INTO schema_version (migration, note) VALUES (?, ?)")
           ->execute([$name, $note]);
    } catch (PDOException $e) {
        // Il registro non deve mai rompere l'endpoint che lo chiama
        error_log('db_maintenance [schema_version]: ' . $e->getMessage());
    }
}

/**
 * Migrazione pigra: colonna `articles.focus_keyword`.
 *
 * Parola chiave principale dell'articolo, valutata dal pannello SEO. Fino alla
 * v1.26.1 quel ruolo lo faceva il PRIMO TAG: il punteggio saliva solo se
 * `tags[0]` compariva nel titolo o nell'excerpt, e questo spingeva a inventare
 * un tag su misura per ogni articolo (208 tag usati una volta sola). La parola
 * chiave è un dato dell'articolo, non una tassonomia: qui prende una colonna sua.
 *
 * Ritorna true se la colonna è utilizzabile.
 */
function ensureFocusKeyword(PDO $db): bool {
    static $ok = null;
    if ($ok !== null) return $ok;

    try {
        $col = $db->query("SHOW COLUMNS FROM articles LIKE 'focus_keyword'")->fetch();
        if (!$col) {
            $db->exec("ALTER TABLE articles ADD COLUMN focus_keyword VARCHAR(120) NULL AFTER excerpt");
            error_log('db_maintenance: creata colonna articles.focus_keyword');
        }
        recordMigration($db, '2026-08-12_articles_focus_keyword',
            'Parola chiave SEO separata dai tag (v1.27.0)');
        $ok = true;
    } catch (Throwable $e) {
        // Fail-soft: senza la colonna l'articolo si salva lo stesso, semplicemente
        // la parola chiave non viene persistita. Meglio di un salvataggio rotto.
        error_log('db_maintenance [focus_keyword] FALLITA: ' . $e->getMessage());
        $ok = false;
    }

    return $ok;
}

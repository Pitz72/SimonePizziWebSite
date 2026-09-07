<?php
/**
 * Migrazioni pigre: lo schema si aggiorna da solo alla prima occasione utile.
 *
 * Il protocollo è quello adottato alla v1.27.0 e già in uso su Runtime: niente
 * più script one-shot caricati via SFTP, aperti dal browser e cancellati
 * subito dopo — tre passaggi manuali, ognuno dimenticabile, con uno script
 * pericoloso che resta online nel frattempo. La migrazione vive dentro il
 * codice che ne ha bisogno e si applica quando serve.
 *
 * Regole, invariate:
 * - ogni ensure* è idempotente e protetta da uno `static`, così la verifica si
 *   fa una volta per richiesta e non una per chiamata;
 * - ogni ensure* si registra in `schema_version`, così lo schema si ricostruisce
 *   leggendo il database invece dei nomi dei file;
 * - una migrazione non deve MAI rompere la pagina che la ospita: se fallisce si
 *   scrive nel log e si prosegue con il comportamento «colonna assente».
 *
 * In sviluppo non girano: lì lo schema lo costruisce
 * scripts/sviluppo/crea-db-sviluppo.php, e SHOW COLUMNS non esiste in SQLite.
 */

declare(strict_types=1);

function registro_migrazioni(PDO $db): void {
    static $fatto = false;
    if ($fatto) return;
    $db->exec("CREATE TABLE IF NOT EXISTS schema_version (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration VARCHAR(190) NOT NULL UNIQUE,
        note VARCHAR(255) NULL,
        applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $fatto = true;
}

function annota_migrazione(PDO $db, string $nome, string $nota = ''): void {
    try {
        registro_migrazioni($db);
        $db->prepare("INSERT IGNORE INTO schema_version (migration, note) VALUES (?, ?)")
           ->execute([$nome, $nota]);
    } catch (PDOException $e) {
        error_log('db_maintenance [schema_version]: ' . $e->getMessage());
    }
}

/** C'è già questa colonna? Domanda che si fa solo a MySQL. */
function colonna_esiste(PDO $db, string $tabella, string $colonna): bool {
    return (bool)$db->query("SHOW COLUMNS FROM `$tabella` LIKE " . $db->quote($colonna))->fetch();
}

/**
 * `articles.seo_title` e `articles.seo_description`.
 *
 * I due testi che una persona legge su Google prima di decidere se entrare.
 * Finora erano il titolo dell'articolo e l'excerpt, che però sono scritti per
 * chi è già dentro: un titolo da 90 caratteri su Google viene tagliato a metà.
 * Il Festival e Runtime li hanno dalle rispettive v1.14.0 e v2.35.0; questo
 * sito è l'ultimo dei tre.
 *
 * Restano facoltativi: se vuoti valgono titolo ed excerpt, come oggi.
 */
function assicura_colonne_seo(PDO $db): bool {
    static $ok = null;
    if ($ok !== null) return $ok;
    if (IN_SVILUPPO) return $ok = true;

    try {
        foreach ([
            'seo_title'       => "ALTER TABLE articles ADD COLUMN seo_title VARCHAR(70) NULL AFTER title",
            'seo_description' => "ALTER TABLE articles ADD COLUMN seo_description VARCHAR(200) NULL AFTER excerpt",
        ] as $colonna => $sql) {
            if (!colonna_esiste($db, 'articles', $colonna)) {
                $db->exec($sql);
                error_log("db_maintenance: creata colonna articles.$colonna");
            }
        }
        annota_migrazione($db, '2026-09-07_articles_seo_title_description',
            'Titolo e descrizione per Google, separati da titolo ed excerpt');
        $ok = true;
    } catch (Throwable $e) {
        error_log('db_maintenance [colonne seo] FALLITA: ' . $e->getMessage());
        $ok = false;
    }
    return $ok;
}

/**
 * `projects.stato`.
 *
 * L'etichetta che dice a che punto è un progetto: in corso, pubblicato, open
 * source, archiviato. È il dato su cui poggia la direzione grafica scelta il 7
 * settembre, e nel sito di prima non esisteva da nessuna parte — eppure è la
 * cosa che racconta meglio come si lavora qui: TelegramBot venduto zero copie e
 * poi aperto, FeedDownloader uscito dal mercato, Sbargold archiviato.
 *
 * Nasce vuota, e finché è vuota l'etichetta non si stampa: meglio niente che
 * un'etichetta finta. Sono sedici valori da mettere una volta sola dal pannello.
 */
function assicura_stato_progetti(PDO $db): bool {
    static $ok = null;
    if ($ok !== null) return $ok;
    if (IN_SVILUPPO) return $ok = true;

    try {
        if (!colonna_esiste($db, 'projects', 'stato')) {
            $db->exec("ALTER TABLE projects ADD COLUMN stato VARCHAR(20) NULL AFTER category");
            error_log('db_maintenance: creata colonna projects.stato');
        }
        annota_migrazione($db, '2026-09-07_projects_stato',
            'Stato dichiarato di ogni progetto (in_corso, pubblicato, open_source, archiviato)');
        $ok = true;
    } catch (Throwable $e) {
        error_log('db_maintenance [stato progetti] FALLITA: ' . $e->getMessage());
        $ok = false;
    }
    return $ok;
}

/** Tutte insieme, all'ingresso nel pannello: è il primo momento utile. */
function assicura_schema(PDO $db): void {
    assicura_colonne_seo($db);
    assicura_stato_progetti($db);
}

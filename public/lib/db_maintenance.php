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

/**
 * La messaggistica: `messages.status`, `messages.reply_token` e la tabella
 * `message_replies`.
 *
 * Il modulo contatti era un elenco da leggere: il messaggio arrivava, Simone lo
 * leggeva nel pannello e rispondeva dal suo programma di posta, con il suo
 * indirizzo. Adesso la conversazione resta dentro il sito (lib/contatti.php):
 * la risposta parte dal pannello, e chi la riceve continua da una pagina del
 * sito con un link personale. Servono tre cose che prima non c'erano.
 *
 *  - `status` (new / read / replied / archived): dice a che punto è la
 *    conversazione. `read_at` resta com'è, per lo storico. Le righe già
 *    presenti prendono lo stato dalla loro `read_at`.
 *  - `reply_token`: il gettone della pagina /messaggio, 32 caratteri
 *    esadecimali, uno per conversazione, creato alla prima risposta.
 *  - `message_replies`: le risposte, con `direction` = 'out' se le ha scritte
 *    Simone e 'in' se le ha scritte chi aveva scritto.
 *
 * La chiamano sia il pannello sia le due pagine pubbliche (/contatti e
 * /messaggio): il primo messaggio può arrivare prima che qualcuno entri.
 * Chi la chiama da lì paga un SHOW COLUMNS una volta per richiesta, e solo su
 * quelle due pagine.
 */
function assicura_messaggistica(PDO $db): bool {
    static $ok = null;
    if ($ok !== null) return $ok;
    if (IN_SVILUPPO) return $ok = true;

    try {
        // La tabella di partenza c'è in produzione da sempre; qui è la rete di sicurezza.
        $db->exec("CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(254) NOT NULL,
            subject VARCHAR(200) NOT NULL DEFAULT '',
            message TEXT NOT NULL,
            ip_hash VARCHAR(64) DEFAULT NULL,
            read_at DATETIME DEFAULT NULL,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        if (!colonna_esiste($db, 'messages', 'status')) {
            $db->exec("ALTER TABLE messages ADD COLUMN status VARCHAR(12) NOT NULL DEFAULT 'new'");
            $db->exec("UPDATE messages SET status = 'read' WHERE read_at IS NOT NULL");
            error_log('db_maintenance: creata colonna messages.status');
        }
        if (!colonna_esiste($db, 'messages', 'reply_token')) {
            $db->exec("ALTER TABLE messages ADD COLUMN reply_token CHAR(32) NULL,
                       ADD UNIQUE KEY uq_messages_reply_token (reply_token)");
            error_log('db_maintenance: creata colonna messages.reply_token');
        }
        $db->exec("CREATE TABLE IF NOT EXISTS message_replies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message_id INT NOT NULL,
            body TEXT NOT NULL,
            sent_by VARCHAR(120) NOT NULL DEFAULT '',
            sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            delivered TINYINT(1) NOT NULL DEFAULT 1,
            direction VARCHAR(3) NOT NULL DEFAULT 'out',
            KEY idx_message_replies_message (message_id, sent_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

        annota_migrazione($db, '2026-09-30_messaggistica',
            'Conversazioni: messages.status, messages.reply_token, tabella message_replies');
        $ok = true;
    } catch (Throwable $e) {
        error_log('db_maintenance [messaggistica] FALLITA: ' . $e->getMessage());
        $ok = false;
    }
    return $ok;
}

/**
 * La newsletter e la posta in uscita (8 ottobre 2026): il consenso si registra
 * con la sua prova, gli invii vanno a lotti con un registro per destinatario, la
 * posta eccedente il tetto orario si accoda, e le impostazioni stanno in
 * app_settings (la tabella che il vecchio pannello già usava per il backup).
 */
function assicura_newsletter(PDO $db): bool {
    static $ok = null;
    if ($ok !== null) return $ok;
    if (IN_SVILUPPO) return $ok = true;

    $colonne = [
        'subscribers' => [
            'consent_at'      => 'DATETIME NULL',
            'consent_text'    => 'TEXT NULL',
            'consent_version' => 'VARCHAR(20) NULL',
            'consent_source'  => 'VARCHAR(40) NULL',
            'confirm_sent_at' => 'DATETIME NULL',
            'unsubscribed_at' => 'DATETIME NULL',
        ],
        'newsletter_sends' => [
            'tipo'           => "VARCHAR(12) NOT NULL DEFAULT 'news'",
            'stato'          => "VARCHAR(12) NOT NULL DEFAULT 'inviata'",
            'html'           => 'MEDIUMTEXT NULL',
            'articoli'       => 'TEXT NULL',
            'cursore'        => 'INT NOT NULL DEFAULT 0',
            'totale'         => 'INT NOT NULL DEFAULT 0',
            'inviate'        => 'INT NOT NULL DEFAULT 0',
            'fallite'        => 'INT NOT NULL DEFAULT 0',
            'prossimo_lotto' => 'DATETIME NULL',
            'avviata_il'     => 'DATETIME NULL',
        ],
    ];
    try {
        foreach ($colonne as $tabella => $cols) {
            foreach ($cols as $colonna => $definizione) {
                if (!colonna_esiste($db, $tabella, $colonna)) {
                    $db->exec("ALTER TABLE `$tabella` ADD COLUMN `$colonna` $definizione");
                    error_log("db_maintenance: creata colonna $tabella.$colonna");
                }
            }
        }
        $db->exec("CREATE TABLE IF NOT EXISTS newsletter_destinatari (
            id INT AUTO_INCREMENT PRIMARY KEY,
            send_id INT NOT NULL,
            subscriber_id INT NOT NULL,
            email VARCHAR(254) NOT NULL,
            esito VARCHAR(8) NOT NULL,
            errore VARCHAR(255) NULL,
            at DATETIME NOT NULL,
            UNIQUE KEY uq_nl_destinatario (send_id, subscriber_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $db->exec("CREATE TABLE IF NOT EXISTS mail_invii (
            id INT AUTO_INCREMENT PRIMARY KEY,
            at DATETIME NOT NULL,
            priorita VARCHAR(8) NOT NULL,
            KEY ix_mail_invii_at (at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $db->exec("CREATE TABLE IF NOT EXISTS mail_coda (
            id INT AUTO_INCREMENT PRIMARY KEY,
            a VARCHAR(254) NOT NULL,
            oggetto VARCHAR(255) NOT NULL,
            html MEDIUMTEXT NOT NULL,
            opz TEXT NULL,
            priorita VARCHAR(8) NOT NULL,
            tentativi INT NOT NULL DEFAULT 0,
            prossimo DATETIME NOT NULL,
            creato DATETIME NOT NULL,
            KEY ix_mail_coda_prossimo (prossimo)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        $db->exec("CREATE TABLE IF NOT EXISTS app_settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        annota_migrazione($db, '2026-10-08_newsletter_consenso_lotti',
            'Consenso con prova, registro dei destinatari, coda della posta, impostazioni');
        $ok = true;
    } catch (Throwable $e) {
        error_log('db_maintenance [newsletter] FALLITA: ' . $e->getMessage());
        $ok = false;
    }
    return $ok;
}

/** Tutte insieme, all'ingresso nel pannello: è il primo momento utile. */
/* ══════════════════════ Le impronte (16 ottobre 2026) ═════════════════════
   Revisione del 16 ottobre, M15. Il sito teneva quattro specie di impronte
   degli indirizzi, e nessuna era anonima come diceva l'informativa:

     login_attempts.ip_address   l'IP in chiaro, a ogni tentativo di login;
     article_reactions.voter_hash  sha256(IP + browser), per sempre;
     article_views.ip_hash       sha256(IP + data), per sempre;
     cta_clicks.ip_hash          sha256(IP + minuto), per sempre;
     messages.ip_hash            sha256(IP), fino alla cancellazione dei messaggi.

   Uno sha256 senza chiave di un IPv4 si ricalcola provando i quattro miliardi
   di indirizzi. Da oggi le impronte nuove sono HMAC con la chiave segreta del
   sito (lib/freno.php), e le vecchie si sostituiscono con un segnaposto che
   non dice niente («storico-» e l'id della riga): i conteggi restano, il
   legame con chi c'era no. Una impronta serve solo finché serve: quella di una
   lettura per il giorno in cui conta una lettura sola, quella di un messaggio
   per l'ora del freno. Dopo, la toglie il giro di manutenzione.

   Diversamente dalle altre ensure*, questa gira anche in sviluppo: è fatta di
   UPDATE, e l'unica differenza fra i due database è come si attaccano due
   stringhe. */

/** «storico-» seguito dall'id della riga, nella sintassi del database che c'è. */
function sql_segnaposto_storico(PDO $db): string {
    return $db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql'
        ? "CONCAT('storico-', id)"
        : "('storico-' || id)";
}

/** Una migrazione già fatta, letta dal registro. */
function migrazione_fatta(PDO $db, string $nome): bool {
    try {
        $q = $db->prepare("SELECT 1 FROM schema_version WHERE migration = ? LIMIT 1");
        $q->execute([$nome]);
        return (bool)$q->fetchColumn();
    } catch (PDOException $e) {
        return false;
    }
}

/** Come annota_migrazione(), ma in SQL che parlano tutti e due i database. */
function segna_migrazione(PDO $db, string $nome, string $nota): void {
    if (migrazione_fatta($db, $nome)) return;
    try {
        if ($db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql') registro_migrazioni($db);
        $db->prepare("INSERT INTO schema_version (migration, note, applied_at) VALUES (?, ?, ?)")
           ->execute([$nome, $nota, date('Y-m-d H:i:s')]);
    } catch (PDOException $e) {
        error_log('db_maintenance [schema_version]: ' . $e->getMessage());
    }
}

/**
 * Toglie le impronte che hanno finito il loro lavoro. La chiama il giro di
 * manutenzione una volta al giorno, e la migrazione qui sotto la prima volta.
 * Ogni tabella per conto suo: una che manca non ferma le altre.
 */
function anonimizza_impronte_vecchie(PDO $db): void {
    $s = sql_segnaposto_storico($db);
    $oggi = date('Y-m-d');
    $lavori = [
        // Una lettura conta una volta al giorno: ieri non serve più.
        ["UPDATE article_views SET ip_hash = $s
          WHERE view_date < ? AND (ip_hash IS NULL OR ip_hash NOT LIKE 'storico-%')", [$oggi]],
        // Il freno dei clic guarda l'ultimo minuto.
        ["UPDATE cta_clicks SET ip_hash = $s
          WHERE clicked_at < ? AND (ip_hash IS NULL OR ip_hash NOT LIKE 'storico-%')", [$oggi . ' 00:00:00']],
        // Il freno dei messaggi guarda l'ultima ora.
        ["UPDATE messages SET ip_hash = NULL WHERE created_at < ? AND ip_hash IS NOT NULL",
         [date('Y-m-d H:i:s', time() - 3600)]],
    ];
    foreach ($lavori as [$sql, $valori]) {
        try {
            $db->prepare($sql)->execute($valori);
        } catch (PDOException $e) {
            error_log('anonimizza_impronte_vecchie: ' . $e->getMessage());
        }
    }
}

/** La migrazione una tantum: login_attempts vuota, reazioni col segnaposto, il resto come ogni giorno. */
function assicura_impronte_anonime(PDO $db): bool {
    static $ok = null;
    if ($ok !== null) return $ok;
    $nome = '2026-10-16_impronte_anonime';
    if (migrazione_fatta($db, $nome)) return $ok = true;

    try {
        // I freni del login ora stanno in file (lib/freno.php): qui restavano solo IP.
        try { $db->exec("DELETE FROM login_attempts"); } catch (PDOException $e) { /* tabella assente */ }
        $s = sql_segnaposto_storico($db);
        $db->exec("UPDATE article_reactions SET voter_hash = $s WHERE voter_hash NOT LIKE 'storico-%'");
        anonimizza_impronte_vecchie($db);
        segna_migrazione($db, $nome, 'Impronte degli indirizzi: HMAC con chiave, le vecchie sostituite da un segnaposto');
        error_log('db_maintenance: impronte vecchie sostituite (migrazione ' . $nome . ')');
        return $ok = true;
    } catch (PDOException $e) {
        error_log('db_maintenance [impronte]: ' . $e->getMessage());
        return $ok = false;
    }
}


/* ═══════════════════ Gli indirizzi vecchi degli articoli ════════════════════
   Revisione del 16 ottobre, M5. Cambiare lo slug di un articolo pubblicato
   rompeva il suo indirizzo: i link da Telegram, dai social, da altri articoli
   e da Google finivano su un 404, e il pannello non diceva niente (il React
   almeno avvisava). Adesso il salvataggio annota lo slug vecchio qui, e
   index.php, prima di rispondere 404, guarda in questa tabella e porta il
   lettore all'indirizzo nuovo con un 301.

   Lo SQL è quello che MySQL e SQLite parlano tutti e due, quindi la tabella
   nasce anche in sviluppo. */
function assicura_slug_storici(PDO $db): bool {
    static $ok = null;
    if ($ok !== null) return $ok;
    try {
        $mysql = $db->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql';
        $db->exec("CREATE TABLE IF NOT EXISTS slug_storici (
            slug VARCHAR(190) NOT NULL PRIMARY KEY,
            article_id INT NOT NULL,
            creato_il DATETIME NOT NULL
        )" . ($mysql ? " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci" : ''));
        segna_migrazione($db, '2026-10-16_slug_storici', 'Gli slug vecchi degli articoli rimandano al nuovo');
        return $ok = true;
    } catch (PDOException $e) {
        error_log('db_maintenance [slug_storici]: ' . $e->getMessage());
        return $ok = false;
    }
}


function assicura_schema(PDO $db): void {
    assicura_colonne_seo($db);
    assicura_messaggistica($db);
    assicura_newsletter($db);
    assicura_impronte_anonime($db);
    assicura_slug_storici($db);
}

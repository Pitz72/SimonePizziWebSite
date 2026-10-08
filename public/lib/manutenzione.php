<?php
/**
 * La manutenzione che il sito fa da sé, senza cron: DreamHost non lo offre a
 * questo sito, quindi il lavoro in sospeso (lotti della newsletter, coda della
 * posta, backup automatico) parte con le visite.
 *
 * Il giro scatta al massimo ogni dieci minuti. Dopo la pagina, non prima: il
 * visitatore non aspetta un invio. Dove il server non sa chiudere la risposta
 * (niente fastcgi_finish_request), il giro parte solo dalle pagine del pannello,
 * dove chi aspetta è l'amministratore.
 *
 * Il backup è un dump SQL compresso, con le ultime quattordici copie. Il
 * ripristino si fa a mano, da phpMyAdmin o con `gunzip | mysql`.
 */

declare(strict_types=1);

require_once __DIR__ . '/newsletter.php';

const MANUTENZIONE_OGNI = 600;      // secondi fra un giro e l'altro
const BACKUP_CONSERVA   = 14;       // quante copie tenere

function manutenzione_di_passaggio(): void {
    static $armato = false;
    if ($armato) { return; }
    $armato = true;

    $fastcgi = function_exists('fastcgi_finish_request');
    $pannello = str_starts_with((string)($_SERVER['REQUEST_URI'] ?? ''), '/admin');
    if (!$fastcgi && !$pannello) { return; }

    try {
        if (time() - (int)impostazione('tick_ultimo', '0') < MANUTENZIONE_OGNI) { return; }
        impostazione_scrivi('tick_ultimo', (string)time());
    } catch (Throwable $t) {
        error_log('manutenzione: ' . $t->getMessage());
        return;
    }

    register_shutdown_function(static function () use ($fastcgi): void {
        if ($fastcgi) { @fastcgi_finish_request(); }
        @ignore_user_abort(true);
        @set_time_limit(300);
        try {
            manutenzione_giro();
        } catch (Throwable $t) {
            error_log('manutenzione: ' . $t->getMessage());
        }
    });
}

/** Il lavoro vero del giro. Ritorna un riepilogo, utile al pannello e al registro. */
function manutenzione_giro(): array {
    require_once __DIR__ . '/db_maintenance.php';
    assicura_newsletter(db());
    $r = newsletter_giro();
    $r['coda'] = mail_coda_spedisci(20);
    if (backup_dovuto()) {
        $r['backup'] = backup_crea('automatico');
    }
    return $r;
}

/* ── Backup ──────────────────────────────────────────────────────────────── */

/** Dove stanno le copie: fuori dalla cartella del sito, che è pubblica. */
function backup_cartella(): string {
    return IN_SVILUPPO
        ? dirname(__DIR__, 2) . '/scratch/backup-db'
        : dirname(__DIR__, 2) . '/backup-db';
}

/** Il backup torna dovuto? Secondo le impostazioni del pannello: giornaliero o settimanale. */
function backup_dovuto(): bool {
    if (impostazione('backup_auto', '0') !== '1') { return false; }
    $intervallo = impostazione('backup_frequency', 'weekly') === 'daily' ? 86400 : 604800;
    $ultimo = impostazione('backup_last_run', '');
    if ($ultimo === '') { return true; }
    return time() - (int)strtotime($ultimo) >= $intervallo;
}

/**
 * Un dump del database in un file .sql.gz. Scrive prima in un file provvisorio,
 * così una copia interrotta non si scambia per una buona.
 *
 * @return array{ok: bool, message: string, file?: string, bytes?: int}
 */
function backup_crea(string $origine = 'manuale'): array {
    $pdo = db();
    $dir = backup_cartella();
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) {
        return ['ok' => false, 'message' => 'Non riesco a creare la cartella dei backup.'];
    }
    $nome = 'sito_' . date('Ymd_His') . '.sql.gz';
    $file = $dir . '/' . $nome;
    $provvisorio = $file . '.parziale';
    $gz = @gzopen($provvisorio, 'wb9');
    if (!$gz) { return ['ok' => false, 'message' => 'Non riesco a scrivere la copia.']; }

    $mysql = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql';
    try {
        gzwrite($gz, "-- Backup del sito (" . $origine . ") " . date('c') . "\n");
        gzwrite($gz, "SET NAMES utf8mb4;\nSET FOREIGN_KEY_CHECKS=0;\n");
        $tabelle = $mysql
            ? $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN)
            : $pdo->query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'")->fetchAll(PDO::FETCH_COLUMN);
        foreach ($tabelle as $t) {
            if ($mysql) {
                $crea = $pdo->query("SHOW CREATE TABLE `$t`")->fetch(PDO::FETCH_NUM)[1];
                gzwrite($gz, "DROP TABLE IF EXISTS `$t`;\n" . $crea . ";\n");
            }
            $righe = $pdo->query("SELECT * FROM `$t`");
            while ($r = $righe->fetch(PDO::FETCH_ASSOC)) {
                $colonne = implode(', ', array_map(fn($c) => '`' . $c . '`', array_keys($r)));
                $valori = implode(', ', array_map(fn($v) => $v === null ? 'NULL' : $pdo->quote((string)$v), array_values($r)));
                gzwrite($gz, "INSERT INTO `$t` ($colonne) VALUES ($valori);\n");
            }
        }
        gzwrite($gz, "SET FOREIGN_KEY_CHECKS=1;\n");
        gzclose($gz);
    } catch (Throwable $e) {
        gzclose($gz);
        @unlink($provvisorio);
        error_log('backup: ' . $e->getMessage());
        return ['ok' => false, 'message' => 'La copia si è interrotta: ' . $e->getMessage()];
    }
    rename($provvisorio, $file);
    backup_ruota();
    impostazione_scrivi('backup_last_run', date('Y-m-d H:i:s'));
    return ['ok' => true, 'message' => 'Copia creata.', 'file' => $nome, 'bytes' => (int)filesize($file)];
}

/** Tiene le ultime copie e cancella le altre. */
function backup_ruota(): void {
    $copie = glob(backup_cartella() . '/sito_*.sql.gz') ?: [];
    rsort($copie);
    foreach (array_slice($copie, BACKUP_CONSERVA) as $vecchia) { @unlink($vecchia); }
}

/** Le copie che ci sono, dalla più recente. */
function backup_elenco(): array {
    $out = [];
    foreach (glob(backup_cartella() . '/sito_*.sql.gz') ?: [] as $f) {
        $out[] = ['nome' => basename($f), 'bytes' => (int)filesize($f), 'quando' => (int)filemtime($f)];
    }
    usort($out, fn($a, $b) => $b['quando'] <=> $a['quando']);
    return $out;
}

/** Il percorso di una copia, se il nome è quello che il sito scrive e il file c'è. */
function backup_percorso(string $nome): ?string {
    if (!preg_match('/^sito_\d{8}_\d{6}\.sql\.gz$/', $nome)) { return null; }
    $f = backup_cartella() . '/' . $nome;
    return is_file($f) ? $f : null;
}

<?php
/**
 * Chi entra nel pannello, e come si difende la porta.
 *
 * Tre cose, e nessuna è nuova: la sessione con il numero di versione (così una
 * password cambiata butta fuori le sessioni vecchie), il freno ai tentativi di
 * indovinare la password, e il gettone che accompagna ogni modulo per impedire
 * che un altro sito faccia fare al browser cose a nome tuo.
 */

declare(strict_types=1);

require_once __DIR__ . '/mailer.php';

const TENTATIVI_MAX      = 8;      // per rete, nella finestra qui sotto
const TENTATIVI_FINESTRA = 900;    // 15 minuti, in secondi
const TENTATIVI_NOME     = 20;     // per nome utente, da qualunque rete, in un'ora

/* Quanto dura un ingresso. Sono i due valori di FDCA: dodici ore in tutto,
   due ore senza richieste. Prima del 16 ottobre 2026 non c'era nessuna
   scadenza scritta, e decideva la pulizia delle sessioni di PHP: di fabbrica
   ventiquattro minuti, che bastavano a perdere un «Salva» dopo mezz'ora di
   scrittura (revisione del 16 ottobre, M6). */
const SESSIONE_MASSIMA  = 43200;
const SESSIONE_INATTIVA = 7200;

/* Un hash bcrypt vero, con lo stesso costo di quelli che il pannello scrive
   (PASSWORD_DEFAULT, costo 10), per una password che nessuno ha. Serve a
   rispondere con lo stesso tempo quando il nome utente non esiste. Quello di
   prima aveva costo 12 e un corpo non valido: rispondeva più lento proprio per
   i nomi che non esistono (revisione del 16 ottobre, L15). */
const HASH_FINTO = '$2y$10$eQZGSMy6Q8zIdJQCrGUF/O5v0eq29YBTQaSwhp6yxUladW8SYiDwG';

function avvia_sessione(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;

    // Un id di sessione inventato da fuori non si accetta: se ne crea uno nuovo.
    ini_set('session.use_strict_mode', '1');
    /* La pulizia di PHP non deve chiudere una sessione prima delle scadenze
       scritte qui sopra. I file stanno in una cartella privata del sito, non
       in quella comune del server, dove un cron di sistema li cancellerebbe
       col suo orologio; e con la cartella nostra la pulizia la fa PHP. */
    ini_set('session.gc_maxlifetime', (string)SESSIONE_MASSIMA);
    ini_set('session.gc_probability', '1');
    ini_set('session.gc_divisor', '100');
    $cartella = cartella_privata('sessioni');
    if (is_dir($cartella) && is_writable($cartella)) {
        session_save_path($cartella);
    }

    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,                    // JavaScript non deve poterlo leggere
        'secure'   => !IN_SVILUPPO,            // in locale non c'è HTTPS
        // Strict: un altro sito non può far partire una richiesta che porti
        // con sé il cookie del pannello. È la scelta di FDCA.
        'samesite' => 'Strict',
    ]);
    session_name(nome_cookie_pannello());
    session_start();
}

/* ── Chi sei ─────────────────────────────────────────────────────────────── */

function utente(): ?array {
    avvia_sessione();
    if (empty($_SESSION['utente_id'])) return null;

    static $chi = null;
    if ($chi !== null) return $chi;

    /* Le due scadenze. Una sessione nata prima di queste regole non ha
       «inizio»: vale come scaduta, e si rientra una volta sola. */
    $ora    = time();
    $inizio = (int)($_SESSION['inizio'] ?? 0);
    $visto  = (int)($_SESSION['visto'] ?? 0);
    if ($inizio === 0 || $ora - $inizio > SESSIONE_MASSIMA || $ora - $visto > SESSIONE_INATTIVA) {
        esci();
        return null;
    }

    $q = db()->prepare("SELECT id, username, email, session_version FROM users WHERE id = ? LIMIT 1");
    $q->execute([$_SESSION['utente_id']]);
    $u = $q->fetch();

    /* Se la password è cambiata dopo che questa sessione è nata, session_version
       non combacia più e la sessione non vale più niente. È il modo di buttare
       fuori chi era entrato con una password poi cambiata. */
    if (!$u || (int)$u['session_version'] !== (int)($_SESSION['session_version'] ?? -1)) {
        esci();
        return null;
    }
    $_SESSION['visto'] = $ora;
    return $chi = $u;
}

function dentro(): bool { return utente() !== null; }

/**
 * Quanti secondi restano prima che la sessione si chiuda, e per quale delle due
 * scadenze. Lo chiede admin/ping.php.
 *
 * @return array{resta:int, motivo:string}
 */
function sessione_resta(): array {
    $ora = time();
    $perInattivita = SESSIONE_INATTIVA - ($ora - (int)($_SESSION['visto'] ?? $ora));
    $perDurata     = SESSIONE_MASSIMA - ($ora - (int)($_SESSION['inizio'] ?? $ora));
    return [
        'resta'  => max(0, min($perInattivita, $perDurata)),
        'motivo' => $perInattivita <= $perDurata ? 'inattivita' : 'durata',
    ];
}

/** Da chiamare in cima a ogni pagina del pannello. */
function richiedi_accesso(): array {
    $u = utente();
    if ($u) return $u;

    $dove = $_SERVER['REQUEST_URI'] ?? '/admin/';
    header('Location: /admin/entra.php?torna=' . rawurlencode($dove));
    exit;
}

/* ── Entrare e uscire ────────────────────────────────────────────────────── */

/**
 * @return array{ok:bool, errore?:string}
 */
function entra(string $nome, string $password): array {
    avvia_sessione();

    /* Due freni, come in FDCA: uno per rete (otto tentativi ogni quarto
       d'ora, con l'IPv6 contato a /64) e uno per nome utente, da qualunque
       rete (venti l'ora), che regge anche contro chi cambia indirizzo a ogni
       tentativo. Nessun indirizzo finisce nel database: i conti stanno in file
       fuori dal docroot, sotto un'impronta con chiave (lib/freno.php). Fino al
       16 ottobre 2026 c'era il solo freno per IP, con l'IP scritto in chiaro
       in login_attempts (revisione del 16 ottobre, M6 e M14). */
    $rete = rete_cliente();
    $chiaveNome = mb_strtolower(trim($nome));
    if (freno_conta('login-rete', $rete, TENTATIVI_FINESTRA) >= TENTATIVI_MAX
        || freno_conta('login-nome', $chiaveNome, 3600) >= TENTATIVI_NOME) {
        return ['ok' => false, 'errore' => 'Troppi tentativi. Riprova fra un quarto d\'ora.'];
    }

    $q = db()->prepare("SELECT id, username, password_hash, session_version FROM users WHERE username = ? LIMIT 1");
    $q->execute([$nome]);
    $u = $q->fetch();

    /* Se l'utente non esiste si verifica lo stesso un hash vero: senza, il
       tempo di risposta direbbe a chi prova quali nomi utente esistono. */
    $hash = $u['password_hash'] ?? HASH_FINTO;
    $giusta = password_verify($password, $hash);

    if (!$u || !$giusta) {
        freno_annota('login-rete', $rete, TENTATIVI_FINESTRA);
        freno_annota('login-nome', $chiaveNome, 3600);
        // Un solo messaggio per «nome sbagliato» e «password sbagliata»: dire
        // quale dei due è darebbe via mezza informazione.
        return ['ok' => false, 'errore' => 'Nome utente o password non corretti.'];
    }

    session_regenerate_id(true);          // contro il furto di sessione
    $_SESSION['utente_id']       = (int)$u['id'];
    $_SESSION['username']        = $u['username'];
    $_SESSION['session_version'] = (int)$u['session_version'];
    $_SESSION['inizio']          = time();
    $_SESSION['visto']           = time();
    freno_azzera('login-rete', $rete);

    return ['ok' => true];
}

function esci(): void {
    avvia_sessione();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires'  => time() - 42000,
            'path'     => $p['path'],
            'domain'   => $p['domain'],
            'secure'   => $p['secure'],
            'httponly' => $p['httponly'],
            'samesite' => $p['samesite'] ?: 'Strict',
        ]);
    }
    session_destroy();
}

/* ── Il gettone dei moduli ───────────────────────────────────────────────
   Senza, un altro sito potrebbe far inviare al browser di Simone — già
   autenticato — un modulo che cancella un articolo. Il gettone sta nella
   sessione e nel modulo: chi sta fuori non può conoscerlo. */

function gettone(): string {
    avvia_sessione();
    if (empty($_SESSION['gettone'])) $_SESSION['gettone'] = bin2hex(random_bytes(32));
    return $_SESSION['gettone'];
}

function campo_gettone(): string {
    return '<input type="hidden" name="gettone" value="' . e(gettone()) . '">';
}

/** Ferma la richiesta se il gettone non torna. Da chiamare prima di ogni POST. */
function verifica_gettone(): void {
    avvia_sessione();
    $arrivato = (string)($_POST['gettone'] ?? '');
    if ($arrivato === '' || !hash_equals((string)($_SESSION['gettone'] ?? ''), $arrivato)) {
        http_response_code(419);
        exit('Il modulo è scaduto. Torna indietro, ricarica la pagina e riprova.');
    }
}

/* ── Recupero della password ─────────────────────────────────────────────
   Tre passaggi: si chiede, arriva un link buono un'ora, si sceglie la nuova
   password. Cambiarla alza session_version, che butta fuori le sessioni
   aperte altrove — è il modo di riprendersi un account, non solo di cambiare
   una parola. */

const RECUPERO_DURATA = 3600;   // un'ora

/**
 * Prepara un recupero e restituisce il link, oppure null se il nome non
 * esiste. Chi chiama non deve dire quale dei due è capitato: rivelare che un
 * indirizzo è registrato è già dire qualcosa.
 */
function prepara_recupero(string $nomeOEmail): ?string {
    $q = db()->prepare("SELECT id, username, email FROM users WHERE username = ? OR email = ? LIMIT 1");
    $q->execute([$nomeOEmail, $nomeOEmail]);
    $u = $q->fetch();
    if (!$u) return null;

    $gettone = bin2hex(random_bytes(32));
    db()->prepare("DELETE FROM password_resets WHERE user_id = ?")->execute([$u['id']]);
    db()->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)")
        ->execute([$u['id'], $gettone, date('Y-m-d H:i:s', time() + RECUPERO_DURATA)]);

    return base_url() . '/admin/reimposta.php?gettone=' . $gettone;
}

/** L'utente a cui appartiene un gettone ancora valido. */
function utente_del_gettone(string $gettone): ?array {
    if ($gettone === '') return null;
    $q = db()->prepare("SELECT u.id, u.username, u.email FROM password_resets r
                        JOIN users u ON u.id = r.user_id
                        WHERE r.token = ? AND r.expires_at > ? LIMIT 1");
    $q->execute([$gettone, date('Y-m-d H:i:s')]);
    return $q->fetch() ?: null;
}

/**
 * @return string  '' se fatto, altrimenti il motivo del rifiuto
 */
function cambia_password(string $gettone, string $nuova): string {
    $u = utente_del_gettone($gettone);
    if (!$u) return 'Il link non è più valido: dura un\'ora, poi va richiesto.';
    // Dodici caratteri è la soglia della v1.19.0: una password corta si prova
    // tutta, per quanto strana sia.
    if (mb_strlen($nuova) < 12) return 'La password deve avere almeno dodici caratteri.';

    db()->prepare("UPDATE users SET password_hash = ?, session_version = session_version + 1
                   WHERE id = ?")
        ->execute([password_hash($nuova, PASSWORD_DEFAULT), $u['id']]);
    db()->prepare("DELETE FROM password_resets WHERE user_id = ?")->execute([$u['id']]);

    return '';
}

/**
 * Manda il link per posta. In sviluppo non c'è un server di posta: si scrive
 * nel log e si restituisce false, così la pagina mostra il link invece di
 * fingere di averlo mandato.
 */
function manda_link_recupero(string $email, string $link): bool {
    if (IN_SVILUPPO) {
        error_log('Recupero password (sviluppo): ' . $link);
        return false;
    }

    $corpo = '<p>Qualcuno ha chiesto di reimpostare la password del pannello di '
           . e(SITO_NOME) . '.</p>'
           . '<p><a href="' . e($link) . '">Scegli una password nuova</a></p>'
           . '<p>Il link vale un\'ora. Se non sei stato tu, non serve fare niente: '
           . 'senza il link non cambia nulla.</p>';

    /* Priorità alta e niente coda: il link vale un'ora, e se il tetto orario
       è pieno è meglio dirlo subito che spedirlo quando è già scaduto. */
    return manda_posta($email, 'Reimposta la password del pannello', $corpo,
        ['priorita' => 'alta', 'nessuna_coda' => true]);
}

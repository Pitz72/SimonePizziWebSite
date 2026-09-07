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

const TENTATIVI_MAX      = 8;      // per indirizzo IP
const TENTATIVI_FINESTRA = 900;    // 15 minuti, in secondi

function avvia_sessione(): void {
    if (session_status() === PHP_SESSION_ACTIVE) return;

    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'httponly' => true,                    // JavaScript non deve poterlo leggere
        'secure'   => !IN_SVILUPPO,            // in locale non c'è HTTPS
        'samesite' => 'Lax',
    ]);
    session_name('sp_admin');
    session_start();
}

/* ── Chi sei ─────────────────────────────────────────────────────────────── */

function utente(): ?array {
    avvia_sessione();
    if (empty($_SESSION['utente_id'])) return null;

    static $chi = null;
    if ($chi !== null) return $chi;

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
    return $chi = $u;
}

function dentro(): bool { return utente() !== null; }

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

    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if (troppi_tentativi($ip)) {
        return ['ok' => false, 'errore' =>
            'Troppi tentativi da questo indirizzo. Riprova fra un quarto d\'ora.'];
    }

    $q = db()->prepare("SELECT id, username, password_hash, session_version FROM users WHERE username = ? LIMIT 1");
    $q->execute([$nome]);
    $u = $q->fetch();

    /* Se l'utente non esiste si verifica lo stesso un hash finto: senza, il
       tempo di risposta direbbe a chi prova quali nomi utente esistono. */
    $hash = $u['password_hash'] ?? '$2y$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    $giusta = password_verify($password, $hash);

    if (!$u || !$giusta) {
        annota_tentativo($ip);
        // Un solo messaggio per «nome sbagliato» e «password sbagliata»: dire
        // quale dei due è darebbe via mezza informazione.
        return ['ok' => false, 'errore' => 'Nome utente o password non corretti.'];
    }

    session_regenerate_id(true);          // contro il furto di sessione
    $_SESSION['utente_id']       = (int)$u['id'];
    $_SESSION['username']        = $u['username'];
    $_SESSION['session_version'] = (int)$u['session_version'];
    pulisci_tentativi($ip);

    return ['ok' => true];
}

function esci(): void {
    avvia_sessione();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
}

/* ── Il freno ai tentativi ───────────────────────────────────────────────── */

function troppi_tentativi(string $ip): bool {
    $limite = date('Y-m-d H:i:s', time() - TENTATIVI_FINESTRA);
    $q = db()->prepare("SELECT COUNT(*) FROM login_attempts WHERE ip_address = ? AND attempted_at > ?");
    $q->execute([$ip, $limite]);
    return (int)$q->fetchColumn() >= TENTATIVI_MAX;
}

function annota_tentativo(string $ip): void {
    db()->prepare("INSERT INTO login_attempts (ip_address, attempted_at) VALUES (?, ?)")
        ->execute([$ip, date('Y-m-d H:i:s')]);
}

function pulisci_tentativi(string $ip): void {
    db()->prepare("DELETE FROM login_attempts WHERE ip_address = ?")->execute([$ip]);
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

    $oggetto = '=?UTF-8?B?' . base64_encode('Reimposta la password del pannello') . '?=';
    $corpo = '<p>Qualcuno ha chiesto di reimpostare la password del pannello di '
           . e(SITO_NOME) . '.</p>'
           . '<p><a href="' . e($link) . '">Scegli una password nuova</a></p>'
           . '<p>Il link vale un\'ora. Se non sei stato tu, non serve fare niente: '
           . 'senza il link non cambia nulla.</p>';

    $intestazioni = "MIME-Version: 1.0\r\n"
                  . "Content-Type: text/html; charset=UTF-8\r\n"
                  . 'From: ' . SITO_NOME . ' <no-reply@' . parse_url(SITO_URL, PHP_URL_HOST) . ">\r\n"
                  . 'X-Mailer: PHP/' . phpversion();

    return @mail($email, $oggetto, $corpo, $intestazioni);
}

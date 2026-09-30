<?php
/**
 * Le conversazioni nate dal modulo dei contatti.
 *
 * Portato dal Festival (lib/contatti.php, v1.23.0), con la stessa idea e la
 * stessa struttura; qui si parla in prima persona, perché dall'altra parte
 * c'è una persona sola.
 *
 * **Il problema.** Un sito con un indirizzo email scritto in pagina lo regala
 * ai robot che raccolgono indirizzi, e spezza le conversazioni: metà nel
 * pannello e metà in una casella di posta. Il messaggio arriva dal modulo, ma
 * la risposta partiva dal programma di posta di Simone, e la controrisposta
 * ricadeva lì dentro, fuori dal sito.
 *
 * **La soluzione, senza ticket e senza account.** Il messaggio arriva dal
 * modulo di /contatti, si legge nel pannello e si risponde da lì. Ogni email di
 * risposta porta il pulsante «Rispondi a Simone», che apre /messaggio: una
 * pagina del sito con la conversazione e un campo per scrivere. La credenziale
 * è un gettone nell'indirizzo: 32 caratteri esadecimali casuali, uno per
 * conversazione, creato la prima volta che Simone risponde. Chi risponde da lì
 * rientra nel pannello, sotto il messaggio di partenza, e il messaggio torna
 * «nuovo»: la voce Messaggi si accende da sola.
 *
 * **Il link scade** 60 giorni dopo l'ultima risposta di Simone, e ogni
 * risposta nuova lo rinnova. Una chiave che vive per sempre in una casella di
 * posta prima o poi finisce in mano a qualcun altro. Scaduto, la pagina non
 * mostra più nemmeno la conversazione: altrimenti la scadenza proteggerebbe la
 * scrittura e lascerebbe aperta la lettura.
 *
 * **La casella resta la rete di sicurezza.** Il Reply-To delle email di
 * risposta è ancora l'indirizzo vero (MAIL_INFO, in api/config.php): chi preme
 * «Rispondi» invece del pulsante non scrive nel vuoto. Cambia quello che
 * diciamo alla gente di fare, non la rete. L'indirizzo non compare in nessuna
 * pagina del sito.
 *
 * I freni stanno tutti nel database: niente file, niente sessione. Il modulo
 * ne ha tre (campo trappola per i robot, consenso alla privacy, quattro invii
 * l'ora per rete), la pagina delle risposte due (cinque l'ora per conversazione,
 * dieci l'ora da tutta la rete).
 */

declare(strict_types=1);

require_once __DIR__ . '/mailer.php';
require_once __DIR__ . '/db_maintenance.php';
require_once __DIR__ . '/messaggi_pulizia.php';

const CONTATTI_VALIDITA_GIORNI = 60;
/** Quanti messaggi nuovi in un'ora dalla stessa rete. */
const CONTATTI_MESSAGGI_ORA = 4;
/** Quante risposte in un'ora dalla stessa conversazione. */
const CONTATTI_RISPOSTE_ORA = 5;
/** E dall'insieme di tutte le conversazioni. */
const CONTATTI_RISPOSTE_ORA_TUTTE = 10;
const CONTATTI_MAX_CARATTERI = 4000;

/** La forma di un gettone, prima di farne una query. */
function contatti_gettone_valido(string $t): bool {
    return strlen($t) === 32 && ctype_xdigit($t);
}

/** Il momento di adesso nel formato del database, e quello di un'ora fa. */
function contatti_adesso(int $secondiFa = 0): string {
    return date('Y-m-d H:i:s', time() - $secondiFa);
}

/**
 * Il gettone della conversazione: quello che c'è, o uno nuovo.
 *
 * `null` se qualcosa non va con la colonna: chi chiama manda l'email senza
 * pulsante, e la risposta arriva lo stesso.
 */
function contatti_gettone(PDO $db, int $idMessaggio): ?string {
    try {
        $st = $db->prepare('SELECT reply_token FROM messages WHERE id = ?');
        $st->execute([$idMessaggio]);
        $t = (string)$st->fetchColumn();
        $st->closeCursor();
        if (contatti_gettone_valido($t)) return $t;
        $t = bin2hex(random_bytes(16));
        $db->prepare('UPDATE messages SET reply_token = ? WHERE id = ?')->execute([$t, $idMessaggio]);
        return $t;
    } catch (Throwable $e) {
        error_log('contatti_gettone: ' . $e->getMessage());
        return null;
    }
}

/** L'indirizzo completo della pagina. Assoluto: finisce in un'email. */
function contatti_link(string $gettone): string {
    return posta_sito_url() . '/messaggio?t=' . rawurlencode($gettone);
}

/** Il messaggio di partenza che apre quel gettone, o `null`. */
function contatti_carica(string $gettone): ?array {
    if (!contatti_gettone_valido($gettone)) return null;
    try {
        $st = db()->prepare('SELECT * FROM messages WHERE reply_token = ? LIMIT 1');
        $st->execute([strtolower($gettone)]);
        $m = $st->fetch();
        $st->closeCursor();
    } catch (Throwable $e) {
        return null;
    }
    return $m ?: null;
}

/**
 * Le risposte di una conversazione, in ordine, ciascuna con la sua direzione:
 * `out` le ha scritte Simone, `in` chi gli aveva scritto.
 */
function contatti_risposte(PDO $db, int $idMessaggio): array {
    try {
        $st = $db->prepare('SELECT * FROM message_replies WHERE message_id = ? ORDER BY sent_at, id');
        $st->execute([$idMessaggio]);
        $righe = $st->fetchAll();
        $st->closeCursor();
    } catch (Throwable $e) {
        return [];
    }
    foreach ($righe as &$r) {
        $r['direction'] = ($r['direction'] ?? 'out') === 'in' ? 'in' : 'out';
    }
    return $righe;
}

/**
 * Fino a quando vale il link: 60 giorni dopo l'ultima risposta di Simone.
 * `null` se non ha mai risposto, e allora il link non dovrebbe nemmeno esistere.
 */
function contatti_scadenza(array $risposte): ?int {
    $ultima = null;
    foreach ($risposte as $r) {
        if ($r['direction'] !== 'out') continue;
        $t = strtotime((string)$r['sent_at']);
        if ($t !== false && ($ultima === null || $t > $ultima)) $ultima = $t;
    }
    return $ultima === null ? null : $ultima + CONTATTI_VALIDITA_GIORNI * 86400;
}

/**
 * L'ultima cosa che ha scritto la persona: il messaggio di partenza o la sua
 * risposta più recente. È quella che si cita in fondo alla mia email, perché è
 * quella a cui sto rispondendo.
 *
 * @return array{0: string, 1: string} data e testo
 */
function contatti_ultima_sua(array $messaggio, array $risposte): array {
    $data  = (string)$messaggio['created_at'];
    $testo = (string)$messaggio['message'];
    foreach ($risposte as $r) {
        if ($r['direction'] === 'in') { $data = (string)$r['sent_at']; $testo = (string)$r['body']; }
    }
    return [$data, $testo];
}

/* ─────────────────────────────── Le email ─────────────────────────────── */

/**
 * L'email con cui Simone risponde. Senza gettone esce senza pulsante e senza
 * le due righe che ne parlano: il piede non promette un pulsante che non c'è.
 */
function contatti_email_risposta(string $nome, string $testo, string $citataData,
                                 string $citataTesto, ?string $gettone): string {
    $piccolo = 'margin:0 0 16px;font-size:13px;color:#777;';
    $corpo = '';
    if ($gettone !== null) {
        $corpo .= '<p style="' . $piccolo . '">Per rispondermi usa il pulsante in fondo a questa email: '
                . 'il tuo messaggio arriva direttamente a me.</p>';
    }
    $corpo .= '<p>Ciao ' . e($nome) . ',</p>' . posta_paragrafi($testo)
            . '<p style="margin-top:24px;">— Simone</p>';
    if ($gettone !== null) {
        $corpo .= posta_bottone(contatti_link($gettone), 'Rispondi a Simone')
                . '<p style="' . $piccolo . '">Il pulsante apre una pagina del sito con la nostra conversazione, '
                . 'senza bisogno di un account. Il link è solo tuo e resta valido '
                . CONTATTI_VALIDITA_GIORNI . ' giorni.</p>';
    }
    $corpo .= '<blockquote style="margin:24px 0 0;padding:12px 16px;border-left:3px solid #22c55e;color:#555;font-size:14px;">'
            . '<p style="margin:0 0 8px;font-size:12px;color:#999;">Il tuo messaggio del ' . e(data_lunga($citataData)) . ':</p>'
            . nl2br(e($citataTesto)) . '</blockquote>';

    return posta_involucro(
        'Risposta da ' . posta_sito_nome(),
        $corpo,
        $gettone !== null
            ? 'Ti scrivo perché mi hai mandato un messaggio dal sito. Per continuare la conversazione usa il '
              . 'pulsante qui sopra: le risposte che arrivano da lì le leggo tutte, in ordine.'
            : 'Ti scrivo perché mi hai mandato un messaggio dal sito. Per continuare la conversazione usa il '
              . posta_link_contatti() . ': i messaggi che arrivano da lì li leggo tutti, in ordine.'
    );
}

/** L'avviso a Simone quando arriva un messaggio nuovo. */
function contatti_email_avviso_nuovo(array $m): string {
    $scheda = posta_sito_url() . '/admin/messaggi.php?vedi=' . (int)$m['id'];
    return posta_involucro(
        'Messaggio da ' . $m['name'],
        '<p><strong>' . e((string)$m['name']) . '</strong> &lt;' . e((string)$m['email']) . '&gt; ha scritto dal modulo contatti del sito.</p>'
        . '<div style="border-left:3px solid #22c55e;padding:12px 16px;margin:16px 0;">' . nl2br(e((string)$m['message'])) . '</div>'
        . posta_bottone($scheda, 'Rispondi dal pannello'),
        'Oppure rispondi direttamente a questa email: la risposta parte verso ' . e((string)$m['email']) . '.'
    );
}

/** L'avviso a Simone quando qualcuno risponde dalla pagina. */
function contatti_email_avviso_risposta(array $m, string $testo): string {
    $scheda = posta_sito_url() . '/admin/messaggi.php?vedi=' . (int)$m['id'];
    return posta_involucro(
        'Risposta da ' . $m['name'],
        '<p><strong>' . e((string)$m['name']) . '</strong> &lt;' . e((string)$m['email']) . '&gt; '
        . 'ha risposto dalla pagina della conversazione, sul sito.</p>'
        . '<div style="border-left:3px solid #22c55e;padding:12px 16px;margin:16px 0;">' . nl2br(e($testo)) . '</div>'
        . posta_bottone($scheda, 'Apri la conversazione nel pannello'),
        'La risposta è già nel pannello, fra i messaggi nuovi. Rispondi da lì: la tua email porta di nuovo il pulsante.'
    );
}

/* ─────────────────────── Un messaggio dal modulo ──────────────────────── */

/**
 * Un messaggio nuovo, arrivato dal modulo di /contatti.
 *
 * Si chiama solo da un POST. Il campo trappola dei robot riceve la stessa
 * risposta di una persona: chi lo compila non deve capire di essere stato
 * scartato.
 *
 * @return array{0: bool, 1: string} esito e testo da mostrare
 */
function contatti_invia(array $post): array {
    $sciocco = 'Messaggio inviato. Ti risponderò all’indirizzo che hai scritto.';
    if (trim((string)($post['hp_check'] ?? '')) !== '') return [true, $sciocco];

    $nome  = trim(strip_tags((string)($post['nome'] ?? '')));
    $email = filter_var(trim((string)($post['email'] ?? '')), FILTER_VALIDATE_EMAIL);
    $testo = trim(str_replace(["\r\n", "\r"], "\n", strip_tags((string)($post['messaggio'] ?? ''))));

    if ($nome === '' || mb_strlen($nome) > 120)  return [false, 'Scrivi il tuo nome.'];
    if (!$email || strlen($email) > 254)         return [false, 'Scrivi un indirizzo email valido: è lì che ti rispondo.'];
    if (mb_strlen($testo) < 10)                  return [false, 'Il messaggio è troppo corto: almeno dieci caratteri.'];
    if (mb_strlen($testo) > CONTATTI_MAX_CARATTERI) return [false, 'Il messaggio è troppo lungo: al massimo ' . CONTATTI_MAX_CARATTERI . ' caratteri.'];
    if (!in_array((string)($post['consenso'] ?? ''), ['1', 'on'], true)) {
        return [false, 'Per inviare il messaggio devi prendere visione dell’informativa privacy.'];
    }

    $db = db();
    if (!assicura_messaggistica($db)) return [false, 'Non riesco a registrare il messaggio adesso. Riprova fra qualche minuto.'];
    messaggi_pulizia($db);   // sei mesi dall'ultimo scambio, poi si cancella: vedi lib/messaggi_pulizia.php

    $rete = hash('sha256', (string)($_SERVER['REMOTE_ADDR'] ?? 'sconosciuto'));
    try {
        $st = $db->prepare('SELECT COUNT(*) FROM messages WHERE ip_hash = ? AND created_at > ?');
        $st->execute([$rete, contatti_adesso(3600)]);
        if ((int)$st->fetchColumn() >= CONTATTI_MESSAGGI_ORA) {
            return [false, 'Hai mandato molti messaggi nell’ultima ora. Aspetta un po’ e riprova: quelli già inviati sono arrivati.'];
        }

        $db->prepare("INSERT INTO messages (name, email, subject, message, ip_hash, status, created_at)
                      VALUES (?, ?, '', ?, ?, 'new', ?)")
           ->execute([$nome, $email, $testo, $rete, contatti_adesso()]);
        $id = (int)$db->lastInsertId();
    } catch (Throwable $e) {
        error_log('contatti_invia: ' . $e->getMessage());
        return [false, 'Non riesco a registrare il messaggio adesso. Riprova fra qualche minuto.'];
    }

    /* L'avviso a Simone. Se non parte non si dice niente a chi ha scritto: il
       messaggio è nel pannello, e la voce Messaggi si accende comunque. */
    $a = posta_info();
    if ($a !== '') {
        $riga = ['id' => $id, 'name' => $nome, 'email' => $email, 'message' => $testo];
        if (!manda_posta($a, 'Messaggio da ' . $nome . ' — ' . posta_sito_nome(),
                         contatti_email_avviso_nuovo($riga), ['reply_to' => $email])) {
            error_log('contatti_invia: l’avviso del messaggio #' . $id . ' non è partito');
        }
    }

    return [true, $sciocco];
}

/* ────────────────────── La risposta di Simone, dal pannello ────────────────────── */

/**
 * Simone risponde a un messaggio: l'email parte, la risposta si registra, la
 * conversazione passa a «risposto».
 *
 * Si cita l'ultima cosa che ha scritto la persona, non sempre il primo
 * messaggio: una conversazione può avere più giri. Il gettone porta nell'email
 * il pulsante che apre /messaggio.
 *
 * La risposta si salva anche se l'email non parte, marcata «invio fallito»:
 * il testo scritto non va perso, e il pannello lo dice.
 *
 * @return array{0: bool, 1: string}  invio riuscito e testo per il pannello
 */
function contatti_rispondi_da_pannello(array $m, string $testo): array {
    $db = db();
    $id = (int)$m['id'];
    [$citataData, $citataTesto] = contatti_ultima_sua($m, contatti_risposte($db, $id));
    $html = contatti_email_risposta((string)$m['name'], $testo, $citataData, $citataTesto, contatti_gettone($db, $id));

    $opz = [];
    if (posta_info() !== '') $opz['reply_to'] = posta_info();   // la rete di sicurezza: vedi in cima
    $ok = manda_posta((string)$m['email'], 'Re: il tuo messaggio a ' . posta_sito_nome(), $html, $opz);

    $db->prepare("INSERT INTO message_replies (message_id, body, sent_by, sent_at, delivered, direction)
                  VALUES (?, ?, 'Simone', ?, ?, 'out')")
       ->execute([$id, $testo, contatti_adesso(), $ok ? 1 : 0]);
    $db->prepare("UPDATE messages SET status = 'replied' WHERE id = ?")->execute([$id]);

    return $ok
        ? [true, 'Risposta inviata a ' . $m['email'] . '.']
        : [false, 'Risposta salvata, ma l’invio è fallito: controlla la configurazione SMTP in api/config.php.'];
}

/* ───────────────────── Una risposta dalla pagina pubblica ───────────────────── */

/**
 * Una risposta scritta dalla pagina /messaggio.
 *
 * Su GET non succede niente: i filtri antispam pre-caricano i link delle
 * email, e un prefetch deve solo leggere. Si chiama solo da un POST.
 *
 * @return array{0: bool, 1: string}
 */
function contatti_rispondi_da_sito(string $gettone, string $testo, string $trappola = ''): array {
    $m = contatti_carica($gettone);
    if (!$m) return [false, 'Questo link non apre nessuna conversazione.'];

    $db = db();
    $risposte = contatti_risposte($db, (int)$m['id']);
    $scade = contatti_scadenza($risposte);
    if ($scade === null || $scade < time()) {
        return [false, 'Questo link è scaduto. Per scrivermi di nuovo usa il modulo dei contatti.'];
    }

    $ok = 'Ricevuto. La tua risposta è arrivata: ti scrivo di nuovo a questo indirizzo email.';
    if (trim($trappola) !== '') return [true, $ok];

    $testo = trim(str_replace(["\r\n", "\r"], "\n", strip_tags($testo)));
    if (mb_strlen($testo) < 2) return [false, 'Scrivi la tua risposta prima di mandarla.'];
    if (mb_strlen($testo) > CONTATTI_MAX_CARATTERI) {
        return [false, 'La risposta è troppo lunga: al massimo ' . CONTATTI_MAX_CARATTERI . ' caratteri.'];
    }

    try {
        $unOraFa = contatti_adesso(3600);
        $conta = $db->prepare("SELECT COUNT(*) FROM message_replies
                               WHERE direction = 'in' AND sent_at > ? AND message_id = ?");
        $conta->execute([$unOraFa, (int)$m['id']]);
        $perConversazione = (int)$conta->fetchColumn();
        $conta = $db->prepare("SELECT COUNT(*) FROM message_replies WHERE direction = 'in' AND sent_at > ?");
        $conta->execute([$unOraFa]);
        $tutte = (int)$conta->fetchColumn();
    } catch (Throwable $e) {
        return [false, 'Non riesco a registrare la risposta adesso. Riprova fra qualche minuto.'];
    }
    if ($perConversazione >= CONTATTI_RISPOSTE_ORA || $tutte >= CONTATTI_RISPOSTE_ORA_TUTTE) {
        return [false, 'Hai mandato molte risposte nell’ultima ora. Aspetta un po’ e riprova: '
            . 'quelle che hai già mandato sono arrivate.'];
    }

    try {
        $db->prepare("INSERT INTO message_replies (message_id, body, sent_by, sent_at, delivered, direction)
                      VALUES (?, ?, ?, ?, 1, 'in')")
           ->execute([(int)$m['id'], $testo, (string)$m['name'], contatti_adesso()]);
        $db->prepare("UPDATE messages SET status = 'new', read_at = NULL WHERE id = ?")->execute([(int)$m['id']]);
    } catch (Throwable $e) {
        error_log('contatti_rispondi_da_sito: ' . $e->getMessage());
        return [false, 'Non riesco a registrare la risposta adesso. Riprova fra qualche minuto, '
            . 'oppure scrivimi dal modulo dei contatti.'];
    }

    $a = posta_info();
    if ($a !== '') {
        if (!manda_posta($a, 'Risposta da ' . $m['name'] . ' — ' . posta_sito_nome(),
                         contatti_email_avviso_risposta($m, $testo), ['reply_to' => (string)$m['email']])) {
            error_log('contatti_rispondi_da_sito: l’avviso della risposta al messaggio #' . (int)$m['id'] . ' non è partito');
        }
    }
    return [true, $ok];
}

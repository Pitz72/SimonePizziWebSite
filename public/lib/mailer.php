<?php
/**
 * La posta in uscita: un punto solo per tutto ciò che il sito spedisce.
 *
 * Portata dal Festival (lib/mailer.php), senza il contatore orario e senza la
 * coda: qui la posta è poca — un avviso per ogni messaggio, una risposta, un
 * link di recupero, una newsletter ogni tanto — e la quota di DreamHost non
 * è un problema che il sito abbia mai avuto. Se lo diventasse, il pezzo
 * mancante si prende da lì.
 *
 * **Perché non mail().** Su questo hosting mail() consegna un messaggio su due
 * senza dire niente: parte dal server web con un mittente che nessun SPF
 * riconosce. L'SMTP autenticato passa dalla casella vera, e se rifiuta lo dice.
 * Le credenziali stanno in api/config.php, fuori da git:
 *
 *     define('SMTP_HOST', 'smtp.dreamhost.com');
 *     define('SMTP_PORT', 587);
 *     define('SMTP_USER', 'no-reply@runtimeradio.it');
 *     define('SMTP_PASS', '…');
 *     define('MAIL_FROM', 'no-reply@runtimeradio.it');   // facoltativo: default = SMTP_USER
 *     define('MAIL_INFO', 'la-casella-di-simone@…');     // dove arrivano gli avvisi
 *
 * Senza SMTP_HOST e SMTP_USER si ricade su mail(): peggio, ma il sito non
 * resta muto. `MAIL_INFO` non compare in nessuna pagina: è solo il posto dove
 * il sito avvisa Simone, e la casella a cui vanno le risposte di chi preme
 * «Rispondi» invece del pulsante.
 *
 * In sviluppo non parte niente: ogni email si scrive come file HTML in
 * scratch/posta/, così il giro completo — messaggio, risposta, link — si
 * prova senza un server di posta.
 */

declare(strict_types=1);

require_once __DIR__ . '/phpmailer/Exception.php';
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;

/** Un valore di api/config.php, o il predefinito se la costante non c'è. */
function posta_costante(string $nome, $predefinito = '') {
    return defined($nome) ? constant($nome) : $predefinito;
}

/** L'indirizzo dove il sito avvisa Simone. Vuoto = nessun avviso per email. */
function posta_info(): string {
    return trim((string)posta_costante('MAIL_INFO', ''));
}

/** L'indirizzo canonico del sito: lo stesso nelle pagine e negli endpoint di api/. */
function posta_sito_url(): string {
    if (defined('SITO_URL')) return rtrim((string)SITO_URL, '/');
    return rtrim((string)posta_costante('SITE_URL', 'https://simonepizzi.runtimeradio.it'), '/');
}

function posta_sito_nome(): string {
    return defined('SITO_NOME') ? (string)SITO_NOME : 'Simone Pizzi';
}

/** Dove finiscono le email in sviluppo. */
function posta_cartella_sviluppo(): string {
    return dirname(__DIR__, 2) . '/scratch/posta';
}

/**
 * Un solo PHPMailer per processo, con la connessione SMTP tenuta aperta: una
 * newsletter fa un handshake, non uno per destinatario. Alla prima eccezione
 * si butta via e se ne fa un altro.
 */
function posta_trasporto(): PHPMailer {
    static $mail = null;
    static $chiusura = false;
    if ($mail instanceof PHPMailer) return $mail;

    $mail = new PHPMailer(true);
    $mail->CharSet  = 'UTF-8';
    $mail->Encoding = 'base64';

    $host = (string)posta_costante('SMTP_HOST');
    $user = (string)posta_costante('SMTP_USER');
    if ($host !== '' && $user !== '') {
        $porta = (int)posta_costante('SMTP_PORT', 587);
        $mail->isSMTP();
        $mail->Host          = $host;
        $mail->Port          = $porta;
        $mail->SMTPAuth      = true;
        $mail->Username      = $user;
        $mail->Password      = (string)posta_costante('SMTP_PASS');
        $mail->SMTPSecure    = $porta === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Timeout       = 15;
        $mail->SMTPKeepAlive = true;
    } else {
        $mail->isMail();
    }

    if (!$chiusura) {
        $chiusura = true;
        register_shutdown_function('posta_chiudi');
    }
    $GLOBALS['sp_posta_trasporto'] = &$mail;
    return $mail;
}

/** Chiude la connessione SMTP. Innocua se non c'è niente da chiudere. */
function posta_chiudi(): void {
    $m = $GLOBALS['sp_posta_trasporto'] ?? null;
    if ($m instanceof PHPMailer) {
        try { $m->smtpClose(); } catch (Throwable $t) { /* era già chiusa */ }
    }
    $GLOBALS['sp_posta_trasporto'] = null;
}

/**
 * Spedisce una email.
 *
 * @param array $opz  reply_to, from_name, list_unsubscribe (URL), text
 * @return bool  true se il server l'ha accettata. Su false l'errore è nel log.
 */
function manda_posta(string $a, string $oggetto, string $html, array $opz = []): bool {
    if (defined('IN_SVILUPPO') && IN_SVILUPPO) {
        $dir = posta_cartella_sviluppo();
        if (!is_dir($dir)) @mkdir($dir, 0755, true);
        $nome = gmdate('Ymd-His') . '-' . substr(md5($a . $oggetto . microtime()), 0, 6) . '.html';
        file_put_contents($dir . '/' . $nome,
            '<!-- A: ' . $a . ' | Oggetto: ' . $oggetto . ' | Reply-To: ' . ($opz['reply_to'] ?? '') . " -->\n" . $html);
        error_log('Posta (sviluppo): ' . $a . ' — ' . $oggetto . ' → scratch/posta/' . $nome);
        return true;
    }

    $mittente = trim((string)posta_costante('MAIL_FROM', ''));
    $utenza   = trim((string)posta_costante('SMTP_USER', ''));
    if ($mittente === '') {
        $mittente = $utenza !== '' ? $utenza : 'no-reply@' . parse_url(posta_sito_url(), PHP_URL_HOST);
    }
    $nomeMitt = (string)($opz['from_name'] ?? posta_sito_nome());
    $rispondi = (string)($opz['reply_to'] ?? '');

    try {
        $mail = posta_trasporto();
        $mail->clearAllRecipients();
        $mail->clearReplyTos();
        $mail->clearCustomHeaders();

        /* Un From di dominio diverso dall'utenza autenticata fa fallire SPF e
           DKIM, e il messaggio finisce nello spam. Stesso dominio va bene; in
           caso contrario il mittente diventa l'utenza e l'indirizzo scelto
           scala in Reply-To, dove serve davvero. Lezione di Runtime Radio. */
        if ($utenza !== '') {
            $dUtenza = strtolower(substr(strrchr($utenza, '@') ?: '', 1));
            $dMitt   = strtolower(substr(strrchr($mittente, '@') ?: '', 1));
            if ($dUtenza !== '' && $dUtenza !== $dMitt) {
                if ($rispondi === '') $rispondi = $mittente;
                $mittente = $utenza;
            }
        }

        $mail->setFrom($mittente, $nomeMitt);
        $mail->addAddress($a);
        if ($rispondi !== '') $mail->addReplyTo($rispondi);
        if (!empty($opz['list_unsubscribe'])) {
            $mail->addCustomHeader('List-Unsubscribe', '<' . $opz['list_unsubscribe'] . '>');
            $mail->addCustomHeader('List-Unsubscribe-Post', 'List-Unsubscribe=One-Click');
        }
        $mail->isHTML(true);
        $mail->Subject = $oggetto;
        $mail->Body    = $html;
        $mail->AltBody = $opz['text'] ?? posta_testo($html);
        if ($mail->send()) return true;
        error_log('posta: invio a ' . $a . ' rifiutato — ' . $mail->ErrorInfo);
        return false;
    } catch (Throwable $t) {
        error_log('posta: ' . $t->getMessage());
        posta_chiudi();   // la connessione potrebbe essere rimasta a metà: alla prossima se ne apre una nuova
        return false;
    }
}

/**
 * La versione testuale di un'email HTML. La legge chi ha il client in solo
 * testo, e la leggono i filtri antispam, che confrontano le due metà del
 * messaggio: vale la pena che stia in piedi.
 */
function posta_testo(string $html): string {
    $t = preg_replace('/<head\b.*?<\/head>/is', '', $html);
    $t = preg_replace('/<(script|style)\b.*?<\/\1>/is', '', $t);
    $t = preg_replace('/<br\s*\/?>/i', "\n", $t);
    $t = preg_replace('/<\/(p|div|h[1-6]|li|tr|td|table)>/i', "\n", $t);
    $t = preg_replace_callback(
        '/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/is',
        static function (array $m): string {
            $testo = trim(strip_tags($m[2]));
            return $testo === '' ? '' : $testo . ' (' . html_entity_decode($m[1], ENT_QUOTES, 'UTF-8') . ')';
        },
        $t
    );
    $t = html_entity_decode(strip_tags($t), ENT_QUOTES, 'UTF-8');
    $t = preg_replace('/^[ \t]+$/m', '', $t);
    return trim(preg_replace("/\n{3,}/", "\n\n", $t));
}

/**
 * Il testo scritto a mano nel pannello, reso in paragrafi HTML: la riga vuota
 * separa i paragrafi, l'a capo singolo resta un a capo.
 */
function posta_paragrafi(string $testo): string {
    $testo = trim(str_replace(["\r\n", "\r"], "\n", $testo));
    if ($testo === '') return '';
    $fuori = '';
    foreach (preg_split('/\n{2,}/', $testo) as $par) {
        $par = trim($par);
        if ($par === '') continue;
        $fuori .= '<p>' . nl2br(htmlspecialchars($par, ENT_QUOTES, 'UTF-8')) . '</p>';
    }
    return $fuori;
}

/** Il link al modulo dei messaggi, per le email che non hanno un link personale. */
function posta_link_contatti(string $testo = 'modulo dei messaggi del sito'): string {
    return '<a href="' . htmlspecialchars(posta_sito_url() . '/contatti', ENT_QUOTES, 'UTF-8')
         . '" style="color:#16a34a;">' . htmlspecialchars($testo, ENT_QUOTES, 'UTF-8') . '</a>';
}

/**
 * L'involucro HTML: testata scura con il nome, corpo leggibile su fondo
 * bianco, piede con le note. Stili inline, perché i client di posta ignorano
 * i <style>.
 */
function posta_involucro(string $titolo, string $corpo, string $piede = ''): string {
    $sito = htmlspecialchars(posta_sito_nome(), ENT_QUOTES, 'UTF-8');
    $url  = htmlspecialchars(posta_sito_url(), ENT_QUOTES, 'UTF-8');
    $ttl  = htmlspecialchars($titolo, ENT_QUOTES, 'UTF-8');
    return '<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"><title>' . $ttl . '</title></head>'
        . '<body style="margin:0;padding:0;background:#f2f2f2;font-family:Helvetica,Arial,sans-serif;">'
        . '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2f2f2;padding:24px 0;"><tr><td align="center">'
        . '<table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;">'
        . '<tr><td style="background:#04070a;padding:26px 32px;">'
        . '<a href="' . $url . '" style="text-decoration:none;color:#22c55e;font-weight:700;font-size:16px;letter-spacing:2px;text-transform:uppercase;">' . $sito . '</a>'
        . '</td></tr>'
        . '<tr><td style="padding:32px;color:#1a1a1a;font-size:16px;line-height:1.6;">'
        . '<h1 style="margin:0 0 16px;font-size:24px;line-height:1.2;color:#04070a;">' . $ttl . '</h1>'
        . $corpo
        . '</td></tr>'
        . '<tr><td style="padding:20px 32px;background:#f7f7f7;color:#777;font-size:12px;line-height:1.6;border-top:1px solid #e5e5e5;">'
        . $piede
        . '</td></tr></table></td></tr></table></body></html>';
}

/** Pulsante inline-styled. */
function posta_bottone(string $url, string $etichetta): string {
    return '<p style="margin:24px 0;"><a href="' . htmlspecialchars($url, ENT_QUOTES, 'UTF-8') . '" '
        . 'style="display:inline-block;background:#22c55e;color:#04070a;text-decoration:none;font-weight:700;'
        . 'padding:14px 26px;letter-spacing:1px;text-transform:uppercase;font-size:13px;">'
        . htmlspecialchars($etichetta, ENT_QUOTES, 'UTF-8') . '</a></p>';
}

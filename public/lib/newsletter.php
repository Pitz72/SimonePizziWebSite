<?php
/**
 * La newsletter: chi la riceve, come arriva, e l'archivio degli invii.
 *
 * Portata dall'API vecchia (api/newsletter_send.php). Lì il controllo d'accesso
 * cercava una sessione che il pannello nuovo non apre più, quindi dal pannello
 * l'invio non partiva. Qui si usa la sessione del pannello, e la logica sta in
 * un punto solo.
 *
 * Le regole, in ordine di importanza:
 *  - riceve solo chi ha confermato il doppio consenso e ha un link di
 *    disiscrizione: chi non ce l'ha non riceve niente, e il pannello lo dice
 *    prima dell'invio;
 *  - il testo è testo semplice: dentro l'email non entra HTML, né dall'autore
 *    né da chi scrive nel modulo;
 *  - ogni messaggio porta List-Unsubscribe, che le caselle moderne usano per il
 *    pulsante «annulla iscrizione»;
 *  - l'invio parte solo dopo un'anteprima e una prova: lo decide la pagina,
 *    con un'impronta del testo e un gettone usato una volta sola.
 */

declare(strict_types=1);

require_once __DIR__ . '/mailer.php';

const NEWSLETTER_OGGETTO_MAX = 150;
const NEWSLETTER_TESTO_MAX   = 20000;

/**
 * Gli iscritti confermati, divisi fra chi riceverà l'invio e chi no.
 *
 * @return array{pronti: list<array>, senza_link: int}
 */
function newsletter_platea(): array {
    $tutti = db()->query(
        "SELECT email, name, unsubscribe_token FROM subscribers WHERE status = 'confirmed' ORDER BY id"
    )->fetchAll();

    $pronti = [];
    $senzaLink = 0;
    foreach ($tutti as $r) {
        if (trim((string)$r['unsubscribe_token']) === '') { $senzaLink++; continue; }
        $pronti[] = $r;
    }
    return ['pronti' => $pronti, 'senza_link' => $senzaLink];
}

/** Il link che l'iscritto usa per uscire. Stesso indirizzo di sempre, così le email già inviate restano valide. */
function newsletter_link_disiscrizione(string $token): string {
    return posta_sito_url() . '/newsletter/disiscritto?token=' . rawurlencode($token);
}

/**
 * L'email come arriva all'iscritto. Il testo è sempre escapato: qui non si
 * passa HTML, nemmeno se qualcuno lo scrive nel campo.
 */
function newsletter_html(string $oggetto, string $testo, string $nome, string $linkDisiscrizione, bool $corpoHtml = false): string {
    $sito   = posta_sito_url();
    // $corpoHtml vale solo per gli invii d'archivio, scritti con l'HTML del vecchio invio.
    $corpo  = $corpoHtml ? $testo : nl2br(e($testo), false);
    $saluto = trim($nome) !== '' ? $nome : 'amico';

    return '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8">
<title>' . e($oggetto) . '</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:\'Segoe UI\',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
    <tr><td style="background:#111;padding:28px 40px;border-bottom:1px solid #1a1a1a;">
      <a href="' . e($sito) . '" style="text-decoration:none;">
        <span style="color:#22c55e;font-weight:700;font-size:18px;letter-spacing:2px;text-transform:uppercase;">Simone Pizzi</span>
        <span style="color:#4b5563;font-size:13px;margin-left:12px;">Newsletter</span>
      </a>
    </td></tr>
    <tr><td style="padding:40px 40px 0;">
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;line-height:1.3;">' . e($oggetto) . '</h1>
      <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">Ciao, ' . e($saluto) . '!</p>
    </td></tr>
    <tr><td style="padding:32px 40px;color:#d1d5db;font-size:16px;line-height:1.8;">' . $corpo . '</td></tr>
    <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #1e1e1e;margin:0;"></td></tr>
    <tr><td style="padding:24px 40px;">
      <p style="margin:0;color:#4b5563;font-size:12px;line-height:1.6;">
        Hai ricevuto questa email perché sei iscritto alla newsletter di
        <a href="' . e($sito) . '" style="color:#22c55e;text-decoration:none;">simonepizzi.runtimeradio.it</a>.<br>
        Vuoi rispondermi? Usa il <a href="' . e($sito) . '/contatti" style="color:#22c55e;text-decoration:none;">modulo dei contatti</a>: i messaggi li leggo tutti.<br>
        <a href="' . e($linkDisiscrizione) . '" style="color:#6b7280;text-decoration:underline;">Cancella iscrizione</a>
        &nbsp;·&nbsp; &copy; ' . date('Y') . ' Simone Pizzi
      </p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>';
}

/**
 * Spedisce a ciascun destinatario la sua copia, col suo link di disiscrizione.
 *
 * @param list<array> $destinatari  righe con email, name, unsubscribe_token
 * @return array{inviate: int, fallite: list<string>}
 */
function newsletter_invia(array $destinatari, string $oggetto, string $testo): array {
    @set_time_limit(300);
    $titolo  = $oggetto . ' — ' . posta_sito_nome();
    $inviate = 0;
    $fallite = [];

    foreach ($destinatari as $r) {
        $link = newsletter_link_disiscrizione((string)$r['unsubscribe_token']);
        $html = newsletter_html($oggetto, $testo, (string)($r['name'] ?? ''), $link);
        $opz  = ['from_name' => posta_sito_nome(), 'list_unsubscribe' => $link];
        if (posta_info() !== '') $opz['reply_to'] = posta_info();

        if (manda_posta((string)$r['email'], $titolo, $html, $opz)) $inviate++;
        else $fallite[] = (string)$r['email'];
    }
    return ['inviate' => $inviate, 'fallite' => $fallite];
}

/**
 * Una copia di prova, alla casella di Simone. Non tocca gli iscritti e non
 * entra nell'archivio. Ritorna false se la casella non è configurata.
 */
function newsletter_prova(string $oggetto, string $testo): bool {
    $casella = posta_info();
    if ($casella === '') return false;

    $link = newsletter_link_disiscrizione('prova');
    $html = newsletter_html($oggetto, $testo, 'Simone', $link);
    return manda_posta($casella, '[PROVA] ' . $oggetto . ' — ' . posta_sito_nome(), $html, [
        'from_name'        => posta_sito_nome(),
        'list_unsubscribe' => $link,
    ]);
}

/** Registra un invio nell'archivio, con il testo com'è stato spedito. */
function newsletter_archivia(string $oggetto, string $testo, int $quanti): void {
    db()->prepare("INSERT INTO newsletter_sends (subject, body, recipient_count) VALUES (?, ?, ?)")
        ->execute([$oggetto, $testo, $quanti]);
}

/** Gli ultimi invii, dal più recente. */
function newsletter_storico(int $quanti = 50): array {
    return db()->query(
        "SELECT id, subject, sent_at, recipient_count, LENGTH(body) AS lunghezza
         FROM newsletter_sends ORDER BY sent_at DESC, id DESC LIMIT " . (int)$quanti
    )->fetchAll();
}

/**
 * Com'è arrivato un invio d'archivio. Il vecchio invio lasciava passare l'HTML
 * del corpo così com'era, e lo stesso faceva il pannello: qui si riproduce la
 * regola. Il risultato va in un riquadro senza script (vedi il pannello).
 */
function newsletter_come_arrivata(array $invio): string {
    $html = (bool)preg_match('/<[a-zA-Z][\s\S]*>/', (string)$invio['body']);
    return newsletter_html((string)$invio['subject'], (string)$invio['body'], 'Nome Iscritto', '#', $html);
}

/** Un invio passato, col suo testo. */
function newsletter_invio(int $id): ?array {
    $q = db()->prepare("SELECT id, subject, body, sent_at, recipient_count FROM newsletter_sends WHERE id = ?");
    $q->execute([$id]);
    return $q->fetch() ?: null;
}

/** L'impronta di un invio: lega l'anteprima e la spedizione allo stesso testo. */
function newsletter_impronta(string $oggetto, string $testo): string {
    return hash('sha256', $oggetto . "\n" . $testo);
}

/**
 * Il testo come arriva dal modulo, ripulito: niente a capo nell'oggetto, niente
 * caratteri di controllo nel corpo (a parte il a capo e la tabulazione).
 *
 * @return array{oggetto: string, testo: string, errore: string}
 */
function newsletter_bozza_da_modulo(array $in): array {
    $oggetto = trim(preg_replace('/[\r\n\t]+/', ' ', (string)($in['oggetto'] ?? '')));
    $testo   = str_replace(["\r\n", "\r"], "\n", (string)($in['testo'] ?? ''));
    $testo   = trim(preg_replace('/(?![\n\t])\p{Cc}/u', '', $testo));

    $errore = '';
    if ($oggetto === '') {
        $errore = "Manca l'oggetto.";
    } elseif (mb_strlen($oggetto) > NEWSLETTER_OGGETTO_MAX) {
        $errore = "L'oggetto supera i " . NEWSLETTER_OGGETTO_MAX . ' caratteri.';
    } elseif ($testo === '') {
        $errore = 'Scrivi il testo della newsletter.';
    } elseif (mb_strlen($testo) > NEWSLETTER_TESTO_MAX) {
        $errore = 'Il testo supera i ' . NEWSLETTER_TESTO_MAX . ' caratteri.';
    }
    return ['oggetto' => $oggetto, 'testo' => $testo, 'errore' => $errore];
}

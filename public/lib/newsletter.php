<?php
/**
 * La newsletter: chi si iscrive e con quale consenso, chi la riceve, come si
 * compone un numero, e come parte a lotti.
 *
 * Il modello è quello di FDCA-PHP, adattato a questo sito:
 *  - il consenso è una casella da spuntare (mai precompilata), e insieme alla
 *    casella si scrivono il testo letto, la versione dell'informativa, l'ora e
 *    la fonte: è la prova che l'articolo 7 del GDPR chiede;
 *  - la conferma (doppio consenso) si fa con un pulsante. Un link che si apre da
 *    solo non conferma nessuno: lo aprono gli antivirus e le caselle che
 *    controllano i link, e allora la conferma sarebbe di una macchina;
 *  - la disiscrizione si fa solo con POST. Le caselle moderne la chiedono con un
 *    clic (RFC 8058), e quel clic è una richiesta POST: anche lei non disiscrive
 *    chi si limita a «vedere» il link;
 *  - ogni numero parte da un'anteprima e da una prova. I lotti rispettano il
 *    tetto orario di DreamHost: sessantaquattro email l'ora per la newsletter, e
 *    un'ora fra un lotto e il successivo.
 */

declare(strict_types=1);

require_once __DIR__ . '/consenso.php';
require_once __DIR__ . '/mailer.php';
require_once __DIR__ . '/helpers.php';

const NEWSLETTER_OGGETTO_MAX  = 150;
const NEWSLETTER_TESTO_MAX    = 20000;
const NEWSLETTER_CONFERMA_MAX = 120;      // secondi fra due conferme per lo stesso indirizzo
const NEWSLETTER_RICHIESTE_MAX = 3;       // iscrizioni per indirizzo IP ogni quindici minuti
const NEWSLETTER_PENDENTI_GIORNI = 30;    // le iscrizioni non confermate spariscono dopo questo tempo
const NEWSLETTER_LOTTO_PAUSA  = 3600;     // un’ora fra un lotto e il successivo

const NEWSLETTER_NEUTRO = 'Controlla la casella: ti arriva un link per confermare l’iscrizione.';

function nl_now(): string { return date('Y-m-d H:i:s'); }

/**
 * Lo schema della newsletter, se non c'è ancora: la prima iscrizione può arrivare
 * prima che qualcuno apra il pannello. Una volta sola per richiesta.
 */
function nl_assicura(): void {
    static $fatto = false;
    if ($fatto) { return; }
    $fatto = true;
    require_once __DIR__ . '/db_maintenance.php';
    assicura_newsletter(db());
}

function nl_token_valido(string $t): bool { return strlen($t) === 64 && ctype_xdigit($t); }

/** Un’impostazione dalla tabella app_settings. */
function impostazione(string $chiave, string $predefinito = ''): string {
    try {
        $q = db()->prepare("SELECT setting_value FROM app_settings WHERE setting_key = ?");
        $q->execute([$chiave]);
        $v = $q->fetchColumn();
        return $v === false || $v === null ? $predefinito : (string)$v;
    } catch (Throwable $e) {
        return $predefinito;
    }
}

/** Scrive un’impostazione: aggiorna la riga, o la crea se non c’è. */
function impostazione_scrivi(string $chiave, string $valore): void {
    $pdo = db();
    $u = $pdo->prepare("UPDATE app_settings SET setting_value = ? WHERE setting_key = ?");
    $u->execute([$valore, $chiave]);
    if ($u->rowCount() === 0) {
        $pdo->prepare("INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?)")->execute([$chiave, $valore]);
    }
}

/** Il link di disiscrizione. Lo stesso indirizzo per il clic nel testo e per quello della casella. */
function newsletter_link_disiscrizione(string $token): string {
    return posta_sito_url() . '/newsletter/disiscrivi?token=' . rawurlencode($token);
}

function newsletter_link_conferma(string $token): string {
    return posta_sito_url() . '/newsletter/conferma?token=' . rawurlencode($token);
}

/* ── Limiti sulle iscrizioni ─────────────────────────────────────────────── */

/** Un indirizzo IP fa al massimo tre iscrizioni ogni quindici minuti: niente bombardamenti di conferme. */
function newsletter_richiesta_ammessa(string $ip): bool {
    $pdo = db();
    $chiave = 'nl:' . substr(hash('sha256', $ip), 0, 40);
    $pdo->prepare("DELETE FROM login_attempts WHERE attempt_time < ?")
        ->execute([date('Y-m-d H:i:s', time() - 900)]);
    $q = $pdo->prepare("SELECT COUNT(*) FROM login_attempts WHERE ip_address = ?");
    $q->execute([$chiave]);
    if ((int)$q->fetchColumn() >= NEWSLETTER_RICHIESTE_MAX) { return false; }
    $pdo->prepare("INSERT INTO login_attempts (ip_address) VALUES (?)")->execute([$chiave]);
    return true;
}

/* ── Iscrizione e conferma ───────────────────────────────────────────────── */

/**
 * Un’iscrizione dal sito. Il messaggio è sempre lo stesso, salvo per i dati
 * sbagliati: chi scrive non deve poter capire se un indirizzo è già in lista.
 *
 * @return array{0: bool, 1: string}  [ok, messaggio]
 */
function newsletter_iscrivi(string $email, string $nome, bool $consenso, string $fonte = 'sito'): array {
    nl_assicura();
    $email = strtolower(trim($email));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return [false, 'Inserisci un indirizzo email valido.'];
    }
    if (!$consenso) {
        return [false, 'Per iscriverti devi accettare l’informativa privacy.'];
    }
    $nome   = mb_substr(trim(strip_tags($nome)), 0, 80);
    $fonte  = preg_replace('/[^a-z0-9:_\-]/', '', strtolower($fonte)) ?: 'sito';
    $pdo    = db();
    $ora    = nl_now();
    $versione = impostazione('privacy_version', NEWSLETTER_CONSENSO_VERSIONE);

    $q = $pdo->prepare("SELECT id, status, confirm_sent_at, consent_at FROM subscribers WHERE email = ?");
    $q->execute([$email]);
    $esistente = $q->fetch();

    if ($esistente && $esistente['status'] === 'confirmed') {
        // Già in lista. Se la sua iscrizione veniva da prima del consenso registrato,
        // questa spunta è il suo consenso: lo si scrive, e non si manda niente.
        if (empty($esistente['consent_at'])) {
            $pdo->prepare("UPDATE subscribers SET consent_at = ?, consent_text = ?, consent_version = ?, consent_source = ? WHERE id = ?")
                ->execute([$ora, NEWSLETTER_CONSENSO_TESTO, $versione, $fonte, $esistente['id']]);
        }
        return [true, NEWSLETTER_NEUTRO];
    }
    if ($esistente && $esistente['confirm_sent_at']
        && (time() - strtotime((string)$esistente['confirm_sent_at'])) < NEWSLETTER_CONFERMA_MAX) {
        return [true, NEWSLETTER_NEUTRO];   // una conferma è appena partita: niente duplicati
    }

    $conferma = bin2hex(random_bytes(32));
    if ($esistente) {
        $pdo->prepare("UPDATE subscribers SET status = 'pending', confirm_token = ?, confirm_sent_at = ?,
                       name = COALESCE(NULLIF(?, ''), name), consent_at = ?, consent_text = ?,
                       consent_version = ?, consent_source = ?, unsubscribed_at = NULL
                       WHERE id = ?")
            ->execute([$conferma, $ora, $nome, $ora, NEWSLETTER_CONSENSO_TESTO, $versione, $fonte, $esistente['id']]);
    } else {
        $pdo->prepare("INSERT INTO subscribers (email, name, status, confirm_token, confirm_sent_at, unsubscribe_token,
                       consent_at, consent_text, consent_version, consent_source, created_at)
                       VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?)")
            ->execute([$email, $nome !== '' ? $nome : null, $conferma, $ora, bin2hex(random_bytes(32)),
                       $ora, NEWSLETTER_CONSENSO_TESTO, $versione, $fonte, $ora]);
    }
    newsletter_mail_conferma($email, $nome, $conferma);
    return [true, NEWSLETTER_NEUTRO];
}

/** L'email di conferma. È una notifica: passa dal tetto con la sua priorità. */
function newsletter_mail_conferma(string $email, string $nome, string $token): bool {
    $link = newsletter_link_conferma($token);
    $corpo = '<p>' . ($nome !== '' ? 'Ciao ' . e($nome) . ',' : 'Ciao,') . '</p>'
        . '<p>manca un clic per iscriverti alla newsletter di <strong>' . e(posta_sito_nome()) . '</strong>. '
        . 'Finché non lo dai, questo indirizzo non entra in nessuna lista.</p>'
        . newsletter_pulsante($link, 'Confermo l’iscrizione')
        . '<p style="font-size:13px;color:#777;">Se il pulsante non funziona, copia questo indirizzo nel browser:<br>'
        . '<span style="word-break:break-all;">' . e($link) . '</span></p>'
        . '<p style="font-size:13px;color:#777;">Se non sei stato tu a chiedere l’iscrizione, ignora questa email: senza conferma non succede niente.</p>';
    $html = newsletter_layout('Conferma la tua iscrizione', $corpo, '');
    return manda_posta($email, 'Conferma l’iscrizione alla newsletter — ' . posta_sito_nome(), $html, [
        'from_name' => posta_sito_nome(),
        'priorita'  => 'normale',
    ]);
}

/**
 * La conferma premuta sulla pagina. Due casi: un’iscrizione in attesa (si
 * attiva), oppure un iscritto attivo che non aveva un consenso registrato e che
 * ha risposto alla richiesta di riconferma (il consenso si scrive adesso).
 *
 * @return array{0: bool, 1: string}
 */
function newsletter_conferma(string $token): array {
    nl_assicura();
    if (!nl_token_valido($token)) { return [false, 'Link non valido o già usato.']; }
    $pdo = db();
    $q = $pdo->prepare("SELECT id, status, consent_at FROM subscribers WHERE confirm_token = ?");
    $q->execute([$token]);
    $s = $q->fetch();
    if (!$s) { return [false, 'Link non valido o già usato.']; }
    $ora = nl_now();

    if ($s['status'] === 'pending') {
        // La pagina di conferma mostra il testo del consenso: premere il pulsante lo registra,
        // anche per le iscrizioni di prima del modulo nuovo, che non l'avevano.
        $pdo->prepare("UPDATE subscribers SET status = 'confirmed', confirmed_at = ?, confirm_token = NULL,
                       consent_at = COALESCE(consent_at, ?), consent_text = COALESCE(consent_text, ?),
                       consent_version = COALESCE(consent_version, ?), consent_source = COALESCE(consent_source, 'conferma')
                       WHERE id = ?")
            ->execute([$ora, $ora, NEWSLETTER_CONSENSO_TESTO, impostazione('privacy_version', NEWSLETTER_CONSENSO_VERSIONE), $s['id']]);
        return [true, 'Iscrizione confermata. Da adesso le notizie arrivano qui.'];
    }
    if ($s['status'] === 'confirmed' && empty($s['consent_at'])) {
        $pdo->prepare("UPDATE subscribers SET consent_at = ?, consent_text = ?, consent_version = ?, consent_source = 'riconferma', confirm_token = NULL WHERE id = ?")
            ->execute([$ora, NEWSLETTER_CONSENSO_TESTO, impostazione('privacy_version', NEWSLETTER_CONSENSO_VERSIONE), $s['id']]);
        return [true, 'Grazie: il consenso è registrato. Continui a ricevere la newsletter.'];
    }
    return [false, 'Link non valido o già usato.'];
}

/**
 * Che cosa conferma un token, per mostrare la pagina giusta prima del clic:
 * 'iscrizione' (un’iscrizione in attesa), 'riconsenso' (un iscritto che deve
 * registrare il consenso), o null se il link non vale più.
 */
function newsletter_tipo_conferma(string $token): ?string {
    nl_assicura();
    if (!nl_token_valido($token)) { return null; }
    $q = db()->prepare("SELECT status, consent_at FROM subscribers WHERE confirm_token = ?");
    $q->execute([$token]);
    $s = $q->fetch();
    if (!$s) { return null; }
    if ($s['status'] === 'pending') { return 'iscrizione'; }
    if ($s['status'] === 'confirmed' && empty($s['consent_at'])) { return 'riconsenso'; }
    return null;
}

/**
 * La disiscrizione. Vale per il link nel testo e per il clic della casella
 * (RFC 8058): in tutti e due i casi è una richiesta POST.
 *
 * @return array{0: bool, 1: string}
 */
function newsletter_disiscrivi(string $token): array {
    nl_assicura();
    if (!nl_token_valido($token)) { return [false, 'Link non valido.']; }
    $pdo = db();
    $q = $pdo->prepare("SELECT id, status FROM subscribers WHERE unsubscribe_token = ?");
    $q->execute([$token]);
    $s = $q->fetch();
    if (!$s) { return [false, 'Link non valido.']; }
    if ($s['status'] !== 'unsubscribed') {
        $pdo->prepare("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = ?, confirm_token = NULL WHERE id = ?")
            ->execute([nl_now(), $s['id']]);
    }
    return [true, 'Disiscrizione fatta. Da questa lista non ti arriva più niente.'];
}

/** Le iscrizioni non confermate da troppo tempo non servono più: si cancellano. */
function newsletter_pulisci_pendenti(): int {
    $limite = date('Y-m-d H:i:s', time() - NEWSLETTER_PENDENTI_GIORNI * 86400);
    $q = db()->prepare("DELETE FROM subscribers WHERE status = 'pending' AND confirm_sent_at IS NOT NULL AND confirm_sent_at < ?");
    $q->execute([$limite]);
    return $q->rowCount();
}

/* ── Chi riceve ──────────────────────────────────────────────────────────── */

/**
 * Chi può ricevere un numero. Solo chi ha confermato E ha un consenso
 * registrato: chi non ce l'ha non riceve niente, e il pannello lo dice.
 * `riconferma` sono invece gli iscritti senza consenso registrato, che ricevono
 * la sola richiesta di riconfermarlo.
 *
 * @return array{pronti: int, senza_consenso: int}
 */
function newsletter_conteggi(): array {
    $pdo = db();
    $pronti = (int)$pdo->query("SELECT COUNT(*) FROM subscribers WHERE status = 'confirmed'
                                AND consent_at IS NOT NULL AND unsubscribe_token IS NOT NULL AND unsubscribe_token <> ''")->fetchColumn();
    $senza  = (int)$pdo->query("SELECT COUNT(*) FROM subscribers WHERE status = 'confirmed' AND consent_at IS NULL")->fetchColumn();
    return ['pronti' => $pronti, 'senza_consenso' => $senza];
}

/** Il filtro SQL di chi riceve un tipo di invio, dopo il cursore. */
function nl_filtro_destinatari(string $tipo): string {
    return $tipo === 'riconferma'
        ? "status = 'confirmed' AND consent_at IS NULL AND unsubscribe_token IS NOT NULL AND unsubscribe_token <> ''"
        : "status = 'confirmed' AND consent_at IS NOT NULL AND unsubscribe_token IS NOT NULL AND unsubscribe_token <> ''";
}

/* ── Gli articoli di un numero ───────────────────────────────────────────── */

/** Gli articoli che un numero può portare: quelli davvero online, con la data passata. */
function newsletter_articoli_scelta(int $limite = 40): array {
    $q = db()->prepare("SELECT id, title, slug, excerpt, cover_image, category, published_at FROM articles
                        WHERE status = 'published' AND published_at <= ? ORDER BY published_at DESC LIMIT " . (int)$limite);
    $q->execute([nl_now()]);
    return $q->fetchAll();
}

/** Gli articoli scelti, nell'ordine in cui sono stati presi. Solo quelli che sono ancora online. */
function newsletter_articoli_per_id(array $ids): array {
    $ids = array_values(array_unique(array_map('intval', $ids)));
    if (!$ids) { return []; }
    $segnaposto = implode(',', array_fill(0, count($ids), '?'));
    $q = db()->prepare("SELECT id, title, slug, excerpt, cover_image, category, published_at FROM articles
                        WHERE id IN ($segnaposto) AND status = 'published' AND published_at <= ?");
    $q->execute([...$ids, nl_now()]);
    $per = [];
    foreach ($q->fetchAll() as $a) { $per[(int)$a['id']] = $a; }
    $ordinati = [];
    foreach ($ids as $id) { if (isset($per[$id])) { $ordinati[] = $per[$id]; } }
    return $ordinati;
}

/* ── Il testo dell'email ─────────────────────────────────────────────────── */

/** Un’immagine che l’email può mostrare: con l’indirizzo completo. */
function nl_immagine_assoluta(?string $percorso): string {
    $p = trim((string)$percorso);
    if ($p === '') { return ''; }
    if (str_starts_with($p, 'http://') || str_starts_with($p, 'https://')) { return $p; }
    return posta_sito_url() . '/' . ltrim($p, '/');
}

function newsletter_pulsante(string $url, string $testo): string {
    return '<p style="margin:28px 0;"><a href="' . e($url) . '" style="display:inline-block;background:#22c55e;color:#04110a;'
        . 'text-decoration:none;font-weight:700;padding:13px 24px;border-radius:8px;">' . e($testo) . '</a></p>';
}

/** L'involucro comune: la stessa veste per le conferme e per i numeri. */
function newsletter_layout(string $titolo, string $corpo, string $piede): string {
    $sito = posta_sito_url();
    return '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><title>' . e($titolo) . '</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:\'Segoe UI\',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid #222;border-radius:12px;overflow:hidden;">
    <tr><td style="padding:28px 40px;border-bottom:1px solid #1a1a1a;">
      <a href="' . e($sito) . '" style="text-decoration:none;">
        <span style="color:#22c55e;font-weight:700;font-size:18px;letter-spacing:2px;text-transform:uppercase;">Simone Pizzi</span>
        <span style="color:#4b5563;font-size:13px;margin-left:12px;">Newsletter</span>
      </a>
    </td></tr>
    <tr><td style="padding:40px 40px 0;">
      <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;line-height:1.3;">' . e($titolo) . '</h1>
    </td></tr>
    <tr><td style="padding:24px 40px 32px;color:#d1d5db;font-size:16px;line-height:1.7;">' . $corpo . '</td></tr>
    <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #1e1e1e;margin:0;"></td></tr>
    <tr><td style="padding:24px 40px;">
      <p style="margin:0;color:#4b5563;font-size:12px;line-height:1.6;">' . $piede . '
        Titolare del trattamento: Simone Pizzi. <a href="' . e($sito) . '/privacy" style="color:#6b7280;">Informativa privacy</a>.
        &nbsp;·&nbsp; &copy; ' . date('Y') . ' Simone Pizzi
      </p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>';
}

/**
 * Il corpo di un numero composto: il testo di apertura e gli articoli scelti.
 * I segnaposto ({{NOME}}, {{DISISCRIZIONE}}, {{RICONFERMA}}) li riempie
 * newsletter_personalizza(), una copia per ciascun iscritto.
 */
function newsletter_html_campagna(string $oggetto, string $intro, array $articoli, string $tipo): string {
    $intro = trim($intro);
    if ($tipo === 'riconferma') {
        $corpo = '<p>Ciao {{NOME}},</p>'
            . '<p>ti scrivo da Simone Pizzi. Ti avevo iscritto alla newsletter prima che il sito registrasse il consenso in modo verificabile, '
            . 'e per continuare a ricevere le notizie ho bisogno che tu lo confermi con un clic.</p>'
            . newsletter_pulsante('{{RICONFERMA}}', 'Confermo il consenso')
            . '<p>Se non vuoi più ricevere la newsletter, non serve fare niente: non ti scriverò più. '
            . 'Puoi anche uscire subito con questo link: <a href="{{DISISCRIZIONE}}" style="color:#22c55e;">cancella iscrizione</a>.</p>';
        return newsletter_layout($oggetto, $corpo, 'Ricevi questo messaggio perché sei iscritto alla newsletter. ');
    }

    $paragrafi = '';
    foreach (preg_split("/\n\s*\n/", $intro) ?: [] as $p) {
        if (trim($p) !== '') { $paragrafi .= '<p style="margin:0 0 16px;">' . nl2br(e(trim($p)), false) . '</p>'; }
    }
    $elenco = '';
    foreach ($articoli as $a) {
        $url = posta_sito_url() . url_articolo($a);
        $immagine = nl_immagine_assoluta($a['cover_image'] ?? '');
        $elenco .= '<table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;border:1px solid #222;border-radius:10px;overflow:hidden;background:#0f0f0f;">';
        if ($immagine !== '') {
            $elenco .= '<tr><td><a href="' . e($url) . '"><img src="' . e($immagine) . '" alt="" width="520" style="display:block;width:100%;max-width:520px;height:auto;border:0;"></a></td></tr>';
        }
        $elenco .= '<tr><td style="padding:18px 20px;">'
            . '<p style="margin:0 0 6px;color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:1px;">' . e((string)$a['category']) . '</p>'
            . '<h2 style="margin:0 0 8px;font-size:19px;line-height:1.3;"><a href="' . e($url) . '" style="color:#fff;text-decoration:none;">' . e((string)$a['title']) . '</a></h2>'
            . ($a['excerpt'] ? '<p style="margin:0;color:#9ca3af;font-size:15px;">' . e((string)$a['excerpt']) . '</p>' : '')
            . '</td></tr></table>';
    }
    $corpo = '<p style="margin:0 0 16px;">Ciao {{NOME}},</p>' . $paragrafi . $elenco;
    $piede = 'Ricevi questo messaggio perché hai dato il consenso a ricevere la newsletter. Per uscire, in un clic: '
        . '<a href="{{DISISCRIZIONE}}" style="color:#6b7280;text-decoration:underline;">cancella iscrizione</a>. ';
    return newsletter_layout($oggetto, $corpo, $piede);
}

/** La copia di un numero per una persona: nome e link di disiscrizione (e di riconferma, se serve). */
function newsletter_personalizza(string $html, array $iscritto, ?string $tokenRiconferma = null): string {
    $nome = trim((string)($iscritto['name'] ?? ''));
    return strtr($html, [
        '{{NOME}}'          => e($nome !== '' ? $nome : 'amico'),
        '{{DISISCRIZIONE}}' => e(newsletter_link_disiscrizione((string)$iscritto['unsubscribe_token'])),
        '{{RICONFERMA}}'    => e(newsletter_link_conferma((string)$tokenRiconferma)),
    ]);
}

/** Il numero com'è arrivato agli iscritti, per rileggerlo dall'archivio. */
function newsletter_come_arrivata(array $invio): string {
    if (!empty($invio['html'])) {
        return newsletter_personalizza((string)$invio['html'], ['name' => 'Nome Iscritto', 'unsubscribe_token' => 'anteprima'], 'anteprima');
    }
    // Gli invii di prima di questo modulo: il corpo era HTML, e veniva lasciato passare così com'era.
    $html = (bool)preg_match('/<[a-zA-Z][\s\S]*>/', (string)$invio['body']);
    $corpo = $html ? (string)$invio['body'] : nl2br(e((string)$invio['body']), false);
    return newsletter_layout((string)$invio['subject'], '<p>Ciao Nome Iscritto,</p>' . $corpo, '');
}

/** La prova: una copia alla casella di Simone. Non tocca gli iscritti né l'archivio. */
function newsletter_prova(string $oggetto, string $intro, array $articoli): bool {
    $casella = posta_info();
    if ($casella === '') { return false; }
    $html = newsletter_personalizza(newsletter_html_campagna($oggetto, $intro, $articoli, 'news'),
        ['name' => 'Simone', 'unsubscribe_token' => 'prova']);
    return manda_posta($casella, '[PROVA] ' . $oggetto . ' — ' . posta_sito_nome(), $html, [
        'from_name' => posta_sito_nome(),
        'priorita'  => 'alta',
    ]);
}

/** L'impronta di un numero: lega l'anteprima all'invio, perché il testo non cambi in mezzo. */
function newsletter_impronta(string $oggetto, string $intro, array $idArticoli): string {
    $ids = array_map('intval', $idArticoli);
    sort($ids);
    return hash('sha256', $oggetto . "\n" . $intro . "\n" . implode(',', $ids));
}

/**
 * Il testo che arriva dal modulo, ripulito: niente a capo nell'oggetto, niente
 * caratteri di controllo nel corpo (a parte il a capo e la tabulazione).
 *
 * @return array{oggetto: string, intro: string, errore: string}
 */
function newsletter_bozza_da_modulo(array $in): array {
    $oggetto = trim(preg_replace('/[\r\n\t]+/', ' ', (string)($in['oggetto'] ?? '')));
    $intro   = str_replace(["\r\n", "\r"], "\n", (string)($in['testo'] ?? ''));
    $intro   = trim(preg_replace('/(?![\n\t])\p{Cc}/u', '', $intro));

    $errore = '';
    if ($oggetto === '') {
        $errore = "Manca l'oggetto.";
    } elseif (mb_strlen($oggetto) > NEWSLETTER_OGGETTO_MAX) {
        $errore = "L'oggetto supera i " . NEWSLETTER_OGGETTO_MAX . ' caratteri.';
    } elseif (mb_strlen($intro) > NEWSLETTER_TESTO_MAX) {
        $errore = 'Il testo supera i ' . NEWSLETTER_TESTO_MAX . ' caratteri.';
    }
    return ['oggetto' => $oggetto, 'intro' => $intro, 'errore' => $errore];
}

/* ── Numeri e invii a lotti ──────────────────────────────────────────────── */

/**
 * Apre un invio. Il numero è composto una volta sola: il testo e gli articoli
 * sono quelli dell'anteprima, e i lotti ne mandano le copie.
 *
 * @return int  l'id del numero in archivio
 */
function newsletter_crea_invio(string $tipo, string $oggetto, string $intro, array $articoli, string $html): int {
    nl_assicura();
    $pdo = db();
    $totale = newsletter_conteggi()['pronti'];
    if ($tipo === 'riconferma') {
        $totale = (int)$pdo->query("SELECT COUNT(*) FROM subscribers WHERE " . nl_filtro_destinatari('riconferma'))->fetchColumn();
    }
    $ora = nl_now();
    $pdo->prepare("INSERT INTO newsletter_sends (subject, body, sent_at, recipient_count, tipo, stato, html, articoli,
                   cursore, totale, inviate, fallite, prossimo_lotto, avviata_il)
                   VALUES (?, ?, ?, 0, ?, 'in_invio', ?, ?, 0, ?, 0, 0, ?, ?)")
        ->execute([$oggetto, $intro, $ora, $tipo, $html,
                   json_encode(array_map(fn($a) => (int)$a['id'], $articoli)), $totale, $ora, $ora]);
    return (int)$pdo->lastInsertId();
}

/** Un invio da portare avanti. Null se non esiste. */
function newsletter_invio_per_id(int $id): ?array {
    $q = db()->prepare("SELECT * FROM newsletter_sends WHERE id = ?");
    $q->execute([$id]);
    return $q->fetch() ?: null;
}

/**
 * Manda il prossimo lotto di un invio. Un lotto è al massimo quanto il tetto
 * orario della newsletter (64): poi si aspetta un’ora, e riparte da dove era.
 * Il cursore è l'ultimo iscritto trattato; il registro dice chi ha già ricevuto.
 *
 * @return array  esito del lotto: inviate, fallite, stato, prossimo
 */
function newsletter_lotto(int $id): array {
    $pdo = db();
    $c = newsletter_invio_per_id($id);
    if (!$c || $c['stato'] !== 'in_invio') {
        return ['stato' => $c['stato'] ?? 'assente', 'inviate' => 0, 'fallite' => 0];
    }
    if (function_exists('set_time_limit')) { @set_time_limit(300); }
    ignore_user_abort(true);

    $dimensione = min(64, mail_tetto('bassa'));
    $tipo = (string)($c['tipo'] ?? 'news');
    $ins  = $pdo->prepare("INSERT INTO newsletter_destinatari (send_id, subscriber_id, email, esito, errore, at) VALUES (?, ?, ?, ?, ?, ?)");

    $q = $pdo->prepare("SELECT id, email, name, unsubscribe_token FROM subscribers
                        WHERE " . nl_filtro_destinatari($tipo) . " AND id > ?
                          AND id NOT IN (SELECT subscriber_id FROM newsletter_destinatari WHERE send_id = ? AND esito = 'inviata')
                        ORDER BY id LIMIT " . (int)$dimensione);
    $q->execute([(int)$c['cursore'], $id]);
    $lotto = $q->fetchAll();

    $inviate = 0; $consecutive = 0; $errore = ''; $fermo = false; $cursore = (int)$c['cursore'];
    foreach ($lotto as $s) {
        if (!mail_posto('bassa')) { $fermo = true; break; }

        $token = null;
        if ($tipo === 'riconferma') {
            $token = bin2hex(random_bytes(32));
            $pdo->prepare("UPDATE subscribers SET confirm_token = ? WHERE id = ?")->execute([$token, $s['id']]);
        }
        $html = newsletter_personalizza((string)$c['html'], $s, $token);
        $ok = manda_posta((string)$s['email'], $c['subject'] . ' — ' . posta_sito_nome(), $html, [
            'from_name'        => posta_sito_nome(),
            'priorita'         => 'bassa',
            'nessuna_coda'     => true,
            'list_unsubscribe' => newsletter_link_disiscrizione((string)$s['unsubscribe_token']),
        ]);
        if ($ok) {
            $inviate++;
            $consecutive = 0;
        } else {
            $errore = 'il server non ha accettato l’email';
            $consecutive++;
        }
        $ins->execute([$id, $s['id'], $s['email'], $ok ? 'inviata' : 'fallita', $ok ? null : $errore, nl_now()]);
        $cursore = (int)$s['id'];
        $pdo->prepare("UPDATE newsletter_sends SET cursore = ? WHERE id = ?")->execute([$cursore, $id]);
        if ($consecutive >= 3) { break; }
        usleep(150000);
    }

    $sospeso = $consecutive >= 3;
    $conteggi = $pdo->prepare("SELECT SUM(esito = 'inviata'), SUM(esito = 'fallita') FROM newsletter_destinatari WHERE send_id = ?");
    $conteggi->execute([$id]);
    [$tot_ok, $tot_ko] = array_map('intval', $conteggi->fetch(PDO::FETCH_NUM) ?: [0, 0]);

    $rest = $pdo->prepare("SELECT COUNT(*) FROM subscribers WHERE " . nl_filtro_destinatari($tipo) . " AND id > ?
                           AND id NOT IN (SELECT subscriber_id FROM newsletter_destinatari WHERE send_id = ? AND esito = 'inviata')");
    $rest->execute([$cursore, $id]);
    $restano = (int)$rest->fetchColumn();

    if ($sospeso) {
        $stato = 'sospesa';
        $prossimo = null;
    } elseif ($restano === 0) {
        $stato = 'inviata';
        $prossimo = null;
    } else {
        $stato = 'in_invio';
        // Un lotto che ha spedito aspetta un’ora, come vuole il tetto. Un lotto che non è riuscito a spedire
        // nulla (quota piena per altra posta) riprova fra dieci minuti.
        $prossimo = date('Y-m-d H:i:s', time() + ($inviate > 0 ? NEWSLETTER_LOTTO_PAUSA : 600));
    }
    $pdo->prepare("UPDATE newsletter_sends SET stato = ?, prossimo_lotto = ?, inviate = ?, fallite = ?, recipient_count = ?,
                   sent_at = CASE WHEN ? = 'inviata' THEN ? ELSE sent_at END WHERE id = ?")
        ->execute([$stato, $prossimo, $tot_ok, $tot_ko, $tot_ok, $stato, nl_now(), $id]);

    if ($sospeso) {
        error_log('newsletter: invio ' . $id . ' sospeso dopo tre rifiuti di fila (' . $errore . ')');
    }
    return ['stato' => $stato, 'inviate' => $inviate, 'fallite' => $tot_ko, 'prossimo' => $prossimo, 'restano' => $restano];
}

/** Il lotto dovuto più vecchio, se c'è. Lo chiama il giro di manutenzione. */
function newsletter_tick_invii(): int {
    $q = db()->prepare("SELECT id FROM newsletter_sends WHERE stato = 'in_invio' AND prossimo_lotto <= ? ORDER BY id LIMIT 1");
    $q->execute([nl_now()]);
    $id = $q->fetchColumn();
    if (!$id) { return 0; }
    newsletter_lotto((int)$id);
    return (int)$id;
}

/** Pausa, ripresa e nuovo giro dei falliti. Le azioni del pannello passano di qui. */
function newsletter_cambia_stato(int $id, string $azione): bool {
    $pdo = db();
    $c = newsletter_invio_per_id($id);
    if (!$c) { return false; }
    if ($azione === 'pausa' && $c['stato'] === 'in_invio') {
        $pdo->prepare("UPDATE newsletter_sends SET stato = 'sospesa', prossimo_lotto = NULL WHERE id = ?")->execute([$id]);
        return true;
    }
    if ($azione === 'riprendi' && $c['stato'] === 'sospesa') {
        $pdo->prepare("UPDATE newsletter_sends SET stato = 'in_invio', prossimo_lotto = ? WHERE id = ?")->execute([nl_now(), $id]);
        return true;
    }
    if ($azione === 'riprova' && in_array($c['stato'], ['inviata', 'sospesa'], true)) {
        // I falliti tornano in coda: il cursore torna all’inizio, e chi ha già ricevuto resta fuori.
        $pdo->prepare("DELETE FROM newsletter_destinatari WHERE send_id = ? AND esito = 'fallita'")->execute([$id]);
        $pdo->prepare("UPDATE newsletter_sends SET stato = 'in_invio', cursore = 0, prossimo_lotto = ? WHERE id = ?")
            ->execute([nl_now(), $id]);
        return true;
    }
    return false;
}

/** Il registro di un invio: una riga per destinatario. */
function newsletter_registro(int $id): array {
    $q = db()->prepare("SELECT email, esito, errore, at FROM newsletter_destinatari WHERE send_id = ? ORDER BY id");
    $q->execute([$id]);
    return $q->fetchAll();
}

/** L'archivio dei numeri, dal più recente. */
function newsletter_storico(int $quanti = 60): array {
    return db()->query("SELECT id, subject, sent_at, recipient_count, tipo, stato, totale, inviate, fallite, prossimo_lotto
                        FROM newsletter_sends ORDER BY id DESC LIMIT " . (int)$quanti)->fetchAll();
}

/** Un invio passato, col suo testo. */
function newsletter_invio(int $id): ?array {
    return newsletter_invio_per_id($id);
}

/** Quanta posta è partita nell'ultima ora, e i tetti. Per il pannello. */
function mail_stato_quota(): array {
    return [
        'usate'   => mail_usate_ultima_ora(db()),
        'tetto'   => mail_per_ora(),
        'bassa'   => mail_tetto('bassa'),
        'normale' => mail_tetto('normale'),
        'in_coda' => (int)db()->query("SELECT COUNT(*) FROM mail_coda")->fetchColumn(),
    ];
}

/* ── Importazione e amministrazione degli iscritti ───────────────────────── */

/**
 * Aggiunge a mano un indirizzo, con il consenso dichiarato da chi lo inserisce.
 * Chi lo aggiunge dichiara di avere il consenso documentato: la fonte lo dice.
 *
 * @return array{0: bool, 1: string}
 */
function newsletter_aggiungi_manuale(string $email, string $nome, string $fonte): array {
    $email = strtolower(trim($email));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { return [false, 'Indirizzo non valido.']; }
    $pdo = db();
    $q = $pdo->prepare("SELECT id FROM subscribers WHERE email = ?");
    $q->execute([$email]);
    if ($q->fetchColumn()) { return [false, 'Questo indirizzo è già in lista o ha già chiesto l’iscrizione.']; }
    $ora = nl_now();
    $pdo->prepare("INSERT INTO subscribers (email, name, status, confirm_token, confirm_sent_at, unsubscribe_token,
                   confirmed_at, consent_at, consent_text, consent_version, consent_source, created_at)
                   VALUES (?, ?, 'confirmed', NULL, NULL, ?, ?, ?, ?, ?, ?, ?)")
        ->execute([$email, $nome !== '' ? $nome : null, bin2hex(random_bytes(32)), $ora, $ora,
                   NEWSLETTER_CONSENSO_TESTO, impostazione('privacy_version', NEWSLETTER_CONSENSO_VERSIONE),
                   mb_substr('manuale: ' . $fonte, 0, 40), $ora]);
    return [true, 'Aggiunto. Il consenso è registrato come «manuale: ' . $fonte . '».'];
}

/**
 * Importa un elenco (uno per riga). Gli indirizzi non entrano attivi: ricevono
 * la conferma come tutti, a meno che chi importa non dichiari il consenso
 * documentato (`$consensoDocumentato`), e allora entrano confermati.
 *
 * @return array{righe: int, nuovi: int, gia_presenti: int, non_validi: int}
 */
function newsletter_importa(array $indirizzi, string $fonte, bool $consensoDocumentato): array {
    $esito = ['righe' => 0, 'nuovi' => 0, 'gia_presenti' => 0, 'non_validi' => 0];
    $pdo = db();
    $visti = [];
    foreach ($indirizzi as $riga) {
        $esito['righe']++;
        $email = strtolower(trim((string)$riga));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { $esito['non_validi']++; continue; }
        if (isset($visti[$email])) { $esito['gia_presenti']++; continue; }
        $visti[$email] = true;
        $q = $pdo->prepare("SELECT id FROM subscribers WHERE email = ?");
        $q->execute([$email]);
        if ($q->fetchColumn()) { $esito['gia_presenti']++; continue; }
        $ora = nl_now();
        if ($consensoDocumentato) {
            $pdo->prepare("INSERT INTO subscribers (email, name, status, confirm_token, unsubscribe_token, confirmed_at,
                           consent_at, consent_text, consent_version, consent_source, created_at)
                           VALUES (?, NULL, 'confirmed', NULL, ?, ?, ?, ?, ?, ?, ?)")
                ->execute([$email, bin2hex(random_bytes(32)), $ora, $ora, NEWSLETTER_CONSENSO_TESTO,
                           impostazione('privacy_version', NEWSLETTER_CONSENSO_VERSIONE),
                           mb_substr('import: ' . $fonte, 0, 40), $ora]);
        } else {
            $token = bin2hex(random_bytes(32));
            $pdo->prepare("INSERT INTO subscribers (email, name, status, confirm_token, confirm_sent_at, unsubscribe_token,
                           created_at) VALUES (?, NULL, 'pending', ?, ?, ?, ?)")
                ->execute([$email, $token, $ora, bin2hex(random_bytes(32)), $ora]);
            newsletter_mail_conferma($email, '', $token);
        }
        $esito['nuovi']++;
    }
    return $esito;
}

/** Una chiamata per tutto il lavoro in sospeso: lo fa il giro di manutenzione. */
function newsletter_giro(): array {
    $r = ['pendenti_eliminati' => newsletter_pulisci_pendenti()];
    $r['invio'] = newsletter_tick_invii();
    return $r;
}

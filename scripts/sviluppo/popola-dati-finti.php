<?php
/**
 * Riempie il database di sviluppo con le tabelle che le API pubbliche non
 * espongono: utenti, messaggi, iscritti, reazioni, visite, media, impostazioni.
 *
 *   php scripts/sviluppo/crea-db-sviluppo.php     # articoli, categorie, progetti (dati VERI)
 *   php scripts/sviluppo/popola-dati-finti.php    # tutto il resto (dati INVENTATI)
 *
 * PERCHÉ SERVE. Il pannello gestisce messaggi, iscritti alla newsletter,
 * reazioni e statistiche: roba che sta nel database di produzione e che le API
 * pubbliche non danno a nessuno, giustamente. Senza, il pannello si potrebbe
 * scrivere ma non guardare, e una schermata che non si è mai vista in funzione
 * è una schermata che non funziona.
 *
 * TUTTO QUELLO CHE QUESTO FILE SCRIVE È FINTO e si riconosce a occhio: gli
 * indirizzi finiscono in @esempio.it, i nomi sono nomi di prova. In produzione
 * queste tabelle esistono già con dentro roba vera, e questo script non ci
 * arriva nemmeno: gira solo sul file SQLite di sviluppo.
 *
 * L'unica eccezione dichiarata è `projects.stato`: la colonna in produzione non
 * esiste ancora (la crea una ensure* alla prima apertura del pannello) e qui la
 * si riempie a mano perché altrimenti le etichette di stato — che sono il
 * cuore della direzione grafica scelta — non si vedrebbero mai. I valori sono
 * quelli veri, ricavati dagli articoli: TelegramBot e FeedDownloader aperti,
 * Sbargold archiviato, il Relitto ancora in corso.
 */

declare(strict_types=1);

const FILE_DB = __DIR__ . '/../../scratch/sviluppo.sqlite';

if (!is_file(FILE_DB)) {
    fwrite(STDERR, "Manca il database di sviluppo.\nLancia prima: php scripts/sviluppo/crea-db-sviluppo.php\n");
    exit(1);
}

$db = new PDO('sqlite:' . FILE_DB, null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

/* ── Le tabelle ──────────────────────────────────────────────────────────── */

$tabelle = [
    // Chi entra nel pannello.
    "CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY, username TEXT NOT NULL UNIQUE, email TEXT,
        password_hash TEXT NOT NULL, session_version INTEGER DEFAULT 1,
        created_at TEXT)",

    // Il freno ai tentativi di indovinare la password.
    "CREATE TABLE IF NOT EXISTS login_attempts (
        id INTEGER PRIMARY KEY, ip_address TEXT NOT NULL, attempted_at TEXT)",

    "CREATE TABLE IF NOT EXISTS password_resets (
        id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, token TEXT NOT NULL,
        expires_at TEXT)",

    // Chi scrive dal modulo contatti.
    "CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY, name TEXT, email TEXT, subject TEXT, message TEXT,
        ip_hash TEXT, read_at TEXT NULL, created_at TEXT)",

    "CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY, email TEXT NOT NULL UNIQUE,
        status TEXT DEFAULT 'pending', confirm_token TEXT, unsubscribe_token TEXT,
        created_at TEXT, confirmed_at TEXT NULL)",

    "CREATE TABLE IF NOT EXISTS article_reactions (
        id INTEGER PRIMARY KEY, article_id INTEGER NOT NULL, reaction TEXT NOT NULL,
        voter_hash TEXT NOT NULL, created_at TEXT)",

    "CREATE TABLE IF NOT EXISTS article_views (
        id INTEGER PRIMARY KEY, article_id INTEGER NOT NULL, ip_hash TEXT,
        view_date TEXT)",

    "CREATE TABLE IF NOT EXISTS cta_clicks (
        id INTEGER PRIMARY KEY, article_id INTEGER NOT NULL, button_label TEXT,
        ip_hash TEXT, created_at TEXT)",

    // La libreria delle immagini.
    "CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY, file_name TEXT, file_path TEXT, alt_text TEXT,
        file_size INTEGER, created_at TEXT)",

    "CREATE TABLE IF NOT EXISTS app_settings (
        setting_key TEXT PRIMARY KEY, setting_value TEXT, updated_at TEXT)",

    "CREATE TABLE IF NOT EXISTS schema_version (
        id INTEGER PRIMARY KEY, migration TEXT NOT NULL UNIQUE, note TEXT,
        applied_at TEXT)",
];
foreach ($tabelle as $sql) $db->exec($sql);

/* Le tre colonne nuove: in produzione le crea una ensure*, qui si aggiungono
   a mano perché lo schema di sviluppo nasce da uno script e non da una
   migrazione. */
foreach ([
    'articles' => ['seo_title TEXT NULL', 'seo_description TEXT NULL'],
    'projects' => ['stato TEXT NULL'],
] as $tabella => $colonne) {
    $esistenti = array_column($db->query("PRAGMA table_info($tabella)")->fetchAll(), 'name');
    foreach ($colonne as $definizione) {
        $nome = strtok($definizione, ' ');
        if (!in_array($nome, $esistenti, true)) {
            $db->exec("ALTER TABLE $tabella ADD COLUMN $definizione");
        }
    }
}

$db->beginTransaction();
foreach (['users','login_attempts','password_resets','messages','subscribers',
          'article_reactions','article_views','cta_clicks','media','app_settings'] as $t) {
    $db->exec("DELETE FROM $t");
}

$adesso = new DateTimeImmutable('now');
$quando = fn(int $giorniFa, int $ore = 12) =>
    $adesso->modify("-$giorniFa days")->setTime($ore, random_int(0, 59))->format('Y-m-d H:i:s');

/* ── L'utente del pannello ───────────────────────────────────────────────── */

$db->prepare("INSERT INTO users (username, email, password_hash, session_version, created_at)
              VALUES (?,?,?,?,?)")
   ->execute(['simone', 'simone@esempio.it',
              password_hash('sviluppo-locale', PASSWORD_DEFAULT), 1, $quando(400)]);

/* ── I messaggi dal modulo contatti ──────────────────────────────────────── */

$messaggi = [
    ['Leonardo B.', 'leonardo@esempio.it', 'Bug nel Mistero della Santa Maria',
     "Ciao Simone, ho finito il gioco ma quattro verbi su nove non fanno niente. Ti mando due video, sono muti perché il microfono non andava.", 3, true],
    ['Redazione Podcast Italia', 'redazione@esempio.it', 'Intervista su Runtime Radio',
     "Buongiorno, stiamo preparando un pezzo sui festival musicali generati con l'AI e vorremmo intervistarla sul FDCA. Ha mezz'ora nelle prossime due settimane?", 5, true],
    ['Marta C.', 'marta@esempio.it', 'Favella su Linux',
     "L'IDE parte ma il motore no: mi dà un errore sul percorso dei file. Uso Ubuntu 24.04. Serve una libreria in più?", 8, false],
    ['Anonimo', 'nessuno@esempio.it', 'Grazie per L\'Albero dei Racconti',
     "Ho letto tutta la raccolta in due sere. Il racconto del 1993 sul traghetto mi ha ricordato mio padre. Volevo solo dirglielo.", 12, false],
    ['Gruppo Sviluppo IPN', 'sviluppo@esempio.it', 'Proposta di collaborazione',
     "Vorremmo usare il vostro motore narrativo per un progetto scolastico. È possibile avere una licenza d'uso o basta la MIT?", 18, true],
    ['Andrea T.', 'andrea@esempio.it', 'Il feed RSS si ferma',
     "Da qualche giorno il feed non si aggiorna più nel mio lettore. L'ultimo articolo che vedo è quello di agosto su FeedDownloader.", 21, false],
    ['Studio Grafico Terni', 'info@esempio.it', 'Preventivo copertine',
     "Salve, ci occupiamo di illustrazione per editoria. Le lasciamo il contatto se le servissero copertine per i prossimi racconti.", 30, true],
    ['Giulia R.', 'giulia@esempio.it', 'Segnalazione refuso',
     "Nell'articolo su Sbargold c'è scritto «lingoutto» invece di «lingotto», nel terzo paragrafo. Cosa da niente, ma tant'è.", 45, true],
];

$q = $db->prepare("INSERT INTO messages (name,email,subject,message,ip_hash,read_at,created_at)
                   VALUES (?,?,?,?,?,?,?)");
foreach ($messaggi as [$nome, $email, $oggetto, $testo, $giorniFa, $letto]) {
    $creato = $quando($giorniFa);
    $q->execute([$nome, $email, $oggetto, $testo, hash('sha256', $email),
                 $letto ? $quando($giorniFa - 1) : null, $creato]);
}

/* ── Gli iscritti alla newsletter ────────────────────────────────────────── */

$q = $db->prepare("INSERT INTO subscribers (email,status,confirm_token,unsubscribe_token,created_at,confirmed_at)
                   VALUES (?,?,?,?,?,?)");
$stati = array_merge(array_fill(0, 34, 'confirmed'), array_fill(0, 5, 'pending'),
                     array_fill(0, 3, 'unsubscribed'));
shuffle($stati);
foreach ($stati as $i => $stato) {
    $giorniFa = 300 - $i * 6;
    $creato = $quando(max(1, $giorniFa));
    $q->execute([
        'lettore' . ($i + 1) . '@esempio.it', $stato,
        bin2hex(random_bytes(16)), bin2hex(random_bytes(16)),
        $creato, $stato === 'confirmed' ? $creato : null,
    ]);
}

/* ── Reazioni, visite e clic sugli articoli veri ─────────────────────────── */

$articoli = $db->query("SELECT id, published_at FROM articles ORDER BY published_at DESC")->fetchAll();
$reazioni = ['thumb', 'heart', 'fire', 'think', 'game'];

$qR = $db->prepare("INSERT INTO article_reactions (article_id,reaction,voter_hash,created_at) VALUES (?,?,?,?)");
$qV = $db->prepare("INSERT INTO article_views (article_id,ip_hash,view_date) VALUES (?,?,?)");
$qC = $db->prepare("INSERT INTO cta_clicks (article_id,button_label,ip_hash,created_at) VALUES (?,?,?,?)");

$totV = $totR = $totC = 0;

foreach ($articoli as $i => $a) {
    $eta = max(1, (int)$adesso->diff(new DateTimeImmutable($a['published_at'] ?: 'now'))->days);

    /* Le visite calano con l'età dell'articolo, ma non a zero: l'archivio
       continua a farne un po' tutti i giorni. È il profilo che ha un blog vero,
       e serve perché il grafico del cruscotto abbia una forma credibile. */
    $quante = (int)round(280 * exp(-$eta / 60) + random_int(4, 22));
    for ($v = 0; $v < $quante; $v++) {
        $giornoFa = random_int(0, min($eta, 90));
        $qV->execute([$a['id'], bin2hex(random_bytes(8)),
                      $adesso->modify("-$giornoFa days")->format('Y-m-d')]);
        $totV++;
    }

    foreach ($reazioni as $r) {
        $n = random_int(0, $i < 8 ? 9 : 3);
        for ($k = 0; $k < $n; $k++) {
            $qR->execute([$a['id'], $r, bin2hex(random_bytes(8)), $quando(random_int(1, 60))]);
            $totR++;
        }
    }

    if ($i < 12) {
        foreach (['Scarica il documento', 'Leggi l\'articolo'] as $etichetta) {
            $n = random_int(0, 14);
            for ($k = 0; $k < $n; $k++) {
                $qC->execute([$a['id'], $etichetta, bin2hex(random_bytes(8)), $quando(random_int(1, 60))]);
                $totC++;
            }
        }
    }
}

/* ── La libreria media ───────────────────────────────────────────────────
   Non si inventano immagini: si registrano quelle già usate dagli articoli e
   dai progetti, che è poi quello che c'è davvero nella tabella `media` in
   produzione. I file stanno sul server, non in locale: le pagine li chiedono
   al sito vero (vedi url_immagine in lib/helpers.php). */

$copertine = $db->query(
    "SELECT DISTINCT cover_image FROM articles WHERE cover_image <> ''
     UNION SELECT DISTINCT cover_image FROM projects WHERE cover_image <> ''"
)->fetchAll(PDO::FETCH_COLUMN);

$q = $db->prepare("INSERT INTO media (file_name,file_path,alt_text,file_size,created_at) VALUES (?,?,?,?,?)");
foreach ($copertine as $i => $percorso) {
    $nome = basename(parse_url($percorso, PHP_URL_PATH) ?: $percorso);
    $q->execute([$nome, $percorso, '', random_int(40, 400) * 1024, $quando(random_int(1, 300))]);
}

/* ── Impostazioni e stato dello schema ───────────────────────────────────── */

$q = $db->prepare("INSERT INTO app_settings (setting_key,setting_value,updated_at) VALUES (?,?,?)");
foreach ([
    'backup_auto' => '0',
    'backup_frequency' => 'weekly',
    'backup_last_run' => '',
    'site_title' => 'Simone Pizzi — creazioni ibride',
    'site_tagline' => 'Portfolio e blog · dal 2010',
] as $chiave => $valore) {
    $q->execute([$chiave, $valore, $adesso->format('Y-m-d H:i:s')]);
}

$q = $db->prepare("INSERT OR IGNORE INTO schema_version (migration,note,applied_at) VALUES (?,?,?)");
foreach ([
    ['2026-08-12_articles_focus_keyword', 'Parola chiave SEO separata dai tag (v1.27.0)'],
    ['2026-09-07_articles_seo_title_description', 'Titolo e descrizione per Google'],
    ['2026-09-07_projects_stato', 'Stato dichiarato di ogni progetto'],
] as [$nome, $nota]) {
    $q->execute([$nome, $nota, $adesso->format('Y-m-d H:i:s')]);
}

/* ── Lo stato dei progetti ───────────────────────────────────────────────
   Non è inventato: è quello che gli articoli raccontano. In produzione la
   colonna nascerà vuota e questi sedici valori vanno rimessi a mano dal
   pannello — sono sedici clic, una volta sola. */

$statoPerProgetto = [
    'telegrambot'      => 'open_source',
    'feeddownloader'   => 'open_source',
    'favella'          => 'open_source',
    'safe place'       => 'open_source',
    'sbargold'         => 'archiviato',
    'relitto'          => 'in_corso',
    'santa maria'      => 'in_corso',
    'esposizione'      => 'in_corso',
    'albero dei racconti' => 'pubblicato',
    'frequenza'        => 'pubblicato',
    'whitepaper'       => 'pubblicato',
    'live machine'     => 'pubblicato',
];

$aggiorna = $db->prepare("UPDATE projects SET stato = ? WHERE id = ?");
$conStato = 0;
foreach ($db->query("SELECT id, name FROM projects")->fetchAll() as $p) {
    $nome = mb_strtolower($p['name']);
    $stato = 'pubblicato';
    foreach ($statoPerProgetto as $pezzo => $valore) {
        if (str_contains($nome, $pezzo)) { $stato = $valore; break; }
    }
    $aggiorna->execute([$stato, $p['id']]);
    $conStato++;
}

$db->commit();

printf(
    "Dati simulati scritti in %s:\n" .
    "  1 utente del pannello   → simone / sviluppo-locale\n" .
    "  %d messaggi (%d da leggere)\n" .
    "  %d iscritti (%d confermati)\n" .
    "  %d reazioni, %d visite, %d clic sui pulsanti\n" .
    "  %d immagini in libreria\n" .
    "  %d progetti con lo stato\n" .
    "Sono tutti finti tranne lo stato dei progetti, che viene dagli articoli veri.\n",
    realpath(FILE_DB),
    (int)$db->query("SELECT COUNT(*) FROM messages")->fetchColumn(),
    (int)$db->query("SELECT COUNT(*) FROM messages WHERE read_at IS NULL")->fetchColumn(),
    (int)$db->query("SELECT COUNT(*) FROM subscribers")->fetchColumn(),
    (int)$db->query("SELECT COUNT(*) FROM subscribers WHERE status='confirmed'")->fetchColumn(),
    $totR, $totV, $totC,
    (int)$db->query("SELECT COUNT(*) FROM media")->fetchColumn(),
    $conStato
);

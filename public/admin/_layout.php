<?php
/**
 * La cornice del pannello: intestazione, barra laterale, piede.
 *
 * Funzioni e non file da includere, per la stessa ragione dei blocchi del sito
 * pubblico: un file incluso condivide lo scope di chi lo include, e prima o poi
 * si porta via una variabile.
 */

declare(strict_types=1);

/** Le voci della barra laterale: chiave => [etichetta, indirizzo]. */
function voci_pannello(): array {
    return [
        'cruscotto'  => ['Cruscotto',   '/admin/'],
        'articoli'   => ['Articoli',    '/admin/articoli.php'],
        'categorie'  => ['Categorie',   '/admin/categorie.php'],
        'tag'        => ['Tag',         '/admin/tag.php'],
        'media'      => ['Immagini',    '/admin/media.php'],
        'messaggi'   => ['Messaggi',    '/admin/messaggi.php'],
        'newsletter' => ['Newsletter',  '/admin/newsletter.php'],
        'impostazioni' => ['Impostazioni', '/admin/impostazioni.php'],
        'sistema'    => ['Sistema',     '/admin/sistema.php'],
    ];
}

/**
 * @param string $titolo   quello che si legge nella linguetta del browser
 * @param string $sezione  la chiave della voce da illuminare
 * @param bool   $nuda     pagina senza barra laterale (l'ingresso)
 */
function testa_pannello(string $titolo, string $sezione = '', bool $nuda = false): void {
    $daLeggere = $nuda ? 0 : messaggi_da_leggere();
    ?><!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title><?= e($titolo) ?> — pannello</title>
<!-- L'ICO va dichiarata per prima e senza type: è il ripiego dei browser che
     l'SVG non lo sanno leggere, e quelli che lo sanno prendono comunque il
     secondo. Fino all'8 settembre 2026 qui c'era solo l'ICO, e sul server era
     un file da zero byte: il sito non aveva favicon. Si rifanno tutte con
     scripts/sviluppo/crea-favicon.py. -->
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="<?= e(asset_v('/assets/css/caratteri.css')) ?>">
<link rel="stylesheet" href="<?= e(asset_v('/assets/css/base.css')) ?>">
<link rel="stylesheet" href="<?= e(asset_v('/assets/css/admin.css')) ?>">
</head>
<body class="<?= $nuda ? 'pannello-nudo' : 'pannello' ?>">
<?php if ($nuda) return; ?>

<a class="salta" href="#lavoro">Vai al contenuto</a>

<header class="pannello-cima">
  <a class="marchio" href="/admin/">SIMONE PIZZI <span class="eti" style="color:var(--verde)">pannello</span></a>
  <div class="pannello-cima-destra">
    <a class="eti" href="/" target="_blank" rel="noopener">Vedi il sito ↗</a>
    <span class="eti spento"><?= e($_SESSION['username'] ?? '') ?></span>
    <?php /* L'uscita è un POST con il gettone: con un link, un'immagine su un
             altro sito poteva far uscire dal pannello (revisione del 16 ottobre, M6). */ ?>
    <form method="post" action="/admin/esci.php" class="modulo-esci">
      <?= campo_gettone() ?>
      <button class="btn btn-muto" type="submit">Esci</button>
    </form>
  </div>
</header>

<div class="pannello-corpo">
  <nav class="pannello-lato" aria-label="Sezioni del pannello">
    <ul>
      <?php foreach (voci_pannello() as $chiave => [$etichetta, $dove]): ?>
        <li>
          <a href="<?= e($dove) ?>"<?= $chiave === $sezione ? ' aria-current="page"' : '' ?>>
            <?= e($etichetta) ?>
            <?php if ($chiave === 'messaggi' && $daLeggere > 0): ?>
              <b class="pallino"><?= $daLeggere ?></b>
            <?php endif; ?>
          </a>
        </li>
      <?php endforeach; ?>
    </ul>
  </nav>

  <main class="pannello-lavoro" id="lavoro">
<?php
}

/**
 * @param list<string> $script  altri file da caricare (l'editor, il
 *                              verificatore, la libreria): li chiede solo la
 *                              schermata che ne ha bisogno.
 */
function piede_pannello(bool $nuda = false, array $script = []): void {
    if (!$nuda) {
        echo '  </main></div>';
    }
    ?>
<script src="<?= e(asset_v('/assets/js/admin.js')) ?>" defer></script>
<?php foreach ($script as $f): ?>
<script src="<?= e(asset_v('/assets/js/' . $f)) ?>" defer></script>
<?php endforeach; ?>
</body>
</html>
<?php
}

/**
 * Le due finestre di servizio: la libreria delle immagini e il cercatore di
 * articoli. Le chiede la scheda articolo, e la usano sia l'editor sia il
 * campo della copertina.
 */
function finestre_pannello(): void {
    ?>
    <dialog class="finestra" id="finestra-libreria" aria-labelledby="titolo-libreria">
      <div class="finestra-cima">
        <h2 id="titolo-libreria">Scegli un'immagine</h2>
        <button class="finestra-chiudi" type="button" data-chiudi>Esc</button>
      </div>
      <div class="finestra-corpo">
        <?php zona_caricamento('file-nuovo'); ?>
        <p class="esito" id="stato-libreria" role="status" aria-live="polite"></p>
        <ul class="griglia-media" id="griglia-libreria"></ul>
      </div>
    </dialog>

    <dialog class="finestra" id="finestra-link-interno" aria-labelledby="titolo-link-interno">
      <div class="finestra-cima">
        <h2 id="titolo-link-interno">Collega un articolo</h2>
        <button class="finestra-chiudi" type="button" data-chiudi>Esc</button>
      </div>
      <div class="finestra-corpo">
        <label class="solo-lettori-schermo" for="campo-link-interno">Cerca un articolo</label>
        <input class="campo-testo" id="campo-link-interno" type="search" autocomplete="off"
               placeholder="Cerca per titolo…">
        <ul class="esiti" id="esiti-link-interno"></ul>
      </div>
    </dialog>
    <?php
}

/**
 * La zona dove si trascinano o si scelgono le immagini da caricare. La fa
 * funzionare assets/js/caricamenti.js: una barra per file, uno dopo l'altro.
 * Nel pannello React c'era (MediaGallery, MediaSelectorModal) ed era andata
 * persa con la migrazione; tornata il 22 ottobre 2026.
 *
 * $dopo = 'ricarica' rilegge la pagina quando la coda è finita senza errori:
 * serve alla Libreria, dove le schede le disegna il PHP.
 */
function zona_caricamento(string $id, string $dopo = ''): void {
    ?>
    <div class="zona-carica" data-zona-carica data-massimo="<?= limite_caricamento() ?>"<?= $dopo !== '' ? ' data-dopo="' . e($dopo) . '"' : '' ?>>
      <?= campo_gettone() ?>
      <label class="zona-carica-bersaglio" for="<?= e($id) ?>">
        <input class="solo-lettori-schermo" id="<?= e($id) ?>" type="file" multiple
               accept="image/jpeg,image/png,image/webp,image/gif">
        <b>Trascina qui le immagini</b>
        <span>o fai clic per sceglierle · JPG, PNG, WebP, GIF · anche più di una</span>
      </label>
      <?php /* Le righe cambiano a ogni percentuale: lette ad alta voce sarebbero
               un rumore continuo. Il lettore di schermo sente solo l'esito, qui. */ ?>
      <p class="solo-lettori-schermo" role="status" data-annuncio></p>
      <ul class="coda-carica"></ul>
    </div>
    <?php
}

/**
 * Il file più grande che il server accetta, in byte: il minore fra
 * upload_max_filesize e post_max_size. Oltre, PHP butta via tutta la richiesta,
 * gettone compreso, e il pannello risponderebbe «modulo scaduto» invece di
 * «troppo grande». Meglio dirlo prima di spedire.
 */
function limite_caricamento(): int {
    $byte = function (string $valore): int {
        $valore = trim($valore);
        $n = (int)$valore;
        return match (strtolower(substr($valore, -1))) {
            'g' => $n << 30, 'm' => $n << 20, 'k' => $n << 10, default => $n,
        };
    };
    $limiti = array_filter([$byte((string)ini_get('upload_max_filesize')),
                            $byte((string)ini_get('post_max_size'))]);
    return $limiti ? min($limiti) : 0;
}

/* ── Pezzi che ricorrono ─────────────────────────────────────────────────── */

/** Il titolo di una schermata, con i comandi a destra. */
function titolo_pannello(string $titolo, string $sottotitolo = '', string $comandi = ''): void {
    ?>
    <div class="lavoro-cima">
      <div>
        <h1 class="gro"><?= e($titolo) ?></h1>
        <?php if ($sottotitolo !== ''): ?><p class="spento"><?= e($sottotitolo) ?></p><?php endif; ?>
      </div>
      <?php if ($comandi !== ''): ?><div class="btn-fila"><?= $comandi ?></div><?php endif; ?>
    </div>
    <?php
}

/**
 * L'avviso dopo un'azione. Arriva come parametro nell'indirizzo perché dopo
 * una scrittura si fa sempre un redirect: così ricaricare la pagina non
 * rifà l'operazione.
 */
function avviso_pannello(): void {
    $ok = trim((string)($_GET['fatto'] ?? ''));
    $no = trim((string)($_GET['errore'] ?? ''));
    if ($ok === '' && $no === '') return;
    ?>
    <p class="avviso<?= $no !== '' ? ' avviso-no' : '' ?>" role="status">
      <?= e($no !== '' ? $no : $ok) ?>
    </p>
    <?php
}

/** Riporta alla pagina che ha mandato il modulo, con un messaggio. */
function torna(string $dove, string $messaggio = '', bool $errore = false): never {
    if ($messaggio !== '') {
        $dove .= (str_contains($dove, '?') ? '&' : '?')
               . ($errore ? 'errore=' : 'fatto=') . rawurlencode($messaggio);
    }
    header('Location: ' . $dove, true, 303);   // 303: la risposta è una pagina da leggere, non da rifare
    exit;
}

/**
 * Un articolo è online per chiunque, adesso?
 *
 * «published» da solo non basta a dirlo: un articolo programmato per domattina
 * ha già quello stato, e per il pubblico non esiste ancora. È la stessa
 * condizione che il sito applica in SOLO_PUBBLICATI, scritta in PHP perché qui
 * l'articolo è già in mano.
 */
function pubblico_adesso(array $a): bool {
    if (($a['status'] ?? '') !== 'published') return false;
    return empty($a['published_at']) || strtotime((string)$a['published_at']) <= time();
}

/** L'etichetta di stato di un articolo. */
function stato_articolo(array $a): string {
    if ($a['status'] !== 'published') {
        return '<span class="stato stato-archiviato">Bozza</span>';
    }
    if (!pubblico_adesso($a)) {
        return '<span class="stato stato-in-corso">Programmato</span>';
    }
    return '<span class="stato stato-pubblicato">Pubblicato</span>';
}

/**
 * Il collegamento alla pagina dell'articolo sul sito.
 *
 * Due parole diverse per due cose diverse: «Vedi sul sito» è la pagina che
 * vedono tutti, «Anteprima» è quella che vede solo chi è nel pannello — una
 * bozza, o un articolo programmato. Prima il pulsante compariva per tutti gli
 * articoli «published», programmati compresi, e diceva «Vedi sul sito» anche
 * quando quell'indirizzo rispondeva 404: il pannello offriva un link rotto.
 *
 * Senza categoria l'indirizzo non esiste ancora (sarebbe «//slug»), e senza
 * slug nemmeno: in quel caso non si stampa niente.
 *
 * $breve serve alla colonna dei comandi dell'elenco, che è stretta: la parola
 * cambia, il titolo che spiega resta.
 */
function link_al_sito(array $a, string $classe = 'mini', bool $breve = false): string {
    if (($a['category'] ?? '') === '' || ($a['slug'] ?? '') === '') return '';

    $pubblico = pubblico_adesso($a);
    if ($pubblico) {
        $parola = $breve ? 'Vedi' : 'Vedi sul sito ↗';
        $perche = 'Apri la pagina che vedono tutti';
    } else {
        $parola = $breve ? 'Anteprima' : 'Anteprima ↗';
        $perche = 'Apri la pagina come la vedi tu: al pubblico risponde «pagina non trovata»';
    }

    return '<a class="' . $classe . '" href="' . e(url_articolo($a)) . '"'
         . ' target="_blank" rel="noopener" title="' . e($perche) . '">'
         . $parola . '</a>';
}

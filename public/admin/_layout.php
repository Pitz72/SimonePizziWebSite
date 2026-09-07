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
        'progetti'   => ['Progetti',    '/admin/progetti.php'],
        'categorie'  => ['Categorie',   '/admin/categorie.php'],
        'tag'        => ['Tag',         '/admin/tag.php'],
        'media'      => ['Immagini',    '/admin/media.php'],
        'messaggi'   => ['Messaggi',    '/admin/messaggi.php'],
        'newsletter' => ['Newsletter',  '/admin/newsletter.php'],
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
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="stylesheet" href="/assets/css/base.css">
<link rel="stylesheet" href="/assets/css/admin.css">
</head>
<body class="<?= $nuda ? 'pannello-nudo' : 'pannello' ?>">
<?php if ($nuda) return; ?>

<a class="salta" href="#lavoro">Vai al contenuto</a>

<header class="pannello-cima">
  <a class="marchio" href="/admin/">SIMONE PIZZI <span class="eti" style="color:var(--verde)">pannello</span></a>
  <div class="pannello-cima-destra">
    <a class="eti" href="/" target="_blank" rel="noopener">Vedi il sito ↗</a>
    <span class="eti spento"><?= e($_SESSION['username'] ?? '') ?></span>
    <a class="btn btn-muto" href="/admin/esci.php">Esci</a>
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
<script nonce="<?= e(nonce()) ?>" src="/assets/js/admin.js" defer></script>
<?php foreach ($script as $f): ?>
<script nonce="<?= e(nonce()) ?>" src="/assets/js/<?= e($f) ?>" defer></script>
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

/** L'etichetta di stato di un articolo. */
function stato_articolo(array $a): string {
    if ($a['status'] !== 'published') {
        return '<span class="stato stato-archiviato">Bozza</span>';
    }
    if (!empty($a['published_at']) && strtotime($a['published_at']) > time()) {
        return '<span class="stato stato-in-corso">Programmato</span>';
    }
    return '<span class="stato stato-pubblicato">Pubblicato</span>';
}

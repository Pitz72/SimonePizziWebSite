<?php
/**
 * La libreria: immagini, documenti (i PDF) e file (gli archivi).
 *
 * I file veri stanno in public/uploads/ sul server, e ci arrivano da
 * admin/carica.php, che le immagini le ridimensiona sopra i 1920px e le
 * converte in WebP, e PDF e archivi li lascia come sono.
 * Qui si guarda che cosa c'è, si copia l'indirizzo e si cancella quello che
 * non serve più: la cancellazione c'era nel pannello React ed era andata
 * persa con la migrazione (revisione del 16 ottobre, M9). Un file usato da
 * un articolo non si cancella: il pannello dice da quale. Dal 22 ottobre 2026
 * qui si caricano anche, più di uno alla volta e con la barra, e i tipi
 * stanno in tre schede, come nel React.
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

$tipo   = (string)($_GET['tipo'] ?? 'immagini');
if (!isset(SCHEDE_MEDIA[$tipo])) $tipo = 'immagini';
$pagina = max(1, (int)($_GET['pagina'] ?? 1));
$base   = '/admin/media.php?tipo=' . $tipo;
$qui    = $base . ($pagina > 1 ? '&pagina=' . $pagina : '');

/* ── Cancellare ──────────────────────────────────────────────────────────
   Uno (il pulsante della sua scheda porta il suo id) o i selezionati. Quelli
   in uso restano, e il messaggio dice perché. */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    $ids = isset($_POST['elimina'])
        ? [(int)$_POST['elimina']]
        : array_map('intval', (array)($_POST['scelti'] ?? []));
    $ids = array_values(array_filter($ids, fn($i) => $i > 0));
    if (!$ids) torna($qui, 'Non avevi selezionato niente.', true);

    $fatte = 0; $rifiuti = [];
    foreach ($ids as $id) {
        $motivo = elimina_media($id);
        if ($motivo === '') $fatte++; else $rifiuti[] = $motivo;
    }
    $messaggio = $fatte === 1 ? 'Un file cancellato.' : ($fatte > 1 ? $fatte . ' file cancellati.' : '');
    if ($rifiuti) $messaggio = trim($messaggio . ' ' . implode(' ', array_slice($rifiuti, 0, 3))
                                   . (count($rifiuti) > 3 ? ' E altri ' . (count($rifiuti) - 3) . '.' : ''));
    torna($qui, $messaggio, $fatte === 0);
}

$conteggi = [];
foreach (array_keys(SCHEDE_MEDIA) as $chiave) $conteggi[$chiave] = conta_media($chiave);

$perPagina = 60;
$elementi  = admin_media($perPagina, ($pagina - 1) * $perPagina, $tipo);
$pagine    = max(1, (int)ceil($conteggi[$tipo] / $perPagina));
$uso       = media_in_uso($elementi);

testa_pannello('Libreria', 'media');
titolo_pannello('Libreria', $conteggi['immagini'] . ' immagini, ' . $conteggi['documenti'] . ' documenti, '
                            . $conteggi['file'] . ' file');
avviso_pannello();
?>

<?php zona_caricamento('file-libreria', 'ricarica', 'tutti'); ?>

<p class="aiuto" style="margin-bottom:20px">
  Si carica qui o dalla scheda di un articolo. Le immagini sopra i 1920 pixel di
  larghezza si rimpiccioliscono e diventano WebP (le GIF animate restano GIF); PDF
  e archivi restano come sono. Clicca un file per copiarne l'indirizzo. Quelli con
  la scritta «in uso» stanno in un articolo e non si cancellano finché non li togli da lì.
  <?php if (IN_SVILUPPO): ?>
    <br><b>In sviluppo</b> i file non sono su questo computer: le anteprime
    arrivano dal sito in produzione, e cancellare toglie solo la riga.
  <?php endif; ?>
</p>

<nav class="schede-media" aria-label="Tipi di file">
  <?php foreach (SCHEDE_MEDIA as $chiave => $nome): ?>
    <a href="/admin/media.php?tipo=<?= e($chiave) ?>"<?= $chiave === $tipo ? ' aria-current="page"' : '' ?>>
      <?= e($nome) ?> <span><?= $conteggi[$chiave] ?></span></a>
  <?php endforeach; ?>
</nav>

<?php if (!$elementi): ?>
  <p class="aiuto">In questa scheda non c'è niente.</p>
<?php else: ?>
<form method="post" action="<?= e($qui) ?>">
  <?= campo_gettone() ?>
  <ul class="griglia-media">
    <?php foreach ($elementi as $m):
      $url = url_immagine($m['file_path']);
      $doveUsata = $uso[(int)$m['id']] ?? [];
      $estensione = strtoupper(pathinfo((string)$m['file_path'], PATHINFO_EXTENSION)); ?>
      <li>
        <button type="button" data-copia="<?= e($url) ?>" title="Copia l'indirizzo">
          <?php if (scheda_media($m) === 'immagini'): ?>
            <div class="anteprima"><img src="<?= e($url) ?>" alt="" loading="lazy"></div>
          <?php else: ?>
            <div class="anteprima anteprima-file"><span><?= e($estensione) ?></span></div>
          <?php endif; ?>
          <figcaption><?= e($m['filename']) ?><br><span class="spento"><?= e(peso_breve((int)$m['size'])) ?></span></figcaption>
        </button>
        <div class="media-comandi">
          <?php if ($doveUsata): ?>
            <span class="eti" title="<?= e(implode(' · ', $doveUsata)) ?>">in uso (<?= count($doveUsata) ?>)</span>
          <?php else: ?>
            <label class="spunta-piccola"><input type="checkbox" name="scelti[]" value="<?= (int)$m['id'] ?>"
                   aria-label="Seleziona <?= e($m['filename']) ?>"> scegli</label>
            <button class="mini mini-pericolo" type="submit" name="elimina" value="<?= (int)$m['id'] ?>"
                    data-conferma-click="Cancello «<?= e($m['filename']) ?>»? Il file sparisce dal server.">Cancella</button>
          <?php endif; ?>
        </div>
      </li>
    <?php endforeach; ?>
  </ul>
  <div class="btn-fila" style="margin-top:18px">
    <?php /* La domanda sta sul pulsante e non sul modulo: chi cancella una
             scheda sola ha già risposto alla sua, e non deve rispondere due volte. */ ?>
    <button class="btn btn-muto" type="submit"
            data-conferma-click="Cancello i file selezionati? Spariscono dal server, non si torna indietro.">Cancella i selezionati</button>
  </div>
</form>
<?php endif; ?>

<?php if ($pagine > 1): ?>
  <nav aria-label="Pagine">
    <ol class="pagine">
      <?php for ($i = 1; $i <= $pagine; $i++): ?>
        <li><a href="<?= e($base . ($i > 1 ? '&pagina=' . $i : '')) ?>"
               <?= $i === $pagina ? 'aria-current="page"' : '' ?>><?= $i ?></a></li>
      <?php endfor; ?>
    </ol>
  </nav>
<?php endif; ?>

<p class="esito" id="esito-copia" role="status" aria-live="polite"></p>

<?php piede_pannello(false, ['caricamenti.js']); ?>

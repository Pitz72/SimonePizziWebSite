<?php
/**
 * La libreria delle immagini.
 *
 * I file veri stanno in public/uploads/ sul server, e ci arrivano da
 * admin/carica.php, che li ridimensiona sopra i 1920px e li converte in WebP.
 * Qui si guarda che cosa c'è, si copia l'indirizzo e si cancella quello che
 * non serve più: la cancellazione c'era nel pannello React ed era andata
 * persa con la migrazione (revisione del 16 ottobre, M9). Un'immagine usata da
 * un articolo non si cancella: il pannello dice da quale.
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

$pagina    = max(1, (int)($_GET['pagina'] ?? 1));
$qui       = '/admin/media.php' . ($pagina > 1 ? '?pagina=' . $pagina : '');

/* ── Cancellare ──────────────────────────────────────────────────────────
   Una (il pulsante della sua scheda porta il suo id) o le selezionate. Quelle
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
    $messaggio = $fatte === 1 ? 'Un\'immagine cancellata.' : ($fatte > 1 ? $fatte . ' immagini cancellate.' : '');
    if ($rifiuti) $messaggio = trim($messaggio . ' ' . implode(' ', array_slice($rifiuti, 0, 3))
                                   . (count($rifiuti) > 3 ? ' E altre ' . (count($rifiuti) - 3) . '.' : ''));
    torna($qui, $messaggio, $fatte === 0);
}

$perPagina = 60;
$immagini  = admin_media($perPagina, ($pagina - 1) * $perPagina);
$totale    = conta_media();
$pagine    = max(1, (int)ceil($totale / $perPagina));
$uso       = media_in_uso($immagini);

testa_pannello('Immagini', 'media');
titolo_pannello('Immagini', $totale . ' nella libreria');
avviso_pannello();
?>

<p class="aiuto" style="margin-bottom:20px">
  Le immagini si caricano dalla scheda di un articolo, dove servono. Qui si vede
  che cosa c'è già: cliccane una per copiarne l'indirizzo. Quelle con la scritta
  «in uso» stanno in un articolo e non si cancellano finché non le togli da lì.
  <?php if (IN_SVILUPPO): ?>
    <br><b>In sviluppo</b> i file non sono su questo computer: le anteprime
    arrivano dal sito in produzione, e cancellare toglie solo la riga.
  <?php endif; ?>
</p>

<form method="post" action="<?= e($qui) ?>">
  <?= campo_gettone() ?>
  <ul class="griglia-media">
    <?php foreach ($immagini as $m):
      $url = url_immagine($m['file_path']);
      $doveUsata = $uso[(int)$m['id']] ?? []; ?>
      <li>
        <button type="button" data-copia="<?= e($url) ?>" title="Copia l'indirizzo">
          <div class="anteprima"><img src="<?= e($url) ?>" alt="" loading="lazy"></div>
          <figcaption><?= e($m['filename']) ?><br><span class="spento"><?= (int)round(((int)$m['size']) / 1024) ?> KB</span></figcaption>
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
            data-conferma-click="Cancello le immagini selezionate? I file spariscono dal server, non si torna indietro.">Cancella le selezionate</button>
  </div>
</form>

<?php if ($pagine > 1): ?>
  <nav aria-label="Pagine">
    <ol class="pagine">
      <?php for ($i = 1; $i <= $pagine; $i++): ?>
        <li><a href="/admin/media.php<?= $i > 1 ? '?pagina=' . $i : '' ?>"
               <?= $i === $pagina ? 'aria-current="page"' : '' ?>><?= $i ?></a></li>
      <?php endfor; ?>
    </ol>
  </nav>
<?php endif; ?>

<p class="esito" id="esito-copia" role="status" aria-live="polite"></p>

<?php piede_pannello(); ?>

<?php
/**
 * La libreria delle immagini.
 *
 * I file veri stanno in public/uploads/ sul server, e ci arrivano da
 * api/upload.php, che li ridimensiona sopra i 1920px e li converte in WebP con
 * GD. Quella parte non si tocca: funziona, ed è l'unica del vecchio sito che
 * tratta i file. Qui si guarda che cosa c'è e si copia l'indirizzo.
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

$pagina    = max(1, (int)($_GET['pagina'] ?? 1));
$perPagina = 60;
$immagini  = admin_media($perPagina, ($pagina - 1) * $perPagina);
$totale    = conta_media();
$pagine    = max(1, (int)ceil($totale / $perPagina));

testa_pannello('Immagini', 'media');
titolo_pannello('Immagini', $totale . ' nella libreria');
avviso_pannello();
?>

<p class="aiuto" style="margin-bottom:20px">
  Le immagini si caricano dalla scheda di un articolo o di un progetto, dove
  servono. Qui si vede che cosa c'è già: cliccane una per copiarne l'indirizzo.
  <?php if (IN_SVILUPPO): ?>
    <br><b>In sviluppo</b> i file non sono su questo computer: le anteprime
    arrivano dal sito in produzione.
  <?php endif; ?>
</p>

<ul class="griglia-media">
  <?php foreach ($immagini as $m): $url = url_immagine($m['file_path']); ?>
    <li>
      <button type="button" data-copia="<?= e($url) ?>" title="Copia l'indirizzo">
        <div class="anteprima"><img src="<?= e($url) ?>" alt="" loading="lazy"></div>
        <figcaption><?= e($m['filename']) ?><br><span class="spento"><?= (int)round(((int)$m['size']) / 1024) ?> KB</span></figcaption>
      </button>
    </li>
  <?php endforeach; ?>
</ul>

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

<script nonce="<?= e(nonce()) ?>">
document.addEventListener('click', function (ev) {
  var b = ev.target.closest('[data-copia]');
  if (!b) return;
  var url = b.getAttribute('data-copia');
  var esito = document.getElementById('esito-copia');
  function detto(t, tipo) { esito.textContent = t; esito.setAttribute('data-tipo', tipo); }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(
      function () { detto('Indirizzo copiato: ' + url, 'ok'); },
      function () { detto('Non sono riuscito a copiare. Eccolo: ' + url, 'no'); }
    );
  } else {
    detto('Eccolo: ' + url, 'no');
  }
});
</script>

<?php piede_pannello(); ?>

<?php
/**
 * Il piede, le finestre e gli script. Chiude ogni pagina.
 *
 * Gli script stanno qui in fondo e sono `defer`: la pagina si legge prima che
 * arrivino, perché tutto quello che c'è da leggere è già nell'HTML. È la
 * differenza con il sito di prima, dove senza JavaScript non compariva niente.
 */
$conteggi_piede = conteggi();
$con_condivisione = !empty($GLOBALS['FINESTRE_CONDIVISIONE']);
?>
<footer class="piede">
  <div class="gab piede-dentro">
    <span class="eti">© <?= date('Y') ?> Simone Pizzi</span>
    <span class="eti"><?= $conteggi_piede['articoli'] ?> articoli</span>
    <nav class="eti" aria-label="Collegamenti di servizio">
      <a href="/archivio">Archivio</a>
      <a href="/api/rss.php">RSS</a>
      <a href="/contatti">Contatti</a>
      <a href="https://ecosystem.runtimeradio.com/it/" target="_blank" rel="noopener">Progetti</a>
      <?php /* L'informativa e la cookie policy si raggiungono da ogni pagina, non
               solo dalle caselle del consenso: chi vuole sapere che cosa il sito
               fa dei suoi dati non deve iscriversi a niente per scoprirlo. Il piede
               del sito React li aveva; il taglio del 7 settembre li aveva persi
               (revisione del 16 ottobre, G4). */ ?>
      <a href="/privacy">Privacy</a>
      <a href="/cookie-policy">Cookie</a>
    </nav>
    <span class="eti">Runtime Radio · Italian Podcast Network</span>
  </div>
</footer>

<?php blocco_finestre($con_condivisione); ?>

<script src="<?= e(asset_v('/assets/js/interfaccia.js')) ?>" defer></script>
<script src="<?= e(asset_v('/assets/js/ricerca.js')) ?>" defer></script>
<script src="<?= e(asset_v('/assets/js/newsletter.js')) ?>" defer></script>
<?php if ($con_condivisione): ?>
<script src="<?= e(asset_v('/assets/js/sommario.js')) ?>" defer></script>
<script src="<?= e(asset_v('/assets/js/reazioni.js')) ?>" defer></script>
<script src="<?= e(asset_v('/assets/js/visite.js')) ?>" defer></script>
<script src="<?= e(asset_v('/assets/js/video.js')) ?>" defer></script>
<?php endif; ?>
</body>
</html>

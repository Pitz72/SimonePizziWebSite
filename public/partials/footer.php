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
    <span class="eti"><?= $conteggi_piede['articoli'] ?> articoli · <?= $conteggi_piede['progetti'] ?> progetti</span>
    <nav class="eti" aria-label="Collegamenti di servizio">
      <a href="/api/rss.php">RSS</a>
      <a href="/contatti">Contatti</a>
      <a href="/tutti-i-progetti">Progetti</a>
    </nav>
    <span class="eti">Runtime Radio · Italian Podcast Network</span>
  </div>
</footer>

<?php blocco_finestre($con_condivisione); ?>

<script nonce="<?= e(nonce()) ?>" src="/assets/js/interfaccia.js" defer></script>
<script nonce="<?= e(nonce()) ?>" src="/assets/js/ricerca.js" defer></script>
<script nonce="<?= e(nonce()) ?>" src="/assets/js/newsletter.js" defer></script>
<?php if ($con_condivisione): ?>
<script nonce="<?= e(nonce()) ?>" src="/assets/js/sommario.js" defer></script>
<script nonce="<?= e(nonce()) ?>" src="/assets/js/reazioni.js" defer></script>
<?php endif; ?>
</body>
</html>

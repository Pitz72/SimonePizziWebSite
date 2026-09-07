<?php
/** Il piede, e la chiusura della pagina. */
$conteggi_piede = conteggi();
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

<script nonce="<?= e(nonce()) ?>" src="/assets/js/interfaccia.js" defer></script>
</body>
</html>

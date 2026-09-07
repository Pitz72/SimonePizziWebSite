<?php
/**
 * /tutti-i-progetti
 *
 * I due pulsanti di ogni progetto stanno sempre nello stesso posto e portano
 * dove dice il pannello: il primo all'azione principale (scaricare, aprire),
 * il secondo all'articolo che racconta la cosa. Se un progetto ne ha uno solo,
 * si stampa uno solo — un pulsante senza indirizzo è un pulsante rotto.
 */
$elenco = progetti();
?>
<?php require __DIR__ . '/../partials/head.php'; ?>

<main id="contenuto" class="contenuto">
  <div class="gab">
    <nav aria-label="Percorso">
      <ol class="briciole eti">
        <li><a href="/">Home</a></li>
        <li><span aria-current="page">Tutti i progetti</span></li>
      </ol>
    </nav>

    <header class="testata">
      <h1 class="gro">Tutti i progetti</h1>
      <p><?= count($elenco) ?> lavori fra videogiochi, motori narrativi, software per la radio e libri.</p>
    </header>

    <ul class="banco" style="margin-top:28px">
      <?php foreach ($elenco as $progetto) blocco_progetto($progetto); ?>
    </ul>
  </div>

  <?php blocco_newsletter(); ?>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

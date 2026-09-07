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

    <ul style="list-style:none;margin:0;padding:0">
      <?php foreach ($elenco as $p): ?>
        <li style="padding:20px 0;border-bottom:1px solid var(--filo2)">
          <span class="eti spento"><?= e($p['category']) ?></span>
          <h2 class="gro" style="font-size:24px;margin:6px 0 8px"><?= e($p['name']) ?></h2>
          <p class="spento" style="margin:0 0 14px;max-width:70ch"><?= e(tronca($p['description'], 220)) ?></p>
          <div class="btn-fila">
            <?php if (trim((string)$p['button_a_label']) !== '' && trim((string)$p['button_a_url']) !== ''): ?>
              <a class="btn btn-pieno" href="<?= e($p['button_a_url']) ?>"><?= e($p['button_a_label']) ?></a>
            <?php endif; ?>
            <?php if (trim((string)$p['button_b_label']) !== '' && trim((string)$p['button_b_url']) !== ''): ?>
              <a class="btn btn-muto" href="<?= e($p['button_b_url']) ?>"><?= e($p['button_b_label']) ?></a>
            <?php endif; ?>
          </div>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

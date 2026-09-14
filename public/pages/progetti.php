<?php
/**
 * /tutti-i-progetti
 *
 * I progetti sono divisi per categoria principale, nell'ordine del menu, e
 * dentro ogni sezione vanno dal più recente: l'ordine non si imposta più dal
 * pannello. Ogni scheda ha la sua immagine come sfondo.
 *
 * I due pulsanti di ogni progetto stanno sempre nello stesso posto e portano
 * dove dice il pannello: il primo all'azione principale (scaricare, aprire),
 * il secondo all'articolo che racconta la cosa. Se un progetto ne ha uno solo,
 * si stampa uno solo — un pulsante senza indirizzo è un pulsante rotto.
 */
$sezioni = progetti_per_sezione();
$totale = array_sum(array_map(fn($s) => count($s['progetti']), $sezioni));

$ancora = fn(array $c) => 'sezione-' . ($c['slug'] !== '' ? $c['slug'] : 'altro');
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
      <p><?= $totale ?> lavori, divisi per sezione.</p>
      <?php if (count($sezioni) > 1): ?>
        <nav class="pill-fila indice-reparti" aria-label="Sezioni della pagina">
          <?php foreach ($sezioni as $s): ?>
            <a class="pill" href="#<?= e($ancora($s['categoria'])) ?>">
              <?= e($s['categoria']['name']) ?> <b><?= count($s['progetti']) ?></b>
            </a>
          <?php endforeach; ?>
        </nav>
      <?php endif; ?>
    </header>

    <?php if ($sezioni === []): ?>
      <p class="vuoto" style="margin-top:28px">Nessun progetto pubblicato, per ora.</p>
    <?php endif; ?>

    <?php foreach ($sezioni as $n => $s):
      $c = $s['categoria'];
      $quanti = count($s['progetti']); ?>
      <section class="reparto" id="<?= e($ancora($c)) ?>" aria-labelledby="titolo-<?= e($ancora($c)) ?>">
        <div class="reparto-cima">
          <span class="eti reparto-numero"><?= sprintf('%02d', $n + 1) ?></span>
          <h2 id="titolo-<?= e($ancora($c)) ?>"><?= e($c['name']) ?></h2>
          <span class="eti spento"><?= $quanti === 1 ? '1 progetto' : $quanti . ' progetti' ?></span>
          <?php if ($c['slug'] !== ''): ?>
            <a class="eti" href="/<?= e($c['slug']) ?>">Gli articoli →</a>
          <?php endif; ?>
        </div>
        <ul class="banco">
          <?php foreach ($s['progetti'] as $progetto) blocco_progetto($progetto, $progetto['sottocategoria']); ?>
        </ul>
      </section>
    <?php endforeach; ?>
  </div>

  <?php blocco_newsletter(); ?>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

<?php
/**
 * La home.
 *
 * In questa sessione c'è l'ossatura: apertura, numeri veri e i due elenchi
 * presi dal database. I blocchi disegnati — il campo verde, la scheda in
 * primo piano, le righe delle lavorazioni — arrivano con la sessione delle
 * pagine pubbliche.
 */
$numeri   = conteggi();
$apertura = articolo_in_apertura();
$recenti  = articoli_recenti(6);

pagina([
    'immagine' => $apertura ? url_immagine($apertura['cover_image']) : '',
    'jsonld'   => [
        '@context' => 'https://schema.org',
        '@type'    => 'WebSite',
        'name'     => SITO_NOME,
        'url'      => SITO_URL,
        'description' => SITO_DESCR,
    ],
]);

require __DIR__ . '/../partials/head.php';
?>

<main id="contenuto" class="contenuto">
  <div class="gab">
    <header class="testata">
      <span class="eti spento"><?= e(SITO_MOTTO) ?></span>
      <h1 class="gro" style="margin-top:12px">Creazioni ibride</h1>
      <p><?= e(SITO_DESCR) ?></p>
      <div class="btn-fila" style="margin-top:24px">
        <a class="btn btn-pieno" href="/tutti-i-progetti">Tutti i progetti</a>
        <a class="btn" href="/blog-e-riflessioni">Ultimi articoli</a>
      </div>
    </header>

    <p class="eti spento" style="padding:22px 0">
      <?= $numeri['articoli'] ?> articoli · <?= $numeri['progetti'] ?> progetti · <?= $numeri['tag'] ?> tag ·
      ultimo <?= e(data_breve($numeri['ultimo'])) ?>
    </p>

    <?php if ($apertura): ?>
      <h2 class="gro" style="font-size:28px;margin:20px 0 10px">In primo piano</h2>
      <p><a href="<?= e(url_articolo($apertura)) ?>"><?= e($apertura['title']) ?></a><br>
         <span class="spento"><?= e(estratto($apertura)) ?></span></p>
    <?php endif; ?>

    <h2 class="gro" style="font-size:28px;margin:34px 0 10px">Ultime lavorazioni</h2>
    <ul style="list-style:none;margin:0;padding:0">
      <?php foreach ($recenti as $a): ?>
        <li style="padding:12px 0;border-bottom:1px solid var(--filo2)">
          <span class="eti spento"><?= e(data_breve($a['published_at'] ?: $a['created_at'])) ?></span><br>
          <a href="<?= e(url_articolo($a)) ?>"><?= e($a['title']) ?></a>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

<?php
/**
 * La home.
 *
 * Apertura a campo nero (scelta del 7 settembre 2026), l'articolo in apertura,
 * le ultime lavorazioni, due progetti, la lettera. Niente scorre da solo e
 * niente compare allo scorrimento: quello che c'è si vede subito.
 */
$numeri   = conteggi();
$apertura = articolo_in_apertura();

/* L'articolo in apertura non deve ricomparire nella riga sotto: si chiede uno
   in più e lo si toglie. Senza questo, il primo articolo del sito compare due
   volte nella stessa schermata — succede sempre, perché nessun articolo è
   segnato «in vetrina» e l'apertura ripiega sul più recente. */
$recenti = array_values(array_filter(
    articoli_recenti(7),
    fn($a) => !$apertura || (int)$a['id'] !== (int)$apertura['id']
));
$recenti = array_slice($recenti, 0, 6);

$nomi_categoria = [];
foreach (categorie_radice() as $c) $nomi_categoria[$c['slug']] = $c['name'];
foreach (categorie_radice() as $c) {
    foreach (sottocategorie((int)$c['id']) as $f) $nomi_categoria[$f['slug']] = $f['name'];
}

pagina([
    'immagine' => $apertura ? url_immagine($apertura['cover_image']) : '',
    'jsonld'   => [
        '@context' => 'https://schema.org',
        '@type'    => 'WebSite',
        'name'     => SITO_NOME,
        'url'      => SITO_URL,
        'description' => SITO_DESCR,
        'author'   => ['@type' => 'Person', 'name' => SITO_NOME],
    ],
]);

require __DIR__ . '/../partials/head.php';
?>

<main id="contenuto" class="contenuto">

  <header class="apertura">
    <div class="gab apertura-dentro">
      <span class="eti spento"><?= e(SITO_MOTTO) ?></span>
      <h1 class="gro">Creazioni <em>ibride</em></h1>
      <div class="apertura-sotto">
        <p><?= e(SITO_DESCR) ?></p>
        <div class="btn-fila">
          <a class="btn btn-pieno" href="/tutti-i-progetti">Tutti i progetti</a>
          <a class="btn" href="/blog-e-riflessioni">Ultimi articoli</a>
        </div>
      </div>
      <div class="contatori">
        <div><b><?= $numeri['articoli'] ?></b><span class="eti">Articoli</span></div>
        <div><b><?= $numeri['progetti'] ?></b><span class="eti">Progetti</span></div>
        <div><b><?= count(categorie_radice()) ?></b><span class="eti">Sezioni</span></div>
        <div><b><?= e(data_breve($numeri['ultimo'])) ?></b><span class="eti">Ultimo</span></div>
      </div>
    </div>
  </header>

  <?php if ($apertura): ?>
    <section class="sezione"><div class="gab">
      <div class="sezione-cima">
        <h2>In primo piano</h2>
        <a class="eti" href="/<?= e($apertura['category']) ?>"><?= e($nomi_categoria[$apertura['category']] ?? $apertura['category']) ?> →</a>
      </div>
      <?php blocco_primo($apertura, $nomi_categoria[$apertura['category']] ?? $apertura['category']); ?>
    </div></section>
  <?php endif; ?>

  <section class="sezione"><div class="gab">
    <div class="sezione-cima">
      <h2>Ultime lavorazioni</h2>
      <a class="eti" href="/blog-e-riflessioni">Archivio completo →</a>
    </div>
    <ul class="lavorazioni">
      <?php foreach ($recenti as $a) blocco_riga($a, true, $nomi_categoria[$a['category']] ?? $a['category']); ?>
    </ul>
  </div></section>

  <?php $vetrina = array_slice(progetti(), 0, 2); if ($vetrina): ?>
    <section class="sezione"><div class="gab">
      <div class="sezione-cima">
        <h2>Sul banco</h2>
        <a class="eti" href="/tutti-i-progetti">Tutti e <?= $numeri['progetti'] ?> →</a>
      </div>
      <ul class="banco">
        <?php foreach ($vetrina as $p) blocco_progetto($p); ?>
      </ul>
    </div></section>
  <?php endif; ?>

  <?php blocco_newsletter(); ?>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

<?php
/**
 * L'archivio di un tag: /tag/{tag}
 *
 * @var array $tag
 * @var int   $totale
 */

$pagina_num = max(1, (int)($_GET['pagina'] ?? 1));
const PER_PAGINA_TAG = 12;

$articoli = articoli_di_tag((int)$tag['id'], PER_PAGINA_TAG, ($pagina_num - 1) * PER_PAGINA_TAG);

/* Un tag attraversa tutto il sito: qui la categoria di ogni riga è
   un'informazione vera, non una ripetizione. */
$nomi_categoria = [];
foreach (categorie_radice() as $c) {
    $nomi_categoria[$c['slug']] = $c['name'];
    foreach (sottocategorie((int)$c['id']) as $f) $nomi_categoria[$f['slug']] = $f['name'];
}
if ($pagina_num > 1 && !$articoli) non_trovata();

$percorso    = '/tag/' . $tag['slug'];
$descrizione = sprintf('Gli articoli di Simone Pizzi con il tag «%s»: %d in tutto, dal più recente.',
    $tag['name'], $totale);

pagina([
    'title'     => $tag['name'] . ' — ' . SITO_NOME,
    'desc'      => $descrizione,
    'canonical' => $percorso . ($pagina_num > 1 ? '?pagina=' . $pagina_num : ''),
    /* Un tag su uno o due articoli non fa un archivio: fa una pagina che
       ripete cose già presenti altrove. Resta navigabile ma esce dall'indice.
       La soglia è quella della v1.27.0 e va tenuta uguale in sitemap.php. */
    'noindex'   => $totale < TAG_MINIMO_PER_INDICE || $pagina_num > 1,
    'briciole'  => [['nome' => 'Home', 'url' => '/'], ['nome' => $tag['name']]],
    'jsonld'    => jsonld_raccolta($tag['name'], $descrizione, $percorso),
]);

require __DIR__ . '/../partials/head.php';
?>

<main id="contenuto" class="contenuto">
  <div class="gab">
    <nav aria-label="Percorso">
      <ol class="briciole eti">
        <li><a href="/">Home</a></li>
        <li><span aria-current="page">Tag</span></li>
      </ol>
    </nav>

    <header class="testata">
      <span class="eti spento">Tag</span>
      <h1 class="gro" style="margin-top:10px"><?= e($tag['name']) ?></h1>
      <p><?= $totale ?> articol<?= $totale === 1 ? 'o' : 'i' ?>.</p>
    </header>

    <ul class="lavorazioni">
      <?php foreach ($articoli as $a) blocco_riga($a, true, $nomi_categoria[$a['category']] ?? $a['category']); ?>
    </ul>

    <?php if ($totale > PER_PAGINA_TAG): $ultime = (int)ceil($totale / PER_PAGINA_TAG); ?>
      <nav aria-label="Pagine">
        <ol class="pagine">
          <?php for ($i = 1; $i <= $ultime; $i++): ?>
            <li><a href="<?= e($percorso) ?><?= $i > 1 ? '?pagina=' . $i : '' ?>"
                   <?= $i === $pagina_num ? 'aria-current="page"' : '' ?>><?= $i ?></a></li>
          <?php endfor; ?>
        </ol>
      </nav>
    <?php endif; ?>
  </div>

  <?php blocco_newsletter(); ?>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

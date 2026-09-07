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

    <ul style="list-style:none;margin:0;padding:0">
      <?php foreach ($articoli as $a): ?>
        <li style="padding:14px 0;border-bottom:1px solid var(--filo2)">
          <span class="eti spento"><?= e(data_breve($a['published_at'] ?: $a['created_at'])) ?></span><br>
          <a href="<?= e(url_articolo($a)) ?>"><?= e($a['title']) ?></a>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

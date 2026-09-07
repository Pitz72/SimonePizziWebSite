<?php
/**
 * L'archivio di una categoria: /{categoria}
 *
 * Raccoglie gli articoli della categoria e delle sue figlie — senza questo,
 * /videogiochi e /progetti-software sarebbero pagine vuote, perché gli
 * articoli stanno tutti nelle sottocategorie. Il perché sta in query.php,
 * dentro slug_del_ramo().
 *
 * @var array $categoria
 */

$pagina_num = max(1, (int)($_GET['pagina'] ?? 1));
const PER_PAGINA = 12;

$totale   = conta_articoli_categoria($categoria);
$articoli = articoli_di_categoria($categoria, PER_PAGINA, ($pagina_num - 1) * PER_PAGINA);
$figlie   = sottocategorie((int)$categoria['id']);

/* Dentro l'archivio di «Videogiochi» ogni riga porta scritto da quale progetto
   viene: è un dato che cambia da riga a riga. Dentro l'archivio di un singolo
   progetto no — ripetere la stessa parola dodici volte non dice niente. */
$nomi_figlie = [];
foreach ($figlie as $f) $nomi_figlie[$f['slug']] = $f['name'];
$mostra_sotto = count($figlie) > 0;

/* L'articolo fissato apre la sezione, come quello in vetrina apre la home.
   Si mostra solo sulla prima pagina, e si toglie dall'elenco sotto: comparire
   due volte nella stessa schermata lo farebbe sembrare un errore. */
$apre = $pagina_num === 1 ? fissato_di_categoria((string)$categoria['slug']) : null;
if ($apre) {
    $articoli = array_values(array_filter($articoli,
        fn($a) => (int)$a['id'] !== (int)$apre['id']));
}
$ultime   = ceil(max(1, $totale) / PER_PAGINA);

// Chiedere la pagina 40 di un archivio che ne ha 3 non è una pagina: è un 404.
if ($pagina_num > 1 && !$articoli) non_trovata();

$percorso = '/' . $categoria['slug'];
$descrizione = sprintf(
    '%s: %d articol%s di Simone Pizzi, dal più recente. Devlog, note di lavorazione e annunci.',
    $categoria['name'], $totale, $totale === 1 ? 'o' : 'i'
);

pagina([
    'title'     => $categoria['name'] . ' — ' . SITO_NOME,
    'desc'      => $descrizione,
    'canonical' => $percorso . ($pagina_num > 1 ? '?pagina=' . $pagina_num : ''),
    // Le pagine dalla seconda in poi ripetono la stessa intestazione con
    // articoli diversi: restano navigabili, ma fuori dall'indice.
    'noindex'   => $pagina_num > 1,
    'briciole'  => [['nome' => 'Home', 'url' => '/'], ['nome' => $categoria['name']]],
    'jsonld'    => jsonld_raccolta($categoria['name'], $descrizione, $percorso),
]);

require __DIR__ . '/../partials/head.php';
?>

<main id="contenuto" class="contenuto">
  <div class="gab">
    <nav aria-label="Percorso">
      <ol class="briciole eti">
        <li><a href="/">Home</a></li>
        <li><span aria-current="page"><?= e($categoria['name']) ?></span></li>
      </ol>
    </nav>

    <header class="testata">
      <div class="testata-riga">
        <div>
          <h1 class="gro"><?= e($categoria['name']) ?></h1>
          <p><?= $totale ?> articol<?= $totale === 1 ? 'o' : 'i' ?>, dal più recente.</p>
        </div>
        <?php if ($figlie): ?>
          <div class="pill-fila">
            <?php foreach ($figlie as $f): ?>
              <a class="pill" href="/<?= e($f['slug']) ?>"><?= e($f['name']) ?></a>
            <?php endforeach; ?>
          </div>
        <?php endif; ?>
      </div>
    </header>

    <?php if ($apre): ?>
      <div style="margin-top:26px">
        <?php blocco_primo($apre, $nomi_figlie[$apre['category']] ?? $categoria['name']); ?>
      </div>
    <?php endif; ?>

    <?php if (!$articoli && !$apre): ?>
      <p class="vuoto">Qui non c'è ancora niente. Succede: vuol dire che il lavoro è in corso.</p>
    <?php elseif ($articoli): ?>
      <ul class="lavorazioni">
        <?php foreach ($articoli as $a) blocco_riga($a, $mostra_sotto, $nomi_figlie[$a['category']] ?? ''); ?>
      </ul>

      <?php if ($ultime > 1): ?>
        <nav aria-label="Pagine">
          <ol class="pagine">
            <?php for ($i = 1; $i <= $ultime; $i++): ?>
              <li><a href="<?= e($percorso) ?><?= $i > 1 ? '?pagina=' . $i : '' ?>"
                     <?= $i === $pagina_num ? 'aria-current="page"' : '' ?>><?= $i ?></a></li>
            <?php endfor; ?>
          </ol>
        </nav>
      <?php endif; ?>
    <?php endif; ?>
  </div>

  <?php blocco_newsletter(); ?>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

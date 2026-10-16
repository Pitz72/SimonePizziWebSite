<?php
/**
 * L'archivio: /archivio — tutti gli articoli pubblicati, dal più recente,
 * divisi per anno.
 *
 * Fino al 16 ottobre 2026 il sito non aveva un elenco unico: «Archivio
 * completo» in home portava alla sezione Blog, cioè a 10 articoli su 86
 * (revisione del 16 ottobre, M7). L'archivio cronologico era già nella
 * roadmap del sito React, mai fatto.
 *
 * Nessuna paginazione: le righe sono leggere (niente corpo, copertine
 * caricate solo quando arrivano sullo schermo), e un archivio si legge meglio
 * tutto insieme, con gli anni come segni. Se un giorno gli articoli saranno
 * molti di più, la pagina si divide per anno.
 */

$articoli = tutti_gli_articoli();

$nomi_categoria = [];
foreach (categorie_radice() as $c) {
    $nomi_categoria[$c['slug']] = $c['name'];
    foreach (sottocategorie((int)$c['id']) as $f) $nomi_categoria[$f['slug']] = $f['name'];
}

$perAnno = [];
foreach ($articoli as $a) {
    $anno = date('Y', strtotime((string)($a['published_at'] ?: $a['created_at'])) ?: time());
    $perAnno[$anno][] = $a;
}

pagina([
    'jsonld' => jsonld_raccolta('Archivio', (string)p('desc'), '/archivio'),
]);

require __DIR__ . '/../partials/head.php';
?>

<main id="contenuto" class="contenuto">
  <div class="gab">
    <nav aria-label="Percorso">
      <ol class="briciole eti">
        <li><a href="/">Home</a></li>
        <li><span aria-current="page">Archivio</span></li>
      </ol>
    </nav>

    <header class="testata">
      <h1 class="gro">Archivio</h1>
      <p><?= count($articoli) ?> articol<?= count($articoli) === 1 ? 'o' : 'i' ?>, dal più recente.
         Ogni sezione ha anche il suo archivio, dal menu in alto.</p>
    </header>

    <?php if (!$articoli): ?>
      <p class="vuoto">Qui non c'è ancora niente.</p>
    <?php endif; ?>

    <?php foreach ($perAnno as $anno => $righe): ?>
      <section class="sezione" aria-labelledby="anno-<?= e((string)$anno) ?>">
        <div class="sezione-cima">
          <h2 id="anno-<?= e((string)$anno) ?>"><?= e((string)$anno) ?></h2>
          <span class="eti spento"><?= count($righe) ?> articol<?= count($righe) === 1 ? 'o' : 'i' ?></span>
        </div>
        <ul class="lavorazioni">
          <?php foreach ($righe as $a) blocco_riga($a, true, $nomi_categoria[$a['category']] ?? $a['category']); ?>
        </ul>
      </section>
    <?php endforeach; ?>
  </div>

  <?php blocco_newsletter(); ?>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

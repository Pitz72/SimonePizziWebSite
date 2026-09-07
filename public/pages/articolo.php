<?php
/**
 * Un articolo: /{categoria}/{slug}
 *
 * È la pagina che conta: qui il corpo scritto nell'editor incontra il lettore,
 * e ci passa attraverso safe_html(). Prima esistevano due percorsi — DOMPurify
 * nel browser per le persone, strip_tags sul server per i crawler — e solo uno
 * dei due guardava gli attributi. Adesso il percorso è uno.
 *
 * @var array $articolo
 * @var array $categoria
 */

$tag     = tag_di_articolo((int)$articolo['id']);
$vicini  = articoli_vicini($articolo, 3);
$quando  = $articolo['published_at'] ?: $articolo['created_at'];
$corpo   = safe_html($articolo['content']);

pagina([
    'title'     => titolo_seo($articolo),
    'desc'      => descrizione_seo($articolo),
    'canonical' => url_articolo($articolo),
    'immagine'  => url_immagine($articolo['cover_image']),
    'tipo'      => 'article',
    'briciole'  => [
        ['nome' => 'Home', 'url' => '/'],
        ['nome' => $categoria['name'], 'url' => '/' . $categoria['slug']],
        ['nome' => $articolo['title']],
    ],
    'jsonld'    => jsonld_articolo($articolo, $categoria),
]);

require __DIR__ . '/../partials/head.php';
?>

<main id="contenuto" class="contenuto">
  <div class="gab">
    <nav aria-label="Percorso">
      <ol class="briciole eti">
        <li><a href="/">Home</a></li>
        <li><a href="/<?= e($categoria['slug']) ?>"><?= e($categoria['name']) ?></a></li>
        <li><span aria-current="page"><?= e(tronca($articolo['title'], 40)) ?></span></li>
      </ol>
    </nav>

    <header class="testata">
      <h1 class="gro" style="font-size:clamp(34px,5.2vw,72px)"><?= e($articolo['title']) ?></h1>
      <?php if ($articolo['excerpt']): ?>
        <p style="font-size:19px"><?= e($articolo['excerpt']) ?></p>
      <?php endif; ?>
      <p class="eti spento" style="margin-top:18px">
        <time datetime="<?= e(data_iso($quando)) ?>"><?= e(data_lunga($quando)) ?></time>
        · <?= minuti_lettura($articolo['content']) ?> minuti
        · <?= e($categoria['name']) ?>
      </p>
    </header>

    <article class="corpo" style="max-width:var(--lettura);margin:34px 0 0;font-size:18px;line-height:1.76">
      <?= $corpo ?>
    </article>

    <?php if ($tag): ?>
      <div class="pill-fila" style="margin-top:34px">
        <?php foreach ($tag as $t): ?>
          <a class="pill" href="/tag/<?= e($t['slug']) ?>"><?= e($t['name']) ?></a>
        <?php endforeach; ?>
      </div>
    <?php endif; ?>

    <?php if ($vicini): ?>
      <section style="margin-top:44px;border-top:1px solid var(--verde);padding-top:22px">
        <h2 class="gro" style="font-size:24px">Altro da <?= e($categoria['name']) ?></h2>
        <ul style="list-style:none;margin:14px 0 0;padding:0">
          <?php foreach ($vicini as $v): ?>
            <li style="padding:10px 0;border-bottom:1px solid var(--filo2)">
              <a href="<?= e(url_articolo($v)) ?>"><?= e($v['title']) ?></a>
            </li>
          <?php endforeach; ?>
        </ul>
      </section>
    <?php endif; ?>
  </div>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

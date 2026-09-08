<?php
/**
 * Un articolo: /{categoria}/{slug}
 *
 * È la pagina che conta: il corpo scritto nell'editor incontra il lettore, e
 * ci passa attraverso safe_html(). Prima esistevano due percorsi — DOMPurify
 * nel browser per le persone, strip_tags sul server per i crawler — e solo uno
 * dei due guardava gli attributi. Adesso il percorso è uno.
 *
 * @var array $articolo
 * @var array $categoria
 * @var bool  $anteprima   true solo per l'amministratore che guarda una bozza
 *                         o un articolo programmato: vedi index.php, rotta 4.
 */

/* Il valore arriva sempre da index.php, ma la pagina non deve dipendere da
   quella promessa: senza, un giorno che qualcuno la include da altrove
   l'anteprima si spegne in silenzio invece di far rumore. */
$anteprima = $anteprima ?? false;

/* L'articolo è l'unica pagina con le finestre «condividi» e «scrivi»: il
   piede le stampa solo se glielo si dice. */
$GLOBALS['FINESTRE_CONDIVISIONE'] = true;

$tag    = tag_di_articolo((int)$articolo['id']);
$vicini = articoli_vicini($articolo, 3);
$quando = $articolo['published_at'] ?: $articolo['created_at'];
$copertina = url_immagine($articolo['cover_image']);

// Ripulitura prima, sommario dopo: il sommario lavora sull'albero già pulito
// e mette gli id sui titoli, così le ancore e le voci nascono insieme.
['voci' => $voci, 'corpo' => $corpo] = sommario_e_corpo(safe_html($articolo['content']));

/* In anteprima si arriva anche su una bozza a cui non è stata data ancora una
   categoria: senza questo controllo il percorso mostrerebbe un anello vuoto e
   cliccabile che porta in home. */
$haCategoria = ($categoria['slug'] ?? '') !== '';

pagina([
    'title'     => ($anteprima ? 'Anteprima · ' : '') . titolo_seo($articolo),
    'desc'      => descrizione_seo($articolo),
    'canonical' => url_articolo($articolo),
    /* Un articolo non ancora uscito non deve finire nell'indice se per caso
       questa pagina arriva a un crawler. Non dovrebbe succedere — ci vuole il
       cookie del pannello — ma il meta costa una riga e chiude il caso. */
    'noindex'   => $anteprima,
    'immagine'  => $copertina,
    'tipo'      => 'article',
    'briciole'  => array_values(array_filter([
        ['nome' => 'Home', 'url' => '/'],
        $haCategoria ? ['nome' => $categoria['name'], 'url' => '/' . $categoria['slug']] : null,
        ['nome' => $articolo['title']],
    ])),
    'jsonld'    => jsonld_articolo($articolo, $categoria),
]);

/* Un'anteprima non deve finire in nessuna cache.
   In produzione la pagina di un articolo esce con «Cache-Control: max-age=600»
   messo a livello Apache (non sta in questo repo: è l'.htaccess della home, lo
   stesso che appende max-age agli endpoint — vedi la nota della v1.25.0).
   Su una risposta d'anteprima quel valore è sbagliato due volte: una cache
   condivisa potrebbe servire a un visitatore un articolo non ancora uscito, e
   il browser dell'amministratore continuerebbe a mostrargli la fascia per dieci
   minuti dopo la pubblicazione.
   Questo header va mandato prima di head.php, che apre la stampa. Se il
   Header di Apache dovesse vincere su questo, la controprova è immediata:
   `curl -I` sull'indirizzo con il cookie del pannello. */
if ($anteprima && !headers_sent()) {
    header('Cache-Control: private, no-store, no-cache, must-revalidate');
}

require __DIR__ . '/../partials/head.php';
?>

<main id="contenuto" class="contenuto">

  <div class="gab">
    <?php if ($anteprima):
      $futuro = $articolo['status'] === 'published'
                && $articolo['published_at']
                && strtotime($articolo['published_at']) > time(); ?>
      <p class="fascia-anteprima">
        <b>Anteprima.</b>
        <?php if ($futuro): ?>
          Questo articolo esce il <?= e(data_lunga($articolo['published_at'])) ?>
          alle <?= e(date('H:i', strtotime($articolo['published_at']))) ?>.
        <?php elseif ($articolo['status'] !== 'published'): ?>
          Questo articolo è una bozza.
        <?php else: ?>
          Questo articolo non è raggiungibile dal pubblico.
        <?php endif; ?>
        Lo stai vedendo perché sei entrato nel pannello: per chiunque altro
        questo indirizzo risponde «pagina non trovata».
        <a href="/admin/articolo.php?id=<?= (int)$articolo['id'] ?>">Torna a modificarlo</a>.
      </p>
    <?php endif; ?>

    <nav aria-label="Percorso">
      <ol class="briciole eti">
        <li><a href="/">Home</a></li>
        <?php if ($haCategoria): ?>
          <li><a href="/<?= e($categoria['slug']) ?>"><?= e($categoria['name']) ?></a></li>
        <?php endif; ?>
        <li><span aria-current="page"><?= e(tronca($articolo['title'], 40)) ?></span></li>
      </ol>
    </nav>

    <header class="articolo-testata">
      <?php if ($haCategoria): ?><span class="eti spento"><?= e($categoria['name']) ?></span><?php endif; ?>
      <h1 class="gro"><?= e($articolo['title']) ?></h1>
      <div class="articolo-sotto">
        <?php if ($articolo['excerpt']): ?>
          <p><?= e($articolo['excerpt']) ?></p>
        <?php else: ?><p></p><?php endif; ?>
        <dl class="scheda-fatti">
          <dt>Data</dt>
          <dd><time datetime="<?= e(data_iso($quando)) ?>"><?= e(data_lunga($quando)) ?></time></dd>
          <dt>Lettura</dt><dd><?= minuti_lettura($articolo['content']) ?> minuti</dd>
          <?php if ($voci): ?><dt>Sezioni</dt><dd><?= count($voci) ?></dd><?php endif; ?>
        </dl>
      </div>
    </header>
  </div>

  <?php if ($copertina !== ''): ?>
    <div class="articolo-copertina"><img src="<?= e($copertina) ?>" alt=""></div>
  <?php endif; ?>

  <div class="gab lettura">
    <?php if ($voci): ?>
      <nav class="sommario" id="sommario" aria-labelledby="titolo-sommario">
        <h2 class="eti" id="titolo-sommario">In questa pagina</h2>
        <ol>
          <?php foreach ($voci as $v): ?>
            <li><a href="#<?= e($v['id']) ?>"<?= $v['livello'] === 3 ? ' class="liv-3"' : '' ?>><?= e($v['testo']) ?></a></li>
          <?php endforeach; ?>
        </ol>
      </nav>
    <?php else: ?>
      <div></div>
    <?php endif; ?>

    <div>
      <article class="corpo"><?= $corpo ?></article>

      <div class="reazioni" id="reazioni" data-articolo="<?= (int)$articolo['id'] ?>">
        <?php
        /* Le cinque reazioni e i loro nomi sono quelli di oggi (ReactionBar.tsx
           e ALLOWED_REACTIONS in api/reactions.php): cambiarli qui vorrebbe dire
           buttare via i voti già raccolti. */
        foreach (['thumb' => 'Utile', 'heart' => 'Bello', 'fire' => 'Interessante',
                  'think' => 'Fa pensare', 'game' => 'Game-related'] as $chiave => $nome): ?>
          <button class="reazione" type="button" data-reazione="<?= e($chiave) ?>"
                  aria-pressed="false"><?= e($nome) ?> <b>–</b></button>
        <?php endforeach; ?>
        <span class="reazioni-fine">
          <button class="reazione" type="button" data-apri="condividi">Condividi</button>
          <button class="reazione" type="button" data-apri="scrivi">Scrivi a Simone</button>
        </span>
      </div>

      <?php if ($tag): ?>
        <div class="pill-fila" style="margin-top:24px">
          <?php foreach ($tag as $t): ?>
            <a class="pill" href="/tag/<?= e($t['slug']) ?>"><?= e($t['name']) ?></a>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>
    </div>
  </div>

  <?php if ($vicini): ?>
    <section class="sezione"><div class="gab">
      <div class="sezione-cima">
        <h2>Altro da <?= e($categoria['name']) ?></h2>
        <a class="eti" href="/<?= e($categoria['slug']) ?>">Tutti →</a>
      </div>
      <ul class="lavorazioni">
        <?php foreach ($vicini as $v) blocco_riga($v, false); ?>
      </ul>
    </div></section>
  <?php endif; ?>

  <?php blocco_newsletter(); ?>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

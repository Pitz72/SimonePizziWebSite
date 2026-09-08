<?php
/**
 * La scheda di un articolo: una colonna sola.
 *
 * Prima erano due, e per scrivere il riassunto bisognava saltare da una parte
 * all'altra. L'ordine adesso è quello in cui si lavora davvero: prima i dati,
 * poi il testo, poi il verificatore che dice come sta venendo, e in fondo i
 * numeri di quanto è già stato letto.
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

$id = (int)($_GET['id'] ?? 0);

/* ── Salvataggio ─────────────────────────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();

    $id = (int)($_POST['id'] ?? 0) ?: null;
    $titolo = trim((string)($_POST['title'] ?? ''));

    if ($titolo === '') {
        torna('/admin/articolo.php' . ($id ? '?id=' . $id : ''),
              'Senza titolo non si salva: è il nome con cui l\'articolo esiste ovunque.', true);
    }

    if (($_POST['azione'] ?? '') === 'elimina' && $id) {
        elimina_articolo($id);
        torna('/admin/articoli.php', 'Articolo eliminato.');
    }

    /* La data: il modulo la manda nel formato del browser (2026-09-07T14:30),
       il database la vuole con lo spazio. Se si pubblica senza indicarla, vale
       adesso — un articolo pubblicato senza data non comparirebbe da nessuna
       parte, perché tutti gli elenchi ordinano per data. */
    $quando = trim((string)($_POST['published_at'] ?? ''));
    $quando = $quando !== '' ? str_replace('T', ' ', $quando) . ':00' : '';
    if ($quando === '' && ($_POST['status'] ?? '') === 'published') {
        $quando = date('Y-m-d H:i:s');
    }

    $nuovoId = salva_articolo([
        'title'              => $titolo,
        'slug'               => trim((string)($_POST['slug'] ?? '')),
        'content'            => (string)($_POST['content'] ?? ''),
        'excerpt'            => (string)($_POST['excerpt'] ?? ''),
        'focus_keyword'      => (string)($_POST['focus_keyword'] ?? ''),
        'seo_title'          => (string)($_POST['seo_title'] ?? ''),
        'seo_description'    => (string)($_POST['seo_description'] ?? ''),
        'cover_image'        => (string)($_POST['cover_image'] ?? ''),
        'category'           => (string)($_POST['category'] ?? ''),
        'status'             => (string)($_POST['status'] ?? 'draft'),
        'is_featured'        => !empty($_POST['is_featured']),
        'is_category_pinned' => !empty($_POST['is_category_pinned']),
        'published_at'       => $quando,
    ], $id);

    imposta_tag_articolo($nuovoId, explode(',', (string)($_POST['tags'] ?? '')));

    /* La spunta «in cima alla categoria» passa da qui e non dal semplice UPDATE,
       perché fissarne uno deve togliere il pin all'altro: due articoli in cima
       alla stessa categoria si contenderebbero il posto, e vincerebbe quello
       con la data più recente, a caso. */
    fissa_in_categoria($nuovoId, !empty($_POST['is_category_pinned']));

    torna('/admin/articolo.php?id=' . $nuovoId,
          $id ? 'Salvato.' : 'Articolo creato: adesso è una bozza finché non lo pubblichi.');
}

/* ── La scheda ───────────────────────────────────────────────────────────── */

$a = $id ? admin_articolo($id) : null;
if ($id && !$a) { http_response_code(404); }

$nuovo = !$a;
$a = $a ?: [
    'id' => 0, 'title' => '', 'slug' => '', 'content' => '', 'excerpt' => '',
    'focus_keyword' => '', 'seo_title' => '', 'seo_description' => '',
    'cover_image' => '', 'category' => '', 'status' => 'draft',
    'is_featured' => 0, 'is_category_pinned' => 0, 'published_at' => '', 'created_at' => '',
];

$tagCorrenti = $id ? implode(', ', array_column(tag_di_articolo($id), 'name')) : '';
$copertina   = url_immagine($a['cover_image']);

// I numeri di lettura, se l'articolo esiste già.
$visite = 0;
if ($id) {
    $q = db()->prepare("SELECT COUNT(*) FROM article_views WHERE article_id = ?");
    $q->execute([$id]);
    $visite = (int)$q->fetchColumn();
}

$dataModulo = $a['published_at'] ? date('Y-m-d\TH:i', strtotime($a['published_at'])) : '';

testa_pannello($nuovo ? 'Nuovo articolo' : $a['title'], 'articoli');
titolo_pannello(
    $nuovo ? 'Nuovo articolo' : 'Modifica articolo',
    $nuovo ? 'Nasce come bozza: si pubblica quando è pronto.'
           : 'Creato il ' . data_lunga($a['created_at']) . ($visite ? ' · ' . number_format($visite, 0, ',', '.') . ' letture' : ''),
    $id ? link_al_sito($a, 'btn btn-muto') : ''
);
avviso_pannello();
?>

<form class="scheda" method="post" action="/admin/articolo.php<?= $id ? '?id=' . $id : '' ?>">
  <?= campo_gettone() ?>
  <input type="hidden" name="id" value="<?= (int)$id ?>">

  <!-- ── I dati ────────────────────────────────────────────────────────── -->
  <section>
    <h2>Dati</h2>

    <div class="campo">
      <label class="eti" for="campo-titolo">Titolo</label>
      <input id="campo-titolo" name="title" required value="<?= e($a['title']) ?>"
             data-conta="conta-titolo" data-limite="65">
      <p class="contatore" id="conta-titolo"></p>
    </div>

    <div class="campo">
      <label class="eti" for="campo-slug">Indirizzo (slug)</label>
      <input id="campo-slug" name="slug" value="<?= e($a['slug']) ?>" spellcheck="false">
      <p class="aiuto">L'articolo vivrà su <b>/<?= e($a['category'] ?: 'categoria') ?>/<span id="eco-slug"><?= e($a['slug'] ?: 'indirizzo') ?></span></b>.
         Cambiarlo dopo la pubblicazione rompe i link già in giro: si fa solo se serve davvero.</p>
    </div>

    <div class="campo">
      <label class="eti" for="campo-excerpt">Riassunto</label>
      <textarea id="campo-excerpt" name="excerpt" rows="3"><?= e($a['excerpt']) ?></textarea>
      <p class="aiuto">Le due righe che si leggono negli elenchi del sito.</p>
    </div>

    <div class="due-colonne">
      <div class="campo">
        <label class="eti" for="campo-categoria">Categoria</label>
        <?php
        $categorie = admin_categorie_ad_albero();
        /* Un articolo può stare in una categoria cancellata dopo. Se non la si
           rimettesse in elenco, aprire l'articolo e premere Salva gli
           toglierebbe la categoria senza dire niente — e il suo indirizzo
           pubblico sparirebbe con lei. */
        $orfana = $a['category'] !== ''
                  && !in_array($a['category'], array_column($categorie, 'slug'), true);
        ?>
        <select id="campo-categoria" name="category">
          <option value="">— nessuna —</option>
          <?php if ($orfana): ?>
            <option value="<?= e($a['category']) ?>" selected>
              <?= e($a['category']) ?> (non è più in elenco)
            </option>
          <?php endif; ?>
          <?php foreach ($categorie as $c): ?>
            <option value="<?= e($c['slug']) ?>"<?= $a['category'] === $c['slug'] ? ' selected' : '' ?>>
              <?= e(etichetta_categoria($c)) ?>
            </option>
          <?php endforeach; ?>
        </select>
        <?php if ($orfana): ?>
          <p class="aiuto">La categoria di questo articolo non esiste più fra quelle in elenco.
             L'indirizzo pubblico continua a funzionare, ma converrebbe spostarlo.</p>
        <?php endif; ?>
      </div>
      <div class="campo">
        <label class="eti" for="campo-tag">Tag</label>
        <input id="campo-tag" name="tags" value="<?= e($tagCorrenti) ?>"
               placeholder="separati da virgola">
        <p class="aiuto">Da due a otto. Un tag che vale per un articolo solo non raggruppa niente.</p>
      </div>
    </div>

    <div class="campo">
      <span class="eti">Copertina</span>
      <div class="copertina-scelta">
        <div class="anteprima" id="anteprima-copertina">
          <?php if ($copertina !== ''): ?><img src="<?= e($copertina) ?>" alt=""><?php endif; ?>
        </div>
        <div style="flex:1;min-width:0">
          <input type="hidden" name="cover_image" id="campo-copertina" value="<?= e($a['cover_image']) ?>">
          <div class="btn-fila">
            <button class="btn" type="button" id="scegli-copertina">Scegli dalla libreria</button>
            <button class="btn btn-muto" type="button" id="togli-copertina">Togli</button>
          </div>
          <p class="aiuto" style="margin-top:10px" id="nome-copertina"><?= e($a['cover_image'] ?: 'Nessuna copertina.') ?></p>
        </div>
      </div>
    </div>

    <div class="due-colonne">
      <div class="campo">
        <label class="eti" for="campo-stato">Stato</label>
        <select id="campo-stato" name="status">
          <option value="draft"<?= $a['status'] !== 'published' ? ' selected' : '' ?>>Bozza</option>
          <option value="published"<?= $a['status'] === 'published' ? ' selected' : '' ?>>Pubblicato</option>
        </select>
      </div>
      <div class="campo">
        <label class="eti" for="campo-data">Data di pubblicazione</label>
        <input id="campo-data" name="published_at" type="datetime-local" value="<?= e($dataModulo) ?>">
        <p class="aiuto">Nel futuro: esce da solo quel giorno.</p>
      </div>
    </div>

    <label class="spunta">
      <input type="checkbox" name="is_featured" value="1"<?= $a['is_featured'] ? ' checked' : '' ?>>
      <span>In vetrina in home<br><small class="aiuto">Se nessun articolo è in vetrina, la home mostra il più recente.</small></span>
    </label>
    <label class="spunta">
      <input type="checkbox" name="is_category_pinned" value="1"<?= $a['is_category_pinned'] ? ' checked' : '' ?>>
      <span>In cima alla sua categoria<br><small class="aiuto">È l'articolo che apre
        <?= $a['category'] !== '' ? '<b>/' . e($a['category']) . '</b>' : 'la sua sezione' ?>.
        Ce n'è uno solo: spuntando questo, l'altro smette di esserlo.</small></span>
    </label>
  </section>

  <!-- ── Come esce su Google ───────────────────────────────────────────── -->
  <section>
    <h2>Come esce su Google</h2>
    <p class="aiuto" style="margin-bottom:16px">
      Se lasci vuoti questi due campi valgono il titolo e il riassunto qui sopra.
      Si riempiono quando il titolo dell'articolo è bello ma lungo, o quando il
      riassunto parla a chi è già entrato invece che a chi deve ancora entrare.
    </p>

    <div class="google" id="anteprima-google" aria-hidden="true">
      <div class="g-url">simonepizzi.runtimeradio.it › <?= e($a['category'] ?: 'categoria') ?></div>
      <div class="g-titolo"></div>
      <div class="g-descrizione"></div>
    </div>

    <div class="campo" style="margin-top:18px">
      <label class="eti" for="campo-seo-title">Titolo per Google</label>
      <input id="campo-seo-title" name="seo_title" value="<?= e((string)$a['seo_title']) ?>"
             data-conta="conta-seo-title" data-limite="60">
      <p class="contatore" id="conta-seo-title"></p>
    </div>

    <div class="campo">
      <label class="eti" for="campo-seo-description">Descrizione per Google</label>
      <textarea id="campo-seo-description" name="seo_description" rows="2"
                data-conta="conta-seo-desc" data-limite="158"><?= e((string)$a['seo_description']) ?></textarea>
      <p class="contatore" id="conta-seo-desc"></p>
    </div>

    <div class="campo">
      <label class="eti" for="campo-chiave">Parola chiave principale</label>
      <input id="campo-chiave" name="focus_keyword" value="<?= e((string)$a['focus_keyword']) ?>">
      <p class="aiuto">Una sola, quella con cui vorresti essere trovato. Il verificatore
         qui sotto controlla che compaia dove serve, senza esagerare.</p>
    </div>
  </section>

  <!-- ── Il testo ──────────────────────────────────────────────────────── -->
  <section>
    <h2>Il testo</h2>
    <label class="solo-lettori-schermo" for="content">Corpo dell'articolo</label>
    <textarea id="content" name="content" rows="20"><?= e($a['content']) ?></textarea>
    <p class="aiuto" style="margin-top:10px">
      Si può incollare da Word, da Google Docs o del markdown: l'editor lo ripulisce da solo.
    </p>
  </section>

  <!-- ── Il verificatore ───────────────────────────────────────────────── -->
  <section>
    <h2>Come sta venendo</h2>
    <div id="seo-check"></div>
  </section>

  <div class="barra-salva">
    <button class="btn btn-pieno" type="submit">Salva</button>
    <a class="btn btn-muto" href="/admin/articoli.php">Torna all'elenco</a>
    <?php if ($id): ?>
      <button class="mini mini-pericolo" type="submit" name="azione" value="elimina"
              data-conferma-click="Elimino «<?= e($a['title']) ?>»? Non si torna indietro."
              formnovalidate>Elimina</button>
    <?php endif; ?>
    <span class="spento"><?= $id ? 'Modifiche non salvate finché non premi Salva.' : 'Non ancora salvato.' ?></span>
  </div>
</form>

<?php finestre_pannello(); ?>

<script nonce="<?= e(nonce()) ?>">
/* Le due cose che riguardano solo questa scheda: la copertina scelta dalla
   libreria e l'eco dello slug sotto il campo. */
(function () {
  var campo = document.getElementById('campo-copertina');
  var box = document.getElementById('anteprima-copertina');
  var nome = document.getElementById('nome-copertina');

  function dipingi(url, etichetta) {
    box.innerHTML = '';
    if (url) {
      var img = document.createElement('img');
      img.src = url; img.alt = '';
      box.appendChild(img);
    }
    nome.textContent = etichetta || 'Nessuna copertina.';
  }

  document.getElementById('scegli-copertina').addEventListener('click', function () {
    if (typeof window.spApriLibreria !== 'function') return;
    window.spApriLibreria(function (m) {
      campo.value = m.url;
      dipingi(m.url, m.nome);
    });
  });

  document.getElementById('togli-copertina').addEventListener('click', function () {
    campo.value = '';
    dipingi('', '');
  });

  var slug = document.getElementById('campo-slug');
  var eco = document.getElementById('eco-slug');
  if (slug && eco) {
    slug.addEventListener('input', function () { eco.textContent = slug.value || 'indirizzo'; });
  }
})();
</script>

<?php piede_pannello(false, ['libreria.js', 'editor.js', 'seo-check.js']); ?>

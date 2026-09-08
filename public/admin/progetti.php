<?php
/**
 * I progetti: l'elenco e la scheda, nella stessa pagina.
 *
 * Sono sedici e cambiano di rado: due schermate separate sarebbero un clic in
 * più per niente. Qui l'elenco sta sopra e la scheda si apre sotto.
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    $id = (int)($_POST['id'] ?? 0) ?: null;

    if (($_POST['azione'] ?? '') === 'elimina' && $id) {
        elimina_progetto($id);
        torna('/admin/progetti.php', 'Progetto eliminato.');
    }

    $nome = trim((string)($_POST['name'] ?? ''));
    if ($nome === '') torna('/admin/progetti.php' . ($id ? '?id=' . $id : ''),
                            'Il nome serve: è quello che si legge sulla scheda.', true);

    $nuovo = salva_progetto([
        'name'           => $nome,
        'description'    => (string)($_POST['description'] ?? ''),
        'category'       => (string)($_POST['category'] ?? ''),
        'stato'          => (string)($_POST['stato'] ?? ''),
        'cover_image'    => (string)($_POST['cover_image'] ?? ''),
        'button_a_label' => (string)($_POST['button_a_label'] ?? ''),
        'button_a_url'   => (string)($_POST['button_a_url'] ?? ''),
        'button_b_label' => (string)($_POST['button_b_label'] ?? ''),
        'button_b_url'   => (string)($_POST['button_b_url'] ?? ''),
        'is_visible'     => !empty($_POST['is_visible']),
        'sort_order'     => (int)($_POST['sort_order'] ?? 0),
    ], $id);

    torna('/admin/progetti.php?id=' . $nuovo, $id ? 'Progetto salvato.' : 'Progetto creato.');
}

$elenco = admin_progetti();
$id = (int)($_GET['id'] ?? 0);
$p  = $id ? admin_progetto($id) : null;
$nuovo = isset($_GET['nuovo']) || ($id && !$p);

$vuoto = ['id'=>0,'name'=>'','description'=>'','category'=>'','stato'=>'','cover_image'=>'',
          'button_a_label'=>'','button_a_url'=>'','button_b_label'=>'','button_b_url'=>'',
          'is_visible'=>1,'sort_order'=>0];
$p = $p ?: $vuoto;

$senzaStato = count(array_filter($elenco, fn($x) => empty($x['stato'])));

testa_pannello('Progetti', 'progetti');
titolo_pannello('Progetti', count($elenco) . ' schede',
    '<a class="btn btn-pieno" href="/admin/progetti.php?nuovo=1#scheda">Nuovo progetto</a>');
avviso_pannello();

if ($senzaStato > 0): ?>
  <p class="avviso">
    <?= $senzaStato === 1 ? 'Un progetto non ha' : $senzaStato . ' progetti non hanno' ?>
    ancora uno stato. Finché manca, sulla scheda pubblica non compare nessuna etichetta —
    ed è quella che racconta se una cosa è in corso, aperta o archiviata.
  </p>
<?php endif; ?>

<div class="avvolgi">
  <table class="tabella-lavoro">
    <thead><tr><th>Progetto</th><th>Categoria</th><th>Stato</th><th>Visibile</th><th class="num">Ordine</th><th class="comandi"></th></tr></thead>
    <tbody>
      <?php foreach ($elenco as $riga): ?>
        <tr>
          <td><a class="titolo" href="/admin/progetti.php?id=<?= (int)$riga['id'] ?>#scheda"><?= e($riga['name']) ?></a>
              <span class="sotto"><?= e(tronca($riga['description'], 90)) ?></span></td>
          <td><?= e($riga['category']) ?></td>
          <td><?= blocco_stato($riga['stato'] ?? null) ?: '<span class="spento">—</span>' ?></td>
          <td><?= $riga['is_visible'] ? 'sì' : '<span class="spento">no</span>' ?></td>
          <td class="num"><?= (int)$riga['sort_order'] ?></td>
          <td class="comandi"><a class="mini" href="/admin/progetti.php?id=<?= (int)$riga['id'] ?>#scheda">Apri</a></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>

<?php if ($id || $nuovo): ?>
<hr style="border:0;border-top:1px solid var(--verde);margin:34px 0 26px">

<form class="scheda" method="post" action="/admin/progetti.php" id="scheda">
  <?= campo_gettone() ?>
  <input type="hidden" name="id" value="<?= (int)$p['id'] ?>">

  <h2 class="gro" style="font-size:24px;margin-bottom:20px">
    <?= $p['id'] ? e($p['name']) : 'Nuovo progetto' ?>
  </h2>

  <div class="campo">
    <label class="eti" for="p-nome">Nome</label>
    <input id="p-nome" name="name" required value="<?= e($p['name']) ?>">
  </div>

  <div class="campo">
    <label class="eti" for="p-descrizione">Descrizione</label>
    <textarea id="p-descrizione" name="description" rows="4"><?= e($p['description']) ?></textarea>
  </div>

  <div class="due-colonne">
    <div class="campo">
      <label class="eti" for="p-categoria">Categoria</label>
      <select id="p-categoria" name="category">
        <option value="">— nessuna —</option>
        <?php foreach (admin_categorie_ad_albero() as $c): ?>
          <option value="<?= e($c['slug']) ?>"<?= $p['category'] === $c['slug'] ? ' selected' : '' ?>>
            <?= e(etichetta_categoria($c)) ?>
          </option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="campo">
      <label class="eti" for="p-stato">Stato</label>
      <select id="p-stato" name="stato">
        <option value="">— non dichiarato —</option>
        <?php foreach (['in_corso'=>'In corso','pubblicato'=>'Pubblicato',
                        'open_source'=>'Open source','archiviato'=>'Archiviato'] as $k => $v): ?>
          <option value="<?= e($k) ?>"<?= ($p['stato'] ?? '') === $k ? ' selected' : '' ?>><?= e($v) ?></option>
        <?php endforeach; ?>
      </select>
      <p class="aiuto">È l'etichetta che si vede sulla scheda pubblica.</p>
    </div>
  </div>

  <div class="campo">
    <span class="eti">Copertina</span>
    <div class="copertina-scelta">
      <div class="anteprima" id="anteprima-copertina">
        <?php $cop = url_immagine($p['cover_image']); if ($cop !== ''): ?><img src="<?= e($cop) ?>" alt=""><?php endif; ?>
      </div>
      <div style="flex:1;min-width:0">
        <input type="hidden" name="cover_image" id="campo-copertina" value="<?= e($p['cover_image']) ?>">
        <div class="btn-fila">
          <button class="btn" type="button" id="scegli-copertina">Scegli dalla libreria</button>
          <button class="btn btn-muto" type="button" id="togli-copertina">Togli</button>
        </div>
        <p class="aiuto" style="margin-top:10px" id="nome-copertina"><?= e($p['cover_image'] ?: 'Nessuna copertina.') ?></p>
      </div>
    </div>
  </div>

  <section>
    <h2>I due comandi</h2>
    <p class="aiuto" style="margin-bottom:16px">
      Stanno sempre in fondo alla scheda, nello stesso posto. Il primo è l'azione
      principale (scaricare, aprire), il secondo porta all'articolo che racconta la cosa.
      Un pulsante senza indirizzo non viene stampato.
    </p>
    <div class="due-colonne">
      <div class="campo">
        <label class="eti" for="p-a-etichetta">Primo pulsante</label>
        <input id="p-a-etichetta" name="button_a_label" value="<?= e($p['button_a_label']) ?>" placeholder="Scarica il documento">
      </div>
      <div class="campo">
        <label class="eti" for="p-a-url">Indirizzo</label>
        <input id="p-a-url" name="button_a_url" value="<?= e($p['button_a_url']) ?>" placeholder="https://…">
      </div>
      <div class="campo">
        <label class="eti" for="p-b-etichetta">Secondo pulsante</label>
        <input id="p-b-etichetta" name="button_b_label" value="<?= e($p['button_b_label']) ?>" placeholder="Leggi l'articolo">
      </div>
      <div class="campo">
        <label class="eti" for="p-b-url">Indirizzo</label>
        <input id="p-b-url" name="button_b_url" value="<?= e($p['button_b_url']) ?>" placeholder="/categoria/slug">
      </div>
    </div>
  </section>

  <div class="due-colonne">
    <div class="campo">
      <label class="eti" for="p-ordine">Ordine</label>
      <input id="p-ordine" name="sort_order" type="number" value="<?= (int)$p['sort_order'] ?>">
      <p class="aiuto">Più basso viene prima.</p>
    </div>
    <label class="spunta" style="align-self:center">
      <input type="checkbox" name="is_visible" value="1"<?= $p['is_visible'] ? ' checked' : '' ?>>
      <span>Visibile sul sito</span>
    </label>
  </div>

  <div class="barra-salva">
    <button class="btn btn-pieno" type="submit">Salva</button>
    <a class="btn btn-muto" href="/admin/progetti.php">Chiudi</a>
    <?php if ($p['id']): ?>
      <button class="mini mini-pericolo" type="submit" name="azione" value="elimina" formnovalidate
              data-conferma-click="Elimino «<?= e($p['name']) ?>»?">Elimina</button>
    <?php endif; ?>
  </div>
</form>

<?php finestre_pannello(); ?>
<script nonce="<?= e(nonce()) ?>">
(function () {
  var campo = document.getElementById('campo-copertina');
  var box = document.getElementById('anteprima-copertina');
  var nome = document.getElementById('nome-copertina');
  function dipingi(url, etichetta) {
    box.innerHTML = '';
    if (url) { var i = document.createElement('img'); i.src = url; i.alt = ''; box.appendChild(i); }
    nome.textContent = etichetta || 'Nessuna copertina.';
  }
  document.getElementById('scegli-copertina').addEventListener('click', function () {
    if (typeof window.spApriLibreria === 'function') {
      window.spApriLibreria(function (m) { campo.value = m.url; dipingi(m.url, m.nome); });
    }
  });
  document.getElementById('togli-copertina').addEventListener('click', function () {
    campo.value = ''; dipingi('', '');
  });
})();
</script>
<?php endif; ?>

<?php piede_pannello(false, ($id || $nuovo) ? ['libreria.js'] : []); ?>

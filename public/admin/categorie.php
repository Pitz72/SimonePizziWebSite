<?php
/**
 * Le categorie, che qui sono due cose insieme: le sei sezioni del menu e, sotto
 * di esse, i singoli progetti che raccolgono i propri articoli.
 *
 * Una categoria con articoli dentro non si cancella: sparirebbe l'indirizzo
 * pubblico di quegli articoli e resterebbero irraggiungibili. Lo dice il
 * pannello prima di provarci, non il database dopo.
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    $id = (int)($_POST['id'] ?? 0) ?: null;

    if (($_POST['azione'] ?? '') === 'elimina' && $id) {
        $problema = elimina_categoria($id);
        torna('/admin/categorie.php', $problema ?: 'Categoria eliminata.', $problema !== '');
    }

    $nome = trim((string)($_POST['name'] ?? ''));
    if ($nome === '') torna('/admin/categorie.php', 'Il nome serve.', true);

    salva_categoria([
        'name'       => $nome,
        'slug'       => (string)($_POST['slug'] ?? ''),
        'parent_id'  => (int)($_POST['parent_id'] ?? 0),
        'sort_order' => (int)($_POST['sort_order'] ?? 0),
    ], $id);

    torna('/admin/categorie.php', $id ? 'Categoria salvata.' : 'Categoria creata.');
}

$tutte  = admin_categorie();
$radici = array_values(array_filter($tutte, fn($c) => empty($c['parent_id'])));
$id = (int)($_GET['id'] ?? 0);
$c  = $id ? categoria_per_id($id) : null;
$c  = $c ?: ['id'=>0,'name'=>'','slug'=>'','parent_id'=>null,'sort_order'=>0];

testa_pannello('Categorie', 'categorie');
titolo_pannello('Categorie', count($radici) . ' sezioni, ' . (count($tutte) - count($radici)) . ' sottocategorie',
    '<a class="btn btn-pieno" href="/admin/categorie.php?id=0#scheda">Nuova categoria</a>');
avviso_pannello();
?>

<p class="aiuto" style="margin-bottom:18px">
  Le categorie senza genitore sono le voci del menu. Gli articoli di una
  sottocategoria compaiono anche nell'archivio della sezione che la contiene:
  è il motivo per cui <b>/videogiochi</b> non è una pagina vuota, visto che gli
  articoli stanno tutti nei singoli progetti.
</p>

<div class="avvolgi">
  <table class="tabella-lavoro">
    <thead><tr><th>Nome</th><th>Indirizzo</th><th class="num">Articoli</th><th class="num">Ordine</th><th class="comandi"></th></tr></thead>
    <tbody>
      <?php foreach ($radici as $r): ?>
        <tr>
          <td><a class="titolo" href="/admin/categorie.php?id=<?= (int)$r['id'] ?>#scheda"><?= e($r['name']) ?></a></td>
          <td><a href="/<?= e($r['slug']) ?>" target="_blank" rel="noopener" class="spento">/<?= e($r['slug']) ?></a></td>
          <td class="num"><?= (int)$r['quanti'] ?></td>
          <td class="num"><?= (int)$r['sort_order'] ?></td>
          <td class="comandi"><a class="mini" href="/admin/categorie.php?id=<?= (int)$r['id'] ?>#scheda">Apri</a></td>
        </tr>
        <?php foreach ($tutte as $f): if ((int)($f['parent_id'] ?? 0) !== (int)$r['id']) continue; ?>
          <tr>
            <td style="padding-left:34px"><a class="titolo" href="/admin/categorie.php?id=<?= (int)$f['id'] ?>#scheda">↳ <?= e($f['name']) ?></a></td>
            <td><a href="/<?= e($f['slug']) ?>" target="_blank" rel="noopener" class="spento">/<?= e($f['slug']) ?></a></td>
            <td class="num"><?= (int)$f['quanti'] ?></td>
            <td class="num"><?= (int)$f['sort_order'] ?></td>
            <td class="comandi"><a class="mini" href="/admin/categorie.php?id=<?= (int)$f['id'] ?>#scheda">Apri</a></td>
          </tr>
        <?php endforeach; ?>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>

<?php if (isset($_GET['id'])): ?>
<hr style="border:0;border-top:1px solid var(--verde);margin:34px 0 26px">
<form class="scheda" method="post" action="/admin/categorie.php" id="scheda">
  <?= campo_gettone() ?>
  <input type="hidden" name="id" value="<?= (int)$c['id'] ?>">
  <h2 class="gro" style="font-size:24px;margin-bottom:20px"><?= $c['id'] ? e($c['name']) : 'Nuova categoria' ?></h2>

  <div class="due-colonne">
    <div class="campo">
      <label class="eti" for="c-nome">Nome</label>
      <input id="c-nome" name="name" required value="<?= e($c['name']) ?>">
    </div>
    <div class="campo">
      <label class="eti" for="c-slug">Indirizzo</label>
      <input id="c-slug" name="slug" value="<?= e($c['slug']) ?>" spellcheck="false">
      <p class="aiuto">Se lo cambi, gli articoli dentro cambiano indirizzo: fallo solo prima di pubblicare.</p>
    </div>
    <div class="campo">
      <label class="eti" for="c-genitore">Sta dentro</label>
      <select id="c-genitore" name="parent_id">
        <option value="0">— è una sezione principale —</option>
        <?php foreach ($radici as $r): if ((int)$r['id'] === (int)$c['id']) continue; ?>
          <option value="<?= (int)$r['id'] ?>"<?= (int)($c['parent_id'] ?? 0) === (int)$r['id'] ? ' selected' : '' ?>>
            <?= e($r['name']) ?>
          </option>
        <?php endforeach; ?>
      </select>
    </div>
    <div class="campo">
      <label class="eti" for="c-ordine">Ordine</label>
      <input id="c-ordine" name="sort_order" type="number" value="<?= (int)$c['sort_order'] ?>">
    </div>
  </div>

  <div class="barra-salva">
    <button class="btn btn-pieno" type="submit">Salva</button>
    <a class="btn btn-muto" href="/admin/categorie.php">Chiudi</a>
    <?php if ($c['id']): ?>
      <button class="mini mini-pericolo" type="submit" name="azione" value="elimina" formnovalidate
              data-conferma-click="Elimino la categoria «<?= e($c['name']) ?>»?">Elimina</button>
    <?php endif; ?>
  </div>
</form>
<?php endif; ?>

<?php piede_pannello(); ?>

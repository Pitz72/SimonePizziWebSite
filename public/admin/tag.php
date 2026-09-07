<?php
/**
 * I tag: rinominare, unire i doppioni, buttare gli orfani.
 *
 * È la schermata che serve a tenere sotto controllo la coda lunga. Il sito si
 * è ritrovato con più di duecento tag usati da un solo articolo perché fino
 * alla v1.26.1 il punteggio SEO premiava chi ne inventava uno su misura per
 * ogni pezzo. Un tag che raccoglie una cosa sola non raccoglie niente: la sua
 * pagina ripete un contenuto che sta già altrove, e per giunta esce
 * dall'indice per la soglia dei tre articoli.
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    $azione = (string)($_POST['azione'] ?? '');
    $id = (int)($_POST['id'] ?? 0);

    if ($azione === 'rinomina' && $id) {
        $nome = trim((string)($_POST['nome'] ?? ''));
        if ($nome === '') torna('/admin/tag.php', 'Il nome non può restare vuoto.', true);
        rinomina_tag($id, $nome);
        torna('/admin/tag.php', 'Rinominato in «' . $nome . '». Anche il suo indirizzo è cambiato.');
    }

    if ($azione === 'unisci') {
        $da = (int)($_POST['da'] ?? 0);
        $a  = (int)($_POST['a'] ?? 0);
        if (!$da || !$a || $da === $a) torna('/admin/tag.php', 'Servono due tag diversi.', true);
        // I nomi si leggono prima di unire: dopo, uno dei due non esiste più.
        $q = db()->prepare("SELECT name FROM tags WHERE id = ?");
        $q->execute([$da]); $nomeDa = (string)$q->fetchColumn();
        $q->execute([$a]);  $nomeA  = (string)$q->fetchColumn();
        unisci_tag($da, $a);
        torna('/admin/tag.php', '«' . $nomeDa . '» è confluito in «' . $nomeA . '».');
    }

    if ($azione === 'elimina' && $id) {
        elimina_tag($id);
        torna('/admin/tag.php', 'Tag eliminato.');
    }

    torna('/admin/tag.php', 'Azione sconosciuta.', true);
}

$cerca = trim((string)($_GET['q'] ?? ''));
$tag   = admin_tag($cerca);
$soli  = array_values(array_filter($tag, fn($t) => (int)$t['quanti'] === 1));
$orfani = array_values(array_filter($tag, fn($t) => (int)$t['quanti'] === 0));

testa_pannello('Tag', 'tag');
titolo_pannello('Tag', count($tag) . ' in tutto · ' . count($soli) . ' usati una volta sola · ' . count($orfani) . ' orfani');
avviso_pannello();
?>

<?php if ($orfani): ?>
  <p class="avviso">
    <?= count($orfani) === 1 ? 'Un tag non è' : count($orfani) . ' tag non sono' ?>
    attaccato a nessun articolo. Si possono eliminare senza conseguenze:
    <?php foreach ($orfani as $o): ?>
      <b><?= e($o['name']) ?></b>
    <?php endforeach; ?>
  </p>
<?php endif; ?>

<form class="filtri" method="get" action="/admin/tag.php">
  <label>
    <span class="eti">Cerca</span>
    <input type="search" name="q" value="<?= e($cerca) ?>" placeholder="Nome del tag" style="min-width:240px">
  </label>
  <button class="btn" type="submit">Filtra</button>
  <?php if ($cerca !== ''): ?><a class="btn btn-muto" href="/admin/tag.php">Azzera</a><?php endif; ?>
</form>

<section style="border:1px solid var(--filo);padding:18px;background:var(--pece);margin-bottom:26px">
  <h2 class="gro" style="font-size:19px;margin-bottom:6px">Unisci due doppioni</h2>
  <p class="aiuto" style="margin-bottom:14px">
    Gli articoli del primo passano al secondo, e il primo sparisce. È
    l'operazione che ad agosto ha ridotto la coda: «Runtime», «runtime» e
    «runtime radio» erano tre tag per la stessa cosa.
  </p>
  <form method="post" action="/admin/tag.php" class="filtri" style="margin:0"
        data-conferma="Confermi l'unione? Il primo tag verrà eliminato.">
    <?= campo_gettone() ?>
    <input type="hidden" name="azione" value="unisci">
    <label>
      <span class="eti">Questo sparisce</span>
      <select name="da" required style="min-width:240px">
        <option value="">—</option>
        <?php foreach ($tag as $t): ?>
          <option value="<?= (int)$t['id'] ?>"><?= e($t['name']) ?> (<?= (int)$t['quanti'] ?>)</option>
        <?php endforeach; ?>
      </select>
    </label>
    <label>
      <span class="eti">E confluisce in</span>
      <select name="a" required style="min-width:240px">
        <option value="">—</option>
        <?php foreach ($tag as $t): ?>
          <option value="<?= (int)$t['id'] ?>"><?= e($t['name']) ?> (<?= (int)$t['quanti'] ?>)</option>
        <?php endforeach; ?>
      </select>
    </label>
    <button class="btn" type="submit">Unisci</button>
  </form>
</section>

<div class="avvolgi">
  <table class="tabella-lavoro">
    <thead><tr><th>Tag</th><th>Indirizzo</th><th class="num">Articoli</th><th class="comandi">Azioni</th></tr></thead>
    <tbody>
      <?php foreach ($tag as $t): ?>
        <tr>
          <td>
            <form method="post" action="/admin/tag.php" style="display:flex;gap:8px;align-items:center;max-width:340px">
              <?= campo_gettone() ?>
              <input type="hidden" name="azione" value="rinomina">
              <input type="hidden" name="id" value="<?= (int)$t['id'] ?>">
              <input name="nome" value="<?= e($t['name']) ?>" aria-label="Nome del tag">
              <button class="mini" type="submit">Salva</button>
            </form>
          </td>
          <td>
            <?php if ((int)$t['quanti'] > 0): ?>
              <a class="spento" href="/tag/<?= e($t['slug']) ?>" target="_blank" rel="noopener">/tag/<?= e($t['slug']) ?></a>
            <?php else: ?>
              <span class="spento">/tag/<?= e($t['slug']) ?></span>
            <?php endif; ?>
          </td>
          <td class="num">
            <?= (int)$t['quanti'] ?>
            <?php if ((int)$t['quanti'] > 0 && (int)$t['quanti'] < TAG_MINIMO_PER_INDICE): ?>
              <span class="sotto">fuori dall'indice</span>
            <?php endif; ?>
          </td>
          <td class="comandi">
            <form method="post" action="/admin/tag.php" style="display:inline">
              <?= campo_gettone() ?>
              <input type="hidden" name="azione" value="elimina">
              <input type="hidden" name="id" value="<?= (int)$t['id'] ?>">
              <button class="mini mini-pericolo" type="submit"
                      data-conferma-click="Elimino il tag «<?= e($t['name']) ?>»<?= (int)$t['quanti'] > 0 ? ' da ' . (int)$t['quanti'] . ' articoli' : '' ?>?">Elimina</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>

<?php piede_pannello(); ?>

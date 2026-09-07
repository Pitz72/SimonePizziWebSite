<?php
/**
 * L'elenco degli articoli: si cerca, si filtra, si agisce anche su più righe
 * insieme.
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

/* ── Le azioni ───────────────────────────────────────────────────────────
   Tutte in POST, tutte seguite da un redirect: ricaricare la pagina dopo
   un'azione non deve rifarla una seconda volta. */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();

    $azione  = (string)($_POST['azione'] ?? '');
    $singolo = (int)($_POST['id'] ?? 0);
    $scelti  = array_map('intval', (array)($_POST['scelti'] ?? []));
    if ($singolo) $scelti = [$singolo];
    $dove = '/admin/articoli.php' . (($_POST['ritorno'] ?? '') ? '?' . $_POST['ritorno'] : '');

    if (!$scelti) torna($dove, 'Non avevi selezionato niente.', true);

    switch ($azione) {
        case 'pubblica':
            foreach ($scelti as $id) {
                db()->prepare("UPDATE articles SET status = 'published',
                               published_at = COALESCE(published_at, ?) WHERE id = ?")
                    ->execute([date('Y-m-d H:i:s'), $id]);
            }
            torna($dove, conta($scelti, 'Un articolo pubblicato', 'articoli pubblicati'));

        case 'bozza':
            foreach ($scelti as $id) {
                db()->prepare("UPDATE articles SET status = 'draft' WHERE id = ?")->execute([$id]);
            }
            torna($dove, conta($scelti, 'Un articolo rimesso in bozza', 'articoli rimessi in bozza'));

        case 'duplica':
            $ultimo = null;
            foreach ($scelti as $id) $ultimo = duplica_articolo($id);
            torna($ultimo && count($scelti) === 1 ? '/admin/articolo.php?id=' . $ultimo : $dove,
                  conta($scelti, 'Una copia creata', 'copie create') . ' Nascono come bozze.');

        case 'elimina':
            foreach ($scelti as $id) elimina_articolo($id);
            torna($dove, conta($scelti, 'Un articolo eliminato', 'articoli eliminati'));

        default:
            torna($dove, 'Azione sconosciuta.', true);
    }
}

/**
 * «Un articolo eliminato.» oppure «3 articoli eliminati.»
 *
 * Il singolare arriva scritto per intero e non composto con «Un »: in italiano
 * l'articolo dipende dal nome che segue, e «Un copia creata» è quello che
 * succede a comporlo a pezzi.
 */
function conta(array $cose, string $uno, string $tanti): string {
    return count($cose) === 1 ? $uno . '.' : count($cose) . ' ' . $tanti . '.';
}

/* ── L'elenco ────────────────────────────────────────────────────────────── */

$filtri = [
    'stato'     => (string)($_GET['stato'] ?? ''),
    'categoria' => (string)($_GET['categoria'] ?? ''),
    'testo'     => trim((string)($_GET['q'] ?? '')),
];
$pagina = max(1, (int)($_GET['pagina'] ?? 1));
$esito  = admin_articoli($filtri, $pagina, 20);
$pagine = max(1, (int)ceil($esito['totale'] / 20));
$ritorno = http_build_query(array_filter([
    'stato' => $filtri['stato'], 'categoria' => $filtri['categoria'],
    'q' => $filtri['testo'], 'pagina' => $pagina > 1 ? $pagina : null,
]));

testa_pannello('Articoli', 'articoli');
titolo_pannello('Articoli', $esito['totale'] . ' in tutto',
    '<a class="btn btn-pieno" href="/admin/articolo.php">Scrivi un articolo</a>');
avviso_pannello();
?>

<form class="filtri" method="get" action="/admin/articoli.php">
  <label>
    <span class="eti">Cerca</span>
    <input type="search" name="q" value="<?= e($filtri['testo']) ?>" placeholder="Titolo o slug" style="min-width:240px">
  </label>
  <label>
    <span class="eti">Stato</span>
    <select name="stato">
      <option value="">Tutti</option>
      <option value="published"<?= $filtri['stato'] === 'published' ? ' selected' : '' ?>>Pubblicati</option>
      <option value="draft"<?= $filtri['stato'] === 'draft' ? ' selected' : '' ?>>Bozze</option>
    </select>
  </label>
  <label>
    <span class="eti">Categoria</span>
    <select name="categoria">
      <option value="">Tutte</option>
      <?php foreach (admin_categorie() as $c): ?>
        <option value="<?= e($c['slug']) ?>"<?= $filtri['categoria'] === $c['slug'] ? ' selected' : '' ?>>
          <?= e(($c['parent_id'] ? '— ' : '') . $c['name']) ?>
        </option>
      <?php endforeach; ?>
    </select>
  </label>
  <button class="btn" type="submit">Filtra</button>
  <?php if ($filtri['testo'] !== '' || $filtri['stato'] !== '' || $filtri['categoria'] !== ''): ?>
    <a class="btn btn-muto" href="/admin/articoli.php">Azzera</a>
  <?php endif; ?>
</form>

<form method="post" action="/admin/articoli.php"
      data-conferma="Confermi l'azione sugli articoli selezionati?">
  <?= campo_gettone() ?>
  <input type="hidden" name="ritorno" value="<?= e($ritorno) ?>">

  <div class="filtri" id="azioni-blocco" style="border:1px solid var(--filo);padding:12px;background:var(--pece)">
    <span class="eti spento" data-quanti>nessuno selezionato</span>
    <button class="mini" type="submit" name="azione" value="pubblica" disabled>Pubblica</button>
    <button class="mini" type="submit" name="azione" value="bozza" disabled>Rimetti in bozza</button>
    <button class="mini" type="submit" name="azione" value="duplica" disabled>Duplica</button>
    <button class="mini mini-pericolo" type="submit" name="azione" value="elimina" disabled
            data-conferma-click="Gli articoli selezionati verranno eliminati. Non si torna indietro.">Elimina</button>
  </div>

  <div class="avvolgi">
    <table class="tabella-lavoro">
      <thead>
        <tr>
          <th style="width:34px"><input type="checkbox" id="scegli-tutte" aria-label="Seleziona tutti"></th>
          <th>Titolo</th>
          <th>Categoria</th>
          <th>Stato</th>
          <th>Data</th>
          <th class="comandi">Azioni</th>
        </tr>
      </thead>
      <tbody>
        <?php if (!$esito['righe']): ?>
          <tr><td colspan="6" style="padding:34px;text-align:center;color:var(--spento)">
            Nessun articolo con questi filtri.
          </td></tr>
        <?php endif; ?>

        <?php foreach ($esito['righe'] as $a): ?>
          <tr>
            <td><input type="checkbox" name="scelti[]" value="<?= (int)$a['id'] ?>"
                       aria-label="Seleziona <?= e($a['title']) ?>"></td>
            <td>
              <a class="titolo" href="/admin/articolo.php?id=<?= (int)$a['id'] ?>"><?= e($a['title']) ?></a>
              <span class="sotto">/<?= e($a['category']) ?>/<?= e($a['slug']) ?></span>
            </td>
            <td><?= e($a['category']) ?></td>
            <td><?= stato_articolo($a) ?></td>
            <td class="num"><?= e(data_breve($a['published_at'] ?: $a['created_at'])) ?></td>
            <td class="comandi">
              <?php if ($a['status'] === 'published'): ?>
                <a class="mini" href="<?= e(url_articolo($a)) ?>" target="_blank" rel="noopener">Vedi</a>
              <?php endif; ?>
              <a class="mini" href="/admin/articolo.php?id=<?= (int)$a['id'] ?>">Apri</a>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</form>

<?php if ($pagine > 1): ?>
  <nav aria-label="Pagine">
    <ol class="pagine">
      <?php for ($i = 1; $i <= $pagine; $i++):
        $q = http_build_query(array_filter([
            'stato' => $filtri['stato'], 'categoria' => $filtri['categoria'],
            'q' => $filtri['testo'], 'pagina' => $i > 1 ? $i : null,
        ])); ?>
        <li><a href="/admin/articoli.php<?= $q ? '?' . e($q) : '' ?>"
               <?= $i === $pagina ? 'aria-current="page"' : '' ?>><?= $i ?></a></li>
      <?php endfor; ?>
    </ol>
  </nav>
<?php endif; ?>

<?php piede_pannello(); ?>

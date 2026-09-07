<?php
/**
 * I messaggi arrivati dal modulo contatti.
 *
 * Si leggono qui e basta: non c'è una casella di posta da tenere aperta. Quelli
 * non ancora letti mettono il pallino accanto alla voce di menu.
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    $id = (int)($_POST['id'] ?? 0);
    $azione = (string)($_POST['azione'] ?? '');

    if ($azione === 'letto' && $id) {
        segna_messaggio_letto($id);
        torna('/admin/messaggi.php', 'Segnato come letto.');
    }
    if ($azione === 'elimina' && $id) {
        elimina_messaggio($id);
        torna('/admin/messaggi.php', 'Messaggio eliminato.');
    }
    torna('/admin/messaggi.php', 'Azione sconosciuta.', true);
}

$messaggi  = admin_messaggi();
$daLeggere = messaggi_da_leggere();

testa_pannello('Messaggi', 'messaggi');
titolo_pannello('Messaggi', count($messaggi) . ' in tutto' . ($daLeggere ? ", $daLeggere da leggere" : ''));
avviso_pannello();
?>

<?php if (!$messaggi): ?>
  <p class="vuoto">Nessun messaggio.</p>
<?php endif; ?>

<?php foreach ($messaggi as $m): $nuovo = empty($m['read_at']); ?>
  <article style="border:1px solid <?= $nuovo ? 'var(--verde)' : 'var(--filo)' ?>;
                  background:var(--pece);padding:18px 20px;margin-bottom:14px">
    <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;justify-content:space-between">
      <div>
        <b style="color:var(--bianco);font-size:16px"><?= e($m['subject'] ?: 'Senza oggetto') ?></b>
        <span class="sotto spento" style="display:block;margin-top:4px">
          <?= e($m['name']) ?> ·
          <a href="mailto:<?= e($m['email']) ?>" style="color:var(--verde)"><?= e($m['email']) ?></a> ·
          <?= e(data_lunga($m['created_at'])) ?>
        </span>
      </div>
      <div class="btn-fila">
        <?php if ($nuovo): ?>
          <span class="stato stato-in-corso">Da leggere</span>
          <form method="post" action="/admin/messaggi.php" style="display:inline">
            <?= campo_gettone() ?>
            <input type="hidden" name="azione" value="letto">
            <input type="hidden" name="id" value="<?= (int)$m['id'] ?>">
            <button class="mini" type="submit">Segna letto</button>
          </form>
        <?php endif; ?>
        <form method="post" action="/admin/messaggi.php" style="display:inline">
          <?= campo_gettone() ?>
          <input type="hidden" name="azione" value="elimina">
          <input type="hidden" name="id" value="<?= (int)$m['id'] ?>">
          <button class="mini mini-pericolo" type="submit"
                  data-conferma-click="Elimino il messaggio di <?= e($m['name']) ?>?">Elimina</button>
        </form>
      </div>
    </div>
    <p style="margin:14px 0 0;color:#cfe0d3;line-height:1.65;white-space:pre-line"><?= e($m['message']) ?></p>
  </article>
<?php endforeach; ?>

<?php piede_pannello(); ?>

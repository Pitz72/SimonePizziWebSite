<?php
/**
 * Gli iscritti alla lettera.
 *
 * «In attesa» vuol dire che l'indirizzo è stato scritto ma il link nella email
 * di conferma non è ancora stato cliccato: è il doppio consenso, e quegli
 * indirizzi non ricevono niente finché non confermano.
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    $id = (int)($_POST['id'] ?? 0);
    if (($_POST['azione'] ?? '') === 'elimina' && $id) {
        elimina_iscritto($id);
        torna('/admin/newsletter.php', 'Indirizzo eliminato.');
    }
    torna('/admin/newsletter.php', 'Azione sconosciuta.', true);
}

$stato    = (string)($_GET['stato'] ?? '');
$iscritti = admin_iscritti($stato);
$c        = conteggi_iscritti();
$nomiStato = ['confirmed' => 'Confermati', 'pending' => 'In attesa', 'unsubscribed' => 'Usciti'];

testa_pannello('Newsletter', 'newsletter');
titolo_pannello('Newsletter', $c['totale'] . ' indirizzi in tutto');
avviso_pannello();
?>

<div class="numeri">
  <a href="/admin/newsletter.php?stato=confirmed"><div><b><?= $c['confirmed'] ?></b><span class="eti">Confermati</span></div></a>
  <a href="/admin/newsletter.php?stato=pending"><div><b><?= $c['pending'] ?></b><span class="eti">In attesa</span></div></a>
  <a href="/admin/newsletter.php?stato=unsubscribed"><div><b><?= $c['unsubscribed'] ?></b><span class="eti">Usciti</span></div></a>
  <a href="/admin/newsletter.php"><div><b><?= $c['totale'] ?></b><span class="eti">In tutto</span></div></a>
</div>

<?php if ($stato !== ''): ?>
  <p class="aiuto" style="margin-bottom:16px">
    Stai vedendo solo: <b><?= e($nomiStato[$stato] ?? $stato) ?></b>.
    <a href="/admin/newsletter.php" style="color:var(--verde)">Vedili tutti</a>
  </p>
<?php endif; ?>

<div class="avvolgi">
  <table class="tabella-lavoro">
    <thead><tr><th>Indirizzo</th><th>Stato</th><th>Iscritto il</th><th class="comandi"></th></tr></thead>
    <tbody>
      <?php foreach ($iscritti as $i): ?>
        <tr>
          <td><?= e($i['email']) ?></td>
          <td>
            <?php if ($i['status'] === 'confirmed'): ?><span class="stato">Confermato</span>
            <?php elseif ($i['status'] === 'pending'): ?><span class="stato stato-in-corso">In attesa</span>
            <?php else: ?><span class="stato stato-archiviato">Uscito</span><?php endif; ?>
          </td>
          <td class="num"><?= e(data_breve($i['created_at'])) ?></td>
          <td class="comandi">
            <form method="post" action="/admin/newsletter.php" style="display:inline">
              <?= campo_gettone() ?>
              <input type="hidden" name="azione" value="elimina">
              <input type="hidden" name="id" value="<?= (int)$i['id'] ?>">
              <button class="mini mini-pericolo" type="submit"
                      data-conferma-click="Elimino <?= e($i['email']) ?> dalla lista?">Elimina</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$iscritti): ?>
        <tr><td colspan="4" style="padding:34px;text-align:center;color:var(--spento)">Nessun indirizzo.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<?php piede_pannello(); ?>

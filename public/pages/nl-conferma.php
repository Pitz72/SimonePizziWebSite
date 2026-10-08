<?php
/**
 * La conferma di un’iscrizione o del consenso. Il link nella email porta qui,
 * e il clic vero è il pulsante: il link da solo non conferma niente, perché lo
 * aprono gli antivirus e le caselle che controllano i link.
 */
require_once __DIR__ . '/../lib/newsletter.php';

$token  = (string)($_POST['token'] ?? $_GET['token'] ?? '');
$esito  = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $esito = newsletter_conferma($token);
}
$tipo = $esito === null ? newsletter_tipo_conferma($token) : null;

require __DIR__ . '/../partials/head.php';
?>
<main id="contenuto" class="contenuto">
  <div class="gab-stretta">
    <?php if ($esito !== null): ?>
      <header class="testata">
        <span class="eti" style="color:<?= $esito[0] ? 'var(--verde)' : 'var(--spento)' ?>"><?= $esito[0] ? 'Fatto' : 'Non valido' ?></span>
        <h1 class="gro" style="margin-top:12px"><?= $esito[0] ? 'Grazie' : 'Il link non funziona' ?></h1>
        <p><?= e($esito[1]) ?></p>
      </header>
    <?php elseif ($tipo !== null): ?>
      <header class="testata">
        <span class="eti spento">Conferma</span>
        <h1 class="gro" style="margin-top:12px"><?= $tipo === 'iscrizione' ? 'Confermi l’iscrizione?' : 'Confermi il consenso?' ?></h1>
        <p><?= $tipo === 'iscrizione'
              ? 'Per iscriverti alla newsletter serve questo ultimo clic. Premendo il pulsante dichiari:'
              : 'Ti scrivo solo con il tuo consenso registrato. Premendo il pulsante lo confermi:' ?></p>
        <p style="margin-top:14px;color:var(--testo)"><?= e(NEWSLETTER_CONSENSO_TESTO) ?></p>
      </header>
      <form method="post" action="/newsletter/conferma" style="margin-top:28px">
        <input type="hidden" name="token" value="<?= e($token) ?>">
        <button class="btn btn-pieno" type="submit">Confermo</button>
      </form>
    <?php else: ?>
      <header class="testata">
        <span class="eti spento">Conferma</span>
        <h1 class="gro" style="margin-top:12px">Il link non è più valido</h1>
        <p>Forse è già stato usato, o è scaduto. Se vuoi iscriverti di nuovo, lo puoi fare dalla home.</p>
      </header>
    <?php endif; ?>
    <div class="btn-fila" style="margin-top:28px">
      <a class="btn btn-muto" href="/">Torna alla home</a>
    </div>
  </div>
</main>
<?php require __DIR__ . '/../partials/footer.php'; ?>

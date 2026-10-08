<?php
/**
 * La disiscrizione. Il GET mostra soltanto il modulo: si esce solo con un POST.
 * Lo stesso POST lo manda la casella di posta col pulsante «annulla iscrizione»
 * (RFC 8058), e in quel caso non c'è nessuna pagina da leggere.
 */
require_once __DIR__ . '/../lib/newsletter.php';

$token = (string)($_POST['token'] ?? $_GET['token'] ?? '');
$esito = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $esito = newsletter_disiscrivi($token);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['List-Unsubscribe'])) {
    // Il clic della casella (RFC 8058) manda questo campo e non vuole una pagina: basta la risposta.
    http_response_code($esito[0] ? 200 : 404);
    header('Content-Type: text/plain; charset=utf-8');
    echo $esito[1];
    exit;
}

require __DIR__ . '/../partials/head.php';
?>
<main id="contenuto" class="contenuto">
  <div class="gab-stretta">
    <?php if ($esito !== null): ?>
      <header class="testata">
        <span class="eti <?= $esito[0] ? '' : 'spento' ?>"><?= $esito[0] ? 'Fatto' : 'Non valido' ?></span>
        <h1 class="gro" style="margin-top:12px"><?= $esito[0] ? 'Non ti scrivo più' : 'Il link non funziona' ?></h1>
        <p><?= e($esito[1]) ?></p>
      </header>
    <?php elseif ($token !== '' && nl_token_valido($token)): ?>
      <header class="testata">
        <span class="eti spento">Disiscrizione</span>
        <h1 class="gro" style="margin-top:12px">Vuoi uscire dalla newsletter?</h1>
        <p>Premendo il pulsante il tuo indirizzo viene tolto dalla lista. Non ricevi altro, e non serve dire perché.</p>
      </header>
      <form method="post" action="/newsletter/disiscrivi?token=<?= e(rawurlencode($token)) ?>" style="margin-top:28px">
        <button class="btn btn-pieno" type="submit">Cancella iscrizione</button>
      </form>
    <?php else: ?>
      <header class="testata">
        <span class="eti spento">Disiscrizione</span>
        <h1 class="gro" style="margin-top:12px">Link non valido</h1>
        <p>Il link è incompleto o è stato copiato male. Il link in fondo a ogni email funziona sempre.</p>
      </header>
    <?php endif; ?>
    <div class="btn-fila" style="margin-top:28px">
      <a class="btn btn-muto" href="/">Torna alla home</a>
    </div>
  </div>
</main>
<?php require __DIR__ . '/../partials/footer.php'; ?>

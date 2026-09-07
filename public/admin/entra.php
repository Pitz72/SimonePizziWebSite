<?php
/** L'ingresso nel pannello. */
require __DIR__ . '/_avvio.php';

$torna = (string)($_GET['torna'] ?? '/admin/');
// Si torna solo dentro il sito: un indirizzo esterno qui sarebbe un modo per
// far rimbalzare le persone altrove partendo da una pagina fidata.
if (!str_starts_with($torna, '/') || str_starts_with($torna, '//')) $torna = '/admin/';

if (dentro()) { header('Location: ' . $torna); exit; }

$errore = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    $esito = entra(trim((string)($_POST['nome'] ?? '')), (string)($_POST['password'] ?? ''));
    if ($esito['ok']) { header('Location: ' . $torna); exit; }
    $errore = $esito['errore'];
}

testa_pannello('Entra', '', true);
?>
<main class="ingresso">
  <h1 class="gro">Pannello</h1>
  <p class="spento">Il sito si amministra da qui.</p>

  <?php if ($errore !== ''): ?>
    <p class="avviso avviso-no" role="alert"><?= e($errore) ?></p>
  <?php endif; ?>

  <form method="post" action="/admin/entra.php?torna=<?= e(rawurlencode($torna)) ?>">
    <?= campo_gettone() ?>
    <div class="campo">
      <label class="eti" for="nome">Nome utente</label>
      <input id="nome" name="nome" autocomplete="username" required autofocus
             value="<?= e((string)($_POST['nome'] ?? '')) ?>">
    </div>
    <div class="campo">
      <label class="eti" for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required>
    </div>
    <button class="btn btn-pieno" type="submit" style="width:100%;justify-content:center">Entra</button>
  </form>

  <p class="aiuto" style="margin-top:18px">
    <a href="/admin/recupera.php" style="color:var(--verde)">Ho perso la password</a>
  </p>

  <?php if (IN_SVILUPPO): ?>
    <p class="aiuto" style="margin-top:22px;border-top:1px solid var(--filo);padding-top:16px">
      <b>In sviluppo:</b> simone / sviluppo-locale.<br>
      Questo riquadro non compare in produzione.
    </p>
  <?php endif; ?>
</main>
<?php piede_pannello(true); ?>

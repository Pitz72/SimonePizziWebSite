<?php
/**
 * La seconda metà del recupero: si arriva qui dal link e si sceglie la
 * password nuova.
 *
 * Cambiarla alza session_version, e questo butta fuori tutte le sessioni
 * aperte altrove. È la ragione per cui il recupero esiste: non serve a
 * cambiare una parola, serve a riprendersi l'account.
 */
require __DIR__ . '/_avvio.php';

$gettoneRecupero = (string)($_GET['gettone'] ?? $_POST['gettone_recupero'] ?? '');
$utente = utente_del_gettone($gettoneRecupero);
$errore = '';
$fatto  = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    $nuova  = (string)($_POST['password'] ?? '');
    $ripeti = (string)($_POST['ripeti'] ?? '');

    if ($nuova !== $ripeti) {
        $errore = 'Le due password non combaciano.';
    } else {
        $errore = cambia_password($gettoneRecupero, $nuova);
        if ($errore === '') { $fatto = true; $utente = null; }
    }
}

testa_pannello('Nuova password', '', true);
?>
<main class="ingresso">
  <h1 class="gro">Nuova password</h1>

  <?php if ($fatto): ?>
    <p class="avviso" role="status">
      Fatto. Le sessioni aperte altrove sono state chiuse: se qualcun altro era
      dentro, adesso non lo è più.
    </p>
    <div class="btn-fila"><a class="btn btn-pieno" href="/admin/entra.php">Entra</a></div>

  <?php elseif (!$utente): ?>
    <p class="avviso avviso-no" role="alert">
      Questo link non è più valido. Dura un'ora, poi va richiesto di nuovo.
    </p>
    <div class="btn-fila"><a class="btn btn-muto" href="/admin/recupera.php">Chiedine un altro</a></div>

  <?php else: ?>
    <p class="spento">Per l'utente <b><?= e($utente['username']) ?></b>.</p>

    <?php if ($errore !== ''): ?>
      <p class="avviso avviso-no" role="alert"><?= e($errore) ?></p>
    <?php endif; ?>

    <form method="post" action="/admin/reimposta.php">
      <?= campo_gettone() ?>
      <input type="hidden" name="gettone_recupero" value="<?= e($gettoneRecupero) ?>">
      <div class="campo">
        <label class="eti" for="password">Password nuova</label>
        <input id="password" name="password" type="password" required minlength="12"
               autocomplete="new-password" autofocus>
        <p class="aiuto">Almeno dodici caratteri. Una password corta si prova tutta,
           per quanto strana sia.</p>
      </div>
      <div class="campo">
        <label class="eti" for="ripeti">Ripetila</label>
        <input id="ripeti" name="ripeti" type="password" required minlength="12"
               autocomplete="new-password">
      </div>
      <button class="btn btn-pieno" type="submit" style="width:100%;justify-content:center">
        Cambia la password
      </button>
    </form>
  <?php endif; ?>
</main>
<?php piede_pannello(true); ?>

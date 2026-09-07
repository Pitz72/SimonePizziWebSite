<?php
/**
 * «Ho perso la password».
 *
 * La risposta è sempre la stessa, che il nome esista o no: dire «questo utente
 * non c'è» a chi prova sarebbe dirgli quali nomi esistono. In sviluppo, dove
 * non c'è un server di posta, il link si mostra a schermo invece di fingere di
 * averlo mandato.
 */
require __DIR__ . '/_avvio.php';

if (dentro()) { header('Location: /admin/'); exit; }

$fatto = false;
$linkSviluppo = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    $chi = trim((string)($_POST['chi'] ?? ''));

    if ($chi !== '') {
        $link = prepara_recupero($chi);
        if ($link !== null) {
            $mandata = manda_link_recupero(
                (string)(db()->query("SELECT email FROM users LIMIT 1")->fetchColumn() ?: ''),
                $link
            );
            if (!$mandata && IN_SVILUPPO) $linkSviluppo = $link;
        }
    }
    $fatto = true;
}

testa_pannello('Password dimenticata', '', true);
?>
<main class="ingresso">
  <h1 class="gro">Password dimenticata</h1>
  <p class="spento">Arriva un link per sceglierne una nuova. Vale un'ora.</p>

  <?php if ($fatto): ?>
    <p class="avviso" role="status">
      Se quel nome utente esiste, il link è partito verso l'indirizzo registrato.
      Controlla anche la posta indesiderata.
    </p>

    <?php if ($linkSviluppo !== ''): ?>
      <p class="aiuto" style="border-top:1px solid var(--filo);padding-top:16px">
        <b>In sviluppo</b> non c'è un server di posta, quindi il link è questo:<br>
        <a href="<?= e($linkSviluppo) ?>" style="color:var(--verde);word-break:break-all">
          <?= e($linkSviluppo) ?></a>
      </p>
    <?php endif; ?>

    <div class="btn-fila" style="margin-top:20px">
      <a class="btn btn-muto" href="/admin/entra.php">Torna all'ingresso</a>
    </div>

  <?php else: ?>
    <form method="post" action="/admin/recupera.php">
      <?= campo_gettone() ?>
      <div class="campo">
        <label class="eti" for="chi">Nome utente o email</label>
        <input id="chi" name="chi" required autofocus autocomplete="username">
      </div>
      <button class="btn btn-pieno" type="submit" style="width:100%;justify-content:center">
        Mandami il link
      </button>
    </form>
    <p class="aiuto" style="margin-top:18px">
      <a href="/admin/entra.php" style="color:var(--verde)">Torna all'ingresso</a>
    </p>
  <?php endif; ?>
</main>
<?php piede_pannello(true); ?>

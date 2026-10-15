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

    /* Il freno, prima di tutto il resto. Senza, chiunque poteva premere Invia
       a ripetizione: ogni volta un'email, il tetto orario della posta pieno in
       pochi minuti, e notifiche e newsletter in coda dietro a link inutili
       (revisione del 16 ottobre, G3). Tre richieste per rete ogni quarto d'ora
       e dieci al giorno in tutto bastano a chi ha perso davvero la password.
       La risposta resta la stessa anche quando il freno scatta: dire «troppi
       tentativi» confermerebbe che il nome esiste. */
    $ammessa = $chi !== ''
        && freno_passa('recupero-rete', rete_cliente(), 3, 900)
        && freno_passa('recupero-tutti', 'tutti', 10, 86400);

    if ($ammessa) {
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
      Controlla anche la posta indesiderata. Se non arriva entro qualche minuto,
      riprova fra un quarto d'ora.
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

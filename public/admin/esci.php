<?php
/**
 * L'uscita.
 *
 * Solo in POST, con il gettone: fino al 16 ottobre 2026 bastava aprire questo
 * indirizzo, e un'immagine su un altro sito poteva far uscire dal pannello
 * (revisione del 16 ottobre, M6). Aperto con un GET — un vecchio segnalibro —
 * mostra il pulsante invece di agire.
 */
require __DIR__ . '/_avvio.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    esci();
    header('Location: /admin/entra.php', true, 303);
    exit;
}

if (!dentro()) {
    header('Location: /admin/entra.php', true, 303);
    exit;
}

testa_pannello('Esci', '', true);
?>
<main class="ingresso">
  <h1 class="gro">Esci dal pannello</h1>
  <form method="post" action="/admin/esci.php">
    <?= campo_gettone() ?>
    <button class="btn btn-pieno" type="submit" style="width:100%;justify-content:center">Esci</button>
  </form>
  <p class="aiuto" style="margin-top:18px">
    <a href="/admin/" style="color:var(--verde)">Torna al pannello</a>
  </p>
</main>
<?php piede_pannello(true); ?>

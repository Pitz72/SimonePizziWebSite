<?php
/**
 * /contatti
 *
 * Il modulo è un POST normale con redirect dopo l'invio, non una chiamata
 * JavaScript: così funziona anche a chi ha gli script spenti, e chi ricarica
 * la pagina dopo l'invio non rimanda il messaggio una seconda volta.
 *
 * Nessun indirizzo email in pagina, di proposito: il messaggio passa da qui,
 * resta scritto nel pannello e riceve risposta da lì (lib/contatti.php). Chi
 * sbaglia un campo rivede il modulo con quello che aveva scritto.
 */
require_once __DIR__ . '/../lib/contatti.php';

$esito  = null;
$vecchi = ['nome' => '', 'email' => '', 'messaggio' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $esito = contatti_invia($_POST);
    if ($esito[0]) {
        header('Location: /contatti?inviato=1', true, 303);
        exit;
    }
    foreach ($vecchi as $campo => $_) $vecchi[$campo] = (string)($_POST[$campo] ?? '');
} elseif (($_GET['inviato'] ?? '') === '1') {
    $esito = [true, 'Messaggio inviato. Ti risponderò all’indirizzo che hai scritto.'];
}

require __DIR__ . '/../partials/head.php';
?>

<main id="contenuto" class="contenuto">
  <div class="gab">
    <nav aria-label="Percorso">
      <ol class="briciole eti">
        <li><a href="/">Home</a></li>
        <li><span aria-current="page">Contatti</span></li>
      </ol>
    </nav>

    <header class="testata">
      <h1 class="gro">Contatti</h1>
      <p>Per collaborazioni, domande sui progetti, o per dirmi che qualcosa non funziona —
         quest'ultima è la più utile di tutte.</p>
    </header>

    <?php if ($esito): ?>
      <p class="esito-modulo<?= $esito[0] ? '' : ' esito-modulo-no' ?>" role="status" tabindex="-1" id="esito-modulo">
        <?= e($esito[1]) ?>
      </p>
    <?php endif; ?>

    <?php if (!($esito && $esito[0])): ?>
    <form method="post" action="/contatti" class="modulo-contatti">
      <label>
        <span class="eti spento">Nome</span><br>
        <input class="campo-testo" name="nome" required maxlength="120" autocomplete="name"
               value="<?= e($vecchi['nome']) ?>">
      </label>
      <label>
        <span class="eti spento">Email</span><br>
        <input class="campo-testo" name="email" type="email" required maxlength="254" autocomplete="email"
               value="<?= e($vecchi['email']) ?>">
      </label>
      <label>
        <span class="eti spento">Messaggio</span><br>
        <textarea class="campo-testo" name="messaggio" rows="7" required minlength="10"
                  maxlength="<?= CONTATTI_MAX_CARATTERI ?>"><?= e($vecchi['messaggio']) ?></textarea>
      </label>

      <?php /* Il campo dei robot: fuori dallo schermo, fuori dal tabulatore. Chi
               lo compila riceve la stessa risposta di una persona. */ ?>
      <div class="trappola" aria-hidden="true">
        <label for="hp-check">Non compilare</label>
        <input id="hp-check" type="text" name="hp_check" tabindex="-1" autocomplete="off">
      </div>

      <label class="consenso">
        <input type="checkbox" name="consenso" value="1" required>
        <span>Ho letto l'<a href="/privacy" target="_blank" rel="noopener">informativa privacy</a>:
          i dati che scrivo servono solo a rispondermi.</span>
      </label>

      <div><button class="btn btn-pieno" type="submit">Manda il messaggio</button></div>
    </form>
    <?php endif; ?>
  </div>
</main>

<style nonce="<?= e(nonce()) ?>">
.modulo-contatti{max-width:640px;margin-top:34px;display:grid;gap:18px}
.modulo-contatti .campo-testo{margin-top:8px;font:inherit;color:var(--testo)}
.modulo-contatti .consenso{display:flex;gap:10px;align-items:flex-start;color:var(--spento);font-size:14.5px;line-height:1.5}
.modulo-contatti .consenso input{margin-top:4px;flex:none}
.modulo-contatti .consenso a{color:var(--verde)}
.trappola{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.esito-modulo{max-width:640px;margin-top:28px;padding:14px 18px;border:1px solid var(--verde);border-left-width:3px;background:var(--pannello)}
.esito-modulo-no{border-color:var(--filo);border-left-color:#e8a0a0}
</style>

<?php require __DIR__ . '/../partials/footer.php'; ?>

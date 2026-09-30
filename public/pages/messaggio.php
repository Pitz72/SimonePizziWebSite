<?php
/**
 * /messaggio — la conversazione con Simone.
 *
 * Ci si arriva dal pulsante «Rispondi a Simone» che sta in ogni email di
 * risposta del pannello. Il gettone nell'indirizzo è l'unica credenziale:
 * nessun account, nessuna password. Per questo la pagina è noindex, e il
 * gettone non esce mai dalla pagina se non dentro il modulo.
 *
 * Su GET non succede niente: i filtri antispam pre-caricano i link delle
 * email, e un prefetch deve solo leggere. La risposta parte con un POST, e
 * dopo un invio riuscito si torna alla pagina con un redirect: ricaricarla non
 * rimanda la risposta.
 *
 * La conversazione si mostra per intero, in ordine: chi torna dopo una
 * settimana deve ritrovare il filo senza cercarlo nella sua casella.
 */
require_once __DIR__ . '/../lib/contatti.php';

$gettone = strtolower(trim((string)($_POST['t'] ?? $_GET['t'] ?? '')));
$esito = null;

/* Prima di leggere qualunque cosa: la pagina esiste solo con le tabelle a posto. */
assicura_messaggistica(db());

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $esito = contatti_rispondi_da_sito($gettone, (string)($_POST['risposta'] ?? ''), (string)($_POST['hp_check'] ?? ''));
    if ($esito[0]) {
        header('Location: /messaggio?t=' . rawurlencode($gettone) . '&inviato=1', true, 303);
        exit;
    }
} elseif (($_GET['inviato'] ?? '') === '1') {
    $esito = [true, 'Ricevuto. La tua risposta è arrivata: ti scrivo di nuovo a questo indirizzo email.'];
}

$m        = contatti_carica($gettone);
$risposte = $m ? contatti_risposte(db(), (int)$m['id']) : [];
$scade    = $m ? contatti_scadenza($risposte) : null;
$aperta   = $scade !== null && $scade >= time();

require __DIR__ . '/../partials/head.php';
?>

<main id="contenuto" class="contenuto">
  <div class="gab" style="max-width:720px">
    <header class="testata">
      <h1 class="gro"><?= $m ? ($aperta ? 'Rispondi a Simone' : 'Link scaduto') : 'Link non valido' ?></h1>
    </header>

    <?php if ($esito): ?>
      <p class="esito-modulo<?= $esito[0] ? '' : ' esito-modulo-no' ?>" role="status"><?= e($esito[1]) ?></p>
    <?php endif; ?>

    <?php if (!$m): ?>
      <p class="testo-msg">
        Questo link non apre nessuna conversazione. Usa il pulsante «Rispondi a Simone» che trovi
        nelle mie email, e controlla di averlo copiato per intero.
      </p>
      <p class="btn-fila">
        <a class="btn btn-pieno" href="/contatti">Scrivimi dal modulo</a>
        <a class="btn btn-muto" href="/">Torna al sito</a>
      </p>

    <?php elseif (!$aperta): ?>
      <?php /* La conversazione non si mostra più: il link scaduto non deve
               continuare a fare da chiave in lettura, altrimenti la scadenza
               proteggerebbe solo la scrittura. */ ?>
      <p class="testo-msg">
        Questo link è scaduto: resta valido <?= CONTATTI_VALIDITA_GIORNI ?> giorni dalla mia ultima risposta.
        Per scrivermi di nuovo usa il modulo dei contatti: il messaggio arriva lo stesso.
      </p>
      <p class="btn-fila">
        <a class="btn btn-pieno" href="/contatti">Scrivimi dal modulo</a>
        <a class="btn btn-muto" href="/">Torna al sito</a>
      </p>

    <?php else: ?>
      <p class="testo-msg">
        Qui trovi i messaggi che ci siamo scambiati. Per rispondere scrivi in fondo alla pagina:
        la risposta arriva a me, e ti rispondo per email.
      </p>

      <ol class="filo-msg">
        <li class="voce-msg voce-tu">
          <p class="eti"><b>Tu</b> · <?= e(data_lunga((string)$m['created_at'])) ?></p>
          <div class="corpo-msg"><?= nl2br(e((string)$m['message'])) ?></div>
        </li>
        <?php foreach ($risposte as $r): $tu = $r['direction'] === 'in'; ?>
          <li class="voce-msg <?= $tu ? 'voce-tu' : 'voce-io' ?>">
            <p class="eti"><b><?= $tu ? 'Tu' : 'Simone' ?></b> · <?= e(data_lunga((string)$r['sent_at'])) ?></p>
            <div class="corpo-msg"><?= nl2br(e((string)$r['body'])) ?></div>
          </li>
        <?php endforeach; ?>
      </ol>

      <form method="post" class="modulo-msg">
        <input type="hidden" name="t" value="<?= e($gettone) ?>">
        <div class="trappola" aria-hidden="true">
          <label for="hp-check">Non compilare</label>
          <input id="hp-check" type="text" name="hp_check" tabindex="-1" autocomplete="off">
        </div>
        <label class="eti spento" for="risposta">La tua risposta</label>
        <textarea class="campo-testo" id="risposta" name="risposta" rows="7" required
                  maxlength="<?= CONTATTI_MAX_CARATTERI ?>"></textarea>
        <p><button class="btn btn-pieno" type="submit">Manda la risposta</button></p>
      </form>

      <p class="eti spento nota-msg">
        Questo link resta valido fino al <?= e(data_lunga(date('Y-m-d H:i:s', $scade))) ?>.
        Dopo, per scrivermi usa il <a href="/contatti">modulo dei contatti</a>.
      </p>
      <p class="eti spento nota-msg">
        Questo link è personale: chi lo ha in mano legge la conversazione e può rispondere a nome tuo.
        Non condividerlo con nessuno.
      </p>
    <?php endif; ?>
  </div>
</main>

<style nonce="<?= e(nonce()) ?>">
/* La pagina si apre da un'email, quindi spesso col telefono: prima il filo
   della conversazione, poi il campo per rispondere, in fondo le due note. */
.testo-msg{font-size:1.1rem;color:var(--spento);line-height:1.7}
.btn-fila{margin-top:24px}
.filo-msg{list-style:none;margin:28px 0;padding:0;display:grid;gap:14px}
.voce-msg{border:1px solid var(--filo);background:var(--pannello);padding:16px 18px}
.voce-msg .eti{margin:0 0 8px}
/* Simone ha il verde sul bordo, come nelle email: si distingue chi parla
   senza leggere l'etichetta. L'etichetta resta, per chi la pagina se la fa leggere. */
.voce-io{border-left:3px solid var(--verde)}
.corpo-msg{line-height:1.7;overflow-wrap:anywhere}
.modulo-msg{border-top:1px solid var(--filo);padding-top:20px;margin-top:28px}
.modulo-msg .campo-testo{margin-top:8px;font:inherit;color:var(--testo)}
.nota-msg{margin-top:16px}
.nota-msg a{color:var(--verde)}
.trappola{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.esito-modulo{margin-top:24px;padding:14px 18px;border:1px solid var(--verde);border-left-width:3px;background:var(--pannello)}
.esito-modulo-no{border-color:var(--filo);border-left-color:#e8a0a0}
</style>

<?php require __DIR__ . '/../partials/footer.php'; ?>

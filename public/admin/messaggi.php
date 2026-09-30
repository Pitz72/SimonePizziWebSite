<?php
/**
 * I messaggi arrivati dal modulo contatti, e le conversazioni che ne nascono.
 *
 * Si leggono qui e si risponde da qui: non c'è una casella di posta da tenere
 * aperta. La risposta parte per email con il pulsante «Rispondi a Simone»;
 * chi lo preme rientra qui sotto lo stesso messaggio, e il messaggio torna
 * «nuovo» (lib/contatti.php spiega perché). Quelli non ancora letti mettono il
 * pallino accanto alla voce di menu.
 */
require __DIR__ . '/_avvio.php';
require_once __DIR__ . '/../lib/contatti.php';
richiedi_accesso();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    $id = (int)($_POST['id'] ?? 0);
    $azione = (string)($_POST['azione'] ?? '');
    $scheda = '/admin/messaggi.php?vedi=' . $id;

    if ($azione === 'massa') {
        $scelti = id_messaggi((array)($_POST['scelti'] ?? []));
        $f = (string)($_POST['f'] ?? '');
        $dove = '/admin/messaggi.php' . (isset(STATI_MESSAGGIO[$f]) ? '?f=' . $f : '');
        if (!$scelti) torna($dove, 'Non hai selezionato nessun messaggio.', true);
        $fare = (string)($_POST['fare'] ?? '');
        $n = count($scelti);
        $quanti = fn(string $uno, string $molti) => $n === 1 ? "1 messaggio $uno." : "$n messaggi $molti.";
        if ($fare === 'elimina')  { elimina_messaggi($scelti);                    torna($dove, $quanti('eliminato', 'eliminati')); }
        if ($fare === 'letti')    { imposta_stato_messaggi($scelti, 'read');     torna($dove, $quanti('segnato come letto', 'segnati come letti')); }
        if ($fare === 'archivia') { imposta_stato_messaggi($scelti, 'archived'); torna($dove, $quanti('archiviato', 'archiviati')); }
        torna($dove, 'Azione sconosciuta.', true);
    }
    if ($azione === 'elimina' && $id) {
        elimina_messaggio($id);
        torna('/admin/messaggi.php', 'Messaggio eliminato, con le sue risposte.');
    }
    if ($azione === 'stato' && $id) {
        imposta_stato_messaggio($id, (string)($_POST['stato'] ?? ''));
        torna($scheda);
    }
    if ($azione === 'rispondi' && $id) {
        $m = admin_messaggio($id);
        if (!$m) torna('/admin/messaggi.php', 'Messaggio non trovato.', true);
        $testo = trim((string)($_POST['testo'] ?? ''));
        if ($testo === '') torna($scheda, 'Scrivi un testo per la risposta.', true);
        [$ok, $avviso] = contatti_rispondi_da_pannello($m, $testo);
        torna($scheda, $avviso, !$ok);
    }
    torna('/admin/messaggi.php', 'Azione sconosciuta.', true);
}

$vedi = (int)($_GET['vedi'] ?? 0);
$m = $vedi ? admin_messaggio($vedi) : null;

/* ── Una conversazione ─────────────────────────────────────────────────── */
if ($m):
    if ($m['status'] === 'new') { segna_messaggio_letto((int)$m['id']); $m['status'] = 'read'; }
    $risposte = contatti_risposte(db(), (int)$m['id']);

    testa_pannello('Messaggio da ' . $m['name'], 'messaggi');
    titolo_pannello('Messaggio da ' . $m['name'], data_lunga($m['created_at']),
        '<a class="btn btn-muto" href="/admin/messaggi.php">← Tutti i messaggi</a>');
    avviso_pannello();
    $stili = 'border:1px solid var(--filo);background:var(--pece);padding:16px 20px;margin-bottom:12px';
    ?>

    <article style="<?= $stili ?>">
      <span class="sotto spento" style="display:block;margin-bottom:10px">
        <b style="color:var(--bianco)"><?= e($m['name']) ?></b> · <?= e($m['email']) ?> ·
        <?= e(data_lunga($m['created_at'])) ?>
        <span class="stato<?= $m['status'] === 'replied' ? '' : ' stato-archiviato' ?>" style="margin-left:8px"><?= e(STATI_MESSAGGIO[$m['status']] ?? $m['status']) ?></span>
      </span>
      <p style="margin:0;color:#cfe0d3;line-height:1.65;white-space:pre-line"><?= e($m['message']) ?></p>
    </article>

    <?php foreach ($risposte as $r): $sua = $r['direction'] === 'in'; ?>
      <article style="<?= $stili ?><?= $sua ? '' : ';border-left:3px solid var(--verde);margin-left:32px' ?>">
        <span class="sotto spento" style="display:block;margin-bottom:10px">
          <b style="color:var(--bianco)"><?= $sua ? e($m['name']) : 'Tu' ?></b> ·
          <?= e(data_lunga($r['sent_at'])) ?>
          <?php if ($sua): ?><span class="stato stato-in-corso" style="margin-left:8px">Risposta dal sito</span><?php endif; ?>
          <?php if (!$sua && !$r['delivered']): ?><span class="stato stato-archiviato" style="margin-left:8px">Invio fallito</span><?php endif; ?>
        </span>
        <p style="margin:0;color:#cfe0d3;line-height:1.65;white-space:pre-line"><?= e($r['body']) ?></p>
      </article>
    <?php endforeach; ?>

    <form method="post" action="/admin/messaggi.php" style="margin-top:22px">
      <?= campo_gettone() ?>
      <input type="hidden" name="azione" value="rispondi">
      <input type="hidden" name="id" value="<?= (int)$m['id'] ?>">
      <label class="campo">
        <span class="eti">Rispondi a <?= e($m['email']) ?></span>
        <textarea class="campo-testo" name="testo" rows="8" required
                  placeholder="Il saluto «Ciao <?= e($m['name']) ?>,» lo scrive l'email da sola: comincia dalla risposta."></textarea>
        <span class="aiuto">Nell'email c'è il pulsante «Rispondi a Simone»: chi lo preme scrive qui, sotto questo messaggio.
          Sotto la tua risposta l'email cita l'ultima cosa che ti ha scritto.</span>
      </label>
      <div class="btn-fila"><button class="btn btn-pieno" type="submit">Invia la risposta</button></div>
    </form>

    <div class="btn-fila" style="margin-top:28px">
      <?php foreach (['read' => 'Segna come letto', 'archived' => 'Archivia', 'new' => 'Segna come nuovo'] as $stato => $etichetta):
        if ($m['status'] === $stato) continue; ?>
        <form method="post" action="/admin/messaggi.php" style="display:inline">
          <?= campo_gettone() ?>
          <input type="hidden" name="azione" value="stato">
          <input type="hidden" name="id" value="<?= (int)$m['id'] ?>">
          <input type="hidden" name="stato" value="<?= $stato ?>">
          <button class="mini" type="submit"><?= $etichetta ?></button>
        </form>
      <?php endforeach; ?>
      <form method="post" action="/admin/messaggi.php" style="display:inline">
        <?= campo_gettone() ?>
        <input type="hidden" name="azione" value="elimina">
        <input type="hidden" name="id" value="<?= (int)$m['id'] ?>">
        <button class="mini mini-pericolo" type="submit"
                data-conferma-click="Elimino il messaggio di <?= e($m['name']) ?> e tutte le risposte?">Elimina</button>
      </form>
    </div>

    <?php piede_pannello();
    return;
endif;

/* ── L'elenco ──────────────────────────────────────────────────────────── */
$filtro    = isset(STATI_MESSAGGIO[$_GET['f'] ?? '']) ? (string)$_GET['f'] : '';
$messaggi  = admin_messaggi($filtro);
$c         = conteggi_messaggi();

testa_pannello('Messaggi', 'messaggi');
titolo_pannello('Messaggi', $c['totale'] . ' in tutto' . ($c['new'] ? ", {$c['new']} da leggere" : ''));
avviso_pannello();
?>

<div class="numeri">
  <?php foreach (STATI_MESSAGGIO as $stato => $etichetta): ?>
    <a href="/admin/messaggi.php?f=<?= $stato ?>"><div><b><?= $c[$stato] ?></b><span class="eti"><?= $etichetta ?></span></div></a>
  <?php endforeach; ?>
  <a href="/admin/messaggi.php"><div><b><?= $c['totale'] ?></b><span class="eti">In tutto</span></div></a>
</div>

<?php if ($filtro !== ''): ?>
  <p class="aiuto" style="margin-bottom:16px">
    Stai vedendo solo: <b><?= e(STATI_MESSAGGIO[$filtro]) ?></b>.
    <a href="/admin/messaggi.php" style="color:var(--verde)">Vedili tutti</a>
  </p>
<?php endif; ?>

<?php if (!$messaggi): ?>
  <p class="vuoto">Nessun messaggio<?= $filtro !== '' ? ' in questa categoria' : '' ?>.</p>
<?php endif; ?>

<?php if ($messaggi): ?>
<form method="post" action="/admin/messaggi.php" id="modulo-massa">
  <?= campo_gettone() ?>
  <input type="hidden" name="azione" value="massa">
  <input type="hidden" name="f" value="<?= e($filtro) ?>">

  <?php /* La barra dei comandi resta in vista mentre si scorre l'elenco: con molti
           messaggi, tornare in cima per premere «Elimina» farebbe perdere il filo. */ ?>
  <div class="barra-massa" role="group" aria-label="Azioni sui messaggi selezionati">
    <label class="scelta-tutti">
      <input type="checkbox" id="scegli-tutti" aria-controls="elenco-messaggi">
      <span>Seleziona tutti</span>
    </label>
    <span class="conta-scelti" id="conta-scelti" role="status" aria-live="polite">Nessuno selezionato</span>
    <div class="btn-fila">
      <button class="mini" type="submit" name="fare" value="letti">Segna come letti</button>
      <button class="mini" type="submit" name="fare" value="archivia">Archivia</button>
      <button class="mini mini-pericolo" type="submit" name="fare" value="elimina"
              data-conferma-click="Elimino i messaggi selezionati, con tutte le risposte? Non si può annullare.">Elimina selezionati</button>
    </div>
  </div>

  <div id="elenco-messaggi">
  <?php foreach ($messaggi as $m): $nuovo = $m['status'] === 'new'; ?>
    <div class="riga-messaggio" style="border-color:<?= $nuovo ? 'var(--verde)' : 'var(--filo)' ?>">
      <label class="scelta">
        <input type="checkbox" name="scelti[]" value="<?= (int)$m['id'] ?>"
               aria-label="Seleziona il messaggio di <?= e($m['name']) ?>">
      </label>
      <a href="/admin/messaggi.php?vedi=<?= (int)$m['id'] ?>" class="corpo-riga">
        <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:baseline;justify-content:space-between">
          <div>
            <b style="color:var(--bianco);font-size:16px"><?= e($m['name']) ?></b>
            <span class="sotto spento" style="display:block;margin-top:4px">
              <?= e($m['email']) ?> · <?= e(data_lunga($m['created_at'])) ?>
              <?php if ($m['subject'] !== ''): ?> · <?= e($m['subject']) ?><?php endif; ?>
            </span>
          </div>
          <div class="btn-fila">
            <?php if ($m['n_risposte']): ?><span class="sotto spento"><?= (int)$m['n_risposte'] ?> rispost<?= $m['n_risposte'] == 1 ? 'a' : 'e' ?></span><?php endif; ?>
            <span class="stato<?= $nuovo ? ' stato-in-corso' : ($m['status'] === 'replied' ? '' : ' stato-archiviato') ?>"><?= e(STATI_MESSAGGIO[$m['status']] ?? $m['status']) ?></span>
          </div>
        </div>
        <p style="margin:12px 0 0;color:#cfe0d3;line-height:1.6"><?= e(tronca((string)$m['message'], 160)) ?></p>
      </a>
    </div>
  <?php endforeach; ?>
  </div>
</form>

<style>
/* top:56px = l'altezza dell'intestazione fissa del pannello (.pannello-cima): a 0 finirebbe sotto. */
.barra-massa{position:sticky;top:56px;z-index:5;display:flex;flex-wrap:wrap;gap:14px 20px;align-items:center;
  background:#04070a;border:1px solid var(--filo);padding:14px 18px;margin-bottom:14px}
.scelta-tutti{display:flex;gap:12px;align-items:center;cursor:pointer;color:var(--testo);font-size:16px}
.conta-scelti{color:var(--spento);font-size:15px;flex:1;min-width:10rem}
/* Caselle grandi e ad alto contrasto: si vedono e si colpiscono con facilità. */
.barra-massa input[type=checkbox],.scelta input[type=checkbox]{width:26px;height:26px;flex:none;cursor:pointer;accent-color:var(--verde)}
.barra-massa input:focus-visible,.scelta input:focus-visible{outline:3px solid var(--verde);outline-offset:3px}
.riga-messaggio{display:flex;align-items:stretch;border:1px solid var(--filo);background:var(--pece);margin-bottom:12px}
.riga-messaggio:has(input:checked){background:#0b1a10;outline:2px solid var(--verde)}
.scelta{display:flex;align-items:center;justify-content:center;padding:0 18px;cursor:pointer;border-right:1px solid var(--filo)}
.corpo-riga{display:block;flex:1;min-width:0;text-decoration:none;padding:16px 20px}
</style>
<script nonce="<?= e(nonce()) ?>">
(function () {
  var modulo = document.getElementById('modulo-massa');
  var tutti  = document.getElementById('scegli-tutti');
  var conta  = document.getElementById('conta-scelti');
  var caselle = function () { return modulo.querySelectorAll('input[name="scelti[]"]'); };
  function aggiorna() {
    var n = 0, tot = caselle().length;
    caselle().forEach(function (c) { if (c.checked) n++; });
    conta.textContent = n === 0 ? 'Nessuno selezionato' : (n === 1 ? '1 messaggio selezionato' : n + ' messaggi selezionati');
    tutti.checked = n > 0 && n === tot;
    tutti.indeterminate = n > 0 && n < tot;
  }
  tutti.addEventListener('change', function () {
    caselle().forEach(function (c) { c.checked = tutti.checked; });
    aggiorna();
  });
  modulo.addEventListener('change', function (e) { if (e.target.name === 'scelti[]') aggiorna(); });
  aggiorna();
})();
</script>
<?php endif; ?>

<?php piede_pannello(); ?>

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

<?php foreach ($messaggi as $m): $nuovo = $m['status'] === 'new'; ?>
  <a href="/admin/messaggi.php?vedi=<?= (int)$m['id'] ?>" style="display:block;text-decoration:none;
     border:1px solid <?= $nuovo ? 'var(--verde)' : 'var(--filo)' ?>;background:var(--pece);padding:16px 20px;margin-bottom:12px">
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
<?php endforeach; ?>

<?php piede_pannello(); ?>

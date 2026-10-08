<?php
/**
 * La newsletter nel pannello: gli iscritti, l'invio, e l'archivio degli invii.
 *
 * L'invio non parte mai al primo colpo. Prima si scrive e si vede l'anteprima,
 * poi si manda una prova alla propria casella, e solo a quel punto si può
 * inviare agli iscritti: con la conferma spuntata, e con lo stesso testo e lo
 * stesso numero di iscritti visti nell'anteprima. Ogni anteprima vale per un
 * solo invio.
 *
 * «In attesa» vuol dire che l'indirizzo è stato scritto ma il link nella email
 * di conferma non è ancora stato cliccato: è il doppio consenso, e quegli
 * indirizzi non ricevono niente finché non confermano.
 */
require __DIR__ . '/_avvio.php';
require_once __DIR__ . '/../lib/newsletter.php';
richiedi_accesso();

const VISTE_NEWSLETTER = ['iscritti', 'invia', 'storico'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    $azione = (string)($_POST['azione'] ?? '');

    if ($azione === 'elimina') {
        $id = (int)($_POST['id'] ?? 0);
        if (!$id) torna('/admin/newsletter.php', 'Azione sconosciuta.', true);
        elimina_iscritto($id);
        torna('/admin/newsletter.php', 'Indirizzo eliminato.');
    }

    if (!in_array($azione, ['anteprima', 'prova', 'invia'], true)) {
        torna('/admin/newsletter.php', 'Azione sconosciuta.', true);
    }

    // Da qui in poi si lavora sul testo com'è nel modulo, e lo si ricontrolla ogni volta.
    $vista  = 'invia';
    $bozza  = newsletter_bozza_da_modulo($_POST);
    $platea = newsletter_platea();
    $quanti = count($platea['pronti']);
    $avviso = null;   // [testo, è un errore]

    if ($azione === 'anteprima' || $azione === 'prova') {
        if ($bozza['errore'] !== '') {
            $avviso = [$bozza['errore'], true];
        } elseif ($azione === 'anteprima') {
            avvia_sessione();
            $_SESSION['newsletter_anteprima'] = [
                'impronta' => newsletter_impronta($bozza['oggetto'], $bozza['testo']),
                'quanti'   => $quanti,
                'usata'    => false,
            ];
            $avviso = ['Anteprima pronta. Controllala, poi manda la prova alla tua casella.', false];
        } elseif (newsletter_prova($bozza['oggetto'], $bozza['testo'])) {
            $avviso = ['Prova inviata alla casella di Simone. Controllala prima di inviare agli iscritti.', false];
        } else {
            $avviso = ['La casella di prova non è configurata (MAIL_INFO in api/config.php): la prova non è partita.', true];
        }
    }

    if ($azione === 'invia') {
        avvia_sessione();
        $d        = $_SESSION['newsletter_anteprima'] ?? null;
        $impronta = newsletter_impronta($bozza['oggetto'], $bozza['testo']);

        if ($bozza['errore'] !== '') {
            $avviso = [$bozza['errore'], true];
        } elseif (!$d || $d['usata'] || !hash_equals((string)$d['impronta'], $impronta)) {
            $avviso = ["Il testo è cambiato dall'ultima anteprima, o l'anteprima è già stata usata. Rifai l'anteprima.", true];
        } elseif ((int)$d['quanti'] !== $quanti) {
            $avviso = ["Il numero degli iscritti confermati è cambiato da quando hai fatto l'anteprima. Rifai l'anteprima.", true];
        } elseif (($_POST['conferma'] ?? '') !== '1') {
            $avviso = ['Spunta la conferma prima di inviare.', true];
        } else {
            // Il gettone si consuma prima di spedire: se qualcosa si interrompe a metà, non si rimanda due volte.
            $_SESSION['newsletter_anteprima']['usata'] = true;
            $esito = newsletter_invia($platea['pronti'], $bozza['oggetto'], $bozza['testo']);
            if ($esito['inviate'] > 0) {
                newsletter_archivia($bozza['oggetto'], $bozza['testo'], $esito['inviate']);
            }
            $messaggio = "Inviata a {$esito['inviate']} iscritti.";
            if ($esito['fallite']) {
                $messaggio .= ' Non partita per ' . count($esito['fallite']) . ' indirizzi: il registro del server dice perché.';
            }
            torna('/admin/newsletter.php?vista=storico', $messaggio, $esito['inviate'] === 0);
        }
    }

    // Anteprima o prova che non sono andate in invio: la pagina resta com'è, col testo appena scritto.
    $anteprima = $bozza['errore'] === ''
        ? newsletter_html($bozza['oggetto'], $bozza['testo'], 'Nome Iscritto', '#')
        : null;
} else {
    $vista     = in_array($_GET['vista'] ?? '', VISTE_NEWSLETTER, true) ? (string)$_GET['vista'] : 'iscritti';
    $bozza     = ['oggetto' => '', 'testo' => '', 'errore' => ''];
    $avviso    = null;
    $anteprima = null;
    $platea    = newsletter_platea();
    $quanti    = count($platea['pronti']);
}

$stato     = (string)($_GET['stato'] ?? '');
$nomiStato = ['confirmed' => 'Confermati', 'pending' => 'In attesa', 'unsubscribed' => 'Usciti'];
$c         = conteggi_iscritti();

$titoli = [
    'iscritti' => $c['totale'] . ' indirizzi in tutto',
    'invia'    => 'Scrivi e invia una newsletter',
    'storico'  => 'Gli invii passati',
];
testa_pannello('Newsletter', 'newsletter');
titolo_pannello('Newsletter', $titoli[$vista]);
avviso_pannello();

$schede = ['iscritti' => 'Iscritti', 'invia' => 'Scrivi e invia', 'storico' => 'Invii passati'];
?>

<nav class="btn-fila" style="margin-bottom:22px" aria-label="Sezioni della newsletter">
  <?php foreach ($schede as $k => $nome): ?>
    <a class="btn <?= $k === $vista ? 'btn-pieno' : 'btn-muto' ?>" href="/admin/newsletter.php?vista=<?= $k ?>"><?= e($nome) ?></a>
  <?php endforeach; ?>
</nav>

<?php if ($vista === 'iscritti'): ?>

<div class="numeri">
  <a href="/admin/newsletter.php?stato=confirmed"><div><b><?= $c['confirmed'] ?></b><span class="eti">Confermati</span></div></a>
  <a href="/admin/newsletter.php?stato=pending"><div><b><?= $c['pending'] ?></b><span class="eti">In attesa</span></div></a>
  <a href="/admin/newsletter.php?stato=unsubscribed"><div><b><?= $c['unsubscribed'] ?></b><span class="eti">Usciti</span></div></a>
  <a href="/admin/newsletter.php"><div><b><?= $c['totale'] ?></b><span class="eti">In tutto</span></div></a>
</div>

<?php $iscritti = admin_iscritti($stato); ?>

<?php if ($stato !== ''): ?>
  <p class="aiuto" style="margin-bottom:16px">
    Stai vedendo solo: <b><?= e($nomiStato[$stato] ?? $stato) ?></b>.
    <a href="/admin/newsletter.php" style="color:var(--verde)">Vedili tutti</a>
  </p>
<?php endif; ?>

<div class="avvolgi">
  <table class="tabella-lavoro">
    <thead><tr><th>Indirizzo</th><th>Stato</th><th>Iscritto il</th><th class="comandi"></th></tr></thead>
    <tbody>
      <?php foreach ($iscritti as $i): ?>
        <tr>
          <td><?= e($i['email']) ?></td>
          <td>
            <?php if ($i['status'] === 'confirmed'): ?><span class="stato">Confermato</span>
            <?php elseif ($i['status'] === 'pending'): ?><span class="stato stato-in-corso">In attesa</span>
            <?php else: ?><span class="stato stato-archiviato">Uscito</span><?php endif; ?>
          </td>
          <td class="num"><?= e(data_breve($i['created_at'])) ?></td>
          <td class="comandi">
            <form method="post" action="/admin/newsletter.php" style="display:inline">
              <?= campo_gettone() ?>
              <input type="hidden" name="azione" value="elimina">
              <input type="hidden" name="id" value="<?= (int)$i['id'] ?>">
              <button class="mini mini-pericolo" type="submit"
                      data-conferma-click="Elimino <?= e($i['email']) ?> dalla lista?">Elimina</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$iscritti): ?>
        <tr><td colspan="4" style="padding:34px;text-align:center;color:var(--spento)">Nessun indirizzo.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<?php elseif ($vista === 'invia'): ?>

<?php if ($avviso): ?>
  <p class="avviso<?= $avviso[1] ? ' avviso-no' : '' ?>" role="status"><?= e($avviso[0]) ?></p>
<?php endif; ?>

<form method="post" action="/admin/newsletter.php" class="scheda" style="max-width:720px">
  <?= campo_gettone() ?>
  <div class="campo">
    <label class="eti" for="n-oggetto">Oggetto</label>
    <input id="n-oggetto" name="oggetto" type="text" maxlength="<?= NEWSLETTER_OGGETTO_MAX ?>"
           value="<?= e($bozza['oggetto']) ?>" required>
  </div>
  <div class="campo">
    <label class="eti" for="n-testo">Testo</label>
    <textarea id="n-testo" name="testo" rows="14" required><?= e($bozza['testo']) ?></textarea>
    <p class="aiuto">Testo semplice: a capo come li scrivi, niente HTML. Il link per uscire è in fondo a ogni email.</p>
  </div>

  <div class="btn-fila" style="margin-bottom:24px">
    <button class="btn btn-muto" type="submit" name="azione" value="anteprima">Anteprima</button>
    <button class="btn btn-muto" type="submit" name="azione" value="prova"
            <?= posta_info() === '' ? 'disabled title="MAIL_INFO non configurata"' : '' ?>>Mandami una prova</button>
  </div>

  <?php if ($anteprima !== null): ?>
    <section style="border-top:1px solid var(--filo);padding-top:22px;margin-top:8px">
      <p class="aiuto" style="margin-bottom:12px">
        Così la vede chi riceve (il nome è di prova). Riceveranno: <b><?= $quanti ?></b> iscritti confermati.
        <?php if ($platea['senza_link'] > 0): ?>
          <b><?= $platea['senza_link'] ?></b> iscritti confermati non hanno il link di disiscrizione: non riceveranno nulla.
        <?php endif; ?>
      </p>
      <iframe sandbox="" title="Anteprima dell'email" srcdoc="<?= e($anteprima) ?>"
              style="width:100%;height:560px;border:1px solid var(--filo);background:#0a0a0a"></iframe>
    </section>

    <?php if ($quanti > 0): ?>
    <section style="border-top:1px solid var(--filo);padding-top:22px;margin-top:26px">
      <label class="spunta" style="margin-bottom:16px">
        <input type="checkbox" name="conferma" value="1">
        <span>Ho letto l'anteprima e ho ricevuto la prova. Capisco che l'invio non si può annullare.</span>
      </label>
      <button class="btn btn-pieno" type="submit" name="azione" value="invia"
              data-conferma-click="Invio la newsletter a <?= $quanti ?> iscritti. Non si può annullare. Procedo?">Invia a <?= $quanti ?> iscritti</button>
    </section>
    <?php else: ?>
      <p class="aiuto">Nessun iscritto confermato con il link di disiscrizione: non c'è nessuno a cui inviare.</p>
    <?php endif; ?>
  <?php endif; ?>
</form>

<?php else: /* storico */ ?>

<?php
$invii = newsletter_storico();
$apri  = (int)($_GET['invio'] ?? 0);
$letto = $apri ? newsletter_invio($apri) : null;
?>

<?php if ($letto): ?>
  <section class="scheda" style="max-width:720px;margin-bottom:28px">
    <span class="sotto spento"><?= e(data_breve($letto['sent_at'])) ?> · a <?= (int)$letto['recipient_count'] ?> iscritti</span>
    <h2 class="gro" style="margin-top:6px"><?= e($letto['subject']) ?></h2>
    <p style="white-space:pre-wrap;color:#cfe0d3;line-height:1.65;margin-top:14px"><?= e($letto['body']) ?></p>
    <p class="aiuto" style="margin-top:14px"><a href="/admin/newsletter.php?vista=storico" style="color:var(--verde)">← Tutti gli invii</a></p>
  </section>
<?php endif; ?>

<div class="avvolgi">
  <table class="tabella-lavoro">
    <thead><tr><th>Oggetto</th><th>Inviata il</th><th class="num">Destinatari</th><th class="comandi"></th></tr></thead>
    <tbody>
      <?php foreach ($invii as $i): ?>
        <tr>
          <td><?= e($i['subject']) ?></td>
          <td class="num"><?= e(data_breve($i['sent_at'])) ?></td>
          <td class="num"><?= (int)$i['recipient_count'] ?></td>
          <td class="comandi"><a href="/admin/newsletter.php?vista=storico&amp;invio=<?= (int)$i['id'] ?>" style="color:var(--verde)">Rileggi</a></td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$invii): ?>
        <tr><td colspan="4" style="padding:34px;text-align:center;color:var(--spento)">Nessuna newsletter ancora inviata.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<?php endif; ?>

<?php piede_pannello(); ?>

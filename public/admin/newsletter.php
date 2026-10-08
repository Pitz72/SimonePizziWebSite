<?php
/**
 * La newsletter nel pannello: gli iscritti e il loro consenso, la composizione
 * di un numero con gli articoli scelti, e le campagne in invio.
 *
 * Un numero non parte al primo colpo: si compone, si vede l'anteprima, si manda
 * una prova alla propria casella, e solo allora si invia, con la conferma
 * spuntata. L'anteprima vale per un solo invio, e il testo e gli articoli devono
 * essere quelli dell'anteprima. I lotti sono di al massimo sessantaquattro
 * email, a un'ora di distanza, per il tetto orario di DreamHost.
 *
 * «In attesa» vuol dire che l'indirizzo è stato scritto ma il link della
 * conferma non è ancora stato premuto: non riceve niente finché non conferma.
 */
require __DIR__ . '/_avvio.php';
require_once __DIR__ . '/../lib/newsletter.php';
richiedi_accesso();

const VISTE_NEWSLETTER = ['iscritti', 'componi', 'campagne'];

/* ── Le azioni del modulo ─────────────────────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    $azione = (string)($_POST['azione'] ?? '');
    $torna  = '/admin/newsletter.php';

    if ($azione === 'elimina') {
        $id = (int)($_POST['id'] ?? 0);
        if (!$id) { torna($torna, 'Azione sconosciuta.', true); }
        elimina_iscritto($id);
        torna($torna, 'Indirizzo eliminato.');
    }

    if ($azione === 'revoca') {
        $id = (int)($_POST['id'] ?? 0);
        db()->prepare("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = ?, confirm_token = NULL WHERE id = ?")
            ->execute([date('Y-m-d H:i:s'), $id]);
        torna($torna . '?vista=iscritti', 'Iscrizione revocata: quell’indirizzo non riceve più niente.');
    }

    if ($azione === 'reinvia') {
        $id = (int)($_POST['id'] ?? 0);
        $q = db()->prepare("SELECT email, name FROM subscribers WHERE id = ? AND status = 'pending'");
        $q->execute([$id]);
        $s = $q->fetch();
        if (!$s) { torna($torna . '?vista=iscritti', 'Quell’indirizzo non è in attesa di conferma.', true); }
        $token = bin2hex(random_bytes(32));
        db()->prepare("UPDATE subscribers SET confirm_token = ?, confirm_sent_at = ? WHERE id = ?")
            ->execute([$token, date('Y-m-d H:i:s'), $id]);
        $ok = newsletter_mail_conferma((string)$s['email'], (string)($s['name'] ?? ''), $token);
        torna($torna . '?vista=iscritti', $ok ? 'Conferma rimandata.' : 'Non sono riuscito a rimandarla: la coda la riproverà.', !$ok);
    }

    if ($azione === 'aggiungi') {
        $fonte = trim((string)($_POST['fonte'] ?? ''));
        if (($_POST['dichiaro'] ?? '') !== '1') {
            torna($torna . '?vista=iscritti', 'Dichiara che il consenso di quella persona è documentato.', true);
        }
        if ($fonte === '') { torna($torna . '?vista=iscritti', 'Scrivi dove hai raccolto il consenso.', true); }
        [$ok, $msg] = newsletter_aggiungi_manuale((string)($_POST['email'] ?? ''), trim((string)($_POST['nome'] ?? '')), $fonte);
        torna($torna . '?vista=iscritti', $msg, !$ok);
    }

    if ($azione === 'importa') {
        $righe = preg_split('/[\s,;]+/', (string)($_POST['elenco'] ?? ''), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $fonte = trim((string)($_POST['fonte'] ?? ''));
        $documentato = ($_POST['documentato'] ?? '') === '1';
        if (!$righe) { torna($torna . '?vista=iscritti', 'L’elenco è vuoto.', true); }
        if ($fonte === '') { torna($torna . '?vista=iscritti', 'Scrivi da dove viene l’elenco.', true); }
        if (count($righe) > 500) { torna($torna . '?vista=iscritti', 'Al massimo 500 indirizzi per volta.', true); }
        $esito = newsletter_importa($righe, $fonte, $documentato);
        $msg = "Importati {$esito['nuovi']} indirizzi su {$esito['righe']}. "
             . "Già presenti: {$esito['gia_presenti']}. Non validi: {$esito['non_validi']}."
             . ($documentato ? '' : ' Hanno ricevuto la conferma: entrano solo se la premono.');
        torna($torna . '?vista=iscritti', $msg);
    }

    if ($azione === 'riconferma') {
        if (($_POST['conferma'] ?? '') !== '1') { torna($torna . '?vista=iscritti', 'Spunta la conferma prima di inviare.', true); }
        $n = (int)db()->query("SELECT COUNT(*) FROM subscribers WHERE " . nl_filtro_destinatari('riconferma'))->fetchColumn();
        if ($n === 0) { torna($torna . '?vista=iscritti', 'Non c’è nessun iscritto senza consenso registrato.', true); }
        $oggetto = 'Confermi il consenso alla newsletter di Simone Pizzi?';
        $html = newsletter_html_campagna($oggetto, '', [], 'riconferma');
        $id = newsletter_crea_invio('riconferma', $oggetto, '', [], $html);
        $esito = newsletter_lotto($id);
        torna($torna . '?vista=campagne', 'Richiesta di riconferma avviata: ' . $esito['inviate'] . ' inviate nel primo lotto.');
    }

    if ($azione === 'stato') {
        $id = (int)($_POST['id'] ?? 0);
        $mossa = (string)($_POST['mossa'] ?? '');
        $ok = newsletter_cambia_stato($id, $mossa);
        torna($torna . '?vista=campagne', $ok ? 'Fatto.' : 'Non si può fare adesso.', !$ok);
    }

    if ($azione === 'lotto') {
        $id = (int)($_POST['id'] ?? 0);
        $c = newsletter_invio_per_id($id);
        if (!$c || $c['stato'] !== 'in_invio') { torna($torna . '?vista=campagne', 'Quell’invio non è in corso.', true); }
        if ($c['prossimo_lotto'] && strtotime($c['prossimo_lotto']) > time()) {
            torna($torna . '?vista=campagne', 'Il prossimo lotto è previsto alle ' . date('H:i', strtotime($c['prossimo_lotto'])) . '.', true);
        }
        $esito = newsletter_lotto($id);
        torna($torna . '?vista=campagne', "Lotto inviato: {$esito['inviate']} email. Stato: {$esito['stato']}.");
    }

    if ($azione === 'anteprima' || $azione === 'prova' || $azione === 'invia') {
        avvia_sessione();
        $bozza     = newsletter_bozza_da_modulo($_POST);
        $idArticoli = array_map('intval', (array)($_POST['articoli'] ?? []));
        $articoli  = newsletter_articoli_per_id($idArticoli);
        $avviso    = null;
        $anteprima = null;
        $vista     = 'componi';
        $platea    = newsletter_conteggi();
        $quanti    = $platea['pronti'];
        $impronta  = newsletter_impronta($bozza['oggetto'], $bozza['intro'], $idArticoli);

        if ($bozza['errore'] !== '') {
            $avviso = [$bozza['errore'], true];
        } elseif (!$articoli) {
            $avviso = ['Scegli almeno un articolo online da mettere nel numero.', true];
        } elseif ($azione === 'anteprima') {
            $_SESSION['newsletter_bozza'] = ['impronta' => $impronta, 'quanti' => $quanti, 'usata' => false];
            $avviso = ['Anteprima pronta. Controllala, manda la prova, poi invia.', false];
        } elseif ($azione === 'prova') {
            $avviso = newsletter_prova($bozza['oggetto'], $bozza['intro'], $articoli)
                ? ['Prova inviata alla casella di Simone. Controllala prima di inviare agli iscritti.', false]
                : ['La casella di prova non è configurata (MAIL_INFO in api/config.php): la prova non è partita.', true];
        } else {
            $d = $_SESSION['newsletter_bozza'] ?? null;
            if (!$d || $d['usata'] || !hash_equals((string)$d['impronta'], $impronta)) {
                $avviso = ["Il testo o gli articoli sono cambiati dall’ultima anteprima, o l’anteprima è già stata usata. Rifai l’anteprima.", true];
            } elseif ((int)$d['quanti'] !== $quanti) {
                $avviso = ["Il numero degli iscritti che ricevono è cambiato. Rifai l’anteprima.", true];
            } elseif (($_POST['conferma'] ?? '') !== '1') {
                $avviso = ['Spunta la conferma prima di inviare.', true];
            } elseif ($quanti === 0) {
                $avviso = ['Nessun iscritto con consenso registrato: non c’è nessuno a cui inviare.', true];
            } else {
                // Il gettone si consuma prima di spedire: un doppio clic non rimanda due volte.
                $_SESSION['newsletter_bozza']['usata'] = true;
                $html = newsletter_html_campagna($bozza['oggetto'], $bozza['intro'], $articoli, 'news');
                $id = newsletter_crea_invio('news', $bozza['oggetto'], $bozza['intro'], $articoli, $html);
                $esito = newsletter_lotto($id);
                torna($torna . '?vista=campagne', "Invio avviato: {$esito['inviate']} email nel primo lotto."
                    . ($esito['stato'] === 'in_invio' ? ' Il resto parte a lotti di un’ora l’uno.' : ''));
            }
        }
        if ($bozza['errore'] === '' && $articoli) {
            $anteprima = newsletter_html_campagna($bozza['oggetto'], $bozza['intro'], $articoli, 'news');
        }
    }
    if (!isset($vista)) { torna($torna, 'Azione sconosciuta.', true); }
} else {
    $vista     = in_array($_GET['vista'] ?? '', VISTE_NEWSLETTER, true) ? (string)$_GET['vista'] : 'iscritti';
    $bozza     = ['oggetto' => '', 'intro' => '', 'errore' => ''];
    $idArticoli = [];
    $avviso    = null;
    $anteprima = null;
    $articoli  = [];
    $platea    = newsletter_conteggi();
}

/* ── Quello che la pagina mostra ─────────────────────────────────────────── */
$stato     = (string)($_GET['stato'] ?? '');
$c         = conteggi_iscritti();
$conteggi  = newsletter_conteggi();
$nomiStato = ['confirmed' => 'Confermati', 'pending' => 'In attesa', 'unsubscribed' => 'Usciti'];
$titoli    = [
    'iscritti' => $c['totale'] . ' indirizzi in tutto',
    'componi'  => 'Componi un numero',
    'campagne' => 'Gli invii',
];
testa_pannello('Newsletter', 'newsletter');
titolo_pannello('Newsletter', $titoli[$vista]);
avviso_pannello();
$schede = ['iscritti' => 'Iscritti', 'componi' => 'Componi e invia', 'campagne' => 'Invii e lotti'];
?>

<nav class="btn-fila" style="margin-bottom:22px" aria-label="Sezioni della newsletter">
  <?php foreach ($schede as $k => $nome): ?>
    <a class="btn <?= $k === $vista ? 'btn-pieno' : 'btn-muto' ?>" href="/admin/newsletter.php?vista=<?= $k ?>"><?= e($nome) ?></a>
  <?php endforeach; ?>
</nav>

<?php if ($avviso): ?>
  <p class="avviso<?= $avviso[1] ? ' avviso-no' : '' ?>" role="status"><?= e($avviso[0]) ?></p>
<?php endif; ?>

<?php if ($vista === 'iscritti'):
  $iscritti = admin_iscritti($stato);
  $nonConsenso = $conteggi['senza_consenso'];
?>

<div class="numeri">
  <a href="/admin/newsletter.php?stato=confirmed"><div><b><?= $conteggi['pronti'] ?></b><span class="eti">Ricevono (consenso ok)</span></div></a>
  <a href="/admin/newsletter.php?stato=confirmed"><div><b><?= $nonConsenso ?></b><span class="eti">Senza consenso registrato</span></div></a>
  <a href="/admin/newsletter.php?stato=pending"><div><b><?= $c['pending'] ?></b><span class="eti">In attesa</span></div></a>
  <a href="/admin/newsletter.php?stato=unsubscribed"><div><b><?= $c['unsubscribed'] ?></b><span class="eti">Usciti</span></div></a>
</div>

<?php if ($nonConsenso > 0): ?>
<section class="scheda" style="max-width:820px;margin-bottom:28px;border-left:3px solid var(--verde);padding-left:18px">
  <p class="aiuto" style="margin-bottom:12px">
    <b><?= $nonConsenso ?></b> iscritti confermati non hanno un consenso registrato: non ricevono nessun numero finché non lo confermano.
    Si chiede a loro la riconferma con un clic. Chi non risponde resta fuori.
  </p>
  <form method="post" action="/admin/newsletter.php">
    <?= campo_gettone() ?>
    <label class="spunta" style="margin-bottom:12px"><input type="checkbox" name="conferma" value="1">
      <span>Mando la richiesta di riconferma a questi <?= $nonConsenso ?> indirizzi, a lotti di un’ora.</span></label>
    <button class="btn btn-pieno" type="submit" name="azione" value="riconferma"
            data-conferma-click="Mando la richiesta di riconferma a <?= $nonConsenso ?> indirizzi?">Chiedi la riconferma</button>
  </form>
</section>
<?php endif; ?>

<?php if ($stato !== ''): ?>
  <p class="aiuto" style="margin-bottom:16px">
    Stai vedendo solo: <b><?= e($nomiStato[$stato] ?? $stato) ?></b>.
    <a href="/admin/newsletter.php?vista=iscritti" style="color:var(--verde)">Vedili tutti</a>
  </p>
<?php endif; ?>

<div class="avvolgi">
  <table class="tabella-lavoro">
    <thead><tr><th>Indirizzo</th><th>Stato</th><th>Consenso</th><th>Iscritto il</th><th class="comandi"></th></tr></thead>
    <tbody>
      <?php foreach ($iscritti as $i): ?>
        <tr>
          <td><?= e($i['email']) ?></td>
          <td>
            <?php if ($i['status'] === 'confirmed'): ?><span class="stato">Confermato</span>
            <?php elseif ($i['status'] === 'pending'): ?><span class="stato stato-in-corso">In attesa</span>
            <?php else: ?><span class="stato stato-archiviato">Uscito</span><?php endif; ?>
          </td>
          <td>
            <?php if (!empty($i['consent_at'])): ?>
              <span class="sotto spento"><?= e(data_breve($i['consent_at'])) ?> · <?= e((string)($i['consent_source'] ?? '')) ?></span>
            <?php else: ?>
              <span class="stato stato-archiviato">mancante</span>
            <?php endif; ?>
          </td>
          <td class="num"><?= e(data_breve($i['created_at'])) ?></td>
          <td class="comandi">
            <?php if ($i['status'] === 'pending'): ?>
              <form method="post" action="/admin/newsletter.php" style="display:inline">
                <?= campo_gettone() ?>
                <input type="hidden" name="id" value="<?= (int)$i['id'] ?>">
                <button class="mini" type="submit" name="azione" value="reinvia">Rimanda conferma</button>
              </form>
            <?php endif; ?>
            <?php if ($i['status'] !== 'unsubscribed'): ?>
              <form method="post" action="/admin/newsletter.php" style="display:inline">
                <?= campo_gettone() ?>
                <input type="hidden" name="id" value="<?= (int)$i['id'] ?>">
                <button class="mini" type="submit" name="azione" value="revoca"
                        data-conferma-click="Revoco l’iscrizione di <?= e($i['email']) ?>?">Revoca</button>
              </form>
            <?php endif; ?>
            <form method="post" action="/admin/newsletter.php" style="display:inline">
              <?= campo_gettone() ?>
              <input type="hidden" name="id" value="<?= (int)$i['id'] ?>">
              <button class="mini mini-pericolo" type="submit" name="azione" value="elimina"
                      data-conferma-click="Elimino <?= e($i['email']) ?> dalla lista?">Elimina</button>
            </form>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$iscritti): ?>
        <tr><td colspan="5" style="padding:34px;text-align:center;color:var(--spento)">Nessun indirizzo.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<section class="scheda" style="max-width:820px;margin-top:40px">
  <h2 class="gro" style="font-size:20px">Aggiungi un indirizzo</h2>
  <p class="aiuto" style="margin-bottom:14px">Solo per i consensi che hai già, documentati altrove (un messaggio, un modulo). L’indirizzo entra confermato, e la fonte resta scritta nella riga.</p>
  <form method="post" action="/admin/newsletter.php">
    <?= campo_gettone() ?>
    <div class="due-colonne">
      <div class="campo"><label class="eti" for="a-email">Email</label><input id="a-email" name="email" type="email" required></div>
      <div class="campo"><label class="eti" for="a-nome">Nome (facoltativo)</label><input id="a-nome" name="nome" type="text" maxlength="80"></div>
    </div>
    <div class="campo"><label class="eti" for="a-fonte">Dove hai raccolto il consenso</label>
      <input id="a-fonte" name="fonte" type="text" maxlength="40" required placeholder="es. festival 2025, messaggio del 3/4/2026"></div>
    <label class="spunta" style="margin-bottom:16px"><input type="checkbox" name="dichiaro" value="1" required>
      <span>Dichiaro che questa persona ha dato il consenso a ricevere la newsletter, e che lo posso documentare.</span></label>
    <button class="btn btn-muto" type="submit" name="azione" value="aggiungi">Aggiungi</button>
  </form>
</section>

<section class="scheda" style="max-width:820px;margin-top:40px">
  <h2 class="gro" style="font-size:20px">Importa un elenco</h2>
  <p class="aiuto" style="margin-bottom:14px">Un indirizzo per riga, o separati da spazi e virgole (al massimo 500). Senza il consenso documentato, ciascuno riceve la conferma e entra solo se la preme.</p>
  <form method="post" action="/admin/newsletter.php">
    <?= campo_gettone() ?>
    <div class="campo"><label class="eti" for="i-elenco">Indirizzi</label><textarea id="i-elenco" name="elenco" rows="6"></textarea></div>
    <div class="campo"><label class="eti" for="i-fonte">Da dove viene</label><input id="i-fonte" name="fonte" type="text" maxlength="40" required></div>
    <label class="spunta" style="margin-bottom:16px"><input type="checkbox" name="documentato" value="1">
      <span>Ho il consenso documentato per ciascun indirizzo: entrano confermati.</span></label>
    <label class="spunta" style="margin-bottom:16px"><input type="checkbox" name="conferma" value="1" required>
      <span>Ho letto quello che succede e procedo.</span></label>
    <button class="btn btn-muto" type="submit" name="azione" value="importa">Importa</button>
  </form>
</section>

<?php elseif ($vista === 'componi'):
  $articoliScelta = newsletter_articoli_scelta(40);
  $scelti = array_flip(array_map('intval', $idArticoli));
  $oggettoIniziale = $bozza['oggetto'];
  $introIniziale   = $bozza['intro'];
?>

<form method="post" action="/admin/newsletter.php?vista=componi" class="scheda" style="max-width:820px">
  <?= campo_gettone() ?>
  <div class="campo">
    <label class="eti" for="n-oggetto">Oggetto</label>
    <input id="n-oggetto" name="oggetto" type="text" maxlength="<?= NEWSLETTER_OGGETTO_MAX ?>" value="<?= e($oggettoIniziale) ?>" required>
  </div>
  <div class="campo">
    <label class="eti" for="n-testo">Testo di apertura</label>
    <textarea id="n-testo" name="testo" rows="8"><?= e($introIniziale) ?></textarea>
    <p class="aiuto">Testo semplice, con i paragrafi separati da una riga vuota. Sotto, gli articoli scelti.</p>
  </div>

  <div class="campo">
    <span class="eti">Articoli da mettere nel numero (solo quelli online)</span>
    <?php if (!$articoliScelta): ?><p class="aiuto">Nessun articolo pubblicato.</p><?php endif; ?>
    <div class="avvolgi" style="max-height:340px;overflow:auto;border:1px solid var(--filo);padding:4px 12px">
      <?php foreach ($articoliScelta as $a): ?>
        <label class="spunta" style="padding:8px 0;border-bottom:1px solid var(--filo2)">
          <input type="checkbox" name="articoli[]" value="<?= (int)$a['id'] ?>" <?= isset($scelti[(int)$a['id']]) ? 'checked' : '' ?>>
          <span><?= e($a['title']) ?> <span class="sotto spento"><?= e((string)$a['category']) ?> · <?= e(data_breve($a['published_at'])) ?></span></span>
        </label>
      <?php endforeach; ?>
    </div>
  </div>

  <div class="btn-fila" style="margin-bottom:24px">
    <button class="btn btn-muto" type="submit" name="azione" value="anteprima">Anteprima</button>
    <button class="btn btn-muto" type="submit" name="azione" value="prova"
            <?= posta_info() === '' ? 'disabled title="MAIL_INFO non configurata"' : '' ?>>Mandami una prova</button>
  </div>

  <?php if ($anteprima !== null): ?>
    <section style="border-top:1px solid var(--filo);padding-top:22px;margin-top:8px">
      <p class="aiuto" style="margin-bottom:12px">
        Così lo vede chi riceve (il nome è di prova). Riceveranno: <b><?= $conteggi['pronti'] ?></b> iscritti con consenso registrato.
        <?php if ($conteggi['senza_consenso'] > 0): ?>
          <b><?= $conteggi['senza_consenso'] ?></b> iscritti senza consenso registrato non riceveranno nulla.
        <?php endif; ?>
        A lotti di al massimo 64 email l’ora.
      </p>
      <iframe sandbox="" title="Anteprima dell'email" srcdoc="<?= e($anteprima) ?>"
              style="width:100%;height:560px;border:1px solid var(--filo);background:#0a0a0a"></iframe>
    </section>
    <?php if ($conteggi['pronti'] > 0): ?>
    <section style="border-top:1px solid var(--filo);padding-top:22px;margin-top:26px">
      <label class="spunta" style="margin-bottom:16px">
        <input type="checkbox" name="conferma" value="1">
        <span>Ho letto l’anteprima e ricevuto la prova. Capisco che l’invio non si può annullare.</span>
      </label>
      <button class="btn btn-pieno" type="submit" name="azione" value="invia"
              data-conferma-click="Avvio l’invio a <?= $conteggi['pronti'] ?> iscritti. Non si può annullare. Procedo?">Invia a <?= $conteggi['pronti'] ?> iscritti</button>
    </section>
    <?php endif; ?>
  <?php endif; ?>
</form>

<?php else:
  $invii = newsletter_storico();
  $apri  = (int)($_GET['invio'] ?? 0);
  $letto = $apri ? newsletter_invio($apri) : null;
  $registro = (int)($_GET['registro'] ?? 0);
  $righe = $registro ? newsletter_registro($registro) : [];
  $quota = mail_stato_quota();
?>

<div class="numeri" style="margin-bottom:28px">
  <div><b><?= $quota['usate'] ?></b><span class="eti">Email nell’ultima ora</span></div>
  <div><b><?= $quota['bassa'] ?></b><span class="eti">Tetto per la newsletter (l’ora)</span></div>
  <div><b><?= $quota['tetto'] ?></b><span class="eti">Tetto della posta (l’ora)</span></div>
  <div><b><?= $quota['in_coda'] ?></b><span class="eti">In coda</span></div>
</div>

<?php if ($letto): ?>
  <section class="scheda" style="max-width:820px;margin-bottom:28px">
    <span class="sotto spento"><?= e(data_breve($letto['sent_at'])) ?> · <?= (int)$letto['recipient_count'] ?> inviate</span>
    <h2 class="gro" style="margin-top:6px"><?= e($letto['subject']) ?></h2>
    <p class="aiuto" style="margin:14px 0 10px">Com’è arrivata agli iscritti. Riquadro isolato: niente script, i link non si seguono.</p>
    <iframe sandbox="" title="Testo dell'invio" srcdoc="<?= e(newsletter_come_arrivata($letto)) ?>"
            style="width:100%;height:640px;border:1px solid var(--filo);background:#0a0a0a"></iframe>
    <p class="aiuto" style="margin-top:14px"><a href="/admin/newsletter.php?vista=campagne" style="color:var(--verde)">← Tutti gli invii</a></p>
  </section>
<?php endif; ?>

<?php if ($registro): ?>
  <section class="scheda" style="max-width:820px;margin-bottom:28px">
    <h2 class="gro" style="font-size:20px">Registro: chi ha ricevuto cosa</h2>
    <p class="aiuto" style="margin-bottom:12px"><a href="/admin/newsletter.php?vista=campagne" style="color:var(--verde)">← Tutti gli invii</a></p>
    <div class="avvolgi">
      <table class="tabella-lavoro">
        <thead><tr><th>Indirizzo</th><th>Esito</th><th>Quando</th><th>Nota</th></tr></thead>
        <tbody>
          <?php foreach ($righe as $r): ?>
            <tr>
              <td><?= e($r['email']) ?></td>
              <td><span class="stato <?= $r['esito'] === 'inviata' ? '' : 'stato-archiviato' ?>"><?= $r['esito'] === 'inviata' ? 'Inviata' : 'Fallita' ?></span></td>
              <td class="num"><?= e(data_breve($r['at'])) ?></td>
              <td class="sotto spento"><?= e((string)($r['errore'] ?? '')) ?></td>
            </tr>
          <?php endforeach; ?>
          <?php if (!$righe): ?><tr><td colspan="4" style="padding:24px;text-align:center;color:var(--spento)">Nessun destinatario ancora.</td></tr><?php endif; ?>
        </tbody>
      </table>
    </div>
  </section>
<?php endif; ?>

<div class="avvolgi">
  <table class="tabella-lavoro">
    <thead><tr><th>Oggetto</th><th>Tipo</th><th>Stato</th><th class="num">Inviate / totale</th><th>Prossimo lotto</th><th class="comandi"></th></tr></thead>
    <tbody>
      <?php foreach ($invii as $i):
        $tipo = (string)($i['tipo'] ?? 'news');
        $stato = (string)($i['stato'] ?? 'inviata');
      ?>
        <tr>
          <td><?= e($i['subject']) ?><span class="sotto spento"><?= e(data_breve($i['sent_at'])) ?></span></td>
          <td><?= $tipo === 'riconferma' ? 'Riconferma' : 'Numero' ?></td>
          <td>
            <?php
              $etichetta = ['in_invio' => 'In invio', 'sospesa' => 'Sospeso', 'inviata' => 'Inviato'][$stato] ?? $stato;
            ?>
            <span class="stato <?= $stato === 'in_invio' ? 'stato-in-corso' : ($stato === 'sospesa' ? 'stato-archiviato' : '') ?>"><?= e($etichetta) ?></span>
          </td>
          <td class="num"><?= (int)($i['inviate'] ?? $i['recipient_count']) ?> / <?= (int)($i['totale'] ?? $i['recipient_count']) ?><?= (int)($i['fallite'] ?? 0) ? ' · ' . (int)$i['fallite'] . ' fallite' : '' ?></td>
          <td class="sotto"><?= $stato === 'in_invio' && $i['prossimo_lotto'] ? e(data_breve($i['prossimo_lotto'])) . ' ' . e(date('H:i', strtotime((string)$i['prossimo_lotto']))) : '—' ?></td>
          <td class="comandi">
            <a href="/admin/newsletter.php?vista=campagne&amp;invio=<?= (int)$i['id'] ?>" style="color:var(--verde)">Rileggi</a>
            <a href="/admin/newsletter.php?vista=campagne&amp;registro=<?= (int)$i['id'] ?>" style="color:var(--verde);margin-left:10px">Registro</a>
            <?php if ($stato === 'in_invio'): ?>
              <form method="post" action="/admin/newsletter.php" style="display:inline">
                <?= campo_gettone() ?><input type="hidden" name="id" value="<?= (int)$i['id'] ?>">
                <button class="mini" type="submit" name="azione" value="lotto">Lotto ora</button>
              </form>
              <form method="post" action="/admin/newsletter.php" style="display:inline">
                <?= campo_gettone() ?><input type="hidden" name="id" value="<?= (int)$i['id'] ?>"><input type="hidden" name="mossa" value="pausa">
                <button class="mini" type="submit" name="azione" value="stato">Pausa</button>
              </form>
            <?php elseif ($stato === 'sospesa'): ?>
              <form method="post" action="/admin/newsletter.php" style="display:inline">
                <?= campo_gettone() ?><input type="hidden" name="id" value="<?= (int)$i['id'] ?>"><input type="hidden" name="mossa" value="riprendi">
                <button class="mini" type="submit" name="azione" value="stato">Riprendi</button>
              </form>
            <?php endif; ?>
            <?php if ((int)($i['fallite'] ?? 0) > 0 && $stato !== 'in_invio'): ?>
              <form method="post" action="/admin/newsletter.php" style="display:inline">
                <?= campo_gettone() ?><input type="hidden" name="id" value="<?= (int)$i['id'] ?>"><input type="hidden" name="mossa" value="riprova">
                <button class="mini" type="submit" name="azione" value="stato">Riprova i falliti</button>
              </form>
            <?php endif; ?>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$invii): ?>
        <tr><td colspan="6" style="padding:34px;text-align:center;color:var(--spento)">Nessun invio ancora.</td></tr>
      <?php endif; ?>
    </tbody>
  </table>
</div>

<?php endif; ?>

<?php piede_pannello(); ?>

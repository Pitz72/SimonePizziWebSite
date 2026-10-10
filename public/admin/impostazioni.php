<?php
/**
 * Le impostazioni del pannello: la password di accesso, e il backup del sito.
 *
 * La password si cambia con quella attuale. Cambiarla alza la versione della
 * sessione: le altre sessioni aperte si chiudono, questa resta aperta.
 * Il backup è un dump compresso del database, con le ultime quattordici copie.
 */
require __DIR__ . '/_avvio.php';
require_once __DIR__ . '/../lib/manutenzione.php';
richiedi_accesso();

const LUNGHEZZA_PASSWORD_MINIMA = 12;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifica_gettone();
    $azione = (string)($_POST['azione'] ?? '');
    $qui = '/admin/impostazioni.php';

    if ($azione === 'password') {
        $attuale  = (string)($_POST['password_attuale'] ?? '');
        $nuova    = (string)($_POST['password_nuova'] ?? '');
        $conferma = (string)($_POST['password_conferma'] ?? '');
        $id = (int)($_SESSION['utente_id'] ?? 0);

        $q = db()->prepare("SELECT password_hash FROM users WHERE id = ?");
        $q->execute([$id]);
        $hash = $q->fetchColumn();
        if (!$hash || !password_verify($attuale, (string)$hash)) {
            torna($qui, 'La password attuale non è giusta.', true);
        }
        if (strlen($nuova) < LUNGHEZZA_PASSWORD_MINIMA) {
            torna($qui, 'La password nuova deve avere almeno ' . LUNGHEZZA_PASSWORD_MINIMA . ' caratteri.', true);
        }
        if (!hash_equals($nuova, $conferma)) {
            torna($qui, 'La conferma non coincide con la password nuova.', true);
        }
        db()->prepare("UPDATE users SET password_hash = ?, session_version = session_version + 1 WHERE id = ?")
            ->execute([password_hash($nuova, PASSWORD_DEFAULT), $id]);
        $q = db()->prepare("SELECT session_version FROM users WHERE id = ?");
        $q->execute([$id]);
        $_SESSION['session_version'] = (int)$q->fetchColumn();
        torna($qui, 'Password cambiata. Le altre sessioni aperte si sono chiuse.');
    }

    if ($azione === 'backup_impostazioni') {
        $auto = ($_POST['backup_auto'] ?? '') === '1' ? '1' : '0';
        $freq = ($_POST['backup_frequency'] ?? '') === 'daily' ? 'daily' : 'weekly';
        impostazione_scrivi('backup_auto', $auto);
        impostazione_scrivi('backup_frequency', $freq);
        torna($qui, 'Impostazioni del backup salvate.');
    }

    if ($azione === 'backup_ora') {
        $esito = backup_crea('dal pannello');
        torna($qui, $esito['ok'] ? 'Copia creata: ' . $esito['file'] . '.' : $esito['message'], !$esito['ok']);
    }

    torna($qui, 'Azione sconosciuta.', true);
}

$auto   = impostazione('backup_auto', '0') === '1';
$freq   = impostazione('backup_frequency', 'weekly');
$ultimo = impostazione('backup_last_run', '');
$copie  = backup_elenco();
$giro   = (int)impostazione('tick_ultimo', '0');
$chiusura = function_exists('fastcgi_finish_request');

testa_pannello('Impostazioni', 'impostazioni');
titolo_pannello('Impostazioni', 'Accesso e backup');
avviso_pannello();
?>

<section class="scheda" style="max-width:720px;margin-bottom:40px">
  <h2 class="gro" style="font-size:20px">Cambia la password</h2>
  <p class="aiuto" style="margin-bottom:16px">Almeno <?= LUNGHEZZA_PASSWORD_MINIMA ?> caratteri. Le altre sessioni aperte si chiudono.</p>
  <form method="post" action="/admin/impostazioni.php" autocomplete="off">
    <?= campo_gettone() ?>
    <div class="campo"><label class="eti" for="p-attuale">Password attuale</label>
      <input id="p-attuale" name="password_attuale" type="password" autocomplete="current-password" required></div>
    <div class="campo"><label class="eti" for="p-nuova">Password nuova</label>
      <input id="p-nuova" name="password_nuova" type="password" autocomplete="new-password" minlength="<?= LUNGHEZZA_PASSWORD_MINIMA ?>" required></div>
    <div class="campo"><label class="eti" for="p-conferma">Ripeti la password nuova</label>
      <input id="p-conferma" name="password_conferma" type="password" autocomplete="new-password" minlength="<?= LUNGHEZZA_PASSWORD_MINIMA ?>" required></div>
    <button class="btn btn-pieno" type="submit" name="azione" value="password">Cambia password</button>
  </form>
</section>

<section class="scheda" style="max-width:720px;margin-bottom:40px">
  <h2 class="gro" style="font-size:20px">Manutenzione automatica</h2>
  <p class="aiuto" style="margin-bottom:12px">
    Lotti della newsletter, coda della posta e backup partono con le visite al sito, al massimo ogni dieci minuti.
    <?= $giro > 0 ? 'Ultimo giro: ' . e(date('d/m/Y H:i', $giro)) . '.' : 'Nessun giro ancora.' ?>
    <?= $chiusura ? '' : 'Attenzione: questo server non chiude la risposta prima del lavoro, quindi il giro parte solo dalle pagine del pannello.' ?>
  </p>
  <p class="aiuto">In coda: <b><?= (int)db()->query("SELECT COUNT(*) FROM mail_coda")->fetchColumn() ?></b> email.
    Newsletter nell’ultima ora: <b><?= mail_usate_ultima_ora(db()) ?></b> su <?= mail_per_ora() ?> consentite (la newsletter fino a <?= mail_tetto('bassa') ?>).</p>
</section>

<section class="scheda" style="max-width:720px">
  <h2 class="gro" style="font-size:20px">Backup del sito</h2>
  <p class="aiuto" style="margin-bottom:16px">
    Un dump compresso di tutto il database: articoli, iscritti, messaggi e il registro della newsletter.
    Si conservano le ultime <?= BACKUP_CONSERVA ?> copie. Il ripristino non è in pannello: si fa a mano, da phpMyAdmin.
    <?= $ultimo !== '' ? 'Ultima copia: ' . e(data_breve($ultimo)) . '.' : 'Nessuna copia ancora.' ?>
  </p>

  <form method="post" action="/admin/impostazioni.php" style="margin-bottom:24px">
    <?= campo_gettone() ?>
    <label class="spunta" style="margin-bottom:12px"><input type="checkbox" name="backup_auto" value="1" <?= $auto ? 'checked' : '' ?>>
      <span>Backup automatico</span></label>
    <div class="campo"><label class="eti" for="b-freq">Frequenza</label>
      <select id="b-freq" name="backup_frequency">
        <option value="daily" <?= $freq === 'daily' ? 'selected' : '' ?>>Ogni giorno</option>
        <option value="weekly" <?= $freq !== 'daily' ? 'selected' : '' ?>>Ogni settimana</option>
      </select></div>
    <button class="btn btn-muto" type="submit" name="azione" value="backup_impostazioni">Salva</button>
  </form>

  <form method="post" action="/admin/impostazioni.php" style="margin-bottom:24px">
    <?= campo_gettone() ?>
    <button class="btn btn-pieno" type="submit" name="azione" value="backup_ora">Crea una copia adesso</button>
  </form>

  <?php if ($copie): ?>
  <div class="avvolgi">
    <table class="tabella-lavoro">
      <thead><tr><th>Copia</th><th>Data</th><th class="num">Dimensione</th><th class="comandi"></th></tr></thead>
      <tbody>
        <?php foreach ($copie as $c): ?>
          <tr>
            <td><?= e($c['nome']) ?></td>
            <td class="num"><?= e(data_breve(date('Y-m-d H:i:s', $c['quando']))) ?></td>
            <td class="num"><?= e(number_format($c['bytes'] / 1048576, 2, ',', '.')) ?> MB</td>
            <td class="comandi"><a href="/admin/backup.php?f=<?= e(rawurlencode($c['nome'])) ?>" style="color:var(--verde)">Scarica</a></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <?php endif; ?>
</section>

<?php piede_pannello(); ?>

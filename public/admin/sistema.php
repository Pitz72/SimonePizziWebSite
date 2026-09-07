<?php
/**
 * Sistema: che cosa gira, che schema c'è, e le cose che vale la pena tenere
 * d'occhio.
 *
 * Non è una schermata di vanità. Serve a rispondere in dieci secondi alle
 * domande che altrimenti costano mezz'ora: la migrazione è passata? il
 * database che ho davanti è quello giusto? quanti articoli non hanno la
 * copertina? quanti tag stanno facendo da zavorra?
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

$migrazioni = [];
try {
    $migrazioni = db()->query("SELECT migration, note, applied_at FROM schema_version
                               ORDER BY applied_at DESC, id DESC")->fetchAll();
} catch (Throwable $e) {
    // Se il registro non c'è ancora non è un guaio: si crea alla prima migrazione.
}

/* Le tre cose che si rompono in silenzio. */
$q = db()->prepare("SELECT COUNT(*) FROM articles WHERE (cover_image IS NULL OR cover_image = '')
                    AND status = 'published'");
$q->execute();
$senzaCopertina = (int)$q->fetchColumn();

$q = db()->prepare("SELECT COUNT(*) FROM articles WHERE (excerpt IS NULL OR excerpt = '')
                    AND status = 'published'");
$q->execute();
$senzaRiassunto = (int)$q->fetchColumn();

$q = db()->prepare("SELECT COUNT(*) FROM articles WHERE (category IS NULL OR category = '')");
$q->execute();
$senzaCategoria = (int)$q->fetchColumn();

$senzaStato = (int)db()->query("SELECT COUNT(*) FROM projects WHERE stato IS NULL OR stato = ''")->fetchColumn();
$coda = tag_usati_una_volta();

$colonneArticoli = [];
try {
    $prima = db()->query("SELECT * FROM articles LIMIT 1")->fetch();
    $colonneArticoli = $prima ? array_keys($prima) : [];
} catch (Throwable $e) {}

testa_pannello('Sistema', 'sistema');
titolo_pannello('Sistema', 'Lo stato delle cose');
avviso_pannello();
?>

<section style="margin-bottom:32px">
  <h2 class="gro" style="font-size:20px;margin-bottom:14px">Dove sta girando</h2>
  <div class="avvolgi">
    <table class="tabella-lavoro">
      <tbody>
        <tr><td style="width:220px" class="spento">Ambiente</td>
            <td><b><?= IN_SVILUPPO ? 'sviluppo (server integrato di PHP)' : 'produzione' ?></b></td></tr>
        <tr><td class="spento">Database</td>
            <td><?= IN_SVILUPPO ? 'SQLite — scratch/sviluppo.sqlite, con dati simulati' : 'MySQL' ?></td></tr>
        <tr><td class="spento">PHP</td><td><?= e(PHP_VERSION) ?></td></tr>
        <tr><td class="spento">Indirizzo del sito</td><td><?= e(base_url()) ?></td></tr>
        <tr><td class="spento">Colonne di <code>articles</code></td>
            <td style="line-height:1.8"><?= e(implode(', ', $colonneArticoli)) ?></td></tr>
      </tbody>
    </table>
  </div>
</section>

<section style="margin-bottom:32px">
  <h2 class="gro" style="font-size:20px;margin-bottom:6px">Migrazioni applicate</h2>
  <p class="aiuto" style="margin-bottom:14px">
    Lo schema si aggiorna da solo alla prima apertura del pannello, e ogni
    passaggio si registra qui. Serve a rispondere alla domanda «l'ho già fatta?»
    guardando il database invece dei nomi dei file.
  </p>
  <div class="avvolgi">
    <table class="tabella-lavoro">
      <thead><tr><th>Migrazione</th><th>Che cosa ha fatto</th><th>Quando</th></tr></thead>
      <tbody>
        <?php foreach ($migrazioni as $m): ?>
          <tr>
            <td><code><?= e($m['migration']) ?></code></td>
            <td class="spento"><?= e((string)$m['note']) ?></td>
            <td class="num"><?= e(data_breve($m['applied_at'])) ?></td>
          </tr>
        <?php endforeach; ?>
        <?php if (!$migrazioni): ?>
          <tr><td colspan="3" style="padding:24px;text-align:center;color:var(--spento)">
            Nessuna migrazione registrata.</td></tr>
        <?php endif; ?>
      </tbody>
    </table>
  </div>
</section>

<section>
  <h2 class="gro" style="font-size:20px;margin-bottom:6px">Cose da sistemare</h2>
  <p class="aiuto" style="margin-bottom:14px">
    Nessuna di queste rompe il sito. Sono le cose che si vedono solo quando
    qualcuno arriva sulla pagina sbagliata, e allora è tardi.
  </p>

  <ul class="controlli">
    <li class="<?= $senzaCopertina ? 'ni' : 'si' ?>">
      <span class="segno"><?= $senzaCopertina ? '△' : '✓' ?></span>
      <div><b>Copertine</b>
        <small><?= $senzaCopertina
          ? $senzaCopertina . ' articoli pubblicati non hanno la copertina: nelle anteprime social e negli elenchi restano un buco.'
          : 'Tutti gli articoli pubblicati hanno una copertina.' ?></small></div>
    </li>
    <li class="<?= $senzaRiassunto ? 'ni' : 'si' ?>">
      <span class="segno"><?= $senzaRiassunto ? '△' : '✓' ?></span>
      <div><b>Riassunti</b>
        <small><?= $senzaRiassunto
          ? $senzaRiassunto . ' articoli pubblicati non hanno il riassunto: su Google la descrizione se la inventa il motore con le prime righe del testo.'
          : 'Tutti gli articoli pubblicati hanno un riassunto.' ?></small></div>
    </li>
    <li class="<?= $senzaCategoria ? 'no' : 'si' ?>">
      <span class="segno"><?= $senzaCategoria ? '✗' : '✓' ?></span>
      <div><b>Categoria</b>
        <small><?= $senzaCategoria
          ? $senzaCategoria . ' articoli non hanno categoria: il loro indirizzo pubblico non esiste e non sono raggiungibili.'
          : 'Ogni articolo ha la sua categoria.' ?></small></div>
    </li>
    <li class="<?= $senzaStato ? 'ni' : 'si' ?>">
      <span class="segno"><?= $senzaStato ? '△' : '✓' ?></span>
      <div><b>Stato dei progetti</b>
        <small><?= $senzaStato
          ? $senzaStato . ' progetti non dichiarano lo stato: sulla scheda pubblica non compare l\'etichetta.'
          : 'Tutti i progetti dichiarano il loro stato.' ?></small></div>
    </li>
    <li class="<?= $coda > 40 ? 'ni' : 'si' ?>">
      <span class="segno"><?= $coda > 40 ? '△' : '✓' ?></span>
      <div><b>Coda dei tag</b>
        <small><?= $coda ?> tag sono usati da un solo articolo.
          <?= $coda > 40 ? 'Vale la pena unire i doppioni dalla schermata Tag.' : '' ?></small></div>
    </li>
  </ul>
</section>

<?php piede_pannello(); ?>

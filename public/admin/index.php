<?php
/**
 * Il cruscotto: che cosa è successo, e che cosa aspetta una risposta.
 *
 * Ha le stesse analitiche del pannello di prima — ritmo delle visite,
 * andamento, articoli più letti e più amati, distribuzione delle reazioni e
 * dei clic, categorie per visite — ma disegnate con dei div invece che con
 * Chart.js. Per delle barre e una spezzata, una libreria da 200 KB pesa più
 * del dato che mostra, e in cambio dà un grafico che non si può leggere se il
 * JavaScript non parte.
 *
 * I numeri in cima che portano da qualche parte sono cliccabili.
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

$n        = numeri_cruscotto();
$ritmo    = ritmo_visite();
$visite   = visite_per_giorno(30);
$letti    = articoli_piu_letti(6);
$amati    = articoli_piu_amati(6);
$reazioni = reazioni_per_tipo();
$clic     = clic_per_etichetta(5);
$sezioni  = categorie_piu_lette(6);
$nuovi    = iscritti_recenti();
$ultimi   = admin_articoli([], 1, 5)['righe'];
$coda     = tag_usati_una_volta();

$massimo = max(1, max($visite));
$ieri    = max(1, $ritmo['ieri']);
$scarto  = (int)round(($ritmo['oggi'] - $ritmo['ieri']) / $ieri * 100);

/** Una barra orizzontale con il suo valore: la usano quattro classifiche. */
function barra(string $etichetta, int $valore, int $massimo, string $dove = ''): void {
    $quota = $massimo > 0 ? max(2, (int)round($valore / $massimo * 100)) : 2;
    ?>
    <li class="riga-barra">
      <?php if ($dove !== ''): ?>
        <a class="riga-barra-nome" href="<?= e($dove) ?>"><?= e($etichetta) ?></a>
      <?php else: ?>
        <span class="riga-barra-nome"><?= e($etichetta) ?></span>
      <?php endif; ?>
      <span class="riga-barra-traccia"><i style="width:<?= $quota ?>%"></i></span>
      <b class="riga-barra-valore"><?= number_format($valore, 0, ',', '.') ?></b>
    </li>
    <?php
}

$nomiReazioni = ['thumb' => 'Utile', 'heart' => 'Bello', 'fire' => 'Interessante',
                 'think' => 'Fa pensare', 'game' => 'Game-related'];

testa_pannello('Cruscotto', 'cruscotto');
titolo_pannello('Cruscotto', 'Come va il sito, e che cosa aspetta te.',
    '<a class="btn btn-pieno" href="/admin/articolo.php">Scrivi un articolo</a>');
avviso_pannello();
?>

<!-- ── Il ritmo ────────────────────────────────────────────────────────── -->
<div class="numeri">
  <div>
    <b><?= number_format($ritmo['oggi'], 0, ',', '.') ?></b>
    <span class="eti">Visite oggi</span>
    <?php if ($ritmo['ieri'] > 0): ?>
      <span class="eti" style="color:<?= $scarto >= 0 ? 'var(--verde)' : '#e8a0a0' ?>">
        <?= $scarto >= 0 ? '+' : '' ?><?= $scarto ?>% su ieri
      </span>
    <?php endif; ?>
  </div>
  <div><b><?= number_format($ritmo['ieri'], 0, ',', '.') ?></b><span class="eti">Ieri</span></div>
  <div><b><?= number_format($ritmo['settimana'], 0, ',', '.') ?></b><span class="eti">Ultimi 7 giorni</span></div>
  <div><b><?= number_format($ritmo['media'], 0, ',', '.') ?></b><span class="eti">Media per articolo</span></div>
  <div><b><?= number_format($n['reazioni'], 0, ',', '.') ?></b><span class="eti">Reazioni</span></div>
  <div><b><?= number_format($ritmo['totali'], 0, ',', '.') ?></b><span class="eti">Visite in tutto</span></div>
</div>

<!-- ── Che cosa aspetta te ─────────────────────────────────────────────── -->
<div class="numeri">
  <a href="/admin/articoli.php?stato=published"><div><b><?= $n['pubblicati'] ?></b><span class="eti">Pubblicati</span></div></a>
  <a href="/admin/articoli.php?stato=draft"><div><b><?= $n['bozze'] ?></b><span class="eti">Bozze</span></div></a>
  <a href="/admin/progetti.php"><div><b><?= $n['progetti'] ?></b><span class="eti">Progetti</span></div></a>
  <a href="/admin/messaggi.php"><div><b><?= $n['messaggi'] ?></b><span class="eti">Da leggere</span></div></a>
  <a href="/admin/newsletter.php"><div><b><?= $n['iscritti'] ?></b><span class="eti">Iscritti</span>
    <?php if ($nuovi > 0): ?><span class="eti" style="color:var(--verde)">+<?= $nuovi ?> in 30 giorni</span><?php endif; ?>
  </div></a>
  <a href="/admin/media.php"><div><b><?= conta_media() ?></b><span class="eti">Immagini</span></div></a>
</div>

<!-- ── L'andamento ─────────────────────────────────────────────────────── -->
<section style="margin-bottom:34px">
  <h2 class="gro" style="font-size:20px;margin-bottom:14px">Andamento degli ultimi trenta giorni</h2>
  <div class="grafico" role="img"
       aria-label="Visite al giorno negli ultimi trenta giorni, da <?= e(data_breve(array_key_first($visite))) ?> a oggi. Massimo <?= $massimo ?>.">
    <?php foreach ($visite as $giorno => $quante): ?>
      <i style="height:<?= max(1, (int)round($quante / $massimo * 100)) ?>%"
         title="<?= e(data_breve($giorno)) ?>: <?= $quante ?> visite"></i>
    <?php endforeach; ?>
  </div>
  <div class="grafico-legenda eti">
    <span><?= e(data_breve(array_key_first($visite))) ?></span>
    <span>massimo <?= number_format($massimo, 0, ',', '.') ?> in un giorno</span>
    <span>oggi</span>
  </div>
</section>

<div class="due-colonne" style="gap:34px">

  <!-- ── I più letti ───────────────────────────────────────────────────── -->
  <section style="margin-bottom:30px">
    <h2 class="gro" style="font-size:20px;margin-bottom:14px">I più letti</h2>
    <ul class="barre">
      <?php $max = max(1, (int)($letti[0]['visite'] ?? 1));
      foreach ($letti as $a) barra($a['title'], (int)$a['visite'], $max,
          '/admin/articolo.php?id=' . (int)$a['id']); ?>
    </ul>
  </section>

  <!-- ── I più amati ───────────────────────────────────────────────────── -->
  <section style="margin-bottom:30px">
    <h2 class="gro" style="font-size:20px;margin-bottom:6px">I più amati</h2>
    <p class="aiuto" style="margin-bottom:14px">Per reazioni ricevute, non per letture:
       dice quali pezzi hanno spinto qualcuno a premere un pulsante.</p>
    <ul class="barre">
      <?php $max = max(1, (int)($amati[0]['reazioni'] ?? 1));
      foreach ($amati as $a) barra($a['title'], (int)$a['reazioni'], $max,
          '/admin/articolo.php?id=' . (int)$a['id']); ?>
      <?php if (!$amati): ?><li class="aiuto">Ancora nessuna reazione.</li><?php endif; ?>
    </ul>
  </section>

  <!-- ── Le sezioni ────────────────────────────────────────────────────── -->
  <section style="margin-bottom:30px">
    <h2 class="gro" style="font-size:20px;margin-bottom:14px">Le sezioni più lette</h2>
    <ul class="barre">
      <?php $max = max(1, (int)($sezioni[0]['visite'] ?? 1));
      foreach ($sezioni as $s) barra($s['category'] . '  (' . (int)$s['articoli'] . ')',
          (int)$s['visite'], $max, '/' . $s['category']); ?>
    </ul>
  </section>

  <!-- ── Le reazioni ───────────────────────────────────────────────────── -->
  <section style="margin-bottom:30px">
    <h2 class="gro" style="font-size:20px;margin-bottom:14px">Quali reazioni</h2>
    <ul class="barre">
      <?php $max = max(1, $reazioni ? max($reazioni) : 1);
      foreach ($reazioni as $chiave => $quante)
          barra($nomiReazioni[$chiave] ?? $chiave, $quante, $max); ?>
      <?php if (!$reazioni): ?><li class="aiuto">Ancora nessuna reazione.</li><?php endif; ?>
    </ul>
  </section>

  <!-- ── I pulsanti dei progetti ───────────────────────────────────────── -->
  <section style="margin-bottom:30px">
    <h2 class="gro" style="font-size:20px;margin-bottom:6px">Quali pulsanti si premono</h2>
    <p class="aiuto" style="margin-bottom:14px">I clic sui due comandi delle schede
       progetto: dice quale invito funziona e quale no.</p>
    <ul class="barre">
      <?php $max = max(1, (int)($clic[0]['quanti'] ?? 1));
      foreach ($clic as $c) barra((string)$c['button_label'], (int)$c['quanti'], $max); ?>
      <?php if (!$clic): ?><li class="aiuto">Ancora nessun clic registrato.</li><?php endif; ?>
    </ul>
  </section>

  <!-- ── Gli ultimi toccati ────────────────────────────────────────────── -->
  <section style="margin-bottom:30px">
    <h2 class="gro" style="font-size:20px;margin-bottom:14px">Ultimi toccati</h2>
    <div class="avvolgi">
      <table class="tabella-lavoro">
        <tbody>
          <?php foreach ($ultimi as $a): ?>
            <tr>
              <td><a class="titolo" href="/admin/articolo.php?id=<?= (int)$a['id'] ?>"><?= e($a['title']) ?></a>
                  <span class="sotto"><?= e(data_breve($a['published_at'] ?: $a['created_at'])) ?></span></td>
              <td><?= stato_articolo($a) ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>

    <?php if ($coda > 40): ?>
      <p class="aiuto" style="margin-top:18px">
        <b><?= $coda ?> tag sono usati da un solo articolo.</b> Un tag che raccoglie una cosa
        sola non raccoglie niente: si sistemano da
        <a href="/admin/tag.php" style="color:var(--verde)">Tag</a>, unendo i doppioni.
      </p>
    <?php endif; ?>
  </section>
</div>

<?php piede_pannello(); ?>

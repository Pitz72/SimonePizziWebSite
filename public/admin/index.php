<?php
/**
 * Il cruscotto: che cosa è successo, e che cosa aspetta una risposta.
 *
 * I numeri in cima non sono decorazione — quelli che contano sono cliccabili e
 * portano dove si agisce. Il grafico è disegnato con dei div: una libreria per
 * trenta barre sarebbe più pesante del dato che mostra.
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

$n       = numeri_cruscotto();
$visite  = visite_per_giorno(30);
$letti   = articoli_piu_letti(8);
$ultimi  = admin_articoli([], 1, 5)['righe'];
$massimo = max(1, max($visite));
$coda    = tag_usati_una_volta();

testa_pannello('Cruscotto', 'cruscotto');
titolo_pannello('Cruscotto', 'Come va il sito, e che cosa aspetta te.',
    '<a class="btn btn-pieno" href="/admin/articolo.php">Scrivi un articolo</a>');
avviso_pannello();
?>

<div class="numeri">
  <a href="/admin/articoli.php?stato=published"><div><b><?= $n['pubblicati'] ?></b><span class="eti">Pubblicati</span></div></a>
  <a href="/admin/articoli.php?stato=draft"><div><b><?= $n['bozze'] ?></b><span class="eti">Bozze</span></div></a>
  <a href="/admin/progetti.php"><div><b><?= $n['progetti'] ?></b><span class="eti">Progetti</span></div></a>
  <a href="/admin/messaggi.php"><div><b><?= $n['messaggi'] ?></b><span class="eti">Da leggere</span></div></a>
  <a href="/admin/newsletter.php"><div><b><?= $n['iscritti'] ?></b><span class="eti">Iscritti</span></div></a>
  <div><b><?= number_format($n['visite'], 0, ',', '.') ?></b><span class="eti">Visite in tutto</span></div>
</div>

<section style="margin-bottom:34px">
  <h2 class="gro" style="font-size:20px;margin-bottom:14px">Visite degli ultimi trenta giorni</h2>
  <div class="grafico" role="img"
       aria-label="Visite al giorno negli ultimi trenta giorni, da <?= e(data_breve(array_key_first($visite))) ?> a oggi">
    <?php foreach ($visite as $giorno => $quante): ?>
      <i style="height:<?= max(1, (int)round($quante / $massimo * 100)) ?>%"
         title="<?= e(data_breve($giorno)) ?>: <?= $quante ?> visite"></i>
    <?php endforeach; ?>
  </div>
  <div class="grafico-legenda eti">
    <span><?= e(data_breve(array_key_first($visite))) ?></span>
    <span>massimo <?= $massimo ?> in un giorno</span>
    <span>oggi</span>
  </div>
</section>

<div class="due-colonne" style="gap:34px">
  <section>
    <h2 class="gro" style="font-size:20px;margin-bottom:14px">I più letti</h2>
    <div class="avvolgi">
      <table class="tabella-lavoro">
        <thead><tr><th>Articolo</th><th class="num">Visite</th></tr></thead>
        <tbody>
          <?php foreach ($letti as $a): ?>
            <tr>
              <td><a class="titolo" href="/admin/articolo.php?id=<?= (int)$a['id'] ?>"><?= e($a['title']) ?></a>
                  <span class="sotto"><?= e($a['category']) ?></span></td>
              <td class="num"><?= number_format((int)$a['visite'], 0, ',', '.') ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </section>

  <section>
    <h2 class="gro" style="font-size:20px;margin-bottom:14px">Ultimi toccati</h2>
    <div class="avvolgi">
      <table class="tabella-lavoro">
        <thead><tr><th>Articolo</th><th>Stato</th></tr></thead>
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
        sola non raccoglie niente: la sua pagina ripete un contenuto che sta già altrove.
        Si sistemano dalla schermata <a href="/admin/tag.php" style="color:var(--verde)">Tag</a>,
        unendo i doppioni.
      </p>
    <?php endif; ?>
  </section>
</div>

<?php piede_pannello(); ?>

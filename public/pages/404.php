<?php
/**
 * Pagina non trovata, con il suo stato HTTP vero: chi la stampa ha già chiamato
 * http_response_code(404). Una pagina che dice «non trovato» rispondendo 200 fa
 * finire nell'indice migliaia di indirizzi che non esistono.
 */
pagina([
    'title'   => 'Pagina non trovata — ' . SITO_NOME,
    'desc'    => 'Questo indirizzo non esiste. Forse è cambiato, forse la pagina è stata tolta.',
    'noindex' => true,
]);
require __DIR__ . '/../partials/head.php';
?>
<main id="contenuto" class="contenuto">
  <div class="gab-stretta">
    <header class="testata">
      <span class="eti spento">Errore 404</span>
      <h1 class="gro" style="margin-top:12px">Questo indirizzo non esiste</h1>
      <p>Può darsi che sia cambiato, o che la pagina sia stata tolta. Da qui si riparte:</p>
    </header>
    <div class="btn-fila" style="margin-top:28px">
      <a class="btn btn-pieno" href="/">Home</a>
      <a class="btn btn-muto" href="/tutti-i-progetti">Tutti i progetti</a>
    </div>
    <div class="pill-fila" style="margin-top:24px">
      <?php foreach (categorie_radice() as $voce_404): ?>
        <a class="pill" href="/<?= e($voce_404['slug']) ?>"><?= e($voce_404['name']) ?></a>
      <?php endforeach; ?>
    </div>
  </div>
</main>
<?php require __DIR__ . '/../partials/footer.php'; ?>

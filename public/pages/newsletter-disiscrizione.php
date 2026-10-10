<?php
/** Esito della disiscrizione. Si saluta senza chiedere spiegazioni. */
/* I link nelle email vecchie arrivano qui con ?token=: la pagina nuova li elabora (con il pulsante,
   perché un GET da solo non disiscrive nessuno). Senza token non c'è niente da fare. */
if (!empty($_GET['token'])) {
    require __DIR__ . '/nl-disiscrizione.php';
    return;
}
require __DIR__ . '/../partials/head.php';
?>
<main id="contenuto" class="contenuto">
  <div class="gab-stretta">
    <header class="testata">
      <span class="eti spento">Disiscrizione</span>
      <h1 class="gro" style="margin-top:12px">Per uscire serve il link della email</h1>
      <p>La disiscrizione si fa dal link in fondo a ogni email della newsletter. Se non lo trovi,
         scrivimi dalla pagina dei contatti e ti tolgo io.</p>
    </header>
    <div class="btn-fila" style="margin-top:28px">
      <a class="btn btn-muto" href="/">Torna alla home</a>
    </div>
  </div>
</main>
<?php require __DIR__ . '/../partials/footer.php'; ?>

<?php
/** Esito del doppio consenso: chi arriva qui ha appena cliccato il link nella email. */
require __DIR__ . '/../partials/head.php';
?>
<main id="contenuto" class="contenuto">
  <div class="gab-stretta">
    <header class="testata">
      <span class="eti" style="color:var(--verde)">Fatto</span>
      <h1 class="gro" style="margin-top:12px">Iscrizione confermata</h1>
      <p>Ci sei. Non c'è una cadenza fissa: la lettera parte quando ho qualcosa da raccontare,
         e in fondo a ognuna c'è il link per uscire in un clic.</p>
    </header>
    <div class="btn-fila" style="margin-top:28px">
      <a class="btn btn-pieno" href="/">Torna alla home</a>
      <a class="btn btn-muto" href="/tutti-i-progetti">Guarda i progetti</a>
    </div>
  </div>
</main>
<?php require __DIR__ . '/../partials/footer.php'; ?>

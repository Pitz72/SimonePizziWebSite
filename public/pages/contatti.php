<?php
/**
 * /contatti
 *
 * Il modulo è un POST normale con redirect dopo l'invio, non una chiamata
 * JavaScript: così funziona anche a chi ha gli script spenti, e chi ricarica
 * la pagina dopo l'invio non rimanda il messaggio una seconda volta.
 * L'invio vero arriva con la sessione delle pagine pubbliche.
 */
require __DIR__ . '/../partials/head.php';
?>

<main id="contenuto" class="contenuto">
  <div class="gab">
    <nav aria-label="Percorso">
      <ol class="briciole eti">
        <li><a href="/">Home</a></li>
        <li><span aria-current="page">Contatti</span></li>
      </ol>
    </nav>

    <header class="testata">
      <h1 class="gro">Contatti</h1>
      <p>Per collaborazioni, domande sui progetti, o per dirmi che qualcosa non funziona —
         quest'ultima è la più utile di tutte.</p>
    </header>

    <form method="post" action="/contatti" style="max-width:640px;margin-top:34px;display:grid;gap:18px">
      <label>
        <span class="eti spento">Nome</span><br>
        <input name="nome" required autocomplete="name"
               style="width:100%;margin-top:8px;padding:13px 14px;background:var(--pannello);
                      border:1px solid var(--filo);color:var(--testo);font:inherit">
      </label>
      <label>
        <span class="eti spento">Email</span><br>
        <input name="email" type="email" required autocomplete="email"
               style="width:100%;margin-top:8px;padding:13px 14px;background:var(--pannello);
                      border:1px solid var(--filo);color:var(--testo);font:inherit">
      </label>
      <label>
        <span class="eti spento">Messaggio</span><br>
        <textarea name="messaggio" rows="7" required
               style="width:100%;margin-top:8px;padding:13px 14px;background:var(--pannello);
                      border:1px solid var(--filo);color:var(--testo);font:inherit"></textarea>
      </label>
      <div><button class="btn btn-pieno" type="submit">Manda il messaggio</button></div>
    </form>
  </div>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

<?php
/**
 * /chi-sono
 *
 * Nel sito React questo testo era una finestra che si apriva dal pulsante
 * «Scopri di più» della home (src/data/aboutMeData.ts). Il taglio del 7
 * settembre non l'ha portato nel sito PHP, e il 16 ottobre il file è uscito
 * dal repository con gli altri residui del React: ritrovato nella storia
 * (git show fb004e4^:src/data/aboutMeData.ts) e rimesso qui il 19 ottobre,
 * come pagina vera, così ha un indirizzo e Google la vede.
 *
 * Il testo è quello originale. È cambiata solo la tipografia: apostrofi
 * curvi, caporali, trattino lungo al posto di quello corto.
 */
require __DIR__ . '/../partials/head.php';
?>

<main id="contenuto" class="contenuto">
  <div class="gab">
    <nav aria-label="Percorso">
      <ol class="briciole eti">
        <li><a href="/">Home</a></li>
        <li><span aria-current="page">Chi sono</span></li>
      </ol>
    </nav>

    <header class="testata">
      <h1 class="gro">Ciao, sono Simone!</h1>
    </header>

    <div class="chi-sono">
      <figure class="chi-sono-ritratto">
        <img src="/SimonePizzi.webp" width="1254" height="1254"
             alt="Simone Pizzi con coppola, occhiali scuri e camicia a quadri, sotto tre fari verdi; in basso la scritta The Man">
      </figure>

      <article class="corpo">
        <p>Ciao e benvenuto in questo angolo speciale del web, dove condivido con te un caleidoscopio di passioni, progetti e sogni che prendono forma attraverso le parole e la tecnologia. Qui troverai il racconto sincero delle mie tantissime idee e dei miei pochissimi talenti — una confessione ironica che nasconde in realtà un mondo ricco di sperimentazioni e curiosità intellettuali.</p>

        <h2>Il Podcasting: La Mia Prima Grande Passione</h2>
        <p>Dal 2010, il podcasting è stata la mia prima finestra sul mondo della comunicazione digitale. Con Runtime Radio e Italian Podcast Network, ho avuto il privilegio di esplorare le infinite possibilità dell’audio narrativo, creando contenuti che spaziano dalla tecnologia alla cultura, dalle interviste alle riflessioni personali.</p>

        <h2>La Scrittura: Quando le Parole Diventano Mondi</h2>
        <p>La narrativa è sempre stata il mio rifugio creativo. Attraverso racconti e romanzi, esploro temi che mi affascinano: la tecnologia, l’umanità, i rapporti interpersonali e le infinite possibilità del futuro. Ogni storia che scrivo è un esperimento, un tentativo di catturare qualcosa di autentico e significativo.</p>

        <h2>Lo Sviluppo Software: Dove Creatività e Logica si Incontrano</h2>
        <p>Il mondo del software development mi ha conquistato per la sua capacità di trasformare idee astratte in strumenti concreti e utili. Dalle utility per la gestione audio ai videogiochi narrativi, ogni progetto rappresenta una sfida tecnica e creativa che mi spinge a crescere e imparare continuamente.</p>

        <h2>L’Intelligenza Artificiale: Il Mio Nuovo Compagno di Viaggio</h2>
        <p>Negli ultimi anni, l’AI è diventata non solo un oggetto di studio, ma un vero e proprio collaboratore creativo. Attraverso progetti come The Safe Place, sto esplorando come l’intelligenza artificiale possa diventare un partner nella creazione di contenuti, aprendo nuove frontiere nella narrativa interattiva e nello sviluppo software.</p>

        <h2>La Filosofia del «Fare Sperimentando»</h2>
        <p>Quello che guida ogni mio progetto è una filosofia semplice ma potente: imparare facendo. Non aspetto di avere tutte le competenze necessarie prima di iniziare; piuttosto, mi lancio nei progetti con curiosità e determinazione, lasciando che sia il processo stesso a insegnarmi quello che devo sapere.</p>
        <p>Questo sito è più di un portfolio: è un diario di bordo delle mie esplorazioni creative e tecnologiche. Qui condivido non solo i risultati finiti, ma anche i processi, gli errori, le scoperte e le riflessioni che accompagnano ogni progetto.</p>
        <p>Ti invito a esplorare le diverse sezioni, a leggere i miei articoli, a provare i software che sviluppo e a giocare ai miei esperimenti videoludici. E se qualcosa ti incuriosisce o vorresti saperne di più, non esitare a <a href="/contatti">contattarmi</a>. Adoro le conversazioni che nascono dalla condivisione di passioni comuni!</p>
      </article>
    </div>
  </div>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

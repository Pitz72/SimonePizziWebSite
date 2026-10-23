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
 * Il 23 ottobre Simone ha approvato la revisione del testo: tolti i
 * pattern da LLM e corretti i fatti contro i suoi articoli (l’IA da giugno
 * 2025, non «negli ultimi anni»; Di Tutto Un Podcast, poi l’IPN, poi
 * Runtime Radio; The Safe Place chiuso a luglio 2026). Le frasi sul tasto
 * REC, i floppy e la scommessa vengono dagli articoli linkati.
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
        <p>Qui trovi il racconto delle mie tantissime idee e dei miei pochissimi talenti.</p>

        <h2>Il podcast, dal 2010</h2>
        <p>Ho premuto REC per la prima volta nel 2010, con Michela De Paola, per <a href="/di-tutto-un-podcast/podcast-tutto-e-nato-da-qui"><em>Di Tutto Un Podcast</em></a>. Nel 2012 è arrivato l’Italian Podcast Network e nel 2017, al suo posto, è nata <a href="/runtime-radio">Runtime Radio</a>, la «radio geek» che va avanti ancora oggi fra tecnologia, cultura, interviste e chiacchiere mie.</p>

        <h2>Scrivere</h2>
        <p>Alcuni dei miei racconti hanno più di trent’anni. Sono sopravvissuti a floppy, cd-rom e computer che oggi nessuno saprebbe più far partire, e a maggio 2026 sono diventati un libro, <a href="/l-albero-dei-racconti"><em>L’Albero dei Racconti</em></a>: storie ironiche, personali, a volte metafisiche, ritoccate quel tanto che basta per renderle leggibili. A marzo era uscito un manuale, <a href="/react-php-the-thin-stack"><em>React + PHP: The Thin Stack</em></a>, scritto per mettere su carta un metodo che fino ad allora stava solo nella mia memoria.</p>

        <h2>Programmi e videogiochi</h2>
        <p>Del software mi piace che un’idea diventi qualcosa che si usa. Ci sono strumenti per l’audio, come <a href="/runtime-live-machine-pro">Runtime Live Machine Pro</a>, e videogiochi narrativi, come <a href="/il-viaggiatore"><em>Il Viaggiatore</em></a> e <a href="/il-mistero-della-santa-maria"><em>Il Mistero della Santa Maria</em></a>; e c’è <a href="/runtime-telegrambot-titan-edition">Titan</a>, che porta i feed RSS su Telegram. Diversi sono open source, e stanno tutti su <a href="https://ecosystem.runtimeradio.com/it/" target="_blank" rel="noopener">Ecosystem</a>.</p>

        <h2>L’intelligenza artificiale</h2>
        <p>A giugno 2025 ho fatto una scommessa: costruire un videogioco vero, giocabile, senza scrivere una riga di codice, affidandomi soltanto a un’intelligenza artificiale. Ne è uscito <a href="/the-safe-place-chronicles-1"><em>The Safe Place Chronicles</em></a>, che a luglio 2026 ho chiuso e <a href="/the-safe-place-chronicles-1/-safe-place-chronicles-buon-viaggio-ultimo">regalato</a> a chi vuole metterci le mani. Lì ho imparato a lavorare con l’IA come con un interlocutore, uno con cui si sbaglia insieme e si ricomincia, e ogni progetto venuto dopo parte da quella palestra.</p>

        <h2>Imparare facendo</h2>
        <p>Non aspetto di avere tutte le competenze prima di cominciare un progetto: comincio, e lascio che sia il lavoro a insegnarmi quello che mi manca.</p>
        <p>Su questo sito scrivo dei progetti mentre li faccio, errori compresi. Gli articoli stanno tutti nell’<a href="/archivio">archivio</a>.</p>
        <p>Se qualcosa ti incuriosisce, o non funziona come dovrebbe, <a href="/contatti">scrivimi</a>.</p>
      </article>
    </div>
  </div>
</main>

<?php require __DIR__ . '/../partials/footer.php'; ?>

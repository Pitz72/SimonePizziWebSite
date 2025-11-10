import { PortfolioItem, Category } from '../types';

export const portfolioData: Record<Category, PortfolioItem[]> = {
  [Category.VIDEOGIOCHI]: [
    {
      id: 1,
      title: 'THE SAFE PLACE CHRONICLES: The Echo of The Journey',
      summary: 'Un\'avventura testuale che omaggia i classici RPG degli anni \'80, creata in simbiosi con l\'IA. Unisce una filosofia "keyboard-only" e un\'interfaccia retrò a meccaniche moderne e una narrazione profonda sul viaggio emotivo del protagonista.',
      description: `
<p>C'è un'eco che mi porto dentro da sempre. È il suono gracchiante dei floppy disk, il bagliore verde dei monitor a fosfori e la magia di mondi interi costruiti con nient'altro che parole. Per chi, come me, è cresciuto negli anni '80, i giochi di ruolo testuali non erano una limitazione tecnica, ma un invito a usare il muscolo più potente di tutti: l'immaginazione.</p>
<p>The Safe Place Chronicles è nato da quell'eco.</p>
<p>All'inizio, era solo un esperimento, una domanda un po' folle: "È possibile, oggi, ricreare quella magia? E se potessi farlo in simbiosi con uno strumento moderno come un'intelligenza artificiale, usandola non come un esecutore, ma come un vero e proprio partner creativo?".</p>
<p>Quello che è iniziato come un prototipo concettuale è diventato, riga di codice dopo riga di codice, un progetto che ha superato ogni mia aspettativa. È diventato un mondo.</p>

<h3>Lo Scopo: Unire il Vecchio e il Nuovo</h3>
<p>Il mio obiettivo non era semplicemente scimmiottare il passato, ma catturarne lo spirito e infonderlo in un'esperienza moderna. Ho costruito "The Safe Place" su una filosofia "keyboard-only" per restituire quella sensazione tattile, quasi rituale, di interagire con un mondo attraverso la tastiera. L'interfaccia, ispirata ai vecchi terminali, è volutamente minimale per lasciare che sia la narrazione a dipingere le scene nella mente del giocatore.</p>
<p>Ma sotto questa pelle retrò, batte un cuore complesso. Un mondo vasto e dinamico con un ciclo giorno/notte e un meteo che influenza realmente la sopravvivenza. Un sistema di progressione profondo con talenti e abilità. Un sistema di crafting che premia l'ingegno. E, soprattutto, una storia.</p>

<h3>Il Sogno: Una Narrazione che Conta</h3>
<p>Più di ogni altra cosa, volevo creare un gioco in cui la storia non fosse uno sfondo, ma il motore di tutto. Il viaggio di Ultimo, il protagonista, non è solo una lotta per il cibo e l'acqua; è un'indagine emotiva sul suo passato, sul rapporto con suo padre e sulla scoperta di una verità terribile e toccante.</p>
<p>Ogni meccanica di gioco è stata progettata per servire questa narrazione. La "Bussola Morale" non è un semplice indicatore di bene/male, ma traccia il conflitto interiore di Ultimo tra la filosofia pragmatica del padre e quella compassionevole della madre, con conseguenze reali sul gameplay. Le "Quest" non sono banali commissioni, ma piccole storie che si intrecciano, che danno un volto e una voce alla desolazione di quel mondo.</p>

<h3>I Traguardi: Un Gioco Completo e Vivo</h3>
<p>Oggi, "The Safe Place Chronicles" è un'esperienza giocabile dall'inizio alla fine. L'Atto I della storia di Ultimo è completo, con oltre 100 eventi unici, decine di subquest, personaggi non giocanti con cui dialogare e commerciare, e un finale che è la diretta conseguenza delle scelte morali del giocatore.</p>
<p>È un progetto che è cresciuto grazie a un'incredibile ondata di supporto da parte di amici e appassionati, persone che hanno creduto in questa visione e che ora sono immortalate all'interno del gioco stesso, come piccole, indelebili tracce di umanità in quel mondo di cenere.</p>

<h3>L'Obiettivo Finale: Un'Eco Condivisa</h3>
<p>Il mio sogno è che "The Safe Place Chronicles" diventi più di un semplice gioco. Spero che sia un'esperienza, un piccolo viaggio in un'altra epoca del gaming, ma con una sensibilità e una profondità narrativa che possano risuonare anche oggi. È la prova che, anche nell'era della grafica fotorealistica, il potere di una storia ben raccontata e dell'immaginazione del giocatore rimane imbattuto.</p>
<p>Questo progetto è la mia lettera d'amore a un modo di giocare che pensavo perduto. E spero, con tutto il cuore, che la sua eco possa raggiungere e appassionare anche voi.</p>
`,
      imageUrl: '/images/tspc-echo.png',
      category: Category.VIDEOGIOCHI,
      tags: ['RPG Testuale', 'Sopravvivenza', 'Narrativa'],
      link: 'https://thesafeplace.runtimeradio.it',
      buttonText: 'ENTRA NEL MONDO DI THE SAFE PLACE',
    },
    {
      id: 2,
      title: 'IL RELITTO SILENTE',
      summary: 'Un\'avventura testuale fantascientifica "scritta a mano" che evoca il fascino dei terminali anni \'80. Esplora una nave stellare alla deriva e svela il mistero di una civiltà perduta.',
      description: `<p>IL RELITTO SILENTE non è solo un progetto; è la mia lettera d'amore a un genere che ha definito la mia passione per la narrazione interattiva. È un'avventura testuale fantascientifica, costruita interamente da zero, che rievoca l'estetica e il fascino dei terminali a fosfori verdi degli anni '80, ma con una sensibilità e un ritmo narrativo moderni.</p>

<h3>L'Esperienza: Un Viaggio nella Solitudine e nella Meraviglia</h3>
<p>Nei panni di un solitario mercante spaziale, ti imbatterai in una colossale e silenziosa nave stellare alla deriva ai margini del sistema solare. Spinto dalla curiosità e dalla speranza di un guadagno inatteso, deciderai di esplorarne i corridoi bui e silenziosi.</p>
<p>Quello che scoprirai, però, non sarà un tesoro, ma un'eredità.</p>
<p>Il gameplay non si basa sulla sopravvivenza, ma sulla curiosità. Non ci sono morti improvvise o vicoli ciechi frustranti. L'unica arma a tua disposizione è il tuo ingegno, incarnato in due comandi fondamentali:</p>
<ul>
<li><strong>ESAMINA:</strong> Per osservare il mondo con i tuoi occhi.</li>
<li><strong>ANALIZZA:</strong> Per svelare i segreti nascosti con il tuo scanner portatile.</li>
</ul>
<p>Sarà solo padroneggiando questa dualità tra vedere e capire che potrai decifrare il linguaggio di una civiltà perduta, risolvere enigmi ambientali e svelare la verità struggente dietro la loro missione finale.</p>

<h3>La Filosofia: Un'Esperienza "Scritta a Mano"</h3>
<p>In un'era di contenuti generati proceduralmente, ho voluto tornare all'artigianato. Ogni testo, ogni enigma e ogni risposta del parser sono stati scritti e programmati a mano per garantire un'esperienza narrativa coerente, curata e ricca di atmosfera. Il motore di gioco, sviluppato appositamente per questo progetto, è progettato per essere flessibile e intelligente, per comprenderti e guidarti, non per combatterti.</p>
<p>L'intera avventura è racchiusa in un "monitor virtuale" a risoluzione fissa che si adatta a qualsiasi schermo, garantendo che l'identità visiva e l'immersione retrò rimangano perfette, proprio come le ricordavo.</p>

<h3>La Tecnologia Dietro il Silenzio</h3>
<p>Questo progetto è stato un viaggio che mi ha permesso di unire la passione per il game design con le competenze di sviluppo front-end. Le tecnologie e le architetture chiave includono:</p>
<ul>
<li><strong>Frontend:</strong> React, TypeScript, Tailwind CSS</li>
<li><strong>Motore di Gioco:</strong> Un'architettura di gioco modulare e personalizzata, con un parser di comandi flessibile basato su espressioni regolari.</li>
<li><strong>Audio:</strong> Un sistema audio procedurale, costruito con la Web Audio API, che genera al volo tutti gli effetti sonori 8-bit, dall'eco dei tasti agli eventi di gioco.</li>
<li><strong>Persistenza:</strong> Un robusto sistema di salvataggio e caricamento basato su file, che ti dà il pieno controllo delle tue partite.</li>
</ul>
<p>IL RELITTO SILENTE è più di un semplice gioco: è un esperimento di archeologia digitale, un tributo ai pionieri delle avventure testuali (con un piccolo omaggio a un maestro italiano del genere) e la dimostrazione che, a volte, le storie più potenti sono quelle che sussurriamo a noi stessi nel buio.</p>
`,
      imageUrl: '/images/relitto-silente.png',
      category: Category.VIDEOGIOCHI,
      tags: ['Avventura Testuale', 'Fantascienza', 'React'],
      link: 'https://simonepizzi.runtimeradio.it/relitto',
      buttonText: 'INIZIA LA TUA AVVENTURA SPAZIALE!',
    },
    {
      id: 12,
      title: 'PixelDebh Official Videogame',
      summary: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      description: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      imageUrl: '/images/pixeldebh.jpg',
      category: Category.VIDEOGIOCHI,
      tags: ['In Sviluppo', 'Official Game'],
      link: '#',
    },
    {
      id: 10,
      title: 'THE SAFE PLACE CHRONICLES: IL RESPIRO TRATTENUTO DEL MONDO',
      summary: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      description: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      imageUrl: '/images/tspc-respiro.png',
      category: Category.VIDEOGIOCHI,
      tags: ['In Sviluppo', 'RPG Testuale', 'Sequel'],
      link: '#',
    },
    {
      id: 11,
      title: 'LEMMONS: Una Fortuna Spenta',
      summary: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      description: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      imageUrl: '/images/lemmons.png',
      category: Category.VIDEOGIOCHI,
      tags: ['In Sviluppo', 'Puzzle', 'Platform'],
      link: '#',
    }
  ],
  [Category.PROGETTI_SOFTWARE]: [
    {
      id: 4,
      title: "Favella 1: Linguaggio di Programmazione in Prosa Italiana per Interactive Fiction",
      summary: "Un linguaggio di programmazione per narrativa interattiva, ispirato a Inform 7 ma progettato per l'italiano, e sviluppato in stretta collaborazione con un'IA come partner di co-progettazione.",
      description: `<h3><strong>Cronaca di un'Avventura nello Sviluppo, con l'IA come Compagna di Viaggio</strong></h3>

<p>Per chi come me è cresciuto tra avventure testuali e narrativa interattiva, c'è un nome che suona quasi magico: <strong>Inform 7</strong>. È un sistema geniale, che ha realizzato il sogno di poter programmare un videogioco semplicemente scrivendo frasi in inglese. <code>The kitchen is a room.</code> — una riga di prosa che diventa codice, un'idea che mi ha sempre affascinato.</p>

<p>Da qui è nata la mia sfida personale. Per anni, nella community italiana, si è parlato di quanto sarebbe bello avere qualcosa del genere, ma basato sulla nostra lingua. Il problema, però, è enorme. Inform 7 non è solo un insieme di comandi in inglese; il suo compilatore è stato costruito per <em>comprendere la grammatica inglese</em> a un livello profondissimo. "Tradurlo" in italiano sarebbe un'impresa quasi impossibile, forse ancora più complessa che creare l'originale, date le peculiarità della nostra lingua (generi, articoli, coniugazioni...).</p>

<p>Così ho scelto un'altra strada. Non una traduzione, ma una <strong>costruzione da zero</strong>. Ho deciso di vedere se, partendo da un foglio bianco, fosse possibile creare un linguaggio di programmazione completamente nuovo, ispirato alla filosofia di Inform 7 ma progettato nativamente per l'italiano.</p>

<p>È così che è nato <strong>FAVELLA 1</strong>.</p>

<h3><strong>Il Partner che Nessuno Aveva Prima: l'IA come Co-Progettista</strong></h3>

<p>Se questa idea poteva sembrare folle fino a qualche anno fa, oggi c'è qualcosa di diverso: abbiamo a disposizione una tecnologia rivoluzionaria. Invece di affrontare questa montagna da solo, ho deciso di sperimentare un processo di sviluppo quasi fantascientifico: ho trasformato un Large Language Model (LLM) nel mio partner di progetto.</p>

<p>In questa avventura, l'IA non è un semplice assistente che scrive codice su richiesta. È il mio <strong>co-pilota strategico</strong>. Ogni sessione di sviluppo è un dialogo continuo in cui:</p>
<ul>
<li>Facciamo brainstorming insieme sull'architettura del sistema.</li>
<li>"Discutiamo" delle migliori espressioni regolari per interpretare la sintassi italiana.</li>
<li>Progettiamo le classi e le strutture dati prima di scrivere una sola riga di codice.</li>
<li>L'IA traduce poi le nostre specifiche in codice Python, che io revisiono, testo e correggo, generando un ciclo di feedback che fa evolvere il progetto a una velocità impensabile.</li>
</ul>
<p>FAVELLA 1 è, a tutti gli effetti, il primo linguaggio di programmazione che conosco nato da una collaborazione così stretta tra una visione umana e un'intelligenza artificiale.</p>

<h3><strong>Cosa Fa FAVELLA 1 Oggi?</strong></h3>

<p>Quello che era iniziato come un esperimento "per vedere cosa succede" è diventato un progetto concreto e funzionante. Al momento, FAVELLA 1 è un sistema in piena evoluzione che comprende:</p>
<ul>
<li>Un <strong>micro-compilatore</strong> in Python che analizza file sorgente con estensione <code>.fav</code>.</li>
<li>Una <strong>grammatica in costante crescita (v0.6)</strong> che permette di definire stanze, oggetti con le loro proprietà (es. <code>la mela è rossa</code>), e regole di interazione personalizzate (<code>Invece di prendere la statua: dire "È troppo pesante."</code>).</li>
<li>Un <strong>motore di gioco interattivo</strong> con un ciclo di gioco (game loop) che gestisce la posizione del giocatore, un inventario e un sistema di azioni standard (come <code>esaminare</code>, <code>prendere</code>, <code>lasciare</code>).</li>
</ul>

<h3><strong>Qual è il Prossimo Passo?</strong></h3>

<p>La strada è ancora lunga, ma le fondamenta sono solide. La prossima grande sfida sarà implementare il movimento tra stanze e arricchire la "Libreria di Azioni Standard", rendendo il mondo di gioco sempre più complesso e reattivo.</p>

<p>Questo progetto è la mia personale esplorazione dei confini dello sviluppo software e della creatività. È un esperimento pratico su come l'IA possa non solo aumentare la nostra produttività, ma diventare un vero e proprio catalizzatore per realizzare idee che, fino a ieri, sembravano destinate a rimanere solo sogni.</p>
`,
      imageUrl: '/images/favella1.png',
      category: Category.PROGETTI_SOFTWARE,
      tags: ['Linguaggio di Programmazione', 'Python', 'IA', 'Parser'],
      link: 'https://github.com/Pitz72/FAVELLA1',
      buttonText: 'VAI AL GITHUB DI FAVELLA 1',
    },
    {
      id: 13,
      title: 'Runtime Advanced Jingle Machine',
      summary: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      description: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      imageUrl: 'https://picsum.photos/seed/app3/800/600',
      category: Category.PROGETTI_SOFTWARE,
      tags: ['In Sviluppo', 'Audio Tool', 'Desktop App'],
      link: '#',
    },
    {
      id: 14,
      title: 'Runtime Podcast Professional ToolKit',
      summary: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      description: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      imageUrl: 'https://picsum.photos/seed/app4/800/600',
      category: Category.PROGETTI_SOFTWARE,
      tags: ['In Sviluppo', 'Podcast', 'Software Suite'],
      link: '#',
    },
    {
      id: 15,
      title: 'Gestore di Duplicati Musicali',
      summary: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      description: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      imageUrl: 'https://picsum.photos/seed/app5/800/600',
      category: Category.PROGETTI_SOFTWARE,
      tags: ['In Sviluppo', 'Utility', 'Musica'],
      link: '#',
    },
    {
      id: 16,
      title: 'Quotidianitiy',
      summary: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      description: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      imageUrl: 'https://picsum.photos/seed/app6/800/600',
      category: Category.PROGETTI_SOFTWARE,
      tags: ['In Sviluppo', 'Produttività'],
      link: '#',
    },
  ],
  [Category.NARRATIVA_E_PUBBLICAZIONI]: [
    {
      id: 17,
      title: 'L\'Albero dei Racconti',
      summary: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      description: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      imageUrl: 'https://picsum.photos/seed/narrative5/800/600',
      category: Category.NARRATIVA_E_PUBBLICAZIONI,
      tags: ['In Sviluppo', 'Raccolta', 'Libro'],
      link: '#',
    },
    {
      id: 18,
      title: 'I Tre Racconti Perduti',
      summary: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      description: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      imageUrl: 'https://picsum.photos/seed/narrative6/800/600',
      category: Category.NARRATIVA_E_PUBBLICAZIONI,
      tags: ['In Sviluppo', 'Antologia', 'Mistero'],
      link: '#',
    },
    {
      id: 19,
      title: 'Echi Prima del Silenzio',
      summary: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      description: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      imageUrl: 'https://picsum.photos/seed/narrative7/800/600',
      category: Category.NARRATIVA_E_PUBBLICAZIONI,
      tags: ['In Sviluppo', 'Romanzo', 'Fantascienza'],
      link: '#',
    },
    {
      id: 20,
      title: 'The Safe Place',
      summary: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      description: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      imageUrl: 'https://picsum.photos/seed/narrative8/800/600',
      category: Category.NARRATIVA_E_PUBBLICAZIONI,
      tags: ['In Sviluppo', 'Libro', 'Spin-off'],
      link: '#',
    },
    {
      id: 21,
      title: 'L\'ultima Estate',
      summary: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      description: 'Prossimamente disponibile. Segui questa pagina per ricevere aggiornamenti.',
      imageUrl: 'https://picsum.photos/seed/narrative9/800/600',
      category: Category.NARRATIVA_E_PUBBLICAZIONI,
      tags: ['In Sviluppo', 'Romanzo', 'Contemporaneo'],
      link: '#',
    },
  ],
};

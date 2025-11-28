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
      isVisible: true,
    },
    {
      id: 2,
      title: 'IL RELITTO SILENTE',
      summary: 'Versione Gold Master (v1.0.1) disponibile per Windows. Un\'avventura testuale fantascientifica completa e definitiva, che omaggia i terminali anni \'80 con un\'esperienza narrativa curata e non punitiva.',
      description: `<p><strong>Versione:</strong> 1.0.1 (Gold Master) | <strong>Stato:</strong> Completo</p>
<p>IL RELITTO SILENTE è la mia lettera d'amore a un genere che ha definito la mia passione per la narrazione interattiva. È un'avventura testuale fantascientifica che rievoca l'estetica dei terminali a fosfori verdi degli anni '80, ma con un cuore moderno.</p>

<h3>Un Omaggio, Non una Sfida Punitiva</h3>
<p>Voglio essere chiaro: questo non è un gioco pensato per frustrare. Dimenticate le avventure testuali punitive di un tempo dove si moriva per un comando sbagliato. <strong>Qui non si muore e non ci sono enigmi impossibili.</strong></p>
<p>È un'esperienza prevalentemente narrativa, breve e curata, progettata per fluire senza intoppi. È un omaggio all'atmosfera e alla magia di digitare comandi in un prompt, godendosi la storia senza la paura del "Game Over".</p>

<h3>Il Viaggio verso la Gold Master</h3>
<p>Raggiungere la versione <strong>1.0.1</strong> è stato un viaggio incredibile. Quello che è iniziato come un esperimento è diventato un prodotto software maturo:</p>
<ul>
<li><strong>Motore Proprietario:</strong> Non ho usato tool esistenti. Ho scritto da zero un <strong>Motore a Oggetti Ibrido</strong> (passando da semplici regex a un sistema Entity-Component) per gestire interazioni complesse come <code>USA X SU Y</code>.</li>
<li><strong>Packaging Desktop:</strong> Grazie a Electron, il gioco ora è un'applicazione desktop nativa per <strong>Windows</strong>. Versioni per Linux e Mac potrebbero arrivare in futuro.</li>
<li><strong>Cura del Dettaglio:</strong> Ogni risposta del parser, ogni descrizione della "lore" e ogni pixel dell'interfaccia (inclusi i font VT323 e le scanlines) è stato calibrato per l'immersione totale.</li>
</ul>

<p>Dalla riscrittura del motore nella v0.4.8 alla rifinitura finale della v1.0.0, ogni passo è stato una lezione di design e architettura software. Il risultato è un piccolo gioiello di archeologia digitale moderna di cui vado immensamente fiero.</p>

<p><em>Inoltre, nel pacchetto "Materiale Extra" troverete una raccolta di contenuti curiosi: video, audio e testi generati durante lo sviluppo, che offrono uno sguardo dietro le quinte di questo progetto.</em></p>
`,
      imageUrl: '/images/relitto-silente-v2.webp',
      category: Category.VIDEOGIOCHI,
      tags: ['Avventura Testuale', 'Fantascienza', 'React'],
      link: 'https://simonepizzi.runtimeradio.it/relitto',
      buttonText: 'INIZIA LA TUA AVVENTURA SPAZIALE!',
      extraLink: '/downloads/MATERIALE-EXTRA.zip',
      extraLinkText: 'MATERIALE EXTRA',
      isVisible: true,
    },
    {
      id: 11,
      title: 'LEMMONS: Una Fortuna Spenta',
      summary: 'Un libro game interattivo noir con atmosfere thriller. Segui Jack Lemmons nel suo ritorno ad Aurinia Marittima per scoprire la verità dietro la morte del padre e i segreti di un passato mai dimenticato.',
      description: `<p>Benvenuti nel mondo di <strong>"LEMMONS: Una Fortuna Spenta"</strong>, un'avventura narrativa con le atmosfere di un thriller noir e la profondità di un dramma psicologico.</p>

<p>Questo progetto è un <strong>libro game interattivo</strong> presentato attraverso le pagine di un libro animato, dove ogni scelta che compirete non solo modificherà il corso degli eventi, ma plasmerà anche la mente e l'anima del suo tormentato protagonista.</p>

<h3>Sinossi: Un Ritorno tra i Fantasmi</h3>
<p>Dopo un esilio autoimposto durato dieci anni, <strong>Jack Lemmons</strong> è costretto a tornare nel piccolo e claustrofobico borgo di pescatori di <strong>Aurinia Marittima</strong>. La ragione ufficiale è semplice: sistemare l'eredità del padre Joseph, deceduto in circostanze poco chiare. Ma per Jack, tornare a casa significa riaprire una ferita mai guarita.</p>

<p>Quel luogo è legato per sempre alla tragica scomparsa del suo primo, grande amore, <strong>Lisa</strong>, e a un evento traumatico conosciuto solo come "la tragedia di Punta Ovest", un segreto che l'intera comunità sembra voler tenere sepolto.</p>

<p>Quello che inizia come un semplice dovere burocratico si trasforma rapidamente in una complessa e pericolosa indagine. Jack scopre che la morte del padre non è stata un semplice incidente e che la sua ossessione per il passato nascondeva una verità molto più grande. In un paese dove ogni volto nasconde un segreto e ogni silenzio è un'accusa, Jack dovrà affrontare i propri demoni per scoprire cosa si cela dietro la fortuna spenta della famiglia Lemmons.</p>

<h3>Come si Gioca: Le Vostre Scelte, la Sua Storia</h3>
<p>L'esperienza di "LEMMONS" si svolge attraverso le pagine di un libro animato. Sarete voi a guidare Jack, leggendo i suoi pensieri e decidendo le sue azioni.</p>

<ul>
<li><strong>Narrazione a Bivi:</strong> Ogni scelta di dialogo o di azione può aprire nuovi percorsi narrativi, svelare indizi cruciali o compromettere per sempre i rapporti con gli altri personaggi.</li>
<li><strong>Stato Psicologico:</strong> Jack non è un eroe invincibile. Il suo stato psicologico, in particolare lo stress e l'astinenza da nicotina, è una meccanica di gioco fondamentale. Un livello di stress troppo alto può annebbiare il suo giudizio, impedirgli di notare dettagli importanti e persino forzarlo a compiere scelte impulsive di cui potreste pentirvi.</li>
<li><strong>Indagine e Scoperta:</strong> Vestirete i panni di un detective. Dovrete esplorare ambienti carichi di atmosfera, raccogliere oggetti, risolvere enigmi e interrogare i diffidenti abitanti di Aurinia Marittima per mettere insieme i pezzi del puzzle.</li>
<li><strong>Codex e Inventario:</strong> Per aiutarvi nell'indagine, avrete a disposizione un inventario interattivo per esaminare gli oggetti raccolti e un Codex (un diario di gioco) che si aggiornerà dinamicamente con ogni nuova scoperta su personaggi, luoghi ed eventi.</li>
</ul>

<h3>Stato dello Sviluppo: Un Prototipo Narrativo Completo</h3>
<p><strong>LEMMONS</strong> è attualmente in <strong>fase di presentazione</strong> come prototipo avanzato. L'intera narrazione della Prima Stagione è completa e giocabile dall'inizio alla fine, permettendovi di vivere la storia di Jack in tutte le sue sfumature.</p>

<p>Tuttavia, il gioco è ancora in una <strong>fase embrionale di sviluppo</strong> per quanto riguarda le funzionalità tecniche. L'esperienza attuale è focalizzata al 100% sulla narrazione e sulle meccaniche di scelta, mentre molte caratteristiche tecniche sono ancora in fase di progettazione.</p>

<p><strong>Prossimi Sviluppi:</strong> La roadmap futura include l'implementazione di un sistema audio completo (musica d'atmosfera, effetti sonori e doppiaggio), un sistema di salvataggio e caricamento delle partite, e un'ulteriore rifinitura dell'interfaccia utente per un'integrazione ancora più profonda delle meccaniche di gioco.</p>

<p>Grazie per il vostro interesse in "LEMMONS: Una Fortuna Spenta". Seguite questa pagina per rimanere aggiornati sull'evoluzione del progetto mentre trasformiamo questa storia in un'esperienza indimenticabile.</p>
`,
      imageUrl: '/images/lemmons.png',
      category: Category.VIDEOGIOCHI,
      tags: ['Libro Game', 'Thriller Noir', 'Narrativa Interattiva'],
      link: '#',
      isVisible: true,
    },
    {
      id: 12,
      title: 'PixelDebh: Retro-Rescue!',
      summary: 'Un platform arcade in stile anni \'80/\'90 creato come omaggio a PixelDebh e alla sua community. Un\'avventura retro sviluppata in collaborazione con l\'IA, con grafica pixel-perfect e audio chiptune procedurale.',
      description: `<h3>Un Omaggio a una Community Speciale</h3>
<p><strong>PixelDebh</strong> è una giovane donna appassionata di videogiochi, avventure grafiche e retrogaming. Ha un canale YouTube che, sebbene non faccia ancora i numeri dei grandi influencer, ha avuto la forza e la capacità di creare una <strong>community molto attiva, appassionata e affezionata</strong>.</p>

<p>Per rendere omaggio a tutta questa coesione e senso di appartenenza, abbiamo pensato di celebrare il suo canale e Debh stessa con questo videogioco in stile arcade anni '80/'90. Non sarà un gioco lunghissimo, forse non rappresenterà un esempio di level design di alto livello, ma era la prima volta che mi cimentavo con un concetto di gioco che non fa parte della mia esperienza abituale.</p>

<p>Il resto... sapete come procedo ormai: <strong>prototipazione veloce in cooperazione con LLM</strong>.</p>

<h3>Un Progetto Speciale: Creatività Umana, Realizzazione AI</h3>
<p>Lo sviluppo di "PixelDebh: Retro-Rescue!" nasce da una partnership simbiotica:</p>

<ul>
<li><strong>La Visione Umana:</strong> Il game designer fornisce l'idea, la direzione creativa, le meccaniche di gioco e il "cuore" del progetto. È la scintilla creativa che definisce l'esperienza, l'atmosfera e il divertimento.</li>
<li><strong>L'Esecuzione AI:</strong> L'LLM agisce come programmatore, artista e sound designer instancabile, traducendo la visione in codice funzionante, generando asset grafici in pixel art e componendo musica ed effetti sonori chiptune.</li>
</ul>

<p>Questo processo di "sviluppo conversazionale" ci ha permesso di sperimentare e rifinire le idee in tempo reale, con un'iterazione e una prototipazione a una velocità senza precedenti.</p>

<h3>Il Mondo di PixelDebh: Un Tuffo nel Passato</h3>

<p><strong>Grafica Pixel-Perfect:</strong> Ogni elemento visivo è progettato per essere fedele all'era d'oro dei 16-bit. Utilizziamo un font pixelato (Press Start 2P) e regole specifiche per disattivare l'anti-aliasing del browser, garantendo che ogni singolo pixel sia netto e preciso.</p>

<p><strong>Sonoro Chiptune Autentico:</strong> L'intero sound design è generato proceduralmente attraverso la Web Audio API. Ogni salto, colpo, power-up e musica sono sintetizzati in tempo reale dal codice, garantendo un'esperienza sonora chiptune coerente e nostalgica.</p>

<p><strong>Livelli Dinamici:</strong> Ogni livello è un mondo espanso che si estende in orizzontale. Una telecamera dinamica segue fluidamente le avventure di PixelDebh, mentre sfondi parallasse a più strati creano un'illusione di profondità.</p>

<h3>Gameplay: La Meccanica "Cattura e Lancia"</h3>

<p>Il cuore del gioco è l'abilità unica di PixelDebh: <strong>catturare i nemici e usarli come proiettili!</strong> Avvicinatevi a un avversario, catturatelo e lanciatelo contro gli altri per sbaragliare le file nemiche.</p>

<p><strong>Bestiario Vario:</strong></p>
<ul>
<li><strong>Globby:</strong> Il nemico base, prevedibile ma tenace</li>
<li><strong>Hoppy:</strong> Un nemico saltellante dal movimento imprevedibile</li>
<li><strong>Flappy:</strong> Un nemico volante che pattuglia i cieli</li>
</ul>

<p><strong>Power-Up Strategici:</strong></p>
<ul>
<li><strong>Scudo:</strong> Protezione da un colpo nemico</li>
<li><strong>Speed-Boost:</strong> Aumento drastico della velocità</li>
<li><strong>Super-Throw:</strong> Trasforma il prossimo nemico lanciato in una bomba esplosiva</li>
</ul>

<h3>L'Epica Battaglia contro il Boss: Il Cyclops Frog</h3>
<p>Al termine del Livello 4, vi attende il <strong>Cyclops Frog</strong>. Fluttua nell'arena con movimenti imprevedibili e vi bersaglia con CD-ROM rotanti. Per sconfiggerlo, dovrete abbandonare la meccanica di cattura e affidarvi a un potente sparo energetico!</p>

<h3>Stato di Sviluppo: In Arrivo Prossimamente</h3>
<p>Il gioco è attualmente in <strong>fase di sviluppo avanzato</strong>. Stiamo lavorando per perfezionare l'esperienza e aggiungere contenuti. Seguite questa pagina per rimanere aggiornati sul rilascio!</p>

<p><strong>Roadmap Futura:</strong></p>
<ul>
<li>Nuovi livelli più complessi e pieni di segreti</li>
<li>Nuove tipologie di nemici e ostacoli ambientali</li>
<li>Altre epiche battaglie contro boss unici</li>
<li>Una trama che si dipanerà attraverso i livelli</li>
</ul>

<p>Grazie per l'interesse in "PixelDebh: Retro-Rescue!". Speriamo che l'entusiasmo e la passione che stiamo mettendo in questo progetto possano trasparire in ogni pixel e in ogni nota chiptune.</p>
`,
      imageUrl: '/images/pixeldebh.jpg',
      category: Category.VIDEOGIOCHI,
      tags: ['Platform Arcade', 'Retro Gaming', 'Pixel Art'],
      link: '#',
      isVisible: true,
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
      isVisible: true,
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
  [Category.PODCAST_AUDIO_ALTRO]: [
    {
      id: 22,
      title: 'PODCAST: Tutto è nato da qui',
      summary: 'La storia di come un esperimento casalingo è diventato una "Radio Geek" ascoltata in tutta Italia. Due voci, una vita: la storia di Simone e Michela.',
      description: `
        <h2 class="text-3xl font-bold text-white mb-4">Due Voci, Una Vita: La Storia di Simone e Michela</h2>
        
        <h3 class="text-xl text-green-400 mb-2">Prologo: Quando l'Audio era Artigianato</h3>
        <p>Se chiudo gli occhi e torno al 2010, non vedo gli smartphone luccicanti o le icone verdi di Spotify che oggi diamo per scontate. Vedo un mondo digitale che assomigliava più al Far West: frammentato, lento, ma incredibilmente libero. In quel mondo, ascoltare una voce che non fosse quella della radio FM richiedeva impegno, quasi una vocazione. Bisognava cercare i feed RSS, scaricare file MP3, sincronizzare lettori fisici. Era "artigianato digitale" puro.</p>
        <p>È in questo scenario pionieristico, tra cavi intrecciati e microfoni da pochi euro, che io, Simone Pizzi, e mia moglie, Michela De Paola, abbiamo deciso di premere per la prima volta il tasto REC. Non sapevamo ancora che quel gesto avrebbe definito i successivi quindici anni della nostra vita. Non sapevamo che stavamo iniziando a scrivere non solo la nostra storia, ma un pezzo della storia del podcasting indipendente italiano.</p>
        <p>Questa è la cronaca di come un esperimento casalingo è diventato una "Radio Geek" ascoltata in tutta Italia. Ma soprattutto, è la storia di come due voci hanno imparato a raccontare il mondo insieme.</p>

        <h3 class="text-xl text-green-400 mt-8 mb-2">Capitolo 1: Il Brodo Primordiale (2010–2012)</h3>
        <h4 class="text-lg text-white font-semibold mb-2">Di Tutto Un Podcast: La Scoperta della Chimica</h4>
        <p>Il nostro inizio ha un nome che oggi suona quasi naif: <a href="https://dituttumpodcast.wordpress.com/" target="_blank" rel="noopener noreferrer" class="text-green-400 hover:underline">Di Tutto Un Podcast</a> (DTUP). Il titolo era una dichiarazione d'intenti, forse un po' ribelle: rifiutavamo le etichette. Volevamo parlare di tutto, mossi solo dalla nostra curiosità.</p>
        <p>Il nostro quartier generale era un semplice blog su WordPress, ma la nostra ambizione non aveva confini. In quegli anni formativi abbiamo imparato il mestiere sul campo. Non eravamo solo conduttori; eravamo reporter. Ricordo con orgoglio le nostre incursioni al Festival del Giornalismo di Perugia, dove, armati di registratori e faccia tosta, intervistavamo figure di spicco, o la nostra partecipazione a eventi culturali come "Un paese e cento storie".</p>
        <p>Fu in quel periodo che scoprimmo la nostra "chimica", quell'alchimia invisibile che ancora oggi è il motore di tutto ciò che facciamo. Michela si rivelò subito la voce empatica, il "cuore" narrativo capace di connettersi con chiunque, mentre io iniziavo a definire quel ruolo ibrido che sarebbe diventato la mia firma: non un regista silenzioso dietro il vetro, ma una presenza attiva, una "regia invadente" fatta di stacchi, effetti sonori e interruzioni ritmiche. Stavamo costruendo, senza saperlo, i nostri personaggi radiofonici.</p>

        <div class="my-8">
          <img src="/images/ipn-istituzionale.jpg" alt="IPN Istituzionale" class="w-full rounded-lg shadow-lg border border-white/10" />
        </div>

        <h3 class="text-xl text-green-400 mt-8 mb-2">Capitolo 2: Costruire un Mondo (2012–2017)</h3>
        <h4 class="text-lg text-white font-semibold mb-2">L'Era dell'Italian Podcast Network</h4>
        <p>Ben presto, la passione non bastò più. Sentivamo il bisogno di costruire qualcosa di più grande, una struttura che potesse ospitare non solo le nostre voci, ma quelle di altri appassionati come noi. Nel 2012 fondammo l'Italian Podcast Network (IPN).</p>
        <p>Non era più solo un blog personale. Era un collettivo. Ci alleammo con la storica community di OldGamesItalia, trovando una casa naturale tra appassionati di tecnologia, videogiochi e cultura "nerd". In quegli anni, il nostro salotto virtuale si affollò di compagni di viaggio straordinari come Peppe "Professor Jones" Scaletta e Roberto "Marcus Brody" Bertoni.</p>
        
        <h4 class="text-lg text-white font-semibold mt-4 mb-2">Il Capolavoro: Archeologia Videoludica</h4>
        <p>Il simbolo di questa era fu senza dubbio Archeologia Videoludica. Lì, il gioco si fece serio. Trasformammo le chiacchiere tra amici in veri e propri documentari audio. Ricordo la puntata sulla storia dell'Apple II come un momento epico: non stavamo solo elencando specifiche tecniche, stavamo raccontando una saga, sfidando "quel tipo lassù nella stanza dei bottoni". Avevamo capito che la tecnologia poteva essere narrata con lo stesso pathos di un romanzo.</p>
        <p>L'IPN ci insegnò il valore della community. I nostri ascoltatori non erano numeri; erano nomi, nickname, persone che discutevano con noi sui forum fino a notte fonda. Eravamo una tribù.</p>
        <p>Ma nel 2017, qualcosa doveva cambiare. L'etichetta di "network" iniziava a starci stretta. Sentivamo il bisogno di una metamorfosi. Chiudemmo IPN non per smettere, ma per rinascere.</p>

        <h3 class="text-xl text-green-400 mt-8 mb-2">Capitolo 3: La Fenice (2017–Oggi)</h3>
        <h4 class="text-lg text-white font-semibold mb-2">Runtime Radio: La Radio Geek</h4>
        <p>Dalle ceneri di IPN nacque <a href="https://www.runtimeradio.com/" target="_blank" rel="noopener noreferrer" class="text-green-400 hover:underline">Runtime Radio</a>. Questa volta, il salto fu quantico. Abbandonammo la logica del solo download per abbracciare il flusso continuo dello streaming. Non eravamo più solo podcaster; eravamo una vera emittente digitale, "La Radio Geek", dotata di un'app proprietaria (sviluppata dal genio di Alessandro Raccuglia) che ci permetteva di essere nelle tasche dei nostri ascoltatori 24 ore su 24.</p>
        <p>In questa nuova casa, più matura e professionale, i nostri progetti hanno raggiunto la loro forma definitiva. È qui che il nostro ecosistema si è completato.</p>

        <h4 class="text-lg text-white font-semibold mt-4 mb-2">I Pilastri del Nostro Palinsesto</h4>
        <ul class="list-disc pl-5 space-y-2 text-gray-300">
          <li><strong>Archeologia Informatica:</strong> L'eredità culturale del passato si è evoluta. Sotto la direzione del monumentale Carlo Santagostino (con me sempre in produzione), questo show è diventato un'istituzione. Celebrare i suoi 10 anni è stato celebrare la storia stessa dell'informatica in Italia.</li>
          <li><strong>EveryTHINK:</strong> Se cercate l'anima di quel primo Di Tutto Un Podcast, la troverete qui. EveryTHINK è il mio e di Michela spazio sacro. È dove io e lei (spesso con Carlo) continuiamo a guardare il mondo – dalla Brexit all'Eurovision, dalle pandemie alle frivolezze – con i nostri occhi, unendo la mia regia frenetica alla voce rassicurante di Michela. È la prova che, nonostante tutto, siamo rimasti noi.</li>
          <li><strong>Morti di Bestemmie (MDB):</strong> La nostra valvola di sfogo. Insieme ad Alex Raccuglia e Marco Gualdi, abbiamo creato uno spazio di libertà assoluta, politicamente scorretto, satirico e feroce. È il luogo dove ridiamo per non piangere, dove analizziamo la società (e le serie TV, e i guru del marketing) senza filtri.</li>
          <li><strong>DataKnightmare:</strong> Grazie a Walter Vannini, abbiamo dato spazio alla coscienza critica. In un mondo ubriaco di dati, Walter ci ricorda che "l'algoritmico è politico", portando avanti battaglie etiche fondamentali sulla privacy e sui diritti digitali.</li>
          <li><strong>Runtime by Night:</strong> Quando cala la notte, si accende la "Talk Radio". Tra un "Nano Banana" e l'altro, questo è il cuore pulsante della nostra community. È il momento in cui le difese si abbassano e, attraverso Telegram e la diretta, siamo davvero tutti nella stessa stanza.</li>
        </ul>

        <h3 class="text-xl text-green-400 mt-8 mb-2">Capitolo 4: Il Futuro è Già Qui</h3>
        <h4 class="text-lg text-white font-semibold mb-2">L'Intelligenza Artificiale e Nuove Sfide</h4>
        <p>Dopo 15 anni, si potrebbe pensare di aver visto tutto. E invece, la nostra curiosità è ancora affamata. L'ultima frontiera che abbiamo deciso di esplorare è l'Intelligenza Artificiale Generativa.</p>
        <p>Con il Festival della Canzone Artificiale, abbiamo chiuso un cerchio perfetto. Io all'ideazione, Michela alla conduzione live: i ruoli sono gli stessi di sempre, ma lo strumento è futuristico. Utilizziamo l'AI non per sostituire l'umano, ma per sfidarlo, per creare nuove forme di spettacolo e goliardia. È la dimostrazione che Runtime Radio non si limita a raccontare il futuro; ci gioca.</p>

        <h3 class="text-xl text-green-400 mt-8 mb-2">Epilogo: Una Perfetta Continuità</h3>
        <p>Se guardo indietro a quel 2010, vedo tante cose cambiate. La tecnologia è irriconoscibile, le piattaforme sono nate e morte, il mondo stesso è diverso. Ma c'è un filo rosso che non si è mai spezzato.</p>
        <p>È la continuità.</p>
        <p>Nonostante i cambi di nome, da Di Tutto Un Podcast a Runtime Radio, noi siamo rimasti fedeli a noi stessi. La voce di Michela che accoglie e racconta, la mia regia che costruisce mondi sonori, la nostra voglia di "fare cose" insieme. Questa non è solo la storia di un progetto editoriale o di un'azienda. È la storia di due persone che hanno scelto di condividere la propria voce con il mondo, e che nel farlo hanno costruito una famiglia allargata di migliaia di persone.</p>
        <p class="font-bold text-white mt-4">Benvenuti nella nostra storia. Benvenuti su Runtime.</p>
      `,
      imageUrl: '/images/podcast-cover.jpg',
      category: Category.PODCAST_AUDIO_ALTRO,
      tags: ['Podcast', 'Storia', 'Radio'],
      link: 'https://www.runtimeradio.com/',
      buttonText: 'ASCOLTA RUNTIME RADIO',
      isVisible: true,
    },
  ],
};

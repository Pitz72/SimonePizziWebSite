import React from 'react';
import ArticleCard from '../components/ui/ArticleCard';
import './About.css';

// In un'app reale, questi dati potrebbero venire da un file JSON o da un'API
const articles = [
  {
    id: 1,
    imageUrl: '/assets/01viaggiatore.png',
    imageAlt: "Il Viaggiatore - Sviluppo con IA",
    title: "Come ho provato a far scrivere un videogioco a un'IA (e cosa ho imparato)",
    date: "2025-07-01",
    readTime: 9,
    preview: "Il viaggio di sviluppo di The Safe Place con Gemini: dall'idea di ricrecare un gioco d'infanzia usando l'IA come collaboratore, alle sfide, frustrazioni e lezioni apprese in questo esperimento di programmazione con LLM...",
    link: "/chi-sono/articoli/sviluppo-videogioco-ia.html"
  },
  {
    id: 2,
    imageUrl: '/assets/TSP.jpg',
    imageAlt: "The Safe Place The Balanced World",
    title: "The Safe Place v0.2.0 \"The Balanced World\" – Riprogettazione Totale in Godot",
    date: "2025-06-28",
    readTime: 6,
    preview: "È con grande entusiasmo che annuncio il raggiungimento della Milestone 2 di The Safe Place v0.2.0 \"The Balanced World\"! Dopo una riprogettazione totale da zero in Godot, il progetto è evoluto a vero GDR post-apocalittico con estetica CRT anni '80...",
    link: "/chi-sono/articoli/the-safe-place-v100.html"
  },
  {
    id: 3,
    imageUrl: '/assets/lemmons.jpg',
    imageAlt: "Lemmons Una Fortuna Spenta - Videogioco italiano",
    title: "Lemmons: Una Fortuna Spenta - Dall'Idea alla Realizzazione Tecnica",
    date: "2025-06-23",
    readTime: 8,
    preview: "Un viaggio nello sviluppo di un'interactive fiction italiana: dall'esperimento su Inkle Writer ai limiti tecnici di Ink, fino alla riprogettazione totale verso piattaforme più evolute come Yarn Spinner e Godot...",
    link: "/chi-sono/articoli/lemmons-fortuna-spenta.html"
  },
  {
    id: 4,
    imageUrl: '/assets/gdm.png',
    imageAlt: "Apertura Sezioni Videogiochi e Software",
    title: "Aperte le Sezioni Videogiochi e Software: Nuovi Orizzonti Creativi",
    date: "2025-06-20",
    readTime: 4,
    preview: "È con grande entusiasmo che annuncio l'apertura ufficiale di due nuove sezioni fondamentali del sito: Videogiochi e Software. Attualmente è disponibile \"Il Respiro Trattenuto del Mondo\", mentre altri progetti sono in arrivo...",
    link: "/chi-sono/articoli/apertura-sezioni-sito.html"
  },
  {
    id: 5,
    imageUrl: '/assets/icona-respiro.jpg',
    imageAlt: "Il Respiro Trattenuto del Mondo - Videogioco Desktop",
    title: "Il Respiro Trattenuto del Mondo v1.5 - Primo Videogioco Desktop Completato",
    date: "2025-06-15",
    readTime: 7,
    preview: "Un progetto che segna una tappa importante nel mio percorso di sviluppo. La versione 1.5, il mio primo videogioco desktop completo che unisce narrativa letteraria, tecnologie moderne e opzioni di accessibilità...",
    link: "/chi-sono/articoli/il-respiro-trattenuto-del-mondo.html"
  },
  {
    id: 6,
    imageUrl: '/assets/corridor2021_open.png',
    imageAlt: "Corridor 2193 The Last Run - Avventura testuale sci-fi",
    title: "CORRIDOR 2193: The Last Run - Storia e Struttura Interattiva Complete al 100%",
    date: "2025-05-20",
    readTime: 6,
    preview: "Dopo mesi di sviluppo intenso, sono orgoglioso di annunciare il completamento di \"Corridor 2193: The Last Run\", un'avventura testuale interattiva dark sci-fi che omaggia i classici come Doom e Quake...",
    link: "/chi-sono/articoli/corridor-2193-the-last-run.html"
  }
];

const About = () => {
  return (
    <>
      <header className="page-hero">
        <div className="container section-column">
          <h1>Il Mio Percorso</h1>
          <p className="tagline">Riflessioni, aggiornamenti e storie dal mio mondo creativo e tecnico.</p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <article className="article-content">
            <h2>Ciao, sono Simone! Il mio viaggio attraverso i media</h2>
            <p>
              Ciao e benvenuto in questo angolo speciale del web, dove condivido con te un caleidoscopio di passioni, 
              progetti e sogni che prendono forma attraverso le parole e la tecnologia. Qui troverai il racconto sincero 
              delle mie <strong>tantissime idee</strong> e dei miei <strong>pochissimi talenti</strong> – una confessione 
              ironica che nasconde in realtà un mondo ricco di sperimentazioni e curiosità intellettuali.
            </p>

            <h3>Il Podcasting: La Mia Prima Grande Passione</h3>
            <p>
              Dal 2010, il podcasting è stata la mia prima finestra sul mondo della comunicazione digitale. Con 
              <strong>Runtime Radio</strong> e <strong>Italian Podcast Network</strong>, ho avuto il privilegio di 
              esplorare le infinite possibilità dell'audio narrativo, creando contenuti che spaziano dalla tecnologia 
              alla cultura, dalle interviste alle riflessioni personali.
            </p>

            <h3>La Scrittura: Quando le Parole Diventano Mondi</h3>
            <p>
              La narrativa è sempre stata il mio rifugio creativo. Attraverso racconti e romanzi, esploro temi che 
              mi affascinano: la tecnologia, l'umanità, i rapporti interpersonali e le infinite possibilità del futuro. 
              Ogni storia che scrivo è un esperimento, un tentativo di catturare qualcosa di autentico e significativo.
            </p>

            <h3>Lo Sviluppo Software: Dove Creatività e Logica si Incontrano</h3>
            <p>
              Il mondo del software development mi ha conquistato per la sua capacità di trasformare idee astratte in 
              strumenti concreti e utili. Dalle utility per la gestione audio ai videogiochi narrativi, ogni progetto 
              rappresenta una sfida tecnica e creativa che mi spinge a crescere e imparare continuamente.
            </p>

            <h3>L'Intelligenza Artificiale: Il Mio Nuovo Compagno di Viaggio</h3>
            <p>
              Negli ultimi anni, l'AI è diventata non solo un oggetto di studio, ma un vero e proprio collaboratore 
              creativo. Attraverso progetti come <strong>The Safe Place</strong>, sto esplorando come l'intelligenza 
              artificiale possa diventare un partner nella creazione di contenuti, aprendo nuove frontiere nella 
              narrativa interattiva e nello sviluppo software.
            </p>

            <div className="highlight-box">
              <h3>La Filosofia del "Fare Sperimentando"</h3>
              <p>
                Quello che guida ogni mio progetto è una filosofia semplice ma potente: <em>imparare facendo</em>. 
                Non aspetto di avere tutte le competenze necessarie prima di iniziare; piuttosto, mi lancio nei 
                progetti con curiosità e determinazione, lasciando che sia il processo stesso a insegnarmi quello 
                che devo sapere.
              </p>
            </div>

            <p>
              Questo sito è più di un portfolio: è un diario di bordo delle mie esplorazioni creative e tecnologiche. 
              Qui condivido non solo i risultati finiti, ma anche i processi, gli errori, le scoperte e le riflessioni 
              che accompagnano ogni progetto.
            </p>

            <p>
              Ti invito a esplorare le diverse sezioni, a leggere i miei articoli, a provare i software che sviluppo 
              e a giocare ai miei esperimenti videoludici. E se qualcosa ti incuriosisce o vorresti saperne di più, 
              non esitare a <a href="/contatti">contattarmi</a>. Adoro le conversazioni che nascono dalla condivisione 
              di passioni comuni!
            </p>
          </article>
        </div>
      </section>

      <section className="blog-section alt-bg">
        <div className="container">
          <h2 className="blog-title">Approfondimenti e Aggiornamenti</h2>
          <p className="blog-subtitle">Riflessioni su tecnologia, design e innovazione dal mio percorso di sviluppo</p>
          
          <div className="articles-grid">
            {articles.map(article => (
              <ArticleCard
                key={article.id}
                imageUrl={article.imageUrl}
                imageAlt={article.imageAlt}
                title={article.title}
                date={article.date}
                readTime={article.readTime}
                preview={article.preview}
                link={article.link}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default About;

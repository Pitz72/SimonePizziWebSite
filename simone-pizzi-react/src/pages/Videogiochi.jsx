import React from 'react';
import { Download, ExternalLink, Play, Calendar } from 'lucide-react';
import './Videogiochi.css';

const Videogiochi = () => {
  const games = [
    {
      id: 1,
      title: "Il Respiro Trattenuto del Mondo",
      image: "/assets/icona-respiro.jpg",
      description: "Una piccola avventura interattiva a scelte con opzioni grafiche standard, CRT e alto contrasto per accessibilità. Ispirata al romanzo \"Echi Prima del Silenzio\", prequel di The Safe Place.",
      status: "available",
      version: "v1.5",
      releaseDate: "Giugno 2025",
      platforms: ["Windows", "Android"],
      features: [
        "Narrativa interattiva a scelte",
        "3 modalità grafiche (Standard, CRT, Alto Contrasto)",
        "Accessibilità per ipovedenti",
        "Soundtrack originale",
        "Storia collegata a \"The Safe Place\""
      ],
      downloads: [
        { platform: "Windows", url: "/downloads/videogame/respiro/IL-RESPIRO-TRATTENUTO-DEL-MONDO-win.7z", size: "45 MB" },
        { platform: "Android", url: "/downloads/videogame/respiro/IL_RESPIRO_TRATTENUTO_DEL_MONDO_v1.0_android.7z", size: "38 MB" }
      ],
      detailsUrl: "/videogiochi/il-respiro-trattenuto-del-mondo"
    },
    {
      id: 2,
      title: "The Safe Place",
      image: "/assets/thesafeplace_immagine.jpg",
      description: "Un'avventura testuale post-apocalittica con elementi GDR. Sopravvivi in un mondo desolato dove ogni scelta conta. Riprogettato completamente in Godot per un'esperienza più immersiva.",
      status: "development",
      version: "v0.2.0",
      releaseDate: "In Sviluppo",
      platforms: ["Windows", "Linux", "macOS"],
      features: [
        "Sistema GDR completo",
        "Estetica CRT anni '80",
        "Narrativa ramificata",
        "Sistema di sopravvivenza",
        "Mondo post-apocalittico dettagliato"
      ],
      downloads: [],
      detailsUrl: "/videogiochi/the-safe-place"
    },
    {
      id: 3,
      title: "Lemmons: Una Fortuna Spenta",
      image: "/assets/lemmons.jpg",
      description: "Un puzzle game narrativo che segue le vicende di un gruppo di impiegati intrappolati in un ufficio surreale. Interactive fiction italiana con elementi di mistero e umorismo nero.",
      status: "development",
      version: "In Progettazione",
      releaseDate: "2026",
      platforms: ["Windows", "Linux", "macOS"],
      features: [
        "Interactive fiction italiana",
        "Puzzle narrativi complessi",
        "Ambientazione office surreale",
        "Umorismo nero",
        "Sistema di scelte consequenziali"
      ],
      downloads: [],
      detailsUrl: "/videogiochi/lemmons"
    }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'available':
        return <span className="status-badge available">Disponibile</span>;
      case 'development':
        return <span className="status-badge development">In Sviluppo</span>;
      default:
        return <span className="status-badge planned">Pianificato</span>;
    }
  };

  return (
    <>
      <header className="page-hero">
        <div className="container section-column">
          <h1>I Miei Videogiochi</h1>
          <p className="tagline">
            Esperimenti che fondono codice e narrativa, dove le tue scelte plasmano la storia.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="games-intro">
            <p>
              Ogni gioco che sviluppo è un esperimento narrativo che esplora nuove forme di storytelling interattivo. 
              Utilizzando strumenti come Godot, Yarn Spinner e l'AI come partner creativo, creo esperienze che 
              uniscono tecnologia moderna e narrazione profonda.
            </p>
          </div>

          <div className="games-grid">
            {games.map(game => (
              <div key={game.id} className={`game-card ${game.status}`}>
                <div className="game-image">
                  <img src={game.image} alt={game.title} loading="lazy" />
                  <div className="game-overlay">
                    {getStatusBadge(game.status)}
                  </div>
                </div>
                
                <div className="game-content">
                  <div className="game-header">
                    <h3 className="game-title">{game.title}</h3>
                    <div className="game-meta">
                      <span className="version">{game.version}</span>
                      <div className="release-date">
                        <Calendar size={14} />
                        {game.releaseDate}
                      </div>
                    </div>
                  </div>

                  <p className="game-description">{game.description}</p>

                  <div className="platforms">
                    <h4>Piattaforme:</h4>
                    <div className="platform-tags">
                      {game.platforms.map(platform => (
                        <span key={platform} className="platform-tag">{platform}</span>
                      ))}
                    </div>
                  </div>

                  <div className="features-list">
                    <h4>Caratteristiche:</h4>
                    <ul>
                      {game.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="game-actions">
                    {game.status === 'available' && game.downloads.length > 0 ? (
                      <>
                        {game.downloads.map((download, index) => (
                          <a 
                            key={index}
                            href={download.url} 
                            className="btn btn-primary"
                            download
                          >
                            <Download size={16} />
                            {download.platform} ({download.size})
                          </a>
                        ))}
                        <a 
                          href={game.detailsUrl} 
                          className="btn btn-secondary"
                        >
                          <ExternalLink size={16} />
                          Dettagli
                        </a>
                      </>
                    ) : (
                      <a 
                        href={game.detailsUrl} 
                        className="btn btn-secondary"
                      >
                        <Play size={16} />
                        Scopri di più
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="games-note">
            <h3>Note di Sviluppo</h3>
            <ul>
              <li><strong>Sviluppo Indie:</strong> Tutti i giochi sono sviluppati in autonomia con l'aiuto dell'AI</li>
              <li><strong>Open Source:</strong> Il codice sorgente è disponibile su richiesta per scopi educativi</li>
              <li><strong>Accessibilità:</strong> Particolare attenzione alle opzioni per ipovedenti e disabilità visive</li>
              <li><strong>Feedback:</strong> I tuoi commenti e suggerimenti sono sempre benvenuti</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default Videogiochi;

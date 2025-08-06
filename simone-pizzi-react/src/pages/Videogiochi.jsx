import React from 'react';
import { Download, ExternalLink, Play, Calendar } from 'lucide-react';

const Videogiochi = () => {
  const games = [
    {
      id: 1,
      title: "Il Respiro Trattenuto del Mondo",
      image: "/assets/respiro-orizzontale.png",
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
        return <span className="bg-[#00ff88] text-[#0a0a0a] px-3 py-1 rounded-full text-sm font-semibold">Disponibile</span>;
      case 'development':
        return <span className="bg-[#ffaa00] text-[#0a0a0a] px-3 py-1 rounded-full text-sm font-semibold">In Sviluppo</span>;
      default:
        return <span className="bg-[#666] text-white px-3 py-1 rounded-full text-sm font-semibold">Pianificato</span>;
    }
  };

  return (
    <>
      <header className="py-16 bg-gradient-to-br from-[#002a15] to-[#1a1a1a] border-b border-[#2a2a2a] text-center">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col gap-12 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white">I Miei Videogiochi</h1>
            <p className="text-xl text-[#b3b3b3] max-w-2xl mx-auto">
              Esperimenti che fondono codice e narrativa, dove le tue scelte plasmano la storia.
            </p>
          </div>
        </div>
      </header>

      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <p className="text-lg text-[#e0e0e0] leading-relaxed max-w-3xl mx-auto">
              Ogni gioco che sviluppo è un esperimento narrativo che esplora nuove forme di storytelling interattivo. 
              Utilizzando strumenti come Godot, Yarn Spinner e l'AI come partner creativo, creo esperienze che 
              uniscono tecnologia moderna e narrazione profonda.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
            {games.map(game => (
              <div key={game.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={game.image} 
                    alt={game.title} 
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(game.status)}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-2xl font-bold text-[#00ff88]">{game.title}</h3>
                    <div className="flex items-center gap-4">
                      <span className="bg-[#2a2a2a] text-[#a0a0a0] px-3 py-1 rounded-full text-sm font-semibold">
                        {game.version}
                      </span>
                      <div className="flex items-center gap-2 text-[#a0a0a0] text-sm">
                        <Calendar size={14} />
                        {game.releaseDate}
                      </div>
                    </div>
                  </div>

                  <p className="text-[#e0e0e0] leading-relaxed">{game.description}</p>

                  <div className="flex flex-col gap-3">
                    <h4 className="text-lg font-semibold text-white">Piattaforme:</h4>
                    <div className="flex flex-wrap gap-2">
                      {game.platforms.map(platform => (
                        <span 
                          key={platform} 
                          className="bg-[#2a2a2a] text-[#a0a0a0] px-2 py-1 rounded text-xs"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h4 className="text-lg font-semibold text-white">Caratteristiche:</h4>
                    <ul className="space-y-2">
                      {game.features.map((feature, index) => (
                        <li key={index} className="text-[#b3b3b3] flex items-start gap-2">
                          <span className="text-[#00ff88] mt-1">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    {game.id === 1 ? (
                      <a 
                        href="/respiro-trattenuto/index.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#00ff88] text-[#0a0a0a] px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#00ff88] transition-colors flex items-center justify-center gap-2"
                      >
                        <Play size={16} />
                        Scopri di più
                      </a>
                    ) : game.status === 'available' && game.downloads.length > 0 ? (
                      <>
                        {game.downloads.map((download, index) => (
                          <a 
                            key={index}
                            href={download.url} 
                            className="bg-[#00ff88] text-[#0a0a0a] px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#00ff88] transition-colors flex items-center justify-center gap-2"
                            download
                          >
                            <Download size={16} />
                            {download.platform} ({download.size})
                          </a>
                        ))}
                        <a 
                          href={game.detailsUrl} 
                          className="border border-[#00ff88] text-[#00ff88] px-6 py-3 rounded-lg font-semibold hover:bg-[#00ff88] hover:text-[#0a0a0a] transition-colors flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={16} />
                          Dettagli
                        </a>
                      </>
                    ) : (
                      <a 
                        href={game.detailsUrl} 
                        className="border border-[#00ff88] text-[#00ff88] px-6 py-3 rounded-lg font-semibold hover:bg-[#00ff88] hover:text-[#0a0a0a] transition-colors flex items-center justify-center gap-2"
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

          <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-[#00ff88] mb-6">Note di Sviluppo</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-[#00ff88] mt-1">•</span>
                <div>
                  <strong className="text-white">Sviluppo Indie:</strong> 
                  <span className="text-[#e0e0e0]"> Tutti i giochi sono sviluppati in autonomia con l'aiuto dell'AI</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00ff88] mt-1">•</span>
                <div>
                  <strong className="text-white">Open Source:</strong> 
                  <span className="text-[#e0e0e0]"> Il codice sorgente è disponibile su richiesta per scopi educativi</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00ff88] mt-1">•</span>
                <div>
                  <strong className="text-white">Accessibilità:</strong> 
                  <span className="text-[#e0e0e0]"> Particolare attenzione alle opzioni per ipovedenti e disabilità visive</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00ff88] mt-1">•</span>
                <div>
                  <strong className="text-white">Feedback:</strong> 
                  <span className="text-[#e0e0e0]"> I tuoi commenti e suggerimenti sono sempre benvenuti</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default Videogiochi;

import React from 'react';
import { Download, ExternalLink } from 'lucide-react';

const Software = () => {
  const softwareProjects = [
    {
      id: 1,
      title: "Gestore Duplicati Musicali",
      image: "/assets/gdm.png",
      description: "Un'utility per Windows, macOS e Linux che analizza la tua libreria, isola file di bassa qualità e duplicati, e raggruppa le diverse versioni dei brani per una pulizia rapida.",
      features: [
        "Scansione automatica librerie musicali",
        "Rilevamento duplicati intelligente",
        "Analisi qualità audio",
        "Interfaccia drag & drop",
        "Supporto multi-formato"
      ],
      downloadUrl: "/downloads/utility/GDM-free.7z",
      detailsUrl: "/software/gestore-duplicati-musicali",
      version: "v2.1",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 2,
      title: "Advanced Jingle Machine v1.5",
      image: "/assets/advjingle.png",
      description: "Console audio professionale con 88 pulsanti personalizzabili, sistema di coda automatico e 128 canali simultanei. Ideale per radio, podcast, DJ e eventi live.",
      features: [
        "88 pulsanti personalizzabili",
        "128 canali audio simultanei",
        "Sistema di coda automatico",
        "Controllo MIDI",
        "Interfaccia professionale"
      ],
      downloadUrl: "/downloads/utility/AJM-free.7z",
      detailsUrl: "/software/advanced-jingle-machine",
      version: "v1.5",
      platforms: ["Windows"]
    },
    {
      id: 3,
      title: "Audio & Metadata Converter",
      image: "/assets/audioconv.png",
      description: "Convertitore audio professionale per ottimizzare librerie musicali destinate a radio e streaming. Trasforma tutti i formati in standard broadcasting MP3 192kbps.",
      features: [
        "Conversione batch automatica",
        "Normalizzazione audio",
        "Gestione metadata ID3",
        "Standard broadcasting",
        "Ottimizzazione per streaming"
      ],
      downloadUrl: "/downloads/utility/AMC-Free.7z",
      detailsUrl: "/software/audio-metadata-converter",
      version: "v3.0",
      platforms: ["Windows", "macOS"]
    }
  ];

  return (
    <>
      <header className="py-16 bg-gradient-to-br from-[#002a15] to-[#1a1a1a] border-b border-[#2a2a2a] text-center">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col gap-12 text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-white">I Miei Software</h1>
            <p className="text-xl text-[#b3b3b3] max-w-2xl mx-auto">
              Applicazioni, utility e script nati dalla sperimentazione pratica con il codice e l'intelligenza artificiale.
            </p>
          </div>
        </div>
      </header>

      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <p className="text-lg text-[#e0e0e0] leading-relaxed max-w-3xl mx-auto">
              Ogni software che sviluppo nasce da un'esigenza concreta che ho incontrato nel mio lavoro quotidiano. 
              Utilizzando l'AI come partner di sviluppo, trasformo idee pratiche in strumenti funzionali che 
              poi condivido gratuitamente con la community.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
            {softwareProjects.map(project => (
              <div key={project.id} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:transform hover:scale-105 hover:shadow-xl transition-all duration-300">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="p-6 flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <h3 className="text-2xl font-bold text-[#00ff88]">{project.title}</h3>
                    <div className="flex items-center gap-4">
                      <span className="bg-[#00ff88] text-[#0a0a0a] px-3 py-1 rounded-full text-sm font-semibold">
                        {project.version}
                      </span>
                      <div className="flex gap-2">
                        {project.platforms.map(platform => (
                          <span 
                            key={platform} 
                            className="bg-[#2a2a2a] text-[#a0a0a0] px-2 py-1 rounded text-xs"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-[#e0e0e0] leading-relaxed">{project.description}</p>

                  <div className="flex flex-col gap-3">
                    <h4 className="text-lg font-semibold text-white">Caratteristiche principali:</h4>
                    <ul className="space-y-2">
                      {project.features.map((feature, index) => (
                        <li key={index} className="text-[#b3b3b3] flex items-start gap-2">
                          <span className="text-[#00ff88] mt-1">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <a 
                      href={project.downloadUrl} 
                      className="bg-[#00ff88] text-[#0a0a0a] px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#00ff88] transition-colors flex items-center justify-center gap-2 min-w-[160px]"
                      download
                    >
                      <Download size={16} />
                      Download Gratuito
                    </a>
                    <a 
                      href={project.detailsUrl} 
                      className="border border-[#00ff88] text-[#00ff88] px-6 py-3 rounded-lg font-semibold hover:bg-[#00ff88] hover:text-[#0a0a0a] transition-colors flex items-center justify-center gap-2 min-w-[160px]"
                    >
                      <ExternalLink size={16} />
                      Dettagli
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-[#00ff88] mb-6">Note Importanti</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-[#00ff88] mt-1">•</span>
                <div>
                  <strong className="text-white">Software Gratuiti:</strong> 
                  <span className="text-[#e0e0e0]"> Tutti i miei software sono distribuiti gratuitamente</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00ff88] mt-1">•</span>
                <div>
                  <strong className="text-white">Open Source:</strong> 
                  <span className="text-[#e0e0e0]"> Il codice sorgente è disponibile su richiesta</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00ff88] mt-1">•</span>
                <div>
                  <strong className="text-white">Supporto:</strong> 
                  <span className="text-[#e0e0e0]"> Per assistenza o segnalazioni, utilizza la sezione contatti</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#00ff88] mt-1">•</span>
                <div>
                  <strong className="text-white">Aggiornamenti:</strong> 
                  <span className="text-[#e0e0e0]"> Le nuove versioni vengono annunciate nel blog</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default Software;

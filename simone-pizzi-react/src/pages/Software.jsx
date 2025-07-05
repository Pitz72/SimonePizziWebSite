import React from 'react';
import { Download, ExternalLink } from 'lucide-react';
import './Software.css';

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
      <header className="page-hero">
        <div className="container section-column">
          <h1>I Miei Software</h1>
          <p className="tagline">
            Applicazioni, utility e script nati dalla sperimentazione pratica con il codice e l'intelligenza artificiale.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="software-intro">
            <p>
              Ogni software che sviluppo nasce da un'esigenza concreta che ho incontrato nel mio lavoro quotidiano. 
              Utilizzando l'AI come partner di sviluppo, trasformo idee pratiche in strumenti funzionali che 
              poi condivido gratuitamente con la community.
            </p>
          </div>

          <div className="software-grid">
            {softwareProjects.map(project => (
              <div key={project.id} className="software-card">
                <div className="software-image">
                  <img src={project.image} alt={project.title} loading="lazy" />
                </div>
                
                <div className="software-content">
                  <div className="software-header">
                    <h3 className="software-title">{project.title}</h3>
                    <div className="software-meta">
                      <span className="version">{project.version}</span>
                      <div className="platforms">
                        {project.platforms.map(platform => (
                          <span key={platform} className="platform-tag">{platform}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="software-description">{project.description}</p>

                  <div className="features-list">
                    <h4>Caratteristiche principali:</h4>
                    <ul>
                      {project.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="software-actions">
                    <a 
                      href={project.downloadUrl} 
                      className="btn btn-primary"
                      download
                    >
                      <Download size={16} />
                      Download Gratuito
                    </a>
                    <a 
                      href={project.detailsUrl} 
                      className="btn btn-secondary"
                    >
                      <ExternalLink size={16} />
                      Dettagli
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="software-note">
            <h3>Note Importanti</h3>
            <ul>
              <li><strong>Software Gratuiti:</strong> Tutti i miei software sono distribuiti gratuitamente</li>
              <li><strong>Open Source:</strong> Il codice sorgente è disponibile su richiesta</li>
              <li><strong>Supporto:</strong> Per assistenza o segnalazioni, utilizza la sezione contatti</li>
              <li><strong>Aggiornamenti:</strong> Le nuove versioni vengono annunciate nel blog</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
};

export default Software;

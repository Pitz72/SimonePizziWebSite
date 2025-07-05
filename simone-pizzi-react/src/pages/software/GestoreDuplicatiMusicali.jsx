import React from 'react';
import { Download, ArrowLeft, Zap, Music, Mic, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SoftwareDetail.css';

const GestoreDuplicatiMusicali = () => {
  const features = [
    {
      icon: <Zap size={24} />,
      title: "Scansione Veloce",
      description: "Algoritmi ottimizzati per analizzare rapidamente grandi collezioni musicali"
    },
    {
      icon: <Music size={24} />,
      title: "Rilevamento Preciso",
      description: "Identifica duplicati anche con nomi file diversi basandosi sui metadati"
    },
    {
      icon: <Mic size={24} />,
      title: "Preview Audio",
      description: "Ascolta i file prima di decidere quali eliminare"
    },
    {
      icon: <Headphones size={24} />,
      title: "Gestione Sicura",
      description: "Sposta i duplicati in una cartella di sicurezza prima dell'eliminazione"
    }
  ];

  return (
    <>
      <header className="software-detail-hero">
        <div className="container">
          <Link to="/software" className="back-link">
            <ArrowLeft size={20} />
            Torna ai Software
          </Link>
          
          <div className="hero-content">
            <div className="hero-text">
              <h1>Gestore Duplicati Musicali</h1>
              <p className="hero-description">
                Utility professionale per l'identificazione e rimozione di file musicali duplicati. 
                Perfetto per organizzare grandi collezioni audio con precisione e sicurezza.
              </p>
              <div className="hero-meta">
                <span className="version">Versione 2.1</span>
                <span className="size">12 MB</span>
                <span className="platform">Windows</span>
              </div>
              <div className="hero-actions">
                <a 
                  href="/downloads/utility/GDM-free.7z" 
                  className="btn btn-primary btn-large"
                  download
                >
                  <Download size={20} />
                  Scarica Gratis
                </a>
              </div>
            </div>
            <div className="hero-image">
              <img 
                src="/assets/gdm.png" 
                alt="Gestore Duplicati Musicali - Screenshot" 
              />
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="software-content">
            <div className="main-content">
              <h2>Perché GDM?</h2>
              <p>
                Se sei un appassionato di musica con una vasta collezione di file audio, 
                probabilmente hai già incontrato il problema dei duplicati. GDM è nato dalla mia 
                esperienza personale nel gestire archivi audio per podcast e produzioni musicali.
              </p>

              <h3>Come Funziona</h3>
              <ol>
                <li><strong>Selezione Cartelle:</strong> Scegli le directory da analizzare</li>
                <li><strong>Scansione Intelligente:</strong> L'algoritmo analizza metadati e caratteristiche audio</li>
                <li><strong>Preview Risultati:</strong> Visualizza i duplicati trovati con possibilità di ascolto</li>
                <li><strong>Gestione Sicura:</strong> Sposta o elimina i file duplicati secondo le tue preferenze</li>
              </ol>

              <h3>Caratteristiche Tecniche</h3>
              <ul>
                <li>Supporto per MP3, FLAC, WAV, OGG, M4A</li>
                <li>Analisi basata su hash MD5 e metadati ID3</li>
                <li>Interfaccia drag-and-drop intuitiva</li>
                <li>Log dettagliato delle operazioni</li>
                <li>Backup automatico prima dell'eliminazione</li>
              </ul>

              <div className="note-box">
                <h4>📝 Nota Importante</h4>
                <p>
                  Questo software è fornito gratuitamente. Ti consiglio sempre di effettuare 
                  un backup della tua collezione musicale prima di utilizzare qualsiasi tool 
                  di gestione file automatizzato.
                </p>
              </div>
            </div>

            <div className="sidebar">
              <div className="download-card">
                <h3>Download</h3>
                <a 
                  href="/downloads/utility/GDM-free.7z" 
                  className="btn btn-primary btn-full"
                  download
                >
                  <Download size={16} />
                  GDM v2.1 (12 MB)
                </a>
                <p className="download-note">
                  File .7z - Richiede 7-Zip per l'estrazione
                </p>
              </div>

              <div className="info-card">
                <h3>Requisiti di Sistema</h3>
                <ul>
                  <li>Windows 10/11</li>
                  <li>2 GB RAM minimo</li>
                  <li>50 MB spazio libero</li>
                  <li>.NET Framework 4.8</li>
                </ul>
              </div>

              <div className="support-card">
                <h3>Supporto</h3>
                <p>
                  Hai domande o problemi? 
                  <Link to="/contatti"> Contattami</Link> e ti aiuterò a risolverli.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt-bg">
        <div className="container">
          <h2>Caratteristiche Principali</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default GestoreDuplicatiMusicali;

import React from 'react';
import { Download, ArrowLeft, Zap, FileText, RotateCw, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SoftwareDetail.css';

const AudioMetadataConverter = () => {
  const features = [
    {
      icon: <Zap size={24} />,
      title: "Conversione Batch",
      description: "Elabora centinaia di file audio contemporaneamente"
    },
    {
      icon: <FileText size={24} />,
      title: "Tutti i Formati",
      description: "Supporta MP3, FLAC, WAV, OGG, M4A e molti altri"
    },
    {
      icon: <RotateCw size={24} />,
      title: "Automazione",
      description: "Processi automatizzati per workflow professionali"
    },
    {
      icon: <Database size={24} />,
      title: "Gestione Metadati",
      description: "Modifica e standardizza tag ID3 e metadati"
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
              <h1>Audio Metadata Converter</h1>
              <p className="hero-description">
                Strumento professionale per la conversione batch di file audio e la gestione 
                avanzata dei metadati. Ideale per studi di registrazione, podcaster e audiofili.
              </p>
              <div className="hero-meta">
                <span className="version">Versione 3.2</span>
                <span className="size">18 MB</span>
                <span className="platform">Windows</span>
              </div>
              <div className="hero-actions">
                <a 
                  href="/downloads/utility/AMC-Free.7z" 
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
                src="/assets/audioconv.png" 
                alt="Audio Metadata Converter - Screenshot" 
              />
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="software-content">
            <div className="main-content">
              <h2>Il Convertitore che Cercavi</h2>
              <p>
                Nato dalle esigenze pratiche della produzione podcast professionale, 
                Audio Metadata Converter è la soluzione completa per chi lavora quotidianamente 
                con grandi archivi audio e ha bisogno di standardizzare formati e metadati.
              </p>

              <h3>Flusso di Lavoro Tipico</h3>
              <ol>
                <li><strong>Import Cartelle:</strong> Carica intere directory con sottocartelle</li>
                <li><strong>Configurazione:</strong> Imposta formato di output e parametri qualità</li>
                <li><strong>Metadati:</strong> Definisci template per tag standardizzati</li>
                <li><strong>Conversione:</strong> Elaborazione batch automatica con progress tracking</li>
                <li><strong>Organizzazione:</strong> Output strutturato secondo le tue regole</li>
              </ol>

              <h3>Casi d'Uso Principali</h3>
              <ul>
                <li><strong>Podcasting:</strong> Standardizzazione episodi per distribuzione</li>
                <li><strong>Archivi Musicali:</strong> Conversione collezioni in formati moderni</li>
                <li><strong>Produzioni Audio:</strong> Workflow professionali con metadati consistenti</li>
                <li><strong>Streaming:</strong> Preparazione contenuti per piattaforme multiple</li>
                <li><strong>Backup:</strong> Conversione archivi in formati lossless/compressed</li>
              </ul>

              <h3>Formati Supportati</h3>
              <div className="format-grid">
                <div className="format-category">
                  <h4>Input</h4>
                  <p>MP3, FLAC, WAV, OGG, M4A, AAC, WMA, AIFF, AU</p>
                </div>
                <div className="format-category">
                  <h4>Output</h4>
                  <p>MP3 (CBR/VBR), FLAC, OGG Vorbis, M4A, WAV</p>
                </div>
              </div>

              <div className="note-box">
                <h4>💡 Tip Professionale</h4>
                <p>
                  Per podcast, raccomando MP3 320kbps CBR per la massima compatibilità, 
                  oppure OGG Vorbis q6 per un rapporto qualità/dimensione ottimale 
                  su piattaforme che lo supportano.
                </p>
              </div>
            </div>

            <div className="sidebar">
              <div className="download-card">
                <h3>Download</h3>
                <a 
                  href="/downloads/utility/AMC-Free.7z" 
                  className="btn btn-primary btn-full"
                  download
                >
                  <Download size={16} />
                  AMC v3.2 (18 MB)
                </a>
                <p className="download-note">
                  File .7z - Include codec avanzati
                </p>
              </div>

              <div className="info-card">
                <h3>Requisiti di Sistema</h3>
                <ul>
                  <li>Windows 10/11 (64-bit)</li>
                  <li>4 GB RAM raccomandati</li>
                  <li>100 MB spazio libero</li>
                  <li>Codec audio system</li>
                  <li>CPU multi-core (consigliato)</li>
                </ul>
              </div>

              <div className="support-card">
                <h3>Supporto & Feedback</h3>
                <p>
                  Utilizzato da centinaia di podcaster italiani. 
                  <Link to="/contatti"> Contattami</Link> per supporto tecnico 
                  o suggerimenti per nuove funzionalità.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt-bg">
        <div className="container">
          <h2>Caratteristiche Avanzate</h2>
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

export default AudioMetadataConverter;

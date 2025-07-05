import React from 'react';
import { Download, ArrowLeft, Zap, Mic, Volume2, AudioLines } from 'lucide-react';
import { Link } from 'react-router-dom';
import './SoftwareDetail.css';

const AdvancedJingleMachine = () => {
  const features = [
    {
      icon: <Zap size={24} />,
      title: "AI-Powered",
      description: "Generazione automatica con intelligenza artificiale avanzata"
    },
    {
      icon: <Mic size={24} />,
      title: "Voce Sintetica",
      description: "Sintesi vocale professionale in italiano con voci naturali"
    },
    {
      icon: <Volume2 size={24} />,
      title: "Effetti Pro",
      description: "Libreria completa di effetti audio e transizioni"
    },
    {
      icon: <AudioLines size={24} />,
      title: "Export Qualità",
      description: "Output in alta qualità per uso broadcast professionale"
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
              <h1>Advanced Jingle Machine</h1>
              <p className="hero-description">
                Il primo tool italiano per la creazione automatica di jingle professionali 
                con AI integrata. Perfetto per radio, podcast e contenuti audio.
              </p>
              <div className="hero-meta">
                <span className="version">Versione 4.0</span>
                <span className="size">25 MB</span>
                <span className="platform">Windows</span>
              </div>
              <div className="hero-actions">
                <a 
                  href="/downloads/utility/AJM-free.7z" 
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
                src="/assets/advjingle.png" 
                alt="Advanced Jingle Machine - Screenshot" 
              />
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <div className="software-content">
            <div className="main-content">
              <h2>Rivoluzione nella Creazione Audio</h2>
              <p>
                Advanced Jingle Machine rappresenta l'evoluzione naturale delle mie esperienze 
                nel podcasting e nella produzione audio. Dopo anni passati a creare manualmente 
                jingle per Runtime Radio e Italian Podcast Network, ho sviluppato questo tool 
                che automatizza il processo creativo mantenendo la qualità professionale.
              </p>

              <h3>Cosa Rende AJM Speciale</h3>
              <ul>
                <li><strong>AI Italiana:</strong> Prima implementazione di sintesi vocale AI ottimizzata per l'italiano radio</li>
                <li><strong>Template Professionali:</strong> Oltre 50 modelli ispirati ai format radiofonici più popolari</li>
                <li><strong>Integrazione Seamless:</strong> Export diretto compatibile con tutti i DAW principali</li>
                <li><strong>Personalizzazione Avanzata:</strong> Controllo granulare su ogni elemento del jingle</li>
                <li><strong>Apprendimento Adattivo:</strong> L'AI impara dal tuo stile e migliora nel tempo</li>
              </ul>

              <h3>Workflow Creativo</h3>
              <ol>
                <li><strong>Input Testuale:</strong> Inserisci il testo del tuo jingle</li>
                <li><strong>Scelta Stile:</strong> Seleziona tra decine di template (news, entertainment, sport, etc.)</li>
                <li><strong>AI Processing:</strong> L'intelligenza artificiale compone musica e voce</li>
                <li><strong>Fine-Tuning:</strong> Regola timing, effetti e parametri audio</li>
                <li><strong>Export Pro:</strong> Salva in formato WAV/MP3 pronto per l'uso</li>
              </ol>

              <h3>Casi d'Uso Reali</h3>
              <div className="use-cases">
                <div className="use-case">
                  <h4>📻 Radio e Podcast</h4>
                  <p>Aperture show, stacchetti pubblicitari, ID stazione</p>
                </div>
                <div className="use-case">
                  <h4>🎬 Content Creation</h4>
                  <p>Intro YouTube, transizioni video, elementi audio branded</p>
                </div>
                <div className="use-case">
                  <h4>🏢 Aziende</h4>
                  <p>Messaggi in attesa, presentazioni, eventi corporate</p>
                </div>
                <div className="use-case">
                  <h4>🎵 Creativi Audio</h4>
                  <p>Basi per composizioni, elementi ritmici, sound design</p>
                </div>
              </div>

              <div className="note-box">
                <h4>🚀 Novità v4.0</h4>
                <p>
                  La nuova versione introduce l'integrazione con modelli linguistici avanzati 
                  per una generazione del testo ancora più naturale e coinvolgente. 
                  Inoltre, è stata aggiunta la modalità "Stile Libero" per sperimentazioni creative.
                </p>
              </div>
            </div>

            <div className="sidebar">
              <div className="download-card">
                <h3>Download</h3>
                <a 
                  href="/downloads/utility/AJM-free.7z" 
                  className="btn btn-primary btn-full"
                  download
                >
                  <Download size={16} />
                  AJM v4.0 (25 MB)
                </a>
                <p className="download-note">
                  Include AI engine e libreria effetti
                </p>
              </div>

              <div className="info-card">
                <h3>Requisiti di Sistema</h3>
                <ul>
                  <li>Windows 10/11 (64-bit)</li>
                  <li>8 GB RAM raccomandati</li>
                  <li>500 MB spazio libero</li>
                  <li>Scheda audio dedicata</li>
                  <li>Connessione internet (AI features)</li>
                </ul>
              </div>

              <div className="support-card">
                <h3>Community & Tutorial</h3>
                <p>
                  Unisciti alla community di creators che usano AJM. 
                  <Link to="/contatti"> Contattami</Link> per tutorial avanzati 
                  e best practices professionali.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt-bg">
        <div className="container">
          <h2>Funzionalità AI Avanzate</h2>
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

export default AdvancedJingleMachine;

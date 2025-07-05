import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Play, BookOpen, Code, Gamepad2 } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="animate-fade-in-up">
                Benvenuto nel mio <span className="highlight">universo creativo</span>
              </h1>
              <p className="hero-description animate-fade-in-up">
                Podcaster dal 2010, scrittore di storie e racconti, sviluppatore sperimentale con AI. 
                Fondatore Italian Podcast Network e Runtime Radio. 
                Esplora con me il mondo della narrativa interattiva e dell'innovazione digitale.
              </p>
              <div className="hero-cta animate-fade-in-up">
                <Link to="/chi-sono" className="btn btn-primary">
                  Scopri di più <ArrowRight size={20} />
                </Link>
                <Link to="/contatti" className="btn btn-secondary">
                  Contattami
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <img 
                src="/assets/photo_2025-03-15_08-52-25.jpg" 
                alt="Simone Pizzi - Ritratto" 
                className="animate-fade-in"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section features-section">
        <div className="container">
          <div className="section-header">
            <h2>Cosa Troverai Qui</h2>
            <p>Una panoramica delle mie passioni e dei progetti che porto avanti</p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card" style={{backgroundImage: 'url(/assets/photo_2025-01-24_07-40-45.jpg)'}}>
              <div className="feature-overlay">
                <div className="feature-icon">
                  <Play size={40} />
                </div>
                <h3>Podcast</h3>
                <p>Runtime Radio e Italian Podcast Network: il mio viaggio nel mondo dell'audio narrativo dal 2010.</p>
                <span className="feature-link disabled">
                  Prossimamente <ArrowRight size={16} />
                </span>
              </div>
            </div>

            <div className="feature-card" style={{backgroundImage: 'url(/assets/albero.jpg)'}}>
              <div className="feature-overlay">
                <div className="feature-icon">
                  <BookOpen size={40} />
                </div>
                <h3>Libri e Racconti</h3>
                <p>Storie che nascono dall'immaginazione e dalla sperimentazione con nuove tecnologie narrative.</p>
                <span className="feature-link disabled">
                  Prossimamente <ArrowRight size={16} />
                </span>
              </div>
            </div>

            <div className="feature-card" style={{backgroundImage: 'url(/assets/advjingle.png)'}}>
              <div className="feature-overlay">
                <div className="feature-icon">
                  <Code size={40} />
                </div>
                <h3>Software</h3>
                <p>Utility e strumenti creativi sviluppati per semplificare processi e stimolare l'innovazione.</p>
                <Link to="/software" className="feature-link">
                  Scarica <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="feature-card" style={{backgroundImage: 'url(/assets/Whisk_d99885c46e.jpg)'}}>
              <div className="feature-overlay">
                <div className="feature-icon">
                  <Gamepad2 size={40} />
                </div>
                <h3>Videogiochi</h3>
                <p>Esperimenti interattivi che uniscono storytelling e tecnologia per creare esperienze uniche.</p>
                <Link to="/videogiochi" className="feature-link">
                  Gioca <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="section alt-bg latest-section">
        <div className="container">
          <div className="section-header">
            <h2>Ultimi Aggiornamenti</h2>
            <p>Le novità più recenti dai miei progetti</p>
          </div>
          
          <div className="updates-grid">
            <div className="update-item">
              <div className="update-meta">
                <span className="update-type">Software</span>
                <span className="update-date">Gennaio 2025</span>
              </div>
              <h3>Advanced Jingle Machine</h3>
              <p>Nuovo strumento per la creazione automatica di jingle professionali con AI integrata.</p>
              <Link to="/software/advanced-jingle-machine" className="update-link">
                <Download size={16} /> Scarica Gratis
              </Link>
            </div>

            <div className="update-item">
              <div className="update-meta">
                <span className="update-type">Videogioco</span>
                <span className="update-date">Dicembre 2024</span>
              </div>
              <h3>Il Respiro Trattenuto del Mondo</h3>
              <p>Avventura narrativa che esplora temi profondi attraverso meccaniche innovative.</p>
              <Link to="/videogiochi/il-respiro-trattenuto-del-mondo" className="update-link">
                <Play size={16} /> Gioca Ora
              </Link>
            </div>

            <div className="update-item">
              <div className="update-meta">
                <span className="update-type">Blog</span>
                <span className="update-date">Novembre 2024</span>
              </div>
              <h3>The Safe Place v0.2.0</h3>
              <p>Riflessioni sul processo di sviluppo e le sfide della narrativa interattiva moderna.</p>
              <Link to="/chi-sono/articoli/the-safe-place-v100" className="update-link">
                <BookOpen size={16} /> Leggi Articolo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section contact-preview">
        <div className="container">
          <div className="section-header">
            <h2>Perché Contattarmi?</h2>
            <p>Ci sono diversi motivi per cui potresti voler entrare in contatto con me. Ecco alcune delle opportunità di collaborazione e interazione che mi interessano maggiormente:</p>
          </div>
          
          <div className="contact-reasons">
            <div className="reason-item">
              <h3>Collaborazione Podcast</h3>
              <p>Sempre aperto a partecipare come ospite o a collaborare su progetti audio che riguardano tecnologia, narrativa e innovazione.</p>
            </div>
            
            <div className="reason-item">
              <h3>Progetto Sviluppo Software</h3>
              <p>Interessato a progetti che coinvolgono AI, automazione, tools creativi o applicazioni che uniscono tecnologia e storytelling.</p>
            </div>
            
            <div className="reason-item">
              <h3>Proposta Editoriale</h3>
              <p>Disponibile a valutare proposte di scrittura, recensioni, o progetti editoriali legati ai miei ambiti di competenza.</p>
            </div>
            
            <div className="reason-item">
              <h3>Richiesta Intervista</h3>
              <p>Felice di condividere la mia esperienza su podcasting, sviluppo indie, narrative design e uso creativo dell'intelligenza artificiale.</p>
            </div>
            
            <div className="reason-item">
              <h3>Consulenza Tecnica</h3>
              <p>Consulenze su progetti digitali, workflow di produzione audio, o implementazione creativa di strumenti AI.</p>
            </div>
          </div>
          
          <div className="contact-cta">
            <Link to="/contatti" className="btn btn-primary">
              Iniziamo a Collaborare
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

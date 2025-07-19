import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Play, BookOpen, Code, Gamepad2 } from 'lucide-react';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-[#002a15] to-[#1a1a1a] relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                Benvenuto nel mio <span className="text-[#00ff88]">universo creativo</span>
              </h1>
              <p className="text-xl text-[#a0a0a0] leading-relaxed">
                Podcaster dal 2010, scrittore di storie e racconti, sviluppatore sperimentale con AI. 
                Fondatore Italian Podcast Network e Runtime Radio. 
                Esplora con me il mondo della narrativa interattiva e dell'innovazione digitale.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link to="/chi-sono" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-[#0a0a0a] font-semibold rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-[#00ff88]/20">
                  Scopri di più <ArrowRight size={20} />
                </Link>
                <Link to="/contatti" className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-[#00ff88] text-[#00ff88] font-semibold rounded-lg transition-all duration-200 hover:bg-[#00ff88] hover:text-[#0a0a0a]">
                  Contattami
                </Link>
              </div>
            </div>
            <div className="flex justify-center items-center">
              <img 
                src="/assets/photo_2025-03-15_08-52-25.jpg" 
                alt="Simone Pizzi - Ritratto" 
                className="w-full max-w-md h-auto rounded-2xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[#00ff88]/20"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#00ff88] mb-4">Cosa Troverai Qui</h2>
            <p className="text-xl text-[#a0a0a0] max-w-2xl mx-auto">Una panoramica delle mie passioni e dei progetti che porto avanti</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#00ff88] hover:shadow-2xl relative overflow-hidden min-h-[300px] flex items-end" 
                 style={{backgroundImage: 'url(/assets/photo_2025-01-24_07-40-45.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/40"></div>
              <div className="relative p-8 text-white w-full">
                <div className="text-[#00ff88] mb-6 flex justify-center">
                  <Play size={40} />
                </div>
                <h3 className="text-xl font-semibold mb-4">Podcast</h3>
                <p className="text-[#a0a0a0] leading-relaxed mb-6">Runtime Radio e Italian Podcast Network: il mio viaggio nel mondo dell'audio narrativo dal 2010.</p>
                <span className="text-[#a0a0a0] cursor-not-allowed opacity-70 inline-flex items-center gap-2">
                  Prossimamente <ArrowRight size={16} />
                </span>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#00ff88] hover:shadow-2xl relative overflow-hidden min-h-[300px] flex items-end"
                 style={{backgroundImage: 'url(/assets/albero.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/40"></div>
              <div className="relative p-8 text-white w-full">
                <div className="text-[#00ff88] mb-6 flex justify-center">
                  <BookOpen size={40} />
                </div>
                <h3 className="text-xl font-semibold mb-4">Libri e Racconti</h3>
                <p className="text-[#a0a0a0] leading-relaxed mb-6">Storie che nascono dall'immaginazione e dalla sperimentazione con nuove tecnologie narrative.</p>
                <span className="text-[#a0a0a0] cursor-not-allowed opacity-70 inline-flex items-center gap-2">
                  Prossimamente <ArrowRight size={16} />
                </span>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#00ff88] hover:shadow-2xl relative overflow-hidden min-h-[300px] flex items-end"
                 style={{backgroundImage: 'url(/assets/advjingle.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/40"></div>
              <div className="relative p-8 text-white w-full">
                <div className="text-[#00ff88] mb-6 flex justify-center">
                  <Code size={40} />
                </div>
                <h3 className="text-xl font-semibold mb-4">Software</h3>
                <p className="text-[#a0a0a0] leading-relaxed mb-6">Utility e strumenti creativi sviluppati per semplificare processi e stimolare l'innovazione.</p>
                <Link to="/software" className="text-[#00ff88] font-semibold inline-flex items-center gap-2 hover:text-[#00cc6a] transition-all duration-200 hover:translate-x-1">
                  Scarica <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#00ff88] hover:shadow-2xl relative overflow-hidden min-h-[300px] flex items-end"
                 style={{backgroundImage: 'url(/assets/Whisk_d99885c46e.jpg)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/40"></div>
              <div className="relative p-8 text-white w-full">
                <div className="text-[#00ff88] mb-6 flex justify-center">
                  <Gamepad2 size={40} />
                </div>
                <h3 className="text-xl font-semibold mb-4">Videogiochi</h3>
                <p className="text-[#a0a0a0] leading-relaxed mb-6">Esperimenti interattivi che uniscono storytelling e tecnologia per creare esperienze uniche.</p>
                <Link to="/videogiochi" className="text-[#00ff88] font-semibold inline-flex items-center gap-2 hover:text-[#00cc6a] transition-all duration-200 hover:translate-x-1">
                  Gioca <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#00ff88] mb-4">Ultimi Aggiornamenti</h2>
            <p className="text-xl text-[#a0a0a0] max-w-2xl mx-auto">Le novità più recenti dai miei progetti</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#0a0a0a] p-8 rounded-xl border border-[#2a2a2a] transition-all duration-300 hover:-translate-y-2 hover:border-[#00ff88] hover:shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="bg-[#00ff88]/10 text-[#00ff88] px-3 py-1 rounded-full text-sm font-medium">Software</span>
                <span className="text-[#b3b3b3] text-sm">Gennaio 2025</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Advanced Jingle Machine</h3>
              <p className="text-[#a0a0a0] leading-relaxed mb-4">Nuovo strumento per la creazione automatica di jingle professionali con AI integrata.</p>
              <Link to="/software/advanced-jingle-machine" className="text-[#00ff88] font-semibold inline-flex items-center gap-2 hover:text-[#00cc6a] transition-all duration-200">
                <Download size={16} /> Scarica Gratis
              </Link>
            </div>

            <div className="bg-[#0a0a0a] p-8 rounded-xl border border-[#2a2a2a] transition-all duration-300 hover:-translate-y-2 hover:border-[#00ff88] hover:shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="bg-[#00ff88]/10 text-[#00ff88] px-3 py-1 rounded-full text-sm font-medium">Videogioco</span>
                <span className="text-[#b3b3b3] text-sm">Dicembre 2024</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Il Respiro Trattenuto del Mondo</h3>
              <p className="text-[#a0a0a0] leading-relaxed mb-4">Avventura narrativa che esplora temi profondi attraverso meccaniche innovative.</p>
              <Link to="/videogiochi/il-respiro-trattenuto-del-mondo" className="text-[#00ff88] font-semibold inline-flex items-center gap-2 hover:text-[#00cc6a] transition-all duration-200">
                <Play size={16} /> Gioca Ora
              </Link>
            </div>

            <div className="bg-[#0a0a0a] p-8 rounded-xl border border-[#2a2a2a] transition-all duration-300 hover:-translate-y-2 hover:border-[#00ff88] hover:shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <span className="bg-[#00ff88]/10 text-[#00ff88] px-3 py-1 rounded-full text-sm font-medium">Blog</span>
                <span className="text-[#b3b3b3] text-sm">Novembre 2024</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">The Safe Place v0.2.0</h3>
              <p className="text-[#a0a0a0] leading-relaxed mb-4">Riflessioni sul processo di sviluppo e le sfide della narrativa interattiva moderna.</p>
              <Link to="/chi-sono/articoli/the-safe-place-v100" className="text-[#00ff88] font-semibold inline-flex items-center gap-2 hover:text-[#00cc6a] transition-all duration-200">
                <BookOpen size={16} /> Leggi Articolo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#00ff88] mb-4">Perché Contattarmi?</h2>
            <p className="text-xl text-[#a0a0a0] max-w-4xl mx-auto">Ci sono diversi motivi per cui potresti voler entrare in contatto con me. Ecco alcune delle opportunità di collaborazione e interazione che mi interessano maggiormente:</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a] transition-all duration-300 hover:-translate-y-1 hover:border-[#00ff88] hover:shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Collaborazione Podcast</h3>
              <p className="text-[#a0a0a0] leading-relaxed">Sempre aperto a partecipare come ospite o a collaborare su progetti audio che riguardano tecnologia, narrativa e innovazione.</p>
            </div>
            
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a] transition-all duration-300 hover:-translate-y-1 hover:border-[#00ff88] hover:shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Progetto Sviluppo Software</h3>
              <p className="text-[#a0a0a0] leading-relaxed">Interessato a progetti che coinvolgono AI, automazione, tools creativi o applicazioni che uniscono tecnologia e storytelling.</p>
            </div>
            
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a] transition-all duration-300 hover:-translate-y-1 hover:border-[#00ff88] hover:shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Proposta Editoriale</h3>
              <p className="text-[#a0a0a0] leading-relaxed">Disponibile a valutare proposte di scrittura, recensioni, o progetti editoriali legati ai miei ambiti di competenza.</p>
            </div>
            
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a] transition-all duration-300 hover:-translate-y-1 hover:border-[#00ff88] hover:shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Richiesta Intervista</h3>
              <p className="text-[#a0a0a0] leading-relaxed">Felice di condividere la mia esperienza su podcasting, sviluppo indie, narrative design e uso creativo dell'intelligenza artificiale.</p>
            </div>
            
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a] transition-all duration-300 hover:-translate-y-1 hover:border-[#00ff88] hover:shadow-lg">
              <h3 className="text-xl font-semibold text-white mb-3">Consulenza Tecnica</h3>
              <p className="text-[#a0a0a0] leading-relaxed">Consulenze su progetti digitali, workflow di produzione audio, o implementazione creativa di strumenti AI.</p>
            </div>
          </div>
          
          <div className="text-center">
            <Link to="/contatti" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-[#0a0a0a] font-bold rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-[#00ff88]/20">
              Iniziamo a Collaborare
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

import React from 'react';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const Corridor2193TheLastRun = () => {
  return (
    <>
      <header className="py-16 bg-gradient-to-br from-[#002a15] to-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="max-w-4xl mx-auto px-8">
          <Link to="/chi-sono" className="inline-flex items-center gap-2 text-[#00ff88] hover:text-[#00cc6a] transition-colors mb-8">
            <ArrowLeft size={20} />
            Torna a Chi Sono
          </Link>
          
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 text-sm text-[#b3b3b3]">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>20 Maggio 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>6 min di lettura</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Simone Pizzi</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              CORRIDOR 2193: The Last Run - Storia e Struttura Interattiva Complete al 100%
            </h1>
            
            <p className="text-xl text-[#b3b3b3] leading-relaxed">
              Dopo mesi di sviluppo intenso, sono orgoglioso di annunciare il completamento di "Corridor 2193: The Last Run", un'avventura testuale interattiva dark sci-fi che omaggia i classici come Doom e Quake.
            </p>
          </div>
        </div>
      </header>

      <article className="py-20 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-8">
          <div className="prose prose-invert max-w-none">
            <div className="mb-8">
              <img 
                src="/assets/corridor2021_open.png" 
                alt="Corridor 2193 The Last Run - Avventura testuale sci-fi" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>

            <h2 className="text-3xl font-bold text-[#00ff88] mb-6">Un Omaggio ai Classici FPS</h2>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              "CORRIDOR 2193: The Last Run" è nato dalla passione per i classici FPS degli anni '90. 
              Ho voluto catturare l'atmosfera dark e l'intensità di giochi come Doom e Quake, 
              trasportandoli in un formato di avventura testuale interattiva.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">L'Ambientazione Dark Sci-Fi</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Il gioco è ambientato nel 2193, in un futuro distopico dove l'umanità ha colonizzato 
              lo spazio ma ha perso il controllo delle sue creazioni. Il giocatore si trova in una 
              stazione spaziale infestata da creature biomeccaniche, con l'obiettivo di sopravvivere 
              e scoprire la verità.
            </p>

            <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-6 my-8">
              <h4 className="text-xl font-semibold text-[#00ff88] mb-4">🌌 La Storia</h4>
              <p className="text-[#e0e0e0] leading-relaxed">
                Il protagonista è un marine spaziale che si risveglia nella stazione Corridor 2193 
                senza memoria. Deve navigare attraverso i corridoi infestati, combattere creature 
                biomeccaniche e scoprire cosa è successo alla stazione e ai suoi occupanti.
              </p>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Sistema di Combattimento</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Ho implementato un sistema di combattimento a turni che ricrea l'intensità degli FPS 
              classici. Il giocatore deve gestire risorse limitate, scegliere le armi giuste per 
              ogni situazione e utilizzare l'ambiente a proprio vantaggio.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">L'Esplorazione</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              La stazione è un labirinto di corridoi, stanze e passaggi segreti. Ogni area nasconde 
              segreti, armi, munizioni e indizi sulla storia della stazione. L'esplorazione è 
              fondamentale per la sopravvivenza e per svelare la trama.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Le Creature Biomeccaniche</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Ho creato una varietà di nemici, ognuno con comportamenti e debolezze uniche. 
              Dalle creature biomeccaniche più semplici ai boss finali, ogni incontro richiede 
              strategia e adattamento.
            </p>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 my-8">
              <h4 className="text-xl font-semibold text-[#00ff88] mb-4">🔧 Caratteristiche Tecniche</h4>
              <ul className="space-y-2 text-[#e0e0e0]">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Engine personalizzato in Python
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Sistema di inventario dinamico
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Mappa interattiva della stazione
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Sistema di save/load multiplo
                </li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">L'Atmosfera Audio-Visiva</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Nonostante sia un'avventura testuale, ho lavorato molto per creare un'atmosfera 
              immersiva attraverso descrizioni dettagliate, effetti sonori testuali e una 
              narrazione che trasporta il giocatore nel mondo del gioco.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Sistema di Progressione</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Il giocatore può migliorare le proprie abilità, scoprire nuove armi e sbloccare 
              aree segrete. Ogni playthrough può essere diverso, con scelte che influenzano 
              la difficoltà e l'accesso a contenuti speciali.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Le Sfide dello Sviluppo</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Creare un'avventura testuale che catturasse l'essenza degli FPS classici è stata 
              una sfida significativa. Ho dovuto bilanciare l'azione con la narrativa, mantenendo 
              sempre l'atmosfera dark e l'intensità del gameplay.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Completamento al 100%</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Dopo mesi di sviluppo, il gioco è finalmente completo al 100%. Tutte le storie 
              sono state scritte, tutti i percorsi sono stati testati e tutti i bug sono stati 
              risolti. Il risultato è un'esperienza coerente e coinvolgente.
            </p>

            <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-8 my-8">
              <h4 className="text-2xl font-semibold text-[#00ff88] mb-4">🎯 Conclusioni</h4>
              <p className="text-[#e0e0e0] leading-relaxed mb-4">
                "CORRIDOR 2193: The Last Run" rappresenta il culmine di mesi di lavoro e passione. 
                È un omaggio ai giochi che hanno formato la mia infanzia, reinterpretati attraverso 
                il medium dell'avventura testuale interattiva.
              </p>
              <p className="text-[#e0e0e0] leading-relaxed">
                Spero che i giocatori possano apprezzare l'atmosfera dark, l'azione intensa e 
                la storia coinvolgente che ho cercato di creare.
              </p>
            </div>

            <div className="border-t border-[#2a2a2a] pt-8 mt-12">
              <p className="text-[#b3b3b3] text-sm">
                <strong>Tag:</strong> Corridor 2193, Avventura Testuale, Sci-Fi, FPS, Doom, Quake, Sviluppo Videogiochi
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default Corridor2193TheLastRun; 
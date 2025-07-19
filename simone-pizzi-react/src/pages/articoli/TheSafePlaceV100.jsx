import React from 'react';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const TheSafePlaceV100 = () => {
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
                <span>28 Giugno 2025</span>
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
              The Safe Place v0.2.0 "The Balanced World" – Riprogettazione Totale in Godot
            </h1>
            
            <p className="text-xl text-[#b3b3b3] leading-relaxed">
              È con grande entusiasmo che annuncio il raggiungimento della Milestone 2 di The Safe Place v0.2.0 "The Balanced World"! Dopo una riprogettazione totale da zero in Godot, il progetto è evoluto a vero GDR post-apocalittico con estetica CRT anni '80.
            </p>
          </div>
        </div>
      </header>

      <article className="py-20 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-8">
          <div className="prose prose-invert max-w-none">
            <div className="mb-8">
              <img 
                src="/assets/TSP.jpg" 
                alt="The Safe Place The Balanced World" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>

            <h2 className="text-3xl font-bold text-[#00ff88] mb-6">La Nascita di "The Balanced World"</h2>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Dopo mesi di sviluppo e iterazioni, The Safe Place ha subito una trasformazione radicale. 
              La versione 0.2.0 "The Balanced World" rappresenta non solo un aggiornamento, ma una 
              riprogettazione completa del progetto, portandolo da un semplice esperimento a un vero 
              e proprio GDR post-apocalittico.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">La Scelta di Godot</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              La decisione di migrare a Godot è stata dettata dalla necessità di avere un motore più 
              robusto e flessibile. Godot offre strumenti potenti per la gestione delle scene, 
              l'animazione e la fisica, permettendomi di concentrarmi sulla creatività invece che 
              sui dettagli tecnici.
            </p>

            <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-6 my-8">
              <h4 className="text-xl font-semibold text-[#00ff88] mb-4">🎮 Caratteristiche Principali</h4>
              <ul className="space-y-2 text-[#e0e0e0]">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Estetica CRT anni '80 con effetti retro
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Sistema di combattimento a turni
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Narrativa non-lineare con scelte multiple
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Sistema di crafting e sopravvivenza
                </li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">L'Estetica CRT</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Uno degli aspetti più distintivi di questa versione è l'estetica CRT anni '80. 
              Ho implementato shader personalizzati per simulare l'effetto di un vecchio monitor 
              a tubo catodico, con scanlines, distorsioni e colori che richiamano l'epoca d'oro 
              dei videogiochi.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Sistema di Combattimento</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Il combattimento è stato completamente ridisegnato come sistema a turni strategico. 
              Ogni decisione conta, e la pianificazione è fondamentale per la sopravvivenza. 
              Il sistema include diverse classi di armi, armature e abilità speciali.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">La Narrativa Non-Lineare</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              La storia si adatta alle scelte del giocatore, con ramificazioni che portano a 
              diversi finali e percorsi alternativi. Ogni decisione ha conseguenze a lungo termine, 
              creando un'esperienza unica per ogni playthrough.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Sistema di Crafting</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              La sopravvivenza nel mondo post-apocalittico richiede ingegno e risorse. 
              Il sistema di crafting permette di creare armi, armature e oggetti utili 
              combinando materiali trovati nel mondo di gioco.
            </p>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 my-8">
              <h4 className="text-xl font-semibold text-[#00ff88] mb-4">🔧 Sviluppo Tecnico</h4>
              <ul className="space-y-2 text-[#e0e0e0]">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Godot 4.2 con GDScript
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Shader personalizzati per effetti CRT
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Sistema di save/load persistente
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Ottimizzazione per performance
                </li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">Le Sfide dello Sviluppo</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              La migrazione a Godot ha presentato sfide significative, dalla gestione delle scene 
              complesse all'ottimizzazione delle performance. Ma ogni ostacolo ha portato a 
              soluzioni innovative e a una comprensione più profonda del motore.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Futuro del Progetto</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              "The Balanced World" è solo l'inizio. Ho in programma di aggiungere nuove aree, 
              personaggi e meccaniche di gioco. Il feedback della community sarà fondamentale 
              per guidare lo sviluppo futuro.
            </p>

            <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-8 my-8">
              <h4 className="text-2xl font-semibold text-[#00ff88] mb-4">🎯 Conclusioni</h4>
              <p className="text-[#e0e0e0] leading-relaxed mb-4">
                The Safe Place v0.2.0 "The Balanced World" rappresenta un punto di svolta nel 
                mio percorso di sviluppo. È la dimostrazione che con perseveranza e passione 
                è possibile trasformare un'idea in qualcosa di concreto e coinvolgente.
              </p>
              <p className="text-[#e0e0e0] leading-relaxed">
                Il progetto continua a evolversi, e sono entusiasta di condividere questo 
                viaggio con tutti voi. Grazie per il supporto e la pazienza!
              </p>
            </div>

            <div className="border-t border-[#2a2a2a] pt-8 mt-12">
              <p className="text-[#b3b3b3] text-sm">
                <strong>Tag:</strong> The Safe Place, Godot, GDR, Post-Apocalittico, CRT, Sviluppo Videogiochi
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default TheSafePlaceV100; 
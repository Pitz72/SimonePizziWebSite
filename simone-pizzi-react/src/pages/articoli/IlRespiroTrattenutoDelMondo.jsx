import React from 'react';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const IlRespiroTrattenutoDelMondo = () => {
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
                <span>15 Giugno 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>7 min di lettura</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Simone Pizzi</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Il Respiro Trattenuto del Mondo v1.5 - Primo Videogioco Desktop Completato
            </h1>
            
            <p className="text-xl text-[#b3b3b3] leading-relaxed">
              Un progetto che segna una tappa importante nel mio percorso di sviluppo. La versione 1.5, il mio primo videogioco desktop completo che unisce narrativa letteraria, tecnologie moderne e opzioni di accessibilità.
            </p>
          </div>
        </div>
      </header>

      <article className="py-20 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-8">
          <div className="prose prose-invert max-w-none">
            <div className="mb-8">
              <img 
                src="/assets/icona-respiro.jpg" 
                alt="Il Respiro Trattenuto del Mondo - Videogioco Desktop" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>

            <h2 className="text-3xl font-bold text-[#00ff88] mb-6">Un Viaggio nella Narrativa Interattiva</h2>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              "Il Respiro Trattenuto del Mondo" è nato dall'idea di creare un'esperienza narrativa 
              che potesse trasportare il giocatore in un mondo immaginario, dove ogni scelta conta 
              e ogni decisione ha conseguenze reali sulla storia.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">L'Ispirazione Letteraria</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Il progetto trae ispirazione dalla letteratura fantastica e dalla narrativa d'avventura. 
              Ho voluto creare un mondo ricco di dettagli, con personaggi complessi e una trama che 
              si adatta alle scelte del giocatore, mantenendo sempre la coerenza narrativa.
            </p>

            <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-6 my-8">
              <h4 className="text-xl font-semibold text-[#00ff88] mb-4">📖 La Storia</h4>
              <p className="text-[#e0e0e0] leading-relaxed">
                Il gioco racconta la storia di un mondo dove il respiro è diventato una risorsa preziosa. 
                Il giocatore deve navigare attraverso questo universo, prendendo decisioni che influenzano 
                non solo il proprio destino, ma anche quello dell'intero mondo.
              </p>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">Le Sfide Tecniche</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Sviluppare un videogioco completo per desktop ha presentato sfide significative. 
              Dalla gestione della memoria alla creazione di un'interfaccia intuitiva, ogni 
              aspetto del progetto ha richiesto attenzione e cura.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">L'Accessibilità</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Uno degli obiettivi principali del progetto è stato rendere il gioco accessibile 
              al maggior numero possibile di giocatori. Ho implementato opzioni per la personalizzazione 
              dei controlli, il supporto per screen reader e la possibilità di regolare la velocità del testo.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Sistema di Scelte</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Il cuore del gioco è il sistema di scelte che permette al giocatore di influenzare 
              la storia. Ogni decisione ha conseguenze a lungo termine, creando un'esperienza 
              unica per ogni playthrough.
            </p>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 my-8">
              <h4 className="text-xl font-semibold text-[#00ff88] mb-4">🔧 Caratteristiche Tecniche</h4>
              <ul className="space-y-2 text-[#e0e0e0]">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Engine personalizzato in C++
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Sistema di save/load persistente
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Supporto per Windows, macOS e Linux
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Ottimizzazione per performance
                </li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Processo di Sviluppo</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Lo sviluppo è durato diversi mesi, con iterazioni continue basate sul feedback 
              dei tester. Ogni versione ha portato miglioramenti significativi, sia dal punto 
              di vista tecnico che narrativo.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">La Versione 1.5</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              La versione 1.5 rappresenta il culmine di questo percorso di sviluppo. Include 
              nuove scene, miglioramenti all'interfaccia utente e correzioni di bug basate 
              sul feedback della community.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Futuro del Progetto</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              "Il Respiro Trattenuto del Mondo" continuerà a evolversi. Ho in programma di 
              aggiungere nuove storie, espandere il mondo di gioco e migliorare ulteriormente 
              l'accessibilità.
            </p>

            <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-8 my-8">
              <h4 className="text-2xl font-semibold text-[#00ff88] mb-4">🎯 Conclusioni</h4>
              <p className="text-[#e0e0e0] leading-relaxed mb-4">
                Questo progetto mi ha insegnato che creare un videogioco completo richiede 
                non solo competenze tecniche, ma anche passione e perseveranza. È stato un 
                viaggio incredibile che ha arricchito il mio bagaglio di esperienze.
              </p>
              <p className="text-[#e0e0e0] leading-relaxed">
                Spero che "Il Respiro Trattenuto del Mondo" possa offrire ai giocatori 
                un'esperienza coinvolgente e memorabile.
              </p>
            </div>

            <div className="border-t border-[#2a2a2a] pt-8 mt-12">
              <p className="text-[#b3b3b3] text-sm">
                <strong>Tag:</strong> Il Respiro Trattenuto del Mondo, Videogiochi, Narrativa Interattiva, Accessibilità, Sviluppo
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default IlRespiroTrattenutoDelMondo; 
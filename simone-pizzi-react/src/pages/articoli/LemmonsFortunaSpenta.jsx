import React from 'react';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const LemmonsFortunaSpenta = () => {
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
                <span>23 Giugno 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>8 min di lettura</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Simone Pizzi</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Lemmons: Una Fortuna Spenta - Dall'Idea alla Realizzazione Tecnica
            </h1>
            
            <p className="text-xl text-[#b3b3b3] leading-relaxed">
              Un viaggio nello sviluppo di un'interactive fiction italiana: dall'esperimento su Inkle Writer ai limiti tecnici di Ink, fino alla riprogettazione totale verso piattaforme più evolute come Yarn Spinner e Godot.
            </p>
          </div>
        </div>
      </header>

      <article className="py-20 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-8">
          <div className="prose prose-invert max-w-none">
            <div className="mb-8">
              <img 
                src="/assets/lemmons.jpg" 
                alt="Lemmons Una Fortuna Spenta - Videogioco italiano" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>

            <h2 className="text-3xl font-bold text-[#00ff88] mb-6">L'Origine del Progetto</h2>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              "Lemmons: Una Fortuna Spenta" è nato da un'idea semplice ma potente: creare un'interactive 
              fiction che raccontasse una storia italiana, con personaggi e situazioni che risuonassero 
              con la nostra cultura e le nostre esperienze quotidiane.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">I Primi Esperimenti con Inkle Writer</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Ho iniziato il progetto utilizzando Inkle Writer, una piattaforma online per la creazione 
              di interactive fiction. Era perfetta per sperimentare con la narrativa e testare le prime 
              idee, ma presto ho scoperto i limiti della piattaforma per un progetto più ambizioso.
            </p>

            <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-6 my-8">
              <h4 className="text-xl font-semibold text-[#00ff88] mb-4">📚 La Storia di Lemmons</h4>
              <p className="text-[#e0e0e0] leading-relaxed">
                La storia segue le vicende di Marco, un giovane che eredita una fortuna inaspettata 
                ma deve affrontare scelte morali complesse. Il giocatore deve guidare Marco attraverso 
                una serie di decisioni che influenzano non solo il suo destino, ma anche quello delle 
                persone che lo circondano.
              </p>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">La Migrazione a Ink</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Dopo aver esplorato Inkle Writer, ho deciso di migrare a Ink, il linguaggio di scripting 
              sviluppato da Inkle. Ink offre maggiore controllo e flessibilità, permettendo di creare 
              narrative più complesse e interattive.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">I Limiti Tecnici</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Nonostante i vantaggi di Ink, ho incontrato limiti significativi. La mancanza di supporto 
              per funzionalità avanzate come il salvataggio dello stato, la gestione di variabili complesse 
              e l'integrazione con sistemi esterni mi ha spinto a cercare alternative più robuste.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">La Scelta di Yarn Spinner</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Yarn Spinner si è rivelata la soluzione ideale. Questo sistema di dialogue scripting, 
              originariamente sviluppato per Night in the Woods, offre strumenti potenti per la 
              gestione di narrative complesse e l'integrazione con motori di gioco moderni.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">L'Integrazione con Godot</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              La decisione di utilizzare Godot come motore di gioco ha permesso di sfruttare al massimo 
              le potenzialità di Yarn Spinner. L'integrazione tra i due sistemi ha creato un workflow 
              di sviluppo fluido ed efficiente.
            </p>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 my-8">
              <h4 className="text-xl font-semibold text-[#00ff88] mb-4">🔧 Stack Tecnologico</h4>
              <ul className="space-y-2 text-[#e0e0e0]">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Yarn Spinner per il dialogue scripting
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Godot 4.2 come motore di gioco
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  GDScript per la logica di gioco
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Sistema di save/load personalizzato
                </li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">Le Sfide della Narrativa Interattiva</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Creare una narrativa interattiva coinvolgente richiede un equilibrio delicato tra 
              libertà di scelta e coerenza narrativa. Ogni decisione deve avere conseguenze 
              significative, ma la storia deve rimanere coerente e coinvolgente.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Sistema di Scelte</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Ho implementato un sistema di scelte che va oltre il semplice "scegli A o B". 
              Le decisioni del giocatore influenzano la personalità del protagonista, le relazioni 
              con gli altri personaggi e persino il tono della narrazione.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Futuro del Progetto</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              "Lemmons: Una Fortuna Spenta" è in continua evoluzione. Sto lavorando per aggiungere 
              nuove scene, espandere le ramificazioni narrative e migliorare l'esperienza utente 
              basandomi sul feedback dei tester.
            </p>

            <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-8 my-8">
              <h4 className="text-2xl font-semibold text-[#00ff88] mb-4">🎯 Conclusioni</h4>
              <p className="text-[#e0e0e0] leading-relaxed mb-4">
                Lo sviluppo di "Lemmons" mi ha insegnato che la scelta degli strumenti tecnici è 
                fondamentale per il successo di un progetto. La migrazione da Inkle Writer a Yarn 
                Spinner e Godot ha permesso di realizzare la visione originale del progetto.
              </p>
              <p className="text-[#e0e0e0] leading-relaxed">
                La narrativa interattiva rappresenta un medium unico per raccontare storie, 
                e sono entusiasta di continuare a esplorare le sue potenzialità.
              </p>
            </div>

            <div className="border-t border-[#2a2a2a] pt-8 mt-12">
              <p className="text-[#b3b3b3] text-sm">
                <strong>Tag:</strong> Lemmons, Interactive Fiction, Yarn Spinner, Godot, Narrativa, Sviluppo Videogiochi
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default LemmonsFortunaSpenta; 
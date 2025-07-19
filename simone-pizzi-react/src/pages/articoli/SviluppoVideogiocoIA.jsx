import React from 'react';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const SviluppoVideogiocoIA = () => {
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
                <span>1 Luglio 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>9 min di lettura</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Simone Pizzi</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Come ho provato a far scrivere un videogioco a un'IA (e cosa ho imparato)
            </h1>
            
            <p className="text-xl text-[#b3b3b3] leading-relaxed">
              Il viaggio di sviluppo di The Safe Place con Gemini: dall'idea di ricrecare un gioco d'infanzia usando l'IA come collaboratore, alle sfide, frustrazioni e lezioni apprese in questo esperimento di programmazione con LLM.
            </p>
          </div>
        </div>
      </header>

      <article className="py-20 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-8">
          <div className="prose prose-invert max-w-none">
            <div className="mb-8">
              <img 
                src="/assets/01viaggiatore.png" 
                alt="Il Viaggiatore - Sviluppo con IA" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>

            <h2 className="text-3xl font-bold text-[#00ff88] mb-6">L'Idea: Ricreare un Gioco d'Infanzia con l'AI</h2>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Tutto è iniziato con un ricordo. Un gioco che avevo giocato da bambino, semplice ma coinvolgente, 
              che mi aveva lasciato un'impronta indelebile. L'idea era apparentemente semplice: usare l'intelligenza 
              artificiale per ricreare quell'esperienza, trasformando un'idea vaga in un progetto concreto.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">La Scelta di Gemini</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Ho scelto Google Gemini come partner di sviluppo per diverse ragioni. La sua capacità di comprendere 
              il contesto, la familiarità con il codice e la possibilità di iterazioni rapide mi sembravano perfette 
              per questo esperimento. Inoltre, la sua conoscenza del linguaggio naturale italiano era un vantaggio 
              non trascurabile.
            </p>

            <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-6 my-8">
              <h4 className="text-xl font-semibold text-[#00ff88] mb-4">💡 L'Approccio Sperimentale</h4>
              <p className="text-[#e0e0e0] leading-relaxed">
                Ho deciso di trattare l'AI non come un semplice strumento, ma come un vero collaboratore. 
                Questo significava coinvolgerla in ogni fase del processo: dalla concezione dell'idea alla 
                scrittura del codice, dalla risoluzione dei bug all'ottimizzazione delle performance.
              </p>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">Le Prime Sfide</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              I primi tentativi furono... interessanti. L'AI riusciva a generare codice funzionante, ma spesso 
              mancava di coerenza architetturale. Era come lavorare con un programmatore molto talentuoso ma 
              che dimenticava facilmente quello che aveva fatto cinque minuti prima.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">La Gestione del Contesto</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Una delle sfide più grandi è stata mantenere il contesto durante le sessioni di sviluppo. 
              L'AI tendeva a "dimenticare" decisioni precedenti o a contraddirsi. Ho dovuto sviluppare un 
              sistema di documentazione molto dettagliato e sessioni di lavoro più brevi ma più focalizzate.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">I Momenti di Frustrazione</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Ci sono stati momenti in cui ho pensato di abbandonare l'esperimento. L'AI generava codice 
              che sembrava perfetto ma poi falliva in modi imprevedibili. Era frustrante, ma ogni errore 
              mi insegnava qualcosa di nuovo sul modo in cui l'AI "pensa" e risolve i problemi.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Le Scoperte Inaspettate</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Nonostante le difficoltà, ci sono state scoperte sorprendenti. L'AI riusciva a trovare 
              soluzioni eleganti a problemi che io avevo affrontato in modo più complesso. A volte 
              suggeriva approcci che non avevo mai considerato, aprendo nuove prospettive sul design 
              del gioco.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">L'Importanza del Prompting</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Ho imparato che il modo in cui si comunica con l'AI è fondamentale. Un prompt ben strutturato 
              può fare la differenza tra un risultato mediocre e una soluzione brillante. Ho sviluppato 
              un sistema di prompting che includeva sempre contesto, esempi e vincoli specifici.
            </p>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 my-8">
              <h4 className="text-xl font-semibold text-[#00ff88] mb-4">🔧 Tecniche di Prompting Efficaci</h4>
              <ul className="space-y-2 text-[#e0e0e0]">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Fornire sempre il contesto completo del progetto
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Includere esempi di codice esistente
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Specificare vincoli e requisiti tecnici
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Chiedere spiegazioni per le decisioni prese
                </li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Risultato Finale</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Alla fine, The Safe Place è diventato qualcosa di più di un semplice esperimento. È un esempio 
              concreto di come l'AI possa essere un collaboratore prezioso nel processo creativo, a patto di 
              saperla guidare e integrare nel workflow di sviluppo.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Le Lezioni Apprese</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Questo esperimento mi ha insegnato che l'AI non sostituisce la creatività umana, ma la amplifica. 
              La chiave è trovare il giusto equilibrio tra automazione e controllo umano, tra velocità e qualità, 
              tra innovazione e tradizione.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Futuro dello Sviluppo con AI</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Guardando al futuro, sono convinto che l'AI diventerà sempre più integrata nel processo di 
              sviluppo software. Ma il vero valore non sta nell'automazione totale, bensì nella collaborazione 
              intelligente tra umani e macchine.
            </p>

            <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-8 my-8">
              <h4 className="text-2xl font-semibold text-[#00ff88] mb-4">🎯 Conclusioni</h4>
              <p className="text-[#e0e0e0] leading-relaxed mb-4">
                Sviluppare un videogioco con l'AI è stato un'esperienza che ha cambiato il mio modo di 
                pensare alla programmazione. Non è stato sempre facile, ma ogni sfida ha portato a nuove 
                scoperte e a una comprensione più profonda delle potenzialità e dei limiti dell'intelligenza artificiale.
              </p>
              <p className="text-[#e0e0e0] leading-relaxed">
                Il progetto The Safe Place continua a evolversi, e l'AI rimane un partner fondamentale 
                in questo viaggio. La lezione più importante? L'innovazione nasce dalla collaborazione, 
                non dalla sostituzione.
              </p>
            </div>

            <div className="border-t border-[#2a2a2a] pt-8 mt-12">
              <p className="text-[#b3b3b3] text-sm">
                <strong>Tag:</strong> AI, Sviluppo Software, Videogiochi, Gemini, The Safe Place, Esperimenti
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default SviluppoVideogiocoIA; 
import React from 'react';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const IlMomentoDiTrattenereIlRespiro = () => {
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
                <span>8 Agosto 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>5 min di lettura</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Simone Pizzi</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Il momento di TRATTENERE IL RESPIRO è arrivato
            </h1>
            
            <p className="text-xl text-[#b3b3b3] leading-relaxed">
              Un piccolo passo per un uomo, un passo ancora più impercettibile per l'umanità – videoludica o meno, non importa. Quello che ho terminato oggi non è rilevante per nessuno, ma lo è per me.
            </p>
          </div>
        </div>
      </header>

      <article className="py-20 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-8">
          <div className="prose prose-invert max-w-none">
            <div className="mb-8">
              <img 
                src="/assets/respiro-orizzontale.png" 
                alt="Il Respiro Trattenuto del Mondo - Cover"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>

            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Eccoci qui, finalmente. Un piccolo passo per un uomo, un passo ancora più impercettibile per l'umanità – videoludica o meno, non importa. Quello che ho terminato oggi non è rilevante per nessuno, ma lo è per me.
            </p>

            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Da quando ho iniziato questo percorso di sviluppo, in una sorta di simbiosi tra la mia visione concettuale e l'operatività degli LLM, mi sono reso conto di aver disperso energie, tempo e risorse. Questo perché, più che un vero percorso di sviluppo, è stato un percorso di apprendimento. Ogni caduta, ogni errore, ogni meccanica che faticavo a comprendere, alla fine mi spingeva a progredire verso una direzione.
            </p>

            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Tuttavia, mentre sprofondavo nella frustrazione per non aver ancora afferrato i limiti di contesto degli LLM, mentre venivo bullizzato da regressioni costanti e a volte devastanti, mentre non avevo ancora creato un mio protocollo per imbrigliare la galoppante e irragionevole follia dei modelli linguistici, cercavo delle vie di fuga. Sperimentavo, provavo a riprendere altri sentieri, tentavo di dare un senso di <em>world building</em> a quello che stavo facendo. È così che è nato il concetto di "The Safe Place Chronicles": un modo per dare un contesto a tutto ciò che mi era venuto in mente di creare.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">Ma perché avevo iniziato a fare tutte queste cose?</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Beh, l'ho detto: spesso era la frustrazione. Per non soccombere alla rabbia, pensavo a qualcosa di più semplice, di più gestibile. Così sono nati il romanzo breve e il videogioco da esso estratto, un concept che, in fondo, mi appartiene di più, visto il mio grande amore per le avventure testuali e grafiche.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 my-8">
                <div className="flex-1">
                    <img src="/assets/screen1.jpg" alt="Screenshot 1 dalla versione Android" className="w-full h-auto rounded-lg shadow-lg"/>
                </div>
                <div className="flex-1">
                    <img src="/assets/screen2.jpg" alt="Screenshot 2 dalla versione Android" className="w-full h-auto rounded-lg shadow-lg"/>
                </div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-2 mb-6">Immagini dalla versione Android</p>

            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Alla fine, "Il Respiro Trattenuto del Mondo" è diventato una piccola valvola di sfogo per sperimentare, per poi assumere una dimensione narrativa e strutturale più complessa. Allora mi sono detto: "Ok, anche questo mi sta portando via tempo e risorse, mi sta distraendo, ma almeno è più 'facile' da completare".
            </p>

            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Ed eccoci qui. Non sarà perfetto. Non avrà la coerenza narrativa che speravo, e forse anche l'uso dei puzzle e degli oggetti non è stato progettato come si dovrebbe. Ma anche questa è stata una scuola.
            </p>

            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Infine, devo confessarvi la verità: dopo aver parlato per mesi di giochi in sviluppo, avevo l'esigenza psicologica di rilasciare qualcosa di definitivo. Di toglierlo dalla mia lista di cose da fare. Di cancellare, almeno per ora, la sua repository da GitHub.
            </p>

            <p className="text-lg text-[#e0e0e0] leading-relaxed">
              Ed ecco a voi… <a href="/respiro-trattenuto/index.html" target="_blank" rel="noopener noreferrer" className="text-[#00ff88] hover:text-[#00cc6a] transition-colors font-bold">IL RESPIRO TRATTENUTO DEL MONDO</a>.
            </p>

            <div className="border-t border-[#2a2a2a] pt-8 mt-12">
              <p className="text-[#b3b3b3] text-sm">
                <strong>Tag:</strong> Sviluppo Software, Videogiochi, Narrativa, Rilasci
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default IlMomentoDiTrattenereIlRespiro;
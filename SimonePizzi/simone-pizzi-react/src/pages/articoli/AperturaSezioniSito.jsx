import React from 'react';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const AperturaSezioniSito = () => {
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
                <span>20 Giugno 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>4 min di lettura</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>Simone Pizzi</span>
              </div>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Aperte le Sezioni Videogiochi e Software: Nuovi Orizzonti Creativi
            </h1>
            
            <p className="text-xl text-[#b3b3b3] leading-relaxed">
              È con grande entusiasmo che annuncio l'apertura ufficiale di due nuove sezioni fondamentali del sito: Videogiochi e Software. Attualmente è disponibile "Il Respiro Trattenuto del Mondo", mentre altri progetti sono in arrivo.
            </p>
          </div>
        </div>
      </header>

      <article className="py-20 bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto px-8">
          <div className="prose prose-invert max-w-none">
            <div className="mb-8">
              <img 
                src="/assets/gdm.png" 
                alt="Apertura Sezioni Videogiochi e Software" 
                className="w-full h-auto rounded-lg shadow-2xl"
              />
            </div>

            <h2 className="text-3xl font-bold text-[#00ff88] mb-6">Un Nuovo Capitolo del Sito</h2>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Dopo mesi di lavoro e preparazione, sono finalmente pronte le sezioni Videogiochi e Software 
              del sito. Queste nuove aree rappresentano un'espansione significativa del progetto, 
              offrendo uno spazio dedicato ai miei lavori creativi e tecnici.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">La Sezione Videogiochi</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              La sezione Videogiochi è il luogo dove condivido i miei progetti ludici, dai primi 
              esperimenti ai lavori più maturi. È uno spazio per raccontare non solo i risultati 
              finali, ma anche il processo creativo e le sfide tecniche affrontate durante lo sviluppo.
            </p>

            <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-6 my-8">
              <h4 className="text-xl font-semibold text-[#00ff88] mb-4">🎮 Primo Progetto Disponibile</h4>
              <p className="text-[#e0e0e0] leading-relaxed">
                "Il Respiro Trattenuto del Mondo" è il primo videogioco disponibile nella sezione. 
                Questo progetto rappresenta il mio primo tentativo di creare un'esperienza ludica 
                completa, combinando narrativa letteraria con meccaniche di gioco moderne.
              </p>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">La Sezione Software</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              La sezione Software è dedicata agli strumenti e alle utility che ho sviluppato nel 
              corso degli anni. Questi progetti nascono spesso da esigenze personali e professionali, 
              e ho deciso di condividerli con la community nella speranza che possano essere utili ad altri.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">I Progetti in Arrivo</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Queste sezioni sono solo l'inizio. Ho diversi progetti in fase di sviluppo che 
              verranno aggiunti gradualmente. Ogni nuovo progetto sarà accompagnato da articoli 
              dettagliati che raccontano il processo di sviluppo e le scelte tecniche.
            </p>

            <h3 className="text-2xl font-semibold text-white mb-4">La Filosofia della Condivisione</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Credo fermamente nel valore della condivisione e della trasparenza nel processo 
              creativo. Queste sezioni non sono solo showcase dei lavori finiti, ma anche 
              documentazione del percorso che porta dall'idea alla realizzazione.
            </p>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 my-8">
              <h4 className="text-xl font-semibold text-[#00ff88] mb-4">📋 Cosa Aspettarsi</h4>
              <ul className="space-y-2 text-[#e0e0e0]">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Articoli dettagliati sui processi di sviluppo
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Download diretti dei software e videogiochi
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Tutorial e guide tecniche
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                  Feedback e suggerimenti dalla community
                </li>
              </ul>
            </div>

            <h3 className="text-2xl font-semibold text-white mb-4">Il Futuro del Sito</h3>
            <p className="text-lg text-[#e0e0e0] leading-relaxed mb-6">
              Queste nuove sezioni rappresentano un passo importante nell'evoluzione del sito. 
              Il progetto continua a crescere e ad adattarsi alle nuove esigenze e opportunità 
              che emergono dal mio percorso creativo e professionale.
            </p>

            <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-8 my-8">
              <h4 className="text-2xl font-semibold text-[#00ff88] mb-4">🎯 Invito alla Community</h4>
              <p className="text-[#e0e0e0] leading-relaxed mb-4">
                Vi invito a esplorare queste nuove sezioni e a condividere i vostri pensieri e 
                feedback. Ogni commento, ogni suggerimento è prezioso per migliorare i progetti 
                futuri e rendere il sito sempre più utile e interessante.
              </p>
              <p className="text-[#e0e0e0] leading-relaxed">
                Grazie per essere parte di questo viaggio creativo!
              </p>
            </div>

            <div className="border-t border-[#2a2a2a] pt-8 mt-12">
              <p className="text-[#b3b3b3] text-sm">
                <strong>Tag:</strong> Sito Web, Videogiochi, Software, Sviluppo, Community, Progetti
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default AperturaSezioniSito; 
import React from 'react';
import { Download, ArrowLeft, Music, Mic, Settings, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdvancedJingleMachine = () => {
  const features = [
    {
      icon: <Music size={24} />,
      title: "Jingle Creation",
      description: "Crea jingle professionali con effetti audio avanzati e automazioni"
    },
    {
      icon: <Mic size={24} />,
      title: "Voice Processing",
      description: "Elaborazione vocale con filtri, compressione e effetti real-time"
    },
    {
      icon: <Settings size={24} />,
      title: "Advanced Controls",
      description: "Controlli granulari per ogni parametro audio e automazione"
    },
    {
      icon: <Zap size={24} />,
      title: "Real-time Processing",
      description: "Elaborazione audio in tempo reale senza latenza"
    }
  ];

  return (
    <>
      <header className="py-16 bg-gradient-to-br from-[#002a15] to-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-8">
          <Link to="/software" className="inline-flex items-center gap-2 text-[#00ff88] hover:text-[#00cc6a] transition-colors mb-8">
            <ArrowLeft size={20} />
            Torna ai Software
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl lg:text-5xl font-bold text-white">Advanced Jingle Machine</h1>
              <p className="text-xl text-[#b3b3b3] leading-relaxed">
                Software professionale per la creazione di jingle e effetti audio. 
                Ideale per podcast, radio e produzioni audio professionali.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="bg-[#00ff88]/20 text-[#00ff88] px-3 py-1 rounded-full text-sm font-medium">Versione 1.8</span>
                <span className="bg-[#2a2a2a] text-[#e0e0e0] px-3 py-1 rounded-full text-sm">15 MB</span>
                <span className="bg-[#2a2a2a] text-[#e0e0e0] px-3 py-1 rounded-full text-sm">Windows</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="/downloads/utility/AJM-free.7z" 
                  className="bg-[#00ff88] text-[#0a0a0a] px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#00ff88] transition-colors flex items-center gap-2"
                  download
                >
                  <Download size={20} />
                  Scarica Gratis
                </a>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <img 
                src="/assets/advjingle.png" 
                alt="Advanced Jingle Machine - Screenshot" 
                className="max-w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </header>

      <section className="py-20 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-[#00ff88] mb-6">Perché AJM?</h2>
                <p className="text-lg text-[#e0e0e0] leading-relaxed">
                  Advanced Jingle Machine è nato dall'esigenza di creare jingle professionali 
                  in modo rapido ed efficiente. Combina la semplicità d'uso con funzionalità 
                  avanzate per soddisfare le esigenze di podcaster e produttori audio.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Funzionalità Principali</h3>
                <ul className="space-y-2 text-[#e0e0e0]">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Editor audio multi-traccia con timeline visuale
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Effetti audio professionali (reverb, delay, compressione)
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Automazione parametri in tempo reale
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Template predefiniti per diversi tipi di jingle
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Export in formati multipli (MP3, WAV, FLAC)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Workflow Tipico</h3>
                <ol className="space-y-3 text-[#e0e0e0]">
                  <li className="flex gap-3">
                    <span className="bg-[#00ff88] text-[#0a0a0a] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                    <div><strong>Import Audio:</strong> Carica file audio o registra direttamente</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-[#00ff88] text-[#0a0a0a] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                    <div><strong>Editing:</strong> Taglia, unisci e organizza i segmenti audio</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-[#00ff88] text-[#0a0a0a] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                    <div><strong>Effetti:</strong> Applica filtri e effetti audio professionali</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-[#00ff88] text-[#0a0a0a] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                    <div><strong>Export:</strong> Esporta il jingle finale nel formato desiderato</div>
                  </li>
                </ol>
              </div>

              <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-[#00ff88] mb-4">🎵 Suggerimento</h4>
                <p className="text-[#e0e0e0] leading-relaxed">
                  Utilizza i template predefiniti per iniziare rapidamente. Puoi personalizzarli 
                  e salvarli per progetti futuri. Per jingle radio, raccomando una durata 
                  di 3-5 secondi per massima efficacia.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#00ff88] mb-4">Download</h3>
                <a 
                  href="/downloads/utility/AJM-free.7z" 
                  className="w-full bg-[#00ff88] text-[#0a0a0a] px-4 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#00ff88] transition-colors flex items-center justify-center gap-2"
                  download
                >
                  <Download size={16} />
                  AJM v1.8 (15 MB)
                </a>
                <p className="text-sm text-[#b3b3b3] mt-3 text-center">
                  File .7z - Richiede 7-Zip per l'estrazione
                </p>
              </div>

              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#00ff88] mb-4">Requisiti di Sistema</h3>
                <ul className="space-y-2 text-[#e0e0e0]">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Windows 10/11
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    4 GB RAM raccomandati
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    100 MB spazio libero
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Scheda audio compatibile
                  </li>
                </ul>
              </div>

              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#00ff88] mb-4">Supporto</h3>
                <p className="text-[#e0e0e0] leading-relaxed">
                  Hai domande o problemi? 
                  <Link to="/contatti" className="text-[#00ff88] hover:text-[#00cc6a] transition-colors"> Contattami</Link> e ti aiuterò a risolverli.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-[#00ff88] mb-12 text-center">Caratteristiche Principali</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#00ff88]/30 transition-colors">
                <div className="text-[#00ff88] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-[#b3b3b3] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AdvancedJingleMachine;

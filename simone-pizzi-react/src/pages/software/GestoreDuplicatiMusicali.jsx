import React from 'react';
import { Download, ArrowLeft, Zap, Music, Mic, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

const GestoreDuplicatiMusicali = () => {
  const features = [
    {
      icon: <Zap size={24} />,
      title: "Scansione Veloce",
      description: "Algoritmi ottimizzati per analizzare rapidamente grandi collezioni musicali"
    },
    {
      icon: <Music size={24} />,
      title: "Rilevamento Preciso",
      description: "Identifica duplicati anche con nomi file diversi basandosi sui metadati"
    },
    {
      icon: <Mic size={24} />,
      title: "Preview Audio",
      description: "Ascolta i file prima di decidere quali eliminare"
    },
    {
      icon: <Headphones size={24} />,
      title: "Gestione Sicura",
      description: "Sposta i duplicati in una cartella di sicurezza prima dell'eliminazione"
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
              <h1 className="text-4xl lg:text-5xl font-bold text-white">Gestore Duplicati Musicali</h1>
              <p className="text-xl text-[#b3b3b3] leading-relaxed">
                Utility professionale per l'identificazione e rimozione di file musicali duplicati. 
                Perfetto per organizzare grandi collezioni audio con precisione e sicurezza.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="bg-[#00ff88]/20 text-[#00ff88] px-3 py-1 rounded-full text-sm font-medium">Versione 2.1</span>
                <span className="bg-[#2a2a2a] text-[#e0e0e0] px-3 py-1 rounded-full text-sm">12 MB</span>
                <span className="bg-[#2a2a2a] text-[#e0e0e0] px-3 py-1 rounded-full text-sm">Windows</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="/downloads/utility/GDM-free.7z" 
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
                src="/assets/gdm.png" 
                alt="Gestore Duplicati Musicali - Screenshot" 
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
                <h2 className="text-3xl font-bold text-[#00ff88] mb-6">Perché GDM?</h2>
                <p className="text-lg text-[#e0e0e0] leading-relaxed">
                  Se sei un appassionato di musica con una vasta collezione di file audio, 
                  probabilmente hai già incontrato il problema dei duplicati. GDM è nato dalla mia 
                  esperienza personale nel gestire archivi audio per podcast e produzioni musicali.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Come Funziona</h3>
                <ol className="space-y-3 text-[#e0e0e0]">
                  <li className="flex gap-3">
                    <span className="bg-[#00ff88] text-[#0a0a0a] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                    <div><strong>Selezione Cartelle:</strong> Scegli le directory da analizzare</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-[#00ff88] text-[#0a0a0a] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                    <div><strong>Scansione Intelligente:</strong> L'algoritmo analizza metadati e caratteristiche audio</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-[#00ff88] text-[#0a0a0a] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                    <div><strong>Preview Risultati:</strong> Visualizza i duplicati trovati con possibilità di ascolto</div>
                  </li>
                  <li className="flex gap-3">
                    <span className="bg-[#00ff88] text-[#0a0a0a] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                    <div><strong>Gestione Sicura:</strong> Sposta o elimina i file duplicati secondo le tue preferenze</div>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Caratteristiche Tecniche</h3>
                <ul className="space-y-2 text-[#e0e0e0]">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Supporto per MP3, FLAC, WAV, OGG, M4A
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Analisi basata su hash MD5 e metadati ID3
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Interfaccia drag-and-drop intuitiva
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Log dettagliato delle operazioni
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Backup automatico prima dell'eliminazione
                  </li>
                </ul>
              </div>

              <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-[#00ff88] mb-4">📝 Nota Importante</h4>
                <p className="text-[#e0e0e0] leading-relaxed">
                  Questo software è fornito gratuitamente. Ti consiglio sempre di effettuare 
                  un backup della tua collezione musicale prima di utilizzare qualsiasi tool 
                  di gestione file automatizzato.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#00ff88] mb-4">Download</h3>
                <a 
                  href="/downloads/utility/GDM-free.7z" 
                  className="w-full bg-[#00ff88] text-[#0a0a0a] px-4 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#00ff88] transition-colors flex items-center justify-center gap-2"
                  download
                >
                  <Download size={16} />
                  GDM v2.1 (12 MB)
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
                    2 GB RAM minimo
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    50 MB spazio libero
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    .NET Framework 4.8
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

export default GestoreDuplicatiMusicali;

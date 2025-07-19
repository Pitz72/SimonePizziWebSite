import React from 'react';
import { Download, ArrowLeft, FileAudio, Tag, Settings, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const AudioMetadataConverter = () => {
  const features = [
    {
      icon: <FileAudio size={24} />,
      title: "Multi-Format Support",
      description: "Supporta MP3, FLAC, WAV, OGG, M4A e altri formati audio comuni"
    },
    {
      icon: <Tag size={24} />,
      title: "Batch Processing",
      description: "Elabora intere cartelle di file audio in una sola operazione"
    },
    {
      icon: <Settings size={24} />,
      title: "Custom Templates",
      description: "Crea template personalizzati per la formattazione dei metadati"
    },
    {
      icon: <Zap size={24} />,
      title: "High Performance",
      description: "Algoritmi ottimizzati per elaborare grandi quantità di file rapidamente"
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
              <h1 className="text-4xl lg:text-5xl font-bold text-white">Audio Metadata Converter</h1>
              <p className="text-xl text-[#b3b3b3] leading-relaxed">
                Tool professionale per la gestione e conversione dei metadati audio. 
                Organizza la tua collezione musicale con precisione e facilità.
              </p>
              <div className="flex flex-wrap gap-4">
                <span className="bg-[#00ff88]/20 text-[#00ff88] px-3 py-1 rounded-full text-sm font-medium">Versione 1.5</span>
                <span className="bg-[#2a2a2a] text-[#e0e0e0] px-3 py-1 rounded-full text-sm">8 MB</span>
                <span className="bg-[#2a2a2a] text-[#e0e0e0] px-3 py-1 rounded-full text-sm">Windows</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="/downloads/utility/AMC-Free.7z" 
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
                src="/assets/audioconv.png" 
                alt="Audio Metadata Converter - Screenshot" 
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
                <h2 className="text-3xl font-bold text-[#00ff88] mb-6">Perché AMC?</h2>
                <p className="text-lg text-[#e0e0e0] leading-relaxed">
                  I metadati audio sono fondamentali per organizzare una collezione musicale. 
                  AMC nasce dall'esigenza di gestire efficacemente i tag ID3 e altri metadati 
                  in modo professionale e automatizzato.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Funzionalità Principali</h3>
                <ul className="space-y-2 text-[#e0e0e0]">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Lettura e scrittura tag ID3v1 e ID3v2
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Supporto per metadati Vorbis Comments (OGG)
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Conversione batch di intere cartelle
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Template personalizzabili per la formattazione
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    Preview dei metadati prima della modifica
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-semibold text-white mb-4">Formati Supportati</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-center">
                    <div className="text-[#00ff88] font-semibold">MP3</div>
                    <div className="text-sm text-[#b3b3b3]">ID3v1/v2</div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-center">
                    <div className="text-[#00ff88] font-semibold">FLAC</div>
                    <div className="text-sm text-[#b3b3b3]">Vorbis Comments</div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-center">
                    <div className="text-[#00ff88] font-semibold">OGG</div>
                    <div className="text-sm text-[#b3b3b3]">Vorbis Comments</div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-center">
                    <div className="text-[#00ff88] font-semibold">WAV</div>
                    <div className="text-sm text-[#b3b3b3]">RIFF Tags</div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-center">
                    <div className="text-[#00ff88] font-semibold">M4A</div>
                    <div className="text-sm text-[#b3b3b3]">iTunes Tags</div>
                  </div>
                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 text-center">
                    <div className="text-[#00ff88] font-semibold">AAC</div>
                    <div className="text-sm text-[#b3b3b3]">ADTS Tags</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-[#00ff88]/30 rounded-xl p-6">
                <h4 className="text-xl font-semibold text-[#00ff88] mb-4">💡 Suggerimento</h4>
                <p className="text-[#e0e0e0] leading-relaxed">
                  Utilizza i template personalizzati per mantenere coerenza nella formattazione 
                  dei metadati della tua collezione musicale. Puoi salvare e riutilizzare 
                  i template per progetti futuri.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#00ff88] mb-4">Download</h3>
                <a 
                  href="/downloads/utility/AMC-Free.7z" 
                  className="w-full bg-[#00ff88] text-[#0a0a0a] px-4 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#00ff88] transition-colors flex items-center justify-center gap-2"
                  download
                >
                  <Download size={16} />
                  AMC v1.5 (8 MB)
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
                    1 GB RAM minimo
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    30 MB spazio libero
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#00ff88] rounded-full"></div>
                    .NET Framework 4.7
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

export default AudioMetadataConverter;

import React, { useState, useEffect } from 'react';
import { PortfolioItem } from '../types';
import SEO from './SEO';

interface PortfolioShowcaseProps {
  items: PortfolioItem[];
  title: string;
}

import LetterModal from './LetterModal';

const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({ items, title }) => {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);

  useEffect(() => {
    if (items && items.length > 0) {
      setSelectedItem(items[0]);
    } else {
      setSelectedItem(null);
    }
  }, [items]);

  if (!items || items.length === 0) {
    return (
      <section className="container mx-auto py-24 text-center">
        <SEO title={title} />
        <p className="text-gray-400">Nessun progetto in questa categoria.</p>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-16 sm:py-24">
      <SEO title={title} />
      <LetterModal isOpen={isLetterModalOpen} onClose={() => setIsLetterModalOpen(false)} />
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(34, 197, 94, 0.3); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(34, 197, 94, 0.5); }
      `}</style>
      <div className="mb-16">
        <h1 className="text-5xl font-bold text-white tracking-tight">{title}</h1>
      </div>
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">

        <div className="lg:col-span-4">
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setSelectedItem(item)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 transform group ${selectedItem?.id === item.id
                    ? 'bg-green-600/20 border-l-4 border-green-400 shadow-lg shadow-green-500/10' // Se selezionato
                    : item.isVisible // Se è abilitato
                      ? 'bg-gray-900/30 border-l-4 border-transparent hover:bg-gray-800/50 hover:border-green-400/70 hover:translate-x-1'
                      : 'bg-gray-900/30 border-l-4 border-transparent cursor-not-allowed opacity-50' // Se disabilitato
                    }`}
                  disabled={!item.isVisible} // Disabilita se non è visibile
                >
                  <h3 className={`font-semibold text-lg transition-colors duration-300 ${selectedItem?.id === item.id ? 'text-green-300' : (item.isVisible ? 'text-white group-hover:text-green-300' : 'text-gray-500')}`}>{item.title}</h3>
                  <p className={`text-sm line-clamp-2 mt-1 ${selectedItem?.id === item.id ? 'text-gray-300' : (item.isVisible ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500')}`}>{item.summary}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-8">
          {selectedItem && (
            <div key={selectedItem.id} className="sticky top-28 animate-fade-in">
              <div className="bg-gray-900/30 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/10 overflow-hidden">
                <div className="aspect-video w-full mb-8 rounded-lg overflow-hidden shadow-2xl shadow-black/50">
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover object-[50%_65%]"
                  />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{selectedItem.title}</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedItem.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 text-sm font-medium text-green-300 bg-green-900/60 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-h-[45vh] overflow-y-auto custom-scrollbar max-w-full">
                  <div dangerouslySetInnerHTML={{ __html: selectedItem.description }} />
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                  {selectedItem.link && selectedItem.link !== '#' && (
                    <a
                      href={selectedItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-500 text-black font-bold text-lg px-8 py-4 rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
                    >
                      {selectedItem.buttonText || 'Scopri di più'}
                    </a>
                  )}

                  {/* Pulsante Lettera alla Community (solo per The Safe Place) */}
                  {selectedItem.id === 1 && (
                    <button
                      onClick={() => setIsLetterModalOpen(true)}
                      className="inline-block bg-gray-800 text-green-400 border border-green-500/50 font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-700 hover:border-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-900/20"
                    >
                      Lettera Alla Community
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default PortfolioShowcase;

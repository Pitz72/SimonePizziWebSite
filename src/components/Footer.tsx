import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();

  // Nascondiamo la card donazione se siamo in un articolo singolo
  // Gli articoli hanno path del tipo /categoria/slug-articolo
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isArticlePage = pathParts.length >= 2 && 
    ['videogiochi', 'progetti-software', 'narrativa-e-pubblicazioni', 'podcast-audio-altro', 'blog-e-riflessioni'].includes(pathParts[0]);

  return (
    <footer className="border-t border-gray-800/50 bg-black/20 backdrop-blur-sm mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        {!isArticlePage && (
          <div className="mb-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">Sostieni il Progetto</h3>
            <p className="text-gray-400 mb-6">
              Sostenendo me, sostieni i miei progetti e tutta la struttura di Runtime Radio.
              Ogni contributo aiuta a mantenere vivi questi mondi digitali.
            </p>
            <a
              href="https://www.paypal.com/paypalme/simonepizzi"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0070BA] text-white font-bold py-3 px-8 rounded-full hover:bg-[#003087] transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-900/30"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.946 5.05-4.336 6.73-8.339 6.73h-.69c-.314 0-.58.218-.641.524l-1.24 6.225a.645.645 0 0 1-.641.524h-1.455z" />
              </svg>
              Fai una donazione con PayPal
            </a>
          </div>
        )}
        <div className="border-t border-gray-800/50 pt-8">
          <p className="text-gray-500">&copy; {currentYear} Simone Pizzi. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

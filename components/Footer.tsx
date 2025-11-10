
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-gray-500">
        <p>&copy; {currentYear} Simone Pizzi. Tutti i diritti riservati.</p>
        <p className="text-sm mt-1">Sito di destinazione: simonepizzi.runtimeradio.it</p>
      </div>
    </footer>
  );
};

export default Footer;
   
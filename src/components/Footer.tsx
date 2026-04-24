import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800/50 bg-black/20 backdrop-blur-sm mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="pt-8">
          <p className="text-gray-500">&copy; {currentYear} Simone Pizzi. Tutti i diritti riservati.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

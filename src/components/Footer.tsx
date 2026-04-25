import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-800/50 bg-black/20 backdrop-blur-sm mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <div className="flex flex-col items-center gap-3">
          <nav aria-label="Link legali" className="flex gap-6 text-sm">
            <a
              href="/privacy"
              className="text-gray-600 hover:text-green-500 transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <span className="text-gray-800" aria-hidden="true">·</span>
            <a
              href="/cookie-policy"
              className="text-gray-600 hover:text-green-500 transition-colors duration-200"
            >
              Cookie Policy
            </a>
          </nav>
          <p className="text-gray-600 text-sm">
            &copy; {currentYear} Simone Pizzi. Tutti i diritti riservati.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

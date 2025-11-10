import React, { useState, useEffect } from 'react';
import { Category } from '../types';

interface HeaderProps {
  currentRoute: string;
}

const NavLink: React.FC<{
  href: string;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ href, isActive, children }) => (
  <a
    href={href}
    className="relative px-3 py-2 text-sm md:text-base font-medium transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 rounded-sm"
  >
    <span className={isActive ? 'text-green-400' : 'text-gray-400 hover:text-white'}>
      {children}
    </span>
    {isActive && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 animate-slide-in"></span>
    )}
  </a>
);

const Header: React.FC<HeaderProps> = ({ currentRoute }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-lg border-b border-gray-800/50' : 'bg-transparent'}`}>
      <style>{`
        @keyframes slide-in {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="#/" className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 rounded-sm group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/90 flex items-center justify-center text-black font-bold text-lg shadow-[0_0_15px_rgba(34,197,94,0.7)] transition-transform duration-300 group-hover:scale-110">
              SP
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-wider text-white">
                Simone Pizzi
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                Narrativa, AI, mondi interattivi
              </p>
            </div>
          </a>
          <div className="flex items-center space-x-2 md:space-x-4">
            <NavLink href={`#/${Category.VIDEOGIOCHI}`} isActive={currentRoute === Category.VIDEOGIOCHI}>
              Videogiochi
            </NavLink>
            <NavLink href={`#/${Category.PROGETTI_SOFTWARE}`} isActive={currentRoute === Category.PROGETTI_SOFTWARE}>
              Progetti Software
            </NavLink>
            <NavLink href={`#/${Category.NARRATIVA_E_PUBBLICAZIONI}`} isActive={currentRoute === Category.NARRATIVA_E_PUBBLICAZIONI}>
              Narrativa e Pubblicazioni
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
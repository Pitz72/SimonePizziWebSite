import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Category } from '../types';

interface CustomNavLinkProps {
  to: string;
  children: React.ReactNode;
  isDisabled?: boolean;
}

const CustomNavLink: React.FC<CustomNavLinkProps> = ({ to, children, isDisabled }) => {
  if (isDisabled) {
    return (
      <span className="relative px-3 py-2 text-sm md:text-base font-medium text-gray-400 cursor-not-allowed opacity-50">
        {children}
      </span>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative px-3 py-2 text-sm md:text-base font-medium transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 rounded-sm ${isActive ? 'text-green-400' : 'text-gray-400 hover:text-white'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 animate-slide-in"></span>
          )}
        </>
      )}
    </NavLink>
  );
};

const Header: React.FC = () => {
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
          <Link to="/" className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 rounded-sm group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/80 backdrop-blur-md flex items-center justify-center text-black font-bold text-lg shadow-[0_0_20px_rgba(34,197,94,0.8)] ring-2 ring-green-400/50 transition-transform duration-300 group-hover:scale-110">
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
          </Link>
          <div className="flex items-center space-x-2 md:space-x-4">
            <CustomNavLink to="/">
              Home
            </CustomNavLink>
            <CustomNavLink to={`/${Category.BLOG_E_RIFLESSIONI}`}>
              Blog e Riflessioni
            </CustomNavLink>
            <CustomNavLink to={`/${Category.VIDEOGIOCHI}`}>
              Videogiochi
            </CustomNavLink>
            <CustomNavLink to={`/${Category.PROGETTI_SOFTWARE}`}>
              Progetti Software
            </CustomNavLink>
            <CustomNavLink to={`/${Category.NARRATIVA_E_PUBBLICAZIONI}`}>
              Narrativa e Pubblicazioni
            </CustomNavLink>
            <CustomNavLink to={`/${Category.PODCAST_AUDIO_ALTRO}`}>
              Podcast, Radio e Altro
            </CustomNavLink>
          </div>
          <div className="ml-4">
            <Link
              to="/tutti-i-progetti"
              className="inline-block bg-green-500 text-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/40 ring-1 ring-green-400/50 hover:ring-white/50"
            >
              Tutti i Progetti
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Search } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface HeaderProps {
  onOpenSearch?: () => void;
}

interface MobileNavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick: () => void;
}

const MobileNavLink: React.FC<MobileNavLinkProps> = ({ to, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `block px-4 py-3 text-base font-medium rounded-xl transition-colors duration-200 ${
        isActive
          ? 'text-green-400 bg-green-500/10'
          : 'text-gray-300 hover:text-white hover:bg-white/5'
      }`
    }
  >
    {children}
  </NavLink>
);

interface DesktopNavLinkProps {
  to: string;
  children: React.ReactNode;
}

const DesktopNavLink: React.FC<DesktopNavLinkProps> = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `relative px-3 py-2 text-sm font-medium transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 rounded-sm ${
        isActive ? 'text-green-400' : 'text-gray-400 hover:text-white'
      }`
    }
  >
    {({ isActive }) => (
      <>
        {children}
        {isActive && (
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500 animate-slide-in" />
        )}
      </>
    )}
  </NavLink>
);

const Header: React.FC<HeaderProps> = ({ onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { categories } = useCategories();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Blocca lo scroll del body quando il menu è aperto
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <style>{`
        @keyframes slide-in {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled || isMenuOpen
            ? 'bg-black/95 backdrop-blur-lg border-b border-gray-800/50'
            : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* ── LOGO ── */}
            <Link
              to="/"
              onClick={closeMenu}
              className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 rounded-sm group flex-shrink-0"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/80 backdrop-blur-md flex items-center justify-center text-black font-bold text-lg shadow-[0_0_20px_rgba(34,197,94,0.8)] ring-2 ring-green-400/50 transition-transform duration-300 group-hover:scale-110">
                SP
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold tracking-wider text-white">
                  Simone Pizzi
                </p>
                <p className="text-xs text-gray-400 hidden sm:block">
                  Narrativa, AI, mondi interattivi
                </p>
              </div>
            </Link>

            {/* ── DESKTOP NAV ── */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2 flex-1 justify-center px-4">
              <DesktopNavLink to="/">Home</DesktopNavLink>
              {categories.map(cat => (
                <DesktopNavLink key={cat.slug} to={`/${cat.slug}`}>
                  {cat.name}
                </DesktopNavLink>
              ))}
              <DesktopNavLink to="/contatti">Contatti</DesktopNavLink>
            </div>

            {/* ── DESTRA: RSS + CTA + HAMBURGER ── */}
            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              {/* Icona RSS — sempre visibile */}
              <a
                href="/api/rss.php"
                target="_blank"
                rel="noopener noreferrer"
                title="Feed RSS"
                className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-700 text-gray-400 hover:text-orange-400 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all duration-200"
                aria-label="Feed RSS"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                  <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
                </svg>
              </a>

              {/* Tasto Ricerca */}
              <button
                onClick={onOpenSearch}
                className="flex items-center justify-center gap-2 px-3 h-9 rounded-lg border border-gray-700 text-gray-400 hover:text-green-400 hover:border-green-500/50 hover:bg-green-500/10 transition-all duration-200 group"
                aria-label="Cerca"
              >
                <Search size={16} />
                <span className="hidden lg:flex items-center gap-1.5 ml-1">
                  <span className="text-[10px] font-medium opacity-50 uppercase tracking-tighter">Cerca</span>
                  <kbd className="text-[9px] font-mono border border-white/20 px-1 rounded bg-white/5 group-hover:border-green-500/30">Ctrl K</kbd>
                </span>
              </button>

              {/* CTA "Tutti i Progetti" — solo desktop */}
              <Link
                to="/tutti-i-progetti"
                className="hidden md:inline-block bg-green-500 text-black font-bold text-sm px-4 py-2 rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/40 ring-1 ring-green-400/50 hover:ring-white/50 whitespace-nowrap"
              >
                Tutti i Progetti
              </Link>

              {/* Hamburger — solo mobile */}
              <button
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-white/5 transition-all duration-200"
                aria-label={isMenuOpen ? 'Chiudi menu' : 'Apri menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>

          </div>
        </nav>

        {/* ── MENU MOBILE DRAWER ── */}
        <div
          id="mobile-menu"
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
          aria-hidden={!isMenuOpen}
        >
          <div className="border-t border-gray-800/60 bg-black/95 backdrop-blur-lg px-4 pb-6 pt-3">
            <div className="flex flex-col gap-1">
              <MobileNavLink to="/" onClick={closeMenu}>Home</MobileNavLink>
              {categories.map(cat => (
                <MobileNavLink key={cat.slug} to={`/${cat.slug}`} onClick={closeMenu}>
                  {cat.name}
                </MobileNavLink>
              ))}
              <MobileNavLink to="/contatti" onClick={closeMenu}>Contatti</MobileNavLink>
            </div>

            {/* CTA in fondo al drawer */}
            <div className="mt-4 pt-4 border-t border-gray-800/60">
              <Link
                to="/tutti-i-progetti"
                onClick={closeMenu}
                className="block w-full text-center bg-green-500 text-black font-bold text-sm px-4 py-3 rounded-xl hover:bg-green-400 transition-all duration-300 shadow-lg shadow-green-500/40"
              >
                Tutti i Progetti →
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

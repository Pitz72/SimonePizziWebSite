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
      `block px-4 py-3 text-sm font-medium font-sans transition-colors duration-200 ${
        isActive ? 'text-dis-green' : 'text-v3-fg2 hover:text-white'
      }`
    }
  >
    {children}
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

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={
          isScrolled || isMenuOpen
            ? {
                background: 'rgba(5,8,10,0.85)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(34,197,94,0.1)',
              }
            : { background: 'transparent', borderBottom: '1px solid transparent' }
        }
      >
        <div className="flex items-center justify-between px-6 md:px-[52px] h-[72px]">

          {/* ── LOGO — DM Serif text ── */}
          <Link
            to="/"
            onClick={closeMenu}
            className="font-serif text-[21px] tracking-[0.04em] text-white no-underline flex-shrink-0 focus:outline-none"
            style={{ letterSpacing: '0.04em' }}
          >
            Simone <em className="not-italic text-dis-green">Pizzi</em>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden md:flex items-center gap-9">
            {categories.map(cat => (
              <NavLink
                key={cat.slug}
                to={`/${cat.slug}`}
                className={({ isActive }) =>
                  `text-[12px] font-medium tracking-[0.07em] transition-colors duration-200 ${
                    isActive ? 'text-dis-green' : 'text-v3-fg2 hover:text-dis-green'
                  }`
                }
              >
                {cat.name}
              </NavLink>
            ))}
            <NavLink
              to="/contatti"
              className={({ isActive }) =>
                `text-[12px] font-medium tracking-[0.07em] transition-colors duration-200 ${
                  isActive ? 'text-dis-green' : 'text-v3-fg2 hover:text-dis-green'
                }`
              }
            >
              Contatti
            </NavLink>
          </nav>

          {/* ── RIGHT: Search + RSS + CTA ── */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* RSS */}
            <a
              href="/api/rss.php"
              target="_blank"
              rel="noopener noreferrer"
              title="Feed RSS"
              className="flex items-center justify-center w-9 h-9 transition-colors duration-200"
              style={{ color: '#6a9070' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f97316')}
              onMouseLeave={e => (e.currentTarget.style.color = '#6a9070')}
              aria-label="Feed RSS"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
              </svg>
            </a>

            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="flex items-center justify-center gap-2 px-3 h-9 transition-all duration-200 group"
              style={{ color: '#6a9070', border: '1px solid rgba(34,197,94,0.1)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.color = '#22c55e';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(34,197,94,0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.color = '#6a9070';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(34,197,94,0.1)';
              }}
              aria-label="Cerca"
            >
              <Search size={15} />
              <span className="hidden lg:flex items-center gap-1.5 ml-1">
                <span className="font-mono text-[9px] opacity-50 uppercase tracking-tighter">Cerca</span>
                <kbd className="font-mono text-[9px] border px-1 rounded" style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)' }}>Ctrl K</kbd>
              </span>
            </button>

            {/* CTA — outline style (V3) */}
            <Link
              to="/tutti-i-progetti"
              className="hidden md:inline-block font-bold font-sans text-[12px] tracking-[0.1em] uppercase px-5 py-2.5 transition-all duration-200 text-dis-green hover:bg-dis-green hover:text-black"
              style={{ border: '1px solid #22c55e' }}
            >
              Tutti i Progetti
            </Link>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="md:hidden flex items-center justify-center w-9 h-9 transition-all duration-200"
              style={{ color: '#6a9070', border: '1px solid rgba(34,197,94,0.1)' }}
              aria-label={isMenuOpen ? 'Chiudi menu' : 'Apri menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* ── MOBILE DRAWER ── */}
        <div
          id="mobile-menu"
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
          aria-hidden={!isMenuOpen}
        >
          <div
            className="px-6 pb-6 pt-3 flex flex-col gap-1"
            style={{ borderTop: '1px solid rgba(34,197,94,0.1)', background: 'rgba(5,8,10,0.95)' }}
          >
            <MobileNavLink to="/" onClick={closeMenu}>Home</MobileNavLink>
            {categories.map(cat => (
              <MobileNavLink key={cat.slug} to={`/${cat.slug}`} onClick={closeMenu}>
                {cat.name}
              </MobileNavLink>
            ))}
            <MobileNavLink to="/contatti" onClick={closeMenu}>Contatti</MobileNavLink>

            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
              <Link
                to="/tutti-i-progetti"
                onClick={closeMenu}
                className="block w-full text-center font-bold font-sans text-[12px] tracking-[0.1em] uppercase px-4 py-3 text-dis-green hover:bg-dis-green hover:text-black transition-all duration-200"
                style={{ border: '1px solid #22c55e' }}
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

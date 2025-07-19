import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Sono Simone (blog)', path: '/chi-sono' },
    { label: 'Podcast', path: '/podcast', disabled: true },
    { label: 'Libri', path: '/libri', disabled: true },
    { label: 'Software', path: '/software' },
    { label: 'Videogiochi', path: '/videogiochi' },
    { label: 'Contattami', path: '/contatti' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-[#2a2a2a] transition-all duration-300 h-20 ${
      isScrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md shadow-lg' : ''
    }`}>
      <nav className="flex items-center justify-between h-full max-w-7xl mx-auto px-8">
        <Link to="/" className="flex flex-col no-underline transition-all duration-200 hover:-translate-y-0.5">
          <span className="text-2xl font-extrabold text-white leading-none">Simone Pizzi</span>
          <span className="text-sm text-[#b3b3b3] leading-none mt-1">Idee, Storie e Sperimentazione</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex list-none gap-8 items-center">
          {navItems.map((item) => (
            <li key={item.path}>
              {item.disabled ? (
                <span 
                  className="text-[#a0a0a0] cursor-not-allowed px-4 py-2 rounded-lg opacity-50 relative"
                  title="Sezione in arrivo presto"
                >
                  {item.label}
                  <span className="text-xs ml-2">🚧</span>
                </span>
              ) : (
                <Link
                  to={item.path}
                  className={`text-[#a0a0a0] no-underline font-medium px-4 py-2 rounded-lg transition-all duration-200 block hover:text-[#00ff88] hover:bg-[#00ff88]/10 ${
                    location.pathname === item.path ? 'text-[#00ff88] bg-[#00ff88]/15' : ''
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden bg-transparent border-none text-white cursor-pointer p-2 rounded-lg transition-all duration-200 hover:bg-[#00ff88]/10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        <div className={`md:hidden absolute top-full left-0 right-0 bg-[#0a0a0a] border-b border-[#2a2a2a] shadow-lg transform transition-all duration-300 ${
          isMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'
        }`}>
          <ul className="p-4 pb-8 flex flex-col gap-2 list-none">
            {navItems.map((item) => (
              <li key={item.path}>
                {item.disabled ? (
                  <span 
                    className="text-[#a0a0a0] cursor-not-allowed px-4 py-4 rounded-xl opacity-50 relative block"
                    title="Sezione in arrivo presto"
                  >
                    {item.label}
                    <span className="text-xs ml-2">🚧</span>
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className={`text-[#a0a0a0] no-underline px-4 py-4 rounded-xl text-lg block hover:text-[#00ff88] hover:bg-[#00ff88]/10 transition-all duration-200 ${
                      location.pathname === item.path ? 'text-[#00ff88] bg-[#00ff88]/15' : ''
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;

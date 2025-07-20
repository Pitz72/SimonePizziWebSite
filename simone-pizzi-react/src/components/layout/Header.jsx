import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles, ChevronDown } from 'lucide-react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  }, [location]);

  const navItems = [
    { label: 'Home', path: '/' },
    { 
      label: 'Sono Simone', 
      path: '/chi-sono',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Chi Sono', path: '/chi-sono' },
        { label: 'Blog', path: '/chi-sono/blog' },
        { label: 'Articoli', path: '/chi-sono/articoli' }
      ]
    },
    { label: 'Podcast', path: '/podcast', disabled: true },
    { label: 'Libri', path: '/libri', disabled: true },
    { 
      label: 'Software', 
      path: '/software',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Tutti i Software', path: '/software' },
        { label: 'Advanced Jingle Machine', path: '/software/advanced-jingle-machine' },
        { label: 'Audio Metadata Converter', path: '/software/audio-metadata-converter' },
        { label: 'Gestore Duplicati Musicali', path: '/software/gestore-duplicati-musicali' }
      ]
    },
    { 
      label: 'Videogiochi', 
      path: '/videogiochi',
      hasDropdown: true,
      dropdownItems: [
        { label: 'Tutti i Videogiochi', path: '/videogiochi' },
        { label: 'Il Respiro Trattenuto del Mondo', path: '/videogiochi/il-respiro-trattenuto-del-mondo' },
        { label: 'The Safe Place', path: '/videogiochi/the-safe-place' },
        { label: 'Lemmons', path: '/videogiochi/lemmons' }
      ]
    },
    { label: 'Contattami', path: '/contatti' },
  ];

  const handleDropdownToggle = (index) => {
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'glass backdrop-blur-xl shadow-xl border-b border-white/10' 
          : 'bg-bg-primary/80 backdrop-blur-md border-b border-border-primary/50'
      } ${
        headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo con animazioni */}
          <Link 
            to="/" 
            className="flex flex-col no-underline transition-all duration-300 hover:-translate-y-0.5 group"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles size={16} className="text-bg-primary" />
              </div>
              <span className="text-2xl font-extrabold text-gradient leading-none">
                Simone Pizzi
              </span>
            </div>
            <span className="text-sm text-text-muted leading-none mt-1 group-hover:text-primary-500 transition-colors duration-300">
              Idee, Storie e Sperimentazione
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex list-none gap-2 items-center">
            {navItems.map((item, index) => (
              <li key={item.path} className="relative">
                {item.disabled ? (
                  <span 
                    className="text-text-muted cursor-not-allowed px-4 py-2 rounded-lg opacity-50 relative group"
                    title="Sezione in arrivo presto"
                  >
                    <span className="flex items-center gap-2">
                      {item.label}
                      <span className="text-xs animate-pulse">🚧</span>
                    </span>
                    <div className="absolute inset-0 bg-primary-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </span>
                ) : item.hasDropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => handleDropdownToggle(index)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                        location.pathname.startsWith(item.path) 
                          ? 'text-primary-500 bg-primary-500/15' 
                          : 'text-text-secondary hover:text-primary-500 hover:bg-primary-500/10'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown 
                        size={16} 
                        className={`transition-transform duration-300 ${
                          activeDropdown === index ? 'rotate-180' : ''
                        }`}
                      />
                      {/* Hover underline effect */}
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className={`absolute top-full left-0 mt-2 w-64 bg-bg-surface/95 backdrop-blur-xl border border-border-primary rounded-xl shadow-2xl transition-all duration-300 ${
                      activeDropdown === index 
                        ? 'opacity-100 translate-y-0 pointer-events-auto' 
                        : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}>
                      <div className="p-2">
                        {item.dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.path}
                            to={dropdownItem.path}
                            className={`block px-4 py-3 rounded-lg transition-all duration-200 group ${
                              location.pathname === dropdownItem.path
                                ? 'text-primary-500 bg-primary-500/15'
                                : 'text-text-secondary hover:text-primary-500 hover:bg-primary-500/10'
                            }`}
                            onClick={() => setActiveDropdown(null)}
                          >
                            <span className="flex items-center justify-between">
                              <span>{dropdownItem.label}</span>
                              <div className="w-2 h-2 bg-primary-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 group relative overflow-hidden ${
                      location.pathname === item.path 
                        ? 'text-primary-500 bg-primary-500/15' 
                        : 'text-text-secondary hover:text-primary-500 hover:bg-primary-500/10'
                    }`}
                  >
                    <span className="relative z-10">{item.label}</span>
                    {/* Hover underline effect */}
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-500 to-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-primary-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden relative p-2 rounded-lg transition-all duration-300 hover:bg-primary-500/10 group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <div className="relative w-6 h-6">
              <span className={`absolute top-1/2 left-1/2 w-5 h-0.5 bg-text-primary transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isMenuOpen ? 'rotate-45' : '-translate-y-1'
              }`}></span>
              <span className={`absolute top-1/2 left-1/2 w-5 h-0.5 bg-text-primary transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`absolute top-1/2 left-1/2 w-5 h-0.5 bg-text-primary transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isMenuOpen ? '-rotate-45' : 'translate-y-1'
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden absolute top-full left-0 right-0 glass backdrop-blur-xl border-b border-white/10 shadow-2xl transform transition-all duration-500 ${
          isMenuOpen 
            ? 'translate-y-0 opacity-100 pointer-events-auto' 
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}>
          <div className="container mx-auto px-6 py-6">
            <ul className="flex flex-col gap-2 list-none">
              {navItems.map((item, index) => (
                <li key={item.path}>
                  {item.disabled ? (
                    <span 
                      className="text-text-muted cursor-not-allowed px-4 py-4 rounded-xl opacity-50 relative block"
                      title="Sezione in arrivo presto"
                    >
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {item.label}
                          <span className="text-xs animate-pulse">🚧</span>
                        </span>
                      </span>
                    </span>
                  ) : item.hasDropdown ? (
                    <div className="relative">
                      <button
                        onClick={() => handleDropdownToggle(index)}
                        className={`w-full flex items-center justify-between px-4 py-4 rounded-xl text-lg transition-all duration-300 ${
                          location.pathname.startsWith(item.path)
                            ? 'text-primary-500 bg-primary-500/15'
                            : 'text-text-secondary hover:text-primary-500 hover:bg-primary-500/10'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown 
                          size={20} 
                          className={`transition-transform duration-300 ${
                            activeDropdown === index ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      {/* Mobile Dropdown */}
                      <div className={`overflow-hidden transition-all duration-300 ${
                        activeDropdown === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}>
                        <div className="pl-4 pt-2 space-y-1">
                          {item.dropdownItems.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.path}
                              to={dropdownItem.path}
                              className={`block px-4 py-3 rounded-lg transition-all duration-200 ${
                                location.pathname === dropdownItem.path
                                  ? 'text-primary-500 bg-primary-500/15'
                                  : 'text-text-secondary hover:text-primary-500 hover:bg-primary-500/10'
                              }`}
                              onClick={() => {
                                setIsMenuOpen(false);
                                setActiveDropdown(null);
                              }}
                            >
                              {dropdownItem.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`px-4 py-4 rounded-xl text-lg block transition-all duration-300 ${
                        location.pathname === item.path 
                          ? 'text-primary-500 bg-primary-500/15' 
                          : 'text-text-secondary hover:text-primary-500 hover:bg-primary-500/10'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            
            {/* Mobile CTA */}
            <div className="mt-6 pt-6 border-t border-border-primary">
              <Link
                to="/contatti"
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-bg-primary font-semibold py-3 px-6 rounded-xl text-center block transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-glow"
                onClick={() => setIsMenuOpen(false)}
              >
                Iniziamo a Collaborare
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

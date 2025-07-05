import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Header.css';

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
    <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="container nav-container">
        <Link to="/" className="logo">
          <span className="logo-name">Simone Pizzi</span>
          <span className="logo-tagline">Idee, Storie e Sperimentazione</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="nav-menu desktop-nav">
          {navItems.map((item) => (
            <li key={item.path}>
              {item.disabled ? (
                <span className="disabled-nav-link" title="Sezione in arrivo presto">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        <div className={`mobile-nav ${isMenuOpen ? 'open' : ''}`}>
          <ul className="nav-menu mobile-nav-menu">
            {navItems.map((item) => (
              <li key={item.path}>
                {item.disabled ? (
                  <span className="disabled-nav-link" title="Sezione in arrivo presto">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className={location.pathname === item.path ? 'active' : ''}
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

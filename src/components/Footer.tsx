import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="relative z-10 px-6 md:px-[52px] py-[52px] flex items-center justify-between"
      style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}
    >
      <span className="font-serif text-[26px]" style={{ color: '#d4e8d8' }}>
        Simone <em className="not-italic text-dis-green">Pizzi</em>
      </span>

      <p className="font-mono text-[10px] tracking-[0.14em] uppercase" style={{ color: '#6a9070' }}>
        &copy; {currentYear} Simone Pizzi. Tutti i diritti riservati.
      </p>

      <nav aria-label="Link legali" className="hidden sm:flex gap-6">
        <a
          href="/privacy"
          className="font-mono text-[10px] tracking-[0.12em] uppercase transition-colors duration-200"
          style={{ color: '#3a5540' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#22c55e')}
          onMouseLeave={e => (e.currentTarget.style.color = '#3a5540')}
        >
          Privacy
        </a>
        <a
          href="/cookie-policy"
          className="font-mono text-[10px] tracking-[0.12em] uppercase transition-colors duration-200"
          style={{ color: '#3a5540' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#22c55e')}
          onMouseLeave={e => (e.currentTarget.style.color = '#3a5540')}
        >
          Cookie
        </a>
      </nav>
    </footer>
  );
};

export default Footer;

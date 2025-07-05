import React from 'react';
import { Mail, Github, Instagram, Mic } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      href: 'mailto:pizzisimon1972@gmail.com',
      icon: <Mail size={20} />,
      label: 'Email di Simone Pizzi',
      text: 'Email'
    },
    {
      href: 'https://github.com/Pitz72',
      icon: <Github size={20} />,
      label: 'GitHub di Simone Pizzi',
      text: 'GitHub',
      external: true
    },
    {
      href: 'https://www.instagram.com/pizzisimone1972/',
      icon: <Instagram size={20} />,
      label: 'Instagram di Simone Pizzi',
      text: 'Instagram',
      external: true
    },
    {
      href: 'https://www.spreaker.com/user/runtime-radio--8395974',
      icon: <Mic size={20} />,
      label: 'Spreaker di Runtime Radio',
      text: 'Spreaker',
      external: true
    }
  ];

  return (
    <footer className="main-footer">
      <div className="container footer-container">
        <div className="social-links">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              aria-label={link.label}
              className="social-link"
              {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {link.icon}
              <span>{link.text}</span>
            </a>
          ))}
        </div>
        <p className="copyright">
          &copy; {currentYear} Simone Pizzi. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

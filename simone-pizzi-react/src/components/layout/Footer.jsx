import React from 'react';
import { Mail, Github, Instagram, Mic } from 'lucide-react';

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
    <footer className="bg-[#1a1a1a] border-t border-[#2a2a2a] py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <div className="flex justify-center gap-8 mb-6 flex-wrap">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              aria-label={link.label}
              className="flex items-center gap-2 text-[#a0a0a0] no-underline px-4 py-3 rounded-xl transition-all duration-200 border border-transparent hover:text-[#00ff88] hover:bg-[#00ff88]/10 hover:border-[#00ff88] hover:-translate-y-0.5"
              {...(link.external && { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {link.icon}
              <span className="font-medium">{link.text}</span>
            </a>
          ))}
        </div>
        <p className="text-[#b3b3b3] text-sm m-0">
          &copy; {currentYear} Simone Pizzi. Tutti i diritti riservati.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

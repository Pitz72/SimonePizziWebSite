import React from 'react';
import { motion } from 'framer-motion';
import Typewriter from 'typewriter-effect';

interface HeroProps {
  onOpenModal: () => void;
}

const slideUp = (delay: number) => ({
  initial: { y: '100%' },
  animate: { y: 0 },
  transition: { duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
});

const Hero: React.FC<HeroProps> = ({ onOpenModal }) => {
  return (
    <section className="relative min-h-screen grid md:grid-cols-2 overflow-hidden">

      {/* ── LEFT ──────────────────────────────────────── */}
      <div className="relative flex flex-col justify-end px-6 md:px-[52px] pt-36 pb-20">

        {/* Ghost letter */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none absolute -top-8 -left-8 font-serif leading-none"
          style={{
            fontSize: 'min(40vw, 480px)',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(34,197,94,0.07)',
            opacity: 0,
            animation: 'fade-in 0.8s 0.2s ease-out forwards',
          }}
        >
          S
        </div>

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex items-center gap-3 mb-8 font-mono text-[10px] tracking-[0.22em] uppercase text-dis-green"
        >
          <span className="w-8 h-px bg-dis-green flex-shrink-0" />
          Portfolio &amp; Blog — 2026
        </motion.div>

        {/* H1 — line reveal animation */}
        <h1
          className="font-serif tracking-tight"
          style={{ fontSize: 'clamp(52px, 7vw, 96px)', lineHeight: 1.04, letterSpacing: '-0.02em' }}
        >
          {(['Creazioni', 'Ibride.'] as string[]).map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span className="block text-white" {...slideUp(0.6 + i * 0.15)}>
                {line}
              </motion.span>
            </span>
          ))}
          {/* Typewriter line — italic accent */}
          <span className="block overflow-hidden">
            <motion.span className="block text-dis-green italic" {...slideUp(0.9)}>
              <style>{`
                .v3-tw .Typewriter__wrapper {
                  font-family: 'DM Serif Display', serif;
                  font-style: italic;
                  color: #22c55e;
                }
                .v3-tw .Typewriter__cursor { color: #22c55e; font-style: normal; }
              `}</style>
              <span className="v3-tw">
                <Typewriter
                  options={{
                    strings: ['Narrativa & AI.', 'Mondi Virtuali.', 'Interattività.'],
                    autoStart: true,
                    loop: true,
                    delay: 75,
                    deleteSpeed: 50,
                  }}
                />
              </span>
            </motion.span>
          </span>
        </h1>

        {/* Horizontal rule — expands from left */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '85%' }}
          transition={{ duration: 1, delay: 1.1, ease: 'easeOut' }}
          className="h-px my-7 flex-shrink-0"
          style={{ background: 'linear-gradient(to right, #22c55e, transparent)' }}
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="font-light leading-[1.75] max-w-[420px]"
          style={{ fontSize: 'clamp(14px, 1.3vw, 17px)', color: '#6a9070' }}
        >
          Podcaster dal 2010. Scrittore di storie e racconti.<br />
          Sviluppatore sperimentale con AI.<br />
          Fondatore di Runtime Radio e Italian Podcast Network.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="flex flex-wrap gap-4 mt-11 items-center"
        >
          <button
            onClick={onOpenModal}
            className="font-bold font-sans text-[12px] tracking-[0.1em] uppercase px-9 py-3.5 bg-dis-green text-black transition-all duration-200 hover:bg-green-400"
            style={{ boxShadow: '0 0 40px rgba(34,197,94,0.22)' }}
          >
            SCOPRI DI PIÙ
          </button>
          <a
            href="#featured"
            className="font-medium font-sans text-[12px] tracking-[0.08em] uppercase px-6 py-3.5 bg-transparent transition-all duration-200"
            style={{ border: '1px solid rgba(34,197,94,0.15)', color: '#6a9070' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(34,197,94,0.5)';
              (e.currentTarget as HTMLAnchorElement).style.color = '#22c55e';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(34,197,94,0.15)';
              (e.currentTarget as HTMLAnchorElement).style.color = '#6a9070';
            }}
          >
            In Primo Piano
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 2 }}
          className="absolute bottom-10 left-6 md:left-[52px] flex items-center gap-3"
        >
          <div className="w-2 h-2 rounded-full bg-dis-green animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: '#6a9070' }}>
            Scorri per scoprire
          </span>
        </motion.div>
      </div>

      {/* ── RIGHT: Portrait ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="relative overflow-hidden hidden md:block"
      >
        {/* Green glow behind photo */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'radial-gradient(ellipse 60% 70% at 50% 70%, rgba(34,197,94,0.1) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        {/* Left edge fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-[35%] pointer-events-none z-20"
          style={{ background: 'linear-gradient(to right, #05080a 0%, transparent 100%)' }}
          aria-hidden="true"
        />
        <motion.img
          animate={{ y: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          src="/Simone-Pizzi.webp"
          alt="Simone Pizzi"
          className="w-full h-full object-contain object-center"
          style={{
            filter: 'brightness(0.95) saturate(0.9)',
            maskImage: 'radial-gradient(ellipse 72% 78% at 56% 50%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 72% 78% at 56% 50%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 100%)',
          }}
        />
      </motion.div>
    </section>
  );
};

export default Hero;

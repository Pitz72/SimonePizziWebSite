"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Typewriter from 'typewriter-effect';

interface HeroProps {
  onOpenModal: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenModal }) => {
  return (
    <section className="container mx-auto min-h-[calc(80vh)] flex items-center justify-center py-20 md:py-0">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div className="text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-6 text-balance"
          >
            Creazioni Ibride.
            <br />
            <style>{`
              .Typewriter__wrapper {
                background: linear-gradient(to right, #4ade80, #10b981);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                display: inline-block;
              }
              .Typewriter__cursor {
                color: #4ade80;
              }
            `}</style>
            <span className="inline-block">
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
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto md:mx-0"
          >
            Podcaster dal 2010, scrittore di storie e racconti, sviluppatore sperimentale con AI. Fondatore Italian Podcast Network e Runtime Radio.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8"
          >
            <button
              onClick={onOpenModal}
              className="inline-block bg-green-500 text-black font-bold text-lg px-8 py-4 rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
            >
              SCOPRI DI PIÙ
            </button>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[448px] md:h-[672px] flex items-center justify-center"
        >
          <motion.img
            animate={{ y: [-10, 10, -10] }}
            transition={{
              repeat: Infinity,
              duration: 6,
              ease: "easeInOut"
            }}
            src="/Simone-Pizzi.png"
            alt="Simone Pizzi"
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 0 2rem rgba(34, 197, 94, 0.3))',
              maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

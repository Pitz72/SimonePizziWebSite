import React from 'react';

interface HeroProps {
  onOpenModal: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenModal }) => {
  return (
    <section className="container mx-auto min-h-[calc(80vh)] flex items-center justify-center py-20 md:py-0">
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
         @keyframes text-focus-in {
          0% {
            filter: blur(12px);
            opacity: 0;
          }
          100% {
            filter: blur(0px);
            opacity: 1;
          }
        }
        .animate-text-focus-in {
          animation: text-focus-in 1s cubic-bezier(0.550, 0.085, 0.680, 0.530) both;
        }
      `}</style>
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-6 animate-text-focus-in">
            Creazioni Ibride.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              Narrativa & AI.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-xl mx-auto md:mx-0 animate-fade-in [animation-delay:0.5s]">
            Podcaster dal 2010, scrittore di storie e racconti, sviluppatore sperimentale con AI. Fondatore Italian Podcast Network e Runtime Radio.
          </p>
          <div className="mt-8 animate-fade-in [animation-delay:0.7s]">
            <button
              onClick={onOpenModal}
              className="inline-block bg-green-500 text-black font-bold text-lg px-8 py-4 rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
            >
              SCOPRI DI PIÙ
            </button>
          </div>
        </div>
        <div className="relative h-[448px] md:h-[672px] flex items-center justify-center animate-fade-in [animation-delay:0.2s]">
           <img 
            src="/Simone-Pizzi.png" 
            alt="Simone Pizzi"
            className="w-full h-full object-contain animate-float"
            style={{
                filter: 'drop-shadow(0 0 2rem rgba(34, 197, 94, 0.3))',
                maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
            }}
           />
        </div>
      </div>
    </section>
  );
};

export default Hero;

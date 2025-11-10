import React from 'react';
import { useParallax, useTilt3D } from '../../hooks/useParallax';

/**
 * Componente ParallaxCard con effetti 3D avanzati
 * @param {Object} props - Proprietà del componente
 * @param {React.ReactNode} props.children - Contenuto del card
 * @param {Object} props.parallaxOptions - Opzioni per useParallax
 * @param {Object} props.tiltOptions - Opzioni per useTilt3D
 * @param {string} props.className - Classi CSS aggiuntive
 * @param {string} props.variant - Variante del card ('default' | 'glass' | 'elevated')
 */
const ParallaxCard = ({ 
  children, 
  parallaxOptions = {}, 
  tiltOptions = {}, 
  className = '',
  variant = 'default'
}) => {
  const [parallaxRef, parallaxData] = useParallax({
    speed: 0.08, // Aumentato da 0.05 a 0.08 (60% riduzione vs originale)
    direction: 'vertical',
    threshold: 50,
    ...parallaxOptions
  });

  const [tiltRef, tiltData] = useTilt3D({
    maxTilt: 3, // Aumentato da 2 a 3 gradi (70% riduzione vs originale)
    speed: 300,
    ...tiltOptions
  });

  // Combina i ref
  const combinedRef = (element) => {
    parallaxRef.current = element;
    tiltRef.current = element;
  };

  // Stili base per le varianti
  const getVariantStyles = () => {
    switch (variant) {
      case 'glass':
        return 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl';
      case 'elevated':
        return 'bg-bg-surface shadow-2xl border border-border-primary';
      default:
        return 'bg-bg-surface/80 backdrop-blur-sm border border-border-primary/50';
    }
  };

  // Stili di trasformazione combinati - BILANCIATI
  const transformStyles = {
    transform: `
      translate3d(${parallaxData.x * 0.7}px, ${parallaxData.y * 0.7}px, 0)
      rotateX(${tiltData.x * 0.5}deg) 
      rotateY(${tiltData.y * 0.5}deg)
    `,
    transition: tiltData.isHovered ? 'transform 0.4s ease-out' : 'transform 0.8s ease-out'
  };

  return (
    <div
      ref={combinedRef}
      className={`
        relative overflow-hidden rounded-2xl p-6
        transition-all duration-600 ease-out
        hover:shadow-glow hover:scale-[1.008]
        ${getVariantStyles()}
        ${className}
      `}
      style={transformStyles}
    >
      {/* Effetto di profondità con pseudo-elemento */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Contenuto */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Indicatore di visibilità per debug (solo in development) */}
      {import.meta.env.DEV && (
        <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-green-500 opacity-50" 
             style={{ opacity: parallaxData.isVisible ? 1 : 0.3 }} />
      )}
    </div>
  );
};

export default ParallaxCard; 
import React, { useState } from 'react';
import { useSwipeActions } from '../../hooks';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * Componente Card con supporto per gesti swipe
 * @param {Object} props - Proprietà del componente
 * @param {React.ReactNode} props.children - Contenuto del card
 * @param {Function} props.onSwipeLeft - Callback per swipe sinistro
 * @param {Function} props.onSwipeRight - Callback per swipe destro
 * @param {Function} props.onSwipeUp - Callback per swipe su
 * @param {Function} props.onSwipeDown - Callback per swipe giù
 * @param {string} props.className - Classi CSS aggiuntive
 * @param {boolean} props.showIndicators - Mostra indicatori di direzione
 */
const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  className = '',
  showIndicators = false,
  ...props
}) => {
  const [lastSwipe, setLastSwipe] = useState(null);

  const { ref, isSwiping } = useSwipeActions({
    onSwipeLeft: (data) => {
      setLastSwipe({ direction: 'left', ...data });
      onSwipeLeft?.(data);
    },
    onSwipeRight: (data) => {
      setLastSwipe({ direction: 'right', ...data });
      onSwipeRight?.(data);
    },
    onSwipeUp: (data) => {
      setLastSwipe({ direction: 'up', ...data });
      onSwipeUp?.(data);
    },
    onSwipeDown: (data) => {
      setLastSwipe({ direction: 'down', ...data });
      onSwipeDown?.(data);
    }
  });

  const getSwipeIcon = (direction) => {
    switch (direction) {
      case 'left': return <ArrowLeft size={20} />;
      case 'right': return <ArrowRight size={20} />;
      case 'up': return <ArrowUp size={20} />;
      case 'down': return <ArrowDown size={20} />;
      default: return null;
    }
  };

  return (
    <div
      ref={ref}
      className={`
        relative overflow-hidden rounded-xl bg-bg-surface border border-border-primary
        transition-all duration-300 group cursor-grab active:cursor-grabbing
        ${isSwiping ? 'scale-95 shadow-lg' : 'hover:scale-105 hover:shadow-xl'}
        ${className}
      `}
      {...props}
    >
      {/* Contenuto principale */}
      <div className="p-6">
        {children}
      </div>

      {/* Indicatori di direzione */}
      {showIndicators && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Indicatore swipe sinistro */}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary-500/20 text-primary-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowLeft size={16} />
          </div>
          
          {/* Indicatore swipe destro */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-500/20 text-primary-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowRight size={16} />
          </div>
          
          {/* Indicatore swipe su */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-primary-500/20 text-primary-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowUp size={16} />
          </div>
          
          {/* Indicatore swipe giù */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-primary-500/20 text-primary-500 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ArrowDown size={16} />
          </div>
        </div>
      )}

      {/* Feedback swipe */}
      {lastSwipe && (
        <div className="absolute top-4 right-4 bg-primary-500 text-bg-primary px-3 py-1 rounded-full text-sm font-semibold animate-bounce">
          {getSwipeIcon(lastSwipe.direction)}
        </div>
      )}

      {/* Overlay durante swipe */}
      {isSwiping && (
        <div className="absolute inset-0 bg-primary-500/10 backdrop-blur-sm transition-opacity duration-200" />
      )}
    </div>
  );
};

export default SwipeableCard; 
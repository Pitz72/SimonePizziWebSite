import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook per easter eggs interattivi
 * @param {Object} options - Opzioni di configurazione
 * @param {Array} options.easterEggs - Array di easter eggs disponibili
 * @param {boolean} options.enabled - Abilita easter eggs (default: true)
 * @param {Function} options.onTrigger - Callback quando easter egg attivato
 * @returns {Object} - Easter eggs e controlli
 */
export const useEasterEggs = (options = {}) => {
  const {
    easterEggs = [],
    enabled = true,
    onTrigger
  } = options;

  const [triggeredEggs, setTriggeredEggs] = useState(new Set());
  const [konamiSequence, setKonamiSequence] = useState([]);
  const [isKonamiActive, setIsKonamiActive] = useState(false);
  const konamiTimeoutRef = useRef(null);

  // Konami code sequence
  const KONAMI_CODE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];

  // Gestisce input Konami code
  const handleKonamiInput = useCallback((key) => {
    if (!enabled || !isKonamiActive) return;

    const newSequence = [...konamiSequence, key];
    setKonamiSequence(newSequence);

    // Verifica se la sequenza è corretta
    if (newSequence.length === KONAMI_CODE.length) {
      const isCorrect = newSequence.every((k, i) => k === KONAMI_CODE[i]);
      
      if (isCorrect) {
        triggerEasterEgg('konami-code');
        setKonamiSequence([]);
        setIsKonamiActive(false);
      } else {
        // Reset se sbagliato
        setKonamiSequence([]);
      }
    } else {
      // Verifica parziale
      const isPartialCorrect = newSequence.every((k, i) => k === KONAMI_CODE[i]);
      if (!isPartialCorrect) {
        setKonamiSequence([]);
      }
    }

    // Reset timeout
    if (konamiTimeoutRef.current) {
      clearTimeout(konamiTimeoutRef.current);
    }
    konamiTimeoutRef.current = setTimeout(() => {
      setKonamiSequence([]);
      setIsKonamiActive(false);
    }, 3000);
  }, [enabled, isKonamiActive, konamiSequence]);

  // Gestisce keydown events
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    const key = event.code;
    
    // Attiva Konami mode con prima freccia
    if (key === 'ArrowUp' && konamiSequence.length === 0) {
      setIsKonamiActive(true);
      handleKonamiInput(key);
      return;
    }

    // Gestisce Konami sequence
    if (isKonamiActive) {
      handleKonamiInput(key);
      return;
    }

    // Altri easter eggs basati su tasti
    const keyEgg = easterEggs.find(egg => 
      egg.type === 'keyboard' && 
      egg.trigger === key
    );

    if (keyEgg) {
      triggerEasterEgg(keyEgg.id);
    }
  }, [enabled, isKonamiActive, konamiSequence, handleKonamiInput, easterEggs]);

  // Gestisce click events per easter eggs
  const handleClick = useCallback((event) => {
    if (!enabled) return;

    // Easter eggs basati su click pattern
    const clickEgg = easterEggs.find(egg => 
      egg.type === 'click' && 
      egg.trigger === 'pattern'
    );

    if (clickEgg) {
      // Implementa pattern detection qui se necessario
      triggerEasterEgg(clickEgg.id);
    }
  }, [enabled, easterEggs]);

  // Gestisce scroll events per easter eggs
  const handleScroll = useCallback((event) => {
    if (!enabled) return;

    // Easter eggs basati su scroll pattern
    const scrollEgg = easterEggs.find(egg => 
      egg.type === 'scroll' && 
      egg.trigger === 'pattern'
    );

    if (scrollEgg) {
      // Implementa scroll pattern detection qui se necessario
      triggerEasterEgg(scrollEgg.id);
    }
  }, [enabled, easterEggs]);

  // Attiva easter egg
  const triggerEasterEgg = useCallback((eggId) => {
    if (!enabled || !eggId) return;

    setTriggeredEggs(prev => {
      const newTriggered = new Set(prev);
      if (!newTriggered.has(eggId)) {
        newTriggered.add(eggId);
        
        // Callback
        if (onTrigger) {
          const egg = easterEggs.find(e => e.id === eggId);
          onTrigger(egg, eggId);
        }
      }
      return newTriggered;
    });
  }, [enabled, easterEggs, onTrigger]);

  // Verifica se easter egg è stato attivato
  const isTriggered = useCallback((eggId) => {
    return triggeredEggs.has(eggId);
  }, [triggeredEggs]);

  // Reset easter eggs (per testing)
  const resetEasterEggs = useCallback(() => {
    if (!enabled) return;

    setTriggeredEggs(new Set());
    setKonamiSequence([]);
    setIsKonamiActive(false);
    
    if (konamiTimeoutRef.current) {
      clearTimeout(konamiTimeoutRef.current);
    }
  }, [enabled]);

  // Setup event listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll);
      
      if (konamiTimeoutRef.current) {
        clearTimeout(konamiTimeoutRef.current);
      }
    };
  }, [enabled, handleKeyDown, handleClick, handleScroll]);

  // Easter eggs con stato
  const easterEggsWithState = easterEggs.map(egg => ({
    ...egg,
    isTriggered: isTriggered(egg.id)
  }));

  // Statistiche
  const stats = {
    total: easterEggs.length,
    triggered: triggeredEggs.size,
    remaining: easterEggs.length - triggeredEggs.size,
    percentage: easterEggs.length > 0 ? (triggeredEggs.size / easterEggs.length) * 100 : 0
  };

  return {
    easterEggs: easterEggsWithState,
    triggeredEggs,
    stats,
    konamiSequence,
    isKonamiActive,
    triggerEasterEgg,
    isTriggered,
    resetEasterEggs
  };
}; 
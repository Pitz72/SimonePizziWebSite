import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Hook per riconoscimento long press
 * @param {Object} options - Opzioni di configurazione
 * @param {number} options.duration - Durata minima per long press (default: 500ms)
 * @param {number} options.threshold - Distanza massima per movimento (default: 10px)
 * @param {boolean} options.enabled - Abilita/disabilita hook (default: true)
 * @param {boolean} options.hapticFeedback - Abilita feedback tattile (default: true)
 * @param {Function} options.onLongPress - Callback per long press
 * @param {Function} options.onPressStart - Callback per inizio pressione
 * @param {Function} options.onPressEnd - Callback per fine pressione
 * @param {Function} options.onPressCancel - Callback per cancellazione pressione
 * @returns {Object} - Ref, stato e controlli
 */
export const useLongPress = (options = {}) => {
  const {
    duration = 500,
    threshold = 10,
    enabled = true,
    hapticFeedback = true,
    onLongPress,
    onPressStart,
    onPressEnd,
    onPressCancel
  } = options;

  const elementRef = useRef(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);
  
  const startPoint = useRef({ x: 0, y: 0 });
  const startTime = useRef(0);
  const timeoutId = useRef(null);
  const isActive = useRef(false);

  // Feedback tattile (se supportato)
  const triggerHapticFeedback = useCallback(() => {
    if (!hapticFeedback) return;
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [hapticFeedback]);

  // Verifica se il movimento è entro la soglia
  const isWithinThreshold = useCallback((currentX, currentY) => {
    const deltaX = Math.abs(currentX - startPoint.current.x);
    const deltaY = Math.abs(currentY - startPoint.current.y);
    return deltaX <= threshold && deltaY <= threshold;
  }, [threshold]);

  // Gestisce l'inizio del touch
  const handleTouchStart = useCallback((event) => {
    if (!enabled) return;
    
    const touch = event.touches[0];
    startPoint.current = { x: touch.clientX, y: touch.clientY };
    startTime.current = Date.now();
    isActive.current = true;
    setIsPressed(true);
    
    onPressStart?.();
    
    // Timeout per long press
    timeoutId.current = setTimeout(() => {
      if (isActive.current) {
        setIsLongPressed(true);
        triggerHapticFeedback();
        onLongPress?.();
      }
    }, duration);
  }, [enabled, duration, onLongPress, onPressStart, triggerHapticFeedback]);

  // Gestisce il movimento del touch
  const handleTouchMove = useCallback((event) => {
    if (!enabled || !isActive.current) return;
    
    const touch = event.touches[0];
    
    // Se si muove troppo, cancella il long press
    if (!isWithinThreshold(touch.clientX, touch.clientY)) {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      isActive.current = false;
      setIsPressed(false);
      setIsLongPressed(false);
      onPressCancel?.();
    }
  }, [enabled, isWithinThreshold, onPressCancel]);

  // Gestisce la fine del touch
  const handleTouchEnd = useCallback((event) => {
    if (!enabled || !isActive.current) return;
    
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    
    isActive.current = false;
    setIsPressed(false);
    setIsLongPressed(false);
    onPressEnd?.();
  }, [enabled, onPressEnd]);

  // Gestisce il mouse per desktop
  const handleMouseDown = useCallback((event) => {
    if (!enabled) return;
    
    startPoint.current = { x: event.clientX, y: event.clientY };
    startTime.current = Date.now();
    isActive.current = true;
    setIsPressed(true);
    
    onPressStart?.();
    
    timeoutId.current = setTimeout(() => {
      if (isActive.current) {
        setIsLongPressed(true);
        triggerHapticFeedback();
        onLongPress?.();
      }
    }, duration);
  }, [enabled, duration, onLongPress, onPressStart, triggerHapticFeedback]);

  const handleMouseMove = useCallback((event) => {
    if (!enabled || !isActive.current) return;
    
    if (!isWithinThreshold(event.clientX, event.clientY)) {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      isActive.current = false;
      setIsPressed(false);
      setIsLongPressed(false);
      onPressCancel?.();
    }
  }, [enabled, isWithinThreshold, onPressCancel]);

  const handleMouseUp = useCallback((event) => {
    if (!enabled || !isActive.current) return;
    
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    
    isActive.current = false;
    setIsPressed(false);
    setIsLongPressed(false);
    onPressEnd?.();
  }, [enabled, onPressEnd]);

  // Gestisce la perdita del focus
  const handleBlur = useCallback(() => {
    if (!enabled) return;
    
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    
    isActive.current = false;
    setIsPressed(false);
    setIsLongPressed(false);
    onPressCancel?.();
  }, [enabled, onPressCancel]);

  // Setup event listeners
  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;

    // Touch events per mobile
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Mouse events per desktop
    element.addEventListener('mousedown', handleMouseDown, { passive: true });
    element.addEventListener('mousemove', handleMouseMove, { passive: true });
    element.addEventListener('mouseup', handleMouseUp, { passive: true });
    element.addEventListener('mouseleave', handleMouseUp, { passive: true });

    // Focus events
    element.addEventListener('blur', handleBlur, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mouseleave', handleMouseUp);
      element.removeEventListener('blur', handleBlur);
      
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseMove, handleMouseUp, handleBlur]);

  // Stili per feedback visivo
  const pressStyles = {
    transform: isPressed ? 'scale(0.98)' : 'scale(1)',
    transition: 'transform 0.1s ease-out',
    cursor: 'pointer'
  };

  return {
    ref: elementRef,
    isPressed,
    isLongPressed,
    pressStyles
  };
}; 
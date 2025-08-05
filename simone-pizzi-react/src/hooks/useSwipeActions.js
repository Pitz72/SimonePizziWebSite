import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook per riconoscimento gesti swipe con supporto multi-direzione
 * @param {Object} options - Opzioni di configurazione
 * @param {number} options.threshold - Distanza minima per attivare swipe (default: 50px)
 * @param {number} options.velocity - Velocità minima per swipe (default: 0.3)
 * @param {number} options.timeout - Timeout per completamento swipe (default: 300ms)
 * @param {boolean} options.enabled - Abilita/disabilita hook (default: true)
 * @param {Function} options.onSwipeLeft - Callback per swipe sinistro
 * @param {Function} options.onSwipeRight - Callback per swipe destro
 * @param {Function} options.onSwipeUp - Callback per swipe su
 * @param {Function} options.onSwipeDown - Callback per swipe giù
 * @returns {Object} - Ref e stato del swipe
 */
export const useSwipeActions = (options = {}) => {
  const {
    threshold = 50,
    velocity = 0.3,
    timeout = 300,
    enabled = true,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = options;

  const elementRef = useRef(null);
  const startPoint = useRef({ x: 0, y: 0, time: 0 });
  const currentPoint = useRef({ x: 0, y: 0, time: 0 });
  const isSwiping = useRef(false);
  const timeoutId = useRef(null);

  // Calcola la direzione del swipe
  const getSwipeDirection = useCallback((deltaX, deltaY) => {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    
    if (absX > absY) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  // Calcola la velocità del movimento
  const getVelocity = useCallback((deltaX, deltaY, deltaTime) => {
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return distance / deltaTime;
  }, []);

  // Gestisce l'inizio del touch
  const handleTouchStart = useCallback((event) => {
    if (!enabled) return;
    
    const touch = event.touches[0];
    startPoint.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    currentPoint.current = { ...startPoint.current };
    isSwiping.current = true;
    
    // Clear timeout precedente
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
  }, [enabled]);

  // Gestisce il movimento del touch
  const handleTouchMove = useCallback((event) => {
    if (!enabled || !isSwiping.current) return;
    
    const touch = event.touches[0];
    currentPoint.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, [enabled]);

  // Gestisce la fine del touch
  const handleTouchEnd = useCallback(() => {
    if (!enabled || !isSwiping.current) return;
    
    const deltaX = currentPoint.current.x - startPoint.current.x;
    const deltaY = currentPoint.current.y - startPoint.current.y;
    const deltaTime = currentPoint.current.time - startPoint.current.time;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const swipeVelocity = getVelocity(deltaX, deltaY, deltaTime);
    
    // Verifica se il swipe è valido
    if (distance >= threshold && swipeVelocity >= velocity) {
      const direction = getSwipeDirection(deltaX, deltaY);
      
      // Esegui callback appropriata
      switch (direction) {
        case 'left':
          onSwipeLeft?.({ deltaX, deltaY, distance, velocity: swipeVelocity });
          break;
        case 'right':
          onSwipeRight?.({ deltaX, deltaY, distance, velocity: swipeVelocity });
          break;
        case 'up':
          onSwipeUp?.({ deltaX, deltaY, distance, velocity: swipeVelocity });
          break;
        case 'down':
          onSwipeDown?.({ deltaX, deltaY, distance, velocity: swipeVelocity });
          break;
      }
    }
    
    isSwiping.current = false;
    
    // Timeout per reset
    timeoutId.current = setTimeout(() => {
      startPoint.current = { x: 0, y: 0, time: 0 };
      currentPoint.current = { x: 0, y: 0, time: 0 };
    }, timeout);
  }, [enabled, threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, getVelocity, getSwipeDirection, timeout]);

  // Gestisce il mouse per desktop
  const handleMouseDown = useCallback((event) => {
    if (!enabled) return;
    
    startPoint.current = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now()
    };
    currentPoint.current = { ...startPoint.current };
    isSwiping.current = true;
  }, [enabled]);

  const handleMouseMove = useCallback((event) => {
    if (!enabled || !isSwiping.current) return;
    
    currentPoint.current = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now()
    };
  }, [enabled]);

  const handleMouseUp = useCallback(() => {
    if (!enabled || !isSwiping.current) return;
    
    const deltaX = currentPoint.current.x - startPoint.current.x;
    const deltaY = currentPoint.current.y - startPoint.current.y;
    const deltaTime = currentPoint.current.time - startPoint.current.time;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const swipeVelocity = getVelocity(deltaX, deltaY, deltaTime);
    
    if (distance >= threshold && swipeVelocity >= velocity) {
      const direction = getSwipeDirection(deltaX, deltaY);
      
      switch (direction) {
        case 'left':
          onSwipeLeft?.({ deltaX, deltaY, distance, velocity: swipeVelocity });
          break;
        case 'right':
          onSwipeRight?.({ deltaX, deltaY, distance, velocity: swipeVelocity });
          break;
        case 'up':
          onSwipeUp?.({ deltaX, deltaY, distance, velocity: swipeVelocity });
          break;
        case 'down':
          onSwipeDown?.({ deltaX, deltaY, distance, velocity: swipeVelocity });
          break;
      }
    }
    
    isSwiping.current = false;
  }, [enabled, threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, getVelocity, getSwipeDirection]);

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

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseup', handleMouseUp);
      
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseDown, handleMouseMove, handleMouseUp]);

  return {
    ref: elementRef,
    isSwiping: isSwiping.current
  };
}; 
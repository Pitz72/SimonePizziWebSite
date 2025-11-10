import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook useParallax avanzato per effetti di profondità 3D
 * @param {Object} options - Opzioni di configurazione
 * @param {number} options.speed - Velocità del parallax (default: 0.5)
 * @param {string} options.direction - Direzione del movimento ('vertical' | 'horizontal' | 'both')
 * @param {number} options.threshold - Soglia di attivazione (default: 0)
 * @param {boolean} options.enabled - Abilita/disabilita il parallax (default: true)
 * @param {number} options.throttle - Throttle in ms per performance (default: 16)
 * @returns {[React.RefObject, { x: number, y: number, isVisible: boolean }]}
 */
export const useParallax = (options = {}) => {
  const {
    speed = 0.5,
    direction = 'vertical',
    threshold = 0,
    enabled = true,
    throttle = 16
  } = options;

  const elementRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const lastUpdate = useRef(0);
  const animationFrameId = useRef(null);

  // Throttled scroll handler con RequestAnimationFrame
  const handleScroll = useCallback(() => {
    if (!enabled || !elementRef.current) return;

    const now = Date.now();
    if (now - lastUpdate.current < throttle) return;

    lastUpdate.current = now;

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }

    animationFrameId.current = requestAnimationFrame(() => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const scrolled = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const elementTop = rect.top + scrolled;
      const elementHeight = rect.height;

      // Calcola visibilità dell'elemento
      const elementBottom = elementTop + elementHeight;
      const isElementVisible = scrolled + windowHeight > elementTop && scrolled < elementBottom;
      setIsVisible(isElementVisible);

      if (!isElementVisible) return;

      // Calcola offset basato sulla direzione
      let xOffset = 0;
      let yOffset = 0;

      if (direction === 'vertical' || direction === 'both') {
        yOffset = (scrolled - elementTop + windowHeight) * -speed;
      }

      if (direction === 'horizontal' || direction === 'both') {
        const scrolledX = window.pageXOffset;
        xOffset = scrolledX * -speed * 0.5; // Velocità ridotta per orizzontale
      }

      // Applica soglia di attivazione
      if (Math.abs(yOffset) < threshold && Math.abs(xOffset) < threshold) {
        yOffset = 0;
        xOffset = 0;
      }

      setOffset({ x: xOffset, y: yOffset });
    });
  }, [speed, direction, threshold, enabled, throttle]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Trigger iniziale
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleScroll, enabled]);

  return [elementRef, { ...offset, isVisible }];
};

/**
 * Hook useMouseParallax per effetti basati su posizione mouse
 * @param {Object} options - Opzioni di configurazione
 * @param {number} options.speed - Velocità del movimento (default: 0.1)
 * @param {boolean} options.enabled - Abilita/disabilita (default: true)
 * @returns {[React.RefObject, { x: number, y: number }]}
 */
export const useMouseParallax = (options = {}) => {
  const { speed = 0.1, enabled = true } = options;
  const elementRef = useRef(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((event) => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    const deltaX = (mouseX - centerX) * speed;
    const deltaY = (mouseY - centerY) * speed;
    
    setMouseOffset({ x: deltaX, y: deltaY });
  }, [speed, enabled]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseMove, enabled]);

  return [elementRef, mouseOffset];
};

/**
 * Hook useTilt3D per effetti 3D su hover
 * @param {Object} options - Opzioni di configurazione
 * @param {number} options.maxTilt - Massima inclinazione in gradi (default: 15)
 * @param {number} options.speed - Velocità di risposta (default: 500)
 * @param {boolean} options.enabled - Abilita/disabilita (default: true)
 * @returns {[React.RefObject, { x: number, y: number, isHovered: boolean }]}
 */
export const useTilt3D = (options = {}) => {
  const { maxTilt = 15, enabled = true } = options;
  const elementRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, isHovered: false });

  const handleMouseEnter = useCallback(() => {
    if (!enabled) return;
    setTilt(prev => ({ ...prev, isHovered: true }));
  }, [enabled]);

  const handleMouseLeave = useCallback(() => {
    if (!enabled) return;
    setTilt({ x: 0, y: 0, isHovered: false });
  }, [enabled]);

  const handleMouseMove = useCallback((event) => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    const deltaX = (mouseX - centerX) / (rect.width / 2);
    const deltaY = (mouseY - centerY) / (rect.height / 2);
    
    const tiltX = deltaY * maxTilt;
    const tiltY = -deltaX * maxTilt;
    
    setTilt({ x: tiltX, y: tiltY, isHovered: true });
  }, [maxTilt, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mousemove', handleMouseMove);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseEnter, handleMouseLeave, handleMouseMove, enabled]);

  return [elementRef, tilt];
}; 
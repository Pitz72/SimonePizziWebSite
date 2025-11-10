import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Hook per pinch to zoom su immagini
 * @param {Object} options - Opzioni di configurazione
 * @param {number} options.minScale - Scala minima (default: 1)
 * @param {number} options.maxScale - Scala massima (default: 3)
 * @param {number} options.scaleStep - Step di scala per zoom (default: 0.1)
 * @param {boolean} options.enabled - Abilita/disabilita hook (default: true)
 * @param {Function} options.onZoomChange - Callback per cambiamenti zoom
 * @returns {Object} - Ref, stato zoom e controlli
 */
export const usePinchZoom = (options = {}) => {
  const {
    minScale = 1,
    maxScale = 3,
    scaleStep = 0.1,
    enabled = true,
    onZoomChange
  } = options;

  const elementRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isZoomed, setIsZoomed] = useState(false);
  
  const startDistance = useRef(0);
  const startScale = useRef(1);
  const startPosition = useRef({ x: 0, y: 0 });
  const isPinching = useRef(false);
  const isDragging = useRef(false);
  const lastTouchPoints = useRef([]);

  // Calcola distanza tra due punti touch
  const getDistance = useCallback((point1, point2) => {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  // Limita la scala tra min e max
  const clampScale = useCallback((newScale) => {
    return Math.min(Math.max(newScale, minScale), maxScale);
  }, [minScale, maxScale]);

  // Limita la posizione per evitare spazi vuoti
  const clampPosition = useCallback((newPosition, currentScale) => {
    if (!elementRef.current) return newPosition;
    
    const element = elementRef.current;
    const rect = element.getBoundingClientRect();
    const maxX = (rect.width * (currentScale - 1)) / 2;
    const maxY = (rect.height * (currentScale - 1)) / 2;
    
    return {
      x: Math.min(Math.max(newPosition.x, -maxX), maxX),
      y: Math.min(Math.max(newPosition.y, -maxY), maxY)
    };
  }, []);

  // Gestisce l'inizio del touch
  const handleTouchStart = useCallback((event) => {
    if (!enabled) return;
    
    const touches = Array.from(event.touches);
    lastTouchPoints.current = touches;
    
    if (touches.length === 2) {
      // Pinch gesture
      isPinching.current = true;
      startDistance.current = getDistance(touches[0], touches[1]);
      startScale.current = scale;
      startPosition.current = { ...position };
    } else if (touches.length === 1 && scale > 1) {
      // Drag gesture (solo se zoomato)
      isDragging.current = true;
      startPosition.current = { ...position };
    }
  }, [enabled, scale, position, getDistance]);

  // Gestisce il movimento del touch
  const handleTouchMove = useCallback((event) => {
    if (!enabled) return;
    
    const touches = Array.from(event.touches);
    
    if (isPinching.current && touches.length === 2) {
      // Pinch zoom
      const currentDistance = getDistance(touches[0], touches[1]);
      const scaleRatio = currentDistance / startDistance.current;
      const newScale = clampScale(startScale.current * scaleRatio);
      
      setScale(newScale);
      setIsZoomed(newScale > 1);
      onZoomChange?.(newScale);
    } else if (isDragging.current && touches.length === 1 && scale > 1) {
      // Drag
      const touch = touches[0];
      const deltaX = touch.clientX - lastTouchPoints.current[0].clientX;
      const deltaY = touch.clientY - lastTouchPoints.current[0].clientY;
      
      const newPosition = {
        x: startPosition.current.x + deltaX,
        y: startPosition.current.y + deltaY
      };
      
      const clampedPosition = clampPosition(newPosition, scale);
      setPosition(clampedPosition);
    }
    
    lastTouchPoints.current = touches;
  }, [enabled, scale, getDistance, clampScale, clampPosition, onZoomChange]);

  // Gestisce la fine del touch
  const handleTouchEnd = useCallback(() => {
    if (!enabled) return;
    
    isPinching.current = false;
    isDragging.current = false;
    lastTouchPoints.current = [];
  }, [enabled]);

  // Gestisce il double click per zoom
  const handleDoubleClick = useCallback(() => {
    if (!enabled) return;
    
    const newScale = scale > 1 ? 1 : 2;
    setScale(newScale);
    setIsZoomed(newScale > 1);
    
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
    
    onZoomChange?.(newScale);
  }, [enabled, scale, onZoomChange]);

  // Gestisce la rotella del mouse per zoom
  const handleWheel = useCallback((event) => {
    if (!enabled) return;
    
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? -scaleStep : scaleStep;
    const newScale = clampScale(scale + delta);
    
    setScale(newScale);
    setIsZoomed(newScale > 1);
    
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
    
    onZoomChange?.(newScale);
  }, [enabled, scale, scaleStep, clampScale, onZoomChange]);

  // Reset zoom
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
    onZoomChange?.(1);
  }, [onZoomChange]);

  // Zoom in
  const zoomIn = useCallback(() => {
    const newScale = clampScale(scale + scaleStep);
    setScale(newScale);
    setIsZoomed(newScale > 1);
    onZoomChange?.(newScale);
  }, [scale, scaleStep, clampScale, onZoomChange]);

  // Zoom out
  const zoomOut = useCallback(() => {
    const newScale = clampScale(scale - scaleStep);
    setScale(newScale);
    setIsZoomed(newScale > 1);
    
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
    
    onZoomChange?.(newScale);
  }, [scale, scaleStep, clampScale, onZoomChange]);

  // Setup event listeners
  useEffect(() => {
    if (!enabled || !elementRef.current) return;

    const element = elementRef.current;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('dblclick', handleDoubleClick, { passive: true });
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('dblclick', handleDoubleClick);
      element.removeEventListener('wheel', handleWheel);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd, handleDoubleClick, handleWheel]);

  // Stili di trasformazione
  const transformStyles = {
    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
    transition: isPinching.current || isDragging.current ? 'none' : 'transform 0.3s ease-out',
    cursor: isDragging.current ? 'grabbing' : (isZoomed ? 'grab' : 'zoom-in')
  };

  return {
    ref: elementRef,
    scale,
    position,
    isZoomed,
    transformStyles,
    resetZoom,
    zoomIn,
    zoomOut
  };
}; 
import { useState, useRef } from 'react';

// Hook per aggiungere ripple effect a qualsiasi elemento
export const useRipple = () => {
  const [ripples, setRipples] = useState([]);
  const containerRef = useRef(null);

  const addRipple = (event) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples(prev => [...prev, ripple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 600);
  };

  return { addRipple, containerRef, ripples };
}; 
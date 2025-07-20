import React, { useState, useRef } from 'react';

const RippleEffect = ({ children, className = '', disabled = false }) => {
  const [ripples, setRipples] = useState([]);
  const containerRef = useRef(null);

  const createRipple = (event) => {
    if (disabled) return;

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

    // Rimuovi il ripple dopo l'animazione
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 600);
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onClick={createRipple}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
        />
      ))}
    </div>
  );
};

export default RippleEffect; 
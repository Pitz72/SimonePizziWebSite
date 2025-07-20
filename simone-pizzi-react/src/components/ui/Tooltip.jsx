import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({ 
  children, 
  content, 
  position = 'top', 
  delay = 200, 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState(position);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newPosition = position;

    // Controlla se il tooltip esce dal viewport e adatta la posizione
    switch (position) {
      case 'top':
        if (triggerRect.top - tooltipRect.height < 0) {
          newPosition = 'bottom';
        }
        break;
      case 'bottom':
        if (triggerRect.bottom + tooltipRect.height > viewportHeight) {
          newPosition = 'top';
        }
        break;
      case 'left':
        if (triggerRect.left - tooltipRect.width < 0) {
          newPosition = 'right';
        }
        break;
      case 'right':
        if (triggerRect.right + tooltipRect.width > viewportWidth) {
          newPosition = 'left';
        }
        break;
    }

    setTooltipPosition(newPosition);
  };

  const getPositionClasses = () => {
    const baseClasses = "absolute z-50 px-3 py-2 text-sm font-medium text-bg-primary bg-bg-surface border border-border-primary rounded-lg shadow-2xl backdrop-blur-xl whitespace-nowrap transition-all duration-200";

    switch (tooltipPosition) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 translate-y-2`;
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-x-2 -translate-y-1/2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 transform translate-x-2 -translate-y-1/2`;
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2`;
    }
  };

  const getArrowClasses = () => {
    const baseClasses = "absolute w-2 h-2 bg-bg-surface border border-border-primary transform rotate-45";

    switch (tooltipPosition) {
      case 'top':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 -translate-y-1 border-t-0 border-l-0`;
      case 'bottom':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 translate-y-1 border-b-0 border-r-0`;
      case 'left':
        return `${baseClasses} left-full top-1/2 transform -translate-x-1 -translate-y-1/2 border-l-0 border-b-0`;
      case 'right':
        return `${baseClasses} right-full top-1/2 transform translate-x-1 -translate-y-1/2 border-r-0 border-t-0`;
      default:
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 -translate-y-1 border-t-0 border-l-0`;
    }
  };

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`${getPositionClasses()} ${
            isVisible 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-95'
          }`}
        >
          {content}
          <div className={getArrowClasses()}></div>
        </div>
      )}
    </div>
  );
};

// Tooltip con trigger personalizzato
export const TooltipTrigger = ({ 
  trigger, 
  content, 
  position = 'top', 
  delay = 200 
}) => {
  return (
    <Tooltip content={content} position={position} delay={delay}>
      {trigger}
    </Tooltip>
  );
};

// Tooltip per icone
export const IconTooltip = ({ 
  icon, 
  content, 
  position = 'top', 
  className = '' 
}) => {
  return (
    <Tooltip content={content} position={position}>
      <div className={`inline-flex items-center justify-center p-2 rounded-lg hover:bg-primary-500/10 transition-colors duration-200 cursor-help ${className}`}>
        {icon}
      </div>
    </Tooltip>
  );
};

export default Tooltip; 
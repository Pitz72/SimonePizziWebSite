import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

/**
 * Componente per sezioni animate con scroll-triggered animations
 * Supporta multiple varianti e configurazioni avanzate
 */
const AnimatedSection = ({
  children,
  variant = 'fadeInUp',
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  animationDelay = 0,
  animationDuration = 600,
  animationEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  stagger = false,
  staggerDelay = 100,
  as = 'section',
  ...props
}) => {
  const {
    ref,
    getAnimationStyles
  } = useScrollAnimation({
    threshold,
    rootMargin,
    triggerOnce,
    animationDelay,
    animationDuration,
    animationEasing,
    variant,
    stagger,
    staggerDelay
  });

  const Component = as;

  return (
    <Component
      ref={ref}
      style={getAnimationStyles()}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Componente per liste animate con stagger effect
 */
export const AnimatedList = ({
  items,
  renderItem,
  variant = 'fadeInUp',
  threshold = 0.1,
  rootMargin = '0px',
  staggerDelay = 100,
  animationDuration = 600,
  containerClassName = '',
  itemClassName = '',
  ...props
}) => {
  const {
    containerRef,
    getItemStyles
  } = useScrollAnimation({
    threshold,
    rootMargin,
    triggerOnce: true,
    variant,
    stagger: true,
    staggerDelay,
    animationDuration
  });

  return (
    <div
      ref={containerRef}
      className={`${containerClassName}`}
      {...props}
    >
      {items.map((item, index) => (
        <div
          key={index}
          data-index={index}
          className={itemClassName}
          style={getItemStyles(index)}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

/**
 * Componente per testo animato lettera per lettera
 */
export const AnimatedText = ({
  text,
  className = '',
  variant = 'fadeInUp',
  threshold = 0.1,
  rootMargin = '0px',
  letterDelay = 50,
  animationDuration = 600,
  ...props
}) => {
  const {
    ref,
    isVisible,
    getAnimationStyles
  } = useScrollAnimation({
    threshold,
    rootMargin,
    triggerOnce: true,
    variant,
    animationDuration
  });

  // Rimuovo animationDelay dalle props per evitare warning DOM
  const { animationDelay: _, ...domProps } = props;
  
  return (
    <div
      ref={ref}
      className={className}
      style={getAnimationStyles()}
      {...domProps}
    >
      {text.split('').map((char, index) => (
        <span
          key={index}
          style={{
            display: 'inline-block',
            transition: `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            transitionDelay: isVisible ? `${index * letterDelay}ms` : '0ms',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0px)' : 'translateY(20px)'
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </div>
  );
};

/**
 * Componente per card animate con hover effects
 */
export const AnimatedCard = ({
  children,
  className = '',
  variant = 'scaleIn',
  threshold = 0.1,
  rootMargin = '0px',
  hoverEffect = true,
  animationDelay = 0,
  animationDuration = 600,
  ...props
}) => {
  const {
    ref,
    getAnimationStyles
  } = useScrollAnimation({
    threshold,
    rootMargin,
    triggerOnce: true,
    variant,
    animationDelay,
    animationDuration
  });

  const baseClasses = `
    transition-all duration-300 ease-out
    ${hoverEffect ? 'hover:scale-105 hover:shadow-xl' : ''}
    ${className}
  `;

  return (
    <div
      ref={ref}
      className={baseClasses}
      style={getAnimationStyles()}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Componente per immagini animate con parallax
 */
export const AnimatedImage = ({
  src,
  alt,
  className = '',
  variant = 'fadeInUp',
  threshold = 0.1,
  rootMargin = '0px',
  parallax = false,

  animationDelay = 0,
  animationDuration = 600,
  ...props
}) => {
  const {
    ref,
    isVisible,
    getAnimationStyles
  } = useScrollAnimation({
    threshold,
    rootMargin,
    triggerOnce: true,
    variant,
    animationDelay,
    animationDuration
  });

  const baseClasses = `
    transition-all duration-300 ease-out
    ${parallax ? 'transform-gpu' : ''}
    ${className}
  `;

  const parallaxStyle = parallax ? {
    transform: `translateY(${isVisible ? 0 : 20}px)`,
    transition: `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
  } : {};

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={baseClasses}
      style={{
        ...getAnimationStyles(),
        ...parallaxStyle
      }}
      {...props}
    />
  );
};

export default AnimatedSection; 
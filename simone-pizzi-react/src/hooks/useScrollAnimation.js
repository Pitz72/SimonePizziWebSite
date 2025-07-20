import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook avanzato per animazioni scroll-triggered con Intersection Observer
 * Supporta multiple varianti di animazione e configurazioni avanzate
 */
export const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    animationDelay = 0,
    animationDuration = 600,
    animationEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    variant = 'fadeInUp', // fadeInUp, fadeInDown, fadeInLeft, fadeInRight, scaleIn, slideIn
    stagger = 0,
    staggerDelay = 100
  } = options;

  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Configurazioni animazione per varianti
  const animationConfigs = {
    fadeInUp: {
      initial: { opacity: 0, transform: 'translateY(30px)' },
      animate: { opacity: 1, transform: 'translateY(0px)' }
    },
    fadeInDown: {
      initial: { opacity: 0, transform: 'translateY(-30px)' },
      animate: { opacity: 1, transform: 'translateY(0px)' }
    },
    fadeInLeft: {
      initial: { opacity: 0, transform: 'translateX(-30px)' },
      animate: { opacity: 1, transform: 'translateX(0px)' }
    },
    fadeInRight: {
      initial: { opacity: 0, transform: 'translateX(30px)' },
      animate: { opacity: 1, transform: 'translateX(0px)' }
    },
    scaleIn: {
      initial: { opacity: 0, transform: 'scale(0.8)' },
      animate: { opacity: 1, transform: 'scale(1)' }
    },
    slideIn: {
      initial: { opacity: 0, transform: 'translateX(-100%)' },
      animate: { opacity: 1, transform: 'translateX(0%)' }
    },
    bounceIn: {
      initial: { opacity: 0, transform: 'scale(0.3)' },
      animate: { opacity: 1, transform: 'scale(1)' }
    },
    flipIn: {
      initial: { opacity: 0, transform: 'rotateY(90deg)' },
      animate: { opacity: 1, transform: 'rotateY(0deg)' }
    }
  };

  const config = animationConfigs[variant] || animationConfigs.fadeInUp;

  const handleIntersection = useCallback((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && (!triggerOnce || !hasAnimated)) {
        setIsVisible(true);
        if (triggerOnce) {
          setHasAnimated(true);
        }
      } else if (!triggerOnce) {
        setIsVisible(false);
      }
    });
  }, [triggerOnce, hasAnimated]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [handleIntersection, threshold, rootMargin]);

  // Calcola delay per stagger animations
  const calculateDelay = useCallback((index = 0) => {
    return animationDelay + (stagger ? index * staggerDelay : 0);
  }, [animationDelay, stagger, staggerDelay]);

  // Stili CSS per l'animazione
  const getAnimationStyles = useCallback((index = 0) => {
    const delay = calculateDelay(index);
    const baseStyles = {
      transition: `all ${animationDuration}ms ${animationEasing}`,
      transitionDelay: `${delay}ms`
    };

    if (isVisible) {
      return {
        ...baseStyles,
        ...config.animate
      };
    } else {
      return {
        ...baseStyles,
        ...config.initial
      };
    }
  }, [isVisible, config, animationDuration, animationEasing, calculateDelay]);

  return {
    ref: elementRef,
    isVisible,
    hasAnimated,
    getAnimationStyles,
    calculateDelay
  };
};

/**
 * Hook per animazioni stagger su liste di elementi
 */
export const useStaggerAnimation = (items, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    staggerDelay = 100,
    variant = 'fadeInUp',
    animationDuration = 600
  } = options;

  const containerRef = useRef(null);
  const [visibleItems, setVisibleItems] = useState(new Set());

  const handleIntersection = useCallback((entries) => {
    entries.forEach((entry) => {
      const index = parseInt(entry.target.dataset.index);
      if (entry.isIntersecting) {
        setVisibleItems(prev => new Set([...prev, index]));
      }
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    const items = container.querySelectorAll('[data-index]');
    items.forEach(item => observer.observe(item));

    return () => {
      items.forEach(item => observer.unobserve(item));
    };
  }, [handleIntersection, threshold, rootMargin, items.length]);

  const getItemStyles = useCallback((index) => {
    const isVisible = visibleItems.has(index);
    const delay = index * staggerDelay;

    const config = {
      fadeInUp: {
        initial: { opacity: 0, transform: 'translateY(30px)' },
        animate: { opacity: 1, transform: 'translateY(0px)' }
      }
    }[variant] || {
      initial: { opacity: 0, transform: 'translateY(30px)' },
      animate: { opacity: 1, transform: 'translateY(0px)' }
    };

    return {
      transition: `all ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      transitionDelay: `${delay}ms`,
      ...(isVisible ? config.animate : config.initial)
    };
  }, [visibleItems, staggerDelay, variant, animationDuration]);

  return {
    containerRef,
    getItemStyles
  };
};

/**
 * Hook per animazioni di parallax scroll avanzate
 */
export const useParallaxScroll = (options = {}) => {
  const {
    speed = 0.5,
    direction = 'vertical'
  } = options;

  const elementRef = useRef(null);
  const [transform, setTransform] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;

      if (direction === 'vertical') {
        setTransform({ x: 0, y: rate });
      } else if (direction === 'horizontal') {
        setTransform({ x: rate, y: 0 });
      } else if (direction === 'both') {
        setTransform({ x: rate * 0.5, y: rate });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  const parallaxStyles = {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    willChange: 'transform'
  };

  return {
    ref: elementRef,
    parallaxStyles
  };
};

export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -speed;
      setOffset(rate);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return [elementRef, offset];
};

export const useStickyHeader = (threshold = 100) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isSticky;
}; 
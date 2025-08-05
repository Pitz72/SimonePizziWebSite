import { useRef, useCallback, useEffect, useState, useMemo } from 'react';

/**
 * Hook per virtual scrolling con fallback sicuro
 * @param {Object} options - Opzioni di configurazione
 * @param {Array} options.items - Array di elementi da renderizzare
 * @param {number} options.itemHeight - Altezza fissa degli elementi (default: 60)
 * @param {number} options.overscan - Numero di elementi extra da renderizzare (default: 5)
 * @param {boolean} options.enabled - Abilita virtual scrolling (default: true)
 * @param {Function} options.renderItem - Funzione per renderizzare ogni elemento
 * @param {string} options.containerClassName - Classi CSS per il container
 * @returns {Object} - Ref, elementi visibili e controlli
 */
export const useVirtualScroll = (options = {}) => {
  const {
    items = [],
    itemHeight = 60,
    overscan = 5,
    enabled = true
  } = options;

  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [isVirtualScrolling, setIsVirtualScrolling] = useState(false);

  // Calcola se il virtual scrolling è necessario
  const shouldUseVirtualScrolling = useMemo(() => {
    if (!enabled || !items.length) return false;
    
    const totalHeight = items.length * itemHeight;
    const threshold = containerHeight * 2; // Attiva se lista è 2x più alta del container
    
    return totalHeight > threshold;
  }, [enabled, items.length, itemHeight, containerHeight]);

  // Calcola gli elementi visibili
  const visibleItems = useMemo(() => {
    if (!shouldUseVirtualScrolling) {
      // Fallback: ritorna tutti gli elementi
      return items.map((item, index) => ({
        item,
        index,
        style: { height: itemHeight }
      }));
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visible = [];
    for (let i = startIndex; i <= endIndex; i++) {
      visible.push({
        item: items[i],
        index: i,
        style: {
          height: itemHeight,
          transform: `translateY(${i * itemHeight}px)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0
        }
      });
    }

    return visible;
  }, [items, itemHeight, overscan, scrollTop, containerHeight, shouldUseVirtualScrolling]);

  // Gestisce lo scroll
  const handleScroll = useCallback((event) => {
    if (!shouldUseVirtualScrolling) return;
    
    const scrollTop = event.target.scrollTop;
    setScrollTop(scrollTop);
  }, [shouldUseVirtualScrolling]);

  // Aggiorna dimensioni container
  const updateContainerDimensions = useCallback(() => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    setContainerHeight(rect.height);
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Resize observer per aggiornare dimensioni
    const resizeObserver = new ResizeObserver(updateContainerDimensions);
    resizeObserver.observe(container);

    // Scroll listener
    container.addEventListener('scroll', handleScroll, { passive: true });

    // Initial dimensions
    updateContainerDimensions();

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, updateContainerDimensions]);

  // Aggiorna stato virtual scrolling
  useEffect(() => {
    setIsVirtualScrolling(shouldUseVirtualScrolling);
  }, [shouldUseVirtualScrolling]);

  // Stili del container
  const containerStyles = useMemo(() => {
    if (!shouldUseVirtualScrolling) {
      return { height: '100%', overflow: 'auto' };
    }

    return {
      height: '100%',
      overflow: 'auto',
      position: 'relative'
    };
  }, [shouldUseVirtualScrolling]);

  // Stili del content wrapper
  const contentStyles = useMemo(() => {
    if (!shouldUseVirtualScrolling) {
      return {};
    }

    return {
      height: `${items.length * itemHeight}px`,
      position: 'relative'
    };
  }, [shouldUseVirtualScrolling, items.length, itemHeight]);

  // Scroll to item
  const scrollToItem = useCallback((index) => {
    if (!containerRef.current) return;
    
    const targetScrollTop = index * itemHeight;
    containerRef.current.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  }, [itemHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (!containerRef.current) return;
    
    containerRef.current.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return {
    ref: containerRef,
    visibleItems,
    isVirtualScrolling,
    shouldUseVirtualScrolling,
    containerStyles,
    contentStyles,
    scrollToItem,
    scrollToTop,
    totalHeight: items.length * itemHeight,
    containerHeight
  };
}; 
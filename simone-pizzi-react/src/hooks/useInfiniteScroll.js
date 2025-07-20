import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Hook per infinite scroll con gestione sicura degli errori
 * @param {Object} options - Opzioni di configurazione
 * @param {Function} options.loadMore - Funzione per caricare più elementi
 * @param {boolean} options.hasMore - Se ci sono più elementi da caricare
 * @param {boolean} options.isLoading - Se sta caricando
 * @param {number} options.threshold - Distanza dal fondo per attivare caricamento (default: 100px)
 * @param {boolean} options.enabled - Abilita infinite scroll (default: true)
 * @param {number} options.debounceMs - Debounce per evitare chiamate multiple (default: 100ms)
 * @returns {Object} - Ref, stato e controlli
 */
export const useInfiniteScroll = (options = {}) => {
  const {
    loadMore,
    hasMore = false,
    isLoading = false,
    threshold = 100,
    enabled = true,
    debounceMs = 100
  } = options;

  const containerRef = useRef(null);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimeoutRef = useRef(null);

  // Verifica se siamo vicini al fondo
  const checkIfNearBottom = useCallback(() => {
    if (!containerRef.current || !enabled) return;

    const container = containerRef.current;
    const { scrollTop, scrollHeight, clientHeight } = container;
    
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceFromBottom <= threshold;
    
    setIsNearBottom(nearBottom);
  }, [enabled, threshold]);

  // Gestisce lo scroll con debounce
  const handleScroll = useCallback(() => {
    if (!enabled) return;

    // Clear timeout precedente
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce per evitare chiamate multiple
    debounceTimeoutRef.current = setTimeout(() => {
      checkIfNearBottom();
    }, debounceMs);
  }, [enabled, checkIfNearBottom, debounceMs]);

  // Carica più elementi quando necessario
  const triggerLoadMore = useCallback(async () => {
    if (!enabled || !hasMore || isLoading || !isNearBottom) return;

    try {
      setError(null);
      await loadMore();
    } catch (err) {
      setError(err.message || 'Errore nel caricamento');
      console.error('Infinite scroll error:', err);
    }
  }, [enabled, hasMore, isLoading, isNearBottom, loadMore]);

  // Effetto per caricare quando siamo vicini al fondo
  useEffect(() => {
    triggerLoadMore();
  }, [triggerLoadMore]);

  // Setup event listeners
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    
    // Scroll listener
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Resize listener per aggiornare calcoli
    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(container);

    // Initial check
    checkIfNearBottom();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [enabled, handleScroll, checkIfNearBottom]);

  // Reset error quando cambiano le opzioni
  useEffect(() => {
    setError(null);
  }, [loadMore]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (!containerRef.current) return;
    
    containerRef.current.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (!containerRef.current) return;
    
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, []);

  // Retry loading
  const retry = useCallback(() => {
    setError(null);
    triggerLoadMore();
  }, [triggerLoadMore]);

  return {
    ref: containerRef,
    isNearBottom,
    isLoading,
    hasMore,
    error,
    scrollToTop,
    scrollToBottom,
    retry
  };
}; 
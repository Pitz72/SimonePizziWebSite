import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook per tracciare la navigazione e sbloccare achievement
 * @param {Object} options - Opzioni di configurazione
 * @param {Function} options.onPageVisit - Callback quando visita pagina
 * @param {Function} options.unlockAchievement - Funzione per sbloccare achievement
 * @param {Function} options.updateProgress - Funzione per aggiornare progress
 * @param {boolean} options.enabled - Abilita tracking (default: true)
 */
export const useNavigationTracking = (options = {}) => {
  const {
    onPageVisit,
    unlockAchievement,
    updateProgress,
    enabled = true
  } = options;

  const location = useLocation();

  // Traccia visita pagina
  const trackPageVisit = useCallback((pathname) => {
    if (!enabled) return;

    // Ottieni pagine visitate da localStorage
    const visitedPages = JSON.parse(localStorage.getItem('simone-pizzi-visited-pages') || '[]');
    
    // Aggiungi pagina se non già visitata
    if (!visitedPages.includes(pathname)) {
      visitedPages.push(pathname);
      localStorage.setItem('simone-pizzi-visited-pages', JSON.stringify(visitedPages));
      
      // Callback
      if (onPageVisit) {
        onPageVisit(pathname, visitedPages.length);
      }
    }

    // Aggiorna progress esploratore
    if (updateProgress) {
      updateProgress('explorer', visitedPages.length);
      
      // Sblocca achievement se raggiunto target
      if (visitedPages.length >= 5) {
        unlockAchievement('explorer');
      }
    }

    // Sblocca achievement specifici per pagina
    if (unlockAchievement) {
      switch (pathname) {
        case '/contatti':
          unlockAchievement('contact-maker');
          break;
        case '/videogiochi':
          unlockAchievement('game-lover');
          break;
        case '/software':
          unlockAchievement('software-explorer');
          break;
        case '/chi-sono': {
          // Controlla se ha letto articoli
          const readArticles = JSON.parse(localStorage.getItem('simone-pizzi-read-articles') || '[]');
          if (readArticles.length >= 3) {
            unlockAchievement('reader');
          }
          break;
        }
      }
    }
  }, [enabled, onPageVisit, unlockAchievement, updateProgress]);

  // Traccia scroll
  const trackScroll = useCallback(() => {
    if (!enabled || !updateProgress) return;

    const scrollY = window.scrollY;
    updateProgress('scroll-master', scrollY);
    
    // Sblocca achievement se raggiunto target
    if (scrollY >= 1000) {
      unlockAchievement('scroll-master');
    }
  }, [enabled, updateProgress, unlockAchievement]);

  // Traccia click
  const trackClick = useCallback(() => {
    if (!enabled || !updateProgress) return;

    const clickCount = parseInt(localStorage.getItem('simone-pizzi-click-count') || '0') + 1;
    localStorage.setItem('simone-pizzi-click-count', clickCount.toString());
    
    updateProgress('click-counter', clickCount);
    
    // Sblocca achievement se raggiunto target
    if (clickCount >= 50) {
      unlockAchievement('click-counter');
    }
  }, [enabled, updateProgress, unlockAchievement]);

  // Traccia tempo speso
  const trackTimeSpent = useCallback(() => {
    if (!enabled || !updateProgress) return;

    const startTime = parseInt(localStorage.getItem('simone-pizzi-start-time') || Date.now().toString());
    const currentTime = Date.now();
    const timeSpent = Math.floor((currentTime - startTime) / 1000); // secondi
    
    updateProgress('time-spent', timeSpent);
    
    // Sblocca achievement se raggiunto target (5 minuti = 300 secondi)
    if (timeSpent >= 300) {
      unlockAchievement('time-spent');
    }
  }, [enabled, updateProgress, unlockAchievement]);

  // Setup tracking
  useEffect(() => {
    if (!enabled) return;

    // Imposta tempo di inizio se non presente
    if (!localStorage.getItem('simone-pizzi-start-time')) {
      localStorage.setItem('simone-pizzi-start-time', Date.now().toString());
    }

    // Traccia visita pagina corrente
    trackPageVisit(location.pathname);

    // Event listeners
    const handleScroll = () => trackScroll();
    const handleClick = () => trackClick();

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('click', handleClick, { passive: true });

    // Timer per tracciare tempo speso
    const timeInterval = setInterval(trackTimeSpent, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      clearInterval(timeInterval);
    };
  }, [location.pathname, enabled, trackPageVisit, trackScroll, trackClick, trackTimeSpent]);

  return {
    trackPageVisit,
    trackScroll,
    trackClick,
    trackTimeSpent
  };
}; 
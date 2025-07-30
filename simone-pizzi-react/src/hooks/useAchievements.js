import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook per sistema achievement con localStorage sicuro
 * @param {Object} options - Opzioni di configurazione
 * @param {Array} options.achievements - Array di achievement disponibili
 * @param {boolean} options.enabled - Abilita sistema achievement (default: true)
 * @param {Function} options.onUnlock - Callback quando achievement sbloccato
 * @returns {Object} - Achievement, progress e controlli
 */
export const useAchievements = (options = {}) => {
  const {
    achievements = [],
    enabled = true,
    onUnlock
  } = options;

  const [unlockedAchievements, setUnlockedAchievements] = useState(new Set());
  const [progress, setProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carica achievement da localStorage
  const loadAchievements = useCallback(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem('simone-pizzi-achievements');
      if (stored) {
        const data = JSON.parse(stored);
        setUnlockedAchievements(new Set(data.unlocked || []));
        setProgress(data.progress || {});
      }
    } catch (err) {
      console.error('Errore caricamento achievement:', err);
      setError('Errore caricamento achievement');
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  // Salva achievement in localStorage
  const saveAchievements = useCallback((unlocked, progressData) => {
    if (!enabled) return;

    try {
      const data = {
        unlocked: Array.from(unlocked),
        progress: progressData,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('simone-pizzi-achievements', JSON.stringify(data));
    } catch (err) {
      console.error('Errore salvataggio achievement:', err);
      setError('Errore salvataggio achievement');
    }
  }, [enabled]);

  // Sblocca achievement
  const unlockAchievement = useCallback((achievementId) => {
    if (!enabled || !achievementId) return;

    setUnlockedAchievements(prev => {
      const newUnlocked = new Set(prev);
      if (!newUnlocked.has(achievementId)) {
        newUnlocked.add(achievementId);
        
        // Salva immediatamente
        saveAchievements(newUnlocked, progress);
        
        // Callback
        if (onUnlock) {
          const achievement = achievements.find(a => a.id === achievementId);
          onUnlock(achievement, achievementId);
        }
      }
      return newUnlocked;
    });
  }, [enabled, saveAchievements, onUnlock]);

  // Aggiorna progress
  const updateProgress = useCallback((achievementId, value) => {
    if (!enabled || !achievementId) return;

    setProgress(prev => {
      const newProgress = { ...prev };
      newProgress[achievementId] = value;
      
      // Salva immediatamente
      saveAchievements(unlockedAchievements, newProgress);
      
      return newProgress;
    });
  }, [enabled, unlockedAchievements, saveAchievements]);

  // Verifica se achievement è sbloccato
  const isUnlocked = useCallback((achievementId) => {
    return unlockedAchievements.has(achievementId);
  }, [unlockedAchievements]);

  // Ottieni progress achievement
  const getProgress = useCallback((achievementId) => {
    return progress[achievementId] || 0;
  }, [progress]);

  // Calcola percentuale completamento
  const getCompletionPercentage = useCallback((achievementId) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement || !achievement.target) return 0;
    
    const current = getProgress(achievementId);
    return Math.min((current / achievement.target) * 100, 100);
  }, [achievements, getProgress]);

  // Reset achievement (per testing)
  const resetAchievements = useCallback(() => {
    if (!enabled) return;

    setUnlockedAchievements(new Set());
    setProgress({});
    saveAchievements(new Set(), {});
  }, [enabled, saveAchievements]);

  // Export achievement data
  const exportAchievements = useCallback(() => {
    if (!enabled) return null;

    try {
      return {
        unlocked: Array.from(unlockedAchievements),
        progress,
        totalAchievements: achievements.length,
        unlockedCount: unlockedAchievements.size,
        completionPercentage: (unlockedAchievements.size / achievements.length) * 100
      };
    } catch (err) {
      console.error('Errore export achievement:', err);
      return null;
    }
  }, [enabled, unlockedAchievements, progress, achievements.length]);

  // Carica achievement al mount
  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  // Achievement con stato
  const achievementsWithState = useMemo(() => {
    return achievements.map(achievement => ({
      ...achievement,
      isUnlocked: isUnlocked(achievement.id),
      progress: getProgress(achievement.id),
      completionPercentage: getCompletionPercentage(achievement.id)
    }));
  }, [achievements, isUnlocked, getProgress, getCompletionPercentage]);

  // Statistiche
  const stats = useMemo(() => {
    const total = achievements.length;
    const unlocked = unlockedAchievements.size;
    const percentage = total > 0 ? (unlocked / total) * 100 : 0;

    return {
      total,
      unlocked,
      locked: total - unlocked,
      percentage: Math.round(percentage * 100) / 100
    };
  }, [achievements.length, unlockedAchievements.size]);

  return {
    achievements: achievementsWithState,
    unlockedAchievements,
    progress,
    stats,
    isLoading,
    error,
    unlockAchievement,
    updateProgress,
    isUnlocked,
    getProgress,
    getCompletionPercentage,
    resetAchievements,
    exportAchievements
  };
}; 
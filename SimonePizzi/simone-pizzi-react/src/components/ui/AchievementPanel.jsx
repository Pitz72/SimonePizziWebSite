import React, { useState } from 'react';
import { useAchievements } from '../../hooks';
import { Trophy, Lock, Unlock, BarChart3, RotateCcw, Download } from 'lucide-react';

/**
 * Componente pannello achievement con design coerente
 * @param {Object} props - Proprietà del componente
 * @param {Array} props.achievements - Array di achievement disponibili
 * @param {boolean} props.showProgress - Mostra barre progresso (default: true)
 * @param {boolean} props.showStats - Mostra statistiche (default: true)
 * @param {boolean} props.showControls - Mostra controlli (default: false)
 * @param {string} props.className - Classi CSS aggiuntive
 */
const AchievementPanel = ({
  achievements = [],
  showProgress = true,
  showControls = false,
  className = '',
  ...props
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const {
    achievements: achievementsWithState,
    stats,
    isLoading,
    error,
    resetAchievements,
    exportAchievements
  } = useAchievements({
    achievements,
    enabled: true,
    onUnlock: (achievement, id) => {
      console.log(`🎉 Achievement sbloccato: ${achievement?.title || id}`);
    }
  });

  // Export achievement data
  const handleExport = () => {
    const data = exportAchievements();
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `achievements-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExport(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 bg-bg-secondary rounded-lg ${className}`} {...props}>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <span className="ml-3 text-text-secondary">Caricamento achievement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 bg-red-500/10 border border-red-500/20 rounded-lg ${className}`} {...props}>
        <div className="text-red-500 text-center">
          <p>Errore caricamento achievement</p>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-bg-secondary rounded-lg border border-border-primary ${className}`} {...props}>
      {/* Header */}
      <div className="p-6 border-b border-border-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-primary-500" />
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Achievement</h3>
              <p className="text-sm text-text-secondary">
                {stats.unlocked} di {stats.total} sbloccati ({stats.percentage.toFixed(1)}%)
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {showControls && (
              <>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="p-2 text-primary-500 hover:bg-primary-500/10 rounded-full transition-colors"
                  title="Mostra dettagli"
                >
                  <BarChart3 size={16} />
                </button>
                
                <button
                  onClick={() => setShowExport(!showExport)}
                  className="p-2 text-primary-500 hover:bg-primary-500/10 rounded-full transition-colors"
                  title="Esporta dati"
                >
                  <Download size={16} />
                </button>
                
                <button
                  onClick={resetAchievements}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                  title="Reset achievement"
                >
                  <RotateCcw size={16} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {showProgress && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <span>Progresso</span>
              <span>{stats.percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-bg-surface rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Achievement list */}
      <div className="p-6">
        <div className="grid gap-4">
          {achievementsWithState.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                achievement.isUnlocked
                  ? 'bg-primary-500/10 border-primary-500/20'
                  : 'bg-bg-surface border-border-primary'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${
                  achievement.isUnlocked
                    ? 'bg-primary-500/20 text-primary-500'
                    : 'bg-text-muted/20 text-text-muted'
                }`}>
                  {achievement.isUnlocked ? (
                    <Unlock size={16} />
                  ) : (
                    <Lock size={16} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-medium ${
                      achievement.isUnlocked ? 'text-text-primary' : 'text-text-secondary'
                    }`}>
                      {achievement.title}
                    </h4>
                    {achievement.points && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        achievement.isUnlocked
                          ? 'bg-primary-500/20 text-primary-500'
                          : 'bg-text-muted/20 text-text-muted'
                      }`}>
                        {achievement.points} pts
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm mt-1 ${
                    achievement.isUnlocked ? 'text-text-secondary' : 'text-text-muted'
                  }`}>
                    {achievement.description}
                  </p>

                  {/* Progress bar per achievement con target */}
                  {showProgress && achievement.target && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-text-muted mb-1">
                        <span>Progresso</span>
                        <span>{achievement.progress || 0} / {achievement.target}</span>
                      </div>
                      <div className="w-full bg-bg-primary rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            achievement.isUnlocked
                              ? 'bg-primary-500'
                              : 'bg-text-muted'
                          }`}
                          style={{ width: `${achievement.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Export modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-surface p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              Esporta Achievement
            </h3>
            <p className="text-text-secondary mb-6">
              Scarica i tuoi achievement in formato JSON per backup o condivisione.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleExport}
                className="flex-1 bg-primary-500 text-bg-primary px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Esporta
              </button>
              <button
                onClick={() => setShowExport(false)}
                className="flex-1 bg-bg-secondary text-text-primary px-4 py-2 rounded-lg hover:bg-bg-primary transition-colors"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AchievementPanel; 
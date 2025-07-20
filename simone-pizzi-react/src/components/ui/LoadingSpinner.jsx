import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  variant = 'default', 
  text = '', 
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-8 h-8';
      case 'xl':
        return 'w-12 h-12';
      default:
        return 'w-6 h-6';
    }
  };

  const getSpinnerContent = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`${getSizeClasses()} bg-primary-500 rounded-full animate-pulse`}></div>
        );
      
      case 'ring':
        return (
          <div className={`${getSizeClasses()} border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin`}></div>
        );
      
      case 'bars':
        return (
          <div className="flex space-x-1">
            <div className="w-1 h-4 bg-primary-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-1 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-4 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          </div>
        );
      
      case 'gradient':
        return (
          <div className={`${getSizeClasses()} bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-spin`}>
            <div className="w-full h-full bg-bg-primary rounded-full m-0.5"></div>
          </div>
        );
      
      default:
        return (
          <div className={`${getSizeClasses()} border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin`}></div>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      {getSpinnerContent()}
      {text && (
        <span className="text-text-muted text-sm font-medium animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
};

// Loading Overlay per pagine intere
export const LoadingOverlay = ({ 
  isLoading, 
  text = 'Caricamento...', 
  variant = 'default' 
}) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-bg-surface/90 backdrop-blur-xl border border-border-primary rounded-2xl p-8 shadow-2xl">
        <LoadingSpinner size="xl" variant={variant} text={text} />
      </div>
    </div>
  );
};

// Skeleton Loading per contenuti
export const Skeleton = ({ 
  variant = 'text', 
  lines = 1, 
  className = '' 
}) => {
  const getSkeletonContent = () => {
    switch (variant) {
      case 'avatar':
        return <div className="w-12 h-12 bg-bg-secondary rounded-full animate-pulse"></div>;
      
      case 'image':
        return <div className="w-full h-48 bg-bg-secondary rounded-xl animate-pulse"></div>;
      
      case 'card':
        return (
          <div className="bg-bg-surface border border-border-primary rounded-xl p-6 space-y-4">
            <div className="w-3/4 h-6 bg-bg-secondary rounded animate-pulse"></div>
            <div className="w-full h-4 bg-bg-secondary rounded animate-pulse"></div>
            <div className="w-2/3 h-4 bg-bg-secondary rounded animate-pulse"></div>
          </div>
        );
      
      case 'button':
        return <div className="w-24 h-10 bg-bg-secondary rounded-lg animate-pulse"></div>;
      
      default:
        return (
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, index) => (
              <div 
                key={index}
                className={`h-4 bg-bg-secondary rounded animate-pulse ${
                  index === lines - 1 ? 'w-3/4' : 'w-full'
                }`}
              ></div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className={`animate-pulse ${className}`}>
      {getSkeletonContent()}
    </div>
  );
};

export default LoadingSpinner; 
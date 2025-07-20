import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  position = 'top-right' 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "flex items-center gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl border transition-all duration-300";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-500/10 border-green-500/20 text-green-100`;
      case 'error':
        return `${baseStyles} bg-red-500/10 border-red-500/20 text-red-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-500/10 border-yellow-500/20 text-yellow-100`;
      default:
        return `${baseStyles} bg-blue-500/10 border-blue-500/20 text-blue-100`;
    }
  };

  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed z-50 ${getPositionStyles()} ${
        isExiting 
          ? 'opacity-0 scale-95 translate-y-2' 
          : 'opacity-100 scale-100 translate-y-0'
      }`}
    >
      <div className={getStyles()}>
        {getIcon()}
        <span className="flex-1 font-medium">{message}</span>
        <button
          onClick={handleClose}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors duration-200"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Toast Container per gestire multiple notifiche
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed z-50 top-4 right-4 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast; 
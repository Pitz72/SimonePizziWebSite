import { useState, createContext } from 'react';

export const ToastContext = createContext();

// Hook per gestire i toast
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, duration) => addToast(message, 'success', duration);
  const error = (message, duration) => addToast(message, 'error', duration);
  const warning = (message, duration) => addToast(message, 'warning', duration);
  const info = (message, duration) => addToast(message, 'info', duration);

  // Funzione showToast per compatibilità
  const showToast = (options) => {
    const { title, message, type = 'info', duration = 5000 } = options;
    addToast(message || title, type, duration);
  };

  return { toasts, addToast, removeToast, success, error, warning, info, showToast };
}; 
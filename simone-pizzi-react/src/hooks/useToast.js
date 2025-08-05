// src/hooks/useToast.js

import { useContext } from 'react';
// 1. Importa il contesto dal file del contesto
import { ToastContext } from '../contexts/ToastContext';

// 2. Crea ed esporta l'hook per consumare il contesto
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  // 3. Aggiungi qui le funzioni di convenienza (success, error, etc.)
  const { addToast } = context;

  const showToast = (options) => addToast(options);
  const success = (message, duration) => addToast({ message, type: 'success', duration });
  const error = (message, duration) => addToast({ message, type: 'error', duration });
  const warning = (message, duration) => addToast({ message, type: 'warning', duration });
  const info = (message, duration) => addToast({ message, type: 'info', duration });

  return { ...context, showToast, success, error, warning, info };
};
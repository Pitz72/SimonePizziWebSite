import React from 'react';
import { ToastContext, useToast } from '../hooks/useToast';

export const ToastProvider = ({ children }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
    </ToastContext.Provider>
  );
}; 
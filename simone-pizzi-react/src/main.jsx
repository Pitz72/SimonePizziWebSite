import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './contexts/ToastContext'; // Importa il provider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider> {/* Avvolgi l'App */}
      <App />
    </ToastProvider>
  </StrictMode>,
)

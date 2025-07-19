/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // PRESERVAZIONE PALETTE COLORI ESATTA
      colors: {
        'primary-green': '#00ff88',      // Verde neon principale
        'secondary-green': '#00cc6a',    // Verde hover/secondario
        'background-dark': '#0a0a0a',    // Sfondo principale
        'surface-dark': '#1a1a1a',       // Sfondo cards/forms
        'dark-green': '#0d2818',         // Verde scuro sottile
        'text-muted': '#b3b3b3',         // Testo secondario
      },
      // PRESERVAZIONE SPACING SISTEMA
      spacing: {
        'section': '5rem',               // --spacing-section
        'element': '2rem',               // --spacing-element
      },
      // PRESERVAZIONE BREAKPOINT
      screens: {
        'mobile': '768px',               // --mobile-breakpoint
      },
      // ANIMAZIONI CUSTOM
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'aurora': 'aurora 8s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        aurora: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        }
      }
    },
  },
  plugins: [],
} 
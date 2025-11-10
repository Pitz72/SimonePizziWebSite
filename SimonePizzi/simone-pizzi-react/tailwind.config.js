/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ===== COLOR PALETTE ESTESA =====
      colors: {
        // Primary Colors
        'primary': {
          50: '#e6fff2',
          100: '#ccffe6',
          200: '#99ffcc',
          300: '#66ffb3',
          400: '#33ff99',
          500: '#00ff88',    // Primary green
          600: '#00cc6a',    // Hover state
          700: '#00b366',    // Dark variant
          800: '#009952',
          900: '#00803d',
        },
        
        // Background Colors
        'bg': {
          'primary': '#0a0a0a',
          'secondary': '#1a1a1a',
          'tertiary': '#141414',
          'accent': '#002a15',
          'surface': '#1a1a1a',
        },
        
        // Text Colors
        'text': {
          'primary': '#ffffff',
          'secondary': '#e0e0e0',
          'muted': '#a0a0a0',
          'disabled': '#666666',
          'accent': '#00ff88',
        },
        
        // Border Colors
        'border': {
          'primary': '#2a2a2a',
          'secondary': '#404040',
          'accent': '#00ff88',
          'hover': '#00cc6a',
        },
        
        // Legacy support
        'primary-green': '#00ff88',
        'secondary-green': '#00cc6a',
        'background-dark': '#0a0a0a',
        'surface-dark': '#1a1a1a',
        'dark-green': '#0d2818',
        'text-muted': '#b3b3b3',
      },
      
      // ===== SPACING SYSTEM =====
      spacing: {
        'xs': '0.5rem',      // 8px
        'sm': '1rem',        // 16px
        'md': '1.5rem',      // 24px
        'lg': '2rem',        // 32px
        'xl': '3rem',        // 48px
        '2xl': '4rem',       // 64px
        '3xl': '6rem',       // 96px
        'section': '5rem',   // Legacy
        'element': '2rem',   // Legacy
      },
      
      // ===== TYPOGRAPHY =====
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.6rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      
      // ===== BORDER RADIUS =====
      borderRadius: {
        'sm': '0.375rem',    // 6px
        'md': '0.5rem',      // 8px
        'lg': '0.75rem',     // 12px
        'xl': '1rem',        // 16px
        '2xl': '1.5rem',     // 24px
      },
      
      // ===== SHADOWS =====
      boxShadow: {
        'glow': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 255, 136, 0.2)',
        'glow-xl': '0 0 60px rgba(0, 255, 136, 0.15)',
        'inner-glow': 'inset 0 0 20px rgba(0, 255, 136, 0.1)',
      },
      
      // ===== ANIMATIONS AVANZATE =====
      animation: {
        'shimmer': 'shimmer 2s infinite linear',
        'aurora': 'aurora 8s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'fade-in-left': 'fadeInLeft 0.6s ease-out',
        'fade-in-right': 'fadeInRight 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'typewriter': 'typewriter 3s steps(40) 1s 1 normal both',
        'blink': 'blink 1s infinite',
      },
      
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        aurora: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        fadeInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
      },
      
      // ===== TRANSITIONS =====
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
      },
      
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // ===== GRADIENTS =====
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #00ff88, #00cc6a)',
        'gradient-dark': 'linear-gradient(135deg, #002a15, #1a1a1a)',
        'gradient-surface': 'linear-gradient(135deg, #1a1a1a, #002a15)',
        'gradient-glow': 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.1), transparent)',
      },
      
      // ===== BACKDROP BLUR =====
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      
      // ===== Z-INDEX =====
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
      },
      
      // ===== SCREENS =====
      screens: {
        'mobile': '768px',
        'tablet': '1024px',
        'desktop': '1280px',
        'wide': '1536px',
      },
    },
  },
  plugins: [
    // Plugin per animazioni scroll-triggered
    function({ addUtilities }) {
      const newUtilities = {
        '.scroll-trigger': {
          'opacity': '0',
          'transform': 'translateY(30px)',
          'transition': 'opacity 0.6s ease-out, transform 0.6s ease-out',
        },
        '.scroll-trigger.animate': {
          'opacity': '1',
          'transform': 'translateY(0)',
        },
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #00ff88, #00cc6a)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.border-gradient': {
          'border-image': 'linear-gradient(135deg, #00ff88, #00cc6a) 1',
        },
        '.glass': {
          'background': 'rgba(26, 26, 26, 0.8)',
          'backdrop-filter': 'blur(12px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-light': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(8px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
      }
      addUtilities(newUtilities)
    }
  ],
} 
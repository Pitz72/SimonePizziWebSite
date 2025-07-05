# 📚 DOCUMENTAZIONE TECNICA COMPLETA
*Simone Pizzi Website - React Version v1.0.0*

**🔗 DOCUMENTI CORRELATI:**
- 📋 [Anti-Regressione Completo](./ANTI_REGRESSIONE_COMPLETO.md) - Checklist e procedure anti-regressione
- 📊 [Log Risoluzione Completo](./LOG_RISOLUZIONE_COMPLETO.md) - Log dettagliato di tutti i problemi risolti
- 🚀 [Roadmap Completa](./ROADMAP_COMPLETA.md) - Piano strategico e timeline
- 🔧 [Issue Resolution Log](./ISSUE_RESOLUTION_LOG.md) - Log tecnico delle issue

**Status Progetto:** ✅ PRODUCTION READY  
**Ultimo aggiornamento:** 5 Luglio 2025

## 📋 INDICE
1. [Panoramica Progetto](#panoramica-progetto)
2. [Architettura Tecnica](#architettura-tecnica)
3. [Struttura File](#struttura-file)
4. [Configurazione](#configurazione)
5. [Componenti](#componenti)
6. [Stili e Design System](#stili-e-design-system)
7. [Performance](#performance)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 PANORAMICA PROGETTO

### Obiettivi
Creare una versione moderna e performante del sito web di Simone Pizzi utilizzando tecnologie all'avanguardia per garantire:
- **Stabilità**: Header e footer fissi, layout robusto
- **Performance**: SPA con routing client-side
- **Scalabilità**: Architettura modulare e manutenibile
- **Accessibilità**: Design inclusive e standards-compliant

### Tecnologie Scelte

| Tecnologia | Versione | Motivo della Scelta |
|------------|----------|-------------------|
| **React** | 19.1.0 | Framework moderno, ecosystem maturo |
| **Vite** | 7.0.2 | Build veloce, HMR ottimizzato |
| **React Router** | 7.6.3 | Routing SPA standard de facto |
| **Lucide React** | 0.525.0 | Icone SVG ottimizzate e tree-shakable |
| **Framer Motion** | 12.23.0 | Animazioni performanti (ready to use) |

---

## 🏗️ ARCHITETTURA TECNICA

### Pattern Architetturali

#### 1. **Component-Based Architecture**
```
┌─ App.jsx (Router Provider)
├─ Layout (Header + Footer fissi)
├─ Pages (Route components)
└─ UI Components (Riutilizzabili)
```

#### 2. **File Organization Pattern**
```
src/
├── components/
│   ├── layout/        # Layout components (Header, Footer)
│   ├── ui/           # Reusable UI components
│   └── index.js      # Centralized exports
├── pages/            # Route components
├── hooks/            # Custom React hooks
├── utils/            # Pure functions
└── assets/           # Static assets
```

#### 3. **CSS Architecture**
- **CSS Custom Properties**: Design system centralizzato
- **Component-Scoped CSS**: Evita conflitti di stile
- **Mobile-First**: Responsive design progressivo

### Data Flow
```
App.jsx (Router)
  ↓
Layout.jsx (Header + Footer)
  ↓
Pages (Home, About, etc.)
  ↓
UI Components (ArticleCard, etc.)
```

---

## 📁 STRUTTURA FILE DETTAGLIATA

```
simone-pizzi-react/
├── public/
│   ├── assets/               # Immagini e media (copiate dal sito originale)
│   └── vite.svg             # Favicon placeholder
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx    # Navigazione principale + mobile menu
│   │   │   ├── Header.css    # Stili header responsivi
│   │   │   ├── Footer.jsx    # Footer con social links
│   │   │   ├── Footer.css    # Stili footer
│   │   │   ├── Layout.jsx    # Wrapper principale con header/footer fissi
│   │   │   ├── Layout.css    # Layout grid e spacing
│   │   │   └── index.js      # Export centralizzato layout
│   │   ├── ui/
│   │   │   ├── ArticleCard.jsx  # Card articoli blog
│   │   │   ├── ArticleCard.css  # Stili card responsive
│   │   │   └── index.js         # Export centralizzato UI
│   │   └── index.js          # Export centralizzato tutti componenti
│   ├── pages/
│   │   ├── Home.jsx          # Homepage con hero + features
│   │   ├── Home.css          # Stili homepage
│   │   ├── About.jsx         # Pagina chi sono + blog
│   │   └── About.css         # Stili about page
│   ├── hooks/                # Custom hooks (pronti per uso futuro)
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript definitions
│   ├── App.jsx               # Main app component con routing
│   ├── App.css               # Stili app globali
│   ├── index.css             # CSS reset + design system
│   └── main.jsx              # Entry point React
├── docs/                     # Documentazione
│   ├── ISSUE_RESOLUTION_LOG.md
│   ├── COMPLETE_DOCUMENTATION.md
│   ├── ROADMAP.md
│   └── REGRESSION_PREVENTION.md
├── dist/                     # Build di produzione
├── node_modules/            # Dipendenze npm
├── package.json             # Configurazione npm
├── vite.config.js           # Configurazione Vite
├── eslint.config.js         # Configurazione ESLint
├── index.html               # HTML template
└── README.md                # Documentazione principale
```

---

## ⚙️ CONFIGURAZIONE

### Vite Configuration (`vite.config.js`)
```javascript
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      // ... altri alias per import più puliti
    },
  },
  server: {
    port: 3000,        # Port fisso per sviluppo
    host: true,        # Accesso da rete locale
  },
  build: {
    outDir: 'dist',
    sourcemap: true,   # Debug maps per produzione
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],      # Chunk React core
          router: ['react-router-dom'],        # Chunk routing
          ui: ['lucide-react', 'framer-motion'], # Chunk UI libs
        },
      },
    },
  },
})
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "vite",                    # Dev server con HMR
    "build": "vite build",            # Build ottimizzato
    "preview": "vite preview",        # Preview build locale
    "lint": "eslint ."                # Code linting
  }
}
```

---

## 🧩 COMPONENTI

### Layout Components

#### Header.jsx
**Responsabilità**:
- Navigazione principale desktop/mobile
- Logo e tagline
- Menu hamburger responsivo
- Scroll detection per effetti

**Props**: Nessuna (self-contained)

**Features**:
- Navigazione attiva (highlight current page)
- Menu mobile con overlay
- Scroll blur effect
- Accessibility compliant

#### Footer.jsx
**Responsabilità**:
- Social links
- Copyright
- Informazioni contatto

**Props**: Nessuna (self-contained)

**Features**:
- Icon + text social links
- External link handling
- Responsive layout

#### Layout.jsx
**Responsabilità**:
- Wrapper principale con header/footer fissi
- Main content area
- Consistent spacing

**Props**:
- `children`: React.ReactNode

### UI Components

#### ArticleCard.jsx
**Responsabilità**:
- Display articoli blog
- Image + metadata + preview
- Call-to-action

**Props**:
```javascript
{
  imageUrl: string,     // Path immagine
  imageAlt: string,     // Alt text accessibilità
  title: string,        // Titolo articolo
  date: string,         // Data formato ISO
  readTime: number,     // Minuti lettura
  preview: string,      // Preview testo
  link: string          // URL articolo
}
```

**Features**:
- Image lazy loading
- Date formatting localizzato
- Text truncation (line-clamp)
- Hover effects
- Responsive design

### Page Components

#### Home.jsx
**Sezioni**:
1. **Hero**: Intro + CTA buttons
2. **Features**: 4 sezioni principali (Podcast, Libri, Software, Videogiochi)
3. **Latest Updates**: Ultimi aggiornamenti progetti

#### About.jsx
**Sezioni**:
1. **Page Hero**: Intestazione pagina
2. **Article Content**: Contenuto principale biografia
3. **Blog Section**: Grid articoli con ArticleCard

---

## 🎨 STILI E DESIGN SYSTEM

### CSS Custom Properties (Design Tokens)
```css
:root {
  /* Colors */
  --primary-green: #00ff88;        # Brand color principale
  --secondary-green: #00cc6a;      # Brand color secondario
  --background-dark: #0a0a0a;      # Background principale
  --surface-dark: #1a1a1a;         # Surface cards
  --text-light: #ffffff;           # Testo principale
  --text-muted: #b3b3b3;          # Testo secondario
  --border-color: #2a2a2a;         # Bordi
  
  /* Spacing */
  --spacing-section: 5rem;         # Padding sezioni
  --spacing-column-gap: 5rem;      # Gap colonne
  --container-width: 1200px;       # Max width container
  
  /* Layout */
  --header-height: 80px;           # Altezza header fissa
  --footer-height: 120px;          # Altezza footer
  
  /* Transitions */
  --transition-fast: 0.2s ease;    # Transizioni veloci
  --transition-medium: 0.3s ease;  # Transizioni medie
  
  /* Border Radius */
  --radius-small: 8px;
  --radius-medium: 12px;
  --radius-large: 20px;
}
```

### Typography Scale
```css
h1: clamp(2.5rem, 5vw, 4rem)      # Responsive 40px-64px
h2: clamp(2rem, 4vw, 2.8rem)      # Responsive 32px-45px
h3: clamp(1.5rem, 3vw, 1.8rem)    # Responsive 24px-29px
p:  clamp(1rem, 2vw, 1.2rem)      # Responsive 16px-19px
```

### Responsive Breakpoints
```css
/* Mobile First Approach */
@media (max-width: 480px)   # Small mobile
@media (max-width: 768px)   # Mobile & tablet
@media (max-width: 1024px)  # Tablet landscape
```

### Component Naming Convention
```css
/* BEM-inspired */
.component-name                    # Block
.component-name__element          # Element
.component-name--modifier         # Modifier
```

---

## ⚡ PERFORMANCE

### Bundle Analysis
```
Production Build Results:
├── CSS: 17.01 kB (3.66 kB gzipped)
├── UI Chunk: 7.86 kB (2.48 kB gzipped)
├── Vendor: 11.76 kB (4.20 kB gzipped)
├── Router: 33.91 kB (12.54 kB gzipped)
├── Main: 189.78 kB (60.03 kB gzipped)
└── Total: ~262 kB (~82 kB gzipped)
```

### Performance Optimizations

#### Code Splitting
- **Vendor chunk**: React + React DOM
- **Router chunk**: React Router + deps
- **UI chunk**: Lucide icons + Framer Motion
- **Main chunk**: Application code

#### Asset Optimization
- **Image lazy loading**: `loading="lazy"` su tutte le immagini
- **Font optimization**: Google Fonts con preconnect
- **Icon tree-shaking**: Solo icone utilizzate incluse nel bundle

#### Runtime Performance
- **React 19**: Concurrent features per UI non-blocking
- **CSS-in-CSS**: No runtime CSS overhead
- **Minimal re-renders**: Ottimizzazione state management

### Performance Metrics Target
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 100kB gzipped ✅

---

## 🚀 DEPLOYMENT

### Build Process
```bash
npm run build    # Genera dist/ folder
```

### Deployment Platforms

#### Netlify (Recommended)
```toml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Vercel
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Static Hosting
- Upload `dist/` folder contents
- Configure server per SPA routing (redirect /* to /index.html)

### Environment Variables
```bash
# .env.local
VITE_APP_TITLE="Simone Pizzi Website"
VITE_API_URL="https://api.simonepizzi.com"
```

---

## 🔧 TROUBLESHOOTING

### Common Issues

#### 1. **Module Resolution Errors**
**Symptom**: `Cannot find module './Component'`
**Solution**: 
- Verificare export/import paths
- Controllare file index.js
- Verificare configurazione alias Vite

#### 2. **CSS Issues**
**Symptom**: Stili non applicati
**Solution**:
- Verificare import CSS nei componenti
- Controllare specificity CSS
- Verificare CSS custom properties

#### 3. **Routing Issues**
**Symptom**: 404 su route dirette
**Solution**:
- Configurare server redirect per SPA
- Verificare route definition in App.jsx

#### 4. **Build Errors**
**Symptom**: Build fails
**Solution**:
- Controllare import/export consistency
- Verificare asset paths
- Pulire node_modules se necessario

### Development Commands
```bash
# Reset completo
rm -rf node_modules package-lock.json
npm install

# Analisi bundle
npm run build
npx vite-bundle-analyzer dist

# Debug dev server
npm run dev -- --debug
```

---

## 📞 SUPPORTO E CONTATTI

### Team di Sviluppo
- **Lead Developer**: GitHub Copilot Agent
- **Project Owner**: Simone Pizzi (pizzisimon1972@gmail.com)

### Risorse
- **Repository**: Local development
- **Documentation**: `/docs` folder
- **Issues**: Issue tracking in development

### Best Practices
1. **Sempre testare build prima del deploy**
2. **Mantenere consistenza naming convention**
3. **Documentare modifiche significative**
4. **Utilizzare semantic versioning**
5. **Backup regolare del codice**

---

*Documentazione aggiornata: 5 Luglio 2025*  
*Versione: 1.0.0*  
*Prossima review: Dopo implementazione sezioni mancanti*

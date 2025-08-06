# Simone Pizzi - Portfolio React

> **🚀 Modern React Portfolio with Integrated Microsites**  
> **Version:** 2.2.2 "A Page to Breathe"  
> **Status:** 🟢 Production Ready with Microsito Integration  
> **Last Updated:** January 24, 2025  

---

## 🎯 Overview

Modern, responsive portfolio website built with **React 18**, **Vite**, and **Tailwind CSS**. Features integrated microsites, smooth animations, and enterprise-grade architecture.

### ✨ Key Features

- 🎮 **Integrated Microsites**: "Il Respiro Trattenuto del Mondo" narrative game
- ⚡ **Lightning Fast**: Vite build system for optimal performance
- 🎨 **Modern Design**: Tailwind CSS with custom components
- 📱 **Fully Responsive**: Mobile-first design approach
- 🔍 **SEO Optimized**: Meta tags and structured data
- ♿ **Accessible**: WCAG compliant interface
- 🌐 **Multi-section**: Podcast, Books, Software, Games, Contact

---

## 🛠️ Tech Stack

- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React
- **Routing**: React Router DOM 6.21.1
- **Animations**: CSS Transitions + Tailwind
- **Deployment**: Vercel Ready

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to React project
cd simone-pizzi-react

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server
```bash
# Local development
http://localhost:3000/

# Microsito access
http://localhost:3000/respiro-trattenuto/index.html
```

---

## 📁 Project Structure

```
simone-pizzi-react/
├── 📁 public/
│   ├── 🎮 respiro-trattenuto/       # INTEGRATED MICROSITO
│   │   ├── assets/                  # Microsito bundles
│   │   ├── favicon.ico
│   │   └── index.html               # Microsito entry
│   ├── favicon.ico
│   └── index.html                   # Main site entry
├── 📁 src/
│   ├── 📁 components/               # Reusable components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Layout.jsx
│   ├── 📁 pages/                    # Route components
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Podcast.jsx
│   │   ├── Libri.jsx
│   │   ├── Software.jsx
│   │   ├── Videogiochi.jsx          # 🎮 Links to microsito
│   │   └── Contatti.jsx
│   ├── 📁 styles/                   # Global styles
│   ├── App.jsx                      # Main app component
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Tailwind imports
├── package.json                     # Dependencies
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind configuration
└── README.md                        # This file
```

---

## 🎮 Microsito Integration: "Il Respiro Trattenuto del Mondo"

### Overview
Interactive narrative game integrated seamlessly into the main portfolio. A prequel to "The Safe Place" with branching storylines and immersive gameplay.

### Technical Details
- **Location**: `/public/respiro-trattenuto/`
- **Access**: Via Videogiochi page → "Gioca Online" button
- **Technology**: React + Vite + Tailwind CSS
- **Assets**: Optimized bundles with relative paths
- **Performance**: Fast loading, smooth gameplay

### Integration Features
- ✅ **Direct Access**: One-click play from main site
- ✅ **New Tab**: Opens in separate window for immersion
- ✅ **Responsive**: Works on all devices
- ✅ **No Conflicts**: Isolated from main site
- ✅ **SEO Friendly**: Proper meta tags and structure

### Development Workflow
```bash
# Microsito development (separate project)
cd ../respiro-trattenuto
npm run dev          # Develop microsito
npm run build        # Build for integration

# Integration (copy build to main site)
cp -r dist/* ../simone-pizzi-react/public/respiro-trattenuto/

# Test integration
cd ../simone-pizzi-react
npm run dev          # Test in main site
```

---

## 🎨 Styling & Design

### Tailwind Configuration
- **Custom Colors**: Brand-specific palette
- **Typography**: Inter font family
- **Responsive**: Mobile-first breakpoints
- **Dark Mode**: System preference support

### Component Architecture
- **Layout**: Consistent header/footer
- **Pages**: Route-based components
- **Responsive**: Grid and flexbox layouts
- **Animations**: Smooth transitions

---

## 🔧 Configuration Files

### `vite.config.js`
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

### `tailwind.config.js`
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}
```

---

## 📊 Performance

### Lighthouse Scores
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 95+

### Optimization Features
- ⚡ **Vite HMR**: Fast development reloads
- 📦 **Code Splitting**: Automatic route-based splitting
- 🗜️ **Asset Optimization**: Minified CSS/JS
- 🖼️ **Image Optimization**: WebP support
- 🚀 **Lazy Loading**: Components load on demand

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Build and deploy
npm run build
vercel --prod
```

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting
# Ensure microsito files are included
```

### Environment Variables
```bash
# .env.local (if needed)
VITE_API_URL=your_api_url
VITE_CONTACT_ENDPOINT=your_contact_endpoint
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] ✅ All pages load correctly
- [ ] ✅ Navigation works smoothly
- [ ] ✅ Microsito loads without 404 errors
- [ ] ✅ Responsive design on all devices
- [ ] ✅ Contact form submits properly
- [ ] ✅ Performance metrics meet targets

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 📝 Version History

### v2.2.2 "A Page to Breathe" (Current)
- ✅ Integrated "Il Respiro Trattenuto del Mondo" microsito
- ✅ Consolidated architecture (removed legacy HTML/CSS/JS)
- ✅ Fixed microsito loading with relative paths
- ✅ Added direct access from Videogiochi page
- ✅ Updated documentation and anti-regression

### v2.2.1
- ✅ Activated complete navigation (Podcast/Libri pages)
- ✅ Performance optimizations
- ✅ Documentation consolidation

### v2.2.0
- ✅ Initial React migration
- ✅ Tailwind CSS integration
- ✅ Modern component architecture

---

## 🤝 Contributing

### Development Guidelines
1. **Architecture**: Maintain React-only structure
2. **Microsites**: Use relative paths for integration
3. **Documentation**: Update README for major changes
4. **Testing**: Verify all functionality before commit
5. **Performance**: Maintain Lighthouse scores 95+

### Adding New Microsites
1. Develop in separate directory
2. Build with relative asset paths
3. Copy build to `public/[microsito-name]/`
4. Add navigation link in appropriate page
5. Test integration thoroughly
6. Update documentation

---

## 📞 Support

- **Documentation**: `/docs/` folder in project root
- **Changelog**: `/docs/react/CHANGELOG_v2.2.2.md`
- **Anti-Regression**: `/docs/ANTI_REGRESSIONE_V2.2.2.md`
- **Issues**: Check console for errors, verify asset paths

---

**🎉 Version 2.2.2 "A Page to Breathe" - Modern React Portfolio with Integrated Gaming Experience! 🎉**

*Built with ❤️ using React, Vite, and Tailwind CSS*
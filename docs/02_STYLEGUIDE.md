# 🎨 Style & Layout Guide - SimonePizziWebSite

**Version:** v2.1.4+ Perfect Consistency  
**Status:** Universal Standard  
**Last Updated:** June 29, 2025

## 🎯 Design Philosophy

The visual identity is based on a **modern, minimal, high-contrast aesthetic**. The bright green on dark background evokes classic computer terminals, blending "retro-tech" with clean, professional design.

**Core Principles**:
- **Accessibility First**: High contrast for readability
- **Consistency**: Limited palette ensures visual coherence
- **Performance**: Lightweight design elements
- **Responsiveness**: Mobile-first approach

### Integrazione Contenuti Infografici

Per mantenere la coerenza del design quando si integrano contenuti da infografiche esterne:

#### Principi Fondamentali
- **Nessun CSS Personalizzato**: Non aggiungere classi CSS che non esistono nel sito
- **Solo HTML Standard**: Usare elementi HTML standard del sito
- **Conversione Grafici**: Convertire grafici/charts in liste HTML strutturate
- **Mantenere Gerarchia**: Rispettare la struttura h2, h3, p, ul esistente

#### Conversione Dati Visuali
```html
<!-- ✅ CORRETTO: Converti grafici in liste -->
<h3>Distribuzione dello Sforzo per Tipologia di Compito</h3>
<ul>
    <li><strong>Concept & Design:</strong> 95% sforzo umano, 5% assistenza IA</li>
    <li><strong>Logica Complessa:</strong> 80% sforzo umano, 20% assistenza IA</li>
</ul>

<!-- ❌ SBAGLIATO: Non usare div custom o chart.js -->
<div class="chart-container-custom">
    <canvas id="customChart"></canvas>
</div>
```

#### Template di Conversione
- **Timeline → Lista ordinata** con fasi numerate
- **Grafici a torta → Lista con percentuali**  
- **Grafici a barre → Tabelle HTML semplici**
- **Diagrammi di flusso → Liste con emoji/icone**

---

## 🎨 Color System

### **Primary Palette**

| Color | HEX | CSS Variable | Usage |
|-------|-----|--------------|-------|
| **Primary Green** | `#00ff88` | `--primary-green` | Interactive elements, titles, highlights |
| **Secondary Green** | `#00cc6a` | `--secondary-green` | Hover states, gradients, active elements |
| **Background Dark** | `#0a0a0a` | `--background-dark` | Main site background |
| **Surface Dark** | `#1a1a1a` | `--surface-dark` | Cards, forms, elevated elements |
| **Dark Green** | `#0d2818` | `--dark-green` | Subtle backgrounds, shadows |
| **Text Light** | `#ffffff` | `--text-light` | Primary text, headings |
| **Text Muted** | `#b3b3b3` | `--text-muted` | Secondary text, metadata |

### **Usage Guidelines**

**Primary Green (`#00ff88`)**:
- CTA buttons and primary actions
- Navigation active states
- Important highlights and badges
- Links in text content

**Secondary Green (`#00cc6a`)**:
- Hover effects and transitions
- Gradient combinations
- Secondary interactive elements

**Dark Surfaces**:
- Use `--surface-dark` for cards and form backgrounds
- Use `--background-dark` for page backgrounds
- Maintain proper contrast ratios

---

## 📝 Typography System

### **Font Family**
- **Primary**: `'Inter', sans-serif` (Google Fonts)
- **Fallback**: System sans-serif stack
- **Loading**: Variable font with `font-display: swap`

### **Typography Scale**

| Element | HTML Tag | Weight | Desktop Size | Mobile Size | Color | Line Height |
|---------|----------|--------|--------------|-------------|-------|-------------|
| **Hero Title** | `h1` | 800 (ExtraBold) | `4rem` | `2.8rem` | `--text-light` | 1.2 |
| **Section Title** | `h2` | 700 (Bold) | `2.8rem` | `2.2rem` | `--primary-green` | 1.3 |
| **Subsection** | `h3` | 600 (SemiBold) | `1.8rem` | `1.5rem` | `--text-light` | 1.4 |
| **Body Text** | `p` | 400 (Regular) | `1.2rem` | `1rem` | `--text-light` | 1.8 |
| **Links & Buttons** | `a`, `button` | 500 (Medium) | `1rem` | `1rem` | `--text-light` | 1.5 |
| **Tagline** | `.logo-tagline` | 300 (Light) | `1rem` | `0.9rem` | `--text-muted` | 1.4 |

### **Typography Usage**

**Headings**:
```css
/* Hero titles - used once per page */
.hero-section h1 {
    font-weight: 800;
    font-size: clamp(2.8rem, 5vw, 4rem);
    color: var(--text-light);
}

/* Section titles */
h2 {
    font-weight: 700;
    font-size: clamp(2.2rem, 4vw, 2.8rem);
    color: var(--primary-green);
    margin-bottom: 1.5rem;
}
```

**Body Text**:
```css
p {
    font-size: clamp(1rem, 2vw, 1.2rem);
    line-height: 1.8;
    color: var(--text-light);
    margin-bottom: 1.5rem;
}
```

---

## 🧩 Component Library

### **1. Buttons**

#### **CTA Button (Primary)**
```css
.cta-button {
    background: linear-gradient(135deg, var(--primary-green), var(--secondary-green));
    color: var(--background-dark);
    font-weight: 700;
    padding: 1rem 2rem;
    border-radius: 50px;
    border: none;
    transition: all 0.3s ease;
}

.cta-button:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 255, 136, 0.2);
}
```

#### **Secondary Button**
```css
.button.secondary {
    background: transparent;
    color: var(--primary-green);
    border: 2px solid var(--primary-green);
    padding: 0.8rem 1.5rem;
    border-radius: 25px;
}
```

### **2. Cards**

#### **Project Card**
```css
.project-card {
    background-color: var(--surface-dark);
    border: 1px solid rgba(0, 255, 136, 0.15);
    border-radius: 20px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 255, 136, 0.1);
}
```

#### **Article Card**
```css
.article-card {
    background-color: var(--surface-dark);
    border: 1px solid rgba(0, 255, 136, 0.15);
    border-radius: 20px;
    overflow: hidden;
    transition: all 0.3s ease;
}
```

### **3. Forms**

#### **Form Container**
```css
.form-container {
    background: var(--surface-dark);
    border: 1px solid rgba(0, 255, 136, 0.3);
    border-radius: 20px;
    padding: 2rem;
}
```

#### **Input Fields**
```css
.form-group input,
.form-group textarea {
    background: var(--background-dark);
    border: 1px solid rgba(0, 255, 136, 0.3);
    color: var(--text-light);
    padding: 1rem;
    border-radius: 10px;
}

.form-group input:focus,
.form-group textarea:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
}
```

### **4. Navigation**

### **5. Skeleton Placeholders (NEW v2.1.4+)**

**Purpose**: Anti-FOUC (Flash of Unstyled Content) loading system

#### **Skeleton Base System**
```css
.skeleton-placeholder {
    background: linear-gradient(90deg, 
        rgba(255, 255, 255, 0.03) 25%, 
        rgba(255, 255, 255, 0.07) 50%, 
        rgba(255, 255, 255, 0.03) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite linear;
    border-radius: 8px;
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}
```

#### **Component Skeleton Dimensions**
```css
/* Header Skeleton - Exact component size */
.header-skeleton {
    min-height: 80px;
    max-height: 80px;
    width: 100%;
}

/* Footer Skeleton - Exact component size */
.footer-skeleton {
    min-height: 130px;
    max-height: 130px;
    width: 100%;
}

/* Responsive Mobile Adjustments */
@media (max-width: 768px) {
    .header-skeleton { 
        min-height: 70px; 
        max-height: 70px; 
    }
    .footer-skeleton { 
        min-height: 110px; 
        max-height: 110px; 
    }
}
```

#### **Skeleton HTML Implementation**
**REQUIRED on ALL pages**:
```html
<!-- Header Skeleton (Anti-FOUC) -->
<div id="header-placeholder" class="skeleton-placeholder header-skeleton"></div>

<main>
    <!-- Page content -->
</main>

<!-- Footer Skeleton (Anti-FOUC) -->
<div id="footer-placeholder" class="skeleton-placeholder footer-skeleton"></div>
```

**Loading Timeline**:
- **T+0ms**: HTML parsed → Skeleton visible immediately (Zero Layout Shift)
- **T+50ms**: ComponentManager loads → Real component replaces skeleton
- **Result**: Professional loading experience with shimmer animation

#### **Main Navigation**
```css
.nav-menu {
    display: flex;
    gap: 2rem;
    align-items: center;
}

.nav-menu a {
    color: var(--text-light);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-menu a:hover,
.nav-menu a.active {
    color: var(--primary-green);
}
```

---

## 📐 Layout System

### **Container System**

#### **Main Container**
```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
}
```

#### **Navigation Container**
```css
.main-header .container {
    max-width: 1400px;
    padding: 0 3rem;
}
```

### **Grid Systems**

#### **Project Grid**
```css
.project-grid, .item-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    width: 100%;
}

@media (max-width: 768px) {
    .project-grid, .item-grid {
        grid-template-columns: 1fr;
    }
}
```

#### **Articles Grid**
```css
.articles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
}

/* Responsive breakpoints */
@media (min-width: 1200px) {
    .articles-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 1199px) and (min-width: 769px) {
    .articles-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .articles-grid {
        grid-template-columns: 1fr;
    }
}
```

### **Section Layouts**

#### **Standard Section (Image Left)**
```css
.section .container {
    display: flex;
    gap: 5rem;
    align-items: center;
}

@media (max-width: 768px) {
    .section .container {
        flex-direction: column;
        gap: 3rem;
    }
}
```

#### **Reverse Section (Image Right)**
```css
.section .container.reverse {
    flex-direction: row-reverse;
}

@media (max-width: 768px) {
    .section .container.reverse {
        flex-direction: column;
    }
}
```

#### **Alternate Background**
```css
.section.alt-bg {
    background-color: var(--surface-dark);
}
```

---

## 📱 Responsive Design

### **Breakpoint System**

- **Mobile**: `< 768px` (single column, stacked elements)
- **Desktop**: `≥ 768px` (two column, side-by-side elements)

### **Mobile-First Approach**

```css
/* Base styles for mobile */
.element {
    /* Mobile styles */
}

/* Enhanced for desktop */
@media (min-width: 768px) {
    .element {
        /* Desktop enhancements */
    }
}
```

### **Responsive Typography**

```css
/* Using clamp() for fluid typography */
h1 {
    font-size: clamp(2.8rem, 5vw, 4rem);
}

h2 {
    font-size: clamp(2.2rem, 4vw, 2.8rem);
}

p {
    font-size: clamp(1rem, 2vw, 1.2rem);
}
```

---

## 🎭 Animation & Interaction

### **Hover Effects**

#### **Card Hover**
```css
.project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 255, 136, 0.1);
}
```

#### **Button Hover**
```css
.cta-button:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 255, 136, 0.2);
}
```

#### **Image Hover**
```css
.project-card:hover .card-image {
    transform: scale(1.05);
}
```

### **Transition Standards**

```css
/* Standard transition for interactive elements */
.interactive-element {
    transition: all 0.3s ease;
}

/* Hover state transitions */
.hover-element {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}
```

---

## 🖼️ Image Guidelines

### **Image Optimization**
- **Format**: JPEG for photos, PNG for graphics with transparency
- **Compression**: Balance quality vs. file size
- **Loading**: Use `loading="lazy"` for non-critical images
- **Alt Text**: Descriptive alternative text for accessibility

### **Image Styling**
```css
/* Standard image styling */
img {
    border-radius: 20px;
    max-width: 100%;
    height: auto;
}

/* Project card images */
.card-image {
    height: 200px;
    background-size: cover;
    background-position: center 25%;
    background-repeat: no-repeat;
}
```

---

## ✅ Quality Standards

### **Accessibility Requirements**
- **Color Contrast**: Minimum 4.5:1 ratio for normal text
- **Focus States**: Visible focus indicators on all interactive elements
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Alt Text**: Descriptive alternative text for all images
- **Keyboard Navigation**: All functionality accessible via keyboard

### **Performance Standards**
- **Loading Speed**: <2 seconds on 3G connections
- **Bundle Size**: CSS <50kB, optimized for production
- **Image Optimization**: Appropriate compression and lazy loading
- **Font Loading**: Efficient web font delivery with fallbacks

### **Code Quality**
- **CSS Validation**: W3C CSS Validator compliant
- **Cross-Browser**: Tested on Chrome, Firefox, Safari, Edge
- **Responsive**: Functional on all device sizes
- **Maintenance**: Modular, well-documented code

---

## 🔄 Recent Updates

### **June 2025 Improvements**

**Project Card Image Solution**:
- Replaced problematic `object-position` with reliable `background-image` technique
- Implemented configurable positioning per card
- Enhanced cross-browser compatibility

**CSS Optimization**:
- Consolidated modular CSS architecture
- Improved performance with selective loading
- Enhanced maintainability with clear separation of concerns

**Responsive Enhancements**:
- Refined grid systems for better mobile experience
- Optimized typography scaling across all devices
- Improved touch targets for mobile interaction

---

**Style Guide Status**: ✅ **PRODUCTION STANDARD**  
**Compliance Level**: ✅ **100% TEMPLATE CONFORMITY**  
**Accessibility Score**: ✅ **WCAG 2.1 AA COMPLIANT** 
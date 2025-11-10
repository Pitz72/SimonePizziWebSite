# 🎨 DESIGN SYSTEM v2.2.0
*Simone Pizzi Website - React + Tailwind CSS*

## 📋 Panoramica

Il Design System v2.2.0 introduce un approccio moderno e professionale per la creazione di interfacce coerenti e accessibili. Basato su Tailwind CSS con componenti React riutilizzabili.

## 🎯 Principi Fondamentali

### 1. **Consistenza**
- Palette colori unificata
- Sistema di spacing coerente
- Tipografia scalabile
- Componenti riutilizzabili

### 2. **Accessibilità**
- Contrasti WCAG AA compliant
- Focus states visibili
- Screen reader friendly
- Keyboard navigation

### 3. **Performance**
- CSS purged automaticamente
- Animazioni ottimizzate
- Lazy loading integrato
- Bundle size minimo

## 🎨 PALETTE COLORI

### Primary Colors
```css
--primary-50: #e6fff2    /* Lightest */
--primary-100: #ccffe6
--primary-200: #99ffcc
--primary-300: #66ffb3
--primary-400: #33ff99
--primary-500: #00ff88    /* Main brand color */
--primary-600: #00cc6a    /* Hover state */
--primary-700: #00b366    /* Dark variant */
--primary-800: #009952
--primary-900: #00803d    /* Darkest */
```

### Background Colors
```css
--bg-primary: #0a0a0a      /* Main background */
--bg-secondary: #1a1a1a    /* Cards, surfaces */
--bg-tertiary: #141414     /* Subtle backgrounds */
--bg-accent: #002a15       /* Accent backgrounds */
--bg-surface: #1a1a1a      /* Component surfaces */
```

### Text Colors
```css
--text-primary: #ffffff     /* Main text */
--text-secondary: #e0e0e0   /* Secondary text */
--text-muted: #a0a0a0       /* Muted text */
--text-disabled: #666666     /* Disabled text */
--text-accent: #00ff88       /* Accent text */
```

### Border Colors
```css
--border-primary: #2a2a2a   /* Main borders */
--border-secondary: #404040 /* Secondary borders */
--border-accent: #00ff88    /* Accent borders */
--border-hover: #00cc6a     /* Hover borders */
```

## 📏 SISTEMA DI SPACING

### Spacing Scale
```css
--space-xs: 0.5rem;    /* 8px */
--space-sm: 1rem;      /* 16px */
--space-md: 1.5rem;    /* 24px */
--space-lg: 2rem;      /* 32px */
--space-xl: 3rem;      /* 48px */
--space-2xl: 4rem;     /* 64px */
--space-3xl: 6rem;     /* 96px */
```

### Usage
```jsx
// Tailwind classes
<div className="p-sm">     // padding: 1rem
<div className="m-lg">     // margin: 2rem
<div className="gap-md">   // gap: 1.5rem

// CSS variables
.element {
  padding: var(--space-lg);
  margin: var(--space-md);
}
```

## 🔤 TIPOGRAFIA

### Font Family
```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### Font Sizes
```css
--font-size-xs: 0.75rem;   /* 12px */
--font-size-sm: 0.875rem;  /* 14px */
--font-size-base: 1rem;    /* 16px */
--font-size-lg: 1.125rem;  /* 18px */
--font-size-xl: 1.25rem;   /* 20px */
--font-size-2xl: 1.5rem;   /* 24px */
--font-size-3xl: 1.875rem; /* 30px */
--font-size-4xl: 2.25rem;  /* 36px */
--font-size-5xl: 3rem;     /* 48px */
--font-size-6xl: 3.75rem;  /* 60px */
```

### Typography Scale
```jsx
// Headings
<h1 className="text-4xl lg:text-6xl font-extrabold">Heading 1</h1>
<h2 className="text-3xl lg:text-5xl font-bold text-primary-500">Heading 2</h2>
<h3 className="text-2xl lg:text-4xl font-semibold">Heading 3</h3>

// Body text
<p className="text-base leading-relaxed text-text-secondary">Body text</p>
<p className="text-sm text-text-muted">Small text</p>
```

## 🧩 COMPONENTI

### Button Component
```jsx
import { Button } from '@/components/ui';

// Variants
<Button variant="primary">Primary Button</Button>
<Button variant="secondary">Secondary Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="outline">Outline Button</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// With icons
<Button icon={ArrowRight} iconPosition="right">
  Continue
</Button>

// Loading state
<Button loading>Loading...</Button>
```

### Card Component
```jsx
import { Card } from '@/components/ui';

// Basic card
<Card>
  <Card.Title>Card Title</Card.Title>
  <Card.Content>Card content goes here</Card.Content>
</Card>

// With image
<Card 
  image="/path/to/image.jpg"
  imageAlt="Description"
  badge={<Card.Badge variant="primary">New</Card.Badge>}
>
  <Card.Title>Card with Image</Card.Title>
  <Card.Content>Content</Card.Content>
</Card>

// Interactive card
<Card to="/path" variant="interactive">
  <Card.Title>Clickable Card</Card.Title>
</Card>

// Featured card
<Card variant="featured" featured>
  <Card.Title>Featured Content</Card.Title>
</Card>
```

### Badge Component
```jsx
<Card.Badge variant="primary">Primary</Card.Badge>
<Card.Badge variant="secondary">Secondary</Card.Badge>
<Card.Badge variant="success">Success</Card.Badge>
<Card.Badge variant="warning">Warning</Card.Badge>
<Card.Badge variant="danger">Danger</Card.Badge>
```

## 🎭 ANIMAZIONI

### Built-in Animations
```css
/* Fade animations */
.animate-fade-in-up
.animate-fade-in-left
.animate-fade-in-right

/* Special effects */
.animate-shimmer
.animate-pulse-glow
.animate-float

/* Scroll-triggered */
.scroll-trigger
```

### Custom Animations
```jsx
// Using hooks
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const [ref, isVisible] = useScrollAnimation({
  threshold: 0.1,
  triggerOnce: true,
  delay: 200
});

return (
  <div 
    ref={ref}
    className={`transition-all duration-600 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
  >
    Content
  </div>
);
```

## 🎨 UTILITY CLASSES

### Glass Effect
```css
.glass {
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-light {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Text Gradients
```css
.text-gradient {
  background: linear-gradient(135deg, #00ff88, #00cc6a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Glow Effects
```css
.shadow-glow: 0 0 20px rgba(0, 255, 136, 0.3)
.shadow-glow-lg: 0 0 40px rgba(0, 255, 136, 0.2)
.shadow-glow-xl: 0 0 60px rgba(0, 255, 136, 0.15)
```

## 📱 RESPONSIVE DESIGN

### Breakpoints
```css
/* Mobile first approach */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */

/* Custom breakpoints */
mobile: 768px
tablet: 1024px
desktop: 1280px
wide: 1536px
```

### Responsive Utilities
```jsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Responsive text
<h1 className="text-3xl md:text-4xl lg:text-6xl">

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
```

## 🎯 BEST PRACTICES

### 1. **Component Composition**
```jsx
// ✅ Good: Use sub-components
<Card>
  <Card.Header>
    <Card.Title>Title</Card.Title>
    <Card.Subtitle>Subtitle</Card.Subtitle>
  </Card.Header>
  <Card.Content>Content</Card.Content>
  <Card.Footer>Footer</Card.Footer>
</Card>

// ❌ Avoid: Custom styling
<div className="bg-bg-surface border border-border-primary rounded-xl p-6">
  <h3 className="text-xl font-semibold text-text-primary mb-2">Title</h3>
  <p className="text-text-secondary">Content</p>
</div>
```

### 2. **Color Usage**
```jsx
// ✅ Good: Use semantic colors
<Button className="text-primary-500 bg-bg-surface">

// ❌ Avoid: Hard-coded colors
<Button className="text-[#00ff88] bg-[#1a1a1a]">
```

### 3. **Spacing Consistency**
```jsx
// ✅ Good: Use spacing scale
<div className="space-y-6 p-6">

// ❌ Avoid: Arbitrary values
<div className="space-y-4 p-4">
```

### 4. **Animation Performance**
```jsx
// ✅ Good: Use transform and opacity
<div className="transition-transform duration-300 hover:scale-105">

// ❌ Avoid: Animating layout properties
<div className="transition-all duration-300 hover:width-full">
```

## 🔧 CONFIGURAZIONE

### Tailwind Config
```javascript
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { /* ... */ },
        bg: { /* ... */ },
        text: { /* ... */ },
        border: { /* ... */ },
      },
      animation: { /* ... */ },
      keyframes: { /* ... */ },
    },
  },
  plugins: [/* custom plugins */],
}
```

### CSS Variables
```css
/* src/index.css */
@layer base {
  :root {
    /* Color palette */
    /* Spacing system */
    /* Typography */
    /* Animations */
  }
}
```

## 📚 RISORSE

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Inter Font](https://rsms.me/inter/)
- [Lucide Icons](https://lucide.dev/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Versione:** 2.2.0  
**Ultimo aggiornamento:** 19 Luglio 2025  
**Mantenuto da:** Simone Pizzi 
# 🔧 Code Templates - SimonePizziWebSite

**Version:** v2.1.4+ Perfect Consistency  
**Status:** Universal Standards  
**Last Updated:** June 29, 2025

## ⚠️ Strict Template Compliance

**ABSOLUTE RULE**: All templates defined in this document must be followed exactly. No creative deviations are allowed without explicit user approval. Project consistency has absolute priority.

---

## 🚨 Known Issues & Solutions

### ✅ Project Card Image Positioning - RESOLVED (June 2025)

**Previous Issue**: `object-position` CSS property was being ignored completely on `.project-card .card-image img`

**SOLUTION IMPLEMENTED**: Replaced `<img>` approach with robust `background-image` technique:

```css
/* NEW APPROACH - Production Ready */
.project-card .card-image {
    height: 200px;
    background-size: cover;
    background-repeat: no-repeat;
    /* Configurable positioning per card */
    background-position: center 25%; /* Example positioning */
}
```

**Usage in HTML**:
```html
<div class="project-card">
    <div class="card-image" style="background-image: url('image.jpg'); background-position: center 35%;"></div>
    <!-- No more <img> tags needed -->
</div>
```

---

## 📋 Template Index

1. [🏗️ Centralized System Template](#centralized-system-template)
2. [🎨 Modular CSS Template](#modular-css-template)
3. [📱 Standard Page Template](#standard-page-template)
4. [⚡ Skeleton System Template (NEW v2.1.4+)](#skeleton-system-template)
5. [🃏 Project Card Template](#project-card-template)
6. [📝 Contact Form Template](#contact-form-template)
7. [💻 Software Page Template](#software-page-template)
8. [🎮 Videogiochi Page Template](#videogiochi-page-template)

---

## 🏗️ Centralized System Template

> **Enterprise Architecture**: v2.1.3+ with centralized components  
> **Status**: MANDATORY for all pages

### Base Page Structure with Centralized System

```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[PAGE_TITLE] | Simone Pizzi</title>
    <meta name="description" content="[PAGE_DESCRIPTION]">
    <meta name="keywords" content="Simone Pizzi, [SPECIFIC_KEYWORDS]">
    <meta name="author" content="Simone Pizzi">
    <meta name="robots" content="index, follow">

    <!-- Open Graph & Twitter -->
    <meta property="og:title" content="[PAGE_TITLE] | Simone Pizzi">
    <meta property="og:description" content="[PAGE_DESCRIPTION]">
    <meta property="og:image" content="https://simonepizzi.runtimeradio.it/image/[OG_IMAGE]">
    <meta property="og:url" content="https://simonepizzi.runtimeradio.it/[PAGE_PATH]">
    <meta property="twitter:card" content="summary_large_image">

    <!-- Performance optimizations -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    
    <!-- Typography -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    
    <!-- Modular CSS (Dynamic path based on depth) -->
    <link rel="stylesheet" href="[DYNAMIC_PATH]/css/style.css">
</head>
<body>
    <!-- ========= HEADER SKELETON (Anti-FOUC) ========= -->
    <!-- ⚠️ MANDATORY: Required on ALL pages v2.1.4+ -->
    <div id="header-placeholder" class="skeleton-placeholder header-skeleton"></div>

    <main>
        <!-- PAGE CONTENT -->
        [MAIN_CONTENT]
    </main>

    <!-- ========= FOOTER SKELETON (Anti-FOUC) ========= -->
    <!-- ⚠️ MANDATORY: Required on ALL pages v2.1.4+ -->
    <div id="footer-placeholder" class="skeleton-placeholder footer-skeleton"></div>
    <script type="module" src="[DYNAMIC_PATH]/js/main.js"></script>
</body>
</html>
```

### Dynamic Path Resolution

**Root Level** (`index.html`):
```html
<link rel="stylesheet" href="css/style.css">
<script type="module" src="js/main.js"></script>
```

**Pages Level** (`pages/contatti.html`):
```html
<link rel="stylesheet" href="../css/style.css">
<script type="module" src="../js/main.js"></script>
```

**Subdirectory Level** (`pages/software/index.html`):
```html
<link rel="stylesheet" href="../../css/style.css">
<script type="module" src="../../js/main.js"></script>
```

**Articles Level** (`pages/chi-sono/articoli/*.html`):
```html
<link rel="stylesheet" href="../../../css/style.css">
<script type="module" src="../../../js/main.js"></script>
```

---

## 🎨 Modular CSS Template

### Required CSS Structure

**File: `css/style.css` (Orchestrator)**
```css
/* Modular CSS System - DO NOT MODIFY ORDER */
@import url('./base.css');      /* Variables, Reset, Layout */
@import url('./components.css'); /* Header, Footer, Cards, Buttons */
@import url('./pages/home.css');       /* Homepage specific */
@import url('./pages/videogiochi.css'); /* Games template */
@import url('./pages/contatti.css');   /* Contact form */

/* Additional page-specific imports as needed */
```

### Page-Specific CSS Files

**Location**: `css/pages/[SECTION].css`

**Examples**:
- `css/pages/home.css` - Aurora effects and homepage layout
- `css/pages/videogiochi.css` - Consolidated game template styles
- `css/pages/contatti.css` - Contact form and FAQ styles
- `css/pages/software.css` - Software portfolio styles

**Template Structure**:
```css
/* css/pages/[SECTION].css */

/* Section-specific variables (if needed) */
.section-name {
    --section-primary: var(--primary-green);
    --section-spacing: 2rem;
}

/* Section-specific components */
.section-name .special-component {
    /* Styles specific to this section */
}

/* Section-specific responsive overrides */
@media (max-width: 768px) {
    .section-name .component {
        /* Mobile adjustments */
    }
}
```

---

## 📱 Standard Page Template

### Main Content Structure

```html
<main>
    <!-- Hero Section (Optional) -->
    <section class="page-hero">
        <div class="container">
            <h1>[PAGE_TITLE]</h1>
            <p class="hero-subtitle">[PAGE_SUBTITLE]</p>
        </div>
```

---

## ⚡ Skeleton System Template (NEW v2.1.4+)

> **Anti-FOUC System**: MANDATORY skeleton placeholders for all pages  
> **Status**: Required on ALL 21 pages

### ⚠️ ABSOLUTE REQUIREMENTS

**ALL pages MUST include**:
1. Header skeleton placeholder with exact ID and classes
2. Footer skeleton placeholder with exact ID and classes  
3. ComponentManager script to replace skeletons
4. NO legacy comments ("Header sarà caricato automaticamente")

### Skeleton HTML Template (MANDATORY)

```html
<!DOCTYPE html>
<html lang="it">
<head>
    <!-- Meta tags and stylesheets -->
    <link rel="stylesheet" href="[DYNAMIC_PATH]/css/style.css">
</head>
<body>
    <!-- ========= HEADER SKELETON (Anti-FOUC) ========= -->
    <!-- ⚠️ MANDATORY: Exact ID and classes required -->
    <div id="header-placeholder" class="skeleton-placeholder header-skeleton"></div>

    <main>
        <!-- PAGE CONTENT -->
        [MAIN_CONTENT]
    </main>

    <!-- ========= FOOTER SKELETON (Anti-FOUC) ========= -->
    <!-- ⚠️ MANDATORY: Exact ID and classes required -->
    <div id="footer-placeholder" class="skeleton-placeholder footer-skeleton"></div>
    
    <!-- ⚠️ MANDATORY: ComponentManager script -->
    <script type="module" src="[DYNAMIC_PATH]/js/main.js"></script>
</body>
</html>
```

### Skeleton CSS Requirements (components.css)

```css
/* MANDATORY: Skeleton base system */
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

/* MANDATORY: Exact component dimensions */
.header-skeleton {
    min-height: 80px;
    max-height: 80px;
    width: 100%;
}

.footer-skeleton {
    min-height: 130px;
    max-height: 130px;
    width: 100%;
}

/* Responsive adjustments */
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

### Loading Process (Automatic)

1. **T+0ms**: HTML parsed → Skeleton placeholders visible immediately
2. **T+50ms**: ComponentManager.loadHeader() → Replace header skeleton  
3. **T+60ms**: ComponentManager.loadFooter() → Replace footer skeleton
4. **Result**: Zero Layout Shift (CLS = 0) + Professional loading experience

### ⚠️ FORBIDDEN Patterns (v2.1.4+)

**NEVER use these legacy patterns**:
```html
<!-- ❌ FORBIDDEN: Legacy comments -->
<!-- Header sarà caricato automaticamente dal JavaScript -->
<!-- Footer sarà caricato automaticamente dal JavaScript -->

<!-- ❌ FORBIDDEN: No placeholder divs -->
<body>
    <main>Content</main>
    <script src="main.js"></script>
</body>

<!-- ❌ FORBIDDEN: Hardcoded header/footer -->
<header>...</header>
<main>Content</main>
<footer>...</footer>
```

**✅ REQUIRED Pattern**:
```html
<!-- ✅ CORRECT: v2.1.4+ skeleton system -->
<div id="header-placeholder" class="skeleton-placeholder header-skeleton"></div>
<main>Content</main>
<div id="footer-placeholder" class="skeleton-placeholder footer-skeleton"></div>
<script type="module" src="js/main.js"></script>
    </section>

    <!-- Content Sections -->
    <section class="section">
        <div class="container">
            <h2>[SECTION_TITLE]</h2>
            <!-- Section content -->
        </div>
    </section>

    <!-- Alternate Background Section -->
    <section class="section alt-bg">
        <div class="container reverse">
            <!-- Content with alternate background -->
        </div>
    </section>
</main>
```

### Section Layout Variations

**Standard Layout (Image Left)**:
```html
<section class="section">
    <div class="container">
        <div class="image-placeholder">
            <img src="[IMAGE_PATH]" alt="[ALT_TEXT]" loading="lazy">
        </div>
        <article class="content">
            <h2>[TITLE]</h2>
            <p>[DESCRIPTION]</p>
            <a href="[LINK]" class="cta-button">
                <span class="cta-button-text">[BUTTON_TEXT]</span>
            </a>
        </article>
    </div>
</section>
```

**Reverse Layout (Image Right)**:
```html
<section class="section alt-bg">
    <div class="container reverse">
        <div class="image-placeholder">
            <img src="[IMAGE_PATH]" alt="[ALT_TEXT]" loading="lazy">
        </div>
        <article class="content">
            <h2>[TITLE]</h2>
            <p>[DESCRIPTION]</p>
            <a href="[LINK]" class="cta-button">
                <span class="cta-button-text">[BUTTON_TEXT]</span>
            </a>
        </article>
    </div>
</section>
```

---

## 🃏 Project Card Template

### NEW: Background-Image Approach (Production Ready)

```html
<div class="project-card">
    <div class="card-image" 
         style="background-image: url('[IMAGE_PATH]'); 
                background-position: [CUSTOM_POSITION];">
    </div>
    <div class="card-content">
        <h3 class="card-title">[PROJECT_TITLE]</h3>
        <p class="card-description">[PROJECT_DESCRIPTION]</p>
        <div class="card-footer">
            <a href="[PROJECT_LINK]" class="card-link">
                <span class="cta-button-text">Scopri di più</span>
            </a>
        </div>
    </div>
</div>
```

### Background Position Options

```css
/* Common positioning values */
background-position: center center;     /* Standard center */
background-position: center 25%;        /* Upper center */
background-position: center 75%;        /* Lower center */
background-position: center 15%;        /* Top focus */
background-position: center 85%;        /* Bottom focus */
background-position: left center;       /* Left focus */
background-position: right center;      /* Right focus */
```

### Project Grid Container

```html
<div class="project-grid">
    <!-- Multiple project cards -->
    <div class="project-card">...</div>
    <div class="project-card">...</div>
    <div class="project-card">...</div>
    <div class="project-card">...</div>
</div>
```

---

## 📝 Contact Form Template

### Complete Form Structure

```html
<section class="form-section">
    <div class="container">
        <div class="form-container">
            <form id="contact-form" class="contact-form">
                <!-- Anti-spam honeypot -->
                <input type="text" name="website" style="display: none;" tabindex="-1" autocomplete="off">
                
                <div class="form-group">
                    <label for="name">Nome</label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="subject">Oggetto</label>
                    <input type="text" id="subject" name="subject" required>
                </div>
                
                <div class="form-group">
                    <label for="message">Messaggio</label>
                    <textarea id="message" name="message" rows="5" required></textarea>
                </div>
                
                <button type="submit" class="cta-button">
                    <span class="cta-button-text">Invia Messaggio</span>
                </button>
            </form>
            
            <div id="form-status" class="form-status" style="display: none;"></div>
        </div>
    </div>
</section>
```

---

## 💻 Software Page Template

### Software Detail Page Structure

```html
<main>
    <!-- Hero Section -->
    <section class="page-hero">
        <div class="container">
            <h1>[SOFTWARE_NAME]</h1>
            <p class="hero-subtitle">[SOFTWARE_TAGLINE]</p>
        </div>
    </section>

    <!-- Main Info Section -->
    <section class="section">
        <div class="container">
            <div class="software-image">
                <img src="[SCREENSHOT_PATH]" alt="[SOFTWARE_NAME] Screenshot" loading="lazy">
            </div>
            <article class="content">
                <div class="software-meta">
                    <p><strong>Compatibilità:</strong> Windows, macOS, Linux</p>
                    <p><strong>Versione:</strong> [VERSION]</p>
                    <p><strong>Licenza:</strong> [LICENSE]</p>
                </div>
                
                <p>[SOFTWARE_DESCRIPTION]</p>
                
                <!-- Download Section -->
                <div class="download-section">
                    <a href="[DOWNLOAD_LINK]" class="cta-button">
                        <span class="cta-button-text">
                            <i class="fas fa-download"></i> Scarica Gratis
                        </span>
                    </a>
                </div>
                
                <!-- Support Section -->
                <div class="support-section">
                    <h3>💝 Supporta il Progetto</h3>
                    <p>Se questo software ti è utile, considera una donazione per supportare lo sviluppo:</p>
                    <!-- PayPal Button -->
                    [PAYPAL_BUTTON_CODE]
                </div>
            </article>
        </div>
    </section>

    <!-- Story Section -->
    <section class="section alt-bg">
        <div class="container">
            <article class="content">
                <h2>La Storia del Progetto</h2>
                <p>[PROJECT_STORY]</p>
            </article>
        </div>
    </section>
</main>
```

---

## 🎮 Videogiochi Page Template

### CONSOLIDATED Template v2.1.3 (RIGIDLY PROTECTED)

**⚠️ CRITICAL**: This template is RIGIDLY CONSOLIDATED and protected from modifications.

```html
<main>
    <!-- Breadcrumb Navigation -->
    <nav class="breadcrumb">
        <div class="container">
            <a href="[PATH_TO_ROOT]">Home</a>
            <span class="separator">></span>
            <a href="[PATH_TO_SECTION]">Videogiochi</a>
            <span class="separator">></span>
            <span class="current">[GAME_TITLE]</span>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="page-hero">
        <div class="container">
            <h1>[GAME_TITLE]</h1>
            <p class="hero-subtitle">[GAME_SUBTITLE]</p>
        </div>
    </section>

    <!-- Game Details -->
    <section class="section">
        <div class="container detail-layout">
            <div class="game-image">
                <img src="[GAME_IMAGE]" alt="[GAME_TITLE]" loading="lazy">
            </div>
            <article class="content">
                <div class="game-meta">
                    <p><strong>Genere:</strong> [GENRE]</p>
                    <p><strong>Piattaforma:</strong> [PLATFORMS]</p>
                    <p><strong>Stato:</strong> [STATUS]</p>
                    <p><strong>Engine:</strong> [ENGINE]</p>
                </div>
                
                <p>[GAME_DESCRIPTION]</p>
                
                <!-- Download Section -->
                <div class="download-section">
                    <h3>📱 Download</h3>
                    <div class="download-buttons">
                        <a href="[WINDOWS_DOWNLOAD]" class="cta-button">
                            <span class="cta-button-text">
                                <i class="fab fa-windows"></i> Windows
                            </span>
                        </a>
                        <a href="[ANDROID_DOWNLOAD]" class="cta-button">
                            <span class="cta-button-text">
                                <i class="fab fa-android"></i> Android
                            </span>
                        </a>
                    </div>
                </div>
                
                <!-- Support PayPal -->
                <div class="support-paypal">
                    <h3>💝 Supporta lo Sviluppo</h3>
                    <p>Se il gioco ti piace, considera una donazione:</p>
                    [PAYPAL_BUTTON_CODE]
                </div>
            </article>
        </div>
    </section>

    <!-- Back Navigation -->
    <section class="section">
        <div class="container">
            <div class="back-navigation">
                <a href="[PATH_TO_SECTION]" class="cta-button">
                    <span class="cta-button-text">
                        <i class="fas fa-arrow-left"></i> Torna ai Videogiochi
                    </span>
                </a>
            </div>
        </div>
    </section>
</main>
```

### Required CSS Classes for Videogiochi Template

```css
/* These classes MUST exist and remain unchanged */
.detail-layout { /* Two-column layout */ }
.game-meta { /* Game metadata styling */ }
.download-section { /* Download buttons container */ }
.support-paypal { /* PayPal support section */ }
.back-navigation { /* Back button styling */ }
```

---

## ✅ Template Compliance Rules

### Mandatory Elements

1. **All Pages Must Have**:
   - Centralized header/footer (loaded via JavaScript)
   - Modular CSS import structure
   - Proper meta tags (SEO, Open Graph, Twitter)
   - ES6 module script loading

2. **Project Cards Must Use**:
   - Background-image technique (not img tags)
   - Configurable background-position
   - Proper aria-labels for accessibility

3. **Forms Must Include**:
   - Anti-spam honeypot
   - Proper validation attributes
   - Status message containers

4. **Videogiochi Pages Must Have**:
   - Exact template structure (rigidly protected)
   - All required CSS classes
   - Breadcrumb navigation
   - PayPal integration section

### Prohibited Modifications

- ❌ Static header/footer in HTML
- ❌ Direct CSS imports without orchestrator
- ❌ Object-position on images
- ❌ Videogiochi template structure changes
- ❌ ComponentManager JavaScript modifications

---

**Template Status**: ✅ **PRODUCTION READY**  
**Compliance Level**: ✅ **STRICT ENFORCEMENT**  
**Protection Level**: ✅ **ANTI-REGRESSION SECURED** 

## Template Articoli con Contenuti Infografici

### Struttura Base Estesa
```html
<!-- Dopo l'introduzione standard -->
<h2>Analisi Dettagliata</h2>
<p>Paragrafo introduttivo dei dati...</p>

<h3>Distribuzione dei Dati</h3>
<ul>
    <li><strong>Categoria 1:</strong> X% descrizione</li>
    <li><strong>Categoria 2:</strong> Y% descrizione</li>
    <li><strong>Categoria 3:</strong> Z% descrizione</li>
</ul>

<p>Interpretazione dei risultati...</p>

<h3>Cronologia/Timeline</h3>
<ul>
    <li><strong>Fase 1:</strong> Descrizione evento</li>
    <li><strong>Fase 2:</strong> Descrizione evento</li>
    <li><strong>Fase 3:</strong> Descrizione evento</li>
</ul>
```

### Esempi di Conversione

#### Timeline → Lista Strutturata
```html
<!-- Da timeline infografica a lista HTML -->
<ul>
    <li><strong>Fase 1 - Nome Fase:</strong> Descrizione dettagliata</li>
    <li><strong>Fase 2 - Nome Fase:</strong> Descrizione dettagliata</li>
</ul>
```

#### Workflow/Diagramma → Lista con Emoji
```html
<ul>
    <li><strong>🧑‍💻 UMANO:</strong> Ruolo e responsabilità</li>
    <li><strong>🤖 IA:</strong> Ruolo e responsabilità</li>
    <li><strong>🧐 UMANO:</strong> Ruolo e responsabilità</li>
</ul>
```

#### Grafici Percentuali → Lista Dettagliata
```html
<h3>Titolo Sezione Dati</h3>
<ul>
    <li><strong>X% - Categoria:</strong> Spiegazione significato</li>
    <li><strong>Y% - Categoria:</strong> Spiegazione significato</li>
</ul>
```

### Regole di Conversione
1. **Ogni grafico** → Lista HTML strutturata
2. **Ogni timeline** → Lista cronologica
3. **Ogni workflow** → Lista con icone/emoji
4. **Mantieni percentuali** e dati numerici esatti
5. **Aggiungi interpretazione** testuale dei dati 
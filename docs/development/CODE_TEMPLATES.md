# Template di Codice - SimonePizziWebSite

> **Versione**: v2.1.1 Final Consolidated Edition Enhanced  
> **Ultimo Aggiornamento**: 24 Gennaio 2025 - Sistema Centralizzato  
> **Status**: ENTERPRISE PRODUCTION READY + CENTRALIZED ARCHITECTURE

## Regola Assoluta Template
**RISPETTO RIGOROSO**: Tutti i template definiti in questo documento devono essere seguiti alla lettera. Non sono ammesse deviazioni creative senza approvazione esplicita dell'utente. La coerenza del progetto ha priorità assoluta.

## 🚨 **PROBLEMI NOTI NEI TEMPLATE**

### ❌ OBJECT-POSITION ANOMALY - Project Card (28/06/2025)

**⚠️ PROBLEMA IRRISOLTO**: Il template Project Card ha un **grave malfunzionamento**

- **Component**: `.project-card .card-image img`
- **Property**: `object-position` **COMPLETAMENTE IGNORATA**
- **Symptoms**: Qualsiasi valore (0% 0%, center 100%, 75% 25%) → **NESSUN EFFETTO VISIBILE**
- **Tested**: Selettori funzionano (test bordi/rotazioni confermati)
- **Status**: **IRRISOLTO** - Richiede investigazione esterna
- **Workaround**: **NESSUNO DISPONIBILE**

**🔧 Implicazioni per Template:**
- NON usare `object-position` nei template Project Card
- Posizione immagini nelle card NON può essere regolata via CSS
- Template mantiene validità strutturale ma con limitazione estetica

**📝 Documentato in:**
- `TECHNICAL_FINAL_STATUS.md` 
- `ANTI_REGRESSION_CHECKLIST.md`

## ⚡ NOVITÀ v2.1.1: Sistema Centralizzato
**ARCHITETTURA ENTERPRISE**: Il sistema ora utilizza componenti centralizzati e CSS modulare. Vedere [Template Sistema Centralizzato](#template-sistema-centralizzato) per i nuovi standard obbligatori.

---

## 📋 Indice Template

1. [Template Sistema Centralizzato](#template-sistema-centralizzato) ⚡ **NUOVO v2.1.1**
2. [Template CSS Modulare](#template-css-modulare) ⚡ **NUOVO v2.1.1**
3. [Template Project Card](#template-project-card)
4. [Template Pagina Standard](#template-pagina-standard)
5. [Template Form Contatti](#template-form-contatti)
6. [Template Pagina Software](#template-pagina-software)
7. [Template Pagina Videogiochi](#template-pagina-videogiochi) ⭐ **CONSOLIDATO**

---

## ⚡ Template Sistema Centralizzato v2.1.1

> **Template Rivoluzionario**: v2.1.1 Enhanced - 24 Gennaio 2025  
> **Architettura**: Enterprise-level con componenti centralizzati  
> **Status**: OBBLIGATORIO per tutte le nuove pagine

### Struttura Base Pagina con Sistema Centralizzato

```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[TITOLO_PAGINA] | Simone Pizzi</title>
    <meta name="description" content="[DESCRIZIONE_PAGINA]">
    <meta name="keywords" content="Simone Pizzi, [KEYWORDS_SPECIFICHE]">
    <meta name="author" content="Simone Pizzi">
    <meta name="robots" content="index, follow">

    <!-- Open Graph & Twitter -->
    <meta property="og:title" content="[TITOLO_PAGINA] | Simone Pizzi">
    <meta property="og:description" content="[DESCRIZIONE_PAGINA]">
    <meta property="og:image" content="https://simonepizzi.runtimeradio.it/image/[IMMAGINE_OG]">
    <meta property="og:url" content="https://simonepizzi.runtimeradio.it/[PATH_PAGINA]">
    <meta property="twitter:card" content="summary_large_image">

    <!-- Preconnect for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- CSS MODULARE (Path dinamico in base a profondità) -->
    <link rel="stylesheet" href="[PATH_DINAMICO]/css/style.css">
</head>
<body>
    <!-- ⚠️ CRITICO: NO HEADER/FOOTER STATICI -->
    <!-- Header sarà caricato automaticamente dal JavaScript -->

    <main>
        <!-- CONTENUTO PAGINA -->
        [CONTENUTO_MAIN]
    </main>

    <!-- ⚠️ CRITICO: MAIN.JS OBBLIGATORIO -->
    <!-- Header e Footer saranno caricati automaticamente dal JavaScript -->
    <script src="[PATH_DINAMICO]/js/main.js"></script>
</body>
</html>
```

### Path Dinamici per Struttura Cartelle

**Root Level** (`index.html`, `pages/contatti.html`):
```html
<link rel="stylesheet" href="css/style.css">
<script src="js/main.js"></script>
```

**Sottocartelle Level 1** (`pages/*/index.html`):
```html
<link rel="stylesheet" href="../../css/style.css">
<script src="../../js/main.js"></script>
```

### Componenti Centralizzati (NON toccare)

**File: `components/header.html`**
```html
<header class="main-header">
    <nav class="container">
        <a href="index.html" class="logo">
            <span class="logo-name">Simone Pizzi</span>
            <span class="logo-tagline">Idee, Storie e Sperimentazione</span>
        </a>
        <ul class="nav-menu">
            <li><a href="index.html">Home</a></li>
            <li><a href="#" class="disabled-nav-link" data-tooltip="Sezione in arrivo presto">Chi Sono</a></li>
            <li><a href="#" class="disabled-nav-link" data-tooltip="Sezione in arrivo presto">Podcast</a></li>
            <li><a href="#" class="disabled-nav-link" data-tooltip="Sezione in arrivo presto">Libri</a></li>
            <li><a href="pages/software/">Software</a></li>
            <li><a href="pages/videogiochi/">Videogiochi</a></li>
            <li><a href="pages/contatti.html">Contattami</a></li>
        </ul>
    </nav>
</header>
```

**File: `components/footer.html`**
```html
<footer class="main-footer">
    <div class="container">
        <div class="social-links">
            <a href="https://github.com/Pitz72" target="_blank">GitHub</a>
            <a href="https://www.instagram.com/pizzisimone1972/" target="_blank">Instagram</a>
            <a href="https://www.spreaker.com/user/runtime-radio--8395974" target="_blank">Spreaker</a>
        </div>
        <p class="copyright">&copy; 2025 Simone Pizzi. Tutti i diritti riservati.</p>
    </div>
</footer>
```

### Sistema JavaScript ComponentManager

Il `js/main.js` gestisce automaticamente:
- ✅ Caricamento header/footer da `components/`
- ✅ Calcolo path relativi basato su profondità directory
- ✅ Aggiornamento link nella navigazione
- ✅ Impostazione classe `active` per pagina corrente
- ✅ Gestione errori e fallback

**NON MODIFICARE IL SISTEMA JAVASCRIPT SENZA APPROVAZIONE**

---

## 🎨 Template CSS Modulare v2.1.1

### Struttura CSS Obbligatoria

**File: `css/style.css` (Orchestratore)**
```css
/* Sistema CSS reorganizzato e ottimizzato */
@import url('./base.css');      /* Variabili, Reset, Layout */
@import url('./components.css'); /* Header, Footer, Cards, Buttons */
@import url('./pages/home.css');       /* Specifico Homepage */
@import url('./pages/videogiochi.css'); /* Specifico Videogiochi */
@import url('./pages/contatti.css');   /* Specifico Contatti */

/* Solo parti legacy non modularizzate */
```

### CSS Modulari Specifici

**File: `css/base.css`**
- Variabili CSS (:root)
- Reset e normalizzazione
- Layout base (container, grid, flexbox)
- Tipografia e spacing

**File: `css/components.css`**
- Header e footer
- Cards e project-card
- Bottoni e link
- Tooltip e disabled states

**File: `css/pages/[SEZIONE].css`**
- Stili specifici per ogni sezione
- Es: `home.css` per effetto Aurora
- Es: `videogiochi.css` per template consolidato
- Es: `contatti.css` per form e FAQ

### Regole CSS Modulare

1. **NO DUPLICAZIONI**: Ogni stile in un solo file modulare
2. **IMPORTAZIONE SPECIFICA**: Caricare solo CSS necessario per sezione
3. **VARIABILI CENTRALI**: Tutte le variabili in `base.css`
4. **RESPONSABILITÀ CHIARE**: Ogni file modulare ha scope ben definito

---

## 🎮 Template Pagina Videogiochi v2.1.1

> **Template Consolidato**: v2.1.1 Enhanced - 24 Gennaio 2025  
> **Riferimento**: `pages/videogiochi/il-respiro-trattenuto-del-mondo.html`  
> **Status**: TEMPLATE RIGIDAMENTE CONSOLIDATO + SISTEMA CENTRALIZZATO

### Struttura HTML Base (con Sistema Centralizzato)

```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[NOME_GIOCO] - Interactive Fiction | Simone Pizzi</title>
    <meta name="description" content="[DESCRIZIONE_BREVE_GIOCO]">
    <meta name="keywords" content="Simone Pizzi, [NOME_GIOCO], interactive fiction, [KEYWORDS_SPECIFICHE]">
    <!-- Meta tag completi come template standard -->
    
    <!-- Font Awesome Icons OBBLIGATORIO -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <!-- CSS MODULARE: Path per sottocartella -->
    <link rel="stylesheet" href="../../css/style.css">
</head>
<body>
    <!-- ⚠️ CRITICO: NO HEADER STATICO - Caricato da JavaScript -->
    <!-- Header sarà caricato automaticamente dal JavaScript -->
```

### Layout Pagina Videogioco

```html
<main>
    <!-- BREADCRUMB NAVIGATION (Obbligatorio) -->
    <section class="page-hero">
        <div class="container column-layout">
            <div class="breadcrumb">
                <a href="videogiochi.html">Videogiochi</a> / <span>[NOME_GIOCO]</span>
            </div>
            <h1>[NOME_GIOCO]</h1>
            <p class="tagline">[SOTTOTITOLO_VERSIONE]</p>
        </div>
    </section>

    <!-- GAME DETAILS LAYOUT (Grid 1:2) -->
    <section class="section">
        <div class="container">
            <div class="detail-layout">
                <!-- COLONNA IMMAGINE (Sticky) -->
                <div class="detail-image">
                    <img src="../image/[IMMAGINE_GIOCO]" alt="[ALT_TEXT]" loading="lazy">
                </div>
                
                <!-- COLONNA CONTENUTO -->
                <div class="detail-content">
                    <!-- META INFORMAZIONI -->
                    <div class="game-meta">
                        <div class="meta-item">
                            <i class="fas fa-gamepad"></i>
                            <span><strong>Genere:</strong> [GENERE]</span>
                        </div>
                        <!-- Altri meta-item... -->
                    </div>

                    <!-- DESCRIZIONE GIOCO -->
                    <div class="game-description">
                        <h2>Descrizione</h2>
                        <!-- Contenuto descrizione -->
                    </div>

                    <!-- SEZIONE DOWNLOAD (Obbligatoria) -->
                    <div class="download-section">
                        <h2>📱 Download Gratuito</h2>
                        <div class="download-buttons">
                            <!-- Bottoni download per piattaforme -->
                        </div>
                        
                        <!-- SUPPORTO PAYPAL (Obbligatorio dopo download) -->
                        <div class="support-paypal">
                            <h3>💖 Ti è piaciuto?</h3>
                            <p>Se hai apprezzato questo gioco, puoi sostenere i miei progetti futuri!</p>
                            <a href="https://www.paypal.com/paypalme/SimonePizzi" target="_blank" class="button primary" aria-label="Sostieni con donazione PayPal">
                                <span class="cta-button-text">Offrimi un Caffè ☕</span>
                            </a>
                        </div>
                    </div>

                    <!-- INFORMAZIONI TECNICHE -->
                    <div class="technical-info">
                        <!-- Grid tecnica -->
                    </div>

                    <!-- SUPPORTO (Generico) -->
                    <div class="support-section">
                        <h3>📞 Supporto</h3>
                        <p>Per bug, suggerimenti o domande 
                        <a href="../contatti.html" class="text-link">clicca qui per scrivermi</a></p>
                        <p class="game-tagline"><strong>🎮 [TAGLINE_FINALE] 🎮</strong></p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- BACK NAVIGATION (Obbligatoria) -->
    <section class="section">
        <div class="container">
            <div class="back-navigation">
                <a href="index.html" class="back-link">
                    <i class="fas fa-arrow-left"></i>
                    Torna ai Videogiochi
                </a>
            </div>
        </div>
    </section>
</main>

    <!-- ⚠️ CRITICO: NO FOOTER STATICO - Caricato da JavaScript -->
    <!-- Header e Footer saranno caricati automaticamente dal JavaScript -->
    <script src="../../js/main.js"></script>
</body>
</html>
```

### CSS Classes Specifiche Videogiochi

**OBBLIGATORIE** per mantenere coerenza:

```css
/* Layout principale */
.detail-layout
.detail-image (sticky)
.detail-content

/* Meta informazioni */
.game-meta
.meta-item

/* Sezioni contenuto */
.game-description
.download-section
.download-buttons
.download-btn (con hover effects)
.support-paypal ⭐ NUOVO
.technical-info
.tech-grid
.tech-item

/* Navigazione */
.breadcrumb
.back-navigation
.back-link

/* Utilità */
.text-link.inactive (per giochi "Presto Disponibili")
```

### Elementi Obbligatori Template Videogiochi

1. **Breadcrumb Navigation**: `Videogiochi / [Nome Gioco]`
2. **Layout Grid 1:2**: Immagine sticky + contenuto scorrevole
3. **Game Meta**: Icone Font Awesome + info tecniche
4. **Download Section**: Con bottoni animati
5. **Supporto PayPal**: Subito dopo i download
6. **Link Contatti Generico**: Non email diretta
7. **Back Navigation**: Sempre presente
8. **Responsive Design**: Grid collassa su mobile

---

## 🎯 Template Project Card

```html
<div class="project-card">
    <div class="card-image">
        <img src="[IMAGE_PATH]" alt="[ALT_TEXT]" loading="lazy">
    </div>
    <div class="card-content">
        <h3>[PROJECT_TITLE]</h3>
        <p>[PROJECT_DESCRIPTION]</p>
        <a href="[PROJECT_LINK]" class="text-link">[CTA_TEXT] &rarr;</a>
    </div>
</div>
```

### Varianti Project Card

**Card Standard (Attiva)**:
```html
<a href="[LINK]" class="text-link">[CTA] &rarr;</a>
```

**Card Disabilitata**:
```html
<span class="text-link inactive">Presto Disponibile</span>
```

---

## 📄 Template Pagina Standard

```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[PAGE_TITLE] | Simone Pizzi</title>
    <meta name="description" content="[PAGE_DESCRIPTION]">
    <meta name="keywords" content="Simone Pizzi, [KEYWORDS]">
    <meta name="author" content="Simone Pizzi">
    <meta name="robots" content="index, follow">

    <!-- Open Graph & Twitter -->
    <meta property="og:title" content="[PAGE_TITLE] | Simone Pizzi">
    <meta property="og:description" content="[PAGE_DESCRIPTION]">
    <meta property="og:image" content="[OG_IMAGE_URL]">
    <meta property="og:url" content="[PAGE_URL]">
    <meta property="twitter:card" content="summary_large_image">

    <!-- Preconnect for performance -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <!-- ========= HEADER ========= -->
    <header class="main-header">
        <nav class="container">
            <a href="../index.html" class="logo">
                <span class="logo-name">Simone Pizzi</span>
                <span class="logo-tagline">Idee, Storie e Sperimentazione</span>
            </a>
            <ul class="nav-menu">
                <li><a href="../index.html">Home</a></li>
                <li><a href="sono-simone.html">Chi Sono</a></li>
                <li><a href="podcast.html">Podcast</a></li>
                <li><a href="libri.html">Libri</a></li>
                <li><a href="software.html">Software</a></li>
                <li><a href="videogiochi.html">Videogiochi</a></li>
                <li><a href="contatti.html">Contattami</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <!-- ========= Page Hero ========= -->
        <section class="page-hero">
            <div class="container column-layout">
                <h1>[PAGE_TITLE]</h1>
                <p class="tagline">[PAGE_TAGLINE]</p>
            </div>
        </section>

        <!-- Content sections here -->
    </main>

    <!-- ========= FOOTER ========= -->
    <footer class="main-footer">
        <div class="container">
            <div class="social-links">
                <a href="https://github.com/Pitz72" target="_blank">GitHub</a>
                <a href="https://www.instagram.com/pizzisimone1972/" target="_blank">Instagram</a>
                <a href="https://www.spreaker.com/user/runtime-radio--8395974" target="_blank">Spreaker</a>
            </div>
            <p class="copyright">&copy; 2025 Simone Pizzi. Tutti i diritti riservati.</p>
        </div>
    </footer>
</body>
</html>
```

---

## 📨 Template Form Contatti

```html
<form id="contactForm" class="contact-form">
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
        <select id="subject" name="subject" required>
            <option value="">Seleziona l'argomento</option>
            <option value="Collaborazione Podcast">Collaborazione Podcast</option>
            <option value="Progetto Sviluppo Software">Progetto Sviluppo Software</option>
            <option value="Proposta Editoriale">Proposta Editoriale</option>
            <option value="Richiesta Intervista">Richiesta Intervista</option>
            <option value="Consulenza Tecnica">Consulenza Tecnica</option>
            <option value="Altro">Altro</option>
        </select>
    </div>
    <div class="form-group">
        <label for="message">Messaggio</label>
        <textarea id="message" name="message" rows="5" required></textarea>
    </div>
    
    <!-- Honeypot field (anti-bot) -->
    <div style="position: absolute; left: -9999px; visibility: hidden;">
        <label for="website">Sito web (non compilare):</label>
        <input type="text" id="website" name="website" autocomplete="off" tabindex="-1">
    </div>
    
    <div class="form-group" style="flex-direction: row; align-items: flex-start;">
        <input type="checkbox" id="privacy" name="privacy" required>
        <label for="privacy" style="margin-left: 0.5rem; font-size: 0.9rem; line-height: 1.4; margin-top: 0;">
            Acconsento al trattamento dei miei dati personali secondo quanto previsto dal 
            Regolamento UE 2016/679 (GDPR). I dati saranno utilizzati esclusivamente per 
            rispondere alla tua richiesta e non saranno condivisi con terzi.
        </label>
    </div>
    
    <button type="submit" class="button primary full-width">
        <span class="cta-button-text">Invia Messaggio</span>
    </button>
</form>
<div id="formStatus" class="form-status" style="display: none;"></div>
```

---

## 💻 Template Pagina Software

> **Riferimento**: `pages/software.html` e pagine specifiche software

### Struttura Base Software
```html
<!-- Project Details Layout -->
<div class="project-details-layout">
    <div class="project-image">
        <img src="[SOFTWARE_IMAGE]" alt="[ALT_TEXT]" loading="lazy">
    </div>
    <div class="project-info">
        <div class="project-meta">
            <div class="meta-item">
                <h4>Tecnologie</h4>
                <p>[TECH_STACK]</p>
            </div>
            <!-- Altri meta-item -->
        </div>
        <!-- Resto del contenuto -->
    </div>
</div>
```

---

## 🔧 Linee Guida Generali

### CSS Class Naming Convention
- `.main-header` - Header principale
- `.page-hero` - Sezione hero di pagina
- `.section` - Contenitore sezione standard
- `.container` - Wrapper contenuto centralizzato
- `.column-layout` - Layout verticale centrato
- `.project-card` - Card progetto standard
- `.text-link` - Link testuale con freccia
- `.button.primary` - Bottone principale
- `.cta-button` - Call-to-action button

### Icone Font Awesome
**SEMPRE** utilizzare Font Awesome 6.5.0 via CDN:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
```

### Responsive Breakpoints
- **Desktop**: `min-width: 992px`
- **Tablet**: `max-width: 768px` 
- **Mobile**: `max-width: 480px`

---

## ⚠️ Anti-Regressione Template

1. **MAI** modificare la struttura base dei template
2. **SEMPRE** utilizzare le classi CSS specificate
3. **SEMPRE** includere Font Awesome per le icone
4. **SEMPRE** mantenere la navigazione breadcrumb nelle pagine dettaglio
5. **SEMPRE** includere back navigation
6. **MAI** inserire email dirette - utilizzare link generici ai contatti
7. **SEMPRE** includere supporto PayPal dopo download nei videogiochi

---

> **Versione Template**: v2.1.0 Final Production Edition  
> **Compliance**: ENTERPRISE READY ✅
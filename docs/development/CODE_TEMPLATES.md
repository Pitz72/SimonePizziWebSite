# Template di Codice - SimonePizziWebSite

> **Versione**: v2.1.0 Final Production Edition  
> **Ultimo Aggiornamento**: 27 Gennaio 2025  
> **Status**: ENTERPRISE PRODUCTION READY

## Regola Assoluta Template
**RISPETTO RIGOROSO**: Tutti i template definiti in questo documento devono essere seguiti alla lettera. Non sono ammesse deviazioni creative senza approvazione esplicita dell'utente. La coerenza del progetto ha priorità assoluta.

---

## 📋 Indice Template

1. [Template Project Card](#template-project-card)
2. [Template Pagina Standard](#template-pagina-standard)
3. [Template Form Contatti](#template-form-contatti)
4. [Template Pagina Software](#template-pagina-software)
5. [Template Pagina Videogiochi](#template-pagina-videogiochi) ⭐ **NUOVO**

---

## 🎮 Template Pagina Videogiochi

> **Template Approvato**: v2.1.0 - 27 Gennaio 2025  
> **Riferimento**: `pages/il-respiro-trattenuto-del-mondo.html`  
> **Status**: TEMPLATE UFFICIALE - DA RISPETTARE RIGOROSAMENTE

### Struttura HTML Base

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
    <link rel="stylesheet" href="../css/style.css">
</head>
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
                <a href="videogiochi.html" class="back-link">
                    <i class="fas fa-arrow-left"></i>
                    Torna ai Videogiochi
                </a>
            </div>
        </div>
    </section>
</main>
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
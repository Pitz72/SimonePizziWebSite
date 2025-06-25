# Dettagli Estetici e Tecnici - Sito Simone Pizzi

## AGGIORNAMENTO 2025 - Sessione di Sviluppo

### Modifiche Header
- **Logo ingrandito**: Nome "Simone Pizzi" da 1.8rem a 2.2rem
- **Layout orizzontale**: Logo e tagline sulla stessa riga con gap: 1.2rem
- **Tagline aggiornato**: "Idee, Storie e Sperimentazione" (era "Idee, Storie & Innovazione")
- **Allineamento baseline**: Logo e tagline allineati sulla baseline per eleganza tipografica
- **Spazio esteso**: Nav max-width da 1200px a 1400px, padding da 2rem a 3rem
- **Menu ottimizzato**: Gap ridotto da 2rem a 1.5rem per recuperare spazio

### Contenuti Aggiornati
- **Sezione Hero**: Testo completamente rinnovato con popup modale "Leggi Tutto"
- **Sezione Podcast**: Storia personale con Michela De Paola e Italian Podcast Network
- **Sezione Storie**: Narrazione più intima del percorso letterario
- **Sezione Sviluppo**: Approccio critico e riflessivo sui LLM
- **Sezione Esperimenti**: Descrizione dettagliata dei progetti in sviluppo

### Immagini Implementate
- **Hero**: `photo_2025-03-15_08-52-25.jpg` (foto personale)
- **Podcast**: `grandereset2.png` con object-position: right center
- **Storie**: `albero.jpg` (copertina libro)
- **Sviluppo**: `thesafeplace_immagine.jpg` (progetto)
- **Esperimenti**: `lemmons.jpg` (interactive fiction)

### Social Media Aggiornati
- **Facebook**: https://www.facebook.com/simonepizzi72/ (sostituisce X)
- **GitHub**: https://github.com/Pitz72
- **Instagram**: https://www.instagram.com/pizzisimone1972/
- **Podcast**: https://www.spreaker.com/user/runtime-radio--8395974 (sostituisce Spotify)
- **YouTube**: https://www.youtube.com/@ArcheologiaInformatica
- **Rimosso**: LinkedIn

### Popup Modale Implementato
- **Design coerente**: Gradiente verde scuro, bordi, backdrop blur
- **Funzionalità**: Apertura con "Leggi Tutto", chiusura con X, ESC, click esterno
- **Contenuto**: Testo completo della presentazione con sottosezioni

### OTTIMIZZAZIONE SEO COMPLETA (GENNAIO 2025)

#### Meta Tags Implementati
- **Title**: "Simone Pizzi - Podcaster, Scrittore e Sviluppatore | Idee, Storie e Sperimentazione"
- **Description**: Descrizione completa di 160 caratteri ottimizzata per search
- **Keywords**: Lista completa di parole chiave rilevanti
- **Open Graph**: Meta tags Facebook/Twitter completi
- **Canonical URL**: https://simonepizzi.runtimeradio.it/

#### Structured Data JSON-LD
```json
{
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Simone Pizzi",
    "jobTitle": "Podcaster, Scrittore, Sviluppatore",
    "worksFor": {"@type": "Organization", "name": "Runtime Radio"},
    "sameAs": [array di social media],
    "knowsAbout": [competenze e argomenti]
}
```

#### Ottimizzazioni Immagini
- **Alt text descrittivi**: Ogni immagine con descrizione SEO-friendly
- **Lazy loading**: `loading="lazy"` su tutte le immagini
- **Dimensioni ottimali**: Specificate width/height per CLS

#### Semantic HTML5
- **Article tags**: Contenuti principali in `<article>`
- **Section tags**: Ogni sezione con ID e aria-label
- **ARIA labels**: Accessibilità completa per screen reader
- **Heading hierarchy**: H1 > H2 struttura corretta

#### File SEO Creati
- **sitemap.xml**: Mappa completa del sito per crawler
- **robots.txt**: Configurazione ottimale per indicizzazione
- **.htaccess**: GZIP, cache, security headers, redirects

#### Link Optimization
- **External links**: `target="_blank" rel="noopener"`
- **Internal links**: Smooth scrolling mantenuto
- **Social links**: Aria-labels descrittivi

#### Sezione Contatti Aggiunta
- **Email**: simone@runtimeradio.it
- **Social centralizati**: Tutti i link in una sezione dedicata
- **Schema markup**: Informazioni di contatto strutturate

### FORM CONTATTI E GDPR (GENNAIO 2025)

#### Form di Contatto Funzionale
- **Campi**: Nome*, Email*, Oggetto, Messaggio*
- **Validazione**: JavaScript per campi obbligatori e formato email
- **Design**: Gradiente verde coerente, bordi, effetti focus
- **Responsive**: Ottimizzato mobile (font-size 16px previene zoom iOS)
- **Funzionalità**: Apertura client email con dati precompilati

#### GDPR Compliance
```html
<input type="checkbox" id="privacy" name="privacy" required>
Acconsento al trattamento dei miei dati personali secondo quanto previsto dal 
Regolamento UE 2016/679 (GDPR). I dati saranno utilizzati esclusivamente per 
rispondere alla tua richiesta e non saranno condivisi con terzi.
```

#### Email Anti-Spam Protection
- **Email principale**: `pizzisimone1972@gmail.com` (click-to-reveal)
- **Email Runtime Radio**: `info@runtimeradio.it` (click-to-reveal)
- **JavaScript dinamico**: Email assemblate solo al click utente
- **Protezione bot**: Non visibili nel codice sorgente

#### Social Media Ottimizzati
- **Rimossi duplicati**: Icone SVG eliminate dalla sezione contatti
- **Testo linkato**: "Puoi trovarmi anche su Facebook, Instagram, GitHub, YouTube e ascoltare i miei podcast su Spreaker"
- **Design pulito**: Evita ridondanza con footer

#### Stili Form CSS
```css
#contactForm input:focus,
#contactForm textarea:focus {
    border-color: #00ff88 !important;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.3) !important;
}

.email-reveal {
    transition: all 0.3s ease;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    background: rgba(0, 255, 136, 0.1);
}
```

## Palette Colori Completa

### Colori Principali
```css
/* Verde principale */
#00ff88

/* Verde secondario */
#00cc6a

/* Nero principale */
#0a0a0a

/* Verde scuro sezioni */
#0d2818

/* Verde scuro alternativo */
#0a1a0f

/* Grigio scuro */
#1a1a1a

/* Grigio medio */
#2d2d2d

/* Grigio chiaro */
#333333
```

### Colori con Trasparenza
```css
/* Bianco con opacità */
rgba(255, 255, 255, 0.9)  /* Testo paragrafi */
rgba(255, 255, 255, 0.7)  /* Tagline logo */
rgba(255, 255, 255, 0.1)  /* Background social */

/* Verde con opacità */
rgba(0, 255, 136, 0.3)    /* Ombre pulsanti */
rgba(0, 255, 136, 0.2)    /* Hover social */
rgba(0, 255, 136, 0.1)    /* Effetti shimmer */
rgba(0, 255, 136, 0.05)   /* Background radial */
```

## Tipografia Dettagliata

### Font Family
```css
font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
```

### Google Fonts Import
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
```

### Dimensioni e Pesi Font

#### Logo (AGGIORNATO 2025)
```css
.logo-name {
    font-size: 2.2rem;        /* Era 1.8rem */
    font-weight: 800;
    letter-spacing: -0.01em;
}

.logo-tagline {
    font-size: 0.8rem;        /* Era 0.75rem */
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
```

#### Titoli
```css
h1 {
    font-size: 4rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.1;
}

h2 {
    font-size: 2.8rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1.2;
}
```

#### Paragrafi
```css
p {
    font-size: 1.2rem;
    font-weight: 400;
    line-height: 1.8;
}
```

## Layout e Allineamento (AGGIORNATO 2025)

### Container Principale
```css
.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: stretch;    /* Era center - CAMBIATO per allineamento immagini */
    gap: 5rem;
    position: relative;
    z-index: 1;
}
```

### Header Navigation (AGGIORNATO 2025)
```css
nav {
    max-width: 1400px;       /* Era 1200px */
    margin: 0 auto;
    padding: 0 3rem;         /* Era 2rem */
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: 80px;
}

.logo {
    display: flex;
    align-items: baseline;   /* Era center - CAMBIATO per allineamento tipografico */
    gap: 1.2rem;            /* Era 1rem */
    flex-shrink: 0;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 1.5rem;           /* Era 2rem */
}
```

### Immagini (AGGIORNATO 2025)
```css
.image-placeholder {
    flex: 0 0 350px;
    height: auto;           /* Era 450px fisso */
    min-height: 100%;       /* AGGIUNTO per allineamento dinamico */
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #888;
    font-size: 1.2rem;
    border: 1px solid rgba(0, 255, 136, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.image-placeholder img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 20px;
}

/* Posizionamento specifico per l'immagine podcast */
.section:nth-child(2) .image-placeholder img {
    object-position: right center;  /* Mostra parte destra dell'immagine */
}
```

## Gradienti Specifici

### Titoli
```css
background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

### Pulsanti
```css
background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
```

### Sezioni Background
```css
/* Sezioni dispari */
background: linear-gradient(135deg, #0d2818 0%, #0a1a0f 100%);

/* Sezioni pari */
background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
```

### Modal Background (NUOVO 2025)
```css
.modal-content {
    background: linear-gradient(135deg, #0d2818 0%, #0a1a0f 100%);
    border: 1px solid rgba(0, 255, 136, 0.3);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
}
```

## Effetti e Animazioni

### Keyframes Definiti
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(50px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
```

### Transizioni
```css
/* Transizione standard */
transition: all 0.3s ease;

/* Transizione avanzata pulsanti */
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

/* Transizione scroll reveal */
transition: all 0.8s ease-out;
```

## Dimensioni e Spaziature

### Container
```css
max-width: 1200px;
padding: 0 2rem;
gap: 5rem; /* Desktop */
gap: 3rem; /* Tablet */
gap: 2rem; /* Mobile */
```

### Sezioni
```css
min-height: 100vh;
padding: 4rem 0;
```

### Immagini Placeholder
```css
/* Desktop */
flex: 0 0 350px;
height: auto;           /* CAMBIATO da 450px fisso */
min-height: 100%;       /* AGGIUNTO */

/* Mobile */
width: 100%;
max-width: 350px;
height: 400px;
```

### Header
```css
min-height: 80px;
padding: 1rem 0;
```

## Modal Popup (NUOVO 2025)

### Struttura
```css
.modal {
    display: none;
    position: fixed;
    z-index: 2000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
}

.modal-content {
    background: linear-gradient(135deg, #0d2818 0%, #0a1a0f 100%);
    margin: 5% auto;
    padding: 3rem;
    border-radius: 20px;
    width: 90%;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    border: 1px solid rgba(0, 255, 136, 0.3);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
}
```

### Funzionalità JavaScript
- Apertura con click su "Leggi Tutto"
- Chiusura con X, ESC, click esterno
- Blocco scroll della pagina quando aperto
- Smooth scrolling e animazioni preservate

## Effetti Speciali

### Box Shadow
```css
/* Immagini */
box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

/* Hover immagini */
box-shadow: 0 30px 60px rgba(0, 255, 136, 0.2);

/* Pulsanti */
box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);

/* Hover pulsanti */
box-shadow: 0 20px 40px rgba(0, 255, 136, 0.4);

/* Social hover */
box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);

/* Modal */
box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
```

### Border Radius
```css
/* Immagini */
border-radius: 20px;

/* Pulsanti */
border-radius: 50px;

/* Social */
border-radius: 50%;

/* Modal */
border-radius: 20px;
```

### Backdrop Filter
```css
backdrop-filter: blur(10px);
```

## Effetti Hover Specifici

### Immagini
```css
.image-placeholder:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 30px 60px rgba(0, 255, 136, 0.2);
}
```

### Pulsanti
```css
.btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 20px 40px rgba(0, 255, 136, 0.4);
}
```

### Social
```css
.social-links a:hover {
    color: #00ff88;
    background: rgba(0, 255, 136, 0.2);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 255, 136, 0.3);
}
```

## Responsive Breakpoints

### Mobile (max-width: 768px)
```css
/* Titoli */
h1 { font-size: 2.8rem; }
h2 { font-size: 2.2rem; }

/* Logo */
.logo {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
}
.logo-name { font-size: 1.8rem; }
.logo-tagline { font-size: 0.7rem; }

/* Layout */
.container {
    flex-direction: column;
    text-align: center;
    gap: 2rem;
}

/* Immagini */
.image-placeholder {
    flex: none;
    width: 100%;
    max-width: 350px;
    height: 400px;
}

.image-placeholder img {
    height: 400px;
}
```

## JavaScript Implementato

### Scroll Reveal
```javascript
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);
```

### Smooth Scrolling
```javascript
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
```

### Modal Functions (NUOVO 2025)
```javascript
function openModal() {
    document.getElementById('aboutModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('aboutModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Chiudi modal cliccando fuori dal contenuto
window.onclick = function(event) {
    const modal = document.getElementById('aboutModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Chiudi modal con ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});
```

### Hover Effects Dinamici
```javascript
document.querySelectorAll('.image-placeholder').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});
```

## Icone SVG Social (AGGIORNATO 2025)

### Dimensioni Standard
```css
.social-links svg {
    width: 24px;
    height: 24px;
    fill: currentColor;
}
```

### Container Social
```css
.social-links a {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}
```

### Social Media Implementati
- **Facebook**: Profilo personale simonepizzi72
- **GitHub**: Account sviluppo Pitz72
- **Instagram**: Account personale pizzisimone1972
- **Podcast**: Runtime Radio su Spreaker (icona generica podcast)
- **YouTube**: Canale Archeologia Informatica

## Note Tecniche Importanti

1. **Prefissi CSS**: Utilizzare -webkit- per compatibilità Safari
2. **Z-index**: Container principale z-index: 1, Modal z-index: 2000
3. **Overflow**: body overflow-x: hidden per evitare scroll orizzontale
4. **Performance**: Animazioni utilizzano transform e opacity per hardware acceleration
5. **Accessibilità**: aria-label su tutti i link social per screen reader
6. **Modal**: Gestione completa keyboard navigation e focus management
7. **Immagini**: Object-position per controllo preciso del crop
8. **Layout**: Align-items: stretch per allineamento dinamico delle immagini
9. **Copyright**: Aggiornato a 2025

## Coerenza Stilistica Mantenuta

### Principi Fondamentali Preservati
- **Palette colori**: Verde #00ff88/#00cc6a su nero #0a0a0a
- **Tipografia**: Font Inter con pesi specifici
- **Gradienti**: Consistenti su titoli, pulsanti e sfondi
- **Animazioni**: Smooth e coerenti in tutto il sito
- **Spacing**: Sistema di gap e padding uniforme
- **Border radius**: 20px per immagini, 50px per pulsanti
- **Effetti hover**: Consistenti su tutti gli elementi interattivi
- **Responsive**: Breakpoint 768px mantenuto e funzionale

### Nuove Aggiunte Coerenti
- **Modal**: Utilizza stesso design system (colori, gradienti, bordi)
- **Allineamento immagini**: Sistema dinamico che preserva proporzioni
- **Object-position**: Controllo preciso del crop mantenendo estetica
- **Social aggiornati**: Icone SVG coerenti con dimensioni e stili esistenti 
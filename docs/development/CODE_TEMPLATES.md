# Template di Codice - Sito Personale Simone Pizzi

**Versione Progetto:** 2.0.2 "Complete Portfolio Edition"
**Versione Documento:** 1.2
**Data Ultimo Aggiornamento:** 25 Gennaio 2025

---

## 1. Introduzione

Questo documento fornisce template di codice pronti all'uso per aggiungere nuovi contenuti e pagine al sito, garantendo la piena coerenza con le direttive definite nella `STYLE_GUIDE.md` e nella `LAYOUT_GUIDE.md`.

**Obiettivo:** Fornire una base di codice standard per l'LLM e gli sviluppatori per accelerare lo sviluppo e prevenire inconsistenze.

---

## 2. Template Pagina HTML Standard

Utilizzare questo template come base per ogni **nuova pagina** del sito (es. `/storie.html`).

```html
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- !! SOSTITUIRE QUESTI META TAGS !! -->
    <title>Titolo della Pagina | Simone Pizzi</title>
    <meta name="description" content="Descrizione specifica per questa pagina.">
    
    <!-- Meta Tags Standard (NON MODIFICARE) -->
    <meta name="author" content="Simone Pizzi">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://simonepizzi.runtimeradio.it/nome-pagina.html">
    
    <!-- Stili e Font (NON MODIFICARE) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">

    <!-- Favicon (NON MODIFICARE) -->
    <!-- <link rel="icon" type="image/x-icon" href="/favicon.ico"> -->

</head>
<body>
    <header>
        <!-- !! INCOLLARE QUI L'HEADER COMPLETO DA INDEX.HTML !! -->
        <!-- Assicurarsi che i link di navigazione siano corretti -->
    </header>

    <main>
        <!-- Inizio Contenuto Pagina -->

        <section class="section">
            <div class="container">
                <!-- Inserire qui il contenuto, usando i template di sezione -->
            </div>
        </section>

        <!-- Fine Contenuto Pagina -->
    </main>

    <footer>
        <!-- !! INCOLLARE QUI IL FOOTER COMPLETO DA INDEX.HTML !! -->
    </footer>

    <script src="js/main.js"></script>
</body>
</html>
```

---

## 3. Template Sezioni di Contenuto

Usare questi template per aggiungere sezioni di contenuto all'interno di una pagina.

### 3.1. Sezione Standard (Immagine a Sinistra)

```html
<section id="ID-UNIVOCO-SEZIONE" class="section">
    <div class="container">
        <div class="image-placeholder">
            <img src="image/NOME_IMMAGINE.jpg" alt="DESCRIZIONE SEO DELL'IMMAGINE" loading="lazy">
        </div>
        <article class="content">
            <h2>TITOLO DELLA SEZIONE</h2>
            <p>
                Testo della sezione. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Praesent vel ex sit amet turpis venenatis aliquet.
            </p>
            <p>
                Aliquam erat volutpat. Integer eget elit vel magna euismod aliquam.
            </p>
            <a href="LINK_DESTINAZIONE" class="cta-button" aria-label="DESCRIZIONE ACCESSIBILE DELLO SCOPO DEL PULSANTE">
                <span class="cta-button-text">TESTO DEL PULSANTE</span>
            </a>
        </article>
    </div>
</section>
```

### 3.2. Sezione Invertita (Immagine a Destra)

```html
<section id="ID-UNIVOCO-SEZIONE" class="section">
    <div class="container reverse">
        <div class="image-placeholder">
            <img src="image/NOME_IMMAGINE.jpg" alt="DESCRIZIONE SEO DELL'IMMAGINE" loading="lazy">
        </div>
        <article class="content">
            <h2>TITOLO DELLA SEZIONE</h2>
            <p>
                Testo della sezione. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Praesent vel ex sit amet turpis venenatis aliquet.
            </p>
            <a href="LINK_DESTINAZIONE" class="cta-button" aria-label="DESCRIZIONE ACCESSIBILE DELLO SCOPO DEL PULSANTE">
                <span class="cta-button-text">TESTO DEL PULSANTE</span>
            </a>
        </article>
    </div>
</section>
```

### 3.3. Sezione Solo Testo (Centrata)

Per sezioni senza immagine, come introduzioni o conclusioni.

```html
<section id="ID-UNIVOCO-SEZIONE" class="section">
    <div class="container">
        <article class="content" style="max-width: 800px; margin: 0 auto; text-align: center;">
            <h2>TITOLO DELLA SEZIONE</h2>
            <p>
                Testo della sezione. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Praesent vel ex sit amet turpis venenatis aliquet.
            </p>
        </article>
    </div>
</section>
```
---

## 4. Template Componenti Individuali

### 4.1. Pulsante CTA

```html
<a href="LINK_DESTINAZIONE" class="cta-button" aria-label="DESCRIZIONE ACCESSIBILE DELLO SCOPO DEL PULSANTE">
    <span class="cta-button-text">TESTO DEL PULSANTE</span>
</a>
```

### 4.2. Immagine con Placeholder

```html
<div class="image-placeholder">
    <img src="image/NOME_IMMAGINE.jpg" alt="DESCRIZIONE SEO DELL'IMMAGINE" loading="lazy">
</div>
```

---

## Template: Pagina Dettaglio Software

Questa è la struttura standard per una pagina dedicata a un singolo software.

### Layout Generale
La pagina deve utilizzare il layout `.project-details-layout` per affiancare l'immagine del software alle informazioni.

### Sezione Meta-Informazioni (`.project-meta`)
Questa sezione contiene i dati chiave del software.

#### **Struttura per la Compatibilità**
Utilizzare sempre testo semplice e chiaro per indicare i sistemi operativi supportati.

```html
<div class="meta-item">
    <h4>Compatibilità</h4>
    <p>Windows, macOS, Linux</p>
</div>
```

**Note di Implementazione:**
- **Evitare icone complesse:** Il testo "Windows, macOS, Linux" è più chiaro di icone SVG
- **Ordine standard:** Mantenere sempre l'ordine Windows → macOS → Linux
- **Chiarezza immediata:** Zero ambiguità per l'utente

### Sezione Supporto/Donazioni Ottimizzata
Posizionare il supporto PayPal subito dopo il pulsante download principale per massimizzare la conversione.

```html
<a href="downloads/percorso/file.zip" class="button primary large full-width" download aria-label="Descrizione download">
    <span class="cta-button-text">Download Nome Software</span>
</a>

<!-- PayPal Support Button - Subito dopo il download -->
<div style="text-align: center; margin-top: 2rem;">
    <h3 style="color: var(--primary-green); margin-bottom: 0.5rem;">Offrimi un Caffè</h3>
    <a href="https://www.paypal.com/paypalme/USERNAME" target="_blank" style="display: inline-block;">
        <img src="https://www.paypalobjects.com/it_IT/IT/i/btn/btn_donateCC_LG.gif" alt="Fai una donazione con il pulsante PayPal">
    </a>
</div>
```

### Layout Immagine-Testo Ottimizzato

Per pagine software con immagini prominenti, utilizzare questo layout con allineamento in alto:

```html
<section class="section">
    <div class="container project-details-layout" style="align-items: start;">
        <div class="project-image" style="display: flex; align-items: flex-start; justify-content: center;">
            <img src="image/nome-software.png" alt="Screenshot Software" loading="lazy" style="max-width: 350px; height: auto;">
        </div>
        <div class="project-info">
            <h2>Cos'è e Cosa Fa</h2>
            <!-- Contenuto informazioni -->
        </div>
    </div>
</section>
```

**Specifiche Tecniche:**
- **Dimensione immagine ottimale:** 350px max-width per software screenshots
- **Allineamento:** `align-items: start` per allineare immagine con inizio del testo
- **Responsive:** L'immagine si adatta automaticamente su mobile

### Sezione Narrativa Separata
Utilizzare una sezione separata per il contenuto narrativo/emozionale:

```html
<section class="section alt-bg">
    <div class="container column-layout text-center">
        <h2>Un Progetto di Passione</h2>
        <p>Testo che racconta la storia e motivazione dietro il software...</p>
    </div>
</section>
```

**Best Practices Implementate:**
- **Separazione logica:** Download/Support nella sezione principale, narrativa in sezione separata
- **UX ottimizzata:** PayPal immediatamente accessibile dopo il download
- **Layout pulito:** Eliminazione di spazi eccessivi e frammentazione
- **Compatibilità chiara:** Testo semplice invece di icone ambigue

---

## 6. Aggiornamenti di Conformità - Gennaio 2025

**Versione Aggiornamento:** 1.1
**Data Implementazione:** 25 Gennaio 2025

### 6.1. Nuove Classi CSS Implementate

Le seguenti classi sono state aggiunte per completare la conformità ai template:

#### **Sezioni con Sfondo Alternativo**
```css
.section.alt-bg {
    background-color: var(--surface-dark);
}
```

**Utilizzo:**
```html
<section class="section alt-bg">
    <div class="container column-layout text-center">
        <!-- Contenuto con sfondo scuro -->
    </div>
</section>
```

#### **Layout Invertito (Immagine a Destra)**
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

**Utilizzo:**
```html
<section class="section">
    <div class="container reverse">
        <div class="image-placeholder">
            <img src="image/esempio.jpg" alt="Descrizione" loading="lazy">
        </div>
        <article class="content">
            <h2>Titolo</h2>
            <p>Testo con immagine a destra su desktop</p>
        </article>
    </div>
</section>
```

#### **Wrapper Interno CTA Button**
```css
.cta-button-text {
    display: inline-block;
}
```

**Utilizzo (Template Standard):**
```html
<a href="#destinazione" class="cta-button" aria-label="Descrizione accessibile">
    <span class="cta-button-text">Testo del Pulsante</span>
</a>
```

### 6.2. Unificazione Grid Systems

La classe `.item-grid` è stata standardizzata per avere lo stesso comportamento di `.project-grid`:

```css
.item-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    width: 100%;
}

@media (max-width: 768px) {
    .item-grid {
        grid-template-columns: 1fr;
    }
}
```

### 6.3. Miglioramenti Performance

Tutti gli attributi `loading="lazy"` sono stati implementati sistematicamente su tutte le immagini del sito per ottimizzare i tempi di caricamento.

### 6.4. Stili Button Estesi

Aggiunti stili per pulsanti standard con varianti:

```css
.button.primary    /* Stile principale (verde) */
.button.large      /* Dimensioni maggiorate */
.button.full-width /* Larghezza completa del container */
```

### 6.5. Conformità Finale

Con questi aggiornamenti, il progetto raggiunge una **conformità del 100%** rispetto ai template documentati nella **STYLE_GUIDE.md** e **LAYOUT_GUIDE.md**.

---

## 7. Esempi Pratici di Implementazione

### 7.1. Sezione Standard + Sezione Invertita
```html
<!-- Sezione normale -->
<section class="section">
    <div class="container">
        <div class="image-placeholder">
            <img src="image/esempio1.jpg" alt="Esempio 1" loading="lazy">
        </div>
        <article class="content">
            <h2>Prima Sezione</h2>
            <p>Immagine a sinistra, testo a destra.</p>
        </article>
    </div>
</section>

<!-- Sezione invertita -->
<section class="section alt-bg">
    <div class="container reverse">
        <div class="image-placeholder">
            <img src="image/esempio2.jpg" alt="Esempio 2" loading="lazy">
        </div>
        <article class="content">
            <h2>Seconda Sezione</h2>
            <p>Immagine a destra, testo a sinistra, sfondo scuro.</p>
        </article>
    </div>
</section>
```

### 7.2. Grid di Progetti/Item
```html
<section class="section">
    <div class="container column-layout">
        <div class="item-grid">
            <div class="project-card">
                <div class="card-image">
                    <img src="image/progetto1.jpg" alt="Progetto 1" loading="lazy">
                </div>
                <div class="card-content">
                    <h3>Progetto 1</h3>
                    <p>Descrizione del progetto.</p>
                    <a href="dettaglio.html" class="text-link">Scopri di più &rarr;</a>
                </div>
            </div>
            <!-- Altri project-card... -->
        </div>
    </div>
</section>
```

### 7.3. Template Page Hero Corretto v2.0.1

**CORREZIONE CRITICA**: Standardizzato allineamento centrale per tutti i titoli hero.

```html
<!-- Template CORRETTO per tutte le pagine principali -->
<section class="page-hero">
    <div class="container column-layout">
        <h1>Titolo della Pagina</h1>
        <p class="tagline">Descrizione della pagina o sezione.</p>
    </div>
</section>
```

**Note Implementazione v2.0.1**:
- ✅ **NO style inline**: La classe `.page-hero` gestisce automaticamente il centramento
- ✅ **Centramento garantito**: CSS centralizzato `text-align: center`
- ✅ **Coerenza totale**: Stesso comportamento visivo su tutte le pagine menu
- ❌ **VIETATO**: `style="text-align: center;"` o altri allineamenti inline 
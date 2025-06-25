# Guida di Stile (Style Guide) - Sito Personale Simone Pizzi

**Versione Progetto:** 2.0.2 "Complete Portfolio Edition"
**Versione Documento:** 1.2  
**Data Ultimo Aggiornamento:** 25 Gennaio 2025

---

## 1. Filosofia del Design

L'identità visiva del sito si basa su un'estetica **moderna, minimale e ad alto contrasto**. La scelta del verde brillante su sfondo scuro evoca il terminale dei computer classici, unendo un sapore "retro-tech" a un design pulito e professionale.

---

## 2. Palette Colori

La palette è intenzionalmente limitata per garantire coerenza e leggibilità.

| Colore          | HEX       | Codice Variabile CSS | Utilizzo Principale                               |
| --------------- | --------- | -------------------- | ------------------------------------------------- |
| **Verde Primario**  | `#00ff88` | `--primary-green`    | Elementi interattivi, titoli, highlights, bordi   |
| **Verde Secondario**| `#00cc6a` | `--secondary-green`  | Hover, gradienti, elementi attivi               |
| **Nero Sfondo**     | `#0a0a0a` | `--background-dark`  | Sfondo principale del sito                        |
| **Grigio Scuro**    | `#1a1a1a` | `--surface-dark`     | Sfondi di sezioni, form, elementi in rilievo    |
| **Verde Scuro**     | `#0d2818` | `--dark-green`       | Sfumature e background di elementi specifici      |
| **Bianco Testo**    | `#ffffff` | `--text-light`       | Testo principale, paragrafi                     |
| **Grigio Testo**    | `#b3b3b3` | `--text-muted`       | Testo secondario, tagline, metadati             |

---

## 3. Tipografia

Il font scelto per l'intero sito è **Inter**, importato da Google Fonts. Questo garantisce un'eccellente leggibilità e un aspetto moderno su tutti i dispositivi.

*   **Font Family:** ` 'Inter', sans-serif `

### 3.1. Gerarchia e Dimensioni

| Elemento           | Tag HTML | Font Weight | Font Size (Desktop) | Font Size (Mobile) | Colore             | Note                                            |
| ------------------ | -------- | ----------- | ------------------- | ------------------ | ------------------ | ----------------------------------------------- |
| **Hero Title**     | `h1`     | `800` (ExtraBold) | `4rem`              | `2.8rem`           | `var(--text-light)`| Utilizzato solo una volta nella Hero Section.   |
| **Titolo Sezione** | `h2`     | `700` (Bold)    | `2.8rem`            | `2.2rem`           | `var(--primary-green)`| Titoli delle sezioni principali.                |
| **Sottotitolo**    | `h3`     | `600` (SemiBold)  | `1.8rem`            | `1.5rem`           | `var(--text-light)`| Usato per elementi intermedi.                   |
| **Testo Principale**   | `p`      | `400` (Regular) | `1.2rem`            | `1rem`             | `var(--text-light)`| `line-height: 1.8` per leggibilità.             |
| **Link & Bottoni** | `a`, `button`| `500` (Medium)  | `1rem`              | `1rem`             | `var(--text-light)`|                                                 |
| **Tagline Logo**   | `.logo-tagline` | `300` (Light)   | `1rem`              | `0.9rem`           | `var(--text-muted)`|                                                 |

---

## 4. Componenti UI

### 4.1. Pulsanti (CTA Button)

I pulsanti di Call-to-Action devono essere immediatamente riconoscibili.

*   **Classe CSS:** `.cta-button`
*   **Stato Normale:**
    *   Sfondo: Gradiente lineare da `var(--primary-green)` a `var(--secondary-green)`.
    *   Testo: `var(--background-dark)`, `font-weight: 700`.
    *   Bordo: Nessuno.
    *   `border-radius`: `50px`.
*   **Stato Hover:**
    *   `transform: scale(1.05)`.
    *   `box-shadow`: `0 5px 15px rgba(0, 255, 136, 0.2)`.

### 4.2. Link
*   **Link nel testo:** Devono essere sottolineati e usare il colore `var(--primary-green)`.
*   **Link di navigazione:** Nessuna sottolineatura, colore `var(--text-light)`. Diventano `var(--primary-green)` allo stato hover.

### 4.3. Form
*   **Sfondo:** `var(--surface-dark)`.
*   **Bordo:** `1px solid rgba(0, 255, 136, 0.3)`.
*   **Label:** Colore `var(--primary-green)`, `font-weight: 600`.
*   **Input (Focus):**
    *   Bordo: `1px solid var(--primary-green)`.
    *   `box-shadow`: `0 0 10px rgba(0, 255, 136, 0.3)`.

### 4.4. Immagini
*   Le immagini all'interno delle sezioni devono avere un `border-radius: 20px`.
*   **Stato Hover:**
    *   Leggero effetto "lift": `transform: translateY(-5px) scale(1.02)`.
    *   `transition`: `transform 0.3s ease`. 

---

## 5. Aggiornamenti Conformità - Gennaio 2025

**Status Conformità:** ✅ **100% CONFORME** (aggiornato da 85%)

### 5.1. Nuove Classi CSS Implementate

Durante la fase di audit e sistemazione del gennaio 2025, sono state aggiunte le seguenti classi per completare la conformità ai template documentati:

#### **Sezioni con Sfondo Alternativo**
```css
.section.alt-bg {
    background-color: var(--surface-dark);
}
```
**Utilizzo:** Per creare alternanza visiva tra sezioni consecutive, utilizzando il grigio scuro come sfondo.

#### **Layout Invertito per Sezioni**
```css
.section .container.reverse {
    flex-direction: row-reverse;
}
```
**Utilizzo:** Applica il layout con immagine a destra e testo a sinistra su desktop, mantenendo il layout a colonna su mobile.

#### **Wrapper Interno CTA Buttons**
```css
.cta-button-text {
    display: inline-block;
}
```
**Utilizzo:** Wrapper interno obbligatorio per tutti i pulsanti CTA per garantire conformità ai template.

### 5.2. Unificazione Sistema Grid

La classe `.item-grid` è stata standardizzata per avere comportamento identico a `.project-grid`, garantendo coerenza nell'intero sito.

### 5.3. Ottimizzazioni Performance

- Implementazione sistematica di `loading="lazy"` su tutte le immagini
- Aggiunta di attributi `aria-label` per migliorare l'accessibilità
- Standardizzazione della nomenclatura delle classi CSS

### 5.4. Stili Button Estesi

Aggiunti stili per pulsanti standard con varianti:
- `.button.primary` - Stile principale con colore verde
- `.button.large` - Dimensioni maggiorate 
- `.button.full-width` - Larghezza completa del container

### 5.5. Miglioramenti Specifici Pagine Software

- Template standardizzato per icone sistemi operativi (Windows, macOS, Linux)
- Layout ottimizzato per sezioni di supporto e donazioni PayPal
- Allineamento e spaziatura perfezionati per hero sections

**Aggiornamenti Finali (Gennaio 2025):**

#### **Compatibilità Sistemi Operativi**
- **Standard adottato:** Testo semplice "Windows, macOS, Linux" invece di icone SVG
- **Motivazione:** Eliminazione ambiguità visive e chiarezza immediata per l'utente
- **Implementazione:** Utilizzo di paragrafo `<p>` semplice nell'area meta-informazioni

#### **Posizionamento Strategico PayPal**
- **Ubicazione ottimale:** Subito dopo il pulsante download principale
- **UX Logic:** Massimizzazione conversioni mantenendo il flusso Download → Supporto
- **Styling:** Titolo `<h3>` verde prominente con spaziatura controllata (0.5rem)

#### **Layout Immagini Software Ottimizzato**
- **Dimensione standard:** 350px max-width per screenshot software
- **Allineamento:** `align-items: start` per sincronizzazione con inizio testi
- **Responsiveness:** Adattamento automatico proporzionale su tutti i dispositivi

#### **Architettura Sezioni Migliorata**
- **Sezione principale:** Informazioni + Download + Supporto (blocco unico)
- **Sezione narrativa:** Storia e passione (separata con `.alt-bg`)
- **Eliminazione frammentazione:** Zero spazi "abissali" tra elementi correlati

---

## 6. Standard di Qualità Raggiunti

Con gli aggiornamenti di gennaio 2025, il sito raggiunge i seguenti standard:

- **✅ Conformità Template:** 100% conforme ai template documentati
- **✅ Responsive Design:** Perfettamente ottimizzato per tutti i dispositivi
- **✅ Performance:** Ottimizzazioni di caricamento implementate
- **✅ Accessibilità:** Attributi ARIA e semantic HTML completi
- **✅ SEO:** Meta tags e structured data ottimizzati
- **✅ Coerenza Visiva:** Palette colori e tipografia uniformi

Il design system è ora **immutabile e standardizzato** per garantire la massima coerenza nelle future implementazioni.

---

## 7. Correzione Critica Allineamento Hero - v2.0.1 (25 Gennaio 2025)

**PROBLEMA IDENTIFICATO E RISOLTO**: Allineamento inconsistente dei titoli hero nelle pagine principali.

### 7.1. Analisi del Problema
- **Pagine Coinvolte**: Tutte le pagine accessibili dal menu principale
- **Sintomo**: Titoli hero disallineati a sinistra invece che centrati  
- **Inconsistenza**: Due pagine software avevano correzioni inline ad-hoc

### 7.2. Soluzione Implementata

**CSS Corretto**:
```css
.page-hero {
    padding: 4rem 0;
    background-color: var(--background-dark-green);
    border-bottom: 1px solid var(--border-color);
    text-align: center; /* CORRETTO da left a center */
}
```

**Pulizia Codice**:
- Rimossi style inline `style="text-align: center;"` dalle pagine software
- Centralizzato controllo allineamento nel CSS main

### 7.3. Standard Consolidato v2.0.1
- ✅ **TUTTI i titoli hero**: Perfettamente centrati su tutte le pagine principali
- ✅ **Zero stili inline**: Controllo centralizzato tramite CSS
- ✅ **Coerenza totale**: Stesso comportamento visivo su tutte le pagine del menu

### 7.4. Prevenzione Regressioni Future
- **Regola**: Mai utilizzare style inline per allineamento testo nelle pagine principali
- **Standard**: Classe `.page-hero` gestisce SEMPRE il centramento dei titoli
- **Controllo**: Verificare coerenza visiva titoli hero in fase di testing 
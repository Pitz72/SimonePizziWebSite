# Guida al Layout - Sito Personale Simone Pizzi

**Versione Progetto:** 2.0.2 "Complete Portfolio Edition"
**Versione Documento:** 1.2
**Data Ultimo Aggiornamento:** 25 Gennaio 2025

---

## 1. Filosofia del Layout

Il layout del sito è progettato per essere **pulito, leggibile e flessibile**. Utilizza un sistema basato su **Flexbox** per garantire che i contenuti si adattino in modo fluido a diverse dimensioni dello schermo, dal mobile al desktop. La struttura a "blocchi" di sezioni alternate guida l'utente attraverso i contenuti in modo naturale.

---

## 2. Griglia e Container

Il contenuto principale di ogni sezione è racchiuso all'interno di un container per garantire una larghezza di lettura ottimale e margini consistenti.

*   **Container Principale (`.container`):**
    *   `max-width`: **1200px**
    *   `margin`: `0 auto` (per centrare il contenuto)
    *   `padding`: `0 2rem` (per mantenere spazio sui lati negli schermi più piccoli)

*   **Navigazione (`<nav>`):**
    *   `max-width`: **1400px** (leggermente più ampia per un effetto più arioso)
    *   `padding`: `3rem`

---

## 3. Responsive Design

Il design è "mobile-first" nel suo approccio, anche se il breakpoint principale è definito per tablet/desktop.

*   **Breakpoint Principale:** **768px**
    *   **Sotto i 768px (Mobile):** Il layout delle sezioni è a colonna singola. L'immagine, se presente, si posiziona sempre sopra il blocco di testo. Il menu di navigazione è collassato in un'icona "hamburger".
    *   **Sopra i 768px (Desktop/Tablet):** Il layout è a due colonne (immagine e testo). La navigazione è visibile per esteso.

---

## 4. Struttura delle Sezioni Standard

Le sezioni di contenuto nella pagina `index.html` seguono due schemi principali per creare un layout dinamico e non monotono.

### 4.1. Sezione Standard (Immagine a Sinistra)

Questo è il layout di default.

*   **Struttura HTML:**
    ```html
    <section id="nome-sezione" class="section">
        <div class="container">
            <div class="image-placeholder">
                <img src="path/to/image.jpg" alt="Descrizione immagine">
            </div>
            <article class="content">
                <h2>Titolo della Sezione</h2>
                <p>Paragrafo di testo...</p>
                <a href="#" class="cta-button">Call to Action</a>
            </article>
        </div>
    </section>
    ```
*   **Logica Flexbox:** Il `.container` ha `display: flex`. Su desktop, i due figli (`.image-placeholder` e `.content`) si affiancano. Su mobile, `flex-direction: column`.

### 4.2. Sezione Invertita (Immagine a Destra)

Per alternare il layout, si aggiunge una classe `.reverse` al container.

*   **Struttura HTML:**
    ```html
    <section id="nome-sezione" class="section">
        <div class="container reverse">
            <div class="image-placeholder">
                <img src="path/to/image.jpg" alt="Descrizione immagine">
            </div>
            <article class="content">
                <h2>Titolo della Sezione</h2>
                <p>Paragrafo di testo...</p>
                <a href="#" class="cta-button">Call to Action</a>
            </article>
        </div>
    </section>
    ```
*   **Logica Flexbox:** La classe `.reverse` applica `flex-direction: row-reverse` su desktop, invertendo l'ordine dei due elementi. Su mobile, l'ordine torna a colonna singola.

---

## 5. Spaziatura (Spacing)

Una spaziatura coerente è fondamentale per un design pulito.

*   **Spazio tra Sezioni:**
    *   `padding-top` e `padding-bottom` di ogni `.section`: **5rem**

*   **Gap tra Colonne (Desktop):**
    *   Il `gap` all'interno di un `.container` flex: **5rem**

*   **Spazio Verticale (Mobile):**
    *   Il `gap` tra immagine e testo in layout a colonna: **3rem** 

---

## 6. Aggiornamenti Layout - Gennaio 2025

**Status Implementazione:** ✅ **COMPLETAMENTE IMPLEMENTATO**

### 6.1. Nuove Classi Layout Implementate

Durante la fase di sistemazione della conformità, sono state implementate le seguenti classi per completare il sistema di layout:

#### **Classe `.reverse` per Container**
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

**Utilizzo Pratico:**
```html
<!-- Sezione standard (immagine a sinistra) -->
<section class="section">
    <div class="container">
        <div class="image-placeholder">...</div>
        <article class="content">...</article>
    </div>
</section>

<!-- Sezione invertita (immagine a destra) -->
<section class="section">
    <div class="container reverse">
        <div class="image-placeholder">...</div>
        <article class="content">...</article>
    </div>
</section>
```

#### **Classe `.alt-bg` per Sezioni Alternative**
```css
.section.alt-bg {
    background-color: var(--surface-dark);
}
```

**Utilizzo per Alternanza Visiva:**
```html
<!-- Sezione normale -->
<section class="section">
    <div class="container">...</div>
</section>

<!-- Sezione con sfondo alternativo -->
<section class="section alt-bg">
    <div class="container reverse">...</div>
</section>
```

### 6.2. Sistema Grid Unificato

#### **Unificazione `.item-grid` e `.project-grid`**
Entrambe le classi ora condividono lo stesso comportamento responsivo:

```css
.item-grid, .project-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
    width: 100%;
}

@media (max-width: 768px) {
    .item-grid, .project-grid {
        grid-template-columns: 1fr;
    }
}
```

### 6.3. Layout Specializzati per Pagine Software

#### **Layout Dettaglio Progetto**
```css
.project-details-layout {
    display: flex;
    gap: 3rem;
    align-items: flex-start;
}

@media (max-width: 768px) {
    .project-details-layout {
        flex-direction: column;
    }
}
```

#### **Layout Centrato per Supporto**
```css
.column-layout.text-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
```

### 6.4. Miglioramenti Responsive

- **Breakpoint Consolidato:** Conferma del breakpoint principale a 768px
- **Layout Mobile Ottimizzato:** Tutti i layout si adattano correttamente a colonna singola
- **Spaziatura Consistente:** Gap e padding uniformi in tutto il sito

### 6.5. Layout Patterns Standardizzati

Il sito ora utilizza 4 pattern di layout principali:

1. **Standard:** Immagine a sinistra, testo a destra
2. **Reverse:** Immagine a destra, testo a sinistra  
3. **Grid:** Griglia responsiva 2x1 (desktop) → 1x2 (mobile)
4. **Centrato:** Layout a colonna con allineamento centrale

---

## 7. Best Practices Layout

### 7.1. Alternanza Sezioni
Per mantenere interesse visivo, alternare sempre:
- `.section` standard con `.section.alt-bg`
- `.container` normale con `.container.reverse`

### 7.2. Gerarchia Visiva
- **Hero Section:** Sempre in cima, layout centrato
- **Sezioni Contenuto:** Alternanza standard/reverse
- **Sezioni Supporto:** Layout centrato con sfondo alternativo

### 7.3. Responsiveness
- **Desktop First:** Progettare per 1200px container width
- **Mobile Adaptation:** Tutti i layout si riducono a colonna singola sotto 768px
- **Gap Responsive:** Riduzione automatica del gap su mobile (da 5rem a 3rem)

Il sistema di layout è ora **completo e immutabile**, garantendo coerenza perfetta in tutte le future implementazioni. 
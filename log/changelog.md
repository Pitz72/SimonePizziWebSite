# Changelog del Sito

Questo file traccia le modifiche significative apportate al sito web.

---

**Data:** 2024-07-27
**Autore:** Cascade (AI Assistant)
**File Modificati:**
- `index.html`
- `css/style.css`

**Descrizione delle Modifiche:**
Ripristinato lo stile dei pulsanti sulla homepage (`index.html`) per assomigliare ai pulsanti verdi con effetto scintillio (shimmer) al passaggio del mouse, precedentemente presenti sulla pagina "Ciao Simone".

**Dettagli:**
1.  **`index.html`**:
    *   Sostituita la classe generica `btn` con la classe più specifica `cta-button` per i seguenti link/pulsanti:
        *   Link "Leggi il Blog" nella sezione introduzione.
        *   Link "Podcast e Web Radio" nella sezione podcast.
        *   Link "Storie, racconti e libri" nella sezione storie.
        *   Link "Sviluppare con le cosiddette AI" nella sezione sviluppo.
        *   Link "Esplora gli Esperimenti" nella sezione esperimenti.
        *   Pulsante "Invia Messaggio" nel form di contatto.
2.  **`css/style.css`**:
    *   Modificata la regola `.cta-button` aggiungendo `position: relative;` e `overflow: hidden;` per abilitare il corretto posizionamento e contenimento dell'effetto shimmer.
    *   Aggiunta una nuova regola per lo pseudo-elemento `.cta-button::after` per creare l'effetto visivo dello shimmer (un gradiente luminoso che scorre).
    *   Aggiunta una regola `.cta-button:hover::after` per attivare l'animazione dello shimmer al passaggio del mouse.
    *   Definita una nuova animazione `@keyframes shimmer` per controllare il movimento del gradiente luminoso attraverso il pulsante.

**Motivazione/Obiettivo:**
Migliorare l'aspetto visivo e l'esperienza utente della homepage, ripristinando uno stile di pulsante più accattivante e coerente con altri elementi del sito (come quelli precedentemente visti sulla pagina "Ciao Simone").

**Aggiornamento successivo (stessa data):**
Per garantire la leggibilità del testo durante l'effetto shimmer:
3.  **`index.html`**:
    *   Il contenuto testuale di ogni `.cta-button` è stato avvolto in un `<span>` con classe `cta-button-text`.
4.  **`css/style.css`**:
    *   Aggiunta una regola per `.cta-button-text` con `position: relative; z-index: 1;` per posizionare il testo sopra l'effetto shimmer.
    *   Aggiunto `z-index: 0;` alla regola `.cta-button::after` per posizionare lo shimmer sotto il testo.

**Motivazione/Obiettivo:**
Assicurare che il testo del pulsante rimanga sempre leggibile durante l'animazione dell'effetto shimmer.

---


## [2025-05-29] - Aggiornamento Favicon

**Autore:** Cascade/Utente

**File Modificati:**
- `index.html`
- `sono-simone.html`

**Descrizione:**
1.  Aggiunti link per favicon (`favicon.ico` e `apple-touch-icon.png`) alla pagina `index.html`.
2.  Corretti i percorsi dei link favicon in `sono-simone.html` (es. da `image/favicon/favicon.ico` a `favicon/favicon.ico` e da `image/favicon/apple-touch-icon.png` a `favicon/apple-touch-icon.png`).

**Motivazione/Obiettivo:**
- Migliorare User Experience e Branding con favicon corretti.
- Standardizzare percorsi dei favicon.

---

## [2025-05-29]

**Autore:** Cascade/Utente

**File Modificati:**
- `sono-simone.html`
- `css/style.css` (consultato)

**Descrizione:**
Corretto il layout della pagina "Sono Simone" che mostrava i contenuti su più colonne invece che su una singola colonna.

**Motivazione/Obiettivo:**
- Bugfix layout: La sezione introduttiva "Ciao, sono Simone!" e la sezione dell'articolo del blog erano affiancate a causa dell'utilizzo della classe generica `.container` (con `display: flex`) invece della classe specifica `.blog-container`.
- Sostituita la classe `container` con `blog-container` nel file `sono-simone.html` per il div principale all'interno di `<main>`.

---

## [2025-05-28] (Sessione Precedente e Inizio Sessione Corrente)

**Autore:** Cascade/Utente

**File Modificati:**
- `js/main.js` (creato/aggiornato)
- `sono-simone.html`
- `index.html`
- `sitemap.xml`

**Descrizione:**
1.  **Consolidamento JavaScript:**
    *   Creato (o popolato) `js/main.js` per unificare tutto il codice JavaScript del sito (accordion, hamburger menu, effetti scroll, gestione form, ecc.).
    *   Rimossi script inline da `sono-simone.html` e `index.html`.
    *   Aggiunto riferimento a `js/main.js` con attributo `defer` in entrambe le pagine HTML.
2.  **Correzioni Strutturali e di Contenuto in `sono-simone.html`:**
    *   Risolto problema di un container duplicato.
    *   Rimosso un articolo del blog duplicato.
    *   Corretto un commento HTML errato.
3.  **Ottimizzazioni SEO per `sono-simone.html`:**
    *   Aggiunti meta tag SEO (description, keywords), Open Graph, Twitter card.
    *   Aggiunto JSON-LD per dati strutturati (Article).
    *   Aggiunto link canonico e riferimento favicon.
4.  **Aggiornamento `sitemap.xml`:**
    *   Aggiunta la pagina `sono-simone.html`.
    *   Aggiornate le date `lastmod`.

**Motivazione/Obiettivo:**
- **Migliorare manutenibilità e organizzazione del codice:** Centralizzare JavaScript per evitare duplicazioni e facilitare aggiornamenti.
- **Correzione bug HTML/layout:** Risolvere problemi di visualizzazione e struttura in `sono-simone.html`.
- **Migliorare SEO:** Aumentare la visibilità e l'indicizzazione della pagina `sono-simone.html`.
- **Mantenere aggiornata la sitemap:** Assicurare che i motori di ricerca abbiano informazioni corrette sulla struttura del sito.

---

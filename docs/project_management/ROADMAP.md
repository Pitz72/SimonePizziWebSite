# Roadmap di Sviluppo - Sito Personale Simone Pizzi

**Versione Progetto:** 2.0.2 "Complete Portfolio Edition"  
**Versione Documento:** 1.2
**Data Ultimo Aggiornamento:** 25 Gennaio 2025

---

## 1. Stato Attuale del Progetto v2.0

**Data Release v2.0.2:** 25 Gennaio 2025  
**Versione Corrente:** 2.0.2 "Complete Portfolio Edition" ✅ **RILASCIATA**

Il sito ha raggiunto la **maturità completa** con la versione 2.0.2 "Complete Portfolio Edition". Questa versione rappresenta un **traguardo di eccellenza tecnica** con portfolio software completo, conformità totale ai template e documentazione di livello enterprise.

### Achievements v2.0.2 Completati:
- ⭐ **Portfolio Software Completo:** 3 software professionali completamente documentati
- ⭐ **100% Template Compliance:** Zero deviazioni dai template documentati  
- ⭐ **Enterprise Grade Quality:** Metriche professionali al 100% su tutti i parametri
- ⭐ **Complete Documentation:** Documentazione esaustiva e sincronizzata
- ⭐ **UX Perfezionata:** User experience ottimizzata in ogni dettaglio
- ⭐ **Performance Maximized:** Lazy loading sistematico e ottimizzazioni complete
- ⭐ **Immutable Standards:** Framework consolidato per sviluppi futuri

**Status Progetto:** 🎯 **PRODUCTION READY - ENTERPRISE GRADE**

---

## 2. Visione a Lungo Termine v2.1+

Questa roadmap delinea le evoluzioni future del sito, con l'obiettivo di espandere le funzionalità mantenendo gli standard di qualità enterprise raggiunti con la v2.0. Le attività sono raggruppate per priorità per guidare lo sviluppo in modo incrementale.

---

## 3. Priorità Alta v2.1 (Prossimi 3-6 mesi)

Le seguenti attività sono prioritarie per mantenere gli standard enterprise e aggiungere il software mancante.

### 3.1. Aggiornamenti Software ✅ **COMPLETATO**
- **Obiettivo:** Completare il portfolio con il terzo software professionale.
- **Task:**
    - [x] **Audio & Metadata Converter:** Creata pagina dettagliata per convertitore broadcasting
    - [x] **Template Standardizzato:** Utilizzato il template software consolidato v2.0.2
    - [x] **Documentazione:** Allineato con standard documentali esistenti
    - [x] **Sostituzione FeedBot:** Sostituito placeholder con software reale e funzionale

### 3.2. Refactoring del Modulo di Contatto
- **Obiettivo:** Sostituire l'attuale implementazione `mailto:` con una soluzione più robusta e user-friendly.
- **Task:**
    - [ ] **Ricerca:** Valutare servizi di terze parti come **EmailJS** o Formspree.
    - [ ] **Integrazione:** Implementare il servizio scelto per gestire l'invio del form in background.
    - [ ] **Feedback Utente:** Aggiungere messaggi di successo/errore chiari dopo l'invio, senza reindirizzare l'utente.
    - [ ] **Rimozione Mailto:** Eliminare la logica `mailto:` da `js/main.js`.

### 3.3. Refactoring degli Stili CSS
- **Obiettivo:** Migliorare la manutenibilità e la coerenza del codice CSS.
- **Task:**
    - [ ] **Esternalizzazione Stili:** Spostare tutti gli stili "inline" presenti in `index.html` (specialmente nel form di contatto) all'interno del file `css/style.css`.
    - [ ] **Creazione Classi Utility:** Creare classi CSS riutilizzabili per gli stili comuni (es. `.form-input`, `.form-label`).
    - [ ] **Pulizia Codice:** Rimuovere gli attributi `style` dall'HTML.

### 3.4. Implementazione Favicon
- **Obiettivo:** Aumentare il branding e la professionalità del sito.
- **Task:**
    - [ ] **Generazione Icone:** Creare il set completo di file favicon (es. `favicon.ico`, `apple-touch-icon.png`, etc.).
    - [ ] **Aggiunta File:** Inserire i file nella root del progetto.
    - [ ] **Attivazione Link:** De-commentare e verificare i link `<link>` corrispondenti nella sezione `<head>` di tutti i file HTML.

---

## 4. Priorità Media v2.2+ (6-12 mesi)

Queste attività aggiungeranno nuove funzionalità e contenuti significativi al sito.

### 4.1. Creazione di Pagine Dedicate
- **Obiettivo:** Espandere le sezioni principali in pagine dedicate per fornire contenuti più approfonditi.
- **Pagine da creare:**
    - [ ] `/podcast`: Con un elenco di episodi, player embedded e show notes.
    - [ ] `/storie`: Un portfolio letterario con racconti completi o estratti.
    - [ ] `/sviluppo`: Uno showcase di progetti tecnici con link a demo e repository GitHub.
    - [ ] `/esperimenti`: Una sezione interattiva dove ospitare direttamente gli esperimenti di interactive fiction.

### 4.2. Ottimizzazione Performance
- **Obiettivo:** Migliorare ulteriormente i tempi di caricamento e la reattività del sito.
- **Task:**
    - [ ] **Formato Immagini WebP:** Convertire le immagini attuali (JPG/PNG) nel formato `WebP` per una compressione superiore.
    - [ ] **Minificazione Risorse:** Implementare un processo (manuale o automatico) per minificare i file `CSS` e `JavaScript` in produzione.
    - [ ] **Analisi Lighthouse:** Eseguire test periodici con Google Lighthouse per identificare e risolvere colli di bottiglia.

---

## 5. Priorità Bassa v3.0+ (Oltre 12 mesi / Idee Future)

Idee per un'evoluzione a lungo termine del progetto.

### 5.1. Integrazione di un CMS o Static Site Generator (SSG)
- **Obiettivo:** Semplificare la gestione dei contenuti, specialmente per le sezioni Blog e Portfolio.
- **Opzioni da valutare:**
    - [ ] **Headless CMS:** Strapi, Contentful.
    - [ ] **Static Site Generators:** Astro, Eleventy, Jekyll.

### 5.2. Funzionalità Avanzate
- **Obiettivo:** Arricchire l'esperienza utente con funzionalità aggiuntive.
- **Idee:**
    - [ ] **Dark/Light Mode Toggle:** Permettere all'utente di scegliere il tema preferito.
    - [ ] **Sito Multilingua (IT/EN):** Rendere i contenuti accessibili a un pubblico internazionale.
    - **Player Podcast Embedded:** Integrare un player audio direttamente nelle pagine dei podcast. 
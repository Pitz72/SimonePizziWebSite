# Simone Pizzi - Portfolio Creativo

Questo repository contiene il codice sorgente del portfolio personale di Simone Pizzi, un sito web dedicato a presentare i suoi lavori creativi nel campo della narrativa, dei videogiochi e delle applicazioni che esplorano l'intersezione tra arte e intelligenza artificiale.

## Panoramica del Progetto

Il sito è una Single Page Application (SPA) moderna e reattiva, progettata per offrire un'esperienza utente fluida e coinvolgente. Presenta una struttura modulare con componenti riutilizzabili e un sistema di routing basato sull'hash dell'URL per una navigazione dinamica tra le diverse sezioni del portfolio.

## Tecnologie Utilizzate

*   **Framework Frontend**: React (versione 18.2.0)
*   **Linguaggio**: TypeScript
*   **Build Tool**: Vite (versione 5.0.0)
*   **Styling**: Tailwind CSS
*   **Routing**: Custom hook `useHashNavigation` per routing basato sull'hash.
*   **Gestione Dati**: Dati del portfolio strutturati in `src/data/portfolioData.ts`.

## Struttura del Progetto (Root)

```
.
├── backup/                   # Versioni archiviate (escluse da Git)
│   └── SimonePizzi/         # Siti HTML e React precedenti
├── public/                   # Risorse statiche
│   ├── favicon.png          # Favicon personalizzato
│   └── images/              # Immagini portfolio
├── src/                      # Codice sorgente React
│   ├── components/          # Componenti riutilizzabili
│   ├── data/                # Dati portfolio (portfolioData.ts)
│   ├── utils/               # Utility e hooks
│   ├── App.tsx              # Componente principale e routing
│   ├── index.css            # Stili globali Tailwind
│   └── index.tsx            # Entry point
├── docs/                     # Documentazione e log modifiche
│   ├── 1.0.5.md            # Log archiviazione versioni
│   └── 1.0.6.md            # Log aggiornamenti videogiochi
├── index.html               # File HTML principale
├── package.json             # Dipendenze e script
└── README.md                # Questo file
```

## Stato di Sviluppo Attuale

Il progetto è in fase di sviluppo attivo e miglioramento continuo. Le funzionalità principali sono implementate e operative.

### Funzionalità Implementate:
*   **Visualizzazione Portfolio**: Presentazione dei lavori suddivisi per categorie (Videogiochi, Progetti Software, Narrativa e Pubblicazioni).
*   **Routing Hash-based**: Navigazione tra le sezioni del portfolio tramite l'hash dell'URL.
*   **Componenti Riutilizzabili**: Header, Footer, Hero section e modali per dettagli dei progetti.
*   **Design Reattivo**: Layout ottimizzato per diverse dimensioni di schermo.
*   **Animazioni**: Effetti di transizione e animazioni per migliorare l'esperienza utente.

### Aggiornamenti Recenti (Versione 1.0.7 - 23 Novembre 2025):

#### **SEO & Metadati**
*   **Implementazione Completa**: Integrazione di `react-helmet-async` per la gestione dinamica dei tag `<head>`.
*   **Titoli Dinamici**: Ogni pagina ora ha un titolo specifico (es. "Videogiochi | Simone Pizzi").
*   **Social Ready**: Aggiunti meta tag Open Graph e Twitter Cards per anteprime social ottimizzate.

#### **Visual Overhaul (Restyling Grafico)**
*   **Animazioni Premium**: Migrazione a `framer-motion` per transizioni fluide e professionali.
*   **Hero Section Dinamica**: Effetto "Typewriter" sul titolo principale e animazioni di entrata sequenziali.
*   **Sfondo Interattivo**: Le particelle ora reagiscono al movimento del mouse e formano costellazioni dinamiche.
*   **Card 3D**: Effetto Tilt e Glassmorphism migliorato sulle card dei progetti.

#### **UX & Contenuti**
*   **Navigazione Migliorata**: Scroll Progress Bar e pulsante "Back To Top".
*   **Lettera alla Community**: Nuova modale dedicata per il progetto "The Safe Place" con lettera aperta ai sostenitori.
*   **Routing Moderno**: Migrazione a `react-router-dom` per una gestione più robusta della navigazione.

### Modifiche Precedenti (Versione 1.0.6):
*   **Espansione Videogiochi**: Aggiunti "LEMMONS" e "PixelDebh".
*   **Riorganizzazione Repository**: Archiviazione versioni precedenti.

### Log delle Modifiche Completi:
*   **[1.0.7.md](docs/1.0.7.md)**: SEO, Visual Overhaul & Community Content
*   **[1.0.6.md](docs/1.0.6.md)**: Espansione sezione Videogiochi, favicon personalizzato e build finale
*   **[1.0.5.md](docs/1.0.5.md)**: Archiviazione versioni precedenti e riorganizzazione repository

## Sviluppo Locale

### Prerequisiti

*   [Node.js](https://nodejs.org/) (v18 o superiore)
*   [npm](https://www.npmjs.com/) (o il tuo gestore di pacchetti preferito)

### Installazione

1.  **Clona il repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Installa le dipendenze:**
    ```bash
    npm install
    ```

### Avvio del Server di Sviluppo

Per avviare il server di sviluppo locale con hot-reloading:

```bash
npm run dev
```

L'applicazione sarà disponibile all'indirizzo `http://localhost:5173` (o una porta simile).

### Build per la Produzione

Per creare una build ottimizzata per la produzione:

```bash
npm run build
```

I file di output saranno generati nella directory `dist/`. Puoi visualizzare l'anteprima della build di produzione localmente con `npm run preview`.
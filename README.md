# Simone Pizzi - Portfolio Creativo (v1.1.1)

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
*   **Routing Dinamico**: URL specifici per ogni progetto per facilitare la condivisione.
*   **Condivisione Social**: Integrazione diretta per condividere i progetti su Facebook, X, LinkedIn, WhatsApp e Telegram (implementata con React Portal per UX ottimale).
*   **SEO Ottimizzato**: Meta tag dinamici per ogni pagina e progetto.
*   **Animazioni**: Effetti di transizione e animazioni per migliorare l'esperienza utente.

### Aggiornamenti Recenti (Versione 1.1.1 - 6 Dicembre 2025):
*   **Refactoring Modulare**: Suddivisione di componenti monolitici in unità più piccole (`ProjectList`, `ProjectDetail`, `FeaturedCard`).
*   **Routing Dinamico**: Implementazione di URL specifici per ogni progetto.
*   **Condivisione Social**: Nuova funzionalità per condividere i progetti sui social network.
*   **Contenuti Aggiornati**: Disponibile il download in formato EPUB per "Frequenza di Servizio".
*   **Supporto**: Nuova sezione nel footer per sostenere il progetto tramite PayPal.

### Aggiornamenti Recenti (Versione 1.1.0 - 4 Dicembre 2025):

#### **Narrativa & Home Page Revolution**
*   **Nuova Sezione**: Attivata "Narrativa e Pubblicazioni" con il racconto inedito "Frequenza di Servizio".
*   **Contenuti**: Scheda "FREQUENZA DI CHIAMATA" con download PDF e cross-link a "Il Relitto Silente".
*   **Home Page**: Nuovo layout a 3 colonne (Frequenza, Relitto, Podcast) per massimizzare la visibilità delle novità.

### Modifiche Precedenti (Versione 1.0.9):
*   **Podcast**: Nuova sezione "Podcast, Radio e Altro" con storia di Runtime Radio.
*   **Home Page**: Primo restyling della sezione aggiornamenti.

### Log delle Modifiche Completi:
*   **[1.1.0.md](docs/1.1.0.md)**: Narrativa & Home Page Revolution
*   **[1.0.9.md](docs/1.0.9.md)**: Podcast & Storytelling Expansion
*   **[1.0.8.md](docs/1.0.8.md)**: Il Relitto Silente: Gold Master & Desktop Release
*   **[1.0.7.md](docs/1.0.7.md)**: SEO, Visual Overhaul & Community Content
*   **[1.0.6.md](docs/1.0.6.md)**: Espansione sezione Videogiochi, favicon personalizzato e build finale

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
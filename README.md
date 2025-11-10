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
├── public/                   # Risorse statiche (es. favicon, immagini)
├── src/                      # Codice sorgente dell'applicazione React
│   ├── components/           # Componenti React riutilizzabili (Header, Footer, Hero, Modal, PortfolioGrid, PortfolioShowcase)
│   ├── data/                 # Dati dell'applicazione (es. portfolioData.ts)
│   ├── utils/                # Utility e hooks personalizzati (es. navigation.ts)
│   ├── App.tsx               # Componente principale dell'applicazione e gestore del routing
│   ├── index.css             # Stili globali e Tailwind CSS
│   └── index.tsx             # Punto di ingresso dell'applicazione React
├── index.html                # File HTML principale
├── package.json              # Dipendenze e script di progetto
├── postcss.config.js         # Configurazione PostCSS
├── tailwind.config.js        # Configurazione Tailwind CSS
├── tsconfig.json             # Configurazione TypeScript
├── vite.config.ts            # Configurazione Vite
└── README.md                 # Questo file
```

## Stato di Sviluppo Attuale

Il progetto è in fase di sviluppo attivo e miglioramento continuo. Le funzionalità principali sono implementate e operative.

### Funzionalità Implementate:
*   **Visualizzazione Portfolio**: Presentazione dei lavori suddivisi per categorie (Videogiochi, Progetti Software, Narrativa e Pubblicazioni).
*   **Routing Hash-based**: Navigazione tra le sezioni del portfolio tramite l'hash dell'URL.
*   **Componenti Riutilizzabili**: Header, Footer, Hero section e modali per dettagli dei progetti.
*   **Design Reattivo**: Layout ottimizzato per diverse dimensioni di schermo.
*   **Animazioni**: Effetti di transizione e animazioni per migliorare l'esperienza utente.

### Modifiche Recenti e Miglioramenti:
*   **Ingrandimento Immagine Hero**: L'immagine principale nella sezione Hero è stata ingrandita del 75% per maggiore impatto visivo.
*   **Pulsante GitHub nell'Header**: Aggiunto un pulsante "IL MIO GITHUB" nell'header per un accesso rapido al profilo GitHub.
*   **Miglioramento Modale**: Il componente modale è stato ottimizzato per essere sempre visibile al centro della viewport, indipendentemente dallo scroll della pagina, e ora si chiude cliccando all'esterno. Il problema di posizionamento verticale che richiedeva lo scroll della pagina è stato risolto.
*   **Sezione Videogiochi Completata**: Tutte le immagini di copertina sono state importate e applicate. Le descrizioni dei videogiochi sono state formattate per una migliore leggibilità, e il box di testo della descrizione è stato esteso orizzontalmente.
*   **Sezione Progetti Software (Favella 1)**: Immagine di copertina importata e applicata. Descrizione formattata per una migliore leggibilità. Aggiunto pulsante GitHub.
*   **Header Aggiornato**: Aggiunta voce "Home". Voci "Narrativa e Pubblicazioni" e "Podcast, Radio e Altro" rese temporaneamente inaccessibili.
*   **Home Page Aggiornata**: L'anteprima di "L'Albero dei Racconti" è stata sostituita con quella di "IL RELITTO SILENTE".
*   **Sezione "Ultimi Aggiornamenti"**: La sezione "Progetti in evidenza" è stata rinominata in "Ultimi Aggiornamenti" con un testo descrittivo aggiornato.
*   **Sezione "Contattami"**: Aggiunta una nuova sezione "Contattami" con testo esortativo e pulsanti per GitHub e email.
*   **Footer Aggiornato**: Rimossa la seconda riga di testo nel footer.
*   **Build e Anteprima**: Il processo di build (`npm run build`) e il server di anteprima (`npm run preview`) sono stati eseguiti con successo.

### Log delle Modifiche:
*   **1.0.4.md**: Documenta gli ultimi aggiornamenti, il successo del build e del server di anteprima.

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
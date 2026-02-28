# Simone Pizzi - Portfolio Creativo

![Version](https://img.shields.io/badge/version-1.2.0-green.svg)
![React](https://img.shields.io/badge/react-v19.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-v5.5.3-blue.svg)
![Vite](https://img.shields.io/badge/vite-v7.3.1-646cff.svg)
![Tailwind](https://img.shields.io/badge/tailwindcss-v4.0.0-38bdf8.svg)

Una Single Page Application (SPA) moderna, reattiva e orientata allo storytelling, sviluppata con **React** e **Tailwind CSS**. Il sito funge da mio **portfolio e hub personale**, raccontando una selezione molto filtrata dei miei esperimenti passati con la logica da "archivio".

## Ultimi Aggiornamenti (v1.2.0)
*   **Premium UI Upgrade:** Refactoring estetico avanzato sfruttando Tailwind v4 (text-balance, effetti ring luminosi dinamici, Glassmorphism immersivo su modali ed header).
*   **Nuovo Motore Compilativo (Bleeding Edge):** Passaggio a React 19 e Vite 7 per prestazioni super-moderne, sganciati da PostCSS.
*   **Cleanup Massivo:** Sradicamento di backup obsoleti e rilocazione strutturata index-driven dei moduli sorgenti (Zero-Pollution root directory).

## Panoramica del Progetto

Il sito è una Single Page Application (SPA) moderna e reattiva, progettata per offrire un'esperienza utente fluida e coinvolgente. Presenta una struttura modulare con componenti riutilizzabili e un sistema di routing basato sull'hash dell'URL per una navigazione dinamica tra le diverse sezioni del portfolio.

## Indice Generale della Documentazione

Per una consultazione **scientifica e gerarchica** dello stato del sistema, dei log storici e delle analisi di sistema, fai sempre riferimento al **[Master Index della Documentazione](docs/README.md)**.


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
├── docs/                     # Documentazione Master
│   ├── README.md            # Indice Gerarchico di Tutta la Documentazione
│   ├── project_status.md    # Log Analisi Stato Progetto
│   └── changelogs/          # Archivio storico puntuale
├── index.html               # File HTML principale
├── package.json             # Dipendenze e script
└── README.md                # Questo file
```

## Stato di Sviluppo Attuale

Il progetto è in fase di sviluppo attivo e miglioramento continuo. La piattaforma è stabile e l'enfasi è posta sull'aggiornamento modulare dei contenuti.

### Funzionalità Implementate:
*   **Data-Driven Content Engine**: Nessun contenuto è cablato. Titoli, immagini, tag, link esterni e descrizioni passano interamente da `portfolioData.ts` per estrema manutenibilità.
*   **Visualizzazione Portfolio**: Presentazione dei lavori suddivisi per categorie (Videogiochi, Progetti Software, Narrativa e Pubblicazioni).
*   **Motore Ponderato di Evidenza**: Gestione della Home e dei riquadri tramite attributi di ordinamento (`featuredOrder`).
*   **Routing Hash-based**: Navigazione tra le sezioni del portfolio e URL specifici per facilitare la condivisione.
*   **Condivisione Social**: Integrazione diretta per condividere i progetti su Facebook, X, LinkedIn, WhatsApp e Telegram.
*   **SEO Ottimizzato**: Meta tag dinamici (`react-helmet-async`) per ogni pagina e progetto.
*   **Animazioni**: Transizioni morbide per migliorare la UX nativa (`framer-motion`).

### Aggiornamenti Recenti (Versione 1.1.4 - 28 Febbraio 2026):
*   **Refactoring Architetturale e Pulizia**: Rimozione chirurgica di file temporanei obsoleti, magazzini `/import` crudi, cache `/backup` e orfani (`rlm.png`).
*   **Gestione Documentale (Master Index)**: Creazione della dashboard `docs/README.md` per ispezione documentale organica.
*   **Sanificazione del Sorgente**: Riorganizzata la Root project espellendo lo shadow-code clonato al di fuori in `src/` e centralizzando gli automatismi in `scripts/`. L'intero log dettagliato è consultabile in `docs/changelogs/1.1.4.md`.

### Aggiornamenti Recenti (Versione 1.1.3 - 28 Febbraio 2026):
*   **Runtime Live Machine (Reveal)**: Aggiunta del progetto di punta *Runtime Live Machine* in prima posizione nella scheda Software. Il software, progettato in ecosistema web-nativo (Electron + React) è in Beta Pubblica.

### Aggiornamenti Recenti (Versione 1.1.2 - 6 Dicembre 2025):
*   **TuneUp 3.0.2**: Importante aggiornamento alla scheda software: nuova grafica, testi rivisti e link diretti al mini-sito.
*   **Home Page Rinnovata**: Esposta una selezione di 6 progetti chiave, con TuneUp in evidenza.

### Log delle Modifiche Storico Completo:
Fai riferimento a **`docs/README.md`** per sfogliare comodamente tutti i major events e i changelogs dal giorno 0 a oggi.

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
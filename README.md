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

### Aggiornamenti Recenti (Versione 1.0.6 - 13 Novembre 2025):

#### **Riorganizzazione Repository**
*   **Archiviazione Versioni Precedenti**: Creata cartella `backup/` contenente le versioni HTML e React precedenti del sito (192 MB, 9.842 file)
*   **Pulizia Repository**: Aggiornato `.gitignore` per escludere la cartella backup dal version control
*   **Focus Progetto**: Repository ora concentrato esclusivamente sul Portfolio React attivo

#### **Sezione Videogiochi - Espansione Contenuti (+100%)**
*   **LEMMONS: Una Fortuna Spenta** (3° posto - NUOVO)
    - Libro game interattivo con atmosfere thriller noir
    - Descrizione completa con sinossi, meccaniche di gioco e stato sviluppo
    - Prototipo narrativo completo, funzionalità tecniche in sviluppo
    - Tags: Libro Game, Thriller Noir, Narrativa Interattiva

*   **PixelDebh: Retro-Rescue!** (4° posto - NUOVO)
    - Platform arcade in stile anni '80/'90
    - Omaggio a PixelDebh e alla sua community YouTube
    - Sviluppato in collaborazione con LLM
    - Grafica pixel-perfect e audio chiptune procedurale
    - Tags: Platform Arcade, Retro Gaming, Pixel Art

*   **Progetti Attivi**: Da 2 a 4 (+100% contenuti interattivi)
*   **Ordine Finale**: The Safe Place Chronicles → Il Relitto Silente → LEMMONS → PixelDebh → Il Respiro (disabilitato)

#### **Personalizzazione e Finalizzazione**
*   **Favicon Personalizzato**: Creato `favicon.png` utilizzando la foto del profilo
*   **Titolo Aggiornato**: "Simone Pizzi | Portfolio Creativo"
*   **Build di Produzione**: Completata con successo (820ms, 0 errori)
    - HTML: 1.15 kB (gzip: 0.55 kB)
    - CSS: 34.04 kB (gzip: 6.31 kB)
    - JS: 187.25 kB (gzip: 61.37 kB)

### Modifiche Precedenti (Versione 1.0.4):
*   **Ingrandimento Immagine Hero**: Immagine principale ingrandita del 75%
*   **Pulsante GitHub nell'Header**: Accesso rapido al profilo GitHub
*   **Miglioramento Modale**: Ottimizzato posizionamento e chiusura
*   **Sezione Progetti Software**: Favella 1 con descrizione completa
*   **Sezione "Contattami"**: Nuova sezione con pulsanti GitHub e email
*   **Footer Aggiornato**: Rimossa seconda riga di testo

### Log delle Modifiche Completi:
*   **[1.0.5.md](docs/1.0.5.md)**: Archiviazione versioni precedenti e riorganizzazione repository
*   **[1.0.6.md](docs/1.0.6.md)**: Espansione sezione Videogiochi, favicon personalizzato e build finale
*   **1.0.4.md**: Aggiornamenti precedenti e miglioramenti UI

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
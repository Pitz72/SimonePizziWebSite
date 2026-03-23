# Simone Pizzi - Portfolio Creativo

![Version](https://img.shields.io/badge/version-1.5.6-green.svg)
![React](https://img.shields.io/badge/react-v19.2.4-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-v5.2.2-blue.svg)
![Vite](https://img.shields.io/badge/vite-v7.3.1-646cff.svg)
![Tailwind](https://img.shields.io/badge/tailwindcss-v4.2.1-38bdf8.svg)

Una Single Page Application (SPA) moderna con Mini-CMS integrato, sviluppata con **React 19** e **Tailwind CSS v4**, con backend **PHP/SQLite** per la gestione dinamica dei contenuti. Il sito funge da portfolio e hub personale, raccontando i progetti creativi dell'autore con un'architettura ibrida frontend/backend.

Per la documentazione completa: **[Master Index della Documentazione](docs/README.md)**.

---

## Tecnologie Utilizzate

**Frontend:**
- React 19.2.4 + TypeScript 5.2.2
- Vite 7.3.1 (build tool con HMR istantaneo)
- Tailwind CSS v4.2.1 (via `@tailwindcss/vite`, senza PostCSS)
- React Router v7.13.1 (BrowserRouter con URL SEO-friendly)
- Framer Motion 12 (animazioni)
- React Helmet Async (meta tag dinamici)
- Showdown (rendering Markdown nel RichTextEditor)
- Typewriter Effect (animazione typewriter nella Hero)

**Backend:**
- PHP con layer REST API in `/public/api/`
- SQLite via PDO (`public/api/.data/database.sqlite`)
- `public/index.php`: router SEO server-side (OpenGraph, TwitterCard)
- `public/.htaccess`: Apache rewrite rules per BrowserRouter

---

## Struttura del Progetto

```
.
├── src/                      # Codice sorgente React (frontend)
│   ├── components/           # Componenti visuali (PortfolioGrid, ArticleArchive, SingleArticle, ...)
│   ├── pages/admin/          # Pannello CMS (Login, Dashboard, ArticleEditor, MediaGallery, ...)
│   ├── hooks/                # Custom hooks (useFetchArticles.ts)
│   ├── data/                 # Dati statici di fallback (portfolioData.ts, aboutMeData.ts)
│   ├── utils/                # Utility (slugify.ts)
│   ├── api.ts                # Client HTTP centralizzato
│   ├── types.ts              # Interfacce TypeScript
│   └── App.tsx               # Routing principale (public + admin)
├── public/                   # Asset statici + backend PHP
│   ├── api/                  # API REST PHP (articles, auth, media, upload, rss, ...)
│   │   └── .data/            # Database SQLite (gitignored)
│   ├── images/               # Immagini portfolio (WebP, PNG, JPG)
│   ├── index.php             # Router SEO server-side
│   └── .htaccess             # Regole Apache
├── docs/                     # Documentazione Master
│   ├── README.md             # Indice gerarchico di tutta la documentazione
│   ├── project_status.md     # Stato attuale e verifica sincronizzazione
│   ├── roadmap.md            # Sviluppi futuri pianificati
│   ├── structure_index.md    # Mappa delle directory
│   └── changelogs/           # Storico versioni dal v1.0.1 a oggi
├── scripts/                  # Utility (es. optimize_image.ps1)
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Funzionalita Implementate

**Sito Pubblico:**
- Portfolio organizzato in 5 categorie (Videogiochi, Software, Narrativa, Podcast, Blog)
- Home Page con articoli in vetrina (flag `is_featured` gestito dal CMS)
- Pagine categoria con layout Magazine (ArticleArchive)
- Pagina articolo dedicata con Hero parallax e lettura Zen (SingleArticle)
- Condivisione social integrata (Facebook, X, LinkedIn, WhatsApp, Telegram)
- Meta tag SEO dinamici via React Helmet e server-side via PHP
- RSS Feed pubblico (`/api/rss.php`)
- Animazioni con Framer Motion e sfondo particellare

**Mini-CMS Admin (`/admin`):**
- Autenticazione session-based PHP
- Editor articoli WYSIWYG con preview Markdown in real-time
- Scheduling articoli con data di pubblicazione programmabile
- Gestione Media Gallery (upload drag&drop, multi-formato: immagini, PDF, ZIP)
- Dashboard con statistiche di sistema
- Gestione password

---

## Sviluppo Locale

### Prerequisiti

- Node.js v18+
- PHP 8.x con estensione SQLite abilitata
- Server locale (es. MAMP, Laragon, XAMPP) puntato sulla root del progetto (porta 8888 o configurabile in `src/api.ts`)

### Installazione

```bash
git clone <repository-url>
cd SimonePizziWebSite
npm install
```

### Avvio

```bash
# Frontend (Vite dev server su http://localhost:5173)
npm run dev

# Il backend PHP deve girare parallelamente sul server locale
# puntato sulla cartella root del progetto
```

### Build per la Produzione

```bash
npm run build
# Output in /dist/ - da caricare sul server insieme a /public/
```

> **Nota Deploy:** Il file `public/index.php` sostituisce l'`index.html` generato da Vite in produzione. Assicurarsi che Apache abbia `mod_rewrite` attivo e che `.htaccess` sia letto correttamente.

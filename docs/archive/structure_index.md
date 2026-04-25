# Indice Strutturale del Progetto (Structure Index)

Questo documento traccia l'architettura macroscopica e la logica delle cartelle del progetto "Simone Pizzi - Portfolio Creativo". Serve come bussola per LLM, developer e architetti di sistema affinche i file non vengano generati o abbandonati in posizioni accidentali (root pollution).

---

## Struttura della Root `.`

- **`/src/`** — IL CUORE DEL PROGETTO FRONTEND. Niente codice logico deve mai esistere fuori da questa directory.
  - `/src/components/` — Tutti i componenti visuali e modali di React (PortfolioGrid, ArticleArchive, SingleArticle, Header, FeaturedCard, ecc.).
  - `/src/pages/admin/` — Pagine del pannello amministrativo (Login, Dashboard, ArticleEditor, ArticlesList, MediaGallery, Settings).
  - `/src/hooks/` — Custom React hooks (es. `useFetchArticles.ts` per il fetching live delle API).
  - `/src/data/` — `portfolioData.ts` e `aboutMeData.ts`: dati statici di fallback e Source of Truth legacy.
  - `/src/utils/` — Funzioni agnostiche (es. `slugify.ts`).
  - `src/api.ts` — Client HTTP centralizzato per tutte le chiamate al backend PHP.
  - `src/types.ts` — Definizioni delle interfacce TypeScript (Category enum, PortfolioItem).

- **`/public/`** — ASSET STATICI + BACKEND PHP.
  - `/public/api/` — Layer REST in PHP (articles.php, auth.php, db.php, media.php, upload.php, rss.php, stats.php, settings.php, auth_helper.php).
  - `/public/api/.data/` — Cartella protetta contenente `database.sqlite` (gitignored, accesso bloccato da `.htaccess` interno).
  - `/public/uploads/` — File caricati tramite la Media Gallery (immagini, PDF, ZIP, MP3). Creata automaticamente al primo upload.
  - `/public/images/` — Copertine dei progetti e artwork statici (WebP, PNG, JPG ottimizzati).
  - `public/index.php` — Router backend: intercetta ogni URL, inietta meta tag SEO server-side per i crawler, poi serve la SPA React.
  - `public/.htaccess` — Regole Apache: routing BrowserRouter, protezione DB, redirect HTTPS.
  - `public/robots.txt` — Direttive per i motori di ricerca.
  - `public/favicon.png` — Favicon del sito.

- **`/docs/`** — IL CUORE DELLA DOCUMENTAZIONE. Qualsiasi file markdown, piano testuale e archivio di sistema risiede qui.
  - `README.md` — Il Master Index della documentazione (punto di ingresso).
  - `project_status.md` — Lo snapshot architetturale e la verifica di sincronizzazione piu recente.
  - `structure_index.md` — Questo file.
  - `roadmap.md` — Sviluppi futuri pianificati.
  - `/docs/changelogs/` — Storico lineare delle versioni dal v1.0.1 a oggi.

- **`/scripts/`** — CASSETTA DEGLI ATTREZZI. Utility esterne al compilatore e script di manutenzione DB.
  - `optimize_image.ps1` — Script PowerShell per ottimizzazione immagini bulk.
  - `init_db.php` — Schema completo del database SQLite (tutte e 6 le tabelle + utente admin iniziale). **NON deployare**: usare solo come riferimento per disaster recovery o setup da zero. Eseguire localmente o via FTP temporaneo sul server, poi cancellare subito.

- **`/dist/`** — Output della build di produzione generato da Vite (`npm run build`). Non editare manualmente.

- **File di Configurazione in Root:**
  - `package.json` — Dipendenze NPM e script (`dev`, `build`, `preview`). Lo script `postbuild` esegue `clean-dist.js` per pulizia automatica dopo ogni build.
  - `clean-dist.js` — Script Node.js di pulizia post-build (rimuove file non necessari da `/dist/`).
  - `vite.config.ts` — Configurazione Vite con plugin React e `@tailwindcss/vite`.
  - `tsconfig.json` — Configurazione TypeScript.
  - `index.html` — Entry point HTML per Vite (in sviluppo); in produzione sostituito da `public/index.php`.

---

> **Regola d'Oro per gli Agenti Autonomi:** Non iniettare cartelle come `components` o file come `types.ts` nella root del progetto. Seguire l'architettura `src/`. Non abbandonare immagini pesanti in root: usare `/public/images/`. Non creare file PHP fuori da `/public/api/` (eccezione: `init_db.php` e script di manutenzione one-shot vanno in `/scripts/`). I file `tailwind.config.js` e `postcss.config.js` NON ESISTONO dal v1.1.5: Tailwind v4 e configurato esclusivamente via `@theme` in `src/index.css` e il plugin `@tailwindcss/vite`.

# Indice Master della Documentazione
**Simone Pizzi - Portfolio Creativo (v1.4.0)**

Benvenuto nell'Hub Documentale del progetto. Da qui è possibile rintracciare in modo sistematico l'intera evoluzione della codebase, esplorare le architetture, e recuperare informazioni di sistema o log del passato.

---

## 🧭 Panoramica di Sistema

| Documento | Descrizione |
| :--- | :--- |
| **[README Principale](../README.md)** | Start point del progetto, tecnologie, come fixare/runnare l'applicativo. |
| **[Stato del Progetto (project_status.md)](project_status.md)** | Diagnostica puntuale ed ispezione strutturale dell'ultima release in produzione (Architettura Data-Driven, stato componenti). |

---

### Aggiornamenti Recenti (Versione 1.5.4 - 04 Marzo 2026):
*   **Redesign CTA Articoli**: `1.5.4` (Riordino strutturale in React Flexbox per il div di fine lettura con divisione netta delle Calls-To-Action)

### Aggiornamenti Recenti (Versione 1.5.3 - 04 Marzo 2026):
*   **Fix Href Admin (HashRouter Legacy)**: `1.5.3` (Rimozione del cancelletto hardcodato nel link dell'anteprima, ripristino pieno supporto in BrowserRouter per la Dashboard)

### Aggiornamenti Recenti (Versione 1.5.2 - 04 Marzo 2026):
*   **Anteprima Bozze Admin**: `1.5.2` (Sblocco tasto anteprima per articoli in stato "Bozza" riservato agli amministratori loggati)

### Aggiornamenti Recenti (Versione 1.5.1 - 04 Marzo 2026):
*   **Fix Forensi & Blockquote**: `1.5.1` (Patch Security Upload, Typo Backend API e introduzione tool citazione nell'Editor CMS)

### Aggiornamenti Recenti (Versione 1.5.0 - 01 Marzo 2026):
*   **Feature Update & RSS**: `1.5.0` (Implementazione Feed RSS Pubblico, Schedule Articoli con data programmabile, fix UI Tailwind v4)

### Aggiornamenti Recenti (Versione 1.4.8 - 01 Marzo 2026):
*   **Hotfix Bottoni CTA e Perfomance Loading**: `1.4.8` (Rifinitura query al database e ripristino bottoni personalizzati su singoli articoli)

### Aggiornamenti Recenti (Versione 1.4.6 - 01 Marzo 2026):
*   **The Final Polish (Rifiniture)**: `1.4.6` (Hero Layout, Fast-Toggle Vetrina)

### Aggiornamenti Recenti (Versione 1.4.4 - 01 Marzo 2026):
*   **Editor Visuale WYSIWYG**: `1.4.4` (Editor Visuale WYSIWYG)

### Aggiornamenti Recenti (Versione 1.4.2 - 01 Marzo 2026):
*   **Deploy Sicuro**: `1.4.2` (Prevenzione DB Wipe)

### Aggiornamenti Recenti (Versione 1.4.1 - 01 Marzo 2026):
*   **Porting Dati Storici SQLite**: Completato il porting dei dati storici dal vecchio sistema di gestione contenuti al nuovo Mini-CMS basato su SQLite. Questo include articoli, media e configurazioni, garantendo la piena compatibilità e continuità del servizio.

### Aggiornamenti Recenti (Versione 1.4.0 - 28 Febbraio 2026):
*   **Release CMS Definitiva (Server-Side SEO e Blog)**: Il progetto Mini-CMS approda alla golden master. Attivata l'intercettazione degli "Slug Router" scritti in React tramite un solido `index.php` backend accoppiato alle Regole Server in `.htaccess`. Questo risolve alla radice il problema dei metatag SPA bloccati dai bot social e Telegram, offrendo preview dinamiche pulite su ogni articolo pubblicato. Abilitata ufficialmente e resa fruibile al pubblico la categoria navigazionale "Blog e Riflessioni", interamente domata dalle fetch API anziché dai mock statici TypeScript.

### Aggiornamenti Recenti (Versione 1.3.5 - 28 Febbraio 2026):
*   **Database Live Connection (Frontend iniezione)**: Fine Hardcoding Typescript. Sviluppato Custom Hook `useFetchArticles` per permettere a `PortfolioGrid` (La Home) e a `PortfolioShowcase` (Le macro categorie di navigazione interna) di fetchare dai server PHP. Rimosse le props di instradamento di `portfolioData` dentro `App.tsx` e attivati Spinner di caricamento fluidi. Il sito ora è ufficialmente vivo e risponde al Mini-CMS.

### Aggiornamenti Recenti (Versione 1.3.4 - 28 Febbraio 2026):
*   **Media Gallery Admin**: Esteso il Mini-CMS con l'ultimo nodo mancante. Realizzato in React il modulo visivo `MediaGallery.tsx` per il drag&drop o upload file su PHP (`upload.php`) e fetching griglia visuale con copie URL interattive. Aggancio router in `App.tsx` ed espansione nodi `api.ts`. Il Backend Admin è chiuso e funzionante.

### Aggiornamenti Recenti (Versione 1.3.3 - 28 Febbraio 2026):
*   **Admin Editor e Gestione Articoli**: Integrata la libreria `Showdown` (Gestore formattazioni Markdown). Sviluppato l'End-to-End degli Articoli in React: La vista tabellare della dashboard (`ArticlesList`), l'editor di stesura con preview in real-time (`ArticleEditor`) con configurazione per Cover, Vetrina, e Bottoni azione extra. Raccordo API completato in TypeScript per mappare interrogazioni GET, POST, PUT, DELETE verso PHP.

### Aggiornamenti Recenti (Versione 1.3.2 - 28 Febbraio 2026):
*   **Auth & Foundation React UI**: Costruite le fondamenta React del Pannello di Controllo. Generati i moduli Login, Settings (per Update Password), Dashboard e il layout protetto laterale (`AdminLayout`), tutti serviti all'URL `/admin`. Refactoring Routing `App.tsx` completato.

### Aggiornamenti Recenti (Versione 1.3.1 - 28 Febbraio 2026):
*   **Rete API Mini-CMS**: Scrittura dei controller PHP in `public/api/` per esporre all'esterno le operazioni (CRUD) dedicate agli articoli e script di upload Media cross-format (Immagini, PDF, Zip) protetti nativamente da uno strato isolato Auth-Helper. 

### Aggiornamenti Recenti (Versione 1.3.0 - 28 Febbraio 2026):
*   **Foundation Backend Mini-CMS**: Avviato il processo di transizione verso sito FullStack. Creata la directory `public/api/` con i connettori PHP `db.php` e lo schema SQLite `init_db.php` contenente tabelle per utenti, articoli, media gallery multi-formato, contatti e iscritti newsletter.

### Aggiornamenti Recenti (Versione 1.2.2 - 28 Febbraio 2026):
*   **Fix Code Smells Formali**: Migliorata aderenza allo standard lint su React.

### Aggiornamenti Recenti (Versione 1.2.1 - 28 Febbraio 2026):
*   **Refactoring Architetturale Modale "About Me"**: Estratti i testi hardcoded dal componente React `PortfolioGrid` (violazione del pattern Single Source of Truth) in un file dati separato (`aboutMeData.ts`), consolidando l'infrastruttura fully data-driven.

### Aggiornamenti Recenti (Versione 1.2.0 - 28 Febbraio 2026):
*   **Premium UI Upgrade**: Passaggio a un layout "Glassmorphism" avanzato, interattività haptic simulata via CSS e bilanciamento testuale sfruttando le ultime api di Tailwind v4 CSS-in-CSS.

### Aggiornamenti Recenti (Versione 1.1.5 - 28 Febbraio 2026):
*   **Upgrade Generazionale Motore ("Bleeding Edge" Update)**: Intero stack di dependency migrato verso le ultimissime versioni stabili rilasciate ad inizio 2026. La SPA ora gira su **React 19** e compiler **Vite 7**.
*   **Transizione Globale a Tailwind CSS v4**: Abbandonata l'architettura classica PostCSS. Il design system è stato migrato asintoticamente sul nuovo *Tailwind v4*, tramite plugin nativo `@tailwindcss/vite` e integrazione `@theme` CSS-in-CSS, ottimizzando radicalmente prestazioni, pulizia e debug di build.

## 📖 Storico delle Versioni (Release Notes)

Il progetto è versionato seguendo una rigorosa tracciabilità delle implementazioni, feature per feature. Accedi qui ai log di tutti## 📝 Cronologia delle Versioni e Note di Rilascio

Per una tracciabilità trasparente dello sviluppo, ogni aggiornamento maggiore è documentato:

- [v1.5.4 - Redesign Box CTA Lettura](changelogs/1.5.4.md)
- [v1.5.3 - Hotfix Rendering Link Anteprima](changelogs/1.5.3.md)
- [v1.5.2 - Sblocco Anteprima Bozze (Admin-Only)](changelogs/1.5.2.md)
- [v1.5.1 - Patch Sicurezza Forense & Feature Editor](changelogs/1.5.1.md)
- [v1.5.0 - Feature Update & Architettura di Pubblicazione](changelogs/1.5.0.md)
- [v1.4.8 - Hotfix Call To Action (Bottoni Articolo)](changelogs/1.4.8.md)
- [v1.4.7 - Rilascio Pulizia/Sicurezza Server](changelogs/1.4.7.md)
- [v1.4.6 - The Final Polish (Rifiniture Redesign Editoriale)](changelogs/1.4.6.md)
- [v1.4.5 - Redesign Editoriale (Da Vetrina a Magazine)](changelogs/1.4.5.md)
- [v1.4.4 - Editor Visuale WYSIWYG](changelogs/1.4.4.md)
- [v1.4.3 - Hotfix Post-Migrazione (Mapping e API)](changelogs/1.4.3.md)
- [v1.4.2 - Sicurezza Deploy (Prevenzione DB Wipe)](changelogs/1.4.2.md)
- [v1.4.1 - Porting Eredità e Dati Storici SQLite](changelogs/1.4.1.md)
- [v1.4.0 - Golden Master CMS (Blog e Server-Side SEO)](changelogs/1.4.0.md)
*   [v1.3.5 - Iniezione DB Live Frontend](changelogs/1.3.5.md)
*   [v1.3.4 - Admin Media Gallery (Mini-CMS)](changelogs/1.3.4.md)
*   [v1.3.3 - Admin Editor React (Markdown & CRUD)](changelogs/1.3.3.md)
*   [v1.3.2 - Auth & Foundation UI Component](changelogs/1.3.2.md)
*   [v1.3.1 - Rete API Principale](changelogs/1.3.1.md)
*   [v1.3.0 - Foundation Backend Mini-CMS](changelogs/1.3.0.md)

### Filone 1.2.x (Premium Design)
*   [v1.2.2 - Risoluzione Code Smell Formali (Imports/Nomenclatura)](changelogs/1.2.2.md)
*   [v1.2.1 - Refactoring Architetturale (Data-Driven Modals)](changelogs/1.2.1.md)
*   [v1.2.0 - Premium UI Experience (Tailwind v4 First Era)](changelogs/1.2.0.md)

### Filone 1.1.x (Era Architetturale e Runtime)
*   [v1.1.5 - React 19 & Tailwind v4 "Bleeding Edge" Update](changelogs/1.1.5.md)
*   [v1.1.4 - System Architecture Refactoring & Data Cleanup](changelogs/1.1.4.md)
*   [v1.1.3 - Runtime Live Machine Reveal](changelogs/1.1.3.md)
*   [v1.1.2 - Riorganizzazione Home Page e TuneUp](changelogs/1.1.2.md)
*   [v1.1.1 - Refactoring Tecnico e Consolidamento](changelogs/1.1.1.md)
*   [v1.1.0 - Narrativa & Home Page Revolution](changelogs/1.1.0.md)

### Filone 1.0.x (Scale Up da Origine)
*   [v1.0.9 - Expansion Podcast & Storytelling](changelogs/1.0.9.md)
*   [v1.0.8 - Il Relitto Silente: Gold Master](changelogs/1.0.8.md)
*   [v1.0.7 - SEO, Visual Overhaul & Community Content](changelogs/1.0.7.md)
*   [v1.0.6 - Espansione Sezione Videogiochi e Build Globale](changelogs/1.0.6.md)
*   [v1.0.5 - Log Intermedio Archiviazione](changelogs/1.0.5.md)
*   [v1.0.4 - Minor update](changelogs/1.0.4.md)
*   [v1.0.3 - Minor update](changelogs/1.0.3.md)
*   [v1.0.2 - Minor update](changelogs/1.0.2.md)
*   [v1.0.1 - Foundation Init Log](changelogs/1.0.1.md)

---
*Organics Docs Layout by Antigravity v1.0*

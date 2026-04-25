# MASTER PLAN — Simone Pizzi Portfolio Creativo

## Documento Unico di Verità

**Versione corrente:** 1.11.0  
**Ultimo aggiornamento documento:** 25 Aprile 2026 (Newsletter & Home 2.0)  
**Sito:** simonepizzi.runtimeradio.it

> Questo documento è la fonte autoritativa per lo stato del progetto, le promesse di sviluppo e la pianificazione futura.  
> Sostituisce e archivia definitivamente `roadmap.md` e `project_status.md`.

---

## PARTE I — STATO CORRENTE

### Infrastruttura

| Componente | Stato |
| :--- | :--- |
| Frontend React 19 + TypeScript 5 + Vite 7 + Tailwind v4 | ✅ Produzione |
| Backend PHP 8 + MySQL su `mysql.runtimeradio.it` | ✅ Produzione |
| Migrazione SQLite → MySQL | ✅ Completata v1.7.0 |
| Security hardening (DOMPurify, CSP, Rate limiting) | ✅ Completata |
| Ottimizzazione immagini WebP automatica (upload) | ✅ Completata v1.6.3 |
| RSS Feed pubblico | ✅ Attivo |
| SEO server-side (OpenGraph / TwitterCard via `index.php`) | ✅ Attivo |
| Recupero password via Email | ✅ Attivo v1.8.0 |

### Database — Tabelle

| Tabella | Stato |
| :--- | :--- |
| `users` | ✅ Attiva |
| `articles` | ✅ Attiva |
| `projects` | ✅ Attiva |
| `categories` | ✅ Attiva |
| `tags` | ✅ Attiva |
| `article_tags` | ✅ Attiva |
| `article_views` | ✅ Attiva (analytics) |
| `cta_clicks` | ✅ Attiva (analytics) |
| `subscribers` | ✅ Attiva (Newsletter) |
| `messages` | ✅ Attiva (Contatti) |
| `password_resets` | ✅ Attiva (v1.8.0) |

---

## PARTE II — FUNZIONALITÀ REALIZZATE ✅

Elenco sintetico delle funzionalità core e miglioramenti completati:

- ✅ **[P0-01]** Fix anteprime social (OpenGraph dinamico)
- ✅ **[P0-02]** Stabilità URL articoli e GUID RSS stabile
- ✅ **[P1-01]** Pulsante RSS permanente (Header, Footer, Articoli)
- ✅ **[P1-02]** Pagina Contatti e form messaggi reale
- ✅ **[P1-03]** Sistema Newsletter (Iscrizione + Compositore Admin + Invio massivo)
- ✅ **[P1-04]** Data/ora e categoria nelle anteprime articoli
- ✅ **[P2-01]** Editor WYSIWYG: Toolbar sticky, shortcut Ctrl+K, Media Selector, Link Interni
- ✅ **[P2-02]** Lista articoli admin: Riequilibrio colonne e badge categorie
- ✅ **[P2-03]** Switch Link/Email nei CTA (Article & Project Editor)
- ✅ **[P2-04]** Gestore Tag Dinamici (Database-driven)
- ✅ **[P3-01]** Paginazione backend-driven (Load More)
- ✅ **[P3-02]** Motore di ricerca interno globale (Ctrl+K)
- ✅ **[P3-03]** Recupero password / login via email (v1.8.0)
- ✅ **[P3-04]** Sistema di backup automatico e manuale (MySQL)
- ✅ **[P3-05]** Migrazione Editor a Tiptap (v1.8.1)
- ✅ **[P3-08]** Dirty State Warning & Router Refactor (createBrowserRouter) (v1.8.4)
- ✅ **[P3-09]** Paginazione e Ricerca Avanzata nel Backend (v1.8.5)
- ✅ **[P1-05]** Prerendering Statico con Iniezione SEO (v1.9.0)
- ✅ **[P2-05]** Ottimizzazione Bundle & Code Splitting (v1.9.1)
- ✅ **[P2-06]** Refactor Data Loaders (React Router 7)
- ✅ **[P3-10]** Dashboard Analytics Visuale con Chart.js (v1.9.2)
- ✅ **[P3-11]** Sistema Recupero Bozze Locale (LocalStorage Recovery)
- ✅ **[P3-12]** Transizioni Fluide tra Pagine (Framer Motion)
- ✅ **[P4-01]** Ottimizzazioni Forensi delle Performance (v1.9.3)
- ✅ **[P4-02]** Sitemap & Robots Dinamici via PHP (v1.9.4)
- ✅ **[P4-03]** Hotfix Routing SEO & Stabilizzazione .htaccess (v1.9.5)
- ✅ **[P4-04]** Generazione fisica robots.txt e sitemap.xml via Prerender (v1.9.6)
- ✅ **[P1-06]** Consolidamento CTA (Community Hub) & Refactor Contatti (v1.10.0)
- ✅ **[P1-07]** Allineamento Schema MySQL & Fix Errori Backend (v1.10.1)
- ✅ **[P1-08]** Sottocategorie Gerarchiche & Header Dropdown (v1.10.2)
- ✅ **[P2-07]** Gestione Admin Sottocategorie (v1.10.3)
- ✅ **[P2-08]** Integrazione Sottocategorie nei Filtri & Progetti (v1.10.3)
- ❌ **[P3-06]** Audio Player nativo fluttuante (Escluso)
- ❌ **[P3-07]** Dark/Light Mode (Escluso - Identità Solo Dark)

- ✅ **Menu Mobile:** Hamburger e drawer ottimizzato

---

## PARTE III — BACKLOG / DA IMPLEMENTARE 🔲

Voci attive ordinate per priorità.

---

### 🟠 PRIORITÀ ALTA

Nessuna voce pendente.

### 🔵 PRIORITÀ BASSA / LUNGO TERMINE

Nessuna voce pendente.

---

## PARTE V — NOTE DI INTEGRAZIONE ESTERNA

### Titan Desktop (Bot Telegram)

- **Stato:** Sincronizzato. GUID RSS stabile garantisce che il bot non pubblichi duplicati anche in caso di cambio URL.
- **Regola:** Non modificare URL di articoli già pubblicati. In caso di refactor, usare redirect 301 in `.htaccess`.

---

## PARTE VI — GESTIONE CRISI E ROLLBACK

### Incidente Restyling v1.8.x (21 Aprile 2026)

- **Evento:** Fallimento tentativo di reskin totale con perdita di contenuti bio e testi legali.

- **Azione:** Rollback al commit `87cb0c` (v1.7.13).
---

### Incidente SEO Robots v1.9.6 (23 Aprile 2026)

- **Evento:** Nonostante la generazione fisica e lo smart-fallback, `robots.txt` continua a restituire 404 (React), mentre `sitemap.xml` funziona correttamente.
- **Diagnosi Live:** Confermata tramite browser agent. Il server ignora selettivamente il rewrite/file fisico per robots.
- **Stato:** Investigazione aperta. Documentazione dettagliata in `docs/changelogs/v1.9.6.md`.
- **Mitigazione:** Implementato `ErrorBoundary` (RootBoundary) per gestire i fallimenti con una UI personalizzata.

---

### Incidente Migrazione MPA (25 Aprile 2026)

- **Evento:** Tentativo di "dereactizzazione" totale per trasformare il sito in una MPA PHP pura con Tailwind 4 e Vanilla JS.
- **Motivazione:** Ricerca di performance estreme e semplificazione architetturale.

- **Esito:** Operazione abortita. La complessità del porting di tutte le funzionalità React (Admin, Editor, Analytics) è risultata eccessiva e "dolorosa" rispetto ai benefici immediati.
---

### Versione 1.11.0 (25 Aprile 2026) — Consolidamento e Nuove Funzioni

- **Newsletter Admin:** Implementata approvazione manuale (PATCH) e inserimento diretto admin (POST + force_confirm). Interfaccia potenziata con form rapido e tasti d'azione.
- **Home Page 2.0:** Aggiunta sezione "Ultimi Progetti" (Hero + Grid), rinominato Hub di contatto in "Entriamo in Contatto" e ottimizzati i padding verticali.
- **Bug Fix Critico:** Risolto crash 404 sulle card progetti tramite refactoring del componente `FeaturedCard` in modalità non-link con pulsanti d'azione reali.
- **Build:** Versione stabilizzata e verificata tramite build di produzione.

---

## PARTE VII — GUIDA OPERAZIONALE: PRERENDERING SEO

### Workflow Prerendering (Post-Deploy)

Il prerendering **NON avviene durante il build locale** bensì **dopo il deploy**:

- Backend PHP deve essere online e raggiungibile
- Richiede accesso ai dati MySQL del sito live
- Genera file HTML da ~30+ articoli (tempo: ~30-60 secondi)
- **Genera file fisici robots.txt e sitemap.xml nella root**

### Procedura Step-by-Step

**1. Build e deploy normale:**

```bash
npm run build
# Upload dist/ su FTP → simonepizzi.runtimeradio.it/
```

**2. Accedi da browser e triggera il prerendering:**

```http
URL: https://simonepizzi.runtimeradio.it/api/prerender.php
Prerequisito: Devi essere loggato all'admin
Risultato: Response JSON con "Prerendering con iniezione SEO completato"
```

**3. Verifica risultato:**

- File system: `/dist/videogiochi/`, `/dist/progetti-software/`, ecc. contengono `index.html` statici
- Google: `site:simonepizzi.runtimeradio.it` per verificare indexing
- Search Console: Monitora nuova sitemap

### File di Sistema

| File | Ruolo |
| :--- | :--- |
| `public/api/prerender.php` | Script PHP principale (ESEGUIBILE DAL BROWSER) |
| `prerender-routes.js` | Helper Node scoperta route (opzionale) |
| `prerender.js` | Helper Node generazione file (opzionale) |

---

## ALLEGATO A — ARCHITETTURA DEL PROGETTO

Questo allegato consolida le regole strutturali del progetto per garantire coerenza tra frontend e backend.

| Directory | Descrizione |
| :--- | :--- |
| **`/src/`** | **Core Frontend (React 19)**. Contiene componenti, custom hook, pagine, tipi e utility. Niente codice logico deve risiedere fuori da qui. |
| **`/public/`** | **Assets & Entry Point**. Contiene `index.php` (SEO server-side) e gli asset statici (immagini, favicon). |
| **`/public/api/`** | **Backend REST PHP**. Layer di comunicazione con il database MySQL. Include endpoint per articoli, newsletter, ecc. |
| **`/public/uploads/`** | **Media CMS**. Directory dinamica per i file caricati tramite l'area admin (WebP, PDF, ZIP). |
| **`/docs/`** | **Documentazione**. Contiene il Master Plan, l'archivio storico e i changelog. |
| **`/scripts/`** | **Tooling**. Script di manutenzione, ottimizzazione immagini e setup. |
| **`/dist/`** | **Production Build**. Output generato da Vite (`npm run build`). |

---
*Documento mantenuto da Simone Pizzi.*

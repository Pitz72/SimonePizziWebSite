# MASTER PLAN — Simone Pizzi Portfolio Creativo

## Documento Unico di Verità

**Versione corrente:** 1.10.1  
**Ultimo aggiornamento documento:** 24 Aprile 2026 (Database Schema Alignment)  
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
- ✅ **[P3-10]** Dashboard Analytics Visuale con Chart.js (v1.9.2)
- ✅ **[P4-01]** Ottimizzazioni Forensi delle Performance (v1.9.3)
- ✅ **[P4-02]** Sitemap & Robots Dinamici via PHP (v1.9.4)
- ✅ **[P4-03]** Hotfix Routing SEO & Stabilizzazione .htaccess (v1.9.5)
- ✅ **[P4-04]** Generazione fisica robots.txt e sitemap.xml via Prerender (v1.9.6)
- ✅ **[P1-06]** Consolidamento CTA (Community Hub) & Refactor Contatti (v1.10.0)
- ✅ **[P1-07]** Allineamento Schema MySQL & Fix Errori Backend (v1.10.1)

- ✅ **Menu Mobile:** Hamburger e drawer ottimizzato

---

## PARTE III — BACKLOG / DA IMPLEMENTARE 🔲

Voci attive ordinate per priorità.

### ✅ COMPLETATE RECENTEMENTE (v1.8.6)

#### [P1-05] Risoluzione Indexing Google (SEO)

**COMPLETATO** — Implementazione Prerendering Statico (22 Aprile 2026)

- **Soluzione implementata:** Script PHP `/api/prerender.php` che genera HTML statico per tutte le route.
- **Come funziona:**
  1. Admin accede a `/api/prerender.php` (protetto da autenticazione)
  2. Lo script recupera tutte le categorie e articoli dal database MySQL
  3. Cattura l'output di `index.php` per ogni rotta e lo salva in un file `index.html` dedicato.
  4. Es: `/videogiochi/titolo-articolo/index.html` contiene l'HTML pre-renderizzato con Meta Tag dinamici.
- **Effetto:** Google trova HTML statico con metadati già pronti, non javascript CSR. Indicizzazione garantita.
- **Flusso:**
  - Build locale: `npm run build` (senza prerendering, veloce)
  - Deploy: Carica `dist/` su FTP
  - Post-deploy: Esegui `/api/prerender.php` dal browser (5 minuti per generare ~30+ HTML)
- **File creati:**
  - `public/api/prerender.php` — Script di generazione
  - `prerender-routes.js`, `prerender.js` — Helper Node per sviluppatori (opzionali, per uso locale)
- **Analisi completa:** Vedere [indicizzazione.google.md](file:///C:/Users/Utente/Documents/GitHub/SITI-WEB/SimonePizziWebSite/docs/indicizzazione.google.md).

---

### 🟠 PRIORITÀ ALTA

(Nessuna nuova priorità alta al momento. La Q2 2026 è focalizzata su SEO tramite prerendering e performance optimization.)

#### [P2-05] Ottimizzazione Bundle & Code Splitting
- **STATO:** COMPLETATO ✅ (v1.9.1)

#### [P2-06] Refactor Data Loaders (React Router 7)
- **STATO:** COMPLETATO ✅

### 🔵 PRIORITÀ BASSA / LUNGO TERMINE

#### [P3-10] Dashboard Analytics Visuale
- **STATO:** COMPLETATO ✅ (v1.9.2)

#### [P3-11] Auto-Save & Draft System
- **Obiettivo:** Implementare il salvataggio automatico in background per gli editor per prevenire perdite accidentali di dati oltre al Dirty State Warning.

#### [P3-12] Transizioni Fluide tra Pagine
- **Obiettivo:** Migliorare la UX premium con transizioni animate tra le rotte sfruttando le API di React Router.



---

## PARTE IV — FEATURE CANCELLATE / ESCLUSE ❌

Funzionalità rimosse dalla pianificazione perché non coerenti con la visione del progetto:

- ❌ **[P3-06] Audio Player nativo fluttuante:** Considerata superflua per la tipologia di contenuti del sito.
- ❌ **[P3-07] Dark/Light Mode:** Il sito mantiene un'identità visiva esclusivamente **Dark**. Non verrà implementato il selettore di modalità chiara.

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
```
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
|---|---|
| `public/api/prerender.php` | Script PHP principale (ESEGUIBILE DAL BROWSER) |
| `prerender-routes.js` | Helper Node scoperta route (opzionale) |
| `prerender.js` | Helper Node generazione file (opzionale) |

---
*Documento mantenuto da Simone Pizzi.*

# MASTER PLAN — Simone Pizzi Portfolio Creativo

## Documento Unico di Verità

**Versione corrente:** 1.8.4  
**Ultimo aggiornamento documento:** 22 Aprile 2026  
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


- ✅ **Menu Mobile:** Hamburger e drawer ottimizzato

---

## PARTE III — BACKLOG / DA IMPLEMENTARE 🔲

Voci attive ordinate per priorità.

### 🟠 PRIORITÀ ALTA

#### [P1-05] Risoluzione Indexing Google (SEO)

- **Problema:** Solo 1 articolo su 30 è indicizzato. Google ha difficoltà con il Client-Side Rendering della SPA.
- **Soluzione:** Implementazione **Prerendering statico** (tramite plugin Vite come `vite-plugin-prerender` o `vite-ssg`) per generare HTML statico per i bot dei motori di ricerca.
- **Analisi completa:** Vedere [indicizzazione.google.md](file:///C:/Users/Utente/Documents/GitHub/SITI-WEB/SimonePizziWebSite/docs/indicizzazione.google.md).


### 🔵 PRIORITÀ BASSA / DEBITO TECNICO



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
- **Stato:** Ripristinata stabilità al 100%. Ogni futuro restyling dovrà proteggere i contenuti dinamici e le biografie statiche.

---
*Documento mantenuto da Simone Pizzi.*

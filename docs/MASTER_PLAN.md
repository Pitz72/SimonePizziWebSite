# MASTER PLAN — Simone Pizzi Portfolio Creativo
## Documento Unico di Verità

**Versione corrente:** 1.7.12  
**Ultimo aggiornamento documento:** 20 Aprile 2026  
**Sito:** simonepizzi.runtimeradio.it

> Questo documento sostituisce e consolida `roadmap.md` e `project_status.md`.  
> È la fonte autoritativa per lo stato del progetto, le promesse di sviluppo e la pianificazione futura.  
> I changelog versione per versione rimangono in `docs/changelogs/`.

---

## PARTE I — STATO CORRENTE (v1.7.9)

### Infrastruttura
| Componente | Stato |
|---|---|
| Frontend React 19 + TypeScript 5 + Vite 7 + Tailwind v4 | ✅ Produzione |
| Backend PHP 8 + MySQL su `mysql.runtimeradio.it` | ✅ Produzione |
| Migrazione SQLite → MySQL | ✅ Completata v1.7.0 |
| Security hardening (DOMPurify, CSP, Rate limiting, Session fixation) | ✅ Completata v1.5.8–1.5.10 |
| Ottimizzazione immagini WebP automatica (upload) | ✅ Completata v1.6.3 |
| RSS Feed pubblico | ✅ Attivo |
| SEO server-side (OpenGraph / TwitterCard via `index.php`) | ✅ Attivo (ma vedere P0 sotto) |

### Storico Versioni
| Versione | Data | Note |
|---|---|---|
| v1.7.12 | 20/04/2026 | Sistema di Tag Dinamici (DB-driven) e Paginazione Backend-driven per articoli |
| v1.7.11 | 20/04/2026 | Refactoring Admin UI: Shortcut Editor, ridimensionamento colonne lista articoli |
| v1.7.10 | 20/04/2026 | Sincronizzazione totale categorie dinamiche (Admin + Frontend) |
| v1.7.7 | 19/04/2026 | Data/ora+categoria anteprime; menu mobile hamburger+drawer |
| v1.7.6 | 17/04/2026 | Newsletter Footer compact; editor strip SVG + pulsante Ripulisci |
| v1.7.5 | 17/04/2026 | Icona RSS in Header (sprint A chiuso) |

### Database — Tabelle
| Tabella | Stato |
|---|---|
| `users` | ✅ Attiva |
| `articles` | ✅ Attiva |
| `projects` | ✅ Attiva |
| `categories` | ✅ Attiva |
| `article_views` | ✅ Attiva (analytics) |
| `cta_clicks` | ✅ Attiva (analytics) |
| `subscribers` | ✅ Attiva (Newsletter form e Admin) |
| `messages` | ✅ Attiva (Form Contatti e Invio mail) |

---

## PARTE II — BACKLOG CONSOLIDATO

Le voci sono ordinate per **priorità assoluta**. Ogni voce ha un ID stabile per tracciabilità.

---

### ✅ PRIORITÀ 0 — CRITICO / ROTTO — RISOLTI IN v1.7.3

#### ✅ [P0-01] Anteprima social rotta su condivisione manuale — RISOLTO v1.7.3
**Area:** SEO / OpenGraph  
**Problema:** Quando il bot Telegram pubblica automaticamente un articolo, l'immagine cover è corretta. Quando si condivide manualmente l'URL di un articolo su Telegram (o altri social), l'anteprima mostra la home page con l'immagine principale del sito invece dell'articolo specifico.  
**Causa probabile:** I meta tag `og:image`, `og:title`, `og:description` nel file `public/index.php` potrebbero non essere iniettati correttamente per tutti i path degli articoli, o il resolver della URL slug restituisce dati errati/vuoti in certi casi.  
**File da verificare:** `public/index.php` (router server-side SEO), slug resolution logic.  
**Fix applicato in v1.7.3:** `index.php` migrato da SQLite a MySQL (`Database::connect()`). Aggiunto `og:type` dinamico (`article`/`website`), `og:site_name`, `og:locale`, dimensioni immagine OG. Fix parsing query string nella URI.

#### ✅ [P0-02] Stabilità URL articoli (impatto bot Telegram e SEO) — RISOLTO v1.7.3
**Area:** CMS / RSS / SEO  
**Fonte:** Nota tecnica Titan Desktop v1.8.6 (01/03/2026 — rilasciata 17/04/2026)  
**Problema:** Tra febbraio e marzo 2026 alcune URL degli articoli sono cambiate struttura (es. da `/articoli/titolo` a `/narrativa-e-pubblicazioni/titolo`), probabilmente a seguito di un refactor delle categorie nel CMS. Il bot Telegram (che usa hash MD5 del link come identificatore) ha ri-pubblicato 8 articoli come nuovi contenuti, generando spam.  
**Fix lato bot:** Già rilasciato in Titan v1.8.6 — doppio controllo hash link + hash titolo.  
**Fix richiesto lato sito:**
- Non cambiare le URL degli articoli già pubblicati (è anche best practice SEO).
- In caso di refactor strutturale future, implementare redirect 301 sulle vecchie URL in `.htaccess`.
- Valutare in una versione futura l'uso del tag `<guid>` nel feed RSS come identificatore stabile, disaccoppiato dalla URL (richiesta esplicita del team Titan).

---

### 🟠 PRIORITÀ 1 — ALTA / FEATURE MANCANTI VISIBILI

#### ✅ [P1-01] Pulsante RSS feed permanente — COMPLETATO v1.7.5
**Area:** Frontend — Header / Footer / Fine articolo  
**Fix applicato:**
- `Header.tsx`: icona RSS standalone visibile su tutte le pagine (desktop e menu mobile), link a `/api/rss.php`.
- `Footer.tsx`: link RSS nel footer globale del sito.
- `SingleArticle.tsx`: pulsante/link RSS in fondo ad ogni articolo.


#### ✅ [P1-02] Pulsante "Contattami" e pagina form contatti — COMPLETATO v1.7.8
**Area:** Frontend + Backend  
**Fix applicato in v1.7.8:**
- `public/api/messages.php`: salva nel DB (tabella `messages`) + email notifica a `simonepizzi.1972@proton.me`.
- `src/pages/ContactPage.tsx`: form glassmorphism con stati loading/success/error.
- Route `/contatti` + voce "Contatti" in header desktop e mobile.

#### ✅ [P1-03] Sistema Newsletter — COMPLETATO v1.7.4
**Area:** Frontend (iscrizione pubblica) + Admin (invio NL)  
**Problema:** La tabella `subscribers` esiste nello schema ma non c'è nessun endpoint API, nessun form pubblico di iscrizione, nessuna UI admin per gestire gli iscritti o comporre e inviare newsletter. Il dashboard admin mostra `Iscritti Newsletter: 0` come placeholder statico.  
**Fix applicato — Fase 1 (Iscrizione):**
- Creare `POST /api/subscribers.php` per la registrazione email (con double opt-in via link conferma via mail).
- Aggiungere widget iscrizione newsletter visibile: nel Footer, al termine degli articoli (vicino RSS), in una eventuale pagina dedicata.
- Dashboard admin: visualizzare lista iscritti, permettere export CSV.  

**Fix applicato — Fase 2 (Invio Newsletter):**
- Creare interfaccia admin per comporre una newsletter (titolo, body HTML/Markdown, anteprima).
- Il compositore deve rispettare stile e grafica del sito (Tailwind dark theme).
- Endpoint `POST /api/newsletter_send.php` per invio massivo con PHP `mail()` o libreria (PHPMailer/SMTP).
- Tracciamento invii nella tabella `subscribers` (campo `last_sent_at`).

#### ✅ [P1-04] Data/ora e categoria nelle anteprime articolo — COMPLETATO v1.7.7
**Area:** Frontend — Home, Sezioni, Singolo Articolo  
**Fix applicato in v1.7.7:**
- `FeaturedCard.tsx` (hero e grid): aggiunta data+ora con icona Calendar.
- `ArticleArchive.tsx`: aggiunta data+ora nell'hero item; ora aggiunta ai grid items.
- `SingleArticle.tsx`: aggiunto badge categoria + ora nella data di pubblicazione.

---

### 🟡 PRIORITÀ 2 — MEDIA / UX ADMIN E EDITOR

#### ✅ [P2-01] Editor articoli — Criticità risolte in v1.7.9 + backlog
**Area:** Admin — Editor WYSIWYG  

| Gravità | Problema | Stato |
|---|---|---|
| ~~🔴 GRAVISSIMO~~ | ~~Toolbar non sticky — perdita selezione per inserire link~~ | ✅ **RISOLTO v1.7.9** — `sticky top-0 z-30`, rimosso `overflow-hidden` dal wrapper |
| ~~🔴 GRAVISSIMO~~ | ~~Nessuna shortcut da tastiera per link (Ctrl+K)~~ | ✅ **RISOLTO** |
| 🟠 GRAVE | Nessuna barra di avanzamento / feedback visivo durante salvataggio | 🔲 backlog |
| 🟠 GRAVE | Nessuna anteprima in-place del Markdown renderizzato | 🔲 backlog |
| 🟡 MEDIO | Nessun contatore parole/caratteri | 🔲 backlog |
| ~~🟡 MEDIO~~ | ~~Nessuna gestione tabelle nell'editor~~ | ✅ **RISOLTO v1.7.9** — pulsante `insertTable()` + stili prose tabelle |
| 🟡 MEDIO | `execCommand` deprecato (nota in v1.5.10) | 🔲 backlog |
| 🟢 LIEVE | Nessun drag-and-drop per riordinare immagini nel corpo | 🔲 backlog |
| 🟢 LIEVE | Nessun link interno rapido agli articoli del CMS | 🔲 backlog |

**Fix extra v1.7.9:** Home page portata a 7 articoli (1 hero + 6 griglia 3×2) — `PortfolioGrid.tsx slice(0,7)`.

#### ✅ [P2-02] Lista articoli admin — riequilibrio proporzioni colonne (COMPLETATO)
**Area:** Admin — `ArticlesList.tsx`  
**Problema:** Quasi tutta la larghezza della tabella articoli è occupata dalla colonna "Titolo". Le informazioni contestuali (categoria, stato pubblicazione, data) sono compresse o assenti.  
**Fix richiesto:**
- Ridurre la colonna Titolo a ~45% della larghezza.
- Aggiungere colonna **Categoria** (badge colorato, ~15%).
- Le colonne Stato e Data già presenti rimangono (~20% ciascuna).
- Aggiungere colonna Azioni (Modifica / Elimina) con icone compatte se non già presente.

#### ✅ [P2-04] Gestore Tag Dinamici — COMPLETATO v1.7.12
**Area:** Admin + Frontend  
**Problema:** A differenza delle categorie, i tag sono ancora gestiti tramite un sistema statico (hardcoded) nel codice.
**Fix applicato:**
- Creata tabella `tags` e tabella di relazione `article_tags`.
- Implementato CRUD per i tag nella dashboard (`TagsList.tsx`).
- Reso dinamico il sistema di tagging nell'editor degli articoli (multi-select API-driven).

#### [P2-03] Switch "link web / indirizzo email" nei pulsanti CTA articolo
**Area:** Admin — `ArticleEditor.tsx` / CTA Box  
**Problema:** Il box CTA a fondo articolo (pulsanti configurabili dall'editor) accetta un campo URL per il link, ma non distingue tra un URL web (`https://...`) e un indirizzo email (`mailto:...`). Un'email inserita senza prefisso `mailto:` non funziona come link corretto.  
**Fix richiesto:**
- Aggiungere in `ArticleEditor.tsx`, per ogni pulsante CTA, uno switch/toggle (Web URL | Email) che:
  - Quando è su "Email": aggiunge automaticamente il prefisso `mailto:` al valore salvato nel DB.
  - Quando è su "Web": si comporta come oggi (link diretto).
- Il toggle deve essere visibile e compatto nell'interfaccia editor.

---

### 🔵 PRIORITÀ 3 — BASSA / EVOLUTIVA (già in roadmap, confermata)

#### ✅ [P3-01] Paginazione backend-driven — COMPLETATO v1.7.12
**Area:** Frontend + Backend  
**Problema:** `PortfolioGrid.tsx` e `ArticleArchive.tsx` caricano tutti gli articoli in un'unica chiamata API. Con l'archivio in crescita, questo degraderà le performance di prima renderizzazione.  
**Fix applicato:** Implementata paginazione server-side su `articles.php` (parametri `?page=N&limit=10`). Il Frontend è gestito dallo hook `useFetchArticles` con logica in append per il tasto "Carica altri". Sincronizzata in UI su `ArticleArchive` e limitizzata in pre-fetch base a 7 entità su `PortfolioGrid`.

#### [P3-02] Motore di ricerca interno globale
**Area:** Frontend + Backend  
**Feature:** Barra di ricerca (shortcut `Ctrl+K`) per trovare articoli e progetti tramite keyword. Nuovo endpoint `search.php` con query SQL `LIKE` su titolo e contenuto.

#### [P3-03] Recupero password / login via email
**Area:** Admin  
**Fonte:** Inserita in roadmap dopo incidente v1.5.6 (smarrimento credenziali).  
**Feature:** Flusso "Password Dimenticata" con invio link di ripristino sicuro via email. Richiede colonna `email` in tabella `users` (attualmente assente dallo schema).

#### [P3-04] Sistema di backup automatico MySQL
**Area:** Admin / Server  
**Feature:** Pulsante nel pannello Admin o CRON lato server che genera un dump MySQL e lo invia via email o lo rende scaricabile. Priorità aumentata dopo migrazione a MySQL (il backup non è più automatico come con file SQLite).

#### [P3-05] Migrazione `execCommand` → Selection API nell'editor
**Area:** Admin — `RichTextEditor.tsx`  
**Fonte:** Annotato come TODO tecnico in v1.5.10.  
**Feature:** Sostituire l'API browser `document.execCommand()` (deprecata) con un'implementazione basata su `Selection` e `Range` API per le operazioni di formattazione testo.

#### [P3-06] Audio Player nativo fluttuante
**Area:** Frontend  
**Feature:** Mini-player audio persistente tra le pagine per podcast/MP3 dalla Media Gallery o feed esterni.

#### [P3-07] Dark/Light Mode
**Area:** Frontend  
**Feature:** Selettore modalità chiara per migliorare leggibilità articoli lunghi. Il sito nasce dark; questa è un'aggiunta opzionale.

---

## PARTE III — NOTE DI INTEGRAZIONE ESTERNA

### Titan Desktop (Bot Telegram) — Comunicazione ufficiale ricevuta 17/04/2026

Il team di sviluppo Titan Desktop ha segnalato quanto segue, già gestito lato bot ma rilevante per il sito:

**Problema documentato:**
- Il 1° marzo 2026, tra le 10:37 e le 10:40, 8 articoli del sito sono stati ri-pubblicati come nuovi sul canale Telegram a causa di un cambio strutturale nelle URL (probabilmente refactor categorie CMS).
- Il bot usa hash MD5 del link come identificatore univoco: URL nuova = contenuto "nuovo" = ri-pubblicazione.

**Soluzione lato bot (già attiva in v1.8.6):**
Doppio controllo: hash link + hash titolo. Stesso titolo dallo stesso feed = non re-inviato anche se la URL è cambiata. L'unico scenario residuo non coperto: cambio simultaneo di URL e titolo (che equivarrebbe a un contenuto genuinamente nuovo).

**Fix applicati in v1.7.3:**
1. RSS `rss.php`: GUID ora è `urn:simonepizzi:article:{id}` con `isPermaLink="false"` — stabile indipendentemente da URL e categoria.
2. `.htaccess`: aggiunta sezione redirect 301 con istruzioni per mapping futuri.
3. Regola consolidata: non modificare URL di articoli già pubblicati. In caso di refactor, aggiungere redirect 301 in `.htaccess`.

---

### SEO & Indicizzazione Google — Rapporto 19/04/2026

**Stato attuale:** Critico (1 solo articolo indicizzato su 30).
**Documento Analisi:** [indicizzazione.google.md](file:///C:/Users/Utente/Documents/GitHub/SITI-WEB/SimonePizziWebSite/docs/indicizzazione.google.md)

**Punti chiave:**
- Il sito è una SPA (Client-Side Rendering): Google ha difficoltà a "vedere" i contenuti senza SSR o Prerendering.
- Necessaria sottomissione manuale in Google Search Console.
- Strategia consigliata: Implementazione Prerendering statico (Vite plugin) per servire HTML statico ai bot senza cambiare hosting.


---

## PARTE IV — RIEPILOGO ESECUTIVO SPRINT CONSIGLIATI

### ✅ Sprint A — "Fix & Visibilità" — COMPLETATO v1.7.3
1. ✅ [P0-01] Fix anteprima social / OpenGraph rotta — risolto v1.7.3
2. ✅ [P0-02] Stabilizzare URL articoli + redirect 301 + GUID RSS stabile — risolto v1.7.3
3. ✅ [P1-01] Pulsante RSS header — risolto v1.7.5 (footer e fine articolo rimangono nel backlog P3)
4. ✅ [P1-04] Data/ora e categoria nelle anteprime articolo — risolto v1.7.7
5. ✅ Menu mobile (hamburger + drawer) — risolto v1.7.7

### Sprint B — "Contatti & Community" — COMPLETATO v1.7.8
5. ✅ [P1-02] Pagina Contattami + form email reale — v1.7.8
6. ✅ [P1-03] Newsletter — fase 1 (iscrizione pubblica + admin lista) — v1.7.4

### Sprint C — "Admin Power-Up"
7. ✅ [P2-01] Toolbar sticky e Ctrl+K nell'editor — RISOLTO
8. ✅ [P2-02] Lista articoli admin — colonna categoria — RISOLTO
9. ✅ [P2-04] Gestore Tag Dinamici DB-driven — RISOLTO v1.7.12
10. [P2-03] Switch link/email nei pulsanti CTA
11. ✅ [P1-03] Newsletter — fase 2 (compositore + invio) — COMPLETATO v1.7.4

### Sprint D — "Scale & Polish"
12. ✅ [P3-01] Paginazione backend-driven — RISOLTO v1.7.12
13. [P3-02] Motore di ricerca interno
13. [P3-03] Recupero password via email
14. [P3-04] Backup automatico MySQL
15. [P3-05] Migrazione execCommand → Selection API

### Sprint E — "SEO & Premium Features"
16. [P1-05] Risoluzione Indexing Google (Prerendering statico)
17. [P3-06] Audio player fluttuante
18. [P3-07] Dark/Light mode

---

*Documento mantenuto da Simone Pizzi. Aggiornare questo file ad ogni sprint completato, marcando le voci con ✅ e aggiornando la versione.*

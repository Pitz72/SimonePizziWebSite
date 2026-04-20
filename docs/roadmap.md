# Roadmap Strategica e Sviluppi Futuri

## Simone Pizzi - Portfolio Creativo

Questo documento traccia le traiettorie di sviluppo future per l'infrastruttura del sito e del Mini-CMS, al fine di guidare i prossimi sprint di programmazione, scalare le funzionalita e migliorare l'esperienza utente sia lato visitatore che lato amministratore.

---

## 1. Evoluzione del Mini-CMS (Admin Panel)

L'area di amministrazione ha raggiunto una stabilita notevole, ma per sostenere un archivio in crescita necessita di strumenti organizzativi e di sicurezza avanzati.

### ✅ Media Gallery: Navigazione a Schede (Tabs) e Filtri [COMPLETATA — v1.6.0]

Implementata in v1.6.0 con 3 tab (Immagini / Documenti / File) e contatori per tipo.

### ✅ Media Gallery: Multi-Selezione e Bulk Delete [COMPLETATA — v1.6.3]

Implementata in v1.6.3: checkbox per card, "Seleziona tutti" per tab, barra azioni contestuale, eliminazione in blocco sequenziale. Vedi [changelog v1.6.3](changelogs/1.6.3.md).

### ✅ Gestore Categorie Dinamiche [COMPLETATA — v1.6.5/v1.7.10]
Implementata in v1.6.5 (base DB e API) e completata l'integrazione totale in v1.7.10 (Editor Progetti, Editor Articoli, Dashboard e Pagine Pubbliche). Ora ogni componente del sito è sincronizzato con il sistema dinamico delle categorie.

> [!NOTE]
> Il sistema dei **Tag** rimane attualmente statico (hardcoded) ed è programmato per una futura implementazione dinamica.

### 🔲 Gestore Tag Dinamici [BACKLOG]
- **Feature:** Permettere la creazione e gestione di tag personalizzati per gli articoli (es. #React, #Horror, #Sperimentale) direttamente dalla dashboard, superando l'attuale sistema fisso.
- **Logica:** Creazione tabella `tags`, relazione many-to-many con articoli, e UI di gestione tag.


### ✅ Dashboard Analitica Avanzata [COMPLETATA — v1.6.5]

Implementata in v1.6.5: tabelle `article_views` (dedup IP+giorno) e `cta_clicks`, API `analytics.php`, tracking automatico in `SingleArticle.tsx`, sezione analytics in Dashboard (top 5 articoli, grafico 7 giorni, breakdown click CTA). Vedi [changelog v1.6.5](changelogs/1.6.5.md).

### Recupero Password e Login via Email

Inserito in Roadmap a seguito dell'incidente v1.5.6 (smarrimento credenziali admin).

- **Feature:** Implementare un sistema di login basato su email e un flusso di "Password Dimenticata" (es. invio link di ripristino sicuro) per prevenire blocchi amministrativi e dipendenze da account rigidi.

---

## 2. Esperienza Utente Frontend (UI/UX)

La transizione a Tailwind v4 e React 19 ha creato una solida base estetica, ma ci sono ampi margini per aumentare l'interattivita e l'accessibilita.

### Motore di Ricerca Interno Globale

- **Feature:** Implementare una barra di ricerca (richiamabile con scorciatoia da tastiera `Ctrl+K`) per permettere agli utenti di trovare rapidamente progetti, racconti o articoli del blog tramite keyword.
- **Logica Tecnica:** Costruire un nuovo endpoint API in PHP (`search.php`) che interroghi il database usando gli operatori SQL `LIKE` su titoli e contenuti.

### Dark/Light Mode Naturale (Opzionale)

Sebbene il sito nasca con un'identita profondamente scura, implementare un selettore per la modalita chiara potrebbe aumentare l'accessibilita per la lettura prolungata degli articoli testuali.

### Audio Player Nativo Integrato

Visto il focus su "Podcast, Audio e Altro" (Runtime Radio, favole, ecc.):

- **Feature:** Sviluppare un mini-player audio fluttuante e persistente in React, capace di riprodurre MP3 caricati nella Media Gallery (o feed esterni) senza interrompere la navigazione tra le pagine.

---

## 3. Ottimizzazione e Architettura di Sistema

### ✅ Migrazione Database SQLite → MySQL [COMPLETATA — v1.7.0]

Completata il 04/04/2026. Il database è stato migrato da SQLite (file locale) a MySQL dedicato su `mysql.runtimeradio.it`. Tutti i dati sono stati trasferiti senza perdite (1 utente, 27 articoli, 32 media, 6 progetti, 5 categorie). Contestualmente risolto un bug post-migrazione (HTTP 500 MySQL strict mode su confronti stringa vuota su campi DATETIME) e normalizzati 22 path immagini nel DB (estensioni obsolete .png/.jpg → .webp). Vedi [changelog v1.7.0](changelogs/1.7.0.md) e [v1.7.1](changelogs/1.7.1.md).

### ✅ Ottimizzazione Automatica delle Immagini [COMPLETATA — v1.6.3]

**Implementata il 02/04/2026.** `upload.php` converte automaticamente JPEG/PNG in WebP (qualità 82, resize max 1920px) via GD Library. Script batch `scripts/optimize_uploads.php` disponibile per ottimizzare i file già caricati (one-shot, da eliminare dopo l'esecuzione). Vedi [changelog v1.6.3](changelogs/1.6.3.md).

---

### ✅ Rafforzamento UI/UX e Integrazione PayPal [COMPLETATA — v1.6.4]

Implementata in v1.6.4: rimozione icone dai pulsanti per estetica minimale, integrazione donazione PayPal contestualizzata negli articoli, logica di ordinamento temporale "In Primo Piano" e visualizzazione date di pubblicazione. Vedi [changelog v1.6.4](changelogs/1.6.4.md).

### Paginazione (Infinite Scroll o Load More)

- **Problema:** `PortfolioGrid.tsx` e `ArticleArchive.tsx` attualmente mappano tutti gli articoli disponibili.
- **Soluzione:** Implementare la paginazione backend-driven. Quando il numero di articoli supera le decine, sara vitale caricare i contenuti a blocchi (es. 10 per volta) tramite un pulsante "Carica altri" o l'Infinite Scroll, per non appesantire la prima renderizzazione della pagina.

### Sistema di Backup Automatico Database

- **Feature:** Uno script CRON lato server o un bottone nel pannello Admin che generi un dump di `database.sqlite` e lo scarichi in locale o lo invii via email, garantendo sicurezza contro la perdita accidentale di dati strutturati.

### Attivazione Tabelle Placeholder (Newsletter e Contatti)

Le tabelle `subscribers` e `messages` esistono gia nello schema SQLite (`init_db.php`) ma non hanno endpoint API attivi. Il dashboard mostra `total_subscribers: 0` come placeholder.

- **Feature Newsletter:** Creare `GET/POST /api/subscribers.php` per registrazione email e pannello admin di gestione iscritti.
- **Feature Form Contatti:** Creare `POST /api/messages.php` per la ricezione messaggi dal sito e `GET /api/messages.php` (admin) per la visualizzazione in dashboard.

---

*Roadmap in continuo aggiornamento. Le priorita saranno decise in base all'evoluzione dei contenuti e alle reali necessita dell'autore.*

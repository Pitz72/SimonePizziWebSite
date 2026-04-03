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

### Gestore Categorie e Tag Dinamici

Attualmente le categorie (Videogiochi, Software, ecc.) sono hard-coded nell'Enum TypeScript.

- **Feature:** Permettere all'admin di creare, rinominare o eliminare le categorie principali direttamente dal pannello di controllo, senza toccare il codice.
- **Impatto:** Richiede la creazione di una tabella `categories` nel database SQLite e la migrazione del routing di React da statico a dinamico basato sulle API.

### Dashboard Analitica Avanzata

- **Feature:** Arricchire l'attuale pannello di riepilogo con metriche piu dettagliate: visualizzazioni uniche per articolo, statistiche di click sui pulsanti (CTA) e conteggio dei download dalla Media Gallery.

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

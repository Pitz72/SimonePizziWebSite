# Roadmap Strategica e Sviluppi Futuri
**Simone Pizzi - Portfolio Creativo**

Questo documento traccia le traiettorie di sviluppo future per l'infrastruttura del sito e del Mini-CMS, al fine di guidare i prossimi sprint di programmazione, scalare le funzionalita e migliorare l'esperienza utente sia lato visitatore che lato amministratore.

---

## 1. Evoluzione del Mini-CMS (Admin Panel)

L'area di amministrazione ha raggiunto una stabilita notevole, ma per sostenere un archivio in crescita necessita di strumenti organizzativi e di sicurezza avanzati.

### Media Gallery: Navigazione a Schede (Tabs) e Filtri

Attualmente la Media Gallery mostra tutti i file in un'unica griglia. Con l'aumento dei caricamenti, e prioritario implementare una suddivisione per tipologia di media:

- **Feature:** Creare un'interfaccia a Tab (es. "Tutti", "Immagini", "Documenti PDF", "Archivi ZIP", "Audio").
- **Logica Tecnica:** Modificare il componente React `MediaGallery.tsx` per filtrare l'array `mediaList` basandosi sulla colonna `mime_type` proveniente dal database.

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

### 🖼️ Ottimizzazione Automatica delle Immagini [PRIORITÀ ALTA]

**Problema rilevato:** Audit prestazioni del 30/03/2026 ha evidenziato immagini PNG generate da AI caricate senza compressione (5.6 MB, 2.7 MB, 2.6 MB). Il sito risulta lento a causa del peso totale degli asset (12-15 MB per sessione di navigazione). La causa è strutturale: le immagini vengono caricate via `upload.php` senza alcuna fase di ottimizzazione.

**Soluzione da implementare in due parti:**

#### Parte 1 — Ottimizzazione Automatica all'Upload (`upload.php`)
- **Obiettivo:** Ogni volta che una nuova immagine viene caricata tramite la Media Gallery admin, `upload.php` deve automaticamente:
  1. Rilevare se il file caricato è un'immagine (check MIME type: `image/png`, `image/jpeg`, `image/gif`)
  2. Convertirla in formato **WebP** usando la funzione PHP `imagewebp()` (GD Library, disponibile su hosting condivisi standard) o in alternativa la libreria `Imagick`
  3. Salvare il file WebP al posto del PNG/JPEG originale, mantenendo il nome originale nel DB ma con estensione `.webp`
  4. Applicare una **compressione qualità 82** (ottimo compromesso qualità/peso)
  5. Effettuare anche un **resize massimo** a 1920px di larghezza (mantenendo proporzioni) per evitare upload di immagini 4K non necessari
- **File da modificare:** `public/api/upload.php`
- **Nessuna migrazione DB necessaria** — il `filename` nel DB continua a registrare il nome originale caricato dall'utente

#### Parte 2 — Script PHP Batch per Immagini Già Caricate (`optimize_uploads.php`)
- **Obiettivo:** Script PHP one-shot da caricare temporaneamente in `public/api/`, visitabile da browser dall'admin, che:
  1. Scansiona l'intera cartella `public/uploads/`
  2. Per ogni PNG o JPEG trovato: lo converte in WebP, salva il nuovo file `.webp`, aggiorna il record nel DB (`media.file_path` e `media.filename`), elimina il file originale
  3. Produce un report testuale con: file processati, peso prima/dopo, file saltati (già WebP, SVG, ecc.)
  4. **Deve essere eliminato dal server dopo l'esecuzione** (pattern sicurezza standard del progetto)
- **File da creare:** `scripts/optimize_uploads.php` → deployare temporaneamente in `public/api/`

#### Note tecniche
- Verificare che la GD Library sia abilitata sull'hosting prima di implementare (`phpinfo()` o `extension_loaded('gd')`)
- Se GD non è disponibile, valutare Imagick come fallback
- I link `/api/download.php?id=X` esistenti rimangono validi perché leggono dal DB, non dal filesystem direttamente

---

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

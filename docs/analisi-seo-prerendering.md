# Analisi Post-Mortem: Esperimento Prerendering Statico (SSG)

## 1. L'Obiettivo Iniziale

Risolvere il problema dell'indicizzazione SEO (Google Search Console che rileva una "pagina bianca") per una Single Page Application (SPA) basata su React 19, ospitata su un server tradizionale con PHP e MySQL.

## 2. La Soluzione Tentata (Prerendering via Puppeteer)

Abbiamo provato a implementare un sistema di **Static Site Generation (SSG)** manuale.

- **Meccanismo**: Uno script Node.js che lancia Puppeteer, visita ogni rotta del sito, attende il caricamento dei dati dal database (tramite un bridge API) e salva il risultato in file HTML statici.
- **Razionale**: Evitare di modificare profondamente l'architettura del server e mantenere l'app come una SPA pura.

## 3. Perché la soluzione è stata scartata (Criticità)

Nonostante il successo tecnico nel generare i file, la soluzione si è rivelata **concettualmente errata** per un progetto destinato a un cliente finale:

1. **Rottura del Flusso CMS**: Un CMS (Content Management System) nasce per essere autonomo. Questa soluzione obbligava a un ciclo "Modifica online -> Build locale -> Upload FTP", rendendo il CMS inutile per un utente non tecnico.
2. **Dati non in tempo reale**: Le pagine HTML generate erano "istantanee" (snapshot) congelate al momento della build. Ogni nuovo articolo rimaneva invisibile ai motori di ricerca fino alla build successiva.
3. **Complessità Architetturale Eccessiva**: Per far funzionare il tutto abbiamo dovuto introdurre:
   - Bridge API per bypassare i CORS.
   - Strategie di buffer (`dist-static`) per non corrompere il server di build.
   - Segnali di rendering (`render-event`) nel codice React.
   Tutta questa complessità per una soluzione che comunque non risolveva il problema alla radice.

## 4. Lezione Appresa

In un ambiente dove il contenuto cambia dinamicamente tramite un database (MySQL/SQLite) e l'hosting è di tipo tradizionale (PHP), la soluzione **non può essere statica (SSG)**, ma deve essere **dinamica (SSR o Hybrid)**.

## 5. Alternative Future Possibili

Nelle prossime sessioni, valuteremo soluzioni che automatizzino il processo sul server:

- **PHP SEO Injection (Soluzione Consigliata)**: Modificare il file `index.php` per intercettare la rotta, leggere dal DB i metadati (Titolo, Descrizione, OpenGraph) e iniettarli nell'HTML prima di servire React.
  - *Vantaggio*: 100% automatico, istantaneo per ogni nuovo articolo, invisibile per il cliente.
- **Rerender Services**: Utilizzare servizi esterni (come Prerender.io) che intercettano i bot e servono una versione renderizzata (ha però costi ricorrenti).
- **Integrazione Metadata in backend**: Gestire i tag SEO direttamente nel database e servirli tramite PHP come "testata" della pagina.

## 6. Strategia Scelta: Hybrid PHP Content Injection

A seguito dell'analisi, la soluzione selezionata per la prossima sessione è l'**Iniezione Ibrida del Contenuto via PHP**.

### Logica di Funzionamento

1. **Intercettazione**: Il file `public/index.php` (già attivo) identifica lo `slug` dell'articolo dall'URL.
2. **Estrazione**: Oltre ai meta-tag (già implementati), PHP interroga la tabella `articles` per recuperare il campo `content`.
3. **Iniezione HTML**: Il contenuto viene inserito staticamente dentro il tag `<div id="root">` del file `index.html` prima di essere inviato al browser.
4. **Idratazione**: Quando React si carica, troverà il DOM già popolato. React "monterà" l'applicazione sopra il contenuto esistente, sostituendolo o integrandolo senza che l'utente noti sfarfallii.

### Vantaggi Tecnici

- **SEO Full-Text**: Google Bot riceve il testo completo dell'articolo al primo byte, senza dover attendere il caricamento di JavaScript.
- **Zero Manutenzione**: Funziona automaticamente per ogni nuovo articolo creato nel CMS.
- **Performance**: Migliora il *First Contentful Paint* (FCP) per l'utente umano.

### Piano d'Azione per la Prossima Sessione

- [ ] **Modifica `index.php`**: Aggiornare la query SQL per includere il campo `content`.
- [ ] **Sanitizzazione**: Implementare una funzione di pulizia base (es. `strip_tags` o filtraggio tag pericolosi) per l'iniezione nel div root.
- [ ] **Template Matching**: Individuare la posizione esatta di `<div id="root"></div>` nell'HTML e sostituirla con `<div id="root">CONTENUTO_RECUPERATO</div>`.
- [ ] **Test Crawler**: Verificare con un simulatore di crawler che il testo sia presente nel sorgente pagina (View Source).

---

*Documento aggiornato il 21/04/2026 per la pianificazione della fase di implementazione SEO.*


# Analisi Indicizzazione Google — simonepizzi.runtimeradio.it
**Data analisi:** 19 Aprile 2026

## 🔍 Stato Attuale (Audit)

Dall'analisi effettuata tramite operatori di ricerca avanzati (`site:`) e scansione dei feed, risulta una discrepanza critica tra contenuti pubblicati e contenuti indicizzati.

| Parametro | Risultato |
|---|---|
| **Articoli pubblicati (RSS)** | 30 articoli |
| **Pagine indicizzate su Google** | **1 sola pagina** |
| **Pagina rilevata** | `Pensieri in Codice e la filosofia della cooperazione` |
| **Home Page indicizzata** | ❌ No |
| **Sitemap.xml** | ✅ Presente, ma ignorata |

---

## ⚠️ Diagnosi Tecnica: Il problema della SPA

Il sito è sviluppato come una **Single Page Application (SPA)** in React 19. 

### 1. Client-Side Rendering (CSR)
Quando il Googlebot visita il sito, riceve un file HTML quasi vuoto (`<div id="root"></div>`) che viene popolato dai dati solo dopo l'esecuzione del JavaScript. Sebbene Google dichiari di eseguire JS, questo avviene in una "seconda ondata" di crawling che può subire ritardi di settimane o non avvenire affatto se il sito non ha abbastanza "autorità".

### 2. Deep Linking & Routing
Le URL del tipo `/videogiochi/nome-articolo` sono gestite interamente dal browser (React Router). Senza una gestione lato server (SSR) o file fisici (Prerendering), Google fatica a scoprire e validare questi percorsi come entità separate.

### 3. Mancanza di Backlink
L'unica pagina indicizzata ("Pensieri in Codice") è probabilmente comparsa su Google perché citata da altri siti con alta autorità (es. `pensieri-in-codice.it`), che hanno fornito a Google un "ponte" diretto verso quel contenuto specifico.

---

## 🛠️ Piano d'Azione Consigliato

### Fase 1: Immediata (Zero Codice)
- **Google Search Console (GSC):** Verificare la proprietà del sito su GSC.
- **Sottomissione manuale:** Caricare la sitemap e usare lo strumento "Controllo URL" per richiedere l'indicizzazione manuale della Home e dei 5 articoli più importanti.
- **Internal Linking:** Assicurarsi che la Home punti chiaramente a tutti gli articoli (già fatto con la griglia a 7 articoli).

### Fase 2: Tecnica (Ottimizzazione build)
- **Static Prerendering:** Implementare `vite-plugin-prerender`. 
  - Durante la `npm run build`, il plugin naviga virtualmente nel sito e salva ogni rotta come un file `.html` reale (es. `dist/videogiochi/titolo/index.html`).
  - Google troverà HTML statico con testo e metadati pronti all'uso, risolvendo il problema della SPA al 100% pur mantenendo l'attuale hosting FTP.

### Fase 3: SEO On-Page
- **Meta Tags Dinamici:** Verificare che `react-helmet-async` stia aggiornando correttamente i tag `<title>` e `<meta name="description">` per ogni articolo (essenziale per far capire a Google di cosa parla la pagina).

---

## 📋 Elenco Articoli in attesa di indicizzazione (Top 10)
1. Cari Amici vi scrivo con la NEWSLETTER ATTIVATA!
2. Perplexity Pro: un anno di abbonamento e una delusione
3. Come cresce uno Sviluppatore Generativo
4. Runtime Live Machine Pro: la regia audio reimmaginata
5. Il Relitto Silente sbarca su macOS e Linux
6. RILASCIO UFFICIALE: Runtime FeedDownloader Pro
7. Fine dell’Esilio: Titan Edition su Mac e Linux
8. Da SQLite a MySQL: il nuovo protocollo miniCMS
9. Ho scritto un manuale: React + PHP Thin Stack
10. Il Relitto Silente: Come ho costruito un'avventura testuale nel 2026

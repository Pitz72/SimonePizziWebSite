# Nota di Miglioramento: SEO & Prerendering
**Stato:** Risolto ✅ (v1.12.0 — SEO Engine v2.0)

## 🎯 Obiettivi Raggiunti

### v1.7.3 — Meta Tag Injection (Fase 1)
Il progetto ha implementato un sistema di **iniezione meta tag** (OpenGraph, TwitterCards) gestito via PHP (`index.php`). Questo garantiva anteprime corrette sui social media ma lasciava il `<body>` vuoto per i crawler.

### v1.12.0 — Dynamic Rendering Ibrido (Fase 2) ✅
Riscrittura completa di `index.php` come motore **Dynamic Rendering**:

- **Visitatori umani** → SPA React con meta tag iniettati (comportamento invariato)
- **Crawler** (Googlebot, Bingbot, social bot) → HTML completo con:
  - Contenuto reale nel `<body>` (`<h1>`, `<article>`, testo, immagini)
  - Dati strutturati **JSON-LD** (Article, CollectionPage, WebSite, Person, ContactPage)
  - `<link rel="canonical">` per prevenire contenuti duplicati
  - **Breadcrumb** semantici per navigazione gerarchica

## ✅ Problemi Risolti

### 1. Incidente Robots.txt (v1.9.6) → RISOLTO
- **Causa radice:** Le regole `.htaccess` dipendevano dalla condizione `!-f` (file non esiste), creando una race condition tra file fisico e fallback PHP.
- **Soluzione v2.0:** `robots.txt` e `sitemap.xml` puntano **sempre** ai generatori PHP (`robots.php`, `sitemap.php`) senza condizioni sul filesystem. Il bug del 404 sporadico è eliminato.

### 2. Workflow di Prerendering Manuale → ELIMINATO
- **Era:** Prerendering manuale tramite `prerender.php` dopo ogni deploy.
- **Ora:** `index.php` genera HTML completo **on-demand** ad ogni richiesta crawler. Nessun file statico necessario, nessun cron job, nessun intervento manuale.
- `prerender.php` è stato deprecato e sostituito con un messaggio informativo.

### 3. Sincronizzazione Sitemap.xml → RISOLTA
- **Era:** La sitemap rifletteva solo lo stato al momento della generazione manuale.
- **Ora:** `sitemap.php` è servito in tempo reale ad ogni richiesta. Include `<lastmod>` calcolato dinamicamente e supporto per sottocategorie.

## Architettura SEO v2.0

```
Richiesta HTTP
    │
    ├─ /robots.txt     → robots.php (sempre, via .htaccess)
    ├─ /sitemap.xml    → sitemap.php (sempre, via .htaccess)
    ├─ /api/*          → endpoint PHP (passthrough)
    ├─ file fisico     → Apache serve direttamente (.js, .css, .png)
    │
    └─ Rotta pubblica  → index.php (SEO Engine v2.0)
         │
         ├─ Crawler?   → HTML completo (head + body + JSON-LD)
         └─ Umano?     → SPA React (head con meta + bundle JS)
```

---
*Nota aggiornata a chiusura della v1.12.0 — 25 Aprile 2026*

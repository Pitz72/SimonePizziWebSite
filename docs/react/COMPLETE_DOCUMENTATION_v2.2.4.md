# DOCUMENTAZIONE DI PROGETTO — STATO v2.2.4 (08/08/2025)

## Struttura e flusso di build
- Sorgente landing: `respiro-landing/` (React + Vite + Tailwind)
- Sorgente sito principale: `simone-pizzi-react/`
- Build landing: `respiro-landing/dist` → copiata in `simone-pizzi-react/public/respiro-trattenuto/`
- Build sito principale: `simone-pizzi-react/dist` (pronta per deploy)
- Tutti i file statici (download, sitemap, robots, .htaccess) devono essere in `simone-pizzi-react/public/` per essere inclusi nella build

## Funzionalità principali
- Landing page con header personalizzato, hero ottimizzata, download Windows/Android con popup informativi
- Percorsi asset e download compatibili con deploy in sottocartella
- Ottimizzazione immagini e SVG (con svgo)
- Favicon SVG Sparkles (da migliorare compatibilità)
- SEO: inclusione di sitemap, robots.txt, .htaccess

## Problemi noti
- Favicon SVG non sempre visualizzata su tutti i browser: aggiungere fallback .ico in futuro

## Best practice
- Conservare sempre il codice sorgente per ogni modifica futura
- Aggiornare la documentazione e la checklist anti-regressione dopo ogni build importante

---

Per dettagli sulle modifiche, vedi il changelog e l'anti-regressione allegati.

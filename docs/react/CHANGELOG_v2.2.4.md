# CHANGELOG v2.2.4

## Data: 8 agosto 2025

### Novità principali
- Landing page "Il Respiro Trattenuto del Mondo" completamente integrata come sottocartella statica (`/respiro-trattenuto`) nel sito principale.
- Download Windows e Android con popup informativi dettagliati e link ai file nella cartella `/downloads/videogiochi/respiro`.
- Aggiornamento header landing e ottimizzazione immagini hero.
- Aggiornamento favicon principale con SVG Sparkles (da migliorare compatibilità in futuro).
- Inclusione e build di file statici SEO: `sitemap.xml`, `robots.txt`, `.htaccess`.
- Ottimizzazione immagini e SVG tramite vite-plugin-image-optimizer e svgo.

### Fix e miglioramenti
- Correzione percorsi asset per supporto deploy in sottocartella.
- Build e deploy testati con successo, nessun errore bloccante.
- Consolidamento struttura cartelle per download e asset pubblici.

### Problemi noti
- Alcuni browser potrebbero non visualizzare la favicon SVG correttamente. Da risolvere in un prossimo aggiornamento (aggiungere fallback .ico).

---

Per dettagli tecnici e anti-regressione, vedi i documenti allegati.

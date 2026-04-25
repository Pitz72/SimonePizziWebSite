# Nota di Miglioramento: SEO & Prerendering
**Stato:** Analisi Post-Sviluppo (v1.11.1)

## 🎯 Obiettivi Raggiunti
Il progetto ha implementato con successo un sistema di **Prerendering Statico** con iniezione di metadati SEO (OpenGraph, TwitterCards) gestito via PHP (`index.php` e `prerender.php`). Questo permette l'indicizzazione corretta dei contenuti dinamici (articoli e categorie) nonostante l'architettura SPA.

## ⚠️ Problemi Riscontrati e Non Risolti
Nonostante gli sforzi, rimangono delle criticità che richiedono un'analisi futura più approfondita, probabilmente legata alla configurazione del server Apache o alle restrizioni dell'hosting:

### 1. Incidente Robots.txt (v1.9.6)
- **Descrizione:** Il file `robots.txt` restituisce occasionalmente un errore 404 (gestito da React) invece di servire il file fisico presente nella root o il fallback generato via PHP.
- **Analisi Corrente:** Il server sembra ignorare le direttive di rewrite nel `.htaccess` specificamente per questo file, o esiste una collisione con la gestione delle rotte del frontend.
- **Stato:** Investigazione aperta.

### 2. Workflow di Prerendering Manuale
- **Descrizione:** Attualmente il prerendering delle pagine statiche deve essere innescato manualmente dall'area admin dopo ogni deploy.
- **Debito Tecnico:** Non è stato implementato un sistema di automazione (Cron Job o Webhook) che aggiorni le pagine statiche alla creazione di un nuovo articolo.
- **Futuro:** Valutare l'attivazione di un trigger automatico lato backend MySQL/PHP.

### 3. Sincronizzazione Sitemap.xml
- **Descrizione:** La sitemap viene generata correttamente dallo script di prerendering, ma riflette solo lo stato al momento della generazione.
- **Rischio:** Ritardo tra la pubblicazione di un articolo e la sua presenza nella sitemap fisica se lo script non viene eseguito prontamente.

## 🔍 Analisi per il Futuro
Nel caso di una ripresa dello sviluppo o di un cambio di hosting, si consiglia di:
- Analizzare i log di errore del server Apache per identificare il motivo preciso del 404 sul `robots.txt`.
- Implementare una gestione SEO interamente tramite **Edge Functions** o un layer di **Reverse Proxy** per eliminare la dipendenza dal prerendering fisico su disco.
- Verificare la coerenza del protocollo HTTPS nei link generati nella sitemap (attualmente forzati via PHP).

---
*Nota generata a chiusura della fase di sviluppo v1.11.1 - 25 Aprile 2026*

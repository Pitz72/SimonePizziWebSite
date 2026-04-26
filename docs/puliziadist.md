# Protocollo di Pulizia e Ottimizzazione Build

Questo documento riassume le operazioni di pulizia effettuate per bonificare l'ambiente di produzione e le istruzioni per l'allineamento manuale del server FTP.

## 🛠️ Pulizia Automatica (Effettuata nel Sorgente)

Questi interventi sono stati già implementati nel codice e verranno applicati automaticamente ad ogni futura build.

### 1. Ottimizzazione Asset
- **Rimozione PNG pesanti**: Tutti i file PNG da vari MB (es. `Simone-Pizzi.png`, `favella1.png`, `rlm.png`) sono stati archiviati in `PRE-PRODUZIONE/originali/`.
- **Migrazione WebP**: Il sito ora utilizza esclusivamente formati WebP leggeri (es. `Simone-Pizzi.webp` da 124KB invece di 2.2MB).
- **Favicon**: Rigenerato un `favicon.png` ottimizzato da **6KB** (64x64px).

### 2. Aggiornamento Codice
- **SEO Engine (`index.php`)**: Aggiornato per puntare ai nuovi file `.webp` per i metadati OpenGraph e Twitter.
- **Portfolio Data (`portfolioData.ts`)**: Tutti i link alle immagini dei progetti ora puntano ai file WebP.
- **Download Dinamici**: Sostituiti i link statici alla cartella `downloads` con i nuovi endpoint dinamici `api/download.php?id=...`.

### 3. Script Post-Build (`clean-dist.js`)
Lo script è stato potenziato per eliminare dalla cartella `dist/` prima del caricamento:
- Script di debug (`debug_*.php`), test (`test_*.php`) e migrazione (`migrate_*.php`, `fix_*.php`, `porting_data.php`).
- File sensibili (`config.php`, `config.example.php`).
- File SEO statici ridondanti (`robots.txt`, `sitemap.xml`) serviti ora via PHP.
- Residui tecnici di hosting (`.dh-diag`).

---

## 🚀 Azioni Manuali richieste su FTP (Server)

Per allineare il server alla nuova struttura pulita, è necessario rimuovere manualmente i seguenti elementi obsoleti dalla root del sito:

### 📁 Directory da Eliminare
- `public/`: Rimuovere l'intera sottocartella (residuo di vecchie build errate).
- `downloads/`: Rimuovere l'intera cartella (ora gestita via `/uploads/` e API).
- `.dh-diag/`: Rimuovere (residuo diagnostico hosting).

### 📄 File da Eliminare
- `robots.txt`: Rimuovere il file fisico (ora gestito da `robots.php`).
- `sitemap.xml`: Rimuovere il file fisico (ora gestito da `sitemap.php`).
- `favicon.gif`: Rimuovere (obsoleto).
- `Simone-Pizzi.png`: Rimuovere dalla root (sostituito da `.webp`).
- **Nella cartella `api/`**: Rimuovere tutti i file che iniziano con `debug_`, `test_`, `fix_`, `migrate_` e il file `porting_data.php`.
- **ATTENZIONE**: Assicurarsi che `config.php` sia presente sul server ma NON caricarlo mai tramite la cartella `dist/` (lo script lo rimuove volutamente per sicurezza).

## 🛡️ Misure di Sicurezza Locali
- **Backup Configurazione**: Una copia del `config.php` di produzione è stata salvata in `PRE-PRODUZIONE/backup-config/config-PROD-server.php`.
- **Backup Database**: Il dump MySQL aggiornato è stato archiviato in `PRE-PRODUZIONE/database-backups/export_pizzi_2026-04-26.zip`.
- **Esclusione Git**: La cartella `PRE-PRODUZIONE/` è stata aggiunta al `.gitignore` per impedire che asset originali o credenziali sensibili vengano caricati sul repository pubblico.

---

## 🏁 Procedura Finale
1. Esegui la pulizia manuale sul server come indicato sopra.
2. Lancia una nuova build (`npm run build`).
3. Carica il contenuto della nuova cartella `dist/` sovrascrivendo i file rimanenti.

**Risultato atteso**: Riduzione del peso del sito di oltre 150MB e azzeramento dei file di servizio potenzialmente vulnerabili.

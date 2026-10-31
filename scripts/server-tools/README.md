# Server tools — script one-shot di manutenzione

Script di debug, migrazione e fix una-tantum. **Non vengono mai deployati**: vivono
fuori da `public/`, quindi non finiscono nella `dist/` (e in più `clean-dist.js`
rimuove comunque i pattern `debug_`, `test_`, `fix_`, `migrate_`, `check_schema`
come seconda rete di sicurezza).

## Regole d'uso

1. **Mai lasciarli sul server.** Se uno script va eseguito in produzione:
   caricarlo via FTP in `/api/`, eseguirlo, **eliminarlo subito**.
2. **Aggiungere sempre una protezione** prima di caricarlo (questi script storici
   ne sono privi — sono qui solo come riferimento). Minimo indispensabile, in testa:

   ```php
   require_once 'auth_helper.php';
   Auth::check(); // richiede sessione admin attiva
   ```

   In alternativa, un secret in query string confrontato con `hash_equals()`.
3. Gli script assumono di trovarsi in `/api/` (fanno `require_once 'db.php'`):
   eseguiti da qui non funzionano, è voluto.

## Script con runner automatico

`unisci_tag_doppioni.php` + `esegui_unione_tag.py` sono la versione "fatta bene" di
questo pattern, da usare come modello per i prossimi fix di dati:

- il runner **carica, esegue e cancella** in un comando solo, con la cancellazione
  in un `finally` — quindi avviene anche se l'esecuzione fallisce;
- il **token è casuale a ogni giro** e il nome del file remoto pure, quindi non
  c'è nessun segreto durevole nel repo e l'URL non è indovinabile;
- dopo la cancellazione fa una **controprova indipendente** via HTTP: lo script
  deve rispondere 404;
- gira in **anteprima** per default (fa tutto il lavoro e poi `ROLLBACK`), e scrive
  solo con `--applica`;
- il **backup dei dati toccati torna nella risposta HTTP**, non resta sul server.

Usato in produzione il 20/08/2026 per unire 22 gruppi di tag doppioni.

## Un articolo scritto fuori dal pannello, in bozza

`prepara_bozza.py` + `crea_bozza_articolo.template.php`. La cartella
dell'articolo (in `scratch/articolo-*/`, fuori da git) ha `corpo.html` con le
immagini come `src="__IMG_chiave__"`, `meta.json`, `immagini.json` e `img/`
coi .webp. Il primo comando carica le immagini via SFTP e genera
`crea_bozza.php`; poi `esegui.py` col percorso ASSOLUTO, prima in anteprima e
poi con `--applica`. Lo script si ferma se lo slug è già preso, se la
categoria non esiste o se manca un'immagine sul server.

Usato il 23/09/2026 per la bozza 89, «Il Viaggiatore, da demo di FAVELLA a
gioco da installare».

Dal 18/10/2026 `meta.json` può avere anche i due pulsanti in fondo
all'articolo (`button_a_label`, `button_a_link`, `button_b_label`,
`button_b_link`), facoltativi. Usati per la bozza 98, «PixelDebh:
Retro-Rescue! è uscito».

## Una sezione aggiunta a un articolo

`aggiorna_articolo_viaggiatore_inglese.php`, con `esegui.py` (prima in anteprima, poi con `--applica`): aggiunge in
fondo all'articolo programmato di Il Viaggiatore la sezione «In corso: Il Viaggiatore in inglese» (la 1.40.0 del
31/10/2026: il testo tradotto, la voce inglese in lavorazione, il gioco solo da scaricare). Cerca da sé l'unico
articolo programmato col Viaggiatore nel titolo (altrimenti si ferma e li elenca: l'id va in `ID_ARTICOLO`), non tocca
data di uscita né stato, non raddoppia la sezione se rilanciato, restituisce il corpo di prima e segnala i punti che
portano ancora alla versione nel browser, senza toccarli. Provato il 31/10/2026 su un SQLite di prova.

## File sul server che il repo non ha

`residui.py elenco` confronta il docroot con `public/` per MD5 e stampa i file
in più sul server (salta `uploads/`, `relitto/`, `temp/`, `images/`, le
credenziali e la verifica di Search Console). `scarica` li copia in una
cartella locale controllando l'MD5; `cancella` toglie un file solo se la copia
locale è identica a quella del server, poi controlla che l'indirizzo dia 404.

Usato il 19/10/2026 per i sei file del sito «MPA» di aprile
(`assets/css/custom_mpa.css`, `style.css`, `assets/js/main.js`, `search.js`,
`pages/article.php`, `category.php`); la copia sta in
`F:\Backup\SimonePizziWebSite\2026-10-19_residui-server`.

## Che PHP risponde alle pagine

`esegui.py controlla_php.php` stampa la versione, il php.ini, i file ini
aggiuntivi e le impostazioni che contano (`session.upload_progress.enabled`,
`memory_limit`, `post_max_size`, …) **del PHP che serve il web**. Da
terminale non si vede: il `php` della shell è un altro binario (8.2), mentre le
pagine passano da `/usr/local/dh/cgi-system/php83.cgi`. Non scrive niente.

Usato il 22/10/2026 per PHP2Shell (CVE-2026-109618/109619): PHP 8.3.36, e
`session.upload_progress.enabled` a 0. DreamHost l'aveva già spenta nella sua
configurazione; la stessa riga sta anche in `~/.php/8.3/phprc`, sotto la
sezione gestita da DreamHost, così resta spenta se la riaccendono. La copia
del phprc di prima sta in `~/backup-config/phprc-8.3.2026-10-22`. Il phprc si
rilegge solo quando ripartono i processi: `pkill -u $(whoami) -x php83.cgi`.

La barra di avanzamento dei caricamenti non ne ha bisogno: nel React la
calcolava il browser (`xhr.upload.onprogress`), e lo stesso vale per quella da
rifare.

## Verifica periodica

Controllare che nessuno script residuo sia raggiungibile in produzione:
`https://simonepizzi.runtimeradio.it/api/debug_check.php` (e simili) devono dare 404.
Ultima verifica completa: 2026-06-11, tutto pulito.

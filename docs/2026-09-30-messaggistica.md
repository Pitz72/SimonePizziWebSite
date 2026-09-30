# Messaggistica — niente email in pagina (30/09/2026)

Il sito non scrive più nessun indirizzo email. Chi vuole contattare Simone usa il modulo di
`/contatti`, e la conversazione resta dentro il sito. Il sistema è quello del Festival
(`FDCA-PHP`, v1.23.0), portato qui senza il contatore orario e senza la coda della posta.

## Come funziona

1. **Il modulo** (`pages/contatti.php` → `contatti_invia()` in `lib/contatti.php`). POST normale con
   redirect. Nome, email, messaggio, consenso alla privacy. Freni: campo trappola per i robot,
   4 messaggi l'ora per rete (hash dell'IP, già in `messages.ip_hash`).
2. **L'avviso**. Simone riceve un'email con il testo e il pulsante «Rispondi dal pannello».
3. **Il pannello** (`admin/messaggi.php`). Elenco con stati (nuovo / letto / risposto / archiviato),
   conversazione in ordine, campo per rispondere. La risposta parte per email da `manda_posta()`.
4. **L'email di risposta** porta il pulsante «Rispondi a Simone», che apre `/messaggio?t=GETTONE`:
   gettone di 32 caratteri esadecimali, uno per conversazione, creato alla prima risposta.
5. **La pagina `/messaggio`** mostra la conversazione e un campo per scrivere. Nessun account.
   Su GET non scrive niente (i filtri antispam pre-caricano i link). La risposta rientra nel
   pannello e il messaggio torna «nuovo». Il link vale 60 giorni dall'ultima risposta di Simone:
   scaduto, non mostra più nemmeno la conversazione. Freni: 5 risposte l'ora per conversazione,
   10 da tutte.

Il Reply-To delle email è ancora la casella vera (`MAIL_INFO`): chi preme «Rispondi» invece del
pulsante non scrive nel vuoto. Quell'indirizzo sta solo in `api/config.php`, non in pagina.

## Da fare prima di caricare

In `public/api/config.php` sul server (fuori da git) vanno aggiunte le costanti di
`config.example.php`:

| Costante | A cosa serve |
|---|---|
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | La casella da cui parte tutta la posta del sito. Senza, si ricade su `mail()`. |
| `MAIL_FROM` | Facoltativa. Deve essere dello stesso dominio di `SMTP_USER`, altrimenti il mittente diventa l'utenza. |
| `MAIL_INFO` | Dove arrivano gli avvisi e dove va chi risponde all'email. Senza, nessun avviso: i messaggi restano nel pannello. |

Lo schema si aggiorna da solo (`assicura_messaggistica()` in `lib/db_maintenance.php`): aggiunge
`messages.status`, `messages.reply_token` e la tabella `message_replies`. I messaggi già presenti
prendono lo stato da `read_at`. Si applica alla prima visita di `/contatti`, di `/messaggio` o
del pannello.

## Cosa è cambiato in giro

- `api/messages.php` (POST pubblico del sito React, `mail()` nudo, indirizzo scritto nel codice)
  è stato tolto dal repo. **Va tolto anche dal server.**
- `api/newsletter_send.php`, `api/subscribers.php` (email di conferma), `api/auth.php` e
  `lib/auth.php` (recupero password) spediscono da `manda_posta()` invece che da `mail()`, e
  l'indirizzo di Simone non è più scritto nel codice.
- `privacy.php` e `cookie-policy.php` rimandano al modulo invece di scrivere l'indirizzo, e
  descrivono il percorso dei messaggi.
- Il modulo non ha più il campo «oggetto». I messaggi vecchi lo conservano e il pannello lo mostra.

## Fuori portata, di proposito

- **Coda e tetto orario** del Festival (`mail_queue`, contatore dell'ora): qui la posta è poca.
  Se una newsletter dovesse superare la quota di DreamHost, il pezzo si prende da
  `FDCA-PHP/public/lib/mailer.php`.
- **Articoli con indirizzi nel testo**: alcuni articoli pubblicati citano una casella nel corpo
  (Ecosystem.runtime, Runtime Live Machine Pro, La Santa Maria ha un indirizzo, Quattro verbi che
  non facevano niente). Sono testo editoriale: vanno riscritti a mano, non con un cerca-e-sostituisci.
- **Cancellazione dopo 12 mesi**: la privacy policy lo promette per i messaggi del modulo, ma
  nessun giro di manutenzione lo fa ancora.

## Come si prova

Il collaudo scrive nel database di sviluppo e cancella quello che crea:

```
php scripts/sviluppo/popola-dati-finti.php      # una volta: aggiunge le tabelle nuove
printf '<?php\ndefine("MAIL_INFO","prova@esempio.it");\nreturn require "%s/public/dev-router.php";\n' "$PWD" > /tmp/router.php
php -S 127.0.0.1:8124 -t public /tmp/router.php &
bash docs/collaudo/prova-messaggi.sh http://127.0.0.1:8124      # 24 prove
```

In sviluppo le email non partono: si scrivono come file in `scratch/posta/`.

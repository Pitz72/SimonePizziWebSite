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

## Verifica periodica

Controllare che nessuno script residuo sia raggiungibile in produzione:
`https://simonepizzi.runtimeradio.it/api/debug_check.php` (e simili) devono dare 404.
Ultima verifica completa: 2026-06-11, tutto pulito.

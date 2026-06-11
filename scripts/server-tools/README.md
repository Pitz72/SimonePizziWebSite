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

## Verifica periodica

Controllare che nessuno script residuo sia raggiungibile in produzione:
`https://simonepizzi.runtimeradio.it/api/debug_check.php` (e simili) devono dare 404.
Ultima verifica completa: 2026-06-11, tutto pulito.

# Simone Pizzi — portfolio e blog

Il sito di Simone Pizzi, **https://simonepizzi.runtimeradio.it**, con il suo
pannello di gestione. Dal 7 settembre 2026 è **PHP puro, senza React, senza
build e senza npm**: si modifica un file e si carica quel file. Il sito React
che c'era prima è nella storia di git (l'ultimo commit che lo contiene è
`3709693`).

La documentazione parte da **[docs/README.md](docs/README.md)**. Le scelte della
migrazione stanno in `docs/design/2026-09-proposte/DECISIONI.md`, lo stato del
sito nella revisione più recente, `docs/AUDIT-2026-10-16.md`.

## Com'è fatto

```
public/                il docroot: si carica così com'è
  index.php            front controller: legge l'indirizzo, sceglie la pagina
  .htaccess            riscritture, CSP, regole di sicurezza
  lib/                 avvio, database, query, cache, freni, seo, safe_html…
  partials/  pages/    i pezzi delle pagine pubbliche
  admin/               il pannello, una pagina PHP per schermata
  api/                 i pochi endpoint che il JavaScript chiama
  assets/              css, js (nessuna libreria), caratteri in casa
  uploads/             le immagini caricate: stanno solo sul server
docs/                  documentazione, revisioni, collaudi
scripts/               sviluppo, caricamento, strumenti per il server
```

In produzione il database è MySQL su DreamHost, chiuso da fuori. In sviluppo è
un file SQLite costruito dai dati pubblici del sito.

## Sviluppo

```bash
bash scripts/sviluppo/scarica-dati.sh          # i dati veri, dalle API pubbliche
php  scripts/sviluppo/crea-db-sviluppo.php     # → scratch/sviluppo.sqlite
php  scripts/sviluppo/popola-dati-finti.php    # utenti, iscritti, messaggi finti
php -S 127.0.0.1:8123 -t public public/dev-router.php
```

Nel pannello di sviluppo si entra con `simone` / `sviluppo-locale`.

## Collaudo

```bash
bash docs/collaudo/prova-rotte.sh        # le pagine, la SEO, la privacy
bash docs/collaudo/prova-pannello.sh     # il pannello, scrivendo davvero
bash docs/collaudo/prova-sicurezza.sh    # CSP, sessione, freni, impronte, API
bash docs/collaudo/prova-dati.sh         # pulsanti, slug, libreria, cache, backup
php  docs/collaudo/prova-safe-html.php   # la ripulitura dell'HTML
bash docs/collaudo/prova-messaggi.sh http://127.0.0.1:8124   # vedi il file
bash docs/collaudo/prova-produzione.sh   # il sito vero, da fuori
```

## Caricamento

```bash
python scripts/deploy/carica.py --prova  # che cosa farebbe
python scripts/deploy/carica.py          # carica, con la copia dei file sostituiti
python scripts/server-tools/scarica_backup.py   # una copia dei backup fuori da DreamHost
```

Le credenziali stanno in `.secrets/`, fuori da git.

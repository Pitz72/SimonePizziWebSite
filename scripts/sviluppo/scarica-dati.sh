#!/usr/bin/env bash
# Scarica dal sito in produzione i dati che servono a costruire il database di
# sviluppo. Serve perché in locale MySQL non è raggiungibile (DreamHost non
# accetta connessioni da fuori) mentre le API pubbliche rispondono a chiunque.
#
#   bash scripts/sviluppo/scarica-dati.sh
#   php  scripts/sviluppo/crea-db-sviluppo.php
#
# L'agente va dichiarato: DreamShield risponde 418 a quelli che non riconosce.

set -euo pipefail

ORIGINE="https://simonepizzi.runtimeradio.it"
AGENTE="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36"
DEST="$(cd "$(dirname "$0")/../.." && pwd)/scratch/dati-produzione"

mkdir -p "$DEST"

prendi() {
  local nome="$1" percorso="$2"
  printf '  %-12s ' "$nome"
  curl -sS -m 90 -A "$AGENTE" "$ORIGINE$percorso" -o "$DEST/$nome.json"
  printf '%s KB\n' "$(( $(wc -c < "$DEST/$nome.json") / 1024 ))"
}

echo "Scarico da $ORIGINE:"
prendi articles   "/api/articles.php?limit=500"
prendi categories "/api/categories.php"
prendi projects   "/api/projects.php"
echo "Fatto. Adesso: php scripts/sviluppo/crea-db-sviluppo.php"

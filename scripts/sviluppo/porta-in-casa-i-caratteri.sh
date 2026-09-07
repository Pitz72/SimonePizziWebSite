#!/usr/bin/env bash
# Porta in casa i tre caratteri del sito e scrive public/assets/css/caratteri.css.
#
# Perché. Oggi index.html chiede i font a fonts.googleapis.com a ogni visita:
# vuol dire mandare l'indirizzo IP di ogni lettore a Google senza averglielo
# chiesto. Il Festival li ha già in casa; qui si fa lo stesso. Con i file sul
# nostro server, dalla CSP escono fonts.googleapis.com e fonts.gstatic.com.
#
#   bash scripts/sviluppo/porta-in-casa-i-caratteri.sh
#
# Da rilanciare solo se si cambia carattere o se Google pubblica una revisione
# nuova. I file prodotti stanno in git: fanno parte del sito.

set -euo pipefail

RADICE="$(cd "$(dirname "$0")/../.." && pwd)"
FONTS="$RADICE/public/assets/fonts"
CSS="$RADICE/public/assets/css/caratteri.css"
AGENTE="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"

# L'agente moderno serve: a un browser vecchio Google risponde con .ttf
# invece che con .woff2, che pesa il triplo.
FAMIGLIE=(
  "family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800"
  "family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,400"
  "family=Courier+Prime:wght@400;700"
)

mkdir -p "$FONTS" "$(dirname "$CSS")"
GREZZO="$(mktemp)"
trap 'rm -f "$GREZZO"' EXIT

echo "Chiedo i fogli di stile a Google…"
for f in "${FAMIGLIE[@]}"; do
  curl -sS -A "$AGENTE" "https://fonts.googleapis.com/css2?$f&display=swap" >> "$GREZZO"
  printf '\n' >> "$GREZZO"
done

echo "Scarico i file dei caratteri…"
grep -o 'https://fonts.gstatic.com/[^)]*\.woff2' "$GREZZO" | sort -u | while read -r url; do
  # /s/dmsans/v17/rP2Hp2ywxg089UriCZ2IHSeH.woff2 → dmsans-rP2Hp2ywxg089UriCZ2IHSeH.woff2
  famiglia="$(echo "$url" | sed -E 's#.*/s/([^/]+)/.*#\1#')"
  nome="$famiglia-$(basename "$url")"
  [ -f "$FONTS/$nome" ] || curl -sS -A "$AGENTE" "$url" -o "$FONTS/$nome"
  printf '  %-64s %s KB\n' "$nome" "$(( $(wc -c < "$FONTS/$nome") / 1024 ))"
done

echo "Scrivo $CSS…"
{
  cat <<'INTESTAZIONE'
/* I caratteri del sito, serviti da qui e non da Google.
   Generato da scripts/sviluppo/porta-in-casa-i-caratteri.sh: non si modifica
   a mano, si rilancia lo script. Gli unicode-range sono quelli di Google e
   servono a scaricare solo il pezzo di alfabeto che una pagina usa davvero. */
INTESTAZIONE
  sed -E \
    -e 's#https://fonts\.gstatic\.com/s/([^/]+)/[^/]+/([^)]+\.woff2)#/assets/fonts/\1-\2#g' \
    "$GREZZO"
} > "$CSS"

echo "Fatto: $(grep -c '@font-face' "$CSS") facce, $(ls -1 "$FONTS" | wc -l) file."

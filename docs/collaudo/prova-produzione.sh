#!/usr/bin/env bash
# Collauda un sito vero, dall'esterno: le rotte, tutta la sitemap, gli header.
#
#   bash docs/collaudo/prova-produzione.sh                                  # produzione
#   bash docs/collaudo/prova-produzione.sh http://127.0.0.1:8123            # in locale
#
# Serve dopo un caricamento, quando la domanda non è «il codice è giusto» ma
# «il sito risponde». Va lanciato da fuori, con curl, come farebbe un lettore.
#
# L'agente va dichiarato: DreamShield risponde 418 a quelli che non riconosce,
# e senza questo ogni prova fallirebbe per il motivo sbagliato.

set -uo pipefail

SITO="${1:-https://simonepizzi.runtimeradio.it}"
AGENTE="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/128 Safari/537.36"
CORPO="$(mktemp)"
SITEMAP="$(mktemp)"
trap 'rm -f "$CORPO" "$SITEMAP"' EXIT

passate=0
fallite=0
ok() { passate=$((passate + 1)); printf '  ok  %s\n' "$1"; }
no() { fallite=$((fallite + 1)); printf '  NO  %s — %s\n' "$1" "$2"; }

prendi() { curl -sS -m 25 -A "$AGENTE" "$@"; }

# controlla <atteso> <percorso> [testo-che-deve-esserci] [tipo]
#   tipo "file" per css/js/immagini, che un <title> non ce l'hanno
controlla() {
  local atteso="$1" percorso="$2" cerca="${3:-}" tipo="${4:-html}" stato nudo titolo
  stato="$(prendi -o "$CORPO" -w '%{http_code}' "$SITO$percorso")"
  nudo="$(sed 's/<[^>]*>//g' "$CORPO")"

  if [ "$stato" != "$atteso" ]; then no "$percorso" "stato $stato invece di $atteso"; return; fi

  if printf '%s' "$nudo" | grep -qiE 'Fatal error|Parse error|Uncaught |Warning|Notice'; then
    no "$percorso" "errore PHP nella pagina"
    printf '%s' "$nudo" | grep -oiE '(Fatal error|Uncaught|Warning|Notice)[^\n]{0,110}' | head -1 | sed 's/^/        /'
    return
  fi

  if [ "$atteso" = "200" ] && [ "$tipo" = "file" ]; then ok "$percorso  [$stato]"; return; fi

  if [ "$atteso" = "200" ]; then
    titolo="$(grep -o '<title>[^<]*</title>' "$CORPO" | head -1 | sed 's/<[^>]*>//g')"
    if [ -z "$titolo" ]; then no "$percorso" "manca il <title>"; return; fi
    if [ -n "$cerca" ] && ! grep -q "$cerca" "$CORPO"; then
      no "$percorso" "non contiene «$cerca»"; return
    fi
    ok "$percorso  ($titolo)"
    return
  fi
  ok "$percorso  [$stato]"
}

echo
echo "════ $SITO ════"
echo
echo "Le pagine che fanno il sito"
controlla 200 "/"                  "Creazioni"
controlla 200 "/videogiochi"
controlla 200 "/progetti-software"
controlla 200 "/narrativa-e-pubblicazioni"
controlla 200 "/podcast-audio-altro"
controlla 200 "/blog-e-riflessioni"
controlla 200 "/web"
controlla 200 "/tutti-i-progetti"
controlla 200 "/contatti"
controlla 200 "/web/fdca-il-capolavoro-non-ha-una-riga-di-react" 'class="corpo"'
controlla 200 "/tag/php"
controlla 404 "/questo-indirizzo-non-esiste"

echo
echo "I file di servizio"
controlla 200 "/assets/css/base.css"      "" file
controlla 200 "/assets/js/interfaccia.js" "" file
for f in "/sitemap.xml" "/robots.txt" "/api/rss.php"; do
  stato="$(prendi -o /dev/null -w '%{http_code}' "$SITO$f")"
  if [ "$stato" = "200" ]; then ok "$f  [$stato]"; else no "$f" "stato $stato"; fi
done

echo
echo "La porta del pannello"
stato="$(prendi -o /dev/null -w '%{http_code}' "$SITO/admin/")"
if [ "$stato" = "302" ] || [ "$stato" = "301" ]; then ok "/admin/ rimanda all'ingresso  [$stato]"
else no "/admin/" "stato $stato: dovrebbe rimandare a entra.php"; fi
controlla 200 "/admin/entra.php"

echo
echo "Gli header"
INTESTAZIONI="$(prendi -D - -o /dev/null "$SITO/")"
for atteso in "content-security-policy" "x-content-type-options" "referrer-policy"; do
  if printf '%s' "$INTESTAZIONI" | grep -qi "^$atteso"; then ok "$atteso c'è"
  else no "$atteso" "non arriva"; fi
done
if printf '%s' "$INTESTAZIONI" | grep -qi "content-security-policy.*nonce-"; then
  ok "la CSP ha il nonce (la manda PHP, non l'.htaccess)"
else
  no "CSP col nonce" "arriva quella senza nonce: l'.htaccess la sta ancora sovrascrivendo"
fi

echo
echo "Tutta la sitemap"
prendi "$SITO/sitemap.xml" -o "$SITEMAP"
indirizzi="$(grep -o '<loc>[^<]*</loc>' "$SITEMAP" | sed 's/<[^>]*>//g' | sed 's|https\?://[^/]*||' | sort -u)"
quanti=0; rotti=0
while IFS= read -r p; do
  [ -z "$p" ] && continue
  quanti=$((quanti + 1))
  stato="$(prendi -o /dev/null -w '%{http_code}' "$SITO$p")"
  if [ "$stato" != "200" ]; then rotti=$((rotti + 1)); printf '  NO  %-58s %s\n' "$p" "$stato"; fi
done <<< "$indirizzi"

if [ "$rotti" -eq 0 ]; then
  ok "tutti e $quanti gli indirizzi della sitemap rispondono 200"
else
  no "sitemap" "$rotti indirizzi su $quanti non rispondono"
fi

echo
if [ "$fallite" -eq 0 ]; then
  echo "Tutte e $passate le prove passano."
  exit 0
else
  echo "$passate passate, $fallite FALLITE."
  exit 1
fi

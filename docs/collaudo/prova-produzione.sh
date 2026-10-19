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

  if grep -qiE 'Fatal error|Parse error|Uncaught |Warning|Notice' <<< "$nudo"; then
    no "$percorso" "errore PHP nella pagina"
    grep -oiE '(Fatal error|Uncaught|Warning|Notice)[^\n]{0,110}' <<< "$nudo" | head -1 | sed 's/^/        /'
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
# Dal 10 ottobre 2026 i progetti stanno su Ecosystem: il vecchio indirizzo ci porta.
controlla 301 "/tutti-i-progetti"
controlla 200 "/chi-sono"
controlla 200 "/contatti"
# Un articolo qualunque, preso dalla sitemap invece che scritto qui dentro.
# Scriverlo qui dentro è già costato una prova rossa: l'articolo che c'era
# fisso in questa riga è stato spostato di categoria dal pannello, e da lì il
# suo indirizzo vecchio risponde 301 — cioè il sito faceva esattamente la cosa
# giusta, ed era il collaudo a raccontare una bugia. La sitemap dice sempre
# dove stanno gli articoli oggi.
prendi "$SITO/sitemap.xml" -o "$SITEMAP"
articolo="$(grep -o '<loc>[^<]*</loc>' "$SITEMAP" | sed 's/<[^>]*>//g'             | sed 's|https\?://[^/]*||' | grep -E '^/[^/]+/[^/]+$' | head -1)"
if [ -n "$articolo" ]; then controlla 200 "$articolo" 'class="corpo"'
else no "articolo" "nella sitemap non c'è un solo indirizzo di articolo"; fi

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

# Il POST del login: aprire la pagina non basta, perché il guasto sta nel
# percorso che si attraversa solo premendo «Entra». È successo davvero — una
# colonna con il nome sbagliato, 500 in faccia a chi provava a entrare — e
# aprire /admin/entra.php in GET rispondeva 200 come niente fosse.
# Si prova con credenziali sbagliate apposta: deve rispondere 200 e dire di no.
BISCOTTI="$(mktemp)"
G="$(prendi -c "$BISCOTTI" "$SITO/admin/entra.php"      | grep -o 'name="gettone" value="[a-f0-9]*"' | head -1 | sed 's/.*value="//;s/"//')"
stato="$(prendi -b "$BISCOTTI" -c "$BISCOTTI" -o "$CORPO" -w '%{http_code}'          -d "gettone=$G&nome=nessuno-di-sicuro&password=sbagliata-apposta"          "$SITO/admin/entra.php")"
if [ "$stato" = "200" ] && grep -qi "non corretti" "$CORPO"; then
  ok "il login risponde e rifiuta le credenziali sbagliate"
else
  no "POST del login" "stato $stato: guarda il log, di solito è una colonna che non c'è"
fi
rm -f "$BISCOTTI"

echo
echo "Gli header"
INTESTAZIONI="$(prendi -D - -o /dev/null "$SITO/")"
for atteso in "content-security-policy" "x-content-type-options" "referrer-policy"; do
  if grep -qi "^$atteso" <<< "$INTESTAZIONI"; then ok "$atteso c'è"
  else no "$atteso" "non arriva"; fi
done
# La CSP vale qualcosa solo se gli script scritti dentro la pagina non passano.
# Dal 3 al 16 ottobre 2026 l'.htaccess mandava 'unsafe-inline' (revisione del
# 16 ottobre, G2): la riga che prima cercava il nonce non se ne accorgeva.
csp_script="$(grep -i '^content-security-policy' <<< "$INTESTAZIONI" | grep -o "script-src[^;]*")"
if [ -n "$csp_script" ] && ! grep -q "unsafe-inline" <<< "$csp_script"; then
  ok "la CSP non ammette script in linea ($csp_script)"
else
  no "CSP" "script-src ammette script in linea: «$csp_script»"
fi
if grep -i '^content-security-policy' <<< "$INTESTAZIONI" | grep -q 'googleapis\|gstatic'; then
  no "CSP" "ammette ancora i domini di Google Fonts, che il sito non usa"
else
  ok "la CSP non nomina Google Fonts"
fi

echo
echo "Quello che da fuori non si deve vedere"
# Revisione del 16 ottobre, M1 e L1.
for d in /lib/ /api/ /pages/ /partials/ /assets/ /images/; do
  # Su file e non in una pipe: con pipefail, grep -q che trova subito darebbe un falso «ok».
  prendi "$SITO$d" -o "$CORPO"
  if grep -q "Index of" "$CORPO"; then no "$d" "mostra l'elenco dei file"
  else ok "$d non mostra l'elenco dei file"; fi
done
for f in /partials/head.php /pages/home.php /lib/avvio.php /api/config.php /api/db.php; do
  stato="$(prendi -o /dev/null -w '%{http_code}' "$SITO$f")"
  if [ "$stato" = "404" ] || [ "$stato" = "403" ]; then ok "$f è chiuso  [$stato]"
  else no "$f" "risponde $stato"; fi
done
stato="$(prendi -o /dev/null -L --max-redirs 5 -w '%{http_code}' "$SITO/uploads/" 2>/dev/null)"
if [ "$stato" = "404" ] || [ "$stato" = "403" ]; then ok "/uploads/ non gira in tondo  [$stato]"
else no "/uploads/" "stato finale $stato (rimbalzi infiniti?)"; fi

echo
echo "Le API del sito React e i cookie (revisione del 16 ottobre, M2, M6, M16)"
for ep in auth search navigation tags settings prerender; do
  stato="$(prendi -o /dev/null -w '%{http_code}' "$SITO/api/$ep.php")"
  # Spenti il 16 ottobre 2026 (410), cancellati dal server lo stesso giorno con l'ok di Simone (404).
  [ "$stato" = "404" ] && ok "/api/$ep.php non c'è più" || no "/api/$ep.php" "stato $stato"
done
stato="$(prendi -o /dev/null -w '%{http_code}' -X POST -d '{}' "$SITO/api/articles.php")"
[ "$stato" = "405" ] && ok "/api/articles.php non accetta scritture" || no "/api/articles.php" "POST risponde $stato"
T="$(printf 'a%.0s' $(seq 1 64))"
dove="$(prendi -o /dev/null -w '%{http_code} %{redirect_url}' "$SITO/api/subscribers.php?action=unsubscribe&token=$T")"
case "$dove" in 303*"/newsletter/disiscrivi?token=$T") ok "un vecchio link di disiscrizione porta al pulsante, non agisce";;
  *) no "disiscrizione via GET" "$dove";; esac
# Un segnale di lettura con un id che non esiste: non conta niente, ma dice se arriva un cookie.
TESTA_A="$(mktemp)"
prendi -D "$TESTA_A" -o /dev/null -H 'Content-Type: application/json' -d '{"type":"view","article_id":0}' "$SITO/api/analytics.php"
grep -qi '^set-cookie' "$TESTA_A" && no "analytics" "dà un cookie a chi legge" || ok "il segnale delle letture non dà cookie"
prendi -D "$TESTA_A" -o /dev/null "$SITO/admin/entra.php"
biscotto="$(grep -i '^set-cookie' "$TESTA_A" | tr -d '\r' | head -1)"
grep -q '__Host-sp_admin=' <<< "$biscotto" && grep -qi 'samesite=strict' <<< "$biscotto" \
  && ok "il cookie del pannello è __Host- e SameSite=Strict" || no "cookie del pannello" "«$biscotto»"
rm -f "$TESTA_A"

echo
echo "Quello che le pagine devono dire"
prendi "$SITO/" -o "$CORPO"
grep -q 'href="/privacy"' "$CORPO" && grep -q 'href="/cookie-policy"' "$CORPO" \
  && ok "il piede porta a privacy e cookie policy" || no "piede" "mancano i link legali (G4)"
grep -q '/assets/css/main.css?v=' "$CORPO" \
  && ok "CSS e JavaScript hanno la loro versione" || no "versione dei file" "main.css senza ?v= (M4)"
# Il titolo per Google: sui primi dieci articoli della sitemap almeno uno deve
# averne uno scritto a mano. og:title è il titolo intero dell'articolo; il
# <title> è o il titolo per Google (diverso da tutti e due i casi qui sotto) o
# «titolo — Simone Pizzi». Prima della correzione erano identici (G1).
diversi=0; immagine_relativa=0
for p in $(grep -o '<loc>[^<]*</loc>' "$SITEMAP" | sed 's/<[^>]*>//g' | sed 's|https\?://[^/]*||' | grep -E '^/[^/]+/[^/]+$' | head -10); do
  prendi "$SITO$p" -o "$CORPO"
  t="$(grep -o '<title>[^<]*</title>' "$CORPO" | sed 's/<[^>]*>//g')"
  o="$(grep -o 'property="og:title" content="[^"]*"' "$CORPO" | sed 's/.*content="//;s/"$//')"
  [ "$t" != "$o" ] && [ "$t" != "$o — Simone Pizzi" ] && diversi=$((diversi + 1))
  grep -q '"image":\["/' "$CORPO" && immagine_relativa=$((immagine_relativa + 1))
done
if [ "$diversi" -gt 0 ]; then ok "il titolo per Google arriva alla pagina ($diversi articoli su 10)"
else no "titolo per Google" "nessuno dei primi dieci articoli lo usa"; fi
if [ "$immagine_relativa" -eq 0 ]; then ok "nei dati strutturati le immagini hanno l'indirizzo completo"
else no "dati strutturati" "$immagine_relativa articoli con l'immagine relativa (M10)"; fi

echo
echo "SEO: sitemap, feed, archivio (revisione del 16 ottobre, M7, M11, L16)"
TESTA_S="$(mktemp)"
prendi -D "$TESTA_S" -o /dev/null "$SITO/sitemap.xml"
quante="$(grep -ci '^cache-control' "$TESTA_S")"
if [ "$quante" = "1" ] && ! grep -qi '^expires' "$TESTA_S"; then ok "la sitemap ha una cache sola, di un'ora"
else no "cache della sitemap" "$(grep -i '^cache-control\|^expires' "$TESTA_S" | tr -d '\r' | tr '\n' ' ')"; fi
rm -f "$TESTA_S"
grep -q '<loc>https://simonepizzi.runtimeradio.it/archivio</loc>' "$SITEMAP" && ok "l'archivio è nella sitemap" || no "sitemap" "manca /archivio"
host_diversi="$(grep -o '<loc>https\?://[^/]*' "$SITEMAP" | sort -u | wc -l)"
[ "$host_diversi" = "1" ] && ok "la sitemap usa un dominio solo" || no "sitemap" "$host_diversi domini diversi"
prendi "$SITO/api/rss.php" -o "$CORPO"
if grep -q 'atom:link' "$CORPO" && grep -q 'urn:simonepizzi:article:' "$CORPO" && [ "$(grep -c '<item>' "$CORPO")" -le 30 ]; then
  ok "il feed ha i GUID stabili, atom:link, al massimo 30 voci"
else no "feed" "manca qualcosa"; fi
controlla 200 "/archivio" "dal pi"

echo
echo "Tutta la sitemap"
prendi "$SITO/sitemap.xml" -o "$SITEMAP"
indirizzi="$(grep -o '<loc>[^<]*</loc>' "$SITEMAP" | sed 's/<[^>]*>//g' | sed 's|https\?://[^/]*||' | sort -u)"
quanti=0; rotti=0; con_iframe=0
while IFS= read -r p; do
  [ -z "$p" ] && continue
  quanti=$((quanti + 1))
  stato="$(prendi -o "$CORPO" -w '%{http_code}' "$SITO$p")"
  # Un iframe in pagina è una richiesta a terzi prima di ogni scelta del lettore (M12).
  if grep -q '<iframe' "$CORPO"; then con_iframe=$((con_iframe + 1)); printf '  NO  %-58s carica un iframe\n' "$p"; fi
  if [ "$stato" != "200" ]; then rotti=$((rotti + 1)); printf '  NO  %-58s %s\n' "$p" "$stato"; fi
done <<< "$indirizzi"
if [ "$con_iframe" -eq 0 ]; then ok "nessuna pagina carica un iframe prima del clic del lettore"
else no "video" "$con_iframe pagine caricano un iframe da sole"; fi

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

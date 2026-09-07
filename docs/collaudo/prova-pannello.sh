#!/usr/bin/env bash
# Prova il pannello: entra, apre ogni schermata, scrive e cancella davvero.
#
#   php -S 127.0.0.1:8123 -t public public/dev-router.php &
#   bash docs/collaudo/prova-pannello.sh
#
# Le prove che contano sono le ultime: creare un articolo, ritrovarlo dal sito
# pubblico solo dopo averlo pubblicato, duplicarlo, cancellarlo. Aprire una
# schermata dice poco; scriverci dentro dice tutto.

set -uo pipefail

BASE="${1:-http://127.0.0.1:8123}"
BISCOTTI="$(mktemp)"
CORPO="$(mktemp)"
trap 'rm -f "$BISCOTTI" "$CORPO"' EXIT

passate=0
fallite=0

ok()  { passate=$((passate + 1)); printf '  ok  %s\n' "$1"; }
no()  { fallite=$((fallite + 1)); printf '  NO  %s — %s\n' "$1" "$2"; }

# Il gettone anti-CSRF cambia a ogni pagina: si prende da quella che si sta per usare.
gettone() {
  curl -s -b "$BISCOTTI" -c "$BISCOTTI" "$BASE$1" \
    | grep -o 'name="gettone" value="[a-f0-9]*"' | head -1 | sed 's/.*value="//;s/"//'
}

# apri <atteso> <percorso> <descrizione>
apri() {
  local atteso="$1" percorso="$2" nome="$3" stato nudo
  stato="$(curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o "$CORPO" -w '%{http_code}' "$BASE$percorso")"
  nudo="$(sed 's/<[^>]*>//g' "$CORPO")"

  if [ "$stato" != "$atteso" ]; then no "$nome" "stato $stato invece di $atteso"; return; fi
  if printf '%s' "$nudo" | grep -qiE 'Fatal error|Parse error|Uncaught |Warning|Notice'; then
    no "$nome" "errore PHP nella pagina"
    printf '%s' "$nudo" | grep -oiE '(Fatal error|Uncaught|Warning|Notice)[^\n]{0,120}' | head -1 | sed 's/^/        /'
    return
  fi
  ok "$nome"
}

echo
echo "La porta"
apri 302 "/admin/"           "senza sessione il pannello rimanda all'ingresso"
apri 200 "/admin/entra.php"  "la pagina di ingresso si apre"

G="$(gettone /admin/entra.php)"
curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o "$CORPO" \
     -d "gettone=$G&nome=simone&password=sbagliata" "$BASE/admin/entra.php"
if grep -q "non corretti" "$CORPO"; then ok "una password sbagliata non entra"; else no "password sbagliata" "è entrata lo stesso"; fi

G="$(gettone /admin/entra.php)"
stato="$(curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o /dev/null -w '%{http_code}' \
         -d "gettone=$G&nome=simone&password=sviluppo-locale" "$BASE/admin/entra.php")"
if [ "$stato" = "302" ]; then ok "la password giusta entra"; else no "login" "stato $stato"; fi

echo
echo "Le schermate"
apri 200 "/admin/"                    "cruscotto"
apri 200 "/admin/articoli.php"        "elenco articoli"
apri 200 "/admin/articoli.php?stato=draft&q=react" "elenco con filtri"
apri 200 "/admin/articolo.php"        "scheda di un articolo nuovo"
apri 200 "/admin/articolo.php?id=1"   "scheda di un articolo esistente"
apri 200 "/admin/progetti.php"        "progetti"
apri 200 "/admin/progetti.php?id=1"   "scheda di un progetto"
apri 200 "/admin/categorie.php"       "categorie"
apri 200 "/admin/tag.php"             "tag"
apri 200 "/admin/media.php"           "immagini"
apri 200 "/admin/messaggi.php"        "messaggi"
apri 200 "/admin/newsletter.php"      "newsletter"
apri 200 "/admin/sistema.php"         "sistema"
apri 200 "/admin/dati.php?cosa=media" "libreria in JSON"
apri 200 "/admin/dati.php?cosa=articoli&q=react" "ricerca articoli in JSON"

echo
echo "Il gettone dei moduli"
stato="$(curl -s -b "$BISCOTTI" -o /dev/null -w '%{http_code}' \
         -d "azione=elimina&id=1" "$BASE/admin/articoli.php")"
if [ "$stato" = "419" ]; then ok "un modulo senza gettone viene rifiutato"
else no "gettone" "stato $stato invece di 419"; fi

echo
echo "Scrivere davvero"
G="$(gettone /admin/articolo.php)"
LUOGO="$(curl -s -b "$BISCOTTI" -o /dev/null -w '%{redirect_url}' \
  -d "gettone=$G" -d "id=0" -d "title=Prova automatica del collaudo" \
  -d "excerpt=Creato dalla prova, verrà cancellato." \
  -d "content=<p>Testo.</p><h2>Sezione</h2><p>Altro.</p>" \
  -d "category=web" -d "tags=prova, collaudo" -d "status=draft" \
  "$BASE/admin/articolo.php")"
ID="$(printf '%s' "$LUOGO" | grep -o 'id=[0-9]*' | head -1 | cut -d= -f2)"
if [ -n "$ID" ]; then ok "l'articolo è stato creato (id $ID)"; else no "creazione" "nessun id nella risposta"; fi

stato="$(curl -s -o /dev/null -w '%{http_code}' "$BASE/web/prova-automatica-del-collaudo")"
if [ "$stato" = "404" ]; then ok "da bozza, sul sito pubblico dà 404"
else no "bozza" "sul sito risponde $stato invece di 404"; fi

G="$(gettone /admin/articoli.php)"
curl -s -b "$BISCOTTI" -o /dev/null -d "gettone=$G&azione=pubblica&id=$ID" "$BASE/admin/articoli.php"
stato="$(curl -s -o /dev/null -w '%{http_code}' "$BASE/web/prova-automatica-del-collaudo")"
if [ "$stato" = "200" ]; then ok "una volta pubblicato, il sito lo mostra"
else no "pubblicazione" "sul sito risponde $stato invece di 200"; fi

G="$(gettone /admin/articoli.php)"
LUOGO="$(curl -s -b "$BISCOTTI" -o /dev/null -w '%{redirect_url}' \
        -d "gettone=$G&azione=duplica&id=$ID" "$BASE/admin/articoli.php")"
COPIA="$(printf '%s' "$LUOGO" | grep -o 'id=[0-9]*' | head -1 | cut -d= -f2)"
if [ -n "$COPIA" ] && [ "$COPIA" != "$ID" ]; then ok "la copia è stata creata (id $COPIA)"
else no "duplicazione" "nessuna copia"; fi

G="$(gettone /admin/articoli.php)"
curl -s -b "$BISCOTTI" -o /dev/null \
     -d "gettone=$G&azione=elimina&scelti[]=$ID&scelti[]=$COPIA" "$BASE/admin/articoli.php"
stato="$(curl -s -o /dev/null -w '%{http_code}' "$BASE/web/prova-automatica-del-collaudo")"
if [ "$stato" = "404" ]; then ok "eliminati: il sito torna a dare 404"
else no "eliminazione" "l'articolo risponde ancora $stato"; fi

echo
echo "Uscire"
curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o /dev/null "$BASE/admin/esci.php"
apri 302 "/admin/" "dopo l'uscita il pannello è di nuovo chiuso"

echo
if [ "$fallite" -eq 0 ]; then
  echo "Tutte e $passate le prove del pannello passano."
  exit 0
else
  echo "$passate passate, $fallite FALLITE."
  exit 1
fi

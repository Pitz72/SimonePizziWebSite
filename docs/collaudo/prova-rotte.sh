#!/usr/bin/env bash
# Prova che ogni rotta risponda come deve.
#
#   php -S 127.0.0.1:8123 -t public public/dev-router.php &
#   bash docs/collaudo/prova-rotte.sh
#
# PERCHÉ NON BASTA GUARDARE IL CODICE HTTP. Un errore fatale di PHP che
# succede a metà pagina arriva al browser dentro una risposta 200: gli header
# sono già partiti. La prima versione della home rispondeva 200 e mostrava un
# muro rosso di stack trace. Qui si controllano tre cose insieme: il codice
# atteso, l'assenza di errori PHP nel corpo, e la presenza di un <title>.

set -uo pipefail

BASE="${1:-http://127.0.0.1:8123}"
passate=0
fallite=0

# controlla <stato atteso> <percorso> [tipo]
#   tipo "html" (predefinito) pretende anche un <title>
#   tipo "file" è per css/js/immagini, che un <title> non ce l'hanno
controlla() {
  local atteso="$1" percorso="$2" tipo="${3:-html}"
  local risposta stato corpo errore

  risposta="$(curl -s -w '\n%{http_code}' "$BASE$percorso" || true)"
  stato="$(printf '%s' "$risposta" | tail -n1)"
  corpo="$(printf '%s' "$risposta" | sed '$d')"
  errore=""

  [ "$stato" = "$atteso" ] || errore="stato $stato invece di $atteso"

  # Gli errori di PHP finiscono nel corpo anche quando lo stato è 200.
  # I tag vanno tolti prima di cercare: display_errors scrive "<b>Warning</b>:",
  # quindi "Warning:" non è mai una stringa contigua. Cercandola così com'è, il
  # test dava per buona una home piena di warning.
  local nudo
  nudo="$(printf '%s' "$corpo" | sed 's/<[^>]*>//g')"
  if printf '%s' "$nudo" | grep -qiE 'Fatal error|Parse error|Uncaught |Warning|Deprecated:|Notice:'; then
    errore="${errore:+$errore; }errore PHP nel corpo"
  fi

  # Una pagina senza <title> è una pagina che si è interrotta prima del <head>.
  if [ "$tipo" = "html" ] && [ "$atteso" = "200" ] && ! printf '%s' "$corpo" | grep -q '<title>'; then
    errore="${errore:+$errore; }manca il <title>"
  fi

  if [ -n "$errore" ]; then
    fallite=$((fallite + 1))
    printf '  NO  %-56s %s\n' "$percorso" "$errore"
    printf '%s' "$nudo" | grep -oiE '(Fatal error|Uncaught|Warning|Notice)[^
]{0,140}' | head -2 | sed 's/^/        /'
  else
    passate=$((passate + 1))
    printf '  ok  %-56s %s\n' "$percorso" "$stato"
  fi
}

echo
echo "Le rotte fisse"
controlla 200 "/"
controlla 200 "/tutti-i-progetti"
controlla 200 "/contatti"
controlla 200 "/newsletter/confermato"
controlla 200 "/newsletter/disiscritto"

echo
echo "Le sei categorie"
for c in videogiochi progetti-software narrativa-e-pubblicazioni podcast-audio-altro blog-e-riflessioni web; do
  controlla 200 "/$c"
done

echo
echo "Sottocategorie, articoli, tag"
controlla 200 "/il-relitto-silente"
controlla 200 "/favella-1"
controlla 200 "/web/fdca-il-capolavoro-non-ha-una-riga-di-react"
controlla 200 "/il-mistero-della-santa-maria/quattro-verbi-che-non-facevano-niente"
controlla 200 "/tag/php"
controlla 200 "/tag/open-source"

echo
echo "Un indirizzo solo per ogni articolo"
# La categoria nell'indirizzo deve essere quella vera: se non lo è, si porta
# il lettore su quella giusta invece di mostrare la stessa pagina sotto due URL.
controlla 301 "/videogiochi/quattro-verbi-che-non-facevano-niente"
controlla 301 "/web/"

echo
echo "Quello che non deve esistere"
controlla 404 "/questa-non-esiste"
controlla 404 "/tag/questo-tag-non-esiste"
controlla 404 "/videogiochi/questo-articolo-non-esiste"
controlla 404 "/uno/due/tre"

echo
echo "La ricerca"
controlla 200 "/api/cerca.php?q=favella"  file
controlla 200 "/api/cerca.php?q=a"        file

echo
echo "Le pagine di servizio"
controlla 200 "/assets/css/base.css"     file
controlla 200 "/assets/css/caratteri.css" file
controlla 200 "/assets/js/interfaccia.js" file
controlla 200 "/assets/js/ricerca.js"     file
controlla 200 "/assets/js/sommario.js"    file
controlla 200 "/assets/js/reazioni.js"    file
controlla 200 "/assets/js/newsletter.js"  file

echo
if [ "$fallite" -eq 0 ]; then
  echo "Tutte e $passate le rotte rispondono come devono."
  exit 0
else
  echo "$passate passate, $fallite FALLITE."
  exit 1
fi

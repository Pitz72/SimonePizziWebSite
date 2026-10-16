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
  if grep -qiE 'Fatal error|Parse error|Uncaught |Warning|Deprecated:|Notice:' <<< "$nudo"; then
    errore="${errore:+$errore; }errore PHP nel corpo"
  fi

  # Una pagina senza <title> è una pagina che si è interrotta prima del <head>.
  if [ "$tipo" = "html" ] && [ "$atteso" = "200" ] && ! grep -q '<title>' <<< "$corpo"; then
    errore="${errore:+$errore; }manca il <title>"
  fi

  if [ -n "$errore" ]; then
    fallite=$((fallite + 1))
    printf '  NO  %-56s %s\n' "$percorso" "$errore"
    grep -oiE '(Fatal error|Uncaught|Warning|Notice)[^
]{0,140}' <<< "$nudo" | head -2 | sed 's/^/        /'
  else
    passate=$((passate + 1))
    printf '  ok  %-56s %s\n' "$percorso" "$stato"
  fi
}

echo
echo "Le rotte fisse"
controlla 200 "/"
controlla 301 "/tutti-i-progetti"
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
echo "Quello che ogni pagina deve avere"
# contiene <percorso> <testo> <che cosa si prova>
TMP_CONTIENE="$(mktemp)"
contiene() {
  # Prima su un file, poi la ricerca: con pipefail, grep -q che trova subito
  # chiude la pipe mentre curl scrive ancora una pagina lunga, e la riga fallisce
  # per colpa della prova, non del sito.
  curl -s "$BASE$1" > "$TMP_CONTIENE"
  if grep -qF -- "$2" "$TMP_CONTIENE"; then
    passate=$((passate + 1)); printf '  ok  %s\n' "$3"
  else
    fallite=$((fallite + 1)); printf '  NO  %s — in %s manca «%s»\n' "$3" "$1" "$2"
  fi
}
# Revisione del 16 ottobre: G4 (i link legali nel piede) e M4 (la versione sui file statici).
contiene "/"          'href="/privacy"'                  "il piede porta all'informativa"
contiene "/videogiochi" 'href="/cookie-policy"'          "il piede porta alla cookie policy"
contiene "/"          '/assets/css/main.css?v='          "il CSS ha la sua versione"
contiene "/"          '/assets/js/interfaccia.js?v='     "il JavaScript ha la sua versione"
contiene "/"          '/assets/css/caratteri.css?v='     "i caratteri arrivano con un <link>, non con @import"

echo
echo "SEO: archivio, sitemap, feed (revisione del 16 ottobre, M7, M11, L2, L16)"
contiene "/archivio"   'articoli, dal pi'        "l'archivio elenca tutti gli articoli"
contiene "/"           'href="/archivio">Archivio completo' "«Archivio completo» porta all'archivio vero"
contiene "/sitemap.xml" '<loc>https://simonepizzi.runtimeradio.it/archivio</loc>' "l'archivio è nella sitemap"
curl -s -H "Host: sito-falso.example" "$BASE/sitemap.xml" > "$TMP_CONTIENE"
if grep -q "sito-falso" "$TMP_CONTIENE"; then
  fallite=$((fallite + 1)); printf '  NO  la sitemap prende il dominio dall header Host\n'
else passate=$((passate + 1)); printf '  ok  la sitemap non prende il dominio dall header Host\n'; fi
curl -s -H "Host: sito-falso.example" "$BASE/api/rss.php" > "$TMP_CONTIENE"
if grep -q "sito-falso" "$TMP_CONTIENE"; then
  fallite=$((fallite + 1)); printf '  NO  il feed prende il dominio dall header Host\n'
else passate=$((passate + 1)); printf '  ok  il feed non prende il dominio dall header Host\n'; fi
oggi="$(date +%Y-%m-%d)"
futuri="$(curl -s "$BASE/sitemap.xml" | grep -o '<lastmod>[^<]*' | sed 's/<lastmod>//' | awk -v o="$oggi" '$0 > o' | wc -l)"
if [ "$futuri" -eq 0 ]; then passate=$((passate + 1)); printf '  ok  nessun lastmod nel futuro\n'
else fallite=$((fallite + 1)); printf '  NO  %s lastmod nel futuro\n' "$futuri"; fi
if curl -s "$BASE/api/rss.php" | php -r '$x=@simplexml_load_string(stream_get_contents(STDIN)); if(!$x) exit(1); $n=count($x->channel->item); $g=(string)$x->channel->item[0]->guid; exit($n>0 && $n<=30 && str_starts_with($g,"urn:simonepizzi:article:") ? 0 : 1);'; then
  passate=$((passate + 1)); printf '  ok  il feed è XML valido, al massimo 30 voci, GUID stabili\n'
else fallite=$((fallite + 1)); printf '  NO  il feed non è XML valido o ha i GUID cambiati\n'; fi
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

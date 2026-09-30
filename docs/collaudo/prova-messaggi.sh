#!/usr/bin/env bash
# Prova la messaggistica: dal modulo dei contatti alla risposta di Simone, fino
# alla pagina /messaggio dove chi ha scritto continua la conversazione.
#
# Serve un server di sviluppo il cui router definisca MAIL_INFO, altrimenti
# l'avviso a Simone non parte e la prova lo segnala. Da questa cartella:
#
#   printf '<?php\ndefine("MAIL_INFO","prova@esempio.it");\nreturn require "%s/public/dev-router.php";\n' "$PWD" > /tmp/router.php
#   php -S 127.0.0.1:8124 -t public /tmp/router.php &
#   bash docs/collaudo/prova-messaggi.sh http://127.0.0.1:8124
#
# Scrive nel database di sviluppo (scratch/sviluppo.sqlite) e nella cartella
# scratch/posta/, e alla fine cancella i messaggi che ha creato. Le email non
# partono: in sviluppo si scrivono come file.

set -uo pipefail

BASE="${1:-http://127.0.0.1:8124}"
RADICE="$(cd "$(dirname "$0")/../.." && pwd)"
BISCOTTI="$(mktemp)"
CORPO="$(mktemp)"
trap 'rm -f "$BISCOTTI" "$CORPO" "$MSGFILE"' EXIT

passate=0
fallite=0
ok() { passate=$((passate + 1)); printf '  ok  %s\n' "$1"; }
no() { fallite=$((fallite + 1)); printf '  NO  %s — %s\n' "$1" "$2"; }

# Una query sul database di sviluppo, un valore solo.
sql() {
  php -r '$d = new PDO("sqlite:" . $argv[1]); $r = $d->query($argv[2]); $v = $r ? $r->fetchColumn() : ""; echo $v === false ? "" : $v;' \
      "$RADICE/scratch/sviluppo.sqlite" "$1"
}
posta() { curl -s -o "$CORPO" -w '%{http_code}' "$@"; }
gettone() {
  curl -s -b "$BISCOTTI" -c "$BISCOTTI" "$BASE$1" | grep -o 'name="gettone" value="[a-f0-9]*"' | head -1 | sed 's/.*value="//;s/"//'
}

# La lettera accentuata arriva a curl.exe in codifica Latin-1 se passata come
# argomento, e il collaudo proverebbe la shell invece del sito: il testo va in
# un file, che curl legge byte per byte.
MSGFILE="$(mktemp)"
# curl.exe non capisce i percorsi in stile MSYS (/tmp/…): dove esiste cygpath si usa quello.
command -v cygpath >/dev/null 2>&1 && MSGFILE_CURL="$(cygpath -m "$MSGFILE")" || MSGFILE_CURL="$MSGFILE"
E="$(printf '\303\250')"
printf 'Ciao Simone, questo %s un messaggio di prova del collaudo.' "$E" > "$MSGFILE"
FRASE="questo ${E} un messaggio di prova"

echo
echo "Il modulo"
stato="$(posta "$BASE/contatti")"
if [ "$stato" = "200" ]; then ok "/contatti si apre"; else no "/contatti" "stato $stato"; fi
if grep -qE '[A-Za-z0-9._-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,}|mailto:' "$CORPO"; then
  no "nessuna email in pagina" "c'è un indirizzo o un mailto"
else ok "nessun indirizzo email in pagina"; fi

prima="$(sql 'SELECT COUNT(*) FROM messages')"
stato="$(posta -X POST "$BASE/contatti" --data-urlencode "nome=Collaudo" --data-urlencode "email=collaudo@esempio.it" --data-urlencode "messaggio@$MSGFILE_CURL")"
dopo="$(sql 'SELECT COUNT(*) FROM messages')"
if [ "$stato" = "200" ] && [ "$dopo" = "$prima" ] && grep -q 'informativa privacy' "$CORPO"; then
  ok "senza il consenso non si salva niente, e il modulo lo dice"
else no "consenso" "stato $stato, righe $prima→$dopo"; fi

stato="$(posta -X POST "$BASE/contatti" --data-urlencode "nome=Collaudo" --data-urlencode "email=non-una-email" --data-urlencode "messaggio@$MSGFILE_CURL" -d consenso=1)"
if [ "$(sql 'SELECT COUNT(*) FROM messages')" = "$prima" ] && grep -q 'indirizzo email valido' "$CORPO"; then
  ok "un indirizzo sbagliato viene rifiutato"
else no "email non valida" "stato $stato"; fi

stato="$(posta -X POST "$BASE/contatti" --data-urlencode "nome=Robot" --data-urlencode "email=robot@esempio.it" --data-urlencode "messaggio@$MSGFILE_CURL" -d consenso=1 -d hp_check=x)"
if [ "$stato" = "303" ] && [ "$(sql 'SELECT COUNT(*) FROM messages')" = "$prima" ]; then
  ok "il campo trappola riceve un successo finto e non salva niente"
else no "trappola" "stato $stato"; fi

rm -rf "$RADICE/scratch/posta"
stato="$(posta -X POST "$BASE/contatti" --data-urlencode "nome=Collaudo" --data-urlencode "email=collaudo@esempio.it" --data-urlencode "messaggio@$MSGFILE_CURL" -d consenso=1)"
ID="$(sql "SELECT MAX(id) FROM messages WHERE email = 'collaudo@esempio.it'")"
if [ "$stato" = "303" ] && [ "$(sql 'SELECT COUNT(*) FROM messages')" = "$((prima + 1))" ] \
   && [ "$(sql "SELECT status FROM messages WHERE id = $ID")" = "new" ]; then
  ok "un messaggio valido si salva come «nuovo» (#$ID)"
else no "invio" "stato $stato"; fi
if ls "$RADICE"/scratch/posta/*.html >/dev/null 2>&1 && grep -qh 'Messaggio da Collaudo' "$RADICE"/scratch/posta/*.html; then
  ok "l'avviso a Simone è partito"
else no "avviso" "nessuna email in scratch/posta (il router definisce MAIL_INFO?)"; fi

echo
echo "Il pannello"
G="$(gettone /admin/entra.php)"
stato="$(curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o /dev/null -w '%{http_code}' -d "gettone=$G&nome=simone&password=sviluppo-locale" "$BASE/admin/entra.php")"
if [ "$stato" = "302" ]; then ok "si entra"; else no "login" "stato $stato"; fi

curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o "$CORPO" "$BASE/admin/messaggi.php"
if grep -q 'Collaudo' "$CORPO"; then ok "l'elenco mostra il messaggio"; else no "elenco" "non c'è"; fi
curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o "$CORPO" "$BASE/admin/messaggi.php?vedi=$ID"
if grep -q "$FRASE" "$CORPO" && [ "$(sql "SELECT status FROM messages WHERE id = $ID")" = "read" ]; then
  ok "aprirlo lo segna come letto"
else no "apertura" "stato non cambiato"; fi

rm -rf "$RADICE/scratch/posta"
G="$(gettone "/admin/messaggi.php?vedi=$ID")"
stato="$(curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o /dev/null -w '%{http_code}' \
         --data-urlencode "gettone=$G" -d azione=rispondi -d "id=$ID" --data-urlencode "testo=Grazie del messaggio, ti rispondo qui." "$BASE/admin/messaggi.php")"
TOKEN="$(sql "SELECT reply_token FROM messages WHERE id = $ID")"
if [ "$stato" = "303" ] && [ "${#TOKEN}" = "32" ] && [ "$(sql "SELECT status FROM messages WHERE id = $ID")" = "replied" ] \
   && [ "$(sql "SELECT COUNT(*) FROM message_replies WHERE message_id = $ID AND direction = 'out'")" = "1" ]; then
  ok "la risposta si registra, il messaggio diventa «risposto» e nasce il gettone"
else no "risposta dal pannello" "stato $stato, gettone '${TOKEN}'"; fi

EMAIL="$(ls -t "$RADICE"/scratch/posta/*.html 2>/dev/null | head -1)"
if [ -n "$EMAIL" ] && grep -q "collaudo@esempio.it" "$EMAIL" && grep -q "messaggio?t=$TOKEN" "$EMAIL" \
   && grep -q 'Rispondi a Simone' "$EMAIL" && grep -q "$FRASE" "$EMAIL"; then
  ok "l'email va a chi ha scritto, con il pulsante e il messaggio citato"
else no "email di risposta" "manca il pulsante, il gettone o la citazione"; fi

echo
echo "La pagina /messaggio"
stato="$(posta "$BASE/messaggio?t=$TOKEN")"
if [ "$stato" = "200" ] && grep -q 'ti rispondo qui' "$CORPO" && grep -q 'noindex' "$CORPO"; then
  ok "il link apre la conversazione, e la pagina è noindex"
else no "apertura" "stato $stato"; fi
stato="$(posta "$BASE/messaggio?t=$TOKEN")"
if [ "$(sql "SELECT COUNT(*) FROM message_replies WHERE message_id = $ID")" = "1" ]; then
  ok "aprirla (GET) non cambia niente"
else no "GET" "ha scritto qualcosa"; fi

stato="$(posta "$BASE/messaggio?t=00000000000000000000000000000000")"
if grep -q 'nessuna conversazione' "$CORPO" && ! grep -q 'ti rispondo qui' "$CORPO"; then ok "un gettone inventato non apre niente"; else no "gettone falso" "stato $stato"; fi
stato="$(posta "$BASE/messaggio")"
if grep -q 'nessuna conversazione' "$CORPO"; then ok "senza gettone non apre niente"; else no "senza gettone" "stato $stato"; fi

rm -rf "$RADICE/scratch/posta"
stato="$(posta -X POST "$BASE/messaggio" -d "t=$TOKEN" --data-urlencode "risposta=Perfetto, grazie mille.")"
if [ "$stato" = "303" ] && [ "$(sql "SELECT COUNT(*) FROM message_replies WHERE message_id = $ID AND direction = 'in'")" = "1" ] \
   && [ "$(sql "SELECT status FROM messages WHERE id = $ID")" = "new" ]; then
  ok "la risposta rientra nel pannello e il messaggio torna «nuovo»"
else no "risposta dalla pagina" "stato $stato"; fi
if grep -qh 'Risposta da Collaudo' "$RADICE"/scratch/posta/*.html 2>/dev/null; then ok "Simone riceve l'avviso"; else no "avviso risposta" "non partito"; fi
posta "$BASE/messaggio?t=$TOKEN" >/dev/null
if grep -q 'Perfetto, grazie mille' "$CORPO"; then ok "la conversazione mostra la risposta"; else no "conversazione" "manca"; fi

for i in 1 2 3 4; do posta -X POST "$BASE/messaggio" -d "t=$TOKEN" --data-urlencode "risposta=Ancora $i" >/dev/null; done
stato="$(posta -X POST "$BASE/messaggio" -d "t=$TOKEN" --data-urlencode "risposta=Una di troppo")"
if [ "$stato" = "200" ] && grep -q 'molte risposte' "$CORPO" && [ "$(sql "SELECT COUNT(*) FROM message_replies WHERE message_id = $ID AND direction = 'in'")" = "5" ]; then
  ok "dopo cinque risposte in un'ora la sesta si ferma"
else no "freno" "stato $stato"; fi

stato="$(posta -X POST "$BASE/messaggio" -d "t=$TOKEN" -d hp_check=x --data-urlencode "risposta=Sono un robot")"
if [ "$(sql "SELECT COUNT(*) FROM message_replies WHERE message_id = $ID")" = "6" ]; then ok "il campo trappola non scrive niente"; else no "trappola" "ha scritto"; fi

echo
echo "La scadenza"
sql "UPDATE message_replies SET sent_at = '2020-01-01 10:00:00' WHERE message_id = $ID AND direction = 'out'" >/dev/null
posta "$BASE/messaggio?t=$TOKEN" >/dev/null
if grep -q 'scaduto' "$CORPO" && ! grep -q 'ti rispondo qui' "$CORPO" && ! grep -q 'Perfetto, grazie mille' "$CORPO"; then
  ok "scaduto, il link non mostra più la conversazione"
else no "scadenza in lettura" "la mostra ancora"; fi
stato="$(posta -X POST "$BASE/messaggio" -d "t=$TOKEN" --data-urlencode "risposta=Tardi")"
if grep -q 'scaduto' "$CORPO" && [ "$(sql "SELECT COUNT(*) FROM message_replies WHERE message_id = $ID")" = "6" ]; then
  ok "scaduto, il link non accetta più risposte"
else no "scadenza in scrittura" "ha scritto"; fi

echo
echo "La pulizia a sei mesi"
sql "DELETE FROM messages WHERE email LIKE 'pulizia-%@esempio.it'" >/dev/null
crea() {  # crea <sigla> <messaggio: mesi fa>
  sql "INSERT INTO messages (name, email, subject, message, ip_hash, status, created_at) VALUES ('Pulizia $1', 'pulizia-$1@esempio.it', '', 'prova di pulizia', 'x', 'read', datetime('now', '-$2 months'))" >/dev/null
  sql "SELECT id FROM messages WHERE email = 'pulizia-$1@esempio.it'"
}
rispondi() {  # rispondi <id> <quando: mesi fa> <in|out>
  sql "INSERT INTO message_replies (message_id, body, sent_by, sent_at, delivered, direction) VALUES ($1, 'risposta', 'x', datetime('now', '-$2 months'), 1, '$3')" >/dev/null
}
A="$(crea a 7)"                                 # vecchio, nessuna risposta: si cancella
B="$(crea b 8)"; rispondi "$B" 1 in             # vecchio ma con una risposta di un mese fa: resta
C="$(crea c 8)"; rispondi "$C" 7 out; rispondi "$C" 7 in   # tutto fermo da sette mesi: si cancella con le risposte
D="$(crea d 0)"                                 # di oggi: resta
MARCA="$(php -r 'echo sys_get_temp_dir() . "/sp_messaggi_pulizia_" . date("Ymd");')"
rm -f "$MARCA"
posta "$BASE/messaggio" >/dev/null              # la pagina fa partire la pulizia
esiste() { sql "SELECT COUNT(*) FROM messages WHERE id = $1"; }
if [ "$(esiste "$A")" = "0" ]; then ok "un messaggio fermo da sette mesi si cancella"; else no "vecchio" "c'è ancora"; fi
if [ "$(esiste "$B")" = "1" ]; then ok "una conversazione con una risposta recente resta, anche se è cominciata otto mesi fa"; else no "viva" "cancellata"; fi
if [ "$(esiste "$C")" = "0" ] && [ "$(sql "SELECT COUNT(*) FROM message_replies WHERE message_id = $C")" = "0" ]; then
  ok "una conversazione ferma da sette mesi si cancella con tutte le sue risposte"
else no "ferma" "restano righe"; fi
if [ "$(esiste "$D")" = "1" ]; then ok "un messaggio di oggi resta"; else no "recente" "cancellato"; fi
sql "UPDATE messages SET created_at = datetime('now', '-9 months') WHERE id = $D" >/dev/null
posta "$BASE/messaggio" >/dev/null
if [ "$(esiste "$D")" = "1" ]; then ok "la pulizia parte una volta al giorno: la seconda richiesta non cancella"; else no "una volta al giorno" "ha rigirato"; fi
sql "DELETE FROM message_replies WHERE message_id IN ($B, $D)" >/dev/null
sql "DELETE FROM messages WHERE email LIKE 'pulizia-%@esempio.it'" >/dev/null

echo
echo "Le azioni in blocco"
nuovo() { sql "INSERT INTO messages (name, email, subject, message, ip_hash, status, created_at) VALUES ('Blocco $1', 'blocco-$1@esempio.it', '', 'prova in blocco', 'x', 'new', datetime('now'))" >/dev/null
          sql "SELECT id FROM messages WHERE email = 'blocco-$1@esempio.it'"; }
sql "DELETE FROM messages WHERE email LIKE 'blocco-%@esempio.it'" >/dev/null
X="$(nuovo x)"; Y="$(nuovo y)"; Z="$(nuovo z)"
stato_di() { sql "SELECT status FROM messages WHERE id = $1"; }
curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o "$CORPO" "$BASE/admin/messaggi.php"
if grep -q 'name="scelti\[\]"' "$CORPO" && grep -q 'id="scegli-tutti"' "$CORPO" && grep -q 'Elimina selezionati' "$CORPO"; then
  ok "l'elenco ha le caselle, «Seleziona tutti» e i comandi"
else no "caselle" "mancano nell'elenco"; fi
G="$(gettone /admin/messaggi.php)"
blocco() { curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o /dev/null -w '%{http_code}' --data-urlencode "gettone=$G" -d azione=massa -d "fare=$1" "${@:2}" "$BASE/admin/messaggi.php"; }
blocco letti -d "scelti[]=$X" -d "scelti[]=$Y" >/dev/null
if [ "$(stato_di "$X")" = "read" ] && [ "$(stato_di "$Y")" = "read" ] && [ "$(stato_di "$Z")" = "new" ]; then
  ok "«Segna come letti» cambia solo i messaggi scelti"
else no "letti" "$(stato_di "$X") $(stato_di "$Y") $(stato_di "$Z")"; fi
blocco archivia -d "scelti[]=$Y" >/dev/null
if [ "$(stato_di "$Y")" = "archived" ] && [ "$(stato_di "$X")" = "read" ]; then ok "«Archivia» archivia solo quello scelto"; else no "archivia" "$(stato_di "$Y")"; fi
blocco elimina >/dev/null
if [ "$(esiste "$X")" = "1" ] && [ "$(esiste "$Y")" = "1" ] && [ "$(esiste "$Z")" = "1" ]; then
  ok "senza nessuna selezione non si cancella niente"
else no "nessuna selezione" "ha cancellato"; fi
sql "INSERT INTO message_replies (message_id, body, sent_by, sent_at, delivered, direction) VALUES ($X, 'r', 'x', datetime('now'), 1, 'out')" >/dev/null
blocco elimina -d "scelti[]=$X" -d "scelti[]=$Z" -d "scelti[]=abc" -d "scelti[]=0" >/dev/null
if [ "$(esiste "$X")" = "0" ] && [ "$(esiste "$Z")" = "0" ] && [ "$(esiste "$Y")" = "1" ]    && [ "$(sql "SELECT COUNT(*) FROM message_replies WHERE message_id = $X")" = "0" ]; then
  ok "«Elimina selezionati» cancella i due scelti con le risposte, ignora i valori sbagliati e lascia l'altro"
else no "elimina in blocco" "stato inatteso"; fi
sql "DELETE FROM messages WHERE email LIKE 'blocco-%@esempio.it'" >/dev/null

echo
echo "Pulizia"
G="$(gettone "/admin/messaggi.php?vedi=$ID")"
curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o /dev/null --data-urlencode "gettone=$G" -d azione=elimina -d "id=$ID" "$BASE/admin/messaggi.php"
if [ "$(sql "SELECT COUNT(*) FROM messages WHERE id = $ID")" = "0" ] && [ "$(sql "SELECT COUNT(*) FROM message_replies WHERE message_id = $ID")" = "0" ]; then
  ok "eliminare il messaggio elimina anche le risposte"
else no "eliminazione" "restano righe"; fi
rm -rf "$RADICE/scratch/posta"

echo
printf 'Passate: %d   Fallite: %d\n' "$passate" "$fallite"
[ "$fallite" -eq 0 ]

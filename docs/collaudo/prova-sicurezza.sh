#!/usr/bin/env bash
# La sicurezza, provata percorrendo le strade invece di guardare il codice.
#
#   php -S 127.0.0.1:8123 -t public public/dev-router.php &
#   bash docs/collaudo/prova-sicurezza.sh
#
# Nasce con il secondo giro della revisione del 16 ottobre 2026: la CSP senza
# 'unsafe-inline' (G2), le API del sito React spente (M2), la sessione del
# pannello sullo standard FDCA (M6), i freni con l'IPv6 a /64 (M14), le
# impronte con chiave (M15), nessun cookie ai lettori (M16), la newsletter
# senza JavaScript (M13) e il consenso che si registra solo dalla casella.
#
# Gira in SVILUPPO: entra con simone / sviluppo-locale, scrive nel database
# SQLite di scratch/ e azzera i freni di scratch/. Non va lanciata contro la
# produzione.

set -uo pipefail

BASE="${1:-http://127.0.0.1:8123}"
RADICE="$(cd "$(dirname "$0")/../.." && pwd)"
DB="$RADICE/scratch/sviluppo.sqlite"
FRENI="$RADICE/scratch/simonepizzi-dati/freni"
SESSIONI="$RADICE/scratch/simonepizzi-dati/sessioni"
BISCOTTI="$(mktemp)"; CORPO="$(mktemp)"; TESTA="$(mktemp)"
trap 'rm -f "$BISCOTTI" "$CORPO" "$TESTA"' EXIT

passate=0; fallite=0
ok() { passate=$((passate + 1)); printf '  ok  %s\n' "$1"; }
no() { fallite=$((fallite + 1)); printf '  NO  %s — %s\n' "$1" "$2"; }
sql() { php -r '$p=new PDO("sqlite:".$argv[1]); $r=$p->query($argv[2]); if($r){foreach($r->fetchAll(PDO::FETCH_NUM) as $x) echo implode("|",$x),"\n";}' "$DB" "$1"; }
gettone() { curl -s -b "$BISCOTTI" -c "$BISCOTTI" "$BASE$1" | grep -o 'name="gettone" value="[a-f0-9]*"' | head -1 | sed 's/.*value="//;s/"//'; }
azzera_freni() { rm -f "$FRENI"/*.json 2>/dev/null; }

azzera_freni

echo
echo "La CSP (G2)"
curl -s -D "$TESTA" -o "$CORPO" "$BASE/"
csp="$(grep -i '^content-security-policy' "$TESTA" | tr -d '\r')"
script_src="$(printf '%s' "$csp" | grep -o "script-src[^;]*")"
if [ -n "$script_src" ] && ! printf '%s' "$script_src" | grep -q "unsafe-inline\|nonce-"; then
  ok "il sito manda una CSP con script solo da file ($script_src)"
else no "CSP del sito" "«$script_src»"; fi
if grep -q '<script>' "$CORPO" || grep -qE '<script [^>]*nonce' "$CORPO"; then
  no "script in linea" "la home ne ha ancora"
else ok "la home non ha script in linea"; fi

echo
echo "L'ingresso al pannello (M6)"
G="$(gettone /admin/entra.php)"
curl -s -b "$BISCOTTI" -c "$BISCOTTI" -D "$TESTA" -o /dev/null \
     -d "gettone=$G&nome=simone&password=sviluppo-locale" "$BASE/admin/entra.php"
biscotto="$(grep -i '^set-cookie: sp_admin' "$TESTA" | tail -1 | tr -d '\r')"
printf '%s' "$biscotto" | grep -qi 'samesite=strict' && ok "il cookie del pannello è SameSite=Strict" || no "SameSite" "«$biscotto»"
printf '%s' "$biscotto" | grep -qi 'httponly' && ok "il cookie del pannello è HttpOnly" || no "HttpOnly" "«$biscotto»"

curl -s -b "$BISCOTTI" -D "$TESTA" -o /dev/null "$BASE/admin/"
grep -qi '^content-security-policy:.*script-src .self.;' "$TESTA" \
  && ok "anche il pannello manda la CSP" || no "CSP del pannello" "non arriva"
for pagina in /admin/articolo.php?id=1 /admin/articoli.php /admin/media.php /admin/messaggi.php /admin/newsletter.php; do
  curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE$pagina"
  if grep -qE '<script>|<script nonce=|\son(click|change|submit|load|input)=' "$CORPO"; then
    no "$pagina" "ha ancora uno script o un gestore in linea"
  else ok "$pagina non ha script né gestori in linea"; fi
done

# Il segnale che tiene viva la sessione.
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/ping.php?attivo=0"
if grep -q '"stato":"viva"' "$CORPO" && grep -q '"gettone":"[a-f0-9]\{64\}"' "$CORPO"; then
  ok "ping: la sessione è viva e il gettone torna ($(grep -o '"resta":[0-9]*' "$CORPO"))"
else no "ping" "$(cat "$CORPO")"; fi
stato="$(curl -s -o /dev/null -w '%{http_code}' "$BASE/admin/ping.php")"
[ "$stato" = "401" ] && ok "ping senza sessione: 401, nessun rimando" || no "ping senza sessione" "stato $stato"

# Due ore senza richieste: si invecchia il file della sessione e si riprova.
id_sessione="$(grep -P '\tsp_admin\t' "$BISCOTTI" | awk '{print $NF}' | tail -1)"
file_sessione="$SESSIONI/sess_$id_sessione"
if [ -f "$file_sessione" ]; then
  ok "la sessione sta nella cartella privata, fuori dal docroot"
  vecchio=$(( $(date +%s) - 7300 ))
  sed -i -E "s/visto\|i:[0-9]+;/visto|i:$vecchio;/" "$file_sessione"
  stato="$(curl -s -b "$BISCOTTI" -o /dev/null -w '%{http_code}' "$BASE/admin/")"
  [ "$stato" = "302" ] && ok "dopo due ore senza richieste la sessione è chiusa" || no "scadenza per inattività" "stato $stato"
else
  no "cartella delle sessioni" "manca $file_sessione"
fi

# Freno al login: otto tentativi sbagliati dalla stessa rete, poi anche la password giusta aspetta.
# E nessuno di quei tentativi scrive l'indirizzo nel database (M6, M14).
azzera_freni; : > "$BISCOTTI"
tentativi_prima="$(sql "SELECT COUNT(*) FROM login_attempts")"
for i in 1 2 3 4 5 6 7 8; do
  G="$(gettone /admin/entra.php)"
  curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o /dev/null -d "gettone=$G&nome=simone&password=sbagliata-$i" "$BASE/admin/entra.php"
done
G="$(gettone /admin/entra.php)"
curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o "$CORPO" -d "gettone=$G&nome=simone&password=sviluppo-locale" "$BASE/admin/entra.php"
grep -q "Troppi tentativi" "$CORPO" && ok "dopo otto tentativi sbagliati il login si ferma" || no "freno del login" "è entrato lo stesso"
[ "$(sql "SELECT COUNT(*) FROM login_attempts")" = "$tentativi_prima" ]   && ok "i tentativi sbagliati non scrivono IP nel database" || no "login_attempts" "il login scrive ancora righe"
azzera_freni

echo
echo "Le API del sito React (M2)"
for ep in auth search navigation tags media upload backup settings stats optimize_db prerender; do
  stato="$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/$ep.php")"
  [ "$stato" = "410" ] && ok "/api/$ep.php risponde 410" || no "/api/$ep.php" "stato $stato"
done
stato="$(curl -s -o /dev/null -w '%{http_code}' -X POST -d '{}' "$BASE/api/articles.php")"
[ "$stato" = "405" ] && ok "/api/articles.php non accetta scritture" || no "articles POST" "stato $stato"
curl -s -D "$TESTA" -o "$CORPO" "$BASE/api/articles.php?limit=2"
grep -q '"data":\[' "$CORPO" && grep -q '"seo_title"' "$CORPO" \
  && ok "/api/articles.php legge, in sola lettura, per lo strumento di sviluppo" || no "articles GET" "$(head -c 150 "$CORPO")"
stato="$(curl -s -o /dev/null -w '%{http_code}' -X DELETE "$BASE/api/categories.php")"
[ "$stato" = "405" ] && ok "/api/categories.php non accetta scritture" || no "categories DELETE" "stato $stato"
T="$(printf 'a%.0s' $(seq 1 64))"
dove="$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$BASE/api/subscribers.php?action=confirm&token=$T")"
case "$dove" in 303*"/newsletter/conferma?token=$T") ok "il vecchio link di conferma porta alla pagina col pulsante";;
  *) no "conferma via GET" "$dove";; esac
dove="$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/analytics.php")"
[ "$dove" = "410" ] && ok "il cruscotto del pannello React (GET analytics) risponde 410" || no "analytics GET" "stato $dove"

echo
echo "Nessun cookie a chi legge (M16), impronte con chiave (M15)"
ARTICOLO="$(sql "SELECT id FROM articles WHERE status='published' AND (published_at IS NULL OR published_at <= datetime('now')) ORDER BY id DESC LIMIT 1")"
# Le letture di oggi su questo articolo si tolgono: la prova deve poter girare più volte al giorno.
sql "DELETE FROM article_views WHERE article_id = $ARTICOLO AND view_date = date('now')" >/dev/null
prima="$(sql "SELECT COUNT(*) FROM article_views")"
curl -s -D "$TESTA" -o "$CORPO" -H 'Content-Type: application/json' -d "{\"type\":\"view\",\"article_id\":$ARTICOLO}" "$BASE/api/analytics.php"
grep -qi '^set-cookie' "$TESTA" && no "analytics" "manda un cookie al lettore" || ok "contare una lettura non dà cookie"
dopo="$(sql "SELECT COUNT(*) FROM article_views")"
[ "$dopo" = "$((prima + 1))" ] && ok "la lettura è contata" || no "conteggio" "prima $prima, dopo $dopo"
curl -s -o /dev/null -H 'Content-Type: application/json' -d "{\"type\":\"view\",\"article_id\":$ARTICOLO}" "$BASE/api/analytics.php"
[ "$(sql "SELECT COUNT(*) FROM article_views")" = "$dopo" ] && ok "la stessa rete, lo stesso giorno: una lettura sola" || no "doppione" "contata due volte"
impronta="$(sql "SELECT ip_hash FROM article_views ORDER BY id DESC LIMIT 1")"
sha_nudo="$(printf '%s' "127.0.0.1$(date +%Y-%m-%d)" | sha256sum | cut -d' ' -f1)"
[ "$impronta" != "$sha_nudo" ] && ok "l'impronta non è sha256(IP + data): ha la chiave" || no "impronta" "è ancora ricalcolabile"
curl -s -D "$TESTA" -o "$CORPO" "$BASE/api/reactions.php?article_id=$ARTICOLO"
grep -q '"counts"' "$CORPO" && ! grep -qi '^set-cookie' "$TESTA" && ok "le reazioni rispondono senza cookie" || no "reazioni GET" "$(head -c 120 "$CORPO")"
curl -s -o "$CORPO" -H 'Content-Type: application/json' -d "{\"article_id\":$ARTICOLO,\"reaction\":\"heart\"}" "$BASE/api/reactions.php"
grep -q '"my_reactions":\[[^]]*"heart"' "$CORPO" && ok "una reazione si aggiunge ed è «tua»" || no "reazione" "$(head -c 160 "$CORPO")"
curl -s -o "$CORPO" -H 'Content-Type: application/json' -d "{\"article_id\":$ARTICOLO,\"reaction\":\"heart\"}" "$BASE/api/reactions.php"
grep -q '"action":"removed"' "$CORPO" && ok "lo stesso clic la toglie" || no "reazione tolta" "$(head -c 160 "$CORPO")"
stato="$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/reactions.php?article_id=999999")"
[ "$stato" = "404" ] && ok "un articolo che non c'è non si vota" || no "reazioni su id inventato" "stato $stato"

echo
echo "La newsletter (M13, M14) e il consenso degli iscritti storici"
azzera_freni
stato="$(curl -s -o "$CORPO" -w '%{http_code}' -d "email=non-una-email&consenso=1" "$BASE/api/subscribers.php")"
if [ "$stato" = "400" ] && grep -q '<title>' "$CORPO" && grep -q 'indirizzo email valido' "$CORPO"; then
  ok "senza JavaScript il modulo risponde con una pagina, non con un JSON"
else no "newsletter senza JS" "stato $stato"; fi
stato="$(curl -s -o "$CORPO" -w '%{http_code}' -H 'Content-Type: application/json' -d '{"email":"x","consent":true}' "$BASE/api/subscribers.php")"
grep -q '"status":"error"' "$CORPO" && ok "con JavaScript risponde ancora JSON" || no "newsletter JSON" "$(head -c 120 "$CORPO")"
curl -s -o "$CORPO" "$BASE/"
grep -q 'form="modulo-newsletter"' "$CORPO" && ok "la casella del consenso fa parte del modulo" || no "casella del consenso" "fuori dal modulo"

# Un iscritto storico, confermato e senza consenso registrato.
STORICO="storico-prova-$(date +%s)@esempio.it"
sql "INSERT INTO subscribers (email, status, unsubscribe_token, created_at, confirmed_at) VALUES ('$STORICO','confirmed','$(printf 'b%.0s' $(seq 1 64))',datetime('now'),datetime('now'))" >/dev/null
azzera_freni
curl -s -o /dev/null -d "email=$STORICO&consenso=1" "$BASE/api/subscribers.php"
riga="$(sql "SELECT IFNULL(consent_at,'vuoto'), length(IFNULL(confirm_token,'')) FROM subscribers WHERE email='$STORICO'")"
case "$riga" in "vuoto|64") ok "il modulo non registra il consenso di un altro: parte la richiesta alla casella";;
  *) no "consenso dell'iscritto storico" "riga: $riga (atteso vuoto|64)";; esac
sql "DELETE FROM subscribers WHERE email='$STORICO'" >/dev/null

# Il freno delle iscrizioni: tre ogni quarto d'ora dalla stessa rete.
azzera_freni
for i in 1 2 3 4; do
  stato="$(curl -s -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -d '{"email":"nessuno","consent":true}' "$BASE/api/subscribers.php")"
done
[ "$stato" = "429" ] && ok "la quarta iscrizione in un quarto d'ora si ferma" || no "freno newsletter" "stato $stato"
azzera_freni

echo
echo "Nel database non resta nessun IP"
sql "SELECT COUNT(*) FROM article_reactions WHERE voter_hash NOT LIKE 'storico-%' AND length(voter_hash) = 64 AND created_at < '2026-10-16'" | grep -qx 0 \
  && ok "le reazioni vecchie hanno il segnaposto" || no "reazioni vecchie" "hanno ancora l'impronta di prima"

echo
if [ "$fallite" -eq 0 ]; then
  echo "Tutte e $passate le prove di sicurezza passano."
  exit 0
else
  echo "$passate passate, $fallite FALLITE."
  exit 1
fi

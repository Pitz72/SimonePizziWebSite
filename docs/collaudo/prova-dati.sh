#!/usr/bin/env bash
# I dati che il pannello deve saper toccare, percorsi come li percorre Simone.
#
#   php -S 127.0.0.1:8123 -t public public/dev-router.php &
#   bash docs/collaudo/prova-dati.sh
#
# Nasce con il terzo giro della revisione del 16 ottobre 2026: i pulsanti degli
# articoli nel pannello (G5), gli indirizzi vecchi quando cambia uno slug (M5),
# la cancellazione delle immagini (M9), le righe orfane di un articolo
# cancellato (L4) e il backup delle immagini (G6).
#
# Gira in SVILUPPO: entra con simone / sviluppo-locale e scrive nel database
# SQLite di scratch/. Quello che crea, lo cancella.

set -uo pipefail

BASE="${1:-http://127.0.0.1:8123}"
RADICE="$(cd "$(dirname "$0")/../.." && pwd)"
DB="$RADICE/scratch/sviluppo.sqlite"
BISCOTTI="$(mktemp)"; CORPO="$(mktemp)"
trap 'rm -f "$BISCOTTI" "$CORPO"' EXIT

passate=0; fallite=0
ok() { passate=$((passate + 1)); printf '  ok  %s\n' "$1"; }
no() { fallite=$((fallite + 1)); printf '  NO  %s — %s\n' "$1" "$2"; }
sql() { php -r '$p=new PDO("sqlite:".$argv[1]); $r=$p->query($argv[2]); if($r){foreach($r->fetchAll(PDO::FETCH_NUM) as $x) echo implode("|",$x),"\n";}' "$DB" "$1"; }
gettone() { curl -s -b "$BISCOTTI" -c "$BISCOTTI" "$BASE$1" | grep -o 'name="gettone" value="[a-f0-9]*"' | head -1 | sed 's/.*value="//;s/"//'; }
stato() { curl -s -o /dev/null -w '%{http_code}' "$@"; }

rm -f "$RADICE"/scratch/simonepizzi-dati/freni/*.json 2>/dev/null
G="$(gettone /admin/entra.php)"
curl -s -b "$BISCOTTI" -c "$BISCOTTI" -o /dev/null -d "gettone=$G&nome=simone&password=sviluppo-locale" "$BASE/admin/entra.php"
[ "$(stato -b "$BISCOTTI" "$BASE/admin/")" = "200" ] && ok "dentro il pannello" || { no "login" "non entra"; exit 1; }

echo
echo "Il controllo dei link dei pulsanti (G5)"
php -r '
define("IN_SVILUPPO", true);
function db() {}
require $argv[1] . "/public/lib/pannello.php";
$casi = ["" => "", "#" => "", "/contatti" => "/contatti", "https://esempio.it/a?b=1" => "https://esempio.it/a?b=1",
         "mailto:a@b.it" => "mailto:a@b.it", "www.ecosystem.runtimeradio.com" => "https://www.ecosystem.runtimeradio.com",
         "javascript:alert(1)" => null, "//altro.sito/x" => null, "data:text/html,x" => null, "ftp://x.it" => null];
$male = 0;
foreach ($casi as $dato => $atteso) { $v = link_pulsante_pulito($dato); if ($v !== $atteso) { $male++; echo "        «$dato» → ", var_export($v, true), "\n"; } }
exit($male ? 1 : 0);' "$RADICE" && ok "link_pulsante_pulito: dieci casi, compresi javascript: e //" || no "link_pulsante_pulito" "risposte sbagliate qui sopra"

echo
echo "I pulsanti dalla scheda al sito"
G="$(gettone /admin/articolo.php)"
LUOGO="$(curl -s -b "$BISCOTTI" -o /dev/null -w '%{redirect_url}' -d "gettone=$G" -d "id=0" \
  -d "title=Prova dei dati del collaudo" -d "slug=prova-dei-dati" -d "content=<p>Testo.</p>" \
  -d "category=web" -d "status=published" \
  -d "button_a_label=Gioca adesso" -d "button_a_link=www.esempio.it/gioco" \
  -d "button_b_label=Il manuale" -d "button_b_link=/api/download.php?id=1" "$BASE/admin/articolo.php")"
ID="$(printf '%s' "$LUOGO" | grep -o 'id=[0-9]*' | head -1 | cut -d= -f2)"
[ -n "$ID" ] && ok "articolo con pulsanti creato (id $ID)" || { no "creazione" "nessun id"; exit 1; }
# I tag dei pulsanti vanno a capo: si cerca sul testo tutto su una riga.
curl -s "$BASE/web/prova-dei-dati" | tr -d '\r\n' > "$CORPO"
grep -q 'href="https://www.esempio.it/gioco"[^>]*>Gioca adesso<' "$CORPO" && ok "il primo pulsante esce sul sito, con https davanti" || no "primo pulsante" "non c'è o è sbagliato"
grep -q 'href="/api/download.php?id=1"[^>]*download' "$CORPO" && ok "il secondo, un download, si scarica" || no "secondo pulsante" "manca o non ha download"
curl -s -b "$BISCOTTI" "$BASE/admin/articolo.php?id=$ID" | tr -d '\r\n' > "$CORPO"
grep -q 'name="button_a_label"[^>]*value="Gioca adesso"\|value="Gioca adesso"[^>]*name="button_a_label"' "$CORPO" \
  && ok "la scheda li mostra per modificarli" || no "scheda" "i campi dei pulsanti non ci sono"

G="$(gettone "/admin/articolo.php?id=$ID")"
LUOGO="$(curl -s -b "$BISCOTTI" -o /dev/null -w '%{redirect_url}' -d "gettone=$G" -d "id=$ID" \
  -d "title=Prova dei dati del collaudo" -d "slug=prova-dei-dati" -d "content=<p>Testo.</p>" \
  -d "category=web" -d "status=published" -d "button_a_label=Cattivo" -d "button_a_link=javascript:alert(1)" "$BASE/admin/articolo.php")"
case "$LUOGO" in *errore=*) ok "un link javascript: viene rifiutato";; *) no "javascript:" "risposta $LUOGO";; esac
[ "$(sql "SELECT button_a_link FROM articles WHERE id = $ID")" = "https://www.esempio.it/gioco" ] \
  && ok "e il pulsante di prima resta com'era" || no "pulsante dopo il rifiuto" "è cambiato"

G="$(gettone /admin/articoli.php)"
LUOGO="$(curl -s -b "$BISCOTTI" -o /dev/null -w '%{redirect_url}' -d "gettone=$G&azione=duplica&id=$ID" "$BASE/admin/articoli.php")"
COPIA="$(printf '%s' "$LUOGO" | grep -o 'id=[0-9]*' | head -1 | cut -d= -f2)"
[ "$(sql "SELECT button_b_label FROM articles WHERE id = $COPIA")" = "Il manuale" ] \
  && ok "la copia di un articolo tiene i pulsanti" || no "copia" "ha perso i pulsanti"

echo
echo "Lo slug cambiato dopo la pubblicazione (M5)"
G="$(gettone "/admin/articolo.php?id=$ID")"
curl -s -b "$BISCOTTI" -o /dev/null -d "gettone=$G" -d "id=$ID" -d "title=Prova dei dati del collaudo" \
  -d "slug=prova-dei-dati-nuovo" -d "content=<p>Testo.</p>" -d "category=web" -d "status=published" "$BASE/admin/articolo.php"
dove="$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$BASE/web/prova-dei-dati")"
case "$dove" in "301 "*"/web/prova-dei-dati-nuovo") ok "il vecchio indirizzo porta al nuovo con un 301";; *) no "redirect dello slug" "$dove";; esac
[ "$(stato "$BASE/web/prova-dei-dati-nuovo")" = "200" ] && ok "il nuovo risponde 200" || no "slug nuovo" "non risponde"
dove="$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$BASE/videogiochi/prova-dei-dati")"
case "$dove" in "301 "*"/web/prova-dei-dati-nuovo") ok "anche con la categoria sbagliata";; *) no "slug vecchio + categoria sbagliata" "$dove";; esac
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/articolo.php?id=$ID"
grep -q '<code>prova-dei-dati</code>' "$CORPO" && ok "la scheda dice quali indirizzi vecchi portano qui" || no "scheda" "non elenca lo slug vecchio"

echo
echo "Cancellare un articolo (L4)"
sql "INSERT INTO article_views (article_id, ip_hash, view_date) VALUES ($ID, 'prova', date('now'))" >/dev/null
sql "INSERT INTO article_reactions (article_id, reaction, voter_hash, created_at) VALUES ($ID, 'fire', 'prova', datetime('now'))" >/dev/null
G="$(gettone /admin/articoli.php)"
curl -s -b "$BISCOTTI" -o /dev/null -d "gettone=$G&azione=elimina&scelti[]=$ID&scelti[]=$COPIA" "$BASE/admin/articoli.php"
orfani="$(sql "SELECT (SELECT COUNT(*) FROM article_views WHERE article_id=$ID)+(SELECT COUNT(*) FROM article_reactions WHERE article_id=$ID)+(SELECT COUNT(*) FROM slug_storici WHERE article_id=$ID)")"
[ "$orfani" = "0" ] && ok "letture, reazioni e indirizzi vecchi se ne vanno con l'articolo" || no "orfani" "$orfani righe rimaste"
[ "$(stato "$BASE/web/prova-dei-dati")" = "404" ] && ok "e il vecchio indirizzo torna a dare 404" || no "slug vecchio dopo l'eliminazione" "non dà 404"

echo
echo "La libreria delle immagini (M9)"
sql "INSERT INTO media (filename, file_path, mime_type, size, created_at) VALUES ('prova-libera.webp','/uploads/immagini/prova-libera.webp','image/webp',100,datetime('now','+1 day'))" >/dev/null
sql "INSERT INTO media (filename, file_path, mime_type, size, created_at) VALUES ('prova-usata.webp','/uploads/immagini/prova-usata.webp','image/webp',100,datetime('now','+1 day'))" >/dev/null
PRIMO="$(sql "SELECT MIN(id) FROM articles")"
COPERTINA_PRIMA="$(sql "SELECT cover_image FROM articles WHERE id = $PRIMO")"
sql "UPDATE articles SET cover_image = '/uploads/immagini/prova-usata.webp' WHERE id = $PRIMO" >/dev/null
LIBERA="$(sql "SELECT id FROM media WHERE filename='prova-libera.webp'")"; USATA="$(sql "SELECT id FROM media WHERE filename='prova-usata.webp'")"
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/media.php"
grep -q "name=\"elimina\" value=\"$LIBERA\"" "$CORPO" && ok "un'immagine libera ha il pulsante Cancella" || no "pulsante cancella" "manca"
grep -q "name=\"elimina\" value=\"$USATA\"" "$CORPO" && no "immagine in uso" "ha il pulsante Cancella" || ok "un'immagine in uso non ce l'ha, e dice «in uso»"
G="$(gettone /admin/media.php)"
curl -s -b "$BISCOTTI" -o /dev/null -d "gettone=$G&elimina=$USATA" "$BASE/admin/media.php"
[ "$(sql "SELECT COUNT(*) FROM media WHERE id=$USATA")" = "1" ] && ok "e anche forzando il POST non si cancella" || no "immagine in uso" "cancellata"
G="$(gettone /admin/media.php)"
curl -s -b "$BISCOTTI" -o /dev/null -d "gettone=$G&scelti[]=$LIBERA" "$BASE/admin/media.php"
[ "$(sql "SELECT COUNT(*) FROM media WHERE id=$LIBERA")" = "0" ] && ok "una libera si cancella, anche dalla selezione" || no "cancellazione" "è ancora lì"
# MSYS_NO_PATHCONV: senza, Git Bash trasforma «/images/…» in «C:/Program Files/Git/images/…»
# prima di passarlo a PHP, e la copertina tornerebbe rotta.
MSYS_NO_PATHCONV=1 php -r '$p=new PDO("sqlite:".$argv[1]); $p->prepare("UPDATE articles SET cover_image = ? WHERE id = ?")->execute([$argv[2], (int)$argv[3]]);' "$(cygpath -m "$DB")" "$COPERTINA_PRIMA" "$PRIMO"
[ "$(sql "SELECT cover_image FROM articles WHERE id = $PRIMO")" = "$COPERTINA_PRIMA" ] || no "ripristino" "la copertina dell'articolo $PRIMO non è tornata com'era"
sql "DELETE FROM media WHERE id = $USATA" >/dev/null

echo
echo "Il backup, con le immagini (G6)"
G="$(gettone /admin/impostazioni.php)"
curl -s -b "$BISCOTTI" -L -o "$CORPO" -d "gettone=$G&azione=backup_ora" "$BASE/admin/impostazioni.php"
grep -q 'Copia creata' "$CORPO" && ok "la copia parte dal pannello" || no "backup" "nessun messaggio di copia creata"
grep -q 'immagini.zip' "$CORPO" && ok "Impostazioni mostra immagini.zip" || no "immagini.zip" "non compare"
tipo="$(curl -s -b "$BISCOTTI" -o "$CORPO" -w '%{http_code} %{content_type}' "$BASE/admin/backup.php?f=immagini.zip")"
case "$tipo" in "200 application/zip"*) ok "l'archivio delle immagini si scarica";; *) no "scaricare immagini.zip" "$tipo";; esac
php -r '$z=new ZipArchive(); if($z->open($argv[1])!==true) exit(1); $n=0; for($i=0;$i<$z->numFiles;$i++){ if(str_starts_with($z->getNameIndex($i),"images/")) $n++; } echo $n; exit($n>0?0:1);' "$CORPO" >/dev/null \
  && ok "e dentro ci sono le immagini" || no "contenuto di immagini.zip" "vuoto o illeggibile"
[ "$(stato -b "$BISCOTTI" "$BASE/admin/backup.php?f=../lib/config.php")" = "404" ] && ok "backup.php non dà nient'altro" || no "backup.php" "ha servito un file qualunque"

echo
if [ "$fallite" -eq 0 ]; then echo "Tutte e $passate le prove dei dati passano."; exit 0
else echo "$passate passate, $fallite FALLITE."; exit 1; fi

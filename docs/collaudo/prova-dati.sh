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
ID="$(grep -o 'id=[0-9]*' <<< "$LUOGO" | head -1 | cut -d= -f2)"
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
COPIA="$(grep -o 'id=[0-9]*' <<< "$LUOGO" | head -1 | cut -d= -f2)"
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
echo "Le GIF animate restano animate (L10)"
# Due GIF fatte qui: una con due fotogrammi, una con uno. GD ne leggerebbe solo
# il primo, quindi l'animata deve arrivare in libreria così com'è.
GIFDIR="$(mktemp -d)"
php -r '
  $testa = "GIF89a" . pack("vvCCC", 1, 1, 0x80, 0, 0) . "\0\0\0\xff\xff\xff";
  $giro = "\x21\xf9\x04\x00\x0a\x00\x00\x00\x2c" . pack("vvvvC", 0, 0, 1, 1, 0) . "\x02\x02\x44\x01\x00";
  file_put_contents($argv[1] . "/animata.gif", $testa . "\x21\xff\x0bNETSCAPE2.0\x03\x01\x00\x00\x00" . $giro . $giro . ";");
  file_put_contents($argv[1] . "/ferma.gif", $testa . $giro . ";");
' "$(cygpath -m "$GIFDIR")"
for g in animata ferma; do
  G="$(gettone /admin/media.php)"
  curl -s -b "$BISCOTTI" -o "$CORPO" -F "gettone=$G" -F "file=@$(cygpath -m "$GIFDIR")/$g.gif;type=image/gif" "$BASE/admin/carica.php"
  eval "URL_$g=\"$(grep -o '"url":"[^"]*' "$CORPO" | sed 's/"url":"//')\""
done
case "$URL_animata" in *.gif) ok "la GIF animata resta GIF";; *) no "GIF animata" "è diventata «$URL_animata»";; esac
# La conversione in WebP la fa GD: se il PHP che fa girare il server di sviluppo
# non ce l'ha (quello di Simone non ce l'ha), la prova si salta e lo dice.
if php -r 'exit(function_exists("imagewebp") ? 0 : 1);'; then
  case "$URL_ferma" in *.webp) ok "la GIF ferma diventa WebP come le altre immagini";; *) no "GIF ferma" "è «$URL_ferma»";; esac
else
  printf '  --  la conversione in WebP non si prova: questo PHP non ha GD\n'
fi
# Si tolgono dalla libreria (e dal disco di sviluppo) le due appena caricate.
for id in $(sql "SELECT id FROM media WHERE filename LIKE '%-animata.gif' OR filename LIKE '%-ferma.webp' OR filename LIKE '%-ferma.gif'"); do
  G="$(gettone /admin/media.php)"; curl -s -b "$BISCOTTI" -o /dev/null -d "gettone=$G&elimina=$id" "$BASE/admin/media.php"
done
rm -rf "$GIFDIR"

echo
echo "Caricare più immagini, con la barra (22/10)"
# La zona deve esserci in tutti e due i posti, con il limite del server
# scritto dentro; e la coda manda i file uno dopo l'altro con lo stesso
# gettone, quindi due caricamenti di fila devono riuscire tutti e due.
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/media.php"
grep -q 'data-zona-carica' "$CORPO" && grep -q 'data-dopo="ricarica"' "$CORPO" \
  && ok "la Libreria ha la zona di caricamento, che a fine coda rilegge la pagina" || no "zona nella Libreria" "manca"
grep -qE 'data-massimo="[1-9][0-9]*"' "$CORPO" && ok "la zona sa quanto accetta il server" || no "data-massimo" "manca o è zero"
grep -q 'caricamenti\.js' "$CORPO" && ok "e carica caricamenti.js" || no "caricamenti.js nella Libreria" "manca"
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/articolo.php"
grep -q 'id="file-nuovo" type="file" multiple' "$CORPO" && ok "la finestra della scheda articolo accetta più file" || no "zona nella scheda" "manca o senza multiple"
[ "$(stato "$BASE/assets/js/caricamenti.js")" = "200" ] && ok "caricamenti.js risponde" || no "caricamenti.js" "non risponde"
PNGDIR="$(mktemp -d)"
# Un PNG di un pixel scritto a mano: getimagesize() lo riconosce anche senza GD.
php -r '$p = base64_decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="); file_put_contents($argv[1]."/coda-uno.png", $p); file_put_contents($argv[1]."/coda-due.png", $p);' "$(cygpath -m "$PNGDIR")"
G="$(gettone /admin/media.php)"
arrivate=0
for n in uno due; do
  curl -s -b "$BISCOTTI" -o "$CORPO" -F "gettone=$G" -F "file=@$(cygpath -m "$PNGDIR")/coda-$n.png;type=image/png" "$BASE/admin/carica.php"
  grep -q '"url":' "$CORPO" && arrivate=$((arrivate + 1))
done
[ "$arrivate" = "2" ] && ok "due file di fila con lo stesso gettone arrivano tutti e due" || no "coda" "ne sono arrivati $arrivate su 2"
for id in $(sql "SELECT id FROM media WHERE filename LIKE '%-coda-uno.%' OR filename LIKE '%-coda-due.%'"); do
  G="$(gettone /admin/media.php)"; curl -s -b "$BISCOTTI" -o /dev/null -d "gettone=$G&elimina=$id" "$BASE/admin/media.php"
done
[ "$(sql "SELECT COUNT(*) FROM media WHERE filename LIKE '%-coda-uno.%' OR filename LIKE '%-coda-due.%'")" = "0" ] || no "pulizia" "le due prove sono rimaste in libreria"
rm -rf "$PNGDIR"

echo
echo "PDF e archivi nella libreria (22/10)"
# Il React li accettava, il pannello PHP no. Si controllano dai primi byte: un
# testo chiamato .pdf si ferma. Vanno in documenti/ e file/, con il nome pulito
# in filename (è quello con cui download.php li fa scaricare), e stanno nella
# loro scheda, non in quella delle immagini né nella finestra della copertina.
ALLDIR="$(mktemp -d)"
php -r '
  file_put_contents($argv[1] . "/prova-documento.pdf", "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
  file_put_contents($argv[1] . "/prova-archivio.zip", "PK\x05\x06" . str_repeat("\0", 18));
  file_put_contents($argv[1] . "/finto.pdf", "<?php echo 1;");
' "$(cygpath -m "$ALLDIR")"
G="$(gettone /admin/media.php)"
curl -s -b "$BISCOTTI" -o "$CORPO" -F "gettone=$G" -F "file=@$(cygpath -m "$ALLDIR")/prova-documento.pdf;type=application/pdf" "$BASE/admin/carica.php"
grep -q '"url":"[^"]*/uploads/documenti/[^"]*-prova-documento\.pdf"' "$CORPO" && grep -q '"tipo":"documenti"' "$CORPO" \
  && ok "un PDF arriva in uploads/documenti/" || no "PDF" "$(head -c 200 "$CORPO")"
curl -s -b "$BISCOTTI" -o "$CORPO" -F "gettone=$G" -F "file=@$(cygpath -m "$ALLDIR")/prova-archivio.zip;type=application/zip" "$BASE/admin/carica.php"
grep -q '"url":"[^"]*/uploads/file/[^"]*-prova-archivio\.zip"' "$CORPO" && ok "uno ZIP arriva in uploads/file/" || no "ZIP" "$(head -c 200 "$CORPO")"
[ "$(stato -b "$BISCOTTI" -F "gettone=$G" -F "file=@$(cygpath -m "$ALLDIR")/finto.pdf;type=application/pdf" "$BASE/admin/carica.php")" = "400" ] \
  && ok "un .php travestito da .pdf si ferma (400)" || no "PDF finto" "non è stato fermato"
[ "$(sql "SELECT filename || '|' || mime_type FROM media WHERE file_path LIKE '%-prova-documento.pdf'")" = "prova-documento.pdf|application/pdf" ] \
  && ok "in libreria con il nome pulito e il tipo giusto" || no "riga del PDF" "$(sql "SELECT filename, mime_type FROM media WHERE file_path LIKE '%-prova-documento.pdf'")"
PDF_ID="$(sql "SELECT id FROM media WHERE file_path LIKE '%-prova-documento.pdf'")"
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/media.php?tipo=documenti"
grep -q "name=\"elimina\" value=\"$PDF_ID\"" "$CORPO" && grep -q 'anteprima-file' "$CORPO" \
  && ok "sta nella scheda Documenti, senza anteprima finta" || no "scheda Documenti" "il PDF non c'è"
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/media.php?tipo=immagini"
grep -q "name=\"elimina\" value=\"$PDF_ID\"" "$CORPO" && no "scheda Immagini" "c'è anche il PDF" || ok "e non in quella delle Immagini"
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/dati.php?cosa=media"
grep -q 'prova-documento' "$CORPO" && no "finestra delle immagini" "mostra il PDF" || ok "la finestra della copertina non lo mostra"
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/dati.php?cosa=file"
grep -q '"nome":"prova-documento.pdf"' "$CORPO" && grep -q '"tipo":"PDF"' "$CORPO" \
  && ok "«Collega un file» lo elenca, con il tipo" || no "dati.php?cosa=file" "$(head -c 200 "$CORPO")"
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/articolo.php"
grep -q 'id="finestra-file"' "$CORPO" && grep -q 'id="file-allegato"' "$CORPO" \
  && ok "la scheda articolo ha la finestra «Collega un file»" || no "finestra-file" "manca"
curl -s -D - -o /dev/null "$BASE/api/download.php?id=$PDF_ID" | grep -qi 'filename="prova-documento.pdf"' \
  && ok "download.php lo fa scaricare con il suo nome" || no "download.php" "nome sbagliato"
for id in $(sql "SELECT id FROM media WHERE file_path LIKE '%-prova-documento.pdf' OR file_path LIKE '%-prova-archivio.zip'"); do
  G="$(gettone /admin/media.php)"; curl -s -b "$BISCOTTI" -o /dev/null -d "gettone=$G&elimina=$id" "$BASE/admin/media.php"
done
[ "$(sql "SELECT COUNT(*) FROM media WHERE file_path LIKE '%-prova-documento.pdf' OR file_path LIKE '%-prova-archivio.zip'")" = "0" ] || no "pulizia" "PDF e ZIP di prova sono rimasti"
rm -rf "$ALLDIR"

echo
echo "I tag della scheda articolo, fatti per il riuso (22/10)"
# Il campo vero resta name="tags" a virgole (senza JavaScript funziona così);
# tag.js ci mette sopra le etichette e chiede i tag con il loro uso a dati.php.
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/articolo.php?id=1"
grep -q 'data-scelta-tag' "$CORPO" && grep -q 'id="campo-tag" name="tags"' "$CORPO" \
  && ok "la scheda ha il campo a virgole, pronto per le etichette" || no "campo dei tag" "manca"
grep -q 'tag\.js' "$CORPO" && ok "e carica tag.js" || no "tag.js nella scheda" "manca"
[ "$(stato "$BASE/assets/js/tag.js")" = "200" ] && ok "tag.js risponde" || no "tag.js" "non risponde"
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/dati.php?cosa=tag"
TAG_TOT="$(sql "SELECT COUNT(*) FROM tags")"
TAG_JSON="$(grep -o '"slug":' "$CORPO" | wc -l | tr -d ' ')"
[ "$TAG_JSON" = "$TAG_TOT" ] && grep -q '"usati":[0-9]' "$CORPO" \
  && ok "dati.php?cosa=tag dà tutti i $TAG_TOT tag, ognuno con il suo uso" || no "dati.php?cosa=tag" "$TAG_JSON su $TAG_TOT"
[ "$(stato "$BASE/admin/dati.php?cosa=tag")" = "302" ] && ok "e senza accesso non dà niente" || no "dati.php?cosa=tag senza accesso" "risponde"

echo
echo "Gli iscritti in CSV (22/10)"
# Per Excel italiano: segno UTF-8, punto e virgola. Esce l'elenco a vista, con
# la prova del consenso; un nome che comincia con «=» resta testo; senza
# accesso non esce niente.
sql "INSERT INTO subscribers (email, name, status, created_at) VALUES ('prova-csv@example.test', '=1+1', 'pending', datetime('now'))" >/dev/null
TOT="$(sql "SELECT COUNT(*) FROM subscribers")"; ATTESA="$(sql "SELECT COUNT(*) FROM subscribers WHERE status='pending'")"
curl -s -b "$BISCOTTI" -D "$CORPO.h" -o "$CORPO" "$BASE/admin/newsletter.php?esporta=csv"
grep -qi '^content-type: text/csv' "$CORPO.h" && grep -qi 'filename="iscritti-[0-9-]*\.csv"' "$CORPO.h" \
  && ok "scarica un .csv" || no "intestazioni del CSV" "$(grep -i 'content-' "$CORPO.h" | tr -d '\r' | tr '\n' ' ')"
[ "$(head -c 3 "$CORPO" | od -An -tx1 | tr -d ' ')" = "efbbbf" ] && ok "con il segno UTF-8 in testa" || no "BOM" "manca"
# fputcsv mette fra virgolette le celle con uno spazio: Excel le legge uguali.
head -1 "$CORPO" | grep -q 'Email;Nome;Stato;.*"Consenso il";"Consenso da";"Versione del testo"' \
  && ok "punto e virgola, e le colonne del consenso" || no "intestazione" "$(head -1 "$CORPO")"
[ "$(($(wc -l < "$CORPO") - 1))" = "$TOT" ] && ok "tutti i $TOT iscritti, senza filtro" || no "righe" "$(($(wc -l < "$CORPO") - 1)) su $TOT"
grep -q "prova-csv@example.test;'=1+1;\"in attesa\"" "$CORPO" && ok "un nome «=1+1» esce come testo, non come formula" || no "CSV injection" "$(grep prova-csv "$CORPO")"
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/newsletter.php?esporta=csv&stato=pending"
[ "$(($(wc -l < "$CORPO") - 1))" = "$ATTESA" ] && ok "con il filtro, solo quelli in attesa ($ATTESA)" || no "filtro" "$(($(wc -l < "$CORPO") - 1)) su $ATTESA"
[ "$(stato "$BASE/admin/newsletter.php?esporta=csv")" = "302" ] && ok "senza accesso non esce niente" || no "CSV senza accesso" "risponde"
curl -s -b "$BISCOTTI" -o "$CORPO" "$BASE/admin/newsletter.php?vista=iscritti"
grep -q 'esporta=csv' "$CORPO" && ok "il pulsante sta nella pagina degli iscritti" || no "pulsante CSV" "manca"
sql "DELETE FROM subscribers WHERE email = 'prova-csv@example.test'" >/dev/null
rm -f "$CORPO.h"

echo
echo "La cache delle letture pubbliche (M3)"
# Un titolo cambiato di nascosto nel database non si vede finché la cache vale;
# il primo POST del pannello (qui un'azione in blocco senza niente selezionato) la svuota e il titolo nuovo compare. Prova che la
# cache lavora davvero, e che lo svuotamento funziona.
CACHE_ART="$(sql "SELECT id FROM articles WHERE status='published' AND category='web' ORDER BY id LIMIT 1")"
CACHE_SLUG="$(sql "SELECT slug FROM articles WHERE id = $CACHE_ART")"
CACHE_TITOLO="$(sql "SELECT title FROM articles WHERE id = $CACHE_ART")"
curl -s -o /dev/null "$BASE/web/$CACHE_SLUG"
sql "UPDATE articles SET title = 'Titolo cambiato dalla prova della cache' WHERE id = $CACHE_ART" >/dev/null
curl -s "$BASE/web/$CACHE_SLUG" > "$CORPO"
grep -q "Titolo cambiato dalla prova della cache" "$CORPO" \
  && no "cache" "la pagina ha letto il database invece della cache" || ok "la pagina viene dalla cache, non dal database"
G="$(gettone /admin/articoli.php)"
curl -s -b "$BISCOTTI" -o /dev/null -d "gettone=$G&azione=pubblica" "$BASE/admin/articoli.php"
curl -s "$BASE/web/$CACHE_SLUG" > "$CORPO"
grep -q "Titolo cambiato dalla prova della cache" "$CORPO" \
  && ok "un POST del pannello svuota la cache, e la modifica si vede" || no "svuotamento della cache" "il titolo vecchio resta"
MSYS_NO_PATHCONV=1 php -r '$p=new PDO("sqlite:".$argv[1]); $p->prepare("UPDATE articles SET title = ? WHERE id = ?")->execute([$argv[2], (int)$argv[3]]);' "$(cygpath -m "$DB")" "$CACHE_TITOLO" "$CACHE_ART"
G="$(gettone /admin/articoli.php)"
curl -s -b "$BISCOTTI" -o /dev/null -d "gettone=$G&azione=pubblica" "$BASE/admin/articoli.php"
[ "$(sql "SELECT title FROM articles WHERE id = $CACHE_ART")" = "$CACHE_TITOLO" ] || no "ripristino" "il titolo dell'articolo $CACHE_ART non è tornato"

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

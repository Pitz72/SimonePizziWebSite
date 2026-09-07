<?php
/**
 * Ogni indirizzo che oggi risponde deve rispondere anche domani.
 *
 * Prende la sitemap del sito in produzione — l'elenco di tutto quello che
 * Google conosce — e prova ogni indirizzo sul sito nuovo che gira in locale.
 * È la prova che conta prima del deploy: un 404 su una URL già indicizzata
 * costa mesi di posizionamento, e non se ne accorge nessuno finché non
 * arrivano le segnalazioni.
 *
 *   php -S 127.0.0.1:8123 -t public public/dev-router.php &
 *   php docs/collaudo/confronta-con-la-sitemap.php
 *
 * Confronta anche i <title>: non devono essere uguali — il sito nuovo li ha
 * riscritti apposta — ma un titolo vuoto o troncato si vede subito.
 *
 * NOTA. In locale il database è la copia SQLite fatta dalle API pubbliche: se
 * è vecchia di qualche giorno, gli articoli usciti nel frattempo risultano
 * mancanti. Prima di dare la colpa al codice, rilancia
 * `bash scripts/sviluppo/scarica-dati.sh`.
 */

declare(strict_types=1);

const PRODUZIONE = 'https://simonepizzi.runtimeradio.it';
const SITEMAP_LOCALE = __DIR__ . '/../../scratch/dati-produzione/sitemap.xml';

$locale = $argv[1] ?? 'http://127.0.0.1:8123';

/* ── La sitemap ──────────────────────────────────────────────────────────
   Si legge dal file scaricato: il curl di PHP su Windows non ha l'elenco
   delle autorità di certificazione e non parla in HTTPS. Se manca, si dice
   come prenderlo invece di disattivare la verifica del certificato. */
if (!is_file(SITEMAP_LOCALE)) {
    fwrite(STDERR, "Manca la sitemap di produzione.\nPrendila con:\n\n"
        . "    curl -sS -A \"Mozilla/5.0 Chrome/128\" " . PRODUZIONE . "/sitemap.xml \\\n"
        . "         -o scratch/dati-produzione/sitemap.xml\n\n");
    exit(1);
}

$xml = simplexml_load_file(SITEMAP_LOCALE);
if (!$xml) { fwrite(STDERR, "La sitemap non si legge.\n"); exit(1); }

$indirizzi = [];
foreach ($xml->url as $u) {
    $percorso = parse_url((string)$u->loc, PHP_URL_PATH) ?: '/';
    $indirizzi[] = $percorso;
}
$indirizzi = array_values(array_unique($indirizzi));

printf("Provo %d indirizzi della sitemap contro %s\n\n", count($indirizzi), $locale);

/* ── La prova ────────────────────────────────────────────────────────────── */

function chiedi(string $url): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_TIMEOUT        => 15,
    ]);
    $corpo = (string)curl_exec($ch);
    $stato = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    $dove  = (string)curl_getinfo($ch, CURLINFO_REDIRECT_URL);
    curl_close($ch);

    preg_match('#<title>(.*?)</title>#is', $corpo, $m);
    return ['stato' => $stato, 'titolo' => trim($m[1] ?? ''), 'dove' => $dove];
}

$ok = 0;
$spostati = [];
$rotti = [];
$senzaTitolo = [];

foreach ($indirizzi as $percorso) {
    $r = chiedi($locale . $percorso);

    if ($r['stato'] === 200) {
        $ok++;
        if ($r['titolo'] === '') $senzaTitolo[] = $percorso;
        printf("  ok   %-62s %s\n", $percorso, mb_strimwidth($r['titolo'], 0, 48, '…'));
    } elseif ($r['stato'] === 301 || $r['stato'] === 302) {
        // Un redirect non è una perdita: l'indirizzo vecchio porta al nuovo.
        $spostati[] = [$percorso, $r['dove']];
        printf("  →    %-62s porta a %s\n", $percorso, parse_url($r['dove'], PHP_URL_PATH));
    } else {
        $rotti[] = [$percorso, $r['stato']];
        printf("  NO   %-62s stato %d\n", $percorso, $r['stato']);
    }
}

/* ── Il verdetto ─────────────────────────────────────────────────────────── */

echo "\n";
printf("%d rispondono, %d rimandano altrove, %d non rispondono.\n",
    $ok, count($spostati), count($rotti));

if ($senzaTitolo) {
    echo "\nSenza <title> (la pagina si è interrotta prima del <head>):\n";
    foreach ($senzaTitolo as $p) echo "  $p\n";
}

if ($rotti) {
    echo "\nQuesti oggi sono nell'indice di Google e domani darebbero errore:\n";
    foreach ($rotti as [$p, $s]) echo "  $p  (stato $s)\n";
    echo "\nO l'articolo non c'è più nella copia locale del database — allora\n"
       . "rilancia scripts/sviluppo/scarica-dati.sh — oppure manca una rotta.\n";
    exit(1);
}

echo "\nNessun indirizzo della sitemap si perde per strada.\n";
exit(0);

<?php
/**
 * La sitemap: /sitemap.xml (la riscrittura sta nell'.htaccess).
 *
 * Riscritta il 16 ottobre 2026 sulle librerie del sito (revisione del 16
 * ottobre, M11). Quella di prima era del sito React e girava su api/db.php:
 *
 *  - prendeva l'indirizzo del sito da HTTP_HOST, quindi una richiesta con un
 *    Host falso metteva quel dominio in ogni <loc>;
 *  - non impostava il fuso orario: «adesso» era l'ora di Los Angeles, nove ore
 *    indietro, e un articolo uscito nelle ultime nove ore mancava;
 *  - il lastmod delle categorie contava anche gli articoli programmati nel
 *    futuro, e non guardava le sottocategorie;
 *  - il lastmod di un articolo era updated_at, che MySQL scrive con l'ora del
 *    server e che per un programmato viene prima dell'uscita.
 *
 * Adesso: SITO_URL, l'ora italiana di lib/avvio.php, SOLO_PUBBLICATI come in
 * ogni pagina, e la data di modifica di data_modifica() in lib/seo.php, la
 * stessa dei dati strutturati. Le regole su che cosa entra sono quelle di
 * prima: home, contatti, archivio, le sezioni, le sottocategorie con almeno un
 * articolo, gli articoli, i tag con almeno TAG_MINIMO_PER_INDICE articoli.
 */

declare(strict_types=1);

require __DIR__ . '/lib/avvio.php';

header('Content-Type: application/xml; charset=utf-8');
// Si rigenera a ogni richiesta, ma Google non ha bisogno di chiederla più di
// una volta l'ora. Prima arrivava con i due giorni della configurazione di
// DreamHost, che per una sitemap dinamica è il contrario di quello che serve.
header('Cache-Control: public, max-age=3600');

/** Una data per <lastmod>: solo il giorno, che è quello che conta. */
function giorno(?string $quando): string {
    $t = $quando ? strtotime($quando) : false;
    return $t ? date('Y-m-d', $t) : '';
}

/** Un <url> della sitemap. */
function voce(string $percorso, string $lastmod, string $frequenza, string $priorita): string {
    return "  <url>\n"
         . '    <loc>' . htmlspecialchars(SITO_URL . $percorso, ENT_XML1 | ENT_QUOTES, 'UTF-8') . "</loc>\n"
         . ($lastmod !== '' ? "    <lastmod>$lastmod</lastmod>\n" : '')
         . "    <changefreq>$frequenza</changefreq>\n"
         . "    <priority>$priorita</priority>\n"
         . "  </url>\n";
}

$adesso = adesso();

// Gli articoli pubblicati, con la loro data vera.
$q = db()->prepare("SELECT slug, category, published_at, created_at, updated_at FROM articles
                    WHERE " . SOLO_PUBBLICATI . " ORDER BY published_at DESC, id DESC");
$q->execute([':adesso' => $adesso]);
$articoli = $q->fetchAll();

// L'ultima uscita per categoria: serve al lastmod delle sezioni e delle sottocategorie.
$ultimaPer = [];
foreach ($articoli as $a) {
    $d = giorno($a['published_at'] ?: $a['created_at']);
    if (!isset($ultimaPer[$a['category']]) || $d > $ultimaPer[$a['category']]) $ultimaPer[$a['category']] = $d;
}
$ultimaUscita = $articoli ? giorno($articoli[0]['published_at'] ?: $articoli[0]['created_at']) : '';

$fuori = '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
       . '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

$fuori .= voce('/', $ultimaUscita, 'daily', '1.0');
$fuori .= voce('/archivio', $ultimaUscita, 'weekly', '0.6');
$fuori .= voce('/chi-sono', '', 'yearly', '0.5');
$fuori .= voce('/contatti', '', 'monthly', '0.5');

// Le sezioni, con l'ultima uscita fra loro e le loro figlie.
foreach (categorie_radice() as $c) {
    $date = [];
    foreach (slug_del_ramo($c) as $s) if (isset($ultimaPer[$s])) $date[] = $ultimaPer[$s];
    $fuori .= voce('/' . $c['slug'], $date ? max($date) : '', 'weekly', '0.8');
}

// Le sottocategorie: solo quelle con qualcosa dentro.
foreach (sottocategorie_per_sezione() as $figlie) {
    foreach ($figlie as $f) {
        $fuori .= voce('/' . $f['slug'], $ultimaPer[$f['slug']] ?? '', 'weekly', '0.7');
    }
}

foreach ($articoli as $a) {
    if ((string)$a['category'] === '') continue;   // senza categoria non ha un indirizzo
    $fuori .= voce(url_articolo($a), giorno(data_modifica($a)), 'monthly', '0.7');
}

// I tag che raccolgono davvero qualcosa: la soglia è quella di pages/tag.php.
$t = db()->prepare("SELECT t.slug, MAX(a.published_at) AS ultima, COUNT(DISTINCT a.id) AS quanti
                    FROM tags t JOIN article_tags x ON x.tag_id = t.id
                    JOIN articles a ON a.id = x.article_id
                    WHERE a.status = 'published' AND (a.published_at IS NULL OR a.published_at <= :adesso)
                    GROUP BY t.id, t.slug HAVING COUNT(DISTINCT a.id) >= " . TAG_MINIMO_PER_INDICE . "
                    ORDER BY t.slug ASC");
$t->execute([':adesso' => $adesso]);
foreach ($t->fetchAll() as $tag) {
    $fuori .= voce('/tag/' . rawurlencode((string)$tag['slug']), giorno($tag['ultima']), 'weekly', '0.5');
}

echo $fuori . '</urlset>' . "\n";

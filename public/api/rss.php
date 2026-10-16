<?php
/**
 * Il feed RSS: /api/rss.php
 *
 * Lo leggono i lettori di feed e il bot di Telegram. Riscritto il 16 ottobre
 * 2026 sulle librerie del sito (revisione del 16 ottobre, M11 e L16). Quello
 * di prima era del sito React:
 *
 *  - prendeva l'indirizzo da HTTP_HOST (un Host falso finiva in ogni <link>);
 *  - un articolo senza data di pubblicazione prendeva «adesso», quindi cambiava
 *    data a ogni lettura del feed;
 *  - dichiarava ogni copertina image/jpeg, anche le WebP, e senza la lunghezza
 *    che l'elemento <enclosure> pretende;
 *  - dava solo il riassunto: niente testo, niente data dell'ultimo aggiornamento,
 *    niente indirizzo di se stesso.
 *
 * NON CAMBIA il GUID: «urn:simonepizzi:article:ID», stabile anche se l'articolo
 * cambia categoria o slug. È quello che il bot di Telegram usa per sapere che
 * cosa ha già pubblicato: cambiarlo vorrebbe dire ripubblicare tutto.
 */

declare(strict_types=1);

require __DIR__ . '/../lib/avvio.php';

header('Content-Type: application/rss+xml; charset=utf-8');

/* Trenta voci, e il testo completo solo per le dieci più recenti: il bot di
   Telegram scarica il feed un centinaio di volte al giorno, e cinquanta testi
   interi facevano 557 KB a ogni giro (misurato in sviluppo il 16 ottobre).
   Chi legge un articolo vecchio lo apre dal link. */
const RSS_QUANTI = 30;
const RSS_CON_TESTO = 10;

/** Testo dentro un elemento XML. */
function x(?string $testo): string {
    return htmlspecialchars((string)$testo, ENT_XML1 | ENT_QUOTES, 'UTF-8');
}

/** Il corpo dell'articolo per il feed: ripulito, con gli indirizzi completi. */
function corpo_per_feed(string $html): string {
    // Al posto dei video, un link: vedi video_come_link() in lib/video.php.
    $pulito = video_come_link(safe_html($html));
    // Un lettore di feed non sa che «/uploads/…» vuol dire questo sito.
    $pulito = (string)preg_replace('/\s(src|href)="\/(?!\/)/', ' $1="' . SITO_URL . '/', $pulito);
    // Dentro una sezione CDATA l'unica cosa che non può stare è la sua chiusura.
    return str_replace(']]>', ']]]]><![CDATA[>', $pulito);
}

/** Il tipo di un'immagine dal suo nome, e la dimensione se il file è qui. */
function copertina_per_feed(string $percorso): ?array {
    if ($percorso === '') return null;
    $tipi = ['webp' => 'image/webp', 'jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg',
             'png' => 'image/png', 'gif' => 'image/gif'];
    $estensione = strtolower(pathinfo((string)parse_url($percorso, PHP_URL_PATH), PATHINFO_EXTENSION));
    $locale = str_starts_with($percorso, '/') ? __DIR__ . '/..' . $percorso : '';
    return [
        'url'  => url_assoluta(url_immagine($percorso)),
        'tipo' => $tipi[$estensione] ?? 'image/jpeg',
        'byte' => ($locale !== '' && is_file($locale)) ? (int)filesize($locale) : 0,
    ];
}

$q = db()->prepare("SELECT id, title, slug, excerpt, content, cover_image, category, published_at, created_at, updated_at
                    FROM articles WHERE " . SOLO_PUBBLICATI . " AND category <> ''
                    ORDER BY published_at DESC, id DESC LIMIT " . RSS_QUANTI);
$q->execute([':adesso' => adesso()]);
$articoli = $q->fetchAll();

$ultima = $articoli ? strtotime((string)($articoli[0]['published_at'] ?: $articoli[0]['created_at'])) : time();

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">' . "\n";
echo "<channel>\n";
echo '  <title>' . x(SITO_NOME) . "</title>\n";
echo '  <link>' . x(SITO_URL . '/') . "</link>\n";
echo '  <description>' . x(SITO_DESCR) . "</description>\n";
echo "  <language>it-IT</language>\n";
echo '  <lastBuildDate>' . date(DATE_RSS, $ultima) . "</lastBuildDate>\n";
echo '  <atom:link href="' . x(SITO_URL . '/api/rss.php') . '" rel="self" type="application/rss+xml" />' . "\n";

foreach ($articoli as $posto => $a) {
    $uscita = strtotime((string)($a['published_at'] ?: $a['created_at']));
    $link = SITO_URL . url_articolo($a);
    echo "  <item>\n";
    echo '    <title>' . x($a['title']) . "</title>\n";
    echo '    <link>' . x($link) . "</link>\n";
    echo '    <guid isPermaLink="false">urn:simonepizzi:article:' . (int)$a['id'] . "</guid>\n";
    echo '    <pubDate>' . date(DATE_RSS, $uscita ?: time()) . "</pubDate>\n";
    echo '    <description>' . x(estratto($a, 300)) . "</description>\n";
    if ($posto < RSS_CON_TESTO) {
        echo '    <content:encoded><![CDATA[' . corpo_per_feed((string)$a['content']) . "]]></content:encoded>\n";
    }
    $c = copertina_per_feed((string)$a['cover_image']);
    if ($c) {
        echo '    <enclosure url="' . x($c['url']) . '" length="' . $c['byte'] . '" type="' . $c['tipo'] . '" />' . "\n";
    }
    echo "  </item>\n";
}

echo "</channel>\n</rss>\n";

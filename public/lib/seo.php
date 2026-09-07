<?php
/**
 * Quello che di una pagina vede un motore di ricerca: titolo, descrizione,
 * indirizzo canonico, scheda d'anteprima, dati strutturati, briciole di pane.
 *
 * Una pagina riempie $PAGINA con quello che sa di sé; partials/head.php stampa.
 * Nessun altro file deve scrivere tag <meta> a mano.
 */

declare(strict_types=1);

/**
 * Lo stato della pagina in corso. Le chiavi che contano:
 *   title, desc      i due testi per Google
 *   canonical        percorso assoluto senza dominio ("/web/qualcosa")
 *   immagine         URL dell'immagine d'anteprima
 *   tipo             'website' o 'article'
 *   noindex          true per tenerla fuori dall'indice
 *   briciole         [['nome'=>…, 'url'=>…], …] — l'ultima è la pagina corrente
 *   jsonld           array già pronto, oppure null
 *   corpo_classe     una classe sul <body>, per il CSS di pagina
 */
$GLOBALS['PAGINA'] = [
    'title'    => SITO_NOME,
    'desc'     => SITO_DESCR,
    'canonical'=> '/',
    'immagine' => '',
    'tipo'     => 'website',
    'noindex'  => false,
    'briciole' => [],
    'jsonld'   => null,
    'corpo_classe' => '',
];

function pagina(array $dati): void {
    $GLOBALS['PAGINA'] = array_merge($GLOBALS['PAGINA'], $dati);
}

function p(string $chiave): mixed {
    return $GLOBALS['PAGINA'][$chiave] ?? null;
}

/**
 * Il titolo della scheda di Google.
 *
 * Regola: se l'articolo ha un «Titolo per Google» scritto a mano si usa
 * quello; altrimenti il titolo vero seguito dal nome del sito. La colonna
 * seo_title non esiste ancora (§9 di DECISIONI.md): finché non c'è, il
 * ripiego lavora da solo e nessuno se ne accorge.
 */
function titolo_seo(array $articolo): string {
    $scritto = trim((string)($articolo['seo_title'] ?? ''));
    if ($scritto !== '') return $scritto;
    return $articolo['title'] . ' — ' . SITO_NOME;
}

/** Come sopra per la descrizione: campo dedicato, poi riassunto, poi il corpo. */
function descrizione_seo(array $articolo): string {
    $scritta = trim((string)($articolo['seo_description'] ?? ''));
    if ($scritta !== '') return $scritta;
    $riassunto = trim((string)($articolo['excerpt'] ?? ''));
    if ($riassunto !== '') return tronca($riassunto, 158);
    return testo_da_html($articolo['content'] ?? '', 158);
}

/* ─────────────────────────── Dati strutturati ──────────────────────────── */

/** Un articolo, come lo capisce Google. */
function jsonld_articolo(array $articolo, array $categoria): array {
    return [
        '@context' => 'https://schema.org',
        '@type'    => 'Article',
        'headline' => mb_substr($articolo['title'], 0, 110),
        'description' => descrizione_seo($articolo),
        'image'    => array_filter([url_immagine($articolo['cover_image'] ?? '')]),
        'datePublished' => data_iso($articolo['published_at'] ?? $articolo['created_at'] ?? null),
        'dateModified'  => data_iso($articolo['published_at'] ?? $articolo['created_at'] ?? null),
        'author'   => ['@type' => 'Person', 'name' => SITO_NOME, 'url' => SITO_URL],
        'publisher'=> ['@type' => 'Person', 'name' => SITO_NOME, 'url' => SITO_URL],
        'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => SITO_URL . url_articolo($articolo)],
        'articleSection'   => $categoria['name'] ?? $articolo['category'],
    ];
}

/** Un archivio (categoria o tag). */
function jsonld_raccolta(string $nome, string $descrizione, string $percorso): array {
    return [
        '@context' => 'https://schema.org',
        '@type'    => 'CollectionPage',
        'name'     => $nome,
        'description' => $descrizione,
        'url'      => SITO_URL . $percorso,
        'isPartOf' => ['@type' => 'WebSite', 'name' => SITO_NOME, 'url' => SITO_URL],
    ];
}

/**
 * Le briciole di pane, sia da vedere sia da leggere per una macchina.
 * L'ultima voce è la pagina corrente e non è un link: Google se lo aspetta.
 */
function jsonld_briciole(array $briciole): ?array {
    if (count($briciole) < 2) return null;
    $voci = [];
    foreach ($briciole as $i => $b) {
        $voce = ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $b['nome']];
        if (!empty($b['url'])) $voce['item'] = SITO_URL . $b['url'];
        $voci[] = $voce;
    }
    return ['@context' => 'https://schema.org', '@type' => 'BreadcrumbList', 'itemListElement' => $voci];
}

/**
 * Stampa uno o più blocchi di dati strutturati.
 * Accetta null fra gli argomenti: la home non ha briciole di pane, e chi
 * chiama non deve doverlo sapere.
 */
function stampa_jsonld(?array ...$blocchi): void {
    foreach ($blocchi as $b) {
        if (!$b) continue;
        echo '<script type="application/ld+json" nonce="' . e(nonce()) . '">'
           . json_encode($b, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
           . '</script>' . "\n";
    }
}

/* ────────────────────────────── Soglia tag ─────────────────────────────── */

/**
 * Un tag usato in uno o due articoli non produce un archivio: produce una
 * pagina che ripete contenuti già presenti altrove. Resta navigabile, ma esce
 * dall'indice e dalla sitemap. La soglia è la stessa della v1.27.0 e va tenuta
 * allineata con sitemap.php.
 */
const TAG_MINIMO_PER_INDICE = 3;

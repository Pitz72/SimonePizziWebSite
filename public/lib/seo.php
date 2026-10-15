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
 * quello, così com'è; altrimenti il titolo vero seguito dal nome del sito.
 * Perché il primo arrivi qui, la query deve chiedere la colonna: vedi
 * COLONNE_ARTICOLO in query.php.
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

/**
 * Un indirizzo assoluto, come lo vogliono Google e le anteprime social.
 * url_immagine() restituisce il percorso relativo, che in pagina va benissimo;
 * nei dati strutturati Google lo scarta.
 */
function url_assoluta(string $percorso): string {
    if ($percorso === '' || preg_match('#^https?://#i', $percorso)) return $percorso;
    return SITO_URL . '/' . ltrim($percorso, '/');
}

/**
 * La data di modifica: la più recente fra uscita e ultimo salvataggio.
 *
 * Non basta `updated_at`. Un articolo programmato si salva prima di uscire,
 * quindi il suo ultimo salvataggio viene prima della pubblicazione; e una
 * modifica non può essere più vecchia dell'uscita.
 */
function data_modifica(array $articolo): ?string {
    $uscita = $articolo['published_at'] ?? $articolo['created_at'] ?? null;
    $salvato = $articolo['updated_at'] ?? null;
    if (!$salvato) return $uscita;
    if (!$uscita) return $salvato;
    return strtotime($salvato) > strtotime($uscita) ? $salvato : $uscita;
}

/** Un articolo, come lo capisce Google. */
function jsonld_articolo(array $articolo, array $categoria): array {
    return [
        '@context' => 'https://schema.org',
        '@type'    => 'Article',
        'headline' => mb_substr($articolo['title'], 0, 110),
        'description' => descrizione_seo($articolo),
        'image'    => array_values(array_filter([url_assoluta(url_immagine($articolo['cover_image'] ?? ''))])),
        'datePublished' => data_iso($articolo['published_at'] ?? $articolo['created_at'] ?? null),
        'dateModified'  => data_iso(data_modifica($articolo)),
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
        // JSON_HEX_TAG: un «</script>» dentro un titolo chiuderebbe il blocco
        // e il resto finirebbe nella pagina come HTML. È la regola di FDCA.
        echo '<script type="application/ld+json">'
           . json_encode($b, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP)
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

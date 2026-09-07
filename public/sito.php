<?php
/**
 * Il front controller: guarda l'indirizzo richiesto e decide quale pagina
 * stampare. Da qui passa tutto il sito pubblico.
 *
 * NOME PROVVISORIO. Al taglio questo file diventa `index.php` e sostituisce
 * quello di adesso. Finché il sito in React è in produzione i due convivono:
 * il vecchio index.php risponde ai visitatori, questo risponde a chi lo chiede
 * per nome, e in sviluppo dev-router.php gli manda tutto.
 *
 * Le rotte sono nove e non cambiano rispetto a oggi. Non deve cambiare
 * nessuna URL: è la lezione che il repo si porta dietro dal sito di Keyla.
 */

declare(strict_types=1);

require __DIR__ . '/lib/avvio.php';

/* ── Che cosa è stato chiesto ───────────────────────────────────────────── */
$percorso = (string)parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$percorso = trim(rawurldecode($percorso), '/');

/* Una barra finale in più non è una pagina diversa: si porta chi arriva
   sull'indirizzo senza, una volta sola e in modo permanente. */
if ($percorso !== '' && str_ends_with((string)parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/')) {
    header('Location: /' . $percorso, true, 301);
    exit;
}

$rotte = require __DIR__ . '/lib/rotte.php';

/** Stampa una pagina e finisce. */
function servi(string $file, array $dati = []): never {
    extract($dati, EXTR_SKIP);
    require __DIR__ . '/pages/' . $file . '.php';
    exit;
}

/** Il 404 vero: con il suo stato HTTP, non una pagina che finge. */
function non_trovata(): never {
    http_response_code(404);
    servi('404');
}

/* ── 1. Le rotte fisse ──────────────────────────────────────────────────── */
if (isset($rotte[$percorso])) {
    $r = $rotte[$percorso];
    pagina([
        'title'    => $r['title'],
        'desc'     => $r['desc'],
        'canonical'=> '/' . $percorso,
        'noindex'  => $r['noindex'] ?? false,
        'briciole' => $percorso === '' ? [] : [
            ['nome' => 'Home', 'url' => '/'],
            ['nome' => $r['briciola'] ?? $r['title']],
        ],
    ]);
    servi($r['pagina']);
}

$parti = array_values(array_filter(explode('/', $percorso), fn($p) => $p !== ''));

/* ── 2. /tag/{tag} ──────────────────────────────────────────────────────── */
if (count($parti) === 2 && $parti[0] === 'tag') {
    $tag = tag_per_slug($parti[1]);
    if (!$tag) non_trovata();

    $quanti = conta_articoli_tag((int)$tag['id']);
    // Un tag senza articoli pubblicati è una pagina vuota: non esiste.
    if ($quanti === 0) non_trovata();

    servi('tag', ['tag' => $tag, 'totale' => $quanti]);
}

/* ── 3. /{categoria} ────────────────────────────────────────────────────── */
if (count($parti) === 1) {
    $categoria = categoria_per_slug($parti[0]);
    if (!$categoria) non_trovata();

    $GLOBALS['ROTTA_CATEGORIA'] = slug_radice($categoria);

    servi('categoria', ['categoria' => $categoria]);
}

/* ── 4. /{categoria}/{articolo} ─────────────────────────────────────────── */
if (count($parti) === 2) {
    $articolo = articolo_per_slug($parti[1]);
    if (!$articolo) non_trovata();

    /* Lo slug dell'articolo è unico in tutto il sito, quindi l'indirizzo giusto
       è uno solo: quello con la categoria a cui l'articolo appartiene davvero.
       Chi arriva con la categoria sbagliata — un vecchio link, un articolo
       spostato — viene portato sull'indirizzo buono invece di vedere la stessa
       pagina sotto due URL diverse, che a Google sembrano due copie. */
    if ($parti[0] !== $articolo['category']) {
        header('Location: ' . url_articolo($articolo), true, 301);
        exit;
    }

    /* Un articolo può stare in una categoria cancellata dopo: in quel caso si
       usa lo slug come nome, invece di dare 404 su un articolo che esiste. */
    $categoria = categoria_per_slug($articolo['category'])
        ?? ['id' => 0, 'name' => $articolo['category'], 'slug' => $articolo['category'], 'parent_id' => null];
    $GLOBALS['ROTTA_CATEGORIA'] = slug_radice($categoria);

    servi('articolo', ['articolo' => $articolo, 'categoria' => $categoria]);
}

/* ── 5. Tutto il resto ──────────────────────────────────────────────────── */
non_trovata();

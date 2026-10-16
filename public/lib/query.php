<?php
/**
 * Le letture dal database. Tutte qui, nessuna dentro le pagine.
 *
 * REGOLA DI COMPATIBILITÀ. Queste query girano su MySQL in produzione e su
 * SQLite in sviluppo, quindi restano nel sottoinsieme che entrambi parlano:
 * niente NOW() (l'adesso arriva da PHP), niente DATE_FORMAT (le date si
 * formattano in helpers.php), niente GROUP_CONCAT (la sintassi del separatore
 * è diversa fra i due: i tag si leggono con una query loro).
 *
 * LIMIT e OFFSET si scrivono interpolando interi già passati per (int): con
 * PDO::ATTR_EMULATE_PREPARES a false, MySQL rifiuta un segnaposto in quella
 * posizione, e un intero castato non è un buco di sicurezza.
 */

declare(strict_types=1);

/** L'adesso, nel formato del database. Uno solo per richiesta. */
function adesso(): string {
    static $a = null;
    return $a ??= date('Y-m-d H:i:s');
}

/** Le colonne del corpo pesano: negli elenchi non si leggono. */
const COLONNE_ELENCO = 'id, title, slug, excerpt, cover_image, category, is_featured, published_at, created_at';
/** Le stesse, con il prefisso della tabella, per le query con una JOIN. */
const COLONNE_ELENCO_A = 'a.id, a.title, a.slug, a.excerpt, a.cover_image, a.category, a.is_featured, a.published_at, a.created_at';

/**
 * Tutto quello che serve alla pagina di un articolo, corpo compreso.
 *
 * `seo_title` e `seo_description` sono il «Titolo per Google» e la
 * «Descrizione per Google» del pannello. Dal 7 settembre al 16 ottobre 2026
 * mancavano da questo elenco: titolo_seo() e descrizione_seo() li cercavano,
 * li trovavano sempre vuoti e ripiegavano su titolo e riassunto, così nessuno
 * dei testi scritti per Google arrivava a Google (revisione del 16 ottobre, G1).
 * `updated_at` serve alla data di modifica dei dati strutturati.
 */
const COLONNE_ARTICOLO = 'id, title, seo_title, slug, content, excerpt, seo_description, focus_keyword,
                          cover_image, category, is_featured, status, published_at, created_at, updated_at,
                          button_a_label, button_a_link, button_b_label, button_b_link';

/** Solo quello che il pubblico può vedere: pubblicato e non programmato nel futuro. */
const SOLO_PUBBLICATI = "status = 'published' AND (published_at IS NULL OR published_at <= :adesso)";

/* ─────────────────────────────── Categorie ─────────────────────────────── */

/** Le sei voci del menu: le categorie senza genitore, nel loro ordine. */
function categorie_radice_db(): array {
    static $c = null;
    return $c ??= db()->query(
        "SELECT id, name, slug FROM categories WHERE parent_id IS NULL ORDER BY sort_order ASC"
    )->fetchAll();
}

function categoria_per_slug_db(string $slug): ?array {
    $q = db()->prepare("SELECT id, name, slug, parent_id FROM categories WHERE slug = ? LIMIT 1");
    $q->execute([$slug]);
    return $q->fetch() ?: null;
}

function categoria_per_id_db(int $id): ?array {
    // sort_order serve alla scheda del pannello: senza, il campo dell'ordine
    // si apriva vuoto e ogni salvataggio rimetteva la categoria a zero.
    $q = db()->prepare("SELECT id, name, slug, parent_id, sort_order FROM categories WHERE id = ? LIMIT 1");
    $q->execute([$id]);
    return $q->fetch() ?: null;
}

/**
 * Lo slug della voce di menu da illuminare.
 *
 * Le categorie sono gerarchiche a un livello: «Il Relitto Silente» sta sotto
 * «Videogiochi». Quando si è dentro una sottocategoria, la voce accesa nella
 * barra deve restare quella del genitore, altrimenti il lettore non capisce
 * più in che parte del sito si trova.
 */
function slug_radice(array $categoria): string {
    if (empty($categoria['parent_id'])) return (string)$categoria['slug'];
    $genitore = categoria_per_id((int)$categoria['parent_id']);
    return (string)($genitore['slug'] ?? $categoria['slug']);
}

/** Le figlie dirette di una categoria, che nel sito sono i singoli progetti. */
function sottocategorie_db(int $idGenitore): array {
    $q = db()->prepare("SELECT id, name, slug FROM categories WHERE parent_id = ? ORDER BY sort_order ASC");
    $q->execute([$idGenitore]);
    return $q->fetchAll();
}

/**
 * Le sottocategorie di tutte le sezioni in un colpo, raggruppate per genitore,
 * e solo quelle che hanno qualcosa dentro.
 *
 * La serve la tendina della barra, che ne vuole sei gruppi su ogni pagina del
 * sito: chiedendoli con sottocategorie() uno per uno sarebbero sei query per
 * una cosa che ne richiede una.
 *
 * Le vuote restano fuori. È la stessa regola che index.php applica ai tag —
 * «un tag senza articoli pubblicati è una pagina vuota: non esiste» — e vale
 * uguale qui: alla data di oggi «Pizzi e De Paola» non ha un solo articolo, e
 * metterla in un menu significa promettere una pagina che non c'è.
 */
function sottocategorie_per_sezione_db(): array {
    static $per = null;
    if ($per !== null) return $per;

    $q = db()->prepare(
        "SELECT c.id, c.name, c.slug, c.parent_id FROM categories c
         WHERE c.parent_id IS NOT NULL
           AND (SELECT COUNT(*) FROM articles a
                WHERE a.category = c.slug AND " . SOLO_PUBBLICATI . ") > 0
         ORDER BY c.sort_order ASC"
    );
    $q->execute([':adesso' => adesso()]);

    $per = [];
    foreach ($q->fetchAll() as $figlia) $per[(int)$figlia['parent_id']][] = $figlia;
    return $per;
}

/**
 * Gli slug che una pagina di categoria deve raccogliere: il suo, più quelli
 * delle figlie.
 *
 * Serve perché gli articoli stanno quasi tutti nelle sottocategorie: alla data
 * di oggi `videogiochi` e `progetti-software` non hanno un solo articolo
 * assegnato direttamente. Senza questa regola le pagine delle sei categorie
 * principali sarebbero vuote.
 *
 * (È anche la ragione per cui il sito nuovo aggiusta una vecchia incoerenza:
 * api/articles.php includeva le figlie dalla v1.10.2, il ramo per i crawler di
 * index.php no. Le stesse pagine mostravano cose diverse a Google e ai
 * lettori. Adesso il percorso è uno solo.)
 */
function slug_del_ramo(array $categoria): array {
    $slug = [$categoria['slug']];
    foreach (sottocategorie((int)$categoria['id']) as $figlia) $slug[] = $figlia['slug'];
    return $slug;
}

/* ─────────────────────────────── Articoli ──────────────────────────────── */

function articoli_recenti_db(int $quanti = 6, int $salta = 0): array {
    $quanti = max(1, $quanti); $salta = max(0, $salta);
    $q = db()->prepare(
        "SELECT " . COLONNE_ELENCO . " FROM articles WHERE " . SOLO_PUBBLICATI . "
         ORDER BY published_at DESC, id DESC LIMIT $quanti OFFSET $salta"
    );
    $q->execute([':adesso' => adesso()]);
    return $q->fetchAll();
}

/**
 * Tutti gli articoli pubblicati, dal più recente: l'archivio (pages/archivio.php).
 * Senza corpo: sono le colonne degli elenchi.
 */
function tutti_gli_articoli_db(): array {
    $q = db()->prepare("SELECT " . COLONNE_ELENCO . " FROM articles WHERE " . SOLO_PUBBLICATI . "
                        AND category <> '' ORDER BY published_at DESC, id DESC");
    $q->execute([':adesso' => adesso()]);
    return $q->fetchAll();
}

/**
 * L'articolo in apertura della home.
 *
 * Se nessuno è segnato «in vetrina» — e alla data di oggi è così per tutti e
 * 78 — si prende il più recente: la home non deve avere un buco perché una
 * casella non è mai stata spuntata.
 */
function articolo_in_apertura_db(): ?array {
    // Qui il corpo si legge: è un articolo solo, e serve per i minuti di
    // lettura e per il riassunto quando l'excerpt manca.
    $q = db()->prepare(
        "SELECT " . COLONNE_ELENCO . ", content FROM articles
         WHERE is_featured = 1 AND " . SOLO_PUBBLICATI . "
         ORDER BY published_at DESC LIMIT 1"
    );
    $q->execute([':adesso' => adesso()]);
    $trovato = $q->fetch();
    if ($trovato) return $trovato;

    $q = db()->prepare(
        "SELECT " . COLONNE_ELENCO . ", content FROM articles WHERE " . SOLO_PUBBLICATI . "
         ORDER BY published_at DESC, id DESC LIMIT 1"
    );
    $q->execute([':adesso' => adesso()]);
    return $q->fetch() ?: null;
}

function articolo_per_slug_db(string $slug): ?array {
    $q = db()->prepare(
        "SELECT " . COLONNE_ARTICOLO . "
         FROM articles WHERE slug = :slug AND " . SOLO_PUBBLICATI . " LIMIT 1"
    );
    $q->execute([':slug' => $slug, ':adesso' => adesso()]);
    return $q->fetch() ?: null;
}

/**
 * Lo stesso articolo, ma senza il filtro dello stato: anche una bozza, anche
 * uno programmato per domattina.
 *
 * È l'UNICA lettura del sito pubblico che scavalca SOLO_PUBBLICATI, e la
 * chiama solo index.php, solo dopo che admin_in_ascolto() ha confermato che
 * dall'altra parte c'è una sessione del pannello valida. Non aggiungerne
 * altre: un elenco che mostrasse i programmati renderebbe impossibile capire
 * che cosa è davvero online.
 */
function articolo_per_slug_in_anteprima(string $slug): ?array {
    $q = db()->prepare(
        "SELECT " . COLONNE_ARTICOLO . " FROM articles WHERE slug = :slug LIMIT 1"
    );
    $q->execute([':slug' => $slug]);
    return $q->fetch() ?: null;
}

/**
 * L'articolo a cui porta uno slug vecchio, se c'è ed è pubblicato.
 *
 * Quando lo slug di un articolo uscito cambia, il pannello annota quello di
 * prima (slug_storici, revisione del 16 ottobre, M5). Qui lo si cerca prima di
 * rispondere 404. Se la tabella non esiste ancora — nasce alla prima apertura
 * del pannello o al primo giro di manutenzione — non c'è niente da cercare.
 */
function articolo_da_slug_storico(string $slug): ?array {
    try {
        $q = db()->prepare("SELECT a.category, a.slug FROM slug_storici s
                            JOIN articles a ON a.id = s.article_id
                            WHERE s.slug = :slug AND a.status = 'published'
                              AND (a.published_at IS NULL OR a.published_at <= :adesso) LIMIT 1");
        $q->execute([':slug' => $slug, ':adesso' => adesso()]);
        return $q->fetch() ?: null;
    } catch (PDOException $e) {
        return null;
    }
}

/** Quanti articoli ha una categoria, contando le sue sottocategorie. */
function conta_articoli_categoria_db(array $categoria): int {
    $slug = slug_del_ramo($categoria);
    $segni = implode(',', array_fill(0, count($slug), '?'));
    $q = db()->prepare("SELECT COUNT(*) FROM articles
        WHERE category IN ($segni) AND status = 'published'
          AND (published_at IS NULL OR published_at <= ?)");
    $q->execute([...$slug, adesso()]);
    return (int)$q->fetchColumn();
}

function articoli_di_categoria_db(array $categoria, int $quanti = 12, int $salta = 0): array {
    $quanti = max(1, $quanti); $salta = max(0, $salta);
    $slug = slug_del_ramo($categoria);
    $segni = implode(',', array_fill(0, count($slug), '?'));
    $q = db()->prepare("SELECT " . COLONNE_ELENCO . ", is_category_pinned FROM articles
        WHERE category IN ($segni) AND status = 'published'
          AND (published_at IS NULL OR published_at <= ?)
        ORDER BY is_category_pinned DESC, published_at DESC, id DESC
        LIMIT $quanti OFFSET $salta");
    $q->execute([...$slug, adesso()]);
    return $q->fetchAll();
}

/**
 * L'articolo fissato in cima a una categoria, se c'è.
 *
 * È quello che apre la sezione, e ce n'è al massimo uno: la regola la fa
 * rispettare il pannello (fissa_in_categoria). Qui si legge e basta, ma con il
 * LIMIT 1 per non dipendere da quella promessa.
 */
function fissato_di_categoria_db(string $slugCategoria): ?array {
    $q = db()->prepare("SELECT " . COLONNE_ELENCO . ", content FROM articles
                        WHERE category = :cat AND is_category_pinned = 1
                          AND " . SOLO_PUBBLICATI . " LIMIT 1");
    $q->execute([':cat' => $slugCategoria, ':adesso' => adesso()]);
    return $q->fetch() ?: null;
}

/** Gli altri articoli della stessa categoria, per il fondo di un articolo. */
function articoli_vicini_db(array $articolo, int $quanti = 3): array {
    $q = db()->prepare("SELECT " . COLONNE_ELENCO . " FROM articles
        WHERE category = :cat AND id <> :id AND " . SOLO_PUBBLICATI . "
        ORDER BY published_at DESC LIMIT " . max(1, $quanti));
    $q->execute([':cat' => $articolo['category'], ':id' => $articolo['id'], ':adesso' => adesso()]);
    return $q->fetchAll();
}

/* ───────────────────────────────── Tag ─────────────────────────────────── */

function tag_per_slug_db(string $slug): ?array {
    $q = db()->prepare("SELECT id, name, slug FROM tags WHERE slug = ? LIMIT 1");
    $q->execute([$slug]);
    return $q->fetch() ?: null;
}

function tag_di_articolo_db(int $idArticolo): array {
    $q = db()->prepare("SELECT t.name, t.slug FROM article_tags a
        JOIN tags t ON t.id = a.tag_id WHERE a.article_id = ? ORDER BY t.name ASC");
    $q->execute([$idArticolo]);
    return $q->fetchAll();
}

function conta_articoli_tag_db(int $idTag): int {
    // `status` e `published_at` esistono solo in articles: nessuna ambiguità.
    $q = db()->prepare("SELECT COUNT(*) FROM articles a
        JOIN article_tags x ON x.article_id = a.id
        WHERE x.tag_id = :tag AND " . SOLO_PUBBLICATI);
    $q->execute([':tag' => $idTag, ':adesso' => adesso()]);
    return (int)$q->fetchColumn();
}

function articoli_di_tag_db(int $idTag, int $quanti = 12, int $salta = 0): array {
    $quanti = max(1, $quanti); $salta = max(0, $salta);
    $q = db()->prepare("SELECT " . COLONNE_ELENCO_A . "
        FROM articles a JOIN article_tags x ON x.article_id = a.id
        WHERE x.tag_id = :tag AND a.status = 'published'
          AND (a.published_at IS NULL OR a.published_at <= :adesso)
        ORDER BY a.published_at DESC, a.id DESC LIMIT $quanti OFFSET $salta");
    $q->execute([':tag' => $idTag, ':adesso' => adesso()]);
    return $q->fetchAll();
}

/* ──────────────────────────────── Conteggi ─────────────────────────────── */

/**
 * I numeri dell'apertura. Sono quattro query banali, ma vale la pena tenerle
 * insieme: se un giorno pesano, si mette una cache qui e basta.
 */
function conteggi_db(): array {
    static $c = null;
    if ($c !== null) return $c;

    $q = db()->prepare("SELECT COUNT(*) FROM articles WHERE " . SOLO_PUBBLICATI);
    $q->execute([':adesso' => adesso()]);
    $articoli = (int)$q->fetchColumn();

    $ultimo = db()->prepare("SELECT published_at FROM articles WHERE " . SOLO_PUBBLICATI . "
        ORDER BY published_at DESC LIMIT 1");
    $ultimo->execute([':adesso' => adesso()]);

    return $c = [
        'articoli' => $articoli,
        // Solo i tag con almeno un articolo pubblicato: contava anche gli orfani
        // (revisione del 16 ottobre, L3).
        'tag'      => (function (): int {
            $t = db()->prepare("SELECT COUNT(DISTINCT x.tag_id) FROM article_tags x
                                JOIN articles a ON a.id = x.article_id WHERE " . SOLO_PUBBLICATI);
            $t->execute([':adesso' => adesso()]);
            return (int)$t->fetchColumn();
        })(),
        'ultimo'   => (string)($ultimo->fetchColumn() ?: ''),
    ];
}

/* ─────────────────────────────── Ricerca ───────────────────────────────── */

/**
 * La ricerca del Ctrl+K: gli articoli.
 *
 * Cerca nel titolo, nel riassunto, nel corpo e — cosa che la ricerca di oggi
 * non fa più davvero — nei tag veri, quelli della tabella article_tags.
 * `api/search.php` (tolto il 16 ottobre 2026) guardava una colonna `articles.tags` che la v1.26.0 ha
 * sostituito con la tabella di collegamento.
 *
 * L'ordine mette prima chi ha la parola nel titolo: chi cerca «favella» vuole
 * l'articolo che si chiama Favella, non quello che la nomina di sfuggita.
 */
function cerca(string $testo, int $limite = 12): array {
    $testo = trim($testo);
    if (mb_strlen($testo) < 2) return [];

    // «%» e «_» scritti da chi cerca sono lettere, non jolly del LIKE (revisione
    // del 16 ottobre, L6). ESCAPE '!' lo capiscono sia MySQL sia SQLite.
    $come = '%' . strtr($testo, ['!' => '!!', '%' => '!%', '_' => '!_']) . '%';
    $limite = max(1, min(30, $limite));

    $q = db()->prepare(
        "SELECT a.id, a.title, a.slug, a.excerpt, a.category, a.published_at,
                'articolo' AS genere
         FROM articles a
         WHERE " . SOLO_PUBBLICATI . "
           AND (a.title LIKE :come ESCAPE '!' OR a.excerpt LIKE :come2 ESCAPE '!' OR a.content LIKE :come3 ESCAPE '!'
                OR a.id IN (SELECT x.article_id FROM article_tags x
                            JOIN tags t ON t.id = x.tag_id WHERE t.name LIKE :come4 ESCAPE '!'))
         ORDER BY CASE WHEN a.title LIKE :come5 ESCAPE '!' THEN 0 ELSE 1 END,
                  a.published_at DESC
         LIMIT $limite"
    );
    $q->execute([':come' => $come, ':come2' => $come, ':come3' => $come,
                 ':come4' => $come, ':come5' => $come, ':adesso' => adesso()]);
    $trovati = $q->fetchAll();

    return $trovati;
}

/* ────────────────────────────── La cache ──────────────────────────────────
   Revisione del 16 ottobre 2026, M3. Le letture qui sopra si chiamano
   <nome>_db; quelle che usano le pagine hanno il nome di sempre e passano da
   cache_ricorda() (lib/cache.php): cinque minuti, svuotata a ogni POST del
   pannello. Restano fuori cerca(), che dipende da quello che si scrive, e
   articolo_per_slug_in_anteprima(), che deve vedere il database com'è. */

function categorie_radice(): array { return cache_ricorda('categorie_radice', fn() => categorie_radice_db()); }
function categoria_per_slug(string $slug): ?array { return cache_ricorda('categoria_per_slug:' . $slug, fn() => categoria_per_slug_db($slug)); }
function categoria_per_id(int $id): ?array { return cache_ricorda('categoria_per_id:' . $id, fn() => categoria_per_id_db($id)); }
function sottocategorie(int $idGenitore): array { return cache_ricorda('sottocategorie:' . $idGenitore, fn() => sottocategorie_db($idGenitore)); }
function sottocategorie_per_sezione(): array { return cache_ricorda('sottocategorie_per_sezione', fn() => sottocategorie_per_sezione_db()); }
function articoli_recenti(int $quanti = 6, int $salta = 0): array { return cache_ricorda('articoli_recenti:' . $quanti . ':' . $salta, fn() => articoli_recenti_db($quanti, $salta)); }
function tutti_gli_articoli(): array { return cache_ricorda('tutti_gli_articoli', fn() => tutti_gli_articoli_db()); }
function articolo_in_apertura(): ?array { return cache_ricorda('articolo_in_apertura', fn() => articolo_in_apertura_db()); }
function articolo_per_slug(string $slug): ?array { return cache_ricorda('articolo_per_slug:' . $slug, fn() => articolo_per_slug_db($slug)); }
function conta_articoli_categoria(array $categoria): int { return cache_ricorda('conta_articoli_categoria:' . $categoria['slug'], fn() => conta_articoli_categoria_db($categoria)); }
function articoli_di_categoria(array $categoria, int $quanti = 12, int $salta = 0): array { return cache_ricorda('articoli_di_categoria:' . $categoria['slug'] . ':' . $quanti . ':' . $salta, fn() => articoli_di_categoria_db($categoria, $quanti, $salta)); }
function fissato_di_categoria(string $slugCategoria): ?array { return cache_ricorda('fissato_di_categoria:' . $slugCategoria, fn() => fissato_di_categoria_db($slugCategoria)); }
function articoli_vicini(array $articolo, int $quanti = 3): array { return cache_ricorda('articoli_vicini:' . $articolo['id'] . ':' . $articolo['category'] . ':' . $quanti, fn() => articoli_vicini_db($articolo, $quanti)); }
function tag_per_slug(string $slug): ?array { return cache_ricorda('tag_per_slug:' . $slug, fn() => tag_per_slug_db($slug)); }
function tag_di_articolo(int $idArticolo): array { return cache_ricorda('tag_di_articolo:' . $idArticolo, fn() => tag_di_articolo_db($idArticolo)); }
function conta_articoli_tag(int $idTag): int { return cache_ricorda('conta_articoli_tag:' . $idTag, fn() => conta_articoli_tag_db($idTag)); }
function articoli_di_tag(int $idTag, int $quanti = 12, int $salta = 0): array { return cache_ricorda('articoli_di_tag:' . $idTag . ':' . $quanti . ':' . $salta, fn() => articoli_di_tag_db($idTag, $quanti, $salta)); }
function conteggi(): array { return cache_ricorda('conteggi', fn() => conteggi_db()); }

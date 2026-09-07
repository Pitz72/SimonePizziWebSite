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

/** Solo quello che il pubblico può vedere: pubblicato e non programmato nel futuro. */
const SOLO_PUBBLICATI = "status = 'published' AND (published_at IS NULL OR published_at <= :adesso)";

/* ─────────────────────────────── Categorie ─────────────────────────────── */

/** Le sei voci del menu: le categorie senza genitore, nel loro ordine. */
function categorie_radice(): array {
    static $c = null;
    return $c ??= db()->query(
        "SELECT id, name, slug FROM categories WHERE parent_id IS NULL ORDER BY sort_order ASC"
    )->fetchAll();
}

function categoria_per_slug(string $slug): ?array {
    $q = db()->prepare("SELECT id, name, slug, parent_id FROM categories WHERE slug = ? LIMIT 1");
    $q->execute([$slug]);
    return $q->fetch() ?: null;
}

function categoria_per_id(int $id): ?array {
    $q = db()->prepare("SELECT id, name, slug, parent_id FROM categories WHERE id = ? LIMIT 1");
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
function sottocategorie(int $idGenitore): array {
    $q = db()->prepare("SELECT id, name, slug FROM categories WHERE parent_id = ? ORDER BY sort_order ASC");
    $q->execute([$idGenitore]);
    return $q->fetchAll();
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

function articoli_recenti(int $quanti = 6, int $salta = 0): array {
    $quanti = max(1, $quanti); $salta = max(0, $salta);
    $q = db()->prepare(
        "SELECT " . COLONNE_ELENCO . " FROM articles WHERE " . SOLO_PUBBLICATI . "
         ORDER BY published_at DESC, id DESC LIMIT $quanti OFFSET $salta"
    );
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
function articolo_in_apertura(): ?array {
    $q = db()->prepare(
        "SELECT " . COLONNE_ELENCO . " FROM articles
         WHERE is_featured = 1 AND " . SOLO_PUBBLICATI . "
         ORDER BY published_at DESC LIMIT 1"
    );
    $q->execute([':adesso' => adesso()]);
    return $q->fetch() ?: (articoli_recenti(1)[0] ?? null);
}

function articolo_per_slug(string $slug): ?array {
    $q = db()->prepare(
        "SELECT id, title, slug, content, excerpt, focus_keyword, cover_image, category,
                is_featured, status, published_at, created_at
         FROM articles WHERE slug = :slug AND " . SOLO_PUBBLICATI . " LIMIT 1"
    );
    $q->execute([':slug' => $slug, ':adesso' => adesso()]);
    return $q->fetch() ?: null;
}

/** Quanti articoli ha una categoria, contando le sue sottocategorie. */
function conta_articoli_categoria(array $categoria): int {
    $slug = slug_del_ramo($categoria);
    $segni = implode(',', array_fill(0, count($slug), '?'));
    $q = db()->prepare("SELECT COUNT(*) FROM articles
        WHERE category IN ($segni) AND status = 'published'
          AND (published_at IS NULL OR published_at <= ?)");
    $q->execute([...$slug, adesso()]);
    return (int)$q->fetchColumn();
}

function articoli_di_categoria(array $categoria, int $quanti = 12, int $salta = 0): array {
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

/** Gli altri articoli della stessa categoria, per il fondo di un articolo. */
function articoli_vicini(array $articolo, int $quanti = 3): array {
    $q = db()->prepare("SELECT " . COLONNE_ELENCO . " FROM articles
        WHERE category = :cat AND id <> :id AND " . SOLO_PUBBLICATI . "
        ORDER BY published_at DESC LIMIT " . max(1, $quanti));
    $q->execute([':cat' => $articolo['category'], ':id' => $articolo['id'], ':adesso' => adesso()]);
    return $q->fetchAll();
}

/* ───────────────────────────────── Tag ─────────────────────────────────── */

function tag_per_slug(string $slug): ?array {
    $q = db()->prepare("SELECT id, name, slug FROM tags WHERE slug = ? LIMIT 1");
    $q->execute([$slug]);
    return $q->fetch() ?: null;
}

function tag_di_articolo(int $idArticolo): array {
    $q = db()->prepare("SELECT t.name, t.slug FROM article_tags a
        JOIN tags t ON t.id = a.tag_id WHERE a.article_id = ? ORDER BY t.name ASC");
    $q->execute([$idArticolo]);
    return $q->fetchAll();
}

function conta_articoli_tag(int $idTag): int {
    // `status` e `published_at` esistono solo in articles: nessuna ambiguità.
    $q = db()->prepare("SELECT COUNT(*) FROM articles a
        JOIN article_tags x ON x.article_id = a.id
        WHERE x.tag_id = :tag AND " . SOLO_PUBBLICATI);
    $q->execute([':tag' => $idTag, ':adesso' => adesso()]);
    return (int)$q->fetchColumn();
}

function articoli_di_tag(int $idTag, int $quanti = 12, int $salta = 0): array {
    $quanti = max(1, $quanti); $salta = max(0, $salta);
    $q = db()->prepare("SELECT " . COLONNE_ELENCO_A . "
        FROM articles a JOIN article_tags x ON x.article_id = a.id
        WHERE x.tag_id = :tag AND a.status = 'published'
          AND (a.published_at IS NULL OR a.published_at <= :adesso)
        ORDER BY a.published_at DESC, a.id DESC LIMIT $quanti OFFSET $salta");
    $q->execute([':tag' => $idTag, ':adesso' => adesso()]);
    return $q->fetchAll();
}

/* ──────────────────────────────── Progetti ─────────────────────────────── */

function progetti(?string $categoria = null): array {
    if ($categoria !== null) {
        $q = db()->prepare("SELECT * FROM projects WHERE is_visible = 1 AND category = ?
            ORDER BY sort_order ASC, created_at DESC");
        $q->execute([$categoria]);
        return $q->fetchAll();
    }
    return db()->query("SELECT * FROM projects WHERE is_visible = 1
        ORDER BY sort_order ASC, created_at DESC")->fetchAll();
}

/* ──────────────────────────────── Conteggi ─────────────────────────────── */

/**
 * I numeri dell'apertura. Sono quattro query banali, ma vale la pena tenerle
 * insieme: se un giorno pesano, si mette una cache qui e basta.
 */
function conteggi(): array {
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
        'progetti' => (int)db()->query("SELECT COUNT(*) FROM projects WHERE is_visible = 1")->fetchColumn(),
        'tag'      => (int)db()->query("SELECT COUNT(*) FROM tags")->fetchColumn(),
        'ultimo'   => (string)($ultimo->fetchColumn() ?: ''),
    ];
}

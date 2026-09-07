<?php
/**
 * Le letture e le scritture del pannello.
 *
 * Vale la stessa regola di query.php: solo SQL che MySQL e SQLite parlano
 * entrambi, così quello che funziona in sviluppo funziona in produzione.
 * Le scritture passano tutte da qui: nessuna pagina del pannello scrive SQL.
 */

declare(strict_types=1);

/* ═════════════════════════════════ Articoli ═════════════════════════════ */

/** Le colonne dell'elenco: senza il corpo, che negli elenchi non serve. */
const COLONNE_ADMIN = 'id, title, slug, excerpt, cover_image, category, status,
                       is_featured, is_category_pinned, published_at, created_at';

/**
 * L'elenco del pannello: tutti gli stati, anche bozze e programmati.
 *
 * @return array{righe: array, totale: int}
 */
function admin_articoli(array $filtri = [], int $pagina = 1, int $perPagina = 20): array {
    $dove = [];
    $val  = [];

    if (!empty($filtri['stato'])) {
        $dove[] = 'status = ?';
        $val[]  = $filtri['stato'];
    }
    if (!empty($filtri['categoria'])) {
        $dove[] = 'category = ?';
        $val[]  = $filtri['categoria'];
    }
    if (!empty($filtri['testo'])) {
        $dove[] = '(title LIKE ? OR excerpt LIKE ? OR slug LIKE ?)';
        $come = '%' . $filtri['testo'] . '%';
        array_push($val, $come, $come, $come);
    }
    $condizione = $dove ? 'WHERE ' . implode(' AND ', $dove) : '';

    $conta = db()->prepare("SELECT COUNT(*) FROM articles $condizione");
    $conta->execute($val);
    $totale = (int)$conta->fetchColumn();

    $perPagina = max(5, min(100, $perPagina));
    $salta = max(0, ($pagina - 1) * $perPagina);

    $q = db()->prepare("SELECT " . COLONNE_ADMIN . " FROM articles $condizione
                        ORDER BY COALESCE(published_at, created_at) DESC, id DESC
                        LIMIT $perPagina OFFSET $salta");
    $q->execute($val);

    return ['righe' => $q->fetchAll(), 'totale' => $totale];
}

/** Un articolo qualunque, anche non pubblicato: qui dentro si può vedere tutto. */
function admin_articolo(int $id): ?array {
    $q = db()->prepare("SELECT * FROM articles WHERE id = ? LIMIT 1");
    $q->execute([$id]);
    return $q->fetch() ?: null;
}

/**
 * Uno slug che non esiste ancora.
 *
 * Lo slug è l'indirizzo pubblico dell'articolo: due articoli con lo stesso
 * slug sarebbero due pagine allo stesso indirizzo. Se è già preso si aggiunge
 * un numero, come fa già api/articles.php.
 */
function slug_libero(string $desiderato, ?int $esclusoId = null): string {
    $base = slug($desiderato) ?: 'articolo';
    $slug = $base;
    $n = 1;
    while (true) {
        $q = db()->prepare("SELECT id FROM articles WHERE slug = ?" .
                           ($esclusoId ? " AND id <> ?" : "") . " LIMIT 1");
        $q->execute($esclusoId ? [$slug, $esclusoId] : [$slug]);
        if (!$q->fetch()) return $slug;
        $slug = $base . '-' . (++$n);
    }
}

/** Scrive un articolo, nuovo o esistente. Ritorna l'id. */
function salva_articolo(array $d, ?int $id = null): int {
    $campi = [
        'title'              => trim((string)$d['title']),
        'slug'               => slug_libero($d['slug'] ?: $d['title'], $id),
        'content'            => (string)($d['content'] ?? ''),
        'excerpt'            => trim((string)($d['excerpt'] ?? '')),
        'focus_keyword'      => trim((string)($d['focus_keyword'] ?? '')) ?: null,
        'seo_title'          => trim((string)($d['seo_title'] ?? '')) ?: null,
        'seo_description'    => trim((string)($d['seo_description'] ?? '')) ?: null,
        'cover_image'        => trim((string)($d['cover_image'] ?? '')),
        'category'           => trim((string)($d['category'] ?? '')),
        'status'             => in_array($d['status'] ?? '', ['published', 'draft'], true) ? $d['status'] : 'draft',
        'is_featured'        => !empty($d['is_featured']) ? 1 : 0,
        'is_category_pinned' => !empty($d['is_category_pinned']) ? 1 : 0,
        'published_at'       => trim((string)($d['published_at'] ?? '')) ?: null,
    ];

    if ($id) {
        $pezzi = implode(', ', array_map(fn($c) => "$c = :$c", array_keys($campi)));
        $q = db()->prepare("UPDATE articles SET $pezzi WHERE id = :id");
        $q->execute($campi + ['id' => $id]);
        return $id;
    }

    $campi['created_at'] = date('Y-m-d H:i:s');
    $nomi = implode(', ', array_keys($campi));
    $segni = implode(', ', array_map(fn($c) => ":$c", array_keys($campi)));
    db()->prepare("INSERT INTO articles ($nomi) VALUES ($segni)")->execute($campi);
    return (int)db()->lastInsertId();
}

function elimina_articolo(int $id): void {
    db()->prepare("DELETE FROM article_tags WHERE article_id = ?")->execute([$id]);
    db()->prepare("DELETE FROM articles WHERE id = ?")->execute([$id]);
}

/**
 * Copia un articolo. La copia nasce bozza e con un titolo che si riconosce:
 * duplicare per sbaglio e pubblicare due volte la stessa cosa è successo a
 * tutti almeno una volta.
 */
function duplica_articolo(int $id): ?int {
    $a = admin_articolo($id);
    if (!$a) return null;

    $nuovo = salva_articolo([
        'title'   => $a['title'] . ' (copia)',
        'slug'    => $a['slug'] . '-copia',
        'content' => $a['content'],
        'excerpt' => $a['excerpt'],
        'focus_keyword'   => $a['focus_keyword'] ?? '',
        'seo_title'       => $a['seo_title'] ?? '',
        'seo_description' => $a['seo_description'] ?? '',
        'cover_image'     => $a['cover_image'],
        'category'        => $a['category'],
        'status'          => 'draft',
        'published_at'    => null,
    ]);

    foreach (tag_di_articolo($id) as $t) {
        $tag = tag_per_slug($t['slug']);
        if ($tag) lega_tag($nuovo, (int)$tag['id']);
    }
    return $nuovo;
}

/* ═════════════════════════════════ Tag ══════════════════════════════════ */

function lega_tag(int $idArticolo, int $idTag): void {
    $q = db()->prepare("SELECT 1 FROM article_tags WHERE article_id = ? AND tag_id = ?");
    $q->execute([$idArticolo, $idTag]);
    if ($q->fetch()) return;
    db()->prepare("INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)")
        ->execute([$idArticolo, $idTag]);
}

/**
 * Riscrive i tag di un articolo a partire da un elenco di nomi.
 * I tag che non esistono si creano; quelli tolti restano nella tabella (magari
 * li usa un altro articolo) e finiscono semmai fra gli orfani.
 */
function imposta_tag_articolo(int $idArticolo, array $nomi): void {
    db()->prepare("DELETE FROM article_tags WHERE article_id = ?")->execute([$idArticolo]);

    foreach ($nomi as $nome) {
        $nome = trim($nome);
        if ($nome === '') continue;

        $s = slug($nome);
        $q = db()->prepare("SELECT id FROM tags WHERE slug = ? LIMIT 1");
        $q->execute([$s]);
        $id = $q->fetchColumn();

        if (!$id) {
            db()->prepare("INSERT INTO tags (name, slug) VALUES (?, ?)")->execute([$nome, $s]);
            $id = (int)db()->lastInsertId();
        }
        lega_tag($idArticolo, (int)$id);
    }
}

/** Tutti i tag con quanti articoli li usano. */
function admin_tag(string $cerca = ''): array {
    $dove = $cerca !== '' ? "WHERE t.name LIKE ?" : '';
    $q = db()->prepare("SELECT t.id, t.name, t.slug,
                               (SELECT COUNT(*) FROM article_tags x WHERE x.tag_id = t.id) AS quanti
                        FROM tags t $dove
                        ORDER BY quanti DESC, t.name ASC");
    $q->execute($cerca !== '' ? ['%' . $cerca . '%'] : []);
    return $q->fetchAll();
}

/** Rinominare un tag ne cambia anche l'indirizzo: lo slug segue il nome. */
function rinomina_tag(int $id, string $nome): void {
    db()->prepare("UPDATE tags SET name = ?, slug = ? WHERE id = ?")
        ->execute([trim($nome), slug($nome), $id]);
}

/**
 * Unisce due tag: tutti gli articoli del primo passano al secondo, e il primo
 * sparisce. È l'operazione che ad agosto ha ridotto la coda dei doppioni.
 */
function unisci_tag(int $daId, int $aId): void {
    if ($daId === $aId) return;
    $articoli = db()->prepare("SELECT article_id FROM article_tags WHERE tag_id = ?");
    $articoli->execute([$daId]);
    foreach ($articoli->fetchAll(PDO::FETCH_COLUMN) as $idArticolo) {
        lega_tag((int)$idArticolo, $aId);
    }
    db()->prepare("DELETE FROM article_tags WHERE tag_id = ?")->execute([$daId]);
    db()->prepare("DELETE FROM tags WHERE id = ?")->execute([$daId]);
}

function elimina_tag(int $id): void {
    db()->prepare("DELETE FROM article_tags WHERE tag_id = ?")->execute([$id]);
    db()->prepare("DELETE FROM tags WHERE id = ?")->execute([$id]);
}

/* ═══════════════════════════════ Progetti ═══════════════════════════════ */

function admin_progetti(): array {
    return db()->query("SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC")->fetchAll();
}

function admin_progetto(int $id): ?array {
    $q = db()->prepare("SELECT * FROM projects WHERE id = ? LIMIT 1");
    $q->execute([$id]);
    return $q->fetch() ?: null;
}

function salva_progetto(array $d, ?int $id = null): int {
    $campi = [
        'name'           => trim((string)$d['name']),
        'description'    => trim((string)($d['description'] ?? '')),
        'category'       => trim((string)($d['category'] ?? '')),
        'stato'          => in_array($d['stato'] ?? '', ['in_corso','pubblicato','open_source','archiviato'], true)
                            ? $d['stato'] : null,
        'cover_image'    => trim((string)($d['cover_image'] ?? '')),
        'button_a_label' => trim((string)($d['button_a_label'] ?? '')),
        'button_a_url'   => trim((string)($d['button_a_url'] ?? '')),
        'button_b_label' => trim((string)($d['button_b_label'] ?? '')),
        'button_b_url'   => trim((string)($d['button_b_url'] ?? '')),
        'is_visible'     => !empty($d['is_visible']) ? 1 : 0,
        'sort_order'     => (int)($d['sort_order'] ?? 0),
    ];

    if ($id) {
        $pezzi = implode(', ', array_map(fn($c) => "$c = :$c", array_keys($campi)));
        db()->prepare("UPDATE projects SET $pezzi WHERE id = :id")->execute($campi + ['id' => $id]);
        return $id;
    }
    $campi['created_at'] = date('Y-m-d H:i:s');
    $nomi = implode(', ', array_keys($campi));
    $segni = implode(', ', array_map(fn($c) => ":$c", array_keys($campi)));
    db()->prepare("INSERT INTO projects ($nomi) VALUES ($segni)")->execute($campi);
    return (int)db()->lastInsertId();
}

function elimina_progetto(int $id): void {
    db()->prepare("DELETE FROM projects WHERE id = ?")->execute([$id]);
}

/* ═══════════════════════════════ Categorie ══════════════════════════════ */

function admin_categorie(): array {
    return db()->query("SELECT c.*,
        (SELECT COUNT(*) FROM articles a WHERE a.category = c.slug) AS quanti
        FROM categories c ORDER BY c.sort_order ASC")->fetchAll();
}

function salva_categoria(array $d, ?int $id = null): int {
    $campi = [
        'name'       => trim((string)$d['name']),
        'slug'       => slug((string)($d['slug'] ?: $d['name'])),
        'parent_id'  => !empty($d['parent_id']) ? (int)$d['parent_id'] : null,
        'sort_order' => (int)($d['sort_order'] ?? 0),
    ];
    if ($id) {
        db()->prepare("UPDATE categories SET name=:name, slug=:slug, parent_id=:parent_id,
                       sort_order=:sort_order WHERE id=:id")->execute($campi + ['id' => $id]);
        return $id;
    }
    db()->prepare("INSERT INTO categories (name,slug,parent_id,sort_order)
                   VALUES (:name,:slug,:parent_id,:sort_order)")->execute($campi);
    return (int)db()->lastInsertId();
}

/**
 * Una categoria con articoli dentro non si cancella: sparirebbe l'indirizzo
 * pubblico di quegli articoli, e resterebbero irraggiungibili.
 * @return string  '' se fatto, altrimenti il motivo del rifiuto
 */
function elimina_categoria(int $id): string {
    $c = categoria_per_id($id);
    if (!$c) return 'Categoria non trovata.';

    $q = db()->prepare("SELECT COUNT(*) FROM articles WHERE category = ?");
    $q->execute([$c['slug']]);
    if ((int)$q->fetchColumn() > 0) {
        return 'Ci sono ancora articoli in questa categoria: spostali prima di cancellarla.';
    }
    if (sottocategorie($id)) {
        return 'Ci sono sottocategorie qui dentro: spostale o cancellale prima.';
    }
    db()->prepare("DELETE FROM categories WHERE id = ?")->execute([$id]);
    return '';
}

/* ════════════════════════════════ Media ═════════════════════════════════ */

function admin_media(int $quanti = 60, int $salta = 0): array {
    $quanti = max(1, min(200, $quanti)); $salta = max(0, $salta);
    return db()->query("SELECT * FROM media ORDER BY created_at DESC
                        LIMIT $quanti OFFSET $salta")->fetchAll();
}

function conta_media(): int {
    return (int)db()->query("SELECT COUNT(*) FROM media")->fetchColumn();
}

/* ══════════════════════════════ Messaggi ════════════════════════════════ */

function admin_messaggi(): array {
    return db()->query("SELECT * FROM messages ORDER BY created_at DESC")->fetchAll();
}

function segna_messaggio_letto(int $id): void {
    db()->prepare("UPDATE messages SET read_at = ? WHERE id = ? AND read_at IS NULL")
        ->execute([date('Y-m-d H:i:s'), $id]);
}

function elimina_messaggio(int $id): void {
    db()->prepare("DELETE FROM messages WHERE id = ?")->execute([$id]);
}

function messaggi_da_leggere(): int {
    return (int)db()->query("SELECT COUNT(*) FROM messages WHERE read_at IS NULL")->fetchColumn();
}

/* ═════════════════════════════ Newsletter ═══════════════════════════════ */

function admin_iscritti(string $stato = ''): array {
    if ($stato !== '') {
        $q = db()->prepare("SELECT * FROM subscribers WHERE status = ? ORDER BY created_at DESC");
        $q->execute([$stato]);
        return $q->fetchAll();
    }
    return db()->query("SELECT * FROM subscribers ORDER BY created_at DESC")->fetchAll();
}

function conteggi_iscritti(): array {
    $c = ['confirmed' => 0, 'pending' => 0, 'unsubscribed' => 0];
    foreach (db()->query("SELECT status, COUNT(*) AS quanti FROM subscribers GROUP BY status") as $r) {
        $c[$r['status']] = (int)$r['quanti'];
    }
    $c['totale'] = array_sum($c);
    return $c;
}

function elimina_iscritto(int $id): void {
    db()->prepare("DELETE FROM subscribers WHERE id = ?")->execute([$id]);
}

/* ════════════════════════════ Statistiche ═══════════════════════════════ */

/** Le visite giorno per giorno, per il grafico del cruscotto. */
function visite_per_giorno(int $giorni = 30): array {
    $da = date('Y-m-d', strtotime("-$giorni days"));
    $q = db()->prepare("SELECT view_date, COUNT(*) AS quante FROM article_views
                        WHERE view_date >= ? GROUP BY view_date ORDER BY view_date ASC");
    $q->execute([$da]);

    // I giorni senza visite non tornano dal database: un grafico con i buchi
    // mentirebbe sull'andamento, quindi si riempiono di zeri.
    $trovate = [];
    foreach ($q->fetchAll() as $r) $trovate[$r['view_date']] = (int)$r['quante'];

    $serie = [];
    for ($i = $giorni; $i >= 0; $i--) {
        $g = date('Y-m-d', strtotime("-$i days"));
        $serie[$g] = $trovate[$g] ?? 0;
    }
    return $serie;
}

function articoli_piu_letti(int $quanti = 8): array {
    $quanti = max(1, min(50, $quanti));
    return db()->query("SELECT a.id, a.title, a.slug, a.category,
                               COUNT(v.id) AS visite
                        FROM articles a JOIN article_views v ON v.article_id = a.id
                        GROUP BY a.id, a.title, a.slug, a.category
                        ORDER BY visite DESC LIMIT $quanti")->fetchAll();
}

function numeri_cruscotto(): array {
    $pubblicati = db()->prepare("SELECT COUNT(*) FROM articles WHERE status = 'published'");
    $pubblicati->execute();

    return [
        'pubblicati' => (int)$pubblicati->fetchColumn(),
        'bozze'      => (int)db()->query("SELECT COUNT(*) FROM articles WHERE status <> 'published'")->fetchColumn(),
        'progetti'   => (int)db()->query("SELECT COUNT(*) FROM projects")->fetchColumn(),
        'tag'        => (int)db()->query("SELECT COUNT(*) FROM tags")->fetchColumn(),
        'visite'     => (int)db()->query("SELECT COUNT(*) FROM article_views")->fetchColumn(),
        'reazioni'   => (int)db()->query("SELECT COUNT(*) FROM article_reactions")->fetchColumn(),
        'messaggi'   => messaggi_da_leggere(),
        'iscritti'   => (int)db()->query("SELECT COUNT(*) FROM subscribers WHERE status='confirmed'")->fetchColumn(),
    ];
}

/** Quanti tag sono usati una volta sola: la coda lunga di cui parla la roadmap. */
function tag_usati_una_volta(): int {
    return (int)db()->query("SELECT COUNT(*) FROM (
        SELECT t.id FROM tags t JOIN article_tags x ON x.tag_id = t.id
        GROUP BY t.id HAVING COUNT(x.article_id) = 1) AS coda")->fetchColumn();
}

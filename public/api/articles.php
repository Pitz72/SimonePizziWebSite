<?php
/**
 * Gli articoli pubblicati, in JSON, in sola lettura.
 *
 *   GET ?limit=N&page=P     l'elenco, dal più recente (al massimo 500 per volta)
 *   GET ?slug=…             un articolo
 *
 * Il sito non lo chiama: le pagine leggono il database direttamente. Resta per
 * una ragione sola, verificata nei log di accesso il 16 ottobre 2026: lo usa
 * scripts/sviluppo/scarica-dati.sh per costruire il database di sviluppo con i
 * dati veri del sito.
 *
 * Fino a quel giorno era il file del sito React: scriveva, pubblicava e
 * cancellava articoli con la sessione del vecchio login, e apriva una sessione
 * a ogni lettura (revisione del 16 ottobre, M2). Adesso legge e basta, solo
 * quello che il pubblico vede già sul sito, e con un freno.
 */

declare(strict_types=1);

require __DIR__ . '/../lib/avvio.php';

header('Content-Type: application/json; charset=utf-8');

function rispondi(int $codice, $dati): never {
    http_response_code($codice);
    echo json_encode($dati, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    rispondi(405, ['error' => 'Solo lettura: gli articoli si scrivono dal pannello.']);
}
if (!freno_passa('api-articoli', rete_cliente(), 20, 60)) {
    rispondi(429, ['error' => 'Troppe richieste. Riprova fra un minuto.']);
}

/** Le colonne che escono: le stesse della pagina dell'articolo, niente di più. */
const COLONNE_ESPORTATE = 'id, title, seo_title, slug, content, excerpt, seo_description, focus_keyword,
    cover_image, category, is_featured, is_category_pinned, status, published_at, created_at, updated_at,
    button_a_label, button_a_link, button_b_label, button_b_link';

/**
 * Aggiunge a ogni articolo i nomi e gli slug dei suoi tag, nello stesso ordine
 * (per nome), come faceva il file di prima: chi legge li accoppia per posizione.
 * Una query sola per tutti, senza GROUP_CONCAT, che MySQL e SQLite scrivono
 * in due modi diversi.
 */
function con_tag(array $articoli): array {
    if (!$articoli) return [];
    $ids = array_map(fn($a) => (int)$a['id'], $articoli);
    $segni = implode(',', array_fill(0, count($ids), '?'));
    $q = db()->prepare("SELECT x.article_id, t.name, t.slug FROM article_tags x
                        JOIN tags t ON t.id = x.tag_id
                        WHERE x.article_id IN ($segni) ORDER BY t.name ASC");
    $q->execute($ids);
    $per = [];
    foreach ($q->fetchAll() as $r) $per[(int)$r['article_id']][] = $r;
    foreach ($articoli as &$a) {
        $suoi = $per[(int)$a['id']] ?? [];
        $a['tags'] = implode(', ', array_column($suoi, 'name'));
        $a['tag_slugs'] = implode(',', array_column($suoi, 'slug'));
    }
    unset($a);
    return $articoli;
}

if (isset($_GET['slug'])) {
    $q = db()->prepare("SELECT " . COLONNE_ESPORTATE . " FROM articles
                        WHERE slug = :slug AND " . SOLO_PUBBLICATI . " LIMIT 1");
    $q->execute([':slug' => (string)$_GET['slug'], ':adesso' => adesso()]);
    $articolo = $q->fetch();
    if (!$articolo) rispondi(404, ['error' => 'Articolo non trovato']);
    rispondi(200, con_tag([$articolo])[0]);
}

$limite = max(1, min(500, (int)($_GET['limit'] ?? 100)));
$pagina = max(1, (int)($_GET['page'] ?? 1));
$salta  = ($pagina - 1) * $limite;

$c = db()->prepare("SELECT COUNT(*) FROM articles WHERE " . SOLO_PUBBLICATI);
$c->execute([':adesso' => adesso()]);

$q = db()->prepare("SELECT " . COLONNE_ESPORTATE . " FROM articles WHERE " . SOLO_PUBBLICATI . "
                    ORDER BY published_at DESC, id DESC LIMIT $limite OFFSET $salta");
$q->execute([':adesso' => adesso()]);

rispondi(200, [
    'data'  => con_tag($q->fetchAll()),
    'total' => (int)$c->fetchColumn(),
    'page'  => $pagina,
    'limit' => $limite,
]);

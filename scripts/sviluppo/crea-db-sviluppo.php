<?php
/**
 * Costruisce il database di sviluppo (SQLite) leggendo i dati veri dal sito
 * in produzione.
 *
 * Perché serve. MySQL di DreamHost non accetta connessioni da fuori (errore
 * 1045): in locale il database non c'è, e senza database non si può provare
 * nemmeno una pagina. Le API pubbliche del sito però rispondono a chiunque,
 * quindi i dati veri si prendono da lì una volta sola e si mettono in un file
 * SQLite che sta sul disco.
 *
 * Il codice del sito resta uno solo: parla con PDO e basta. In produzione
 * dall'altra parte c'è MySQL, in sviluppo c'è questo file. Le query devono
 * quindi restare nel sottoinsieme SQL che i due parlano entrambi — niente
 * DATE_FORMAT, niente INSERT IGNORE nelle pagine pubbliche. Le date si
 * formattano in PHP, che per l'italiano serve comunque.
 *
 *   bash scripts/sviluppo/scarica-dati.sh      (una volta, o quando serve rinfrescare)
 *   php  scripts/sviluppo/crea-db-sviluppo.php
 *
 * I due passaggi sono separati perché il curl di PHP su Windows non ha un
 * elenco di autorità di certificazione e non riesce a parlare in HTTPS; quello
 * di riga di comando sì. Disattivare la verifica del certificato per aggirare
 * la cosa non si fa: si scarica con lo strumento che funziona.
 *
 * Il file prodotto non entra in git.
 */

declare(strict_types=1);

const DATI = __DIR__ . '/../../scratch/dati-produzione';
const DESTINAZIONE = __DIR__ . '/../../scratch/sviluppo.sqlite';

function leggi(string $nome): array {
    $file = DATI . '/' . $nome . '.json';
    if (!is_file($file)) {
        fwrite(STDERR, "Manca $file.\nLancia prima:  bash scripts/sviluppo/scarica-dati.sh\n");
        exit(1);
    }
    $dati = json_decode((string)file_get_contents($file), true);
    if (!is_array($dati)) {
        fwrite(STDERR, "$file non è JSON valido.\n");
        exit(1);
    }
    return $dati['data'] ?? $dati;
}

echo "Leggo i dati da " . realpath(DATI) . " …\n";
$articoli  = leggi('articles');
$categorie = leggi('categories');
$progetti  = leggi('projects');
printf("  %d articoli, %d categorie, %d progetti\n", count($articoli), count($categorie), count($progetti));

@mkdir(dirname(DESTINAZIONE), 0777, true);
if (file_exists(DESTINAZIONE)) unlink(DESTINAZIONE);

$db = new PDO('sqlite:' . DESTINAZIONE, null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

/* Lo schema è quello di produzione ridotto a ciò che serve al sito pubblico.
   I tipi sono scritti in SQL comune: SQLite li ignora quasi tutti, MySQL no,
   ma qui il file è solo di sviluppo e non genera mai lo schema vero. */
$db->exec("CREATE TABLE categories (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0, parent_id INTEGER NULL)");

$db->exec("CREATE TABLE articles (
    id INTEGER PRIMARY KEY, title TEXT NOT NULL, slug TEXT NOT NULL,
    content TEXT, excerpt TEXT, focus_keyword TEXT NULL,
    seo_title TEXT NULL, seo_description TEXT NULL,
    cover_image TEXT, category TEXT, is_featured INTEGER DEFAULT 0,
    is_category_pinned INTEGER DEFAULT 0, status TEXT DEFAULT 'published',
    published_at TEXT, created_at TEXT)");

$db->exec("CREATE TABLE tags (id INTEGER PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL)");
$db->exec("CREATE TABLE article_tags (article_id INTEGER NOT NULL, tag_id INTEGER NOT NULL)");

$db->exec("CREATE TABLE projects (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, description TEXT,
    category TEXT, cover_image TEXT, stato TEXT NULL,
    button_a_label TEXT, button_a_url TEXT,
    button_b_label TEXT, button_b_url TEXT,
    is_visible INTEGER DEFAULT 1, sort_order INTEGER DEFAULT 0, created_at TEXT)");

$db->beginTransaction();

$ins = $db->prepare("INSERT INTO categories (id,name,slug,sort_order,parent_id) VALUES (?,?,?,?,?)");
foreach ($categorie as $c) {
    $ins->execute([$c['id'], $c['name'], $c['slug'], $c['sort_order'] ?? 0, $c['parent_id']]);
}

$insArt = $db->prepare("INSERT INTO articles
    (id,title,slug,content,excerpt,focus_keyword,cover_image,category,
     is_featured,is_category_pinned,status,published_at,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");
$insTag  = $db->prepare("INSERT INTO tags (name,slug) VALUES (?,?)");
$insLega = $db->prepare("INSERT INTO article_tags (article_id,tag_id) VALUES (?,?)");
$idTag = [];

foreach ($articoli as $a) {
    $insArt->execute([
        $a['id'], $a['title'], $a['slug'], $a['content'] ?? '', $a['excerpt'] ?? '',
        $a['focus_keyword'] ?? null, $a['cover_image'] ?? '', $a['category'] ?? '',
        (int)($a['is_featured'] ?? 0), (int)($a['is_category_pinned'] ?? 0),
        $a['status'] ?? 'published', $a['published_at'] ?? null, $a['created_at'] ?? null,
    ]);

    // L'API restituisce i tag come due stringhe parallele: "uno, due" e "uno,due".
    $nomi  = array_filter(array_map('trim', explode(',', (string)($a['tags'] ?? ''))));
    $slugs = array_filter(array_map('trim', explode(',', (string)($a['tag_slugs'] ?? ''))));
    $nomi  = array_values($nomi);
    $slugs = array_values($slugs);

    foreach ($nomi as $i => $nome) {
        $slug = $slugs[$i] ?? strtolower(preg_replace('/[^a-z0-9]+/i', '-', $nome));
        if (!isset($idTag[$slug])) {
            $insTag->execute([$nome, $slug]);
            $idTag[$slug] = (int)$db->lastInsertId();
        }
        $insLega->execute([$a['id'], $idTag[$slug]]);
    }
}

$insProg = $db->prepare("INSERT INTO projects
    (id,name,description,category,cover_image,button_a_label,button_a_url,
     button_b_label,button_b_url,is_visible,sort_order,created_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
foreach ($progetti as $p) {
    $insProg->execute([
        $p['id'], $p['name'], $p['description'] ?? '', $p['category'] ?? '',
        $p['cover_image'] ?? '', $p['button_a_label'] ?? '', $p['button_a_url'] ?? '',
        $p['button_b_label'] ?? '', $p['button_b_url'] ?? '',
        (int)($p['is_visible'] ?? 1), (int)($p['sort_order'] ?? 0), $p['created_at'] ?? null,
    ]);
}

$db->commit();

$db->exec("CREATE INDEX idx_art_slug ON articles(slug)");
$db->exec("CREATE INDEX idx_art_cat ON articles(category)");
$db->exec("CREATE INDEX idx_lega ON article_tags(article_id, tag_id)");

printf("Scritto %s (%d KB): %d articoli, %d tag, %d progetti.\n",
    realpath(DESTINAZIONE), (int)(filesize(DESTINAZIONE) / 1024),
    $db->query("SELECT COUNT(*) FROM articles")->fetchColumn(),
    $db->query("SELECT COUNT(*) FROM tags")->fetchColumn(),
    $db->query("SELECT COUNT(*) FROM projects")->fetchColumn());

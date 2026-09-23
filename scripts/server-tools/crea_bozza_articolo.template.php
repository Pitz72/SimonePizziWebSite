<?php
/**
 * ONE-SHOT — crea un articolo in BOZZA, con le sue immagini e i suoi tag.
 *
 * Non si esegue così com'è: lo genera `prepara_bozza.py` sostituendo
 * __DATI__ con i dati dell'articolo (JSON in base64, così apostrofi curvi,
 * caporali e virgolette dell'HTML non passano dal parser di PHP).
 *
 *     python scripts/server-tools/prepara_bozza.py <cartella-articolo>
 *     python scripts/server-tools/esegui.py crea_bozza_<slug>.php
 *     python scripts/server-tools/esegui.py crea_bozza_<slug>.php --applica
 *
 * Fa esattamente quello che fa il pannello quando si salva un articolo nuovo
 * (salva_articolo + imposta_tag_articolo in lib/pannello.php) e quando si
 * carica un'immagine (la riga in `media` di admin/carica.php). I nomi delle
 * colonne sono copiati da lì, non ricordati.
 *
 * Non tocca niente di quello che c'è: se lo slug è già preso si ferma, così
 * lanciarlo due volte non crea due bozze. Le immagini devono essere già in
 * uploads/immagini/ (le carica prepara_bozza.py via SFTP): se ne manca una,
 * si ferma prima di scrivere.
 */

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');

$atteso = '__TOKEN__';
if (!isset($_GET['token']) || !hash_equals($atteso, (string)$_GET['token'])) {
    http_response_code(403);
    exit("403 — token mancante o sbagliato.\n");
}

$APPLICA = (($_GET['applica'] ?? '') === '1');
$D = json_decode(base64_decode('__DATI__'), true);
if (!is_array($D)) exit("500 — dati illeggibili.\nESITO: INTERROTTO\n");

$config = __DIR__ . '/../lib/config.php';
if (!is_file($config)) $config = __DIR__ . '/config.php';
require_once $config;

try {
    $pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
    $pdo->exec('SET NAMES utf8mb4');
} catch (PDOException $e) {
    http_response_code(500);
    exit('500 — connessione fallita: ' . $e->getMessage() . "\n");
}

/** Copia di slug() in lib/helpers.php. */
function slug_di(string $testo): string {
    $t = mb_strtolower(trim($testo));
    $t = strtr($t, [
        'à'=>'a','á'=>'a','â'=>'a','ä'=>'a','ã'=>'a','å'=>'a',
        'è'=>'e','é'=>'e','ê'=>'e','ë'=>'e',
        'ì'=>'i','í'=>'i','î'=>'i','ï'=>'i',
        'ò'=>'o','ó'=>'o','ô'=>'o','ö'=>'o','õ'=>'o',
        'ù'=>'u','ú'=>'u','û'=>'u','ü'=>'u',
        'ç'=>'c','ñ'=>'n',
    ]);
    $t = preg_replace('/[^a-z0-9]+/u', '-', $t) ?? '';
    return trim($t, '-');
}

$a = $D['articolo'];

/* ── Controlli prima di toccare qualcosa ─────────────────────────────────── */
$q = $pdo->prepare('SELECT id, status FROM articles WHERE BINARY slug = ?');
$q->execute([$a['slug']]);
if ($c = $q->fetch()) {
    exit("Lo slug «{$a['slug']}» è già preso dall'articolo {$c['id']} ({$c['status']}).\n"
       . "Non creo un doppione.\nESITO: OK\n");
}

$q = $pdo->prepare('SELECT slug FROM categories WHERE BINARY slug = ?');
$q->execute([$a['category']]);
if (!$q->fetch()) exit("La categoria «{$a['category']}» non esiste.\nESITO: INTERROTTO\n");

$cartella = __DIR__ . '/../uploads/immagini/';
$mancanti = [];
foreach ($D['immagini'] as $nome) {
    if (!is_file($cartella . $nome)) $mancanti[] = $nome;
}
if ($mancanti) exit("Immagini mancanti sul server:\n  " . implode("\n  ", $mancanti) . "\nESITO: INTERROTTO\n");

$colonne = array_column($pdo->query('SHOW COLUMNS FROM articles')->fetchAll(), 'Field');
foreach (['seo_title', 'seo_description', 'focus_keyword'] as $facoltativa) {
    if (!in_array($facoltativa, $colonne, true)) {
        echo "nota — articles.{$facoltativa} non esiste: la salto\n";
        unset($a[$facoltativa]);
    }
}

echo "ARTICOLO\n";
echo "  titolo     {$a['title']}\n";
echo "  slug       {$a['slug']}\n";
echo "  categoria  {$a['category']}\n";
echo "  stato      draft (nessuna data di pubblicazione)\n";
echo "  corpo      " . mb_strlen($a['content']) . " caratteri, " . count($D['immagini']) . " immagini\n";
echo "  tag        " . implode(', ', $D['tag']) . "\n\n";

/* ── La scrittura ────────────────────────────────────────────────────────── */
$pdo->beginTransaction();
try {
    $ora = date('Y-m-d H:i:s');

    // Le immagini, come le registra admin/carica.php.
    $m = $pdo->prepare('INSERT INTO media (filename, file_path, mime_type, size, created_at)
                        VALUES (?, ?, ?, ?, ?)');
    $gia = $pdo->prepare('SELECT id FROM media WHERE BINARY filename = ?');
    foreach ($D['immagini'] as $nome) {
        $gia->execute([$nome]);
        if ($gia->fetch()) { echo "  media: {$nome} c'è già\n"; continue; }
        $m->execute([$nome, '/uploads/immagini/' . $nome, 'image/webp',
                     (int)filesize($cartella . $nome), $ora]);
        echo "  media: {$nome}\n";
    }

    // L'articolo, come salva_articolo() in lib/pannello.php.
    $campi = [
        'title'              => $a['title'],
        'slug'               => $a['slug'],
        'content'            => $a['content'],
        'excerpt'            => $a['excerpt'],
        'cover_image'        => '',
        'category'           => $a['category'],
        'status'             => 'draft',
        'is_featured'        => 0,
        'is_category_pinned' => 0,
        'published_at'       => null,
        'created_at'         => $ora,
    ];
    foreach (['seo_title', 'seo_description', 'focus_keyword'] as $k) {
        if (isset($a[$k])) $campi[$k] = $a[$k];
    }
    $nomi  = implode(', ', array_keys($campi));
    $segni = implode(', ', array_map(fn($c) => ":$c", array_keys($campi)));
    $pdo->prepare("INSERT INTO articles ($nomi) VALUES ($segni)")->execute($campi);
    $id = (int)$pdo->lastInsertId();
    echo "\n  articolo creato: id {$id}\n";

    // I tag, come imposta_tag_articolo(): si riusano quelli che esistono.
    $cerca = $pdo->prepare('SELECT id, name FROM tags WHERE slug = ? LIMIT 1');
    $nuovo = $pdo->prepare('INSERT INTO tags (name, slug) VALUES (?, ?)');
    $lega  = $pdo->prepare('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)');
    foreach ($D['tag'] as $t) {
        $s = slug_di($t);
        $cerca->execute([$s]);
        if ($r = $cerca->fetch()) {
            $idTag = (int)$r['id'];
            echo "  tag: {$r['name']} (esistente, id {$idTag})\n";
        } else {
            $nuovo->execute([$t, $s]);
            $idTag = (int)$pdo->lastInsertId();
            echo "  tag: {$t} (NUOVO, id {$idTag})\n";
        }
        $lega->execute([$id, $idTag]);
    }

    if ($APPLICA) {
        $pdo->commit();
        echo "\nSCRITTO davvero. Bozza id {$id}.\n";
    } else {
        $pdo->rollBack();
        echo "\nANTEPRIMA: rollback fatto, il database non è cambiato.\n";
        echo "Per scrivere davvero: aggiungere --applica.\n";
    }
} catch (Throwable $e) {
    $pdo->rollBack();
    http_response_code(500);
    exit('500 — ' . $e->getMessage() . "\nESITO: INTERROTTO\n");
}

echo "\nESITO: OK\n";

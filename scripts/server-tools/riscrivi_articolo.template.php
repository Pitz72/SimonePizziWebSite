<?php
/**
 * ONE-SHOT — riscrive un articolo che NON è ancora uscito (bozza o programmato).
 *
 * Non si esegue così com'è: lo genera `prepara_bozza.py --riscrivi ID`
 * sostituendo __DATI__ con i dati dell'articolo (JSON in base64, come per
 * crea_bozza_articolo.template.php).
 *
 *     python scripts/server-tools/prepara_bozza.py <cartella-articolo> --riscrivi 117
 *     python scripts/server-tools/esegui.py <percorso assoluto>/riscrivi.php
 *     python scripts/server-tools/esegui.py <percorso assoluto>/riscrivi.php --applica
 *
 * Fa quello che fa il pannello quando si salva un articolo esistente
 * (salva_articolo, registra_slug_vecchio e imposta_tag_articolo in
 * lib/pannello.php), limitato ai campi del testo: titolo, slug, corpo,
 * riassunto, categoria, campi SEO, pulsanti. Non tocca lo stato, la data di
 * uscita, la copertina né l'evidenza: un articolo programmato resta
 * programmato alla stessa ora.
 *
 * Si ferma se l'articolo è già uscito (lì un cambio di slug va pensato), se lo
 * slug nuovo è di un altro articolo, se la categoria non esiste o se manca
 * un'immagine sul server. Stampa per intero i valori di prima di ogni campo
 * che cambia: il backup torna nella risposta, non resta sul server.
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
if (!is_array($D) || empty($D['id'])) exit("500 — dati illeggibili.\nESITO: INTERROTTO\n");

$config = __DIR__ . '/../lib/config.php';
if (!is_file($config)) $config = __DIR__ . '/config.php';
require_once $config;

/* Come lib/avvio.php: senza, date() scrive l'ora di Los Angeles, e
   updated_at finirebbe nove ore indietro. */
date_default_timezone_set('Europe/Rome');

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

$id = (int)$D['id'];
$a  = $D['articolo'];
$adesso = date('Y-m-d H:i:s');

/* ── Controlli prima di toccare qualcosa ─────────────────────────────────── */
$q = $pdo->prepare('SELECT * FROM articles WHERE id = ?');
$q->execute([$id]);
$prima = $q->fetch();
if (!$prima) exit("L'articolo {$id} non esiste.\nESITO: INTERROTTO\n");

$uscito = $prima['status'] === 'published'
       && ($prima['published_at'] === null || $prima['published_at'] <= $adesso);
if ($uscito) {
    exit("L'articolo {$id} è già uscito ({$prima['published_at']}): questo script è per quelli che non lo sono.\n"
       . "ESITO: INTERROTTO\n");
}

$q = $pdo->prepare('SELECT id FROM articles WHERE BINARY slug = ? AND id <> ?');
$q->execute([$a['slug'], $id]);
if ($c = $q->fetch()) exit("Lo slug «{$a['slug']}» è già dell'articolo {$c['id']}.\nESITO: INTERROTTO\n");

$q = $pdo->prepare('SELECT slug FROM categories WHERE BINARY slug = ?');
$q->execute([$a['category']]);
if (!$q->fetch()) exit("La categoria «{$a['category']}» non esiste.\nESITO: INTERROTTO\n");

$cartella = __DIR__ . '/../uploads/immagini/';
$mancanti = [];
foreach ($D['immagini'] as $nome) {
    if (!is_file($cartella . $nome)) $mancanti[] = $nome;
}
/* Anche quelle che il corpo cita già col loro percorso, non solo le nuove. */
preg_match_all('#src="/uploads/immagini/([^"/]+)"#', $a['content'], $citate);
foreach (array_unique($citate[1]) as $nome) {
    if (!is_file($cartella . $nome) && !in_array($nome, $mancanti, true)) $mancanti[] = $nome;
}
if ($mancanti) exit("Immagini mancanti sul server:\n  " . implode("\n  ", $mancanti) . "\nESITO: INTERROTTO\n");

$colonne = array_column($pdo->query('SHOW COLUMNS FROM articles')->fetchAll(), 'Field');

/* I campi del testo, come li scrive salva_articolo(). I pulsanti solo se
   arrivano: un salvataggio che non li conosce non li cancella. */
$campi = [
    'title'           => trim($a['title']),
    'slug'            => $a['slug'],
    'content'         => $a['content'],
    'excerpt'         => trim($a['excerpt']),
    'category'        => $a['category'],
    'seo_title'       => trim($a['seo_title'] ?? '') ?: null,
    'seo_description' => trim($a['seo_description'] ?? '') ?: null,
    'focus_keyword'   => trim($a['focus_keyword'] ?? '') ?: null,
];
foreach (['button_a_label' => 100, 'button_a_link' => 255, 'button_b_label' => 100, 'button_b_link' => 255] as $k => $massimo) {
    if (array_key_exists($k, $a)) $campi[$k] = mb_substr(trim((string)$a[$k]), 0, $massimo) ?: null;
}
foreach (array_keys($campi) as $k) {
    if (!in_array($k, $colonne, true)) {
        echo "nota — articles.{$k} non esiste: la salto\n";
        unset($campi[$k]);
    }
}

$cambiano = array_filter($campi, fn($v, $k) => (string)($prima[$k] ?? '') !== (string)($v ?? ''), ARRAY_FILTER_USE_BOTH);

echo "ARTICOLO {$id}\n";
echo "  stato      {$prima['status']}" . ($prima['status'] === 'published' ? " (programmato: esce il {$prima['published_at']})" : '') . "\n";
echo "  copertina  " . ($prima['cover_image'] ?: '(nessuna)') . "  — non si tocca\n";
echo "  titolo     {$prima['title']}\n";
echo "          →  {$campi['title']}\n";
echo "  slug       {$prima['slug']}\n";
echo "          →  {$campi['slug']}\n";
echo "  corpo      " . mb_strlen((string)$prima['content']) . " → " . mb_strlen($campi['content']) . " caratteri\n";
echo "  cambiano   " . ($cambiano ? implode(', ', array_keys($cambiano)) : 'niente') . "\n";
foreach (['a', 'b'] as $p) {
    if (array_key_exists("button_{$p}_link", $campi)) {
        echo "  pulsante {$p} " . ($campi["button_{$p}_label"] ?? '') . " → " . ($campi["button_{$p}_link"] ?? '') . "\n";
    }
}
echo "\n";

if (!$cambiano && !$D['immagini'] && $D['tag'] === null) exit("Niente da cambiare.\nESITO: OK\n");

/* ── La scrittura ────────────────────────────────────────────────────────── */
$pdo->beginTransaction();
try {
    // Le immagini nuove, come le registra admin/carica.php.
    $m = $pdo->prepare('INSERT INTO media (filename, file_path, mime_type, size, created_at)
                        VALUES (?, ?, ?, ?, ?)');
    $gia = $pdo->prepare('SELECT id FROM media WHERE BINARY filename = ?');
    foreach ($D['immagini'] as $nome) {
        $gia->execute([$nome]);
        if ($gia->fetch()) { echo "  media: {$nome} c'è già\n"; continue; }
        $m->execute([$nome, '/uploads/immagini/' . $nome, 'image/webp',
                     (int)filesize($cartella . $nome), $adesso]);
        echo "  media: {$nome}\n";
    }

    if ($cambiano) {
        $campi['updated_at'] = $adesso;
        $pezzi = implode(', ', array_map(fn($c) => "$c = :$c", array_keys($campi)));
        $pdo->prepare("UPDATE articles SET $pezzi WHERE id = :id")->execute($campi + ['id' => $id]);
        echo "  articolo riscritto (updated_at {$adesso})\n";
    }

    /* Come salva_articolo(): un articolo «published», anche se programmato,
       lascia il vecchio slug a rimandare al nuovo. Su una bozza no. */
    if ($prima['status'] === 'published' && $prima['slug'] !== $campi['slug']) {
        $tabella = $pdo->query("SHOW TABLES LIKE 'slug_storici'")->fetchColumn();
        if ($tabella) {
            $pdo->prepare('DELETE FROM slug_storici WHERE slug = ? OR slug = ?')->execute([$prima['slug'], $campi['slug']]);
            $pdo->prepare('INSERT INTO slug_storici (slug, article_id, creato_il) VALUES (?, ?, ?)')
                ->execute([$prima['slug'], $id, $adesso]);
            echo "  slug vecchio registrato: {$prima['slug']} → articolo {$id}\n";
        } else {
            echo "  nota — la tabella slug_storici non c'è: il vecchio slug non rimanda\n";
        }
    }

    // I tag, come imposta_tag_articolo(), solo se arrivano.
    if ($D['tag'] !== null) {
        $pdo->prepare('DELETE FROM article_tags WHERE article_id = ?')->execute([$id]);
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
    } else {
        echo "  tag: restano quelli che ha\n";
    }

    if ($APPLICA) {
        $pdo->commit();
        echo "\nSCRITTO davvero.\n";
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

/* Il backup: i valori di prima di ogni campo che cambia, per intero. */
if ($cambiano) {
    echo "\nBACKUP — I VALORI DI PRIMA\n";
    foreach (array_keys($cambiano) as $k) {
        echo "---------------------------------------- {$k}\n";
        echo (string)($prima[$k] ?? '') . "\n";
    }
    echo "----------------------------------------\n";
}

echo "\nESITO: OK\n";

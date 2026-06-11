<?php
// =================================================================
// fix_content_image_paths.php
// Corregge le URL immagini nel corpo degli articoli (campo content):
//   /uploads/file.webp               → /uploads/immagini/file.webp
//   https://...runtimeradio.it/uploads/file → https://.../uploads/immagini/file
//
// Path già corretti (/uploads/immagini/...) NON vengono toccati.
//
// Senza parametri  → DRY RUN (solo mostra cosa cambierebbe)
// ?go=1            → applica effettivamente le modifiche
//
// ELIMINARE DAL SERVER SUBITO DOPO L'ESECUZIONE
// =================================================================
require_once __DIR__ . '/config.php';
header('Content-Type: text/plain; charset=utf-8');

$dryRun = !isset($_GET['go']);

$pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

echo "=================================================================\n";
echo " fix_content_image_paths.php\n";
echo " Modalità: " . ($dryRun ? "DRY RUN (nessuna modifica — aggiungi ?go=1 per applicare)" : "ESECUZIONE REALE") . "\n";
echo "=================================================================\n\n";

$totalArticles = 0;
$totalOccurrences = 0;
$fixed = 0;

// Estensioni immagine riconosciute (esclude pdf, zip, mp3, ecc.)
const IMG_EXT = 'webp|jpg|jpeg|png|gif|avif|svg';

/**
 * Sostituisce /uploads/<immagine> → /uploads/immagini/<immagine>
 * Solo per file con estensione immagine; esclude PDF e altri documenti.
 * Non tocca path già corretti (/uploads/immagini/...).
 */
function fixContentPaths(string $content): string {
    return preg_replace(
        '#/uploads/(?!immagini/)(\S+?\.(' . IMG_EXT . '))(?=["\'\s<>)]|$)#i',
        '/uploads/immagini/$1',
        $content
    );
}

function countOccurrences(string $content): int {
    preg_match_all(
        '#/uploads/(?!immagini/)(\S+?\.(' . IMG_EXT . '))(?=["\'\s<>)]|$)#i',
        $content, $m
    );
    return count($m[0]);
}

// ── ARTICLES ──────────────────────────────────────────────────────
$rows = $pdo->query(
    "SELECT id, title, content FROM articles
     WHERE content IS NOT NULL AND content != ''
     ORDER BY id"
)->fetchAll(PDO::FETCH_ASSOC);

$stmt = $pdo->prepare("UPDATE articles SET content = ? WHERE id = ?");

foreach ($rows as $r) {
    $hits = countOccurrences($r['content']);

    if ($hits === 0) {
        echo "[SKIP]  art.{$r['id']}: nessuna occorrenza — «{$r['title']}»\n";
        continue;
    }

    $totalArticles++;
    $totalOccurrences += $hits;
    $newContent = fixContentPaths($r['content']);

    if ($dryRun) {
        echo "[WOULD] art.{$r['id']} ($hits occorrenze) — «{$r['title']}»\n";

        // Mostra le URL trovate (max 5 per articolo per leggibilità)
        preg_match_all('#(?:https?://[^/]+)?/uploads/(?!immagini/)[^\s"\'<>]+#', $r['content'], $matches);
        $shown = array_slice(array_unique($matches[0]), 0, 5);
        foreach ($shown as $url) {
            echo "        " . rtrim($url, '.,)') . "\n";
        }
        if (count(array_unique($matches[0])) > 5) {
            echo "        ... e altre " . (count(array_unique($matches[0])) - 5) . "\n";
        }
        echo "\n";
    } else {
        $stmt->execute([$newContent, $r['id']]);
        echo "[FIXED] art.{$r['id']} ($hits occorrenze) — «{$r['title']}»\n";
        $fixed++;
    }
}

// ── RIEPILOGO ─────────────────────────────────────────────────────
echo "\n=================================================================\n";
if ($dryRun) {
    echo " DRY RUN completato.\n";
    echo " Articoli con occorrenze da correggere: $totalArticles\n";
    echo " Occorrenze totali: $totalOccurrences\n";
    echo "\n Apri ?go=1 per applicare le modifiche.\n";
} else {
    echo " ESECUZIONE completata.\n";
    echo " Articoli aggiornati: $fixed\n";
    echo " Occorrenze corrette: $totalOccurrences\n";
}
echo "=================================================================\n";
echo " ELIMINARE QUESTO FILE DAL SERVER.\n";
echo "=================================================================\n";
?>

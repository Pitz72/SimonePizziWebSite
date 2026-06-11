<?php
// =================================================================
// fix_uploads_subfolder.php
// Corregge i path /uploads/file.webp → /uploads/immagini/file.webp
// nelle tabelle articles (cover_image) e projects (cover_image).
//
// Senza parametri  → DRY RUN (solo mostra cosa cambierebbe)
// ?go=1            → applica effettivamente le modifiche
//
// ELIMINARE DAL SERVER SUBITO DOPO L'ESECUZIONE
// =================================================================
require_once __DIR__ . '/config.php';
header('Content-Type: text/plain; charset=utf-8');

$dryRun = !isset($_GET['go']);
$base   = $_SERVER['DOCUMENT_ROOT'];

$pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

echo "=================================================================\n";
echo " fix_uploads_subfolder.php\n";
echo " Modalità: " . ($dryRun ? "DRY RUN (nessuna modifica — aggiungi ?go=1 per applicare)" : "ESECUZIONE REALE") . "\n";
echo "=================================================================\n\n";

$toFix   = 0;
$fixed   = 0;
$missing = 0;
$skipped = 0;

/**
 * Riceve un path/URL dal DB, restituisce il path corretto.
 * Agisce solo su path /uploads/ che NON contengono già /immagini/.
 */
function computeNewPath(string $raw): ?string {
    // Rimuove schema+host se presente
    $path = preg_replace('#^https?://[^/]+#', '', $raw);

    // Non toccare path già corretti o non-uploads
    if (str_contains($path, '/uploads/immagini/')) return null;
    if (!str_starts_with($path, '/uploads/'))        return null;

    // /uploads/filename → /uploads/immagini/filename
    return '/uploads/immagini/' . substr($path, strlen('/uploads/'));
}

// ── ARTICLES ──────────────────────────────────────────────────────
echo "=== Tabella: articles (cover_image) ===\n\n";

$rows = $pdo->query(
    "SELECT id, title, cover_image FROM articles
     WHERE cover_image IS NOT NULL AND cover_image != ''"
)->fetchAll(PDO::FETCH_ASSOC);

$stmtA = $pdo->prepare("UPDATE articles SET cover_image = ? WHERE id = ?");

foreach ($rows as $r) {
    $newPath = computeNewPath($r['cover_image']);

    if ($newPath === null) {
        echo "[SKIP]  art.{$r['id']}: già corretto o non-uploads → {$r['cover_image']}\n";
        $skipped++;
        continue;
    }

    $toFix++;
    $fileExists = file_exists($base . $newPath);

    if (!$fileExists) {
        echo "[WARN]  art.{$r['id']} «{$r['title']}»\n";
        echo "        vecchio: {$r['cover_image']}\n";
        echo "        nuovo:   {$newPath}\n";
        echo "        ⚠ file NON trovato su disco — record lasciato invariato\n\n";
        $missing++;
        continue;
    }

    if ($dryRun) {
        echo "[WOULD] art.{$r['id']} «{$r['title']}»\n";
        echo "        {$r['cover_image']}\n";
        echo "        → {$newPath}\n\n";
    } else {
        $stmtA->execute([$newPath, $r['id']]);
        echo "[FIXED] art.{$r['id']} «{$r['title']}»\n";
        echo "        {$r['cover_image']}\n";
        echo "        → {$newPath}\n\n";
        $fixed++;
    }
}

// ── PROJECTS ──────────────────────────────────────────────────────
echo "\n=== Tabella: projects (cover_image) ===\n\n";

$rows = $pdo->query(
    "SELECT id, name, cover_image FROM projects
     WHERE cover_image IS NOT NULL AND cover_image != ''"
)->fetchAll(PDO::FETCH_ASSOC);

$stmtP = $pdo->prepare("UPDATE projects SET cover_image = ? WHERE id = ?");

foreach ($rows as $r) {
    $newPath = computeNewPath($r['cover_image']);

    if ($newPath === null) {
        echo "[SKIP]  proj.{$r['id']}: già corretto o non-uploads → {$r['cover_image']}\n";
        $skipped++;
        continue;
    }

    $toFix++;
    $fileExists = file_exists($base . $newPath);

    if (!$fileExists) {
        echo "[WARN]  proj.{$r['id']} «{$r['name']}»\n";
        echo "        vecchio: {$r['cover_image']}\n";
        echo "        nuovo:   {$newPath}\n";
        echo "        ⚠ file NON trovato su disco — record lasciato invariato\n\n";
        $missing++;
        continue;
    }

    if ($dryRun) {
        echo "[WOULD] proj.{$r['id']} «{$r['name']}»\n";
        echo "        {$r['cover_image']}\n";
        echo "        → {$newPath}\n\n";
    } else {
        $stmtP->execute([$newPath, $r['id']]);
        echo "[FIXED] proj.{$r['id']} «{$r['name']}»\n";
        echo "        {$r['cover_image']}\n";
        echo "        → {$newPath}\n\n";
        $fixed++;
    }
}

// ── RIEPILOGO ─────────────────────────────────────────────────────
echo "\n=================================================================\n";
if ($dryRun) {
    echo " DRY RUN completato.\n";
    echo " Record che verrebbero aggiornati: $toFix\n";
    echo " File non trovati su disco (non toccati): $missing\n";
    echo " Già corretti / non-uploads (saltati): $skipped\n";
    echo "\n Apri ?go=1 per applicare le modifiche.\n";
} else {
    echo " ESECUZIONE completata.\n";
    echo " Record aggiornati:  $fixed\n";
    echo " File non su disco (lasciati invariati): $missing\n";
    echo " Già corretti / saltati: $skipped\n";
}
echo "=================================================================\n";
echo " ELIMINARE QUESTO FILE DAL SERVER.\n";
echo "=================================================================\n";
?>

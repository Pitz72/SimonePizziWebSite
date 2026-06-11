<?php
// DIAGNOSTIC — eliminare subito dopo l'uso
require_once __DIR__ . '/config.php';
header('Content-Type: text/plain; charset=utf-8');

$pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$base = $_SERVER['DOCUMENT_ROOT'];

echo "=== File fisicamente in /uploads/ ===\n";
$uploads_dir = $base . '/uploads/';
if (is_dir($uploads_dir)) {
    $files = array_diff(scandir($uploads_dir), ['.', '..']);
    foreach ($files as $f) echo "  $f\n";
    echo "Totale: " . count($files) . " file\n";
} else {
    echo "[CARTELLA /uploads/ NON TROVATA]\n";
}

echo "\n=== Record media nel DB vs file su disco ===\n";
$rows = $pdo->query("SELECT id, filename, file_path FROM media ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    $exists = file_exists($base . $r['file_path']);
    echo ($exists ? "[OK]     " : "[MISSING]");
    echo " {$r['file_path']}\n";
}

echo "\n=== cover_image articoli vs file su disco ===\n";
$rows = $pdo->query("SELECT id, title, cover_image FROM articles WHERE cover_image IS NOT NULL AND cover_image != '' ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    $exists = file_exists($base . $r['cover_image']);
    echo ($exists ? "[OK]     " : "[MISSING]");
    echo " {$r['cover_image']}  (art.{$r['id']})\n";
}

echo "\n=== cover_image progetti vs file su disco ===\n";
$rows = $pdo->query("SELECT id, name, cover_image FROM projects WHERE cover_image IS NOT NULL AND cover_image != '' ORDER BY id")->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    // URL assoluti non verificabili via filesystem
    if (str_starts_with($r['cover_image'], 'http')) {
        echo "[URL-EXT] {$r['cover_image']}  (proj.{$r['id']})\n";
        continue;
    }
    $exists = file_exists($base . $r['cover_image']);
    echo ($exists ? "[OK]     " : "[MISSING]");
    echo " {$r['cover_image']}  (proj.{$r['id']})\n";
}

echo "\nELIMINARE QUESTO FILE.\n";
?>

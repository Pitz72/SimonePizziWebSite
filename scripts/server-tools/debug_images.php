<?php
// DIAGNOSTIC — eliminare subito dopo l'uso
require_once __DIR__ . '/config.php';
header('Content-Type: text/plain; charset=utf-8');

$pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

echo "=== cover_image articoli (prime 5) ===\n";
$rows = $pdo->query("SELECT id, title, cover_image FROM articles WHERE cover_image != '' AND cover_image IS NOT NULL LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    echo "ID {$r['id']}: [{$r['cover_image']}]\n";
}

echo "\n=== file_path media (prime 5) ===\n";
$rows = $pdo->query("SELECT id, filename, file_path FROM media LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    echo "ID {$r['id']}: filename=[{$r['filename']}] file_path=[{$r['file_path']}]\n";
}

echo "\n=== cover_image progetti (tutti) ===\n";
$rows = $pdo->query("SELECT id, name, cover_image FROM projects WHERE cover_image IS NOT NULL")->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    echo "ID {$r['id']}: [{$r['cover_image']}]\n";
}

echo "\nELIMINARE QUESTO FILE.\n";
?>

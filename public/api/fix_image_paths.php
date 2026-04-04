<?php
// =================================================================
// Fix Image Paths — converte estensioni obsolete in .webp nel DB
// -----------------------------------------------------------------
// ELIMINARE DAL SERVER SUBITO DOPO L'ESECUZIONE
// =================================================================
require_once __DIR__ . '/config.php';
header('Content-Type: text/plain; charset=utf-8');

$pdo = new PDO(DB_DSN, DB_USER, DB_PASS, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
$base = $_SERVER['DOCUMENT_ROOT'];

$fixed  = 0;
$errors = 0;

// Converte un path al formato corretto:
// - URL assoluti con dominio → path relativo
// - estensioni .png/.jpg/.jpeg → .webp (solo per /uploads/)
function fixPath(string $path, string $base): array {
    // Normalizza URL assoluti → path relativo
    $path = preg_replace('#^https?://[^/]+#', '', $path);

    // Solo i path /uploads/ vengono convertiti (quelli /images/ rimangono intatti)
    if (!str_starts_with($path, '/uploads/')) {
        return ['path' => $path, 'changed' => false];
    }

    $newPath = preg_replace('/\.(png|jpg|jpeg)$/i', '.webp', $path);

    if ($newPath === $path) {
        return ['path' => $path, 'changed' => false];
    }

    // Verifica che il file .webp esista effettivamente prima di aggiornare
    if (file_exists($base . $newPath)) {
        return ['path' => $newPath, 'changed' => true];
    }

    // Se il .webp non esiste, mantieni il path originale
    return ['path' => $path, 'changed' => false, 'warn' => true];
}

// --- Articoli ---
echo "=== Fix cover_image articoli ===\n\n";
$articles = $pdo->query("SELECT id, title, cover_image FROM articles WHERE cover_image IS NOT NULL AND cover_image != ''")->fetchAll(PDO::FETCH_ASSOC);
$stmtA = $pdo->prepare("UPDATE articles SET cover_image = ? WHERE id = ?");

foreach ($articles as $a) {
    $result = fixPath($a['cover_image'], $base);

    if (isset($result['warn'])) {
        echo "[WARN]  art.{$a['id']}: .webp non trovato, mantenuto: {$a['cover_image']}\n";
        continue;
    }

    if ($result['changed']) {
        $stmtA->execute([$result['path'], $a['id']]);
        echo "[FIXED] art.{$a['id']}: {$a['cover_image']}\n";
        echo "               → {$result['path']}\n";
        $fixed++;
    }
}

// --- Progetti ---
echo "\n=== Fix cover_image progetti ===\n\n";
$projects = $pdo->query("SELECT id, name, cover_image FROM projects WHERE cover_image IS NOT NULL AND cover_image != ''")->fetchAll(PDO::FETCH_ASSOC);
$stmtP = $pdo->prepare("UPDATE projects SET cover_image = ? WHERE id = ?");

foreach ($projects as $p) {
    $result = fixPath($p['cover_image'], $base);

    if (isset($result['warn'])) {
        echo "[WARN]  proj.{$p['id']}: .webp non trovato, mantenuto: {$p['cover_image']}\n";
        continue;
    }

    if ($result['changed']) {
        $stmtP->execute([$result['path'], $p['id']]);
        echo "[FIXED] proj.{$p['id']}: {$p['cover_image']}\n";
        echo "               → {$result['path']}\n";
        $fixed++;
    }
}

echo "\n================================================================\n";
echo " Completato: $fixed path aggiornati, $errors errori.\n";
echo " ELIMINARE QUESTO FILE DAL SERVER.\n";
echo "================================================================\n";
?>

<?php
// DIAGNOSTIC — eliminare subito dopo l'uso
header('Content-Type: text/plain; charset=utf-8');

$base = $_SERVER['DOCUMENT_ROOT'];
echo "DOCUMENT_ROOT: $base\n\n";

// Test percorsi /images/
echo "=== File in /images/ (esistono sul server?) ===\n";
$test_images = [
    '/images/tspc-echo.png',
    '/images/relitto-silente-v2.webp',
    '/images/lemmons.png',
    '/images/pixeldebh.jpg',
    '/images/tspc-respiro.png',
];
foreach ($test_images as $img) {
    $full = $base . $img;
    echo file_exists($full) ? "[OK]     " : "[MISSING]";
    echo " $img\n";
}

// Test percorsi /uploads/
echo "\n=== File /uploads/ (esistono sul server?) ===\n";
$test_uploads = [
    '/uploads/69a400b90127b-home.webp',
    '/uploads/69aab0a465fa7-titan-icon.png',
    '/uploads/69c199ecd5e85-CoverPiccolaOrizzontale.jpg',
];
foreach ($test_uploads as $img) {
    $full = $base . $img;
    echo file_exists($full) ? "[OK]     " : "[MISSING]";
    echo " $img\n";
}

echo "\n=== Contenuto cartella /images/ ===\n";
$images_dir = $base . '/images/';
if (is_dir($images_dir)) {
    $files = scandir($images_dir);
    foreach ($files as $f) {
        if ($f !== '.' && $f !== '..') echo "  $f\n";
    }
} else {
    echo "[CARTELLA /images/ NON TROVATA]\n";
}

echo "\nELIMINARE QUESTO FILE.\n";
?>

<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Checking ZipArchive...<br>";
if (class_exists('ZipArchive')) {
    echo "✅ ZipArchive is available.<br>";
} else {
    echo "❌ ZipArchive is NOT available.<br>";
}

echo "Checking .data directory...<br>";
$data_dir = __DIR__ . '/.data';
if (is_dir($data_dir)) {
    echo "✅ .data exists.<br>";
    if (is_writable($data_dir)) {
        echo "✅ .data is writable.<br>";
    } else {
        echo "❌ .data is NOT writable.<br>";
    }
} else {
    echo "❌ .data does NOT exist.<br>";
}

$temp_dir = $data_dir . '/temp';
if (!is_dir($temp_dir)) {
    if (@mkdir($temp_dir, 0755, true)) {
        echo "✅ temp directory created.<br>";
    } else {
        echo "❌ failed to create temp directory.<br>";
    }
} else {
    echo "✅ temp directory exists.<br>";
}

echo "Done.";
?>

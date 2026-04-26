<?php
require_once 'db.php';
require_once 'auth_helper.php';

// Abilita log errori locale per debug (verrà rimosso dopo il fix)
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/.data/php_error.log');
error_reporting(E_ALL);

$pdo = Database::connect();
$action = $_GET['action'] ?? 'status';

// Helper per generare il dump SQL
function generateSQLDump($pdo) {
    $tables = [];
    $result = $pdo->query("SHOW TABLES");
    while ($row = $result->fetch(PDO::FETCH_NUM)) {
        $tables[] = $row[0];
    }

    $sql = "-- SimonePizziWebSite Database Backup\n";
    $sql .= "-- Generato il: " . date('Y-m-d H:i:s') . "\n\n";
    $sql .= "SET FOREIGN_KEY_CHECKS = 0;\n\n";

    foreach ($tables as $table) {
        // Schema
        $res = $pdo->query("SHOW CREATE TABLE `$table`")->fetch(PDO::FETCH_ASSOC);
        $sql .= "DROP TABLE IF EXISTS `$table`;\n";
        $sql .= $res['Create Table'] . ";\n\n";

        // Dati
        $res = $pdo->query("SELECT * FROM `$table` ");
        while ($row = $res->fetch(PDO::FETCH_ASSOC)) {
            $keys = array_map(fn($k) => "`$k`", array_keys($row));
            $values = array_map(function($v) use ($pdo) {
                if ($v === null) return 'NULL';
                return $pdo->quote($v);
            }, array_values($row));
            
            $sql .= "INSERT INTO `$table` (" . implode(', ', $keys) . ") VALUES (" . implode(', ', $values) . ");\n";
        }
        $sql .= "\n\n";
    }

    $sql .= "SET FOREIGN_KEY_CHECKS = 1;\n";
    return $sql;
}

try {
    if ($action === 'download') {
        Auth::check();
        $sql = generateSQLDump($pdo);
        $filename = "backup_simonepizzi_" . date('Y-m-d_H-i-s') . ".sql";
        
        header('Content-Type: application/sql');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        echo $sql;
        exit;
    } 
    elseif ($action === 'export') {
        Auth::check();
        
        try {
            // Estensione tempo di esecuzione per archivi grandi
            set_time_limit(600); // 10 minuti
            ini_set('memory_limit', '512M');

            $include_db = isset($_GET['db']) && $_GET['db'] === 'true';
            $include_images = isset($_GET['images']) && $_GET['images'] === 'true';
            $include_docs = isset($_GET['docs']) && $_GET['docs'] === 'true';

            if (!$include_db && !$include_images && !$include_docs) {
                throw new Exception("Nessun modulo selezionato per l'esportazione.");
            }

            if (!class_exists('ZipArchive')) {
                throw new Exception("L'estensione PHP 'ZipArchive' non è abilitata su questo server.");
            }

            $zip = new ZipArchive();
            $temp_dir = __DIR__ . '/.data/temp';
            if (!is_dir($temp_dir)) {
                if (!@mkdir($temp_dir, 0755, true)) {
                    throw new Exception("Impossibile creare la cartella temporanea: " . $temp_dir);
                }
            }
            
            $zip_name = "export_pizzi_" . date('Y-m-d_H-i-s') . ".zip";
            $zip_path = $temp_dir . '/' . $zip_name;

            if ($zip->open($zip_path, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
                throw new Exception("Impossibile creare l'archivio ZIP.");
            }

            // 1. DATABASE
            if ($include_db) {
                $sql = generateSQLDump($pdo);
                $zip->addFromString('database_dump.sql', $sql);
            }

            // 2. IMMAGINI (public/images)
            if ($include_images) {
                $img_dir = realpath(__DIR__ . '/../images');
                if ($img_dir && is_dir($img_dir)) {
                    addDirToZip($img_dir, 'images', $zip);
                }
            }

            // 3. DOCUMENTI (public/downloads)
            if ($include_docs) {
                $docs_dir = realpath(__DIR__ . '/../downloads');
                if ($docs_dir && is_dir($docs_dir)) {
                    addDirToZip($docs_dir, 'downloads', $zip);
                }
            }

            $zip->close();

            if (!file_exists($zip_path)) {
                throw new Exception("Generazione del file ZIP fallita.");
            }

            // Pulisce buffer di uscita per evitare caratteri extra nello ZIP
            if (ob_get_level()) ob_end_clean();

            // Invio file con header completi
            header('Content-Description: File Transfer');
            header('Content-Type: application/zip');
            header('Content-Disposition: attachment; filename="' . $zip_name . '"');
            header('Content-Transfer-Encoding: binary');
            header('Expires: 0');
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Pragma: public');
            header('Content-Length: ' . filesize($zip_path));
            
            readfile($zip_path);

            // Rimuove file temporaneo
            @unlink($zip_path);
            exit;

        } catch (Exception $e) {
            http_response_code(500);
            die("ERRORE BACKUP: " . $e->getMessage());
        }
    }
    elseif ($action === 'status') {
        Auth::check();
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM app_settings WHERE setting_key LIKE 'backup_%'");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        echo json_encode($settings);
        exit;
    }
    elseif ($action === 'cron') {
        // Pseudo-cron: attivabile via URL o trigger
        // Per sicurezza aggiungiamo una secret key o permettiamo solo se loggati
        $is_admin = isset($_SESSION['user_id']);
        $secret = $_GET['secret'] ?? '';
        $configured_secret = 'pizzi_backup_v1'; // Sostituire con qualcosa di serio in config.php se necessario

        if (!$is_admin && $secret !== $configured_secret) {
            http_response_code(403);
            die("Accesso negato.");
        }

        $stmt = $pdo->query("SELECT setting_key, setting_value FROM app_settings WHERE setting_key LIKE 'backup_%'");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        if ($settings['backup_auto'] !== '1' && !$is_admin) {
            die("Backup automatico disabilitato.");
        }

        $last_run = $settings['backup_last_run'] ?? '';
        $frequency = $settings['backup_frequency'] ?? 'weekly';
        
        $should_run = false;
        if (empty($last_run)) {
            $should_run = true;
        } else {
            $last_time = strtotime($last_run);
            $now = time();
            if ($frequency === 'daily' && $now - $last_time >= 86400) $should_run = true;
            if ($frequency === 'weekly' && $now - $last_time >= 604800) $should_run = true;
            if ($frequency === 'monthly' && $now - $last_time >= 2592000) $should_run = true;
        }

        if ($should_run || $is_admin) {
            $sql = generateSQLDump($pdo);
            $backup_dir = __DIR__ . '/.data/backups';
            if (!is_dir($backup_dir)) mkdir($backup_dir, 0755, true);
            
            $filename = "auto_backup_" . date('Y-m-d_H-i-s') . ".sql";
            file_put_contents($backup_dir . '/' . $filename, $sql);
            
            // Aggiorna ultima esecuzione
            $updateStmt = $pdo->prepare("UPDATE app_settings SET setting_value = ? WHERE setting_key = 'backup_last_run'");
            $updateStmt->execute([date('Y-m-d H:i:s')]);
            
            echo json_encode(['status' => 'success', 'message' => 'Backup eseguito.', 'file' => $filename]);
        } else {
            echo json_encode(['status' => 'idle', 'message' => 'Non è ancora tempo per il backup.', 'last_run' => $last_run]);
        }
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Helper ricorsivo per aggiungere cartelle allo ZIP
 */
function addDirToZip($dir, $zipPath, $zip) {
    $files = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );

    foreach ($files as $file) {
        // $file è un oggetto SplFileInfo
        $filePath = $file->getRealPath();
        $relativePath = $zipPath . '/' . substr($filePath, strlen($dir) + 1);
        $relativePath = str_replace('\\', '/', $relativePath);

        // Salta file di sistema
        if (basename($filePath) === '.DS_Store' || basename($filePath) === 'Thumbs.db') continue;

        if ($file->isDir()) {
            $zip->addEmptyDir($relativePath);
        } else {
            $zip->addFile($filePath, $relativePath);
        }
    }
}

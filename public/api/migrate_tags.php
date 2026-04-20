<?php
require_once 'db.php';

try {
    $pdo = Database::connect();
    $log = [];

    function slugify($title) {
        $accents      = ['à','è','é','ì','ò','ù','À','È','É','Ì','Ò','Ù','â','ê','î','ô','û','ä','ë','ï','ö','ü'];
        $replacements = ['a','e','e','i','o','u','a','e','e','i','o','u','a','e','i','o','u','a','e','i','o','u'];
        $title = str_replace($accents, $replacements, $title);
        return strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $title)));
    }

    // 1. Tabelle
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS tags (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    $log[] = "Tabella 'tags' OK.";

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS article_tags (
            article_id INT NOT NULL,
            tag_id INT NOT NULL,
            PRIMARY KEY (article_id, tag_id),
            FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    $log[] = "Tabella 'article_tags' OK.";

    // Pulizia
    $pdo->exec("DELETE FROM article_tags");

    // 2. Lettura articoli esistenti
    $stmt = $pdo->query("SELECT id, tags FROM articles WHERE tags IS NOT NULL AND tags != ''");
    $articles = $stmt->fetchAll();

    $stmtInsertTag = $pdo->prepare("INSERT INTO tags (name, slug) VALUES (?, ?)");
    $stmtFindTag = $pdo->prepare("SELECT id FROM tags WHERE slug = ? OR name = ?");
    $stmtInsertLink = $pdo->prepare("INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (?, ?)");

    $processed = 0; $created = 0;

    foreach ($articles as $art) {
        // Splitta la stringa separata da virgola
        $tagsRaw = explode(',', $art['tags']);
        
        foreach ($tagsRaw as $rawName) {
            $name = trim($rawName);
            if (empty($name)) continue;
            
            $slug = slugify($name);
            if (empty($slug)) continue;

            $stmtFindTag->execute([$slug, $name]);
            $tagId = $stmtFindTag->fetchColumn();

            if (!$tagId) {
                try {
                    $stmtInsertTag->execute([$name, $slug]);
                    $tagId = $pdo->lastInsertId();
                    $created++;
                } catch(Exception $e) { continue; }
            }

            if ($tagId) {
                $stmtInsertLink->execute([$art['id'], $tagId]);
            }
        }
        $processed++;
    }

    $log[] = "Elaborati $processed articoli. Creati/Collegati $created nuovi tag.";

    echo "<div style='font-family: monospace; background: #000; color: #0f0; padding: 20px;'>";
    foreach($log as $l) echo "<p>> " . htmlspecialchars($l) . "</p>";
    echo "<p>> M MIGRAZIONE TERMINATA CON SUCCESSO. PUOI ELIMINARE QUESTO SCRIPT.</p></div>";

} catch (PDOException $e) { echo "<b>ERRORE:</b> " . $e->getMessage(); }
?>

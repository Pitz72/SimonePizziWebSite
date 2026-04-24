<?php
require_once 'db.php';
header('Content-Type: application/json');
$pdo = Database::connect();

try {
    $stmt = $pdo->query("SELECT id, name, slug, parent_id FROM categories");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $debug = [];
    foreach ($categories as $cat) {
        $slug = $cat['slug'];
        
        $pCount = $pdo->prepare("SELECT COUNT(*) FROM projects WHERE category = ? AND is_visible = 1");
        $pCount->execute([$slug]);
        $projects = $pCount->fetchColumn();

        $aCount = $pdo->prepare("SELECT COUNT(*) FROM articles WHERE category = ? AND status = 'published'");
        $aCount->execute([$slug]);
        $articles = $aCount->fetchColumn();

        $debug[] = [
            'name' => $cat['name'],
            'slug' => $cat['slug'],
            'parent_id' => $cat['parent_id'],
            'projects_count' => $projects,
            'articles_count' => $articles
        ];
    }

    echo json_encode($debug, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

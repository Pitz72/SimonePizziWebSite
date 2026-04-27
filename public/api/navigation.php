<?php
require_once 'db.php';
header('Content-Type: application/json');
$pdo = Database::connect();
try {
    $stmt = $pdo->query("SELECT id, name, slug, parent_id FROM categories ORDER BY sort_order ASC, name ASC");
    $all = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $menu = [];
    $by_id = [];
    foreach ($all as $cat) {
        $cat['subcategories'] = [];
        $by_id[$cat['id']] = $cat;
    }
    foreach ($by_id as $id => &$cat) {
        if ($cat['parent_id'] && isset($by_id[$cat['parent_id']])) {
            $by_id[$cat['parent_id']]['subcategories'][] = &$cat;
        } elseif (!$cat['parent_id']) {
            $menu[] = &$cat;
        }
    }
    echo json_encode(array_values($menu));
} catch (Exception $e) {
    error_log(basename(__FILE__, '.php') . ' error: ' . $e->getMessage());
    echo json_encode(['error' => 'Errore interno del server.']);
}

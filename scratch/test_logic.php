<?php
$all = [
    ['id' => 2, 'parent_id' => 1, 'name' => 'Giochi'],
    ['id' => 1, 'parent_id' => 0, 'name' => 'Software'],
    ['id' => 3, 'parent_id' => 1, 'name' => 'Utility'],
    ['id' => 4, 'parent_id' => null, 'name' => 'Podcast']
];

$by_id = [];
$menu = [];

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

echo json_encode(array_values($menu), JSON_PRETTY_PRINT);

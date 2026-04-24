<?php
/**
 * API per la Navigazione (Header) v1.10.2
 * -----------------------------------------------------------------
 * Restituisce la struttura gerarchica delle categorie per il menu.
 * Include solo le categorie madri e le sottocategorie che contengono
 * effettivamente progetti o articoli (logic "active-only").
 */

require_once 'db.php';

header('Content-Type: application/json');

$pdo = Database::connect();

try {
    // 1. Recuperiamo tutte le categorie madri (parent_id IS NULL)
    $stmt = $pdo->query("SELECT id, name, slug FROM categories WHERE parent_id IS NULL ORDER BY sort_order ASC, name ASC");
    $parents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $menu = [];

    foreach ($parents as $parent) {
        $parent_id = $parent['id'];
        $parent_slug = $parent['slug'];

        // 2. Per ogni madre, cerchiamo le sottocategorie (parent_id = ?)
        // Uniamo con una verifica di esistenza contenuti (progetti o articoli)
        $subStmt = $pdo->prepare("
            SELECT c.id, c.name, c.slug 
            FROM categories c
            WHERE c.parent_id = ?
            AND (
                EXISTS (SELECT 1 FROM projects p WHERE p.category = c.slug AND p.is_visible = 1)
                OR 
                EXISTS (SELECT 1 FROM articles a WHERE a.category = c.slug AND a.status = 'published')
            )
            ORDER BY c.sort_order ASC, c.name ASC
        ");
        $subStmt->execute([$parent_id]);
        $subcategories = $subStmt->fetchAll(PDO::FETCH_ASSOC);

        // Aggiungiamo alla struttura solo se la madre ha sottocategorie
        // o se la madre stessa ha contenuti diretti (opzionale, ma coerente)
        $hasDirectContent = $pdo->prepare("
            SELECT (
                EXISTS (SELECT 1 FROM projects p WHERE p.category = ? AND p.is_visible = 1)
                OR 
                EXISTS (SELECT 1 FROM articles a WHERE a.category = ? AND a.status = 'published')
            )
        ");
        $hasDirectContent->execute([$parent_slug, $parent_slug]);
        $activeParent = $hasDirectContent->fetchColumn();

        if (count($subcategories) > 0 || $activeParent) {
            $parent['subcategories'] = $subcategories;
            $menu[] = $parent;
        }
    }

    echo json_encode($menu);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

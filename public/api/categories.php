<?php
require_once 'db.php';
require_once 'auth_helper.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

$pdo = Database::connect();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        // GET pubblica: lista ordinata per sort_order
        $stmt = $pdo->query("SELECT id, name, slug, sort_order FROM categories ORDER BY sort_order ASC, name ASC");
        echo json_encode($stmt->fetchAll());
    }
    elseif ($method === 'POST') {
        Auth::check();
        $data = json_decode(file_get_contents('php://input'), true);
        $name = trim($data['name'] ?? '');
        $slug = trim($data['slug'] ?? '');

        if (!$name || !$slug) {
            http_response_code(400);
            echo json_encode(['error' => 'Nome e slug obbligatori']);
            exit;
        }

        // Slug: solo caratteri validi URL
        $slug = strtolower(preg_replace('/[^a-z0-9-]+/', '-', $slug));
        $slug = trim($slug, '-');

        $stmt = $pdo->query("SELECT COALESCE(MAX(sort_order), 0) + 1 FROM categories");
        $next_order = (int)$stmt->fetchColumn();

        $stmt = $pdo->prepare("INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)");
        $stmt->execute([$name, $slug, $next_order]);

        echo json_encode(['status' => 'success', 'id' => (int)$pdo->lastInsertId()]);
    }
    elseif ($method === 'PUT') {
        Auth::check();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? ($data['id'] ?? null);

        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID mancante']);
            exit;
        }

        $name = trim($data['name'] ?? '');
        $slug = trim($data['slug'] ?? '');
        $sort_order = isset($data['sort_order']) ? (int)$data['sort_order'] : 0;

        if (!$name || !$slug) {
            http_response_code(400);
            echo json_encode(['error' => 'Nome e slug obbligatori']);
            exit;
        }

        $slug = strtolower(preg_replace('/[^a-z0-9-]+/', '-', $slug));
        $slug = trim($slug, '-');

        $stmt = $pdo->prepare("UPDATE categories SET name=?, slug=?, sort_order=? WHERE id=?");
        $stmt->execute([$name, $slug, $sort_order, $id]);

        echo json_encode(['status' => 'success']);
    }
    elseif ($method === 'DELETE') {
        Auth::check();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? ($data['id'] ?? null);

        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID mancante']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM categories WHERE id=?");
        $stmt->execute([$id]);

        echo json_encode(['status' => 'success']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

<?php
require_once 'db.php';
require_once 'auth_helper.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH');

$pdo = Database::connect();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {

        // Singolo progetto per ID (solo admin)
        if (isset($_GET['id'])) {
            Auth::check();
            $stmt = $pdo->prepare("SELECT * FROM projects WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $project = $stmt->fetch();
            if ($project) {
                echo json_encode($project);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Progetto non trovato']);
            }
            exit;
        }

        // Lista progetti: pubblica (solo visibili) o admin (tutti)
        $is_admin = isset($_SESSION['user_id']);
        $category = $_GET['category'] ?? null;

        $conditions = [];
        $params = [];

        if (!$is_admin) {
            $conditions[] = "is_visible = 1";
        }

        if ($category) {
            $conditions[] = "category = ?";
            $params[] = $category;
        }

        $query = "SELECT * FROM projects";
        if (count($conditions) > 0) {
            $query .= " WHERE " . implode(" AND ", $conditions);
        }
        $query .= " ORDER BY category ASC, sort_order ASC, created_at ASC";

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll());

    } elseif ($method === 'POST') {
        Auth::check();
        $data = json_decode(file_get_contents('php://input'), true);

        $name        = $data['name'] ?? 'Nuovo Progetto';
        $description = $data['description'] ?? '';
        $category    = $data['category'] ?? 'progetti-software';
        $cover_image = $data['cover_image'] ?? '';
        $button_a_label = $data['button_a_label'] ?? 'Scopri';
        $button_a_url   = $data['button_a_url'] ?? '';
        $button_b_label = $data['button_b_label'] ?? '';
        $button_b_url   = $data['button_b_url'] ?? '';
        $is_visible  = isset($data['is_visible']) ? (int)$data['is_visible'] : 1;

        // Assegna sort_order successivo nella categoria
        $stmtMax = $pdo->prepare("SELECT COALESCE(MAX(sort_order), 0) FROM projects WHERE category = ?");
        $stmtMax->execute([$category]);
        $sort_order = (int)$stmtMax->fetchColumn() + 1;

        $stmt = $pdo->prepare("INSERT INTO projects (name, description, category, cover_image, button_a_label, button_a_url, button_b_label, button_b_url, is_visible, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$name, $description, $category, $cover_image, $button_a_label, $button_a_url, $button_b_label, $button_b_url, $is_visible, $sort_order]);

        echo json_encode(['status' => 'success', 'id' => $pdo->lastInsertId()]);

    } elseif ($method === 'PUT') {
        Auth::check();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? ($data['id'] ?? null);

        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID mancante']); exit; }

        $stmt = $pdo->prepare("UPDATE projects SET name=?, description=?, category=?, cover_image=?, button_a_label=?, button_a_url=?, button_b_label=?, button_b_url=?, is_visible=? WHERE id=?");
        $stmt->execute([
            $data['name']           ?? '',
            $data['description']    ?? '',
            $data['category']       ?? 'progetti-software',
            $data['cover_image']    ?? '',
            $data['button_a_label'] ?? 'Scopri',
            $data['button_a_url']   ?? '',
            $data['button_b_label'] ?? '',
            $data['button_b_url']   ?? '',
            isset($data['is_visible']) ? (int)$data['is_visible'] : 1,
            $id
        ]);

        echo json_encode(['status' => 'success']);

    } elseif ($method === 'DELETE') {
        Auth::check();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? ($data['id'] ?? null);
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID mancante']); exit; }

        $stmt = $pdo->prepare("DELETE FROM projects WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success']);

    } elseif ($method === 'PATCH') {
        // Aggiorna sort_order o is_visible di un singolo progetto
        Auth::check();
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? null;
        if (!$id) { http_response_code(400); echo json_encode(['error' => 'ID mancante']); exit; }

        if (isset($data['is_visible'])) {
            $stmt = $pdo->prepare("UPDATE projects SET is_visible=? WHERE id=?");
            $stmt->execute([(int)$data['is_visible'], $id]);
        }
        if (isset($data['sort_order'])) {
            $stmt = $pdo->prepare("UPDATE projects SET sort_order=? WHERE id=?");
            $stmt->execute([(int)$data['sort_order'], $id]);
        }

        echo json_encode(['status' => 'success']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>

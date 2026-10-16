<?php
/**
 * Le categorie, in JSON, in sola lettura: GET /api/categories.php
 *
 * Come api/articles.php, resta per scripts/sviluppo/scarica-dati.sh, che
 * costruisce il database di sviluppo. Fino al 16 ottobre 2026 era il file del
 * sito React, che le creava, rinominava e cancellava con la sessione del
 * vecchio login (revisione del 16 ottobre, M2). Adesso legge e basta: le
 * categorie si gestiscono da /admin/categorie.php.
 */

declare(strict_types=1);

require __DIR__ . '/../lib/avvio.php';

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Solo lettura: le categorie si gestiscono dal pannello.']);
    exit;
}
if (!freno_passa('api-categorie', rete_cliente(), 20, 60)) {
    http_response_code(429);
    echo json_encode(['error' => 'Troppe richieste. Riprova fra un minuto.']);
    exit;
}

$righe = db()->query("SELECT id, name, slug, sort_order, parent_id FROM categories
                      ORDER BY sort_order ASC, name ASC")->fetchAll();
foreach ($righe as &$r) {
    $r['id'] = (int)$r['id'];
    $r['sort_order'] = (int)$r['sort_order'];
    $r['parent_id'] = $r['parent_id'] === null ? null : (int)$r['parent_id'];
}
unset($r);
echo json_encode($righe, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

<?php
/**
 * I pochi dati che il pannello chiede senza ricaricare la pagina: la libreria
 * delle immagini e la ricerca degli articoli per il link interno.
 *
 * Sta dentro admin/ e non in api/ perché è roba di qui: chi non è entrato non
 * vede niente.
 */
require __DIR__ . '/_avvio.php';
richiedi_accesso();

header('Content-Type: application/json; charset=utf-8');

$cosa = (string)($_GET['cosa'] ?? '');

if ($cosa === 'media') {
    $righe = array_map(static fn(array $m): array => [
        'id'   => (int)$m['id'],
        'url'  => url_immagine($m['file_path']),
        'nome' => $m['filename'],
        'peso' => (int)($m['size'] ?? 0),
    ], admin_media(120));
    echo json_encode(['media' => $righe], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($cosa === 'articoli') {
    $testo = trim((string)($_GET['q'] ?? ''));
    $trovati = admin_articoli(['testo' => $testo], 1, 15)['righe'];
    $righe = array_map(static fn(array $a): array => [
        'titolo'    => $a['title'],
        'indirizzo' => url_articolo($a),
        'stato'     => $a['status'],
        'quando'    => data_breve($a['published_at'] ?: $a['created_at']),
    ], $trovati);
    echo json_encode(['articoli' => $righe], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

http_response_code(400);
echo json_encode(['errore' => 'Non so che cosa cerchi.']);

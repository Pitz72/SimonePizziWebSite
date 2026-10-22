<?php
/**
 * I pochi dati che il pannello chiede senza ricaricare la pagina: la libreria
 * delle immagini, quella dei PDF e degli archivi, e la ricerca degli articoli
 * per il link interno.
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
    ], admin_media(120, 0, 'immagini'));   // la finestra delle immagini mostra solo quelle
    echo json_encode(['media' => $righe], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($cosa === 'file') {
    $righe = array_map(static fn(array $m): array => [
        'id'   => (int)$m['id'],
        'url'  => url_immagine($m['file_path']),
        'nome' => $m['filename'],
        'peso' => (int)($m['size'] ?? 0),
        'tipo' => strtoupper(pathinfo((string)$m['file_path'], PATHINFO_EXTENSION)),
    ], admin_media(200, 0, 'allegati'));
    echo json_encode(['file' => $righe], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/* I tag con quanti articoli li usano, bozze comprese: è la misura giusta di
   «quanto lo uso», e la scheda articolo la usa per suggerire il riuso. */
if ($cosa === 'tag') {
    $righe = array_map(static fn(array $t): array => [
        'nome'  => $t['name'],
        'slug'  => $t['slug'],
        'usati' => (int)$t['quanti'],
    ], admin_tag());
    echo json_encode(['tag' => $righe], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
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

<?php
/**
 * La ricerca del sito nuovo: GET /api/cerca.php?q=…
 *
 * Sostituisce search.php per il pubblico. Due ragioni, non una:
 *
 * 1. search.php cerca in `articles.tags`, una colonna che la v1.26.0 ha
 *    sostituito con la tabella article_tags. Da allora la ricerca per tag o
 *    non trova niente o fa errore, a seconda che la colonna esista ancora.
 * 2. Passa da lib/, quindi funziona anche in sviluppo, dove il database è
 *    SQLite. Con search.php la ricerca in locale non si può nemmeno provare.
 *
 * search.php resta finché il pannello non è migrato: lo usa ancora lui.
 */

declare(strict_types=1);

require __DIR__ . '/../lib/avvio.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
// Le risposte cambiano a ogni articolo pubblicato: non si mettono in cache.
header('Cache-Control: no-store');

$testo = trim((string)($_GET['q'] ?? ''));

if (mb_strlen($testo) < 2) {
    echo json_encode(['esiti' => [], 'quanti' => 0], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $trovati = cerca($testo, 12);

    // I nomi delle categorie servono a chi legge l'elenco: «Software» dice
    // qualcosa, «progetti-software» no.
    $nomi = [];
    foreach (categorie_radice() as $c) {
        $nomi[$c['slug']] = $c['name'];
        foreach (sottocategorie((int)$c['id']) as $f) $nomi[$f['slug']] = $f['name'];
    }

    $esiti = array_map(static function (array $r) use ($nomi): array {
        $indirizzo = $r['genere'] === 'progetto'
            ? (trim((string)($r['indirizzo'] ?? '')) ?: '/tutti-i-progetti')
            : url_articolo($r);
        return [
            'titolo'    => $r['title'],
            'indirizzo' => $indirizzo,
            'sezione'   => $nomi[$r['category']] ?? $r['category'],
            'quando'    => data_breve($r['published_at'] ?? ''),
            'genere'    => $r['genere'],
        ];
    }, $trovati);

    echo json_encode(['esiti' => $esiti, 'quanti' => count($esiti)], JSON_UNESCAPED_UNICODE);

} catch (Throwable $err) {
    error_log('cerca.php: ' . $err->getMessage());
    http_response_code(500);
    echo json_encode(['esiti' => [], 'errore' => 'La ricerca non ha risposto. Riprova.'],
        JSON_UNESCAPED_UNICODE);
}

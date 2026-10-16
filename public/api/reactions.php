<?php
/**
 * Le cinque reazioni in fondo agli articoli.
 *
 *   GET  ?article_id=X            i conteggi, e quali reazioni sono «tue»
 *   POST {article_id, reaction}   aggiunge o toglie (è un interruttore)
 *
 * Lo chiama assets/js/reazioni.js. Riscritto il 16 ottobre 2026 sulle
 * librerie del sito (revisione del 16 ottobre, M14 e M15). Prima:
 *
 *  - «tue» voleva dire sha256(IP + User-Agent), senza chiave e conservato per
 *    sempre: un identificativo stabile e ricalcolabile;
 *  - il freno contava l'IPv6 intero e scriveva nella tabella dei login.
 *
 * Adesso «tue» è un HMAC con la chiave segreta del sito (lib/freno.php) sulla
 * rete ridotta a /64 più il browser: lo User-Agent resta, perché dietro la
 * stessa rete di un operatore mobile ci sono molte persone, e senza di lui la
 * reazione di una sarebbe «tua» anche per le altre. Le impronte vecchie sono
 * state sostituite con un segnaposto (assicura_impronte_anonime() in
 * lib/db_maintenance.php): i conteggi restano, il legame con chi le ha date no.
 */

declare(strict_types=1);

require __DIR__ . '/../lib/avvio.php';

header('Content-Type: application/json; charset=utf-8');

// I nomi sono quelli dei pulsanti (pages/articolo.php): cambiarli vorrebbe dire
// perdere i voti già raccolti.
const REAZIONI = ['thumb', 'heart', 'fire', 'think', 'game'];

function risposta(int $codice, array $dati): never {
    http_response_code($codice);
    echo json_encode($dati);
    exit;
}

/** I conteggi di un articolo e le reazioni di chi chiede. */
function stato_reazioni(int $idArticolo, string $chi): array {
    $conti = array_fill_keys(REAZIONI, 0);
    $q = db()->prepare("SELECT reaction, COUNT(*) AS quante FROM article_reactions
                        WHERE article_id = ? GROUP BY reaction");
    $q->execute([$idArticolo]);
    foreach ($q->fetchAll() as $r) {
        if (isset($conti[$r['reaction']])) $conti[$r['reaction']] = (int)$r['quante'];
    }
    $m = db()->prepare("SELECT reaction FROM article_reactions WHERE article_id = ? AND voter_hash = ?");
    $m->execute([$idArticolo, $chi]);
    return ['counts' => $conti, 'my_reactions' => $m->fetchAll(PDO::FETCH_COLUMN)];
}

/** L'articolo esiste ed è visibile al pubblico? Le bozze non si votano. */
function articolo_votabile(int $id): bool {
    if ($id <= 0) return false;
    $q = db()->prepare("SELECT COUNT(*) FROM articles WHERE id = :id AND " . SOLO_PUBBLICATI);
    $q->execute([':id' => $id, ':adesso' => adesso()]);
    return (int)$q->fetchColumn() > 0;
}

$rete = rete_cliente();
$chi  = impronta($rete . '|' . (string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 'reazione');
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($metodo === 'GET') {
    $id = (int)($_GET['article_id'] ?? 0);
    if (!articolo_votabile($id)) risposta(404, ['error' => 'Articolo non trovato']);
    risposta(200, stato_reazioni($id, $chi));
}

if ($metodo === 'POST') {
    // Trenta reazioni al minuto per rete: un lettore vero non ci arriva.
    if (!freno_passa('reazioni', $rete, 30, 60)) {
        risposta(429, ['error' => 'Troppe richieste. Attendi un momento.']);
    }

    $dati = json_decode((string)file_get_contents('php://input'), true);
    $id = (int)($dati['article_id'] ?? 0);
    $reazione = trim((string)($dati['reaction'] ?? ''));

    if (!in_array($reazione, REAZIONI, true)) risposta(400, ['error' => 'Tipo di reazione non valido']);
    if (!articolo_votabile($id)) risposta(404, ['error' => 'Articolo non trovato']);

    $c = db()->prepare("SELECT id FROM article_reactions WHERE article_id = ? AND voter_hash = ? AND reaction = ?");
    $c->execute([$id, $chi, $reazione]);
    $esistente = $c->fetchColumn();

    if ($esistente) {
        db()->prepare("DELETE FROM article_reactions WHERE id = ?")->execute([$esistente]);
        $azione = 'removed';
    } else {
        /* Due clic quasi insieme arrivano qui entrambi: in produzione la
           tabella ha una chiave unica su (articolo, impronta, reazione), e il
           secondo inserimento la urta. Non è un errore: la reazione c'è. */
        try {
            db()->prepare("INSERT INTO article_reactions (article_id, reaction, voter_hash, created_at) VALUES (?, ?, ?, ?)")
                ->execute([$id, $reazione, $chi, date('Y-m-d H:i:s')]);
        } catch (PDOException $doppione) { /* già inserita dal clic gemello */ }
        $azione = 'added';
    }
    risposta(200, ['action' => $azione] + stato_reazioni($id, $chi));
}

risposta(405, ['error' => 'Metodo non consentito']);

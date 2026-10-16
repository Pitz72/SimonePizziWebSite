<?php
/**
 * Le letture e i clic sui pulsanti degli articoli: POST /api/analytics.php
 *
 * Lo chiama assets/js/visite.js con sendBeacon. Riscritto il 16 ottobre 2026
 * sulle librerie del sito (revisione del 16 ottobre, M15 e M16). Il file di
 * prima era quello del sito React, e aveva due difetti:
 *
 *  - includeva api/auth_helper.php per il cruscotto vecchio, e auth_helper
 *    apriva una sessione appena caricato: ogni lettore di ogni articolo
 *    riceveva un cookie PHPSESSID, e il server scriveva un file di sessione;
 *  - l'impronta per contare una lettura al giorno era sha256(IP + data), che
 *    per un IPv4 si ricalcola provando tutti gli indirizzi.
 *
 * Adesso: nessuna sessione, nessun cookie; l'impronta è un HMAC con la chiave
 * segreta del sito (lib/freno.php), sulla rete ridotta a /64. Il giro di
 * manutenzione toglie le impronte dei giorni passati, che non servono più a
 * niente (manutenzione_anonimizza()).
 *
 * Il cruscotto del pannello React (GET) non esiste più: risponde 410.
 */

declare(strict_types=1);

require __DIR__ . '/../lib/avvio.php';

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(410);
    echo json_encode(['errore' => 'Il cruscotto del vecchio pannello non c\'è più: le analitiche stanno in /admin/.']);
    exit;
}

/** Risposta neutra: un conteggio perso non è un errore per chi legge. */
function fine(int $codice = 200, string $errore = ''): never {
    http_response_code($codice);
    echo json_encode($errore === '' ? ['status' => 'ok'] : ['error' => $errore]);
    exit;
}

$rete = rete_cliente();

// Un programma che manda segnali a raffica non deve arrivare al database.
if (!freno_passa('analitiche', $rete, 60, 60)) fine();

$dati = json_decode((string)file_get_contents('php://input'), true);
if (!is_array($dati)) fine(400, 'Dati non leggibili.');

$tipo = (string)($dati['type'] ?? '');
$idArticolo = (int)($dati['article_id'] ?? 0);
if ($idArticolo <= 0) fine(400, 'article_id richiesto');

// Si contano solo gli articoli che il pubblico può vedere: un'anteprima o un
// id inventato non gonfiano le tabelle.
$q = db()->prepare("SELECT COUNT(*) FROM articles WHERE id = :id AND " . SOLO_PUBBLICATI);
$q->execute([':id' => $idArticolo, ':adesso' => adesso()]);
if ((int)$q->fetchColumn() === 0) fine(400, 'article_id non valido');

$oggi = date('Y-m-d');

if ($tipo === 'view') {
    // La pulizia dei messaggi non ha un cron: parte anche dalle visite, al
    // massimo una volta al giorno (lib/messaggi_pulizia.php).
    try {
        require_once __DIR__ . '/../lib/messaggi_pulizia.php';
        messaggi_pulizia(db());
    } catch (Throwable $_) { /* la pulizia non deve mai fermare il conteggio */ }

    // Una lettura per rete, per articolo, per giorno.
    $impronta = impronta($rete . '|' . $oggi, 'lettura');
    $c = db()->prepare("SELECT COUNT(*) FROM article_views WHERE article_id = ? AND ip_hash = ? AND view_date = ?");
    $c->execute([$idArticolo, $impronta, $oggi]);
    if ((int)$c->fetchColumn() === 0) {
        db()->prepare("INSERT INTO article_views (article_id, ip_hash, view_date) VALUES (?, ?, ?)")
            ->execute([$idArticolo, $impronta, $oggi]);
    }
    fine();
}

if ($tipo === 'click') {
    // Dieci clic al minuto per articolo dalla stessa rete: oltre, non si conta.
    if (!freno_passa('clic', $rete . '|' . $idArticolo, 10, 60)) fine();
    $etichetta = mb_substr(trim((string)($dati['button_label'] ?? '')), 0, 100);
    if ($etichetta === '') $etichetta = 'senza nome';
    // clicked_at è il nome che la colonna ha in produzione.
    db()->prepare("INSERT INTO cta_clicks (article_id, button_label, ip_hash, clicked_at) VALUES (?, ?, ?, ?)")
        ->execute([$idArticolo, $etichetta, impronta($rete . '|' . $oggi, 'clic'), date('Y-m-d H:i:s')]);
    fine();
}

fine(400, "type deve essere 'view' o 'click'");

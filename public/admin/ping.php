<?php
/**
 * «Sono ancora qui?» — il segnale che tiene viva la sessione mentre si scrive.
 *
 * La sessione del pannello si chiude dopo due ore senza richieste, e l'editor
 * non ne fa: si scrive dentro una pagina sola, a lungo, e intanto il server
 * dimentica chi sei. Poi si preme «Salva» e si finisce all'ingresso. È l'admin/ping.php
 * di FDCA (revisione del 16 ottobre, M6), con le stesse due domande:
 *
 *   ?attivo=1  «ho scritto da quando ci siamo sentiti»: la sessione si rinnova,
 *              perché chi scrive è presente.
 *   ?attivo=0  «sono qui ma non ho toccato niente»: si risponde quanto manca
 *              SENZA rinnovare. Un editor lasciato aperto su una scrivania
 *              vuota deve scadere come prima.
 *
 * Risponde il gettone dei moduli: se la sessione è stata rifatta in un'altra
 * scheda, la pagina aggiorna il suo e «Salva» non trova un modulo scaduto.
 * Risponde JSON e non reindirizza mai: chi chiama è una fetch().
 */
require __DIR__ . '/_avvio.php';

header('Content-Type: application/json; charset=utf-8');

avvia_sessione();
$primaVisto = (int)($_SESSION['visto'] ?? 0);
$attivo     = ($_GET['attivo'] ?? '0') === '1';

if (!dentro()) {
    http_response_code(401);
    echo json_encode(['stato' => 'scaduta']);
    exit;
}

// dentro() ha appena rinfrescato l'orologio: se nessuno ha scritto, lo si rimette com'era.
if (!$attivo && $primaVisto > 0) {
    $_SESSION['visto'] = $primaVisto;
}

echo json_encode(['stato' => 'viva', 'gettone' => gettone()] + sessione_resta(), JSON_UNESCAPED_UNICODE);

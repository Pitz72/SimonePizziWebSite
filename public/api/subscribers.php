<?php
/**
 * L'iscrizione alla newsletter: POST /api/subscribers.php
 *
 * Due strade, un risultato solo:
 *  - con JavaScript (assets/js/newsletter.js) arriva un JSON e si risponde JSON;
 *  - senza JavaScript arriva il modulo così com'è, e si risponde con una pagina.
 * Fino al 16 ottobre 2026 c'era solo la prima: senza JavaScript il lettore
 * vedeva un JSON nudo che diceva «email non valida», perché il modulo non veniva
 * letto (revisione del 16 ottobre, M13).
 *
 * I link delle email vecchie (?action=confirm|unsubscribe&token=…) arrivavano
 * qui con un GET, e il GET confermava o disiscriveva da solo: lo fanno anche i
 * programmi di posta che aprono i link per controllarli. Adesso portano alle
 * pagine nuove, dove si agisce solo premendo il pulsante (revisione del 16
 * ottobre, M2). L'elenco degli iscritti del pannello React non c'è più.
 */

declare(strict_types=1);

require __DIR__ . '/../lib/avvio.php';
require_once __DIR__ . '/../lib/newsletter.php';

$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($metodo === 'GET') {
    $azione = (string)($_GET['action'] ?? '');
    $token  = (string)($_GET['token'] ?? '');
    $verso  = ['confirm' => '/newsletter/conferma', 'unsubscribe' => '/newsletter/disiscrivi'][$azione] ?? null;
    if ($verso !== null && nl_token_valido($token)) {
        header('Location: ' . $verso . '?token=' . rawurlencode($token), true, 303);
        exit;
    }
    http_response_code(410);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['errore' => 'Questo indirizzo non serve più. Gli iscritti si vedono dal pannello.']);
    exit;
}

if ($metodo !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['errore' => 'Metodo non consentito']);
    exit;
}

$tipo = (string)($_SERVER['CONTENT_TYPE'] ?? '');
$daJavascript = str_contains($tipo, 'application/json');

if ($daJavascript) {
    $dati = json_decode((string)file_get_contents('php://input'), true);
    $dati = is_array($dati) ? $dati : [];
    $email    = (string)($dati['email'] ?? '');
    $nome     = (string)($dati['name'] ?? '');
    $consenso = in_array($dati['consent'] ?? null, [true, '1', 1, 'on'], true);
} else {
    $email    = (string)($_POST['email'] ?? '');
    $nome     = (string)($_POST['name'] ?? '');
    $consenso = in_array((string)($_POST['consenso'] ?? ''), ['1', 'on'], true);
}

if (!newsletter_richiesta_ammessa()) {
    [$ok, $messaggio, $codice] = [false, 'Troppe richieste. Riprova tra qualche minuto.', 429];
} else {
    [$ok, $messaggio] = newsletter_iscrivi($email, $nome, $consenso, 'sito');
    $codice = $ok ? 200 : 400;
}

if ($daJavascript) {
    http_response_code($codice);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['status' => $ok ? 'success' : 'error', 'message' => $messaggio]);
    exit;
}

/* Senza JavaScript: una pagina del sito con l'esito. Nessun redirect, perché
   non c'è una sessione dove lasciare il messaggio; ricaricarla rimanda il
   modulo, e il freno e la risposta neutra di newsletter_iscrivi() lo reggono. */
http_response_code($codice);
pagina([
    'title'   => ($ok ? 'Controlla la posta' : 'Iscrizione non riuscita') . ' — ' . SITO_NOME,
    'desc'    => 'L’esito dell’iscrizione alla newsletter.',
    'noindex' => true,
]);
require __DIR__ . '/../partials/head.php';
?>
<main id="contenuto" class="contenuto">
  <div class="gab-stretta">
    <header class="testata">
      <span class="eti" style="color:<?= $ok ? 'var(--verde)' : 'var(--spento)' ?>"><?= $ok ? 'Quasi fatto' : 'Non riuscita' ?></span>
      <h1 class="gro" style="margin-top:12px"><?= $ok ? 'Controlla la posta' : 'L’iscrizione non è partita' ?></h1>
      <p><?= e($messaggio) ?></p>
    </header>
    <div class="btn-fila" style="margin-top:28px">
      <a class="btn btn-muto" href="/">Torna alla home</a>
    </div>
  </div>
</main>
<?php require __DIR__ . '/../partials/footer.php'; ?>

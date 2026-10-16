<?php
/**
 * La risposta degli endpoint del sito React spenti il 16 ottobre 2026.
 *
 * Il sito e il pannello in PHP non li usano dal 7 settembre, ma rispondevano
 * ancora: un secondo ingresso al pannello (auth.php), le scritture con la
 * vecchia sessione, letture senza cache di tutto il sito (revisione del 16
 * ottobre, M2). Al loro posto c'è un file che include questo: 410, «non c'è
 * più», che i motori di ricerca capiscono come definitivo. Niente è stato
 * cancellato dal server: i file vecchi stanno in ~/backup-sito/ e nella storia
 * di git.
 */

declare(strict_types=1);

http_response_code(410);
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');
echo json_encode([
    'errore' => 'Questo indirizzo apparteneva al sito React ed è stato spento il 16 ottobre 2026.',
], JSON_UNESCAPED_UNICODE);
exit;

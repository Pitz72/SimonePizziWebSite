<?php
/**
 * DEPRECATO — Script Prerendering (v1.9.0 → v2.0)
 * 
 * Questo script NON È PIÙ NECESSARIO dalla v2.0 del SEO Engine.
 * 
 * Il nuovo index.php genera HTML completo con contenuto reale ON-DEMAND per ogni richiesta
 * dei crawler (Dynamic Rendering), rendendo obsoleto il prerendering statico su disco.
 * 
 * Anche robots.txt e sitemap.xml sono ora serviti SEMPRE in tempo reale dai rispettivi
 * file PHP (robots.php, sitemap.php) senza bisogno di generare copie fisiche.
 * 
 * Questo file è mantenuto solo per evitare errori 404 da eventuali bookmark admin.
 */

header('Content-Type: application/json');

echo json_encode([
    'status'  => 'deprecated',
    'message' => 'Il prerendering manuale non è più necessario dalla v2.0 del SEO Engine. Il contenuto HTML viene ora generato dinamicamente da index.php per i crawler.',
    'info'    => 'robots.txt e sitemap.xml sono serviti in tempo reale da robots.php e sitemap.php.',
    'action'  => 'Nessuna azione richiesta. Puoi rimuovere questo file in sicurezza.'
], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
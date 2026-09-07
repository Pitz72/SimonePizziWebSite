<?php
/**
 * L'avvio del pannello. Ogni pagina di admin/ comincia da qui.
 *
 * Fa tre cose in più rispetto all'avvio del sito pubblico: carica
 * l'autenticazione e le query del pannello, applica le migrazioni pigre — è il
 * primo momento utile, e capita una volta per richiesta — e dice ai motori di
 * ricerca di stare alla larga.
 *
 * NON richiede l'accesso: lo fa ogni pagina con richiedi_accesso(), perché la
 * pagina di ingresso deve poter essere vista da chi ancora non è entrato.
 */

declare(strict_types=1);

require_once __DIR__ . '/../lib/avvio.php';
require_once __DIR__ . '/../lib/auth.php';
require_once __DIR__ . '/../lib/db_maintenance.php';
require_once __DIR__ . '/../lib/pannello.php';
require_once __DIR__ . '/_layout.php';

header('X-Robots-Tag: noindex, nofollow');
// Una pagina del pannello non deve restare nella cache del browser: chi esce e
// preme «indietro» non deve rivedere l'elenco degli articoli.
header('Cache-Control: no-store, no-cache, must-revalidate');

assicura_schema(db());

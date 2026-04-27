<?php
// =================================================================
// Template configurazione Database MySQL
// -----------------------------------------------------------------
// Copiare questo file come config.php e inserire le credenziali reali.
// config.php NON deve essere committato su git (vedi .gitignore).
// =================================================================

define('DB_DSN',     'mysql:host=YOUR_HOST;dbname=YOUR_DATABASE;charset=utf8mb4');
define('DB_USER',    'YOUR_USERNAME');
define('DB_PASS',    'YOUR_PASSWORD');

// Secret per il cron di backup automatico — generare con: php -r "echo bin2hex(random_bytes(32));"
define('BACKUP_CRON_SECRET', 'SOSTITUIRE_CON_STRINGA_CASUALE_64_CHAR');

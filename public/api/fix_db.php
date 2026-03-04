<?php
require_once 'db.php';

try {
    $pdo = Database::connect();
    
    // Rimuove spazi accidentali all'inizio e alla fine delle stringhe category e slug
    $stmt = $pdo->prepare("UPDATE articles SET category = TRIM(category), slug = TRIM(slug)");
    $stmt->execute();
    
    echo "<h1>Procedura Completata con Successo!</h1>";
    echo "<p>Tutti gli articoli storici sono stati scansionati e sanificati dalle tabulazioni/spazi errati.</p>";
    echo "<strong>Record aggiornati/processati: " . $stmt->rowCount() . "</strong>";
    echo "<br><br><p style='color:green;'>Ora puoi chiudere questa pagina, i link agli articoli su Home e RSS torneranno a non avere il fastidioso %20 o a restituire 404.</p>";
    echo "<p style='color:red;'>Attenzione: Per sicurezza, rimuovi questo file (fix_db.php) dal tuo server FTP ora che hai finito.</p>";

} catch (Exception $e) {
    http_response_code(500);
    echo "<h1>Errore di connessione o esecuzione</h1>";
    echo "Dettagli: " . $e->getMessage();
}
?>

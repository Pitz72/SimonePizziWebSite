<?php
require_once 'db.php';
header('Content-Type: text/plain');

echo "--- DIAGNOSTICA BACKEND SIMONE PIZZI ---\n";

try {
    $pdo = Database::connect();
    echo "1. Connessione Database: OK\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM categories");
    echo "2. Tabella Categorie: OK (" . $stmt->fetchColumn() . " record)\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM projects");
    echo "3. Tabella Progetti: OK (" . $stmt->fetchColumn() . " record)\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM articles");
    echo "4. Tabella Articoli: OK (" . $stmt->fetchColumn() . " record)\n";

    echo "\nConclusione: Il database risponde correttamente.\n";
} catch (Exception $e) {
    echo "ERRORE CRITICO: " . $e->getMessage() . "\n";
    echo "Dettagli: Controlla le credenziali in db.php o lo stato del server MySQL.\n";
}

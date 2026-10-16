<?php
/**
 * La cache delle letture pubbliche.
 *
 * Revisione del 16 ottobre 2026, M3. FDCA ha imparato a febbraio, dall'attacco
 * a Runtime Radio, che il database non deve vedere il traffico diretto: ogni
 * lettura che non dipende da chi legge passa da una cache con scadenza. Qui ogni
 * pagina apriva MySQL e faceva una dozzina di query — la barra con le sue
 * sottocategorie, i conteggi, gli elenchi — e un picco o un programma che
 * scorreva il sito arrivavano dritti sul MySQL condiviso di DreamHost.
 *
 * Come funziona:
 *  - ogni risultato sta in un file sotto cartella_privata('cache'), fuori dal
 *    docroot, per CACHE_DURATA secondi;
 *  - ogni POST del pannello la svuota tutta alla fine della richiesta
 *    (admin/_avvio.php): quello che Simone salva si vede subito;
 *  - un articolo programmato compare al massimo CACHE_DURATA secondi dopo la
 *    sua ora, perché la sua uscita non è un salvataggio;
 *  - l'anteprima dell'amministratore non passa da qui
 *    (articolo_per_slug_in_anteprima legge sempre il database).
 *
 * Se la cartella non si può usare, si legge il database come prima: la cache
 * è un risparmio, non una condizione per funzionare.
 */

declare(strict_types=1);

const CACHE_DURATA = 300;

function cache_cartella(): string {
    return cartella_privata('cache');
}

/**
 * Il valore per questa chiave: dalla cache se è fresco, altrimenti lo calcola
 * $calcola e lo si mette da parte. Nella stessa richiesta lo stesso valore si
 * legge una volta sola.
 */
function cache_ricorda(string $chiave, callable $calcola, int $durata = CACHE_DURATA): mixed {
    static $memoria = [];
    if (array_key_exists($chiave, $memoria)) return $memoria[$chiave];

    $file = cache_cartella() . '/' . sha1($chiave) . '.cache';
    if (is_file($file) && @filemtime($file) > time() - $durata) {
        $dati = @unserialize((string)@file_get_contents($file), ['allowed_classes' => false]);
        if (is_array($dati) && array_key_exists('v', $dati)) {
            return $memoria[$chiave] = $dati['v'];
        }
    }

    $valore = $calcola();
    // Scrittura in un file provvisorio e poi rename: chi legge nello stesso
    // istante trova il file vecchio o quello nuovo, mai uno a metà.
    $provvisorio = $file . '.' . bin2hex(random_bytes(4));
    if (@file_put_contents($provvisorio, serialize(['v' => $valore])) !== false) {
        @rename($provvisorio, $file);
    }
    return $memoria[$chiave] = $valore;
}

/** Svuota tutto: la chiama ogni POST del pannello. */
function cache_svuota(): int {
    $tolti = 0;
    foreach (glob(cache_cartella() . '/*.cache') ?: [] as $f) {
        if (@unlink($f)) $tolti++;
    }
    return $tolti;
}

/** Toglie i file scaduti da tempo: la chiama il giro di manutenzione, una volta al giorno. */
function cache_pulisci(): int {
    $tolti = 0;
    foreach (glob(cache_cartella() . '/*.cache*') ?: [] as $f) {
        if (@filemtime($f) < time() - 86400 && @unlink($f)) $tolti++;
    }
    return $tolti;
}

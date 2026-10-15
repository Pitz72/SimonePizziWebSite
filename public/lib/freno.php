<?php
/**
 * I freni e le impronte: quante volte una stessa rete può fare una cosa, e come
 * riconoscerla senza scriverne l'indirizzo.
 *
 * Fino all'ottobre 2026 ogni modulo aveva il suo freno, e tutti stavano nella
 * tabella `login_attempts`: il login con l'IP in chiaro, la newsletter e le
 * reazioni con uno sha256 senza chiave, il recupero della password con niente.
 * Tre difetti insieme (revisione del 16 ottobre, G3, M14, M15):
 *
 *  - un IPv6 si leggeva intero, e chi ha una rete /64 ha indirizzi senza fine;
 *  - uno sha256 di un IPv4 si ricalcola provando i quattro miliardi di indirizzi:
 *    è uno pseudonimo, non un dato anonimo;
 *  - un modulo pubblico senza freno spediva email a ripetizione.
 *
 * Qui c'è una strada sola, quella di FDCA: la rete si riduce a /64, l'impronta è
 * un HMAC con una chiave che sta fuori dal docroot, e i conteggi stanno in file
 * fuori dal docroot. Nel database non entra più nessun indirizzo.
 */

declare(strict_types=1);

/**
 * Una cartella che nessun indirizzo web raggiunge.
 *
 * In produzione sta nella home dell'utente, accanto a `backup-db/`; in sviluppo
 * dentro `scratch/`, che è fuori da git. Si crea alla prima richiesta.
 */
function cartella_privata(string $nome): string {
    $base = IN_SVILUPPO
        ? dirname(__DIR__, 2) . '/scratch/simonepizzi-dati'
        : dirname(__DIR__, 2) . '/simonepizzi-dati';
    $dir = $base . '/' . $nome;
    if (!is_dir($dir)) {
        @mkdir($dir, 0700, true);
    }
    return $dir;
}

/**
 * La rete di chi fa la richiesta: l'IPv4 com'è, l'IPv6 ridotto al prefisso /64.
 *
 * Il /64 è la rete di una casa o di un telefono; la seconda metà dell'indirizzo
 * la sceglie il dispositivo e cambia da sola. Contare l'indirizzo intero vuol
 * dire dare a chiunque abbia l'IPv6 un numero di tentativi senza fine.
 */
function rete_cliente(): string {
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
        $binario = inet_pton($ip);
        if ($binario !== false) {
            return inet_ntop(substr($binario, 0, 8) . str_repeat("\0", 8)) . '/64';
        }
    }
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : 'sconosciuto';
}

/**
 * Una chiave segreta, creata la prima volta che serve e poi sempre la stessa.
 *
 * Sta in un file fuori dal docroot e fuori dal database: chi ha una copia del
 * database non ha la chiave, quindi non può ricalcolare le impronte.
 */
function chiave_segreta(string $nome): string {
    static $chiavi = [];
    if (isset($chiavi[$nome])) {
        return $chiavi[$nome];
    }
    $file = cartella_privata('chiavi') . '/' . $nome . '.key';

    $letta = is_file($file) ? trim((string)@file_get_contents($file)) : '';
    if (strlen($letta) === 64 && ctype_xdigit($letta)) {
        return $chiavi[$nome] = $letta;
    }

    /* Due richieste che arrivano insieme alla prima volta: «x» apre solo se il
       file non c'è, quindi una sola delle due scrive, e l'altra rilegge. */
    $nuova = bin2hex(random_bytes(32));
    $f = @fopen($file, 'x');
    if ($f !== false) {
        fwrite($f, $nuova);
        fclose($f);
        @chmod($file, 0600);
        return $chiavi[$nome] = $nuova;
    }
    $letta = trim((string)@file_get_contents($file));
    if (strlen($letta) === 64 && ctype_xdigit($letta)) {
        return $chiavi[$nome] = $letta;
    }

    /* Né scrivere né leggere: la cartella non è utilizzabile. Si va avanti con
       una chiave della sola richiesta, così il sito non si ferma; il log lo dice. */
    error_log('chiave_segreta: non riesco a usare ' . $file);
    return $chiavi[$nome] = $nuova;
}

/** L'impronta di un valore, legata a uno scopo: la stessa rete dà impronte diverse per scopi diversi. */
function impronta(string $valore, string $scopo): string {
    return hash_hmac('sha256', $scopo . "\n" . $valore, chiave_segreta('impronte'));
}

/* ── I freni ─────────────────────────────────────────────────────────────── */

function freno_file(string $scopo, string $chi): string {
    return cartella_privata('freni') . '/' . substr(impronta($chi, 'freno:' . $scopo), 0, 40) . '.json';
}

/**
 * Lavora sul file di un freno sotto lucchetto: legge gli istanti ancora dentro
 * la finestra, li passa a $cosa, e scrive quello che $cosa restituisce.
 *
 * @param callable(list<int>): list<int> $cosa
 * @return list<int> gli istanti dopo il lavoro
 */
function freno_lavora(string $scopo, string $chi, int $finestra, callable $cosa): array {
    $file = freno_file($scopo, $chi);
    $f = @fopen($file, 'c+');
    if ($f === false) {
        error_log('freno: non riesco ad aprire ' . $file);
        return [];
    }
    flock($f, LOCK_EX);
    $testo = stream_get_contents($f);
    $istanti = json_decode($testo === false ? '' : $testo, true);
    $limite = time() - $finestra;
    $istanti = array_values(array_filter(is_array($istanti) ? $istanti : [],
        static fn($t) => is_int($t) && $t > $limite));

    $dopo = $cosa($istanti);

    ftruncate($f, 0);
    rewind($f);
    fwrite($f, json_encode(array_values($dopo)));
    fflush($f);
    flock($f, LOCK_UN);
    fclose($f);
    return $dopo;
}

/** Quante volte è già successo, nella finestra. */
function freno_conta(string $scopo, string $chi, int $finestra): int {
    return count(freno_lavora($scopo, $chi, $finestra, static fn(array $t) => $t));
}

/** Segna un'altra volta. */
function freno_annota(string $scopo, string $chi, int $finestra): void {
    freno_lavora($scopo, $chi, $finestra, static function (array $t): array {
        $t[] = time();
        return $t;
    });
}

/**
 * Controlla e segna in un colpo solo: true se c'è ancora posto (e il posto è
 * preso), false se la finestra è piena. Sotto lo stesso lucchetto, così due
 * richieste insieme non passano entrambe sull'ultimo posto.
 */
function freno_passa(string $scopo, string $chi, int $massimo, int $finestra): bool {
    $passa = false;
    freno_lavora($scopo, $chi, $finestra, static function (array $t) use ($massimo, &$passa): array {
        if (count($t) >= $massimo) {
            return $t;
        }
        $passa = true;
        $t[] = time();
        return $t;
    });
    return $passa;
}

/** Dimentica: dopo un login riuscito, la rete riparte da zero. */
function freno_azzera(string $scopo, string $chi): void {
    @unlink(freno_file($scopo, $chi));
}

/**
 * Toglie i file dei freni fermi da più di due giorni. La finestra più lunga è
 * di un giorno, quindi oltre non contano più niente. Lo chiama il giro di
 * manutenzione.
 */
function freno_pulisci(): int {
    $tolti = 0;
    foreach (glob(cartella_privata('freni') . '/*.json') ?: [] as $file) {
        if (@filemtime($file) < time() - 2 * 86400 && @unlink($file)) {
            $tolti++;
        }
    }
    return $tolti;
}

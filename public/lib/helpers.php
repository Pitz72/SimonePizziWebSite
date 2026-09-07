<?php
/**
 * Le funzioni che servono dappertutto: mettere del testo dentro l'HTML senza
 * farsi male, scrivere una data in italiano, contare quanto dura una lettura.
 */

declare(strict_types=1);

/**
 * Testo dentro l'HTML.
 *
 * Nome corto perché nei template compare a ogni riga: `<?= e($titolo) ?>`.
 * ENT_QUOTES chiude anche gli apostrofi, che in italiano sono ovunque.
 */
function e(?string $testo): string {
    return htmlspecialchars((string)$testo, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Testo dentro un attributo di un URL. */
function eu(?string $url): string {
    return e(filter_var((string)$url, FILTER_SANITIZE_URL) ?: '');
}

const MESI = [1=>'gennaio','febbraio','marzo','aprile','maggio','giugno',
              'luglio','agosto','settembre','ottobre','novembre','dicembre'];

/**
 * «5 settembre 2026».
 *
 * Scritta in PHP e non con DATE_FORMAT del database per due ragioni: i nomi
 * dei mesi in italiano dipenderebbero dalla lingua del server, e la stessa
 * query deve girare su MySQL in produzione e su SQLite in sviluppo.
 */
function data_lunga(?string $quando): string {
    if (!$quando) return '';
    $t = strtotime($quando);
    if ($t === false) return '';
    return (int)date('j', $t) . ' ' . MESI[(int)date('n', $t)] . ' ' . date('Y', $t);
}

/** «5 set 2026», per gli elenchi dove la colonna della data è stretta. */
function data_breve(?string $quando): string {
    if (!$quando) return '';
    $t = strtotime($quando);
    if ($t === false) return '';
    return (int)date('j', $t) . ' ' . mb_substr(MESI[(int)date('n', $t)], 0, 3) . ' ' . date('Y', $t);
}

/** Formato macchina per <time datetime="…"> e per i JSON-LD. */
function data_iso(?string $quando): string {
    $t = $quando ? strtotime($quando) : false;
    return $t === false ? '' : date('c', $t);
}

/**
 * Minuti di lettura.
 *
 * 200 parole al minuto è la misura che usano gli altri due siti: tenerla
 * uguale evita che lo stesso testo risulti da 9 minuti su un sito e da 14
 * sull'altro.
 */
function minuti_lettura(?string $html): int {
    $parole = str_word_count(strip_tags((string)$html), 0, 'àèéìòùÀÈÉÌÒÙabcdefghijklmnopqrstuvwxyz');
    return max(1, (int)ceil($parole / 200));
}

/** Taglia sull'ultima parola intera e chiude con un'ellissi vera. */
function tronca(?string $testo, int $lunghezza = 160): string {
    $t = trim(preg_replace('/\s+/u', ' ', strip_tags((string)$testo)) ?? '');
    if (mb_strlen($t) <= $lunghezza) return $t;
    $tagliato = mb_substr($t, 0, $lunghezza);
    $spazio = mb_strrpos($tagliato, ' ');
    if ($spazio !== false) $tagliato = mb_substr($tagliato, 0, $spazio);
    return rtrim($tagliato, " ,;:.-") . '…';
}

/**
 * Slug: minuscole, accenti sciolti, tutto il resto diventa trattino.
 *
 * Deve dare lo stesso risultato della normalizzazione che fa api/articles.php,
 * altrimenti il pannello e il sito pubblico calcolano due URL diverse per lo
 * stesso articolo.
 */
function slug(string $testo): string {
    $t = mb_strtolower(trim($testo));
    $t = strtr($t, [
        'à'=>'a','á'=>'a','â'=>'a','ä'=>'a','ã'=>'a','å'=>'a',
        'è'=>'e','é'=>'e','ê'=>'e','ë'=>'e',
        'ì'=>'i','í'=>'i','î'=>'i','ï'=>'i',
        'ò'=>'o','ó'=>'o','ô'=>'o','ö'=>'o','õ'=>'o',
        'ù'=>'u','ú'=>'u','û'=>'u','ü'=>'u',
        'ç'=>'c','ñ'=>'n',
    ]);
    $t = preg_replace('/[^a-z0-9]+/u', '-', $t) ?? '';
    return trim($t, '-');
}

/**
 * L'indirizzo di un'immagine caricata.
 *
 * Nel database convivono due forme, per ragioni storiche: percorsi relativi
 * (`/uploads/immagini/…`) e URL assolute al sito di produzione. In sviluppo le
 * relative non risolvono, perché la cartella uploads sta sul server: si
 * riscrivono verso il sito vero, così le pagine locali mostrano le immagini
 * giuste senza copiare due gigabyte di file.
 */
function url_immagine(?string $percorso): string {
    $p = trim((string)$percorso);
    if ($p === '') return '';
    if (str_starts_with($p, 'http://') || str_starts_with($p, 'https://')) return $p;
    if (!str_starts_with($p, '/')) $p = '/' . $p;
    return IN_SVILUPPO ? SITO_URL . $p : $p;
}

/** L'indirizzo pubblico di un articolo: /{categoria}/{slug}, come oggi. */
function url_articolo(array $articolo): string {
    return '/' . rawurlencode((string)$articolo['category']) . '/' . rawurlencode((string)$articolo['slug']);
}

/**
 * Le prime parole di un articolo, per quando manca il riassunto.
 * Non è un riassunto vero, ma è meglio di una descrizione vuota su Google.
 */
function estratto(array $articolo, int $lunghezza = 160): string {
    $testo = trim((string)($articolo['excerpt'] ?? ''));
    if ($testo === '') $testo = (string)($articolo['content'] ?? '');
    return tronca($testo, $lunghezza);
}

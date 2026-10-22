<?php
/**
 * Il caricamento di un file nella libreria: un'immagine, un PDF o un archivio.
 *
 * Fa quello che faceva api/upload.php — controlla l'estensione, controlla i
 * byte veri del file, ridimensiona sopra i 1920px, converte in WebP con GD e
 * registra la riga in `media` — ma passando da lib/, quindi funziona anche in
 * sviluppo, dove il database è SQLite. api/upload.php, il caricamento del
 * pannello React, è stato tolto dal server il 16 ottobre 2026.
 *
 * PDF, ZIP e RAR sono tornati il 22 ottobre 2026: il React li accettava, il
 * pannello in PHP no. Vanno nelle cartelle di allora (uploads/documenti/ e
 * uploads/file/), così come sono, fino a PESO_MASSIMO_FILE.
 *
 * Le tre difese, nell'ordine in cui contano:
 *   1. l'estensione dev'essere in elenco;
 *   2. i byte veri del file devono corrispondere (un .php rinominato .jpg si
 *      ferma qui, e un .php rinominato .pdf pure);
 *   3. il nome salvato non può contenere punti prima dell'estensione, perché
 *      «shell.php.jpg» con certe configurazioni di Apache viene eseguito.
 */

declare(strict_types=1);

require __DIR__ . '/_avvio.php';
richiedi_accesso();

header('Content-Type: application/json; charset=utf-8');

const ESTENSIONI = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
const TIPI_VERI  = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const LARGHEZZA_MASSIMA = 1920;

/* I file che non sono immagini: tipo da registrare, cartella, e come
   cominciano. La firma la dicono i primi byte, senza fileinfo (che nel PHP di
   sviluppo manca): un PDF comincia con «%PDF-», uno ZIP con «PK» e due byte di
   intestazione, un RAR con «Rar!» (le versioni 4 e 5 hanno lo stesso inizio). */
const FILE_AMMESSI = [
    'pdf' => ['mime' => 'application/pdf',     'cartella' => 'documenti', 'firme' => ['%PDF-']],
    'zip' => ['mime' => 'application/zip',     'cartella' => 'file',      'firme' => ["PK\x03\x04", "PK\x05\x06", "PK\x07\x08"]],
    'rar' => ['mime' => 'application/vnd.rar', 'cartella' => 'file',      'firme' => ["Rar!\x1A\x07"]],
];
function fallisci(string $perche, int $stato = 400): never {
    http_response_code($stato);
    echo json_encode(['errore' => $perche], JSON_UNESCAPED_UNICODE);
    exit;
}

/** Il nome del file senza niente che Apache possa leggere come estensione. */
function nome_pulito(string $originale, string $ripiego): string {
    $base = preg_replace('/[^A-Za-z0-9\-_]/', '', pathinfo($originale, PATHINFO_FILENAME)) ?: $ripiego;
    return mb_substr($base, 0, 60);
}

/**
 * Un PDF o un archivio: si controlla, si sposta, si registra. Niente
 * conversioni. In `filename` va il nome pulito senza il prefisso casuale:
 * è quello con cui api/download.php lo fa scaricare, come nel React.
 */
function carica_allegato(array $file, string $estensione): never {
    $regola = FILE_AMMESSI[$estensione];
    if ((int)$file['size'] > PESO_MASSIMO_FILE) {
        fallisci('Troppo grande: per PDF e archivi il limite è ' . (PESO_MASSIMO_FILE >> 20) . ' MB.');
    }
    $testa = (string)@file_get_contents($file['tmp_name'], false, null, 0, 8);
    $firmaGiusta = false;
    foreach ($regola['firme'] as $firma) {
        if (str_starts_with($testa, $firma)) { $firmaGiusta = true; break; }
    }
    if (!$firmaGiusta) {
        fallisci('Dentro non c\'è un file ' . strtoupper($estensione) . ', qualunque cosa dica il suo nome.');
    }

    $base = nome_pulito((string)$file['name'], 'file');
    $cartella = __DIR__ . '/../uploads/' . $regola['cartella'] . '/';
    if (!is_dir($cartella) && !@mkdir($cartella, 0755, true)) {
        fallisci('Non riesco a creare la cartella ' . $regola['cartella'] . '.', 500);
    }
    $nomeFile = uniqid() . '-' . $base . '.' . $estensione;
    if (!move_uploaded_file($file['tmp_name'], $cartella . $nomeFile)) {
        fallisci('Non riesco a salvare il file.', 500);
    }

    $percorso = '/uploads/' . $regola['cartella'] . '/' . $nomeFile;
    $nome = $base . '.' . $estensione;
    $peso = (int)filesize($cartella . $nomeFile);
    try {
        db()->prepare("INSERT INTO media (filename, file_path, mime_type, size, created_at)
                       VALUES (?, ?, ?, ?, ?)")
            ->execute([$nome, $percorso, $regola['mime'], $peso, date('Y-m-d H:i:s')]);
    } catch (Throwable $err) {
        error_log('carica.php: registrazione in media fallita — ' . $err->getMessage());
    }

    echo json_encode([
        'id'   => (int)db()->lastInsertId(),
        'url'  => url_immagine($percorso),
        'nome' => $nome,
        'peso' => $peso,
        'tipo' => $regola['cartella'],
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fallisci('Serve una POST.', 405);
verifica_gettone();

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $codice = $_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE;
    fallisci($codice === UPLOAD_ERR_INI_SIZE || $codice === UPLOAD_ERR_FORM_SIZE
        ? 'Il file è più grande di quanto il server accetti.'
        : 'Il file non è arrivato.');
}

$file = $_FILES['file'];
$estensione = strtolower(pathinfo((string)$file['name'], PATHINFO_EXTENSION));
if (isset(FILE_AMMESSI[$estensione])) {
    carica_allegato($file, $estensione);
}
if (!in_array($estensione, ESTENSIONI, true)) {
    fallisci('Formato non ammesso. Vanno bene: ' . implode(', ', [...ESTENSIONI, ...array_keys(FILE_AMMESSI)]) . '.');
}

/* Il tipo vero lo dicono i byte del file, letti da getimagesize(): sta nel
   cuore di PHP e capisce JPEG, PNG, GIF e WebP. mime_content_type() vuole
   l'estensione fileinfo, che non c'è dappertutto: nel PHP di sviluppo mancava,
   e caricare un'immagine in locale finiva in un errore fatale (trovato il 16
   ottobre 2026 provando le GIF animate). */
function tipo_immagine(string $percorso): string {
    $info = @getimagesize($percorso);
    return is_array($info) ? (string)($info['mime'] ?? '') : '';
}
$tipoVero = tipo_immagine($file['tmp_name']);
if (!in_array($tipoVero, TIPI_VERI, true)) {
    fallisci('Questo file non è un\'immagine, qualunque cosa dica il suo nome.');
}

/* Il nome: niente punti nel corpo, così non esiste una seconda estensione. */
$base = nome_pulito((string)$file['name'], 'immagine');
$nomeFile = uniqid() . '-' . $base . '.' . $estensione;

$cartella = __DIR__ . '/../uploads/immagini/';
if (!is_dir($cartella) && !@mkdir($cartella, 0755, true)) {
    fallisci('Non riesco a creare la cartella delle immagini.', 500);
}

$destinazione = $cartella . $nomeFile;
if (!move_uploaded_file($file['tmp_name'], $destinazione)) {
    fallisci('Non riesco a salvare il file.', 500);
}

/* ── Ridimensiona e converti ─────────────────────────────────────────────
   Una foto da 4000px non serve a nessuno su una pagina larga 1300, e pesa
   dieci volte tanto. Il WebP a qualità 82 è quello che il sito usa già. */
/* Una GIF animata resta com'è. GD ne legge solo il primo fotogramma, e la
   conversione la trasformava in un WebP fermo senza dirlo (revisione del 16
   ottobre, L10). Si riconosce contando i blocchi di controllo dei fotogrammi:
   più di uno vuol dire animazione. */
function gif_animata(string $percorso): bool {
    $dati = (string)@file_get_contents($percorso);
    return preg_match_all('/\x00\x21\xF9\x04.{4}\x00[\x2C\x21]/s', $dati) > 1;
}
$animata = $tipoVero === 'image/gif' && gif_animata($destinazione);

if (!$animata && extension_loaded('gd') && function_exists('imagewebp')) {
    $immagine = match ($tipoVero) {
        'image/jpeg' => @imagecreatefromjpeg($destinazione),
        'image/png'  => @imagecreatefrompng($destinazione),
        'image/gif'  => @imagecreatefromgif($destinazione),
        'image/webp' => @imagecreatefromwebp($destinazione),
        default      => false,
    };

    if ($immagine !== false) {
        $larghezza = imagesx($immagine);
        $altezza   = imagesy($immagine);

        if ($larghezza > LARGHEZZA_MASSIMA) {
            $nuovaL = LARGHEZZA_MASSIMA;
            $nuovaA = (int)round($altezza * (LARGHEZZA_MASSIMA / $larghezza));
            $tela = imagecreatetruecolor($nuovaL, $nuovaA);
            imagealphablending($tela, false);
            imagesavealpha($tela, true);
            imagecopyresampled($tela, $immagine, 0, 0, 0, 0, $nuovaL, $nuovaA, $larghezza, $altezza);
            imagedestroy($immagine);
            $immagine = $tela;
        }

        $nomeWebp = preg_replace('/\.[^.]+$/', '.webp', $nomeFile);
        if (@imagewebp($immagine, $cartella . $nomeWebp, 82)) {
            if ($nomeWebp !== $nomeFile) @unlink($destinazione);
            $nomeFile = $nomeWebp;
            $destinazione = $cartella . $nomeWebp;
        }
        imagedestroy($immagine);
    }
}

$percorsoPubblico = '/uploads/immagini/' . $nomeFile;

try {
    db()->prepare("INSERT INTO media (filename, file_path, mime_type, size, created_at)
                   VALUES (?, ?, ?, ?, ?)")
        ->execute([$nomeFile, $percorsoPubblico, tipo_immagine($destinazione) ?: $tipoVero,
                   (int)filesize($destinazione), date('Y-m-d H:i:s')]);
} catch (Throwable $err) {
    // Il file c'è comunque: si segnala, ma non si butta via il caricamento.
    error_log('carica.php: registrazione in media fallita — ' . $err->getMessage());
}

echo json_encode([
    'id'   => (int)db()->lastInsertId(),
    'url'  => url_immagine($percorsoPubblico),
    'nome' => $nomeFile,
    'peso' => (int)filesize($destinazione),
    'tipo' => 'immagini',
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

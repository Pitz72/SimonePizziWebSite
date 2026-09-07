<?php
/**
 * L'apertura di ogni pagina: gli header HTTP, il <head> e la barra.
 *
 * Gli header vanno mandati prima di qualunque stampa, quindi stanno in cima a
 * questo file e non altrove.
 *
 * NOTA SULLA CSP. Finché il sito vecchio è in produzione la CSP la manda
 * public/.htaccess con `Header always set`, che vince su questa. Al momento del
 * taglio quella riga va tolta dall'.htaccess, perché il nonce può nascere solo
 * qui: cambia a ogni richiesta e un file di configurazione non lo sa fare.
 * È annotato in DECISIONI.md §7.
 */

if (!headers_sent()) {
    header('Content-Type: text/html; charset=utf-8');
    header("Content-Security-Policy: "
        . "default-src 'self'; "
        . "script-src 'self' 'nonce-" . nonce() . "'; "
        . "style-src 'self' 'unsafe-inline'; "
        . "font-src 'self'; "                    // i caratteri sono in casa: niente gstatic
        . "img-src 'self' data: https:; "        // le copertine possono essere URL assolute
        . "connect-src 'self'; "
        . "object-src 'none'; "
        . "frame-src https://www.youtube-nocookie.com; "
        . "frame-ancestors 'self'; "
        . "base-uri 'self'");
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('X-Content-Type-Options: nosniff');
}

$titolo    = (string)p('title');
$descr     = (string)p('desc');
$canonico  = base_url() . (string)p('canonical');
$immagine  = (string)p('immagine');
?>
<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($titolo) ?></title>
<meta name="description" content="<?= e($descr) ?>">
<link rel="canonical" href="<?= e($canonico) ?>">
<?php if (p('noindex')): ?>
<meta name="robots" content="noindex, follow">
<?php endif; ?>

<meta property="og:type" content="<?= e((string)p('tipo')) ?>">
<meta property="og:site_name" content="<?= e(SITO_NOME) ?>">
<meta property="og:title" content="<?= e($titolo) ?>">
<meta property="og:description" content="<?= e($descr) ?>">
<meta property="og:url" content="<?= e($canonico) ?>">
<?php if ($immagine !== ''): ?>
<meta property="og:image" content="<?= e($immagine) ?>">
<meta name="twitter:card" content="summary_large_image">
<?php else: ?>
<meta name="twitter:card" content="summary">
<?php endif; ?>

<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="alternate" type="application/rss+xml" title="<?= e(SITO_NOME) ?>" href="/api/rss.php">
<link rel="stylesheet" href="/assets/css/base.css">
<link rel="stylesheet" href="/assets/css/main.css">
<?php stampa_jsonld(p('jsonld'), jsonld_briciole((array)p('briciole'))); ?>
</head>
<body<?= p('corpo_classe') ? ' class="' . e((string)p('corpo_classe')) . '"' : '' ?>>

<a class="salta" href="#contenuto">Vai al contenuto</a>

<?php require __DIR__ . '/nav.php'; ?>

<?php
/**
 * Prove su safe_html(): quello che deve passare, e quello che non deve.
 *
 *   php docs/collaudo/prova-safe-html.php
 *
 * Niente framework: si esegue e dice quante ne ha passate. Le prove che
 * contano sono le prime, quelle che riproducono i buchi di strip_tags —
 * gli attributi che passavano interi perché strip_tags non li guarda.
 */

declare(strict_types=1);

define('IN_SVILUPPO', true);
require __DIR__ . '/../../public/lib/helpers.php';
require __DIR__ . '/../../public/lib/safe_html.php';

$passate = 0;
$fallite = 0;

/** L'HTML ripulito deve contenere (o non contenere) certe cose. */
function prova(string $nome, string $ingresso, array $deve_contenere, array $non_deve_contenere): void {
    global $passate, $fallite;
    $uscita = safe_html($ingresso);
    $errori = [];

    foreach ($deve_contenere as $pezzo) {
        if (!str_contains($uscita, $pezzo)) $errori[] = "manca «$pezzo»";
    }
    foreach ($non_deve_contenere as $pezzo) {
        if (str_contains($uscita, $pezzo)) $errori[] = "è passato «$pezzo»";
    }

    if ($errori) {
        $fallite++;
        echo "  NO  $nome\n";
        foreach ($errori as $e) echo "        $e\n";
        echo "        uscita: " . mb_substr($uscita, 0, 160) . "\n";
    } else {
        $passate++;
        echo "  ok  $nome\n";
    }
}

echo "\nGli attributi, che strip_tags non guardava\n";

prova('un gestore di evento sparisce, il testo resta',
    '<p onmouseover="rubaTutto()">Testo buono</p>',
    ['Testo buono', '<p>'], ['onmouseover', 'rubaTutto']);

prova('href javascript: viene tolto, il link resta come testo',
    '<a href="javascript:alert(1)">clicca</a>',
    ['clicca'], ['javascript:', 'alert']);

prova('javascript: scritto con le entità non passa',
    '<a href="&#106;avascript:alert(1)">clicca</a>',
    ['clicca'], ['javascript:', 'alert(1)']);

prova('javascript: spezzato da un a capo non passa',
    "<a href=\"java\nscript:alert(1)\">clicca</a>",
    ['clicca'], ['script:alert']);

prova('data:text/html non passa, data:image sì',
    '<img src="data:text/html;base64,PHN2Zz4="><img src="data:image/png;base64,iVBORw0KGgo=">',
    ['data:image/png'], ['data:text/html']);

prova('uno stile in linea non sopravvive',
    '<p style="position:fixed;inset:0;background:red">coprimi tutto</p>',
    ['coprimi tutto'], ['style=', 'position:fixed']);

echo "\nI tag\n";

prova('script sparisce con tutto il suo contenuto',
    '<p>prima</p><script>rubaTutto()</script><p>dopo</p>',
    ['prima', 'dopo'], ['script', 'rubaTutto']);

prova('un form non si può infilare in un articolo',
    '<form action="https://cattivi.example/raccogli"><input name="password"></form><p>vero</p>',
    ['vero'], ['<form', '<input', 'cattivi.example']);

prova('span e div si sciolgono ma il testo resta',
    '<div><span>parola</span> importante</div>',
    ['parola importante'], ['<div', '<span']);

prova('un h1 nel corpo diventa h2',
    '<h1>Titolo incollato</h1>',
    ['<h2>Titolo incollato</h2>'], ['<h1']);

prova('la formattazione normale passa intera',
    '<p><strong>grassetto</strong>, <em>corsivo</em>, <code>codice</code></p><ul><li>uno</li></ul><hr>',
    ['<strong>grassetto</strong>', '<em>corsivo</em>', '<code>codice</code>', '<li>uno</li>', '<hr>'], []);

prova('un link normale resta intero',
    '<p>vedi <a href="/web/qualcosa" title="Il titolo">questo</a></p>',
    ['href="/web/qualcosa"', 'title="Il titolo"', 'questo'], []);

prova('un link che si apre altrove prende rel=noopener',
    '<a href="https://esempio.it" target="_blank">fuori</a>',
    ['rel="noopener noreferrer"'], []);

echo "\nI video\n";

prova('un iframe YouTube senza cookie passa',
    '<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe>',
    ['youtube-nocookie.com/embed/dQw4w9WgXcQ', 'allowfullscreen'], []);

prova('un iframe verso qualunque altro posto sparisce',
    '<iframe src="https://cattivi.example/pagina"></iframe><p>resta</p>',
    ['resta'], ['<iframe', 'cattivi.example']);

echo "\nLe tabelle (dieci articoli ne hanno)\n";

prova('una tabella passa e viene avvolta perché possa scorrere',
    '<table><thead><tr><th scope="col">Voce</th></tr></thead><tbody><tr><td colspan="2">Dato</td></tr></tbody></table>',
    ['<div class="tabella">', '<table>', 'scope="col"', 'colspan="2"', 'Dato'], []);

echo "\nGli accenti\n";

prova('le lettere accentate non si rovinano',
    '<p>perché è così, però.</p>',
    ['perché è così, però.'], ['Ã']);

echo "\n" . ($fallite === 0
    ? "Tutte e $passate le prove passano.\n\n"
    : "$passate passate, $fallite FALLITE.\n\n");

exit($fallite === 0 ? 0 : 1);

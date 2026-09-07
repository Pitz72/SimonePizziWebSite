<?php
/**
 * La ripulitura dell'HTML degli articoli, prima di stamparlo.
 *
 * PERCHÉ ESISTE. Fino alla v1.27.0 il corpo dell'articolo servito ai crawler
 * passava da `strip_tags($contenuto, '<p><br><h2>…')` (public/index.php:553).
 * `strip_tags` toglie i tag che non sono nella lista ma **non guarda gli
 * attributi**: un `<a href="javascript:…">` o un `<p onmouseover="…">` scritti
 * nell'editor arrivavano al lettore interi. Nel resto del sito la ripulitura
 * la faceva DOMPurify nel browser, cioè dalla parte sbagliata del filo.
 *
 * Qui si fa una volta sola, sul server, con un parser vero: si attraversa
 * l'albero del documento e si tiene solo quello che è in lista — tag,
 * attributi e schemi degli URL. Un parser non ha i punti ciechi delle
 * espressioni regolari: decodifica le entità da sé, quindi `&#106;avascript:`
 * non passa più di `javascript:`.
 *
 * Arriva da FDCA-PHP/public/lib/helpers.php:804, dove è in produzione dalla
 * v1.14.0. Le differenze sono due, e sono di questo sito: le tabelle (dieci
 * articoli le usano davvero) e gli `h1` finiti per sbaglio dentro il corpo,
 * che diventano `h2` invece di essere sciolti in testo semplice.
 */

declare(strict_types=1);

/**
 * L'elenco di ciò che sopravvive: tag => attributi ammessi.
 *
 * Ha una gemella nell'editor del pannello. Se si tocca qui si tocca anche là:
 * altrimenti l'autore scrive qualcosa che il sito butta via senza dirglielo.
 */
const HTML_AMMESSO = [
    'p' => [], 'br' => [], 'hr' => [],
    'b' => [], 'strong' => [], 'i' => [], 'em' => [], 'u' => [], 's' => [], 'del' => [],
    'ul' => [], 'ol' => [], 'li' => [],
    'h2' => [], 'h3' => [], 'h4' => [],
    'blockquote' => ['cite'], 'pre' => [], 'code' => [],
    'figure' => ['class'], 'figcaption' => [],
    'a'   => ['href', 'title', 'target', 'rel'],
    'img' => ['src', 'alt', 'title', 'width', 'height', 'loading'],
    'iframe' => ['src', 'title', 'allow', 'allowfullscreen', 'loading'],
    // Tabelle: dieci articoli ne contengono, con intestazioni e celle unite.
    'table' => [], 'thead' => [], 'tbody' => [], 'tfoot' => [], 'tr' => [],
    'th' => ['colspan', 'rowspan', 'scope'], 'td' => ['colspan', 'rowspan'],
];

/** Tag di cui si butta anche il contenuto, non solo l'involucro. */
const HTML_DA_BUTTARE = ['script', 'style', 'object', 'embed', 'form', 'svg', 'iframe'];

function safe_html(?string $html): string {
    $html = trim((string)$html);
    if ($html === '') return '';

    $doc = new DOMDocument();
    $prima = libxml_use_internal_errors(true);
    // Senza la dichiarazione di codifica DOMDocument legge il testo come Latin-1
    // e gli accenti diventano scarabocchi.
    $ok = $doc->loadHTML(
        '<?xml encoding="UTF-8"?><div id="sp-radice">' . $html . '</div>',
        LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET
    );
    libxml_clear_errors();
    libxml_use_internal_errors($prima);

    // Se non si riesce nemmeno a leggerlo, si mostra come testo: brutto, ma innocuo.
    if (!$ok) return htmlspecialchars($html, ENT_QUOTES, 'UTF-8');

    $radice = $doc->getElementById('sp-radice') ?: $doc->documentElement;
    if (!$radice) return '';

    scendi($radice, $doc);

    $fuori = '';
    foreach ($radice->childNodes as $n) $fuori .= $doc->saveHTML($n);
    return $fuori;
}

/**
 * Un URL passa solo se è relativo o se ha uno schema che abbiamo deciso noi.
 * Gli spazi e i caratteri di controllo si tolgono prima di guardare lo schema,
 * altrimenti "java\nscript:" sfugge al confronto.
 */
function url_ammesso(string $url): ?string {
    $u = trim((string)preg_replace('/[\x00-\x20]/', '', $url));
    if ($u === '') return null;
    if (preg_match('#^(?:https?:|mailto:|tel:)#i', $u)) return $u;
    if (str_starts_with($u, '/') || str_starts_with($u, '#') || str_starts_with($u, '?')) return $u;
    if (preg_match('#^data:image/(png|jpeg|gif|webp);base64,[a-z0-9+/=]+$#i', $u)) return $u;
    return null;   // javascript:, vbscript:, data:text/html e tutto il resto
}

/**
 * Si scende fino in fondo e si risale: togliere un nodo mentre lo si attraversa
 * dall'alto farebbe saltare i fratelli che vengono dopo.
 */
function scendi(DOMNode $nodo, DOMDocument $doc): void {
    foreach (iterator_to_array($nodo->childNodes) as $figlio) {
        if ($figlio instanceof DOMText) continue;

        if (!$figlio instanceof DOMElement) {      // commenti, istruzioni di elaborazione
            $figlio->parentNode?->removeChild($figlio);
            continue;
        }

        scendi($figlio, $doc);
        $tag = strtolower($figlio->tagName);

        // Un h1 dentro il corpo è quasi sempre un titolo incollato da fuori:
        // l'h1 della pagina è il titolo dell'articolo, e due fanno a pugni.
        // Diventa h2, così resta un titolo invece di sciogliersi in un paragrafo.
        if ($tag === 'h1') {
            $nuovo = $doc->createElement('h2');
            while ($figlio->firstChild) $nuovo->appendChild($figlio->firstChild);
            $figlio->parentNode?->replaceChild($nuovo, $figlio);
            continue;
        }

        if (!isset(HTML_AMMESSO[$tag])) {
            if (in_array($tag, HTML_DA_BUTTARE, true)) {
                $figlio->parentNode?->removeChild($figlio);
                continue;
            }
            // Tag non ammesso ma innocuo (span, div, font…): si butta
            // l'involucro e si tiene il testo che conteneva.
            while ($figlio->firstChild) {
                $figlio->parentNode?->insertBefore($figlio->firstChild, $figlio);
            }
            $figlio->parentNode?->removeChild($figlio);
            continue;
        }

        foreach (iterator_to_array($figlio->attributes) as $attr) {
            $nome = strtolower($attr->name);
            if (!in_array($nome, HTML_AMMESSO[$tag], true)) {
                $figlio->removeAttribute($attr->name);      // qui muoiono tutti gli on*
                continue;
            }
            if ($nome === 'href' || $nome === 'src') {
                $pulito = url_ammesso($attr->value);
                if ($pulito === null) $figlio->removeAttribute($attr->name);
                else $figlio->setAttribute($nome, $pulito);
            }
        }

        rifiniture($figlio, $tag, $doc);
    }
}

/** Le poche cose che si aggiungono invece di toglierle. */
function rifiniture(DOMElement $el, string $tag, DOMDocument $doc): void {
    // Un link che si apre altrove non deve poter toccare la finestra di partenza.
    if ($tag === 'a' && $el->getAttribute('target') !== '') {
        $el->setAttribute('rel', 'noopener noreferrer');
    }

    // Le immagini del corpo si caricano quando servono, non tutte subito.
    if ($tag === 'img') {
        if ($el->getAttribute('src') === '') { $el->parentNode?->removeChild($el); return; }
        $el->setAttribute('loading', 'lazy');
        if ($el->getAttribute('alt') === '') $el->setAttribute('alt', '');
    }

    // L'iframe passa per una cosa sola: un video YouTube senza cookie.
    // Qualunque altro src — o nessuno — fa sparire l'elemento intero.
    if ($tag === 'iframe') {
        $src = $el->getAttribute('src');
        if (!preg_match('#^https://www\.youtube-nocookie\.com/embed/[A-Za-z0-9_-]{11}(?:[?\#].*)?$#', $src)) {
            $el->parentNode?->removeChild($el);
            return;
        }
        $el->setAttribute('loading', 'lazy');
        $el->setAttribute('allowfullscreen', '');
        if ($el->getAttribute('title') === '') $el->setAttribute('title', 'Video YouTube');
    }

    // Sulla figura l'unica classe che vuol dire qualcosa è "video".
    if ($tag === 'figure') {
        if ($el->getElementsByTagName('iframe')->length > 0) $el->setAttribute('class', 'video');
        else $el->removeAttribute('class');
    }

    // Una tabella larga su un telefono sfonda la pagina. L'autore non può
    // saperlo mentre scrive: la si avvolge qui in un contenitore che scorre
    // per conto suo, così il corpo della pagina non scorre mai in orizzontale.
    if ($tag === 'table' && !($el->parentNode instanceof DOMElement
        && $el->parentNode->getAttribute('class') === 'tabella')) {
        $scatola = $doc->createElement('div');
        $scatola->setAttribute('class', 'tabella');
        $el->parentNode?->replaceChild($scatola, $el);
        $scatola->appendChild($el);
    }
}

/**
 * Testo semplice ricavato dall'HTML, per le description e i JSON-LD.
 * Passa prima dalla ripulitura, così quello che sta dentro un tag buttato non
 * finisce nella descrizione, e mette uno spazio ai bordi dei blocchi: senza,
 * «<h2>Titolo</h2><p>Testo» diventerebbe «TitoloTesto».
 */
function testo_da_html(?string $html, int $lunghezza = 160): string {
    $s = safe_html($html);
    $s = (string)preg_replace('#</?(p|div|h[1-6]|li|br|tr|figure|figcaption|blockquote|pre|hr)\b[^>]*>#i', ' ', $s);
    $s = html_entity_decode(strip_tags($s), ENT_QUOTES, 'UTF-8');
    return tronca($s, $lunghezza);
}

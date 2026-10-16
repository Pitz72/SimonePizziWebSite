<?php
/**
 * I video di YouTube, caricati solo quando il lettore li avvia.
 *
 * Revisione del 16 ottobre 2026, M12. safe_html() lascia passare un iframe
 * solo se viene da youtube-nocookie.com. «Senza cookie» però non vuol dire
 * «senza Google»: l'iframe si caricava appena arrivava sullo schermo, e già
 * quella richiesta mandava a Google l'indirizzo IP del lettore, senza che
 * l'informativa lo dicesse. È lo stesso motivo per cui i caratteri del sito
 * sono stati portati in casa.
 *
 * Adesso al posto dell'iframe c'è un riquadro: il titolo del video, una riga
 * che dice che cosa succede, il pulsante «Avvia il video» e il link per
 * guardarlo su YouTube. L'iframe nasce solo al clic (assets/js/video.js), e
 * senza JavaScript resta il link. Nessuna anteprima: anche l'immagine di
 * copertina del video verrebbe da un server di Google.
 */

declare(strict_types=1);

const VIDEO_EMBED = '#^https://www\.youtube-nocookie\.com/embed/([A-Za-z0-9_-]{11})#';

/** Il corpo di un articolo (già passato da safe_html) con i video al clic. */
function video_al_clic(string $html): string {
    if (stripos($html, '<iframe') === false) return $html;

    $doc = new DOMDocument();
    $prima = libxml_use_internal_errors(true);
    $ok = $doc->loadHTML('<?xml encoding="UTF-8"?><div id="sp-video">' . $html . '</div>',
        LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET);
    libxml_clear_errors();
    libxml_use_internal_errors($prima);
    $radice = $ok ? $doc->getElementById('sp-video') : null;
    if (!$radice) return $html;

    foreach (iterator_to_array($doc->getElementsByTagName('iframe')) as $iframe) {
        /** @var DOMElement $iframe */
        if (!preg_match(VIDEO_EMBED, $iframe->getAttribute('src'), $m)) continue;
        $id = $m[1];
        $titolo = trim($iframe->getAttribute('title')) ?: 'Video YouTube';

        $riquadro = $doc->createElement('div');
        $riquadro->setAttribute('class', 'video-attesa');
        $riquadro->setAttribute('data-video', 'https://www.youtube-nocookie.com/embed/' . $id);
        $riquadro->setAttribute('data-titolo', $titolo);

        $t = $doc->createElement('p');
        $t->setAttribute('class', 'video-titolo');
        $t->appendChild($doc->createTextNode($titolo));
        $riquadro->appendChild($t);

        $nota = $doc->createElement('p');
        $nota->setAttribute('class', 'video-nota');
        $nota->appendChild($doc->createTextNode(
            'Il video sta su YouTube e si carica solo se lo avvii: da quel momento YouTube (Google) riceve il tuo indirizzo IP.'));
        $riquadro->appendChild($nota);

        $comandi = $doc->createElement('p');
        $comandi->setAttribute('class', 'video-comandi');
        $avvia = $doc->createElement('button');
        $avvia->setAttribute('type', 'button');
        $avvia->setAttribute('class', 'btn btn-pieno video-avvia');
        $avvia->appendChild($doc->createTextNode('Avvia il video'));
        $comandi->appendChild($avvia);
        $fuori = $doc->createElement('a');
        $fuori->setAttribute('href', 'https://www.youtube.com/watch?v=' . $id);
        $fuori->setAttribute('target', '_blank');
        $fuori->setAttribute('rel', 'noopener noreferrer');
        $fuori->setAttribute('class', 'video-fuori');
        $fuori->appendChild($doc->createTextNode('Guardalo su YouTube ↗'));
        $comandi->appendChild($fuori);
        $riquadro->appendChild($comandi);

        /* Il riquadro vive dentro una figure.video, che gli dà le proporzioni
           16:9 (main.css). Gli articoli più vecchi hanno l'iframe nudo nel
           testo: lì la figura si crea, altrimenti il riquadro, posizionato in
           assoluto, coprirebbe l'articolo. */
        $genitore = $iframe->parentNode;
        if ($genitore instanceof DOMElement && $genitore->nodeName === 'figure'
            && $genitore->getAttribute('class') === 'video') {
            $genitore->replaceChild($riquadro, $iframe);
        } else {
            $figura = $doc->createElement('figure');
            $figura->setAttribute('class', 'video');
            $genitore?->replaceChild($figura, $iframe);
            $figura->appendChild($riquadro);
        }
    }

    $fuori = '';
    foreach ($radice->childNodes as $n) $fuori .= $doc->saveHTML($n);
    return $fuori;
}

/**
 * Per il feed RSS: al posto dell'iframe, un link al video. I lettori di feed
 * gli iframe li buttano via quasi tutti, e quelli che li tengono li caricano
 * senza chiedere niente a nessuno.
 */
function video_come_link(string $html): string {
    return (string)preg_replace_callback(
        '#<iframe\b[^>]*\bsrc="https://www\.youtube-nocookie\.com/embed/([A-Za-z0-9_-]{11})[^"]*"[^>]*>\s*</iframe>#i',
        static fn(array $m): string => '<p><a href="https://www.youtube.com/watch?v=' . $m[1] . '">Guarda il video su YouTube</a></p>',
        $html
    );
}

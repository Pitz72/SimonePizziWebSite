<?php
/**
 * Il sommario di un articolo, ricavato dal corpo.
 *
 * I titoli dentro l'articolo non hanno un id: li scrive Simone nell'editor,
 * non un generatore. Qui glielo si mette, uno per titolo, e si restituisce
 * insieme l'elenco delle voci. Così il sommario a lato e le ancore del corpo
 * nascono dallo stesso passaggio e non possono divergere.
 *
 * Gira DOPO safe_html(): il corpo che arriva qui è già ripulito, e questo
 * lavora su un albero, non su espressioni regolari.
 */

declare(strict_types=1);

/**
 * Gli id che la pagina dell'articolo usa già (partials/, pages/articolo.php).
 * Un titolo «Sommario» diventava id="sommario", come il riquadro del sommario:
 * due elementi con lo stesso id, e il link del sommario portava a quello
 * sbagliato (revisione del 16 ottobre, L7). Un titolo così prende un numero,
 * come due titoli uguali. Gli id degli altri titoli non cambiano: i link già
 * condivisi verso una sezione restano buoni.
 */
const ID_DELLA_PAGINA = [
    'contenuto', 'sommario', 'titolo-sommario', 'reazioni',
    'modulo-newsletter', 'email-newsletter', 'consenso-newsletter', 'esito-newsletter',
    'finestra-cerca', 'titolo-cerca', 'campo-cerca', 'stato-cerca', 'esiti-cerca',
    'finestra-condividi', 'titolo-condividi', 'indirizzo-pagina', 'copia-indirizzo', 'esito-condividi',
    'finestra-scrivi', 'titolo-scrivi',
];

/**
 * @return array{voci: list<array{id:string,testo:string,livello:int}>, corpo: string}
 */
function sommario_e_corpo(string $html): array {
    $html = trim($html);
    if ($html === '') return ['voci' => [], 'corpo' => ''];

    $doc = new DOMDocument();
    $prima = libxml_use_internal_errors(true);
    $ok = $doc->loadHTML('<?xml encoding="UTF-8"?><div id="sp-corpo">' . $html . '</div>',
        LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NONET);
    libxml_clear_errors();
    libxml_use_internal_errors($prima);
    if (!$ok) return ['voci' => [], 'corpo' => $html];

    $radice = $doc->getElementById('sp-corpo');
    if (!$radice) return ['voci' => [], 'corpo' => $html];

    $voci = [];
    $usati = array_fill_keys(ID_DELLA_PAGINA, 1);

    foreach (['h2', 'h3'] as $tag) {
        foreach (iterator_to_array($doc->getElementsByTagName($tag)) as $titolo) {
            /** @var DOMElement $titolo */
            $testo = trim((string)$titolo->textContent);
            if ($testo === '') continue;

            $id = slug($testo);
            if ($id === '') $id = 'sezione';
            // Due titoli uguali nello stesso articolo esistono: il secondo
            // prende un numero, altrimenti il link porterebbe sempre al primo.
            if (isset($usati[$id])) { $usati[$id]++; $id .= '-' . $usati[$id]; }
            else $usati[$id] = 1;

            $titolo->setAttribute('id', $id);
            $voci[] = ['id' => $id, 'testo' => $testo, 'livello' => (int)substr($tag, 1),
                       'ordine' => posizione_nel_documento($titolo)];
        }
    }

    // getElementsByTagName restituisce prima tutti gli h2 e poi tutti gli h3:
    // il sommario deve seguire l'ordine di lettura, non quello dei tag.
    usort($voci, fn($a, $b) => $a['ordine'] <=> $b['ordine']);
    foreach ($voci as &$v) unset($v['ordine']);
    unset($v);

    $fuori = '';
    foreach ($radice->childNodes as $n) $fuori .= $doc->saveHTML($n);

    return ['voci' => $voci, 'corpo' => $fuori];
}

/** Quanti nodi vengono prima di questo: serve solo a rimettere le voci in fila. */
function posizione_nel_documento(DOMNode $nodo): int {
    $n = 0;
    $percorso = new DOMXPath($nodo->ownerDocument);
    foreach ($percorso->query('//*') as $altro) {
        if ($altro === $nodo) return $n;
        $n++;
    }
    return PHP_INT_MAX;
}

<?php
/**
 * I blocchi che ricorrono in più pagine.
 *
 * Sono funzioni e non file da includere, per una ragione imparata a spese
 * nostre: un file incluso condivide lo scope di chi lo include, e il foreach
 * della barra si era già portato via i conteggi della home. Una funzione ha i
 * suoi parametri e non tocca niente di fuori.
 */

declare(strict_types=1);

/**
 * L'etichetta di stato.
 *
 * Il dato vive in projects.stato e oggi in produzione non c'è ancora: la
 * colonna arriva con la migrazione pigra descritta in DECISIONI.md §9. Finché
 * è vuota l'etichetta non si stampa — meglio niente che un'etichetta finta,
 * che è esattamente il difetto che questa direzione voleva togliere.
 */
function blocco_stato(?string $stato): string {
    static $nomi = [
        'in_corso'    => ['In corso',    'stato-in-corso'],
        'open_source' => ['Open source', ''],
        'pubblicato'  => ['Pubblicato',  'stato-pubblicato'],
        'archiviato'  => ['Archiviato',  'stato-archiviato'],
    ];
    $s = trim((string)$stato);
    if ($s === '' || !isset($nomi[$s])) return '';
    [$testo, $classe] = $nomi[$s];
    return '<span class="stato ' . $classe . '">' . e($testo) . '</span>';
}

/** La scheda grande dell'articolo in apertura di una pagina. */
function blocco_primo(array $a, string $nomeCategoria): void {
    $quando = $a['published_at'] ?: $a['created_at'];
    $copertina = url_immagine($a['cover_image'] ?? '');
    ?>
    <a class="primo" href="<?= e(url_articolo($a)) ?>">
      <?php if ($copertina !== ''): ?>
        <div class="primo-figura"><img src="<?= e($copertina) ?>" alt="" loading="lazy"></div>
      <?php endif; ?>
      <div class="primo-testo">
        <div class="riga-etichette">
          <span class="eti spento"><?= e($nomeCategoria) ?> · <?= e(data_lunga($quando)) ?></span>
        </div>
        <h3><?= e($a['title']) ?></h3>
        <p><?= e(estratto($a, 190)) ?></p>
        <div class="riga-etichette">
          <span class="eti spento"><?= minuti_lettura($a['excerpt'] . ' ' . ($a['content'] ?? '')) ?> min di lettura</span>
        </div>
      </div>
    </a>
    <?php
}

/**
 * Una riga dell'elenco. `$mostraCategoria` è falso dentro un archivio di
 * categoria, dove ripetere la stessa parola su ogni riga non dice niente.
 */
function blocco_riga(array $a, bool $mostraCategoria = true, string $nomeCategoria = ''): void {
    $quando = $a['published_at'] ?: $a['created_at'];
    $copertina = url_immagine($a['cover_image'] ?? '');
    ?>
    <li>
      <a class="lavorazione" href="<?= e(url_articolo($a)) ?>">
        <div>
          <h3><?= e($a['title']) ?></h3>
          <?php if (!empty($a['excerpt'])): ?>
            <p><?= e(tronca($a['excerpt'], 170)) ?></p>
          <?php endif; ?>
        </div>
        <div class="lavorazione-lato">
          <?php if ($mostraCategoria && $nomeCategoria !== ''): ?>
            <span class="eti"><?= e($nomeCategoria) ?></span>
          <?php endif; ?>
          <time class="eti" datetime="<?= e(data_iso($quando)) ?>"><?= e(data_breve($quando)) ?></time>
        </div>
        <div class="lavorazione-figura">
          <?php if ($copertina !== ''): ?><img src="<?= e($copertina) ?>" alt="" loading="lazy"><?php endif; ?>
        </div>
      </a>
    </li>
    <?php
}

/**
 * I due pulsanti di un articolo: quelli che il vecchio sito mostrava in fondo al
 * testo (un link principale e uno secondario, spesso un file da scaricare).
 * Un link senza schema diventa un indirizzo del sito, o https per un dominio:
 * il vecchio sito lo rendeva sempre https://, e i percorsi come /contatti si rompevano.
 */
function pulsante_articolo(string $url, string $etichetta, string $predefinita): ?array {
    $url = trim($url);
    if ($url === '' || $url === '#') { return null; }
    if (!preg_match('#^(https?://|mailto:|/)#i', $url)) {
        $url = preg_match('#^[a-z0-9.-]+\.[a-z]{2,}(/|$)#i', $url) ? 'https://' . $url : '/' . ltrim($url, '/');
    }
    $esterno = preg_match('#^https?://#i', $url) && !str_starts_with($url, SITO_URL);
    return [
        'url'     => $url,
        'testo'   => trim($etichetta) !== '' ? trim($etichetta) : $predefinita,
        'esterno' => $esterno,
        'file'    => (bool)preg_match('#(download\.php|\.(pdf|zip|epub|docx?|odt)(\?|$)|^/downloads/)#i', $url),
    ];
}

/** Il blocco dei pulsanti in fondo al testo dell'articolo. Non stampa niente se non ce ne sono. */
function blocco_pulsanti_articolo(array $a, bool $conta = true): void {
    $primo   = pulsante_articolo((string)($a['button_a_link'] ?? ''), (string)($a['button_a_label'] ?? ''), 'Naviga');
    $secondo = pulsante_articolo((string)($a['button_b_link'] ?? ''), (string)($a['button_b_label'] ?? ''), 'File aggiuntivo');
    if (!$primo && !$secondo) { return; }
    $voci = [];
    if ($primo)   { $voci[] = ['p' => $primo,   'cosa' => 'primo',   'classe' => 'btn btn-pieno']; }
    if ($secondo) { $voci[] = ['p' => $secondo, 'cosa' => 'secondo', 'classe' => 'btn btn-muto']; }
    ?>
    <div class="pulsanti-articolo" data-conta="<?= $conta ? (int)$a['id'] : 0 ?>">
      <?php foreach ($voci as $v): $p = $v['p']; ?>
        <a class="<?= e($v['classe']) ?>" href="<?= e($p['url']) ?>" data-clic="<?= e($p['testo']) ?>"
           <?= $p['esterno'] ? 'target="_blank" rel="noopener"' : '' ?><?= $p['file'] ? ' download' : '' ?>><?= e($p['testo']) ?></a>
      <?php endforeach; ?>
    </div>
    <?php
}

/** Il modulo della newsletter: l'email, e il consenso da spuntare (mai precompilato). */
function blocco_newsletter(): void {
    require_once __DIR__ . '/../lib/consenso.php';
    ?>
    <section class="lettera">
      <div class="gab lettera-dentro">
        <div>
          <h2>Ogni tanto scrivo una lettera</h2>
          <p>Nessuna cadenza fissa, nessun riassunto automatico: parte solo quando ho qualcosa
             da raccontare. In fondo a ognuna c'è il link per uscire.</p>
        </div>
        <div>
          <form class="campo-unito" id="modulo-newsletter" method="post" action="/api/subscribers.php">
            <label class="solo-lettori-schermo" for="email-newsletter">La tua email</label>
            <input id="email-newsletter" name="email" type="email" required
                   placeholder="la-tua@email.it" autocomplete="email">
            <button type="submit">Iscriviti</button>
          </form>
          <label class="consenso-newsletter">
            <input id="consenso-newsletter" name="consenso" type="checkbox" value="1" required>
            <span><?= e(NEWSLETTER_CONSENSO_TESTO) ?> <a href="/privacy">Leggi l’informativa</a>.</span>
          </label>
          <p class="esito" id="esito-newsletter" role="status" aria-live="polite"></p>
        </div>
      </div>
    </section>
    <?php
}

/** «Entriamo in contatto»: il sostegno, i social e il modulo dei contatti. Com'era nella home del sito React. */
function blocco_contatto(): void {
    ?>
    <section class="contatto">
      <div class="gab">
        <h2>Entriamo in contatto</h2>
        <p>Sostieni il mio lavoro, resta aggiornato sulle ultime uscite o connettiamoci sui social per scambiare due chiacchiere.</p>
        <div class="btn-fila">
          <a class="btn btn-pieno" href="https://www.paypal.com/paypalme/runtimeradio" target="_blank" rel="noopener">Sostieni il lavoro</a>
          <a class="btn btn-muto" href="https://github.com/Pitz72" target="_blank" rel="noopener">GitHub</a>
          <a class="btn btn-muto" href="https://t.me/simonepizzi72" target="_blank" rel="noopener">Telegram</a>
          <a class="btn btn-muto" href="https://www.facebook.com/simonepizzi72" target="_blank" rel="noopener">Facebook</a>
          <a class="btn btn-muto" href="https://www.instagram.com/pizzisimone1972/" target="_blank" rel="noopener">Instagram</a>
          <a class="btn btn-muto" href="/contatti">Scrivimi</a>
        </div>
      </div>
    </section>
    <?php
}

/**
 * Le tre finestre: ricerca, condivisione, scrivi a Simone.
 *
 * Sono elementi <dialog>: il fuoco della tastiera, la chiusura con Esc e lo
 * sfondo li gestisce il browser. Riscriverli a mano vorrebbe dire rifare peggio
 * una cosa che c'è già.
 */
function blocco_finestre(bool $conCondivisione = false): void {
    ?>
    <dialog class="finestra" id="finestra-cerca" aria-labelledby="titolo-cerca">
      <div class="finestra-cima">
        <h2 id="titolo-cerca">Cerca nel sito</h2>
        <button class="finestra-chiudi" type="button" data-chiudi>Esc</button>
      </div>
      <div class="finestra-corpo">
        <label class="solo-lettori-schermo" for="campo-cerca">Che cosa cerchi</label>
        <!-- autofocus: showModal() lo rispetta, e senza il fuoco finirebbe sul
             primo elemento della finestra — il pulsante «Esc» — così chi apre
             la ricerca e comincia a scrivere digita nel vuoto. -->
        <input class="campo-testo" id="campo-cerca" type="search" autocomplete="off" autofocus
               placeholder="Titolo, parola nel testo, tag…">
        <p class="esito" id="stato-cerca" role="status" aria-live="polite"></p>
        <ul class="esiti" id="esiti-cerca"></ul>
      </div>
    </dialog>

    <?php if ($conCondivisione): ?>
    <dialog class="finestra" id="finestra-condividi" aria-labelledby="titolo-condividi">
      <div class="finestra-cima">
        <h2 id="titolo-condividi">Condividi</h2>
        <button class="finestra-chiudi" type="button" data-chiudi>Esc</button>
      </div>
      <div class="finestra-corpo">
        <p class="spento" style="margin-top:0">L'indirizzo di questa pagina:</p>
        <input class="campo-testo" id="indirizzo-pagina" readonly value="">
        <div class="btn-fila" style="margin-top:16px">
          <button class="btn btn-pieno" type="button" id="copia-indirizzo">Copia il link</button>
          <a class="btn btn-muto" id="condividi-telegram" href="#" target="_blank" rel="noopener">Telegram</a>
          <a class="btn btn-muto" id="condividi-email" href="#">Email</a>
        </div>
        <p class="esito" id="esito-condividi" role="status" aria-live="polite"></p>
      </div>
    </dialog>

    <dialog class="finestra" id="finestra-scrivi" aria-labelledby="titolo-scrivi">
      <div class="finestra-cima">
        <h2 id="titolo-scrivi">Scrivi a Simone</h2>
        <button class="finestra-chiudi" type="button" data-chiudi>Esc</button>
      </div>
      <div class="finestra-corpo">
        <p class="spento" style="margin-top:0">
          Segnalazioni, correzioni, o solo per dire che una cosa non funziona:
          quest'ultima è la più utile di tutte.
        </p>
        <div class="btn-fila">
          <a class="btn btn-pieno" href="/contatti">Vai al modulo</a>
        </div>
      </div>
    </dialog>
    <?php endif; ?>
    <?php
}

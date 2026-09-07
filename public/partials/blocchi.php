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

/** La scheda di un progetto, con i due comandi sempre in fondo. */
function blocco_progetto(array $p): void {
    $copertina = url_immagine($p['cover_image'] ?? '');
    $etichetta = blocco_stato($p['stato'] ?? null);
    ?>
    <li class="pezzo">
      <?php if ($copertina !== ''): ?>
        <div class="pezzo-figura"><img src="<?= e($copertina) ?>" alt="" loading="lazy"></div>
      <?php endif; ?>
      <div class="pezzo-corpo">
        <div class="riga-etichette">
          <?= $etichetta ?>
          <span class="eti spento"><?= e($p['category']) ?></span>
        </div>
        <h3><?= e($p['name']) ?></h3>
        <p><?= e(tronca($p['description'], 200)) ?></p>
        <?php
        // Un pulsante senza indirizzo è un pulsante rotto: si stampa solo
        // quello che porta davvero da qualche parte.
        $a_ok = trim((string)$p['button_a_label']) !== '' && trim((string)$p['button_a_url']) !== '';
        $b_ok = trim((string)$p['button_b_label']) !== '' && trim((string)$p['button_b_url']) !== '';
        if ($a_ok || $b_ok): ?>
          <div class="pezzo-comandi">
            <?php if ($a_ok): ?>
              <a class="btn btn-pieno" href="<?= e($p['button_a_url']) ?>"><?= e($p['button_a_label']) ?></a>
            <?php endif; ?>
            <?php if ($b_ok): ?>
              <a class="btn btn-muto" href="<?= e($p['button_b_url']) ?>"><?= e($p['button_b_label']) ?></a>
            <?php endif; ?>
          </div>
        <?php endif; ?>
      </div>
    </li>
    <?php
}

/** Il modulo della newsletter. */
function blocco_newsletter(): void {
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
          <p class="esito" id="esito-newsletter" role="status" aria-live="polite"></p>
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

<?php
/**
 * La barra. Le sei voci sono le categorie senza genitore, nell'ordine deciso
 * nel pannello: se Simone ne aggiunge una, compare qui senza toccare il codice.
 *
 * Una sezione che ha sottocategorie con qualcosa dentro porta anche una
 * tendina, come il sito aveva prima della migrazione: il nome resta un link
 * alla sezione — così ci si arriva in un click, che con la vecchia tendina
 * React non si poteva — e la freccia accanto apre l'elenco delle figlie.
 * L'elenco si apre anche col solo CSS, al passaggio del mouse e col
 * tabulatore: se il JavaScript non arriva, la tendina funziona comunque.
 *
 * La voce corrente porta aria-current="page", che è insieme il dato per un
 * lettore di schermo e l'aggancio del campo verde nel CSS: una cosa sola, non
 * una classe che dice quello che l'attributo già dice. Nella barra si accende
 * la SEZIONE (ROTTA_CATEGORIA), dentro la tendina la categoria esatta
 * (ROTTA_ESATTA): sono due domande diverse e vogliono due risposte diverse.
 *
 * Ma «page» vuol dire «questa È la pagina che stai leggendo», e di pagina ce
 * n'è una. Dentro /il-relitto-silente la voce «Videogiochi» va accesa, non
 * dichiarata corrente: prende «true», che il CSS illumina uguale e un lettore
 * di schermo annuncia per quello che è.
 *
 * I nomi delle variabili qui dentro sono lunghi di proposito: un partial viene
 * incluso NELLO STESSO scope della pagina che lo chiama, quindi un $c come
 * variabile di ciclo sovrascriverebbe il $c della pagina. È già successo: la
 * home ha stampato quattro warning perché questo foreach le portava via i
 * conteggi.
 */
$qui         = (string)($GLOBALS['ROTTA_CATEGORIA'] ?? '');
$qui_esatta  = (string)($GLOBALS['ROTTA_ESATTA'] ?? '');
$le_figlie   = sottocategorie_per_sezione();
?>
<header class="barra">
  <div class="gab barra-dentro">
    <a class="marchio" href="/">SIMONE PIZZI</a>

    <nav aria-label="Sezioni del sito">
      <ul class="menu">
        <?php foreach (categorie_radice() as $voce_menu):
          $sue_figlie = $le_figlie[(int)$voce_menu['id']] ?? []; ?>
          <li<?= $sue_figlie ? ' class="voce-con-tendina"' : '' ?>>
            <?php $dove = $qui_esatta === $voce_menu['slug'] ? 'page'
                        : ($qui === $voce_menu['slug'] ? 'true' : ''); ?>
            <a href="/<?= e($voce_menu['slug']) ?>"<?= $dove ? ' aria-current="' . $dove . '"' : '' ?>><?= e($voce_menu['name']) ?></a>

            <?php if ($sue_figlie): ?>
              <button class="tendina-apri" type="button" aria-expanded="false"
                      aria-controls="tendina-<?= e($voce_menu['slug']) ?>"
                      aria-label="Le sezioni di <?= e($voce_menu['name']) ?>">▾</button>

              <ul class="tendina" id="tendina-<?= e($voce_menu['slug']) ?>">
                <li><a href="/<?= e($voce_menu['slug']) ?>"<?= $qui_esatta === $voce_menu['slug'] ? ' aria-current="page"' : '' ?>>Tutti — <?= e($voce_menu['name']) ?></a></li>
                <?php foreach ($sue_figlie as $figlia): ?>
                  <li><a href="/<?= e($figlia['slug']) ?>"<?= $qui_esatta === $figlia['slug'] ? ' aria-current="page"' : '' ?>><?= e($figlia['name']) ?></a></li>
                <?php endforeach; ?>
              </ul>
            <?php endif; ?>
          </li>
        <?php endforeach; ?>
        <!-- Sul telefono «Tutti i progetti» esce dalla barra e rientra qui:
             nella barra stretta stava insieme a marchio, ricerca e menu, e
             andavano tutti a capo. -->
        <li class="solo-telefono"><a href="/tutti-i-progetti">Tutti i progetti</a></li>
      </ul>
    </nav>

    <div class="barra-strumenti">
      <button class="cerca-scorciatoia eti" type="button" data-apri="cerca" aria-label="Cerca nel sito">
        Cerca <kbd>Ctrl K</kbd>
      </button>
      <button class="btn apri-menu" type="button" data-apri="menu" aria-expanded="false">Menu</button>
      <a class="eti solo-schermo-largo" href="/tutti-i-progetti" style="color:var(--verde)">Tutti i progetti</a>
    </div>
  </div>
</header>

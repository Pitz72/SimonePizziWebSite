<?php
/**
 * La barra. Le sei voci sono le categorie senza genitore, nell'ordine deciso
 * nel pannello: se Simone ne aggiunge una, compare qui senza toccare il codice.
 *
 * La voce corrente porta aria-current="page", che è insieme il dato per un
 * lettore di schermo e l'aggancio del campo verde nel CSS: una cosa sola, non
 * una classe che dice quello che l'attributo già dice.
 *
 * I nomi delle variabili qui dentro sono lunghi di proposito: un partial viene
 * incluso NELLO STESSO scope della pagina che lo chiama, quindi un $c come
 * variabile di ciclo sovrascriverebbe il $c della pagina. È già successo: la
 * home ha stampato quattro warning perché questo foreach le portava via i
 * conteggi.
 */
$qui = (string)($GLOBALS['ROTTA_CATEGORIA'] ?? '');
?>
<header class="barra">
  <div class="gab barra-dentro">
    <a class="marchio" href="/">SIMONE PIZZI</a>

    <nav aria-label="Sezioni del sito">
      <ul class="menu">
        <?php foreach (categorie_radice() as $voce_menu): ?>
          <li><a href="/<?= e($voce_menu['slug']) ?>"<?= $qui === $voce_menu['slug'] ? ' aria-current="page"' : '' ?>><?= e($voce_menu['name']) ?></a></li>
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

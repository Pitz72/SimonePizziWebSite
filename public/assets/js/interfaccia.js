/* interfaccia.js — le poche cose che sul sito si muovono.
   Nessuna libreria: sono trenta righe, e una libreria costerebbe più del
   problema che risolve.
   Ricerca, reazioni, newsletter e sommario hanno file loro. */

(function () {
  'use strict';

  /* Il menu sul telefono. Lo stato sta su un attributo del contenitore, così
     il CSS lo legge senza che il JavaScript debba conoscere le classi. */
  var barra = document.querySelector('.barra');
  var pulsante = document.querySelector('[data-apri="menu"]');

  if (barra && pulsante) {
    pulsante.addEventListener('click', function () {
      var aperto = barra.getAttribute('data-menu') === 'aperto';
      barra.setAttribute('data-menu', aperto ? 'chiuso' : 'aperto');
      pulsante.setAttribute('aria-expanded', String(!aperto));
      pulsante.textContent = aperto ? 'Menu' : 'Chiudi';
    });

    // Chi apre il menu con la tastiera deve poterlo chiudere con la tastiera.
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && barra.getAttribute('data-menu') === 'aperto') {
        pulsante.click();
        pulsante.focus();
      }
    });
  }
})();

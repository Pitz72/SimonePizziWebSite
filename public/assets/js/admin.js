/* admin.js — le poche comodità del pannello che valgono una riga di JavaScript.
   Tutto il resto è HTML e POST: una schermata di lavoro deve funzionare anche
   quando qualcosa va storto. */

(function () {
  'use strict';

  /* Conferma prima di quello che non si può disfare. Il testo lo decide la
     pagina, così la domanda nomina la cosa: «Cancello Il Relitto Silente?» è
     un'altra domanda rispetto a «Sei sicuro?». */
  document.addEventListener('submit', function (ev) {
    var conferma = ev.target.getAttribute('data-conferma');
    if (conferma && !window.confirm(conferma)) ev.preventDefault();
  });

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-conferma-click]');
    if (b && !window.confirm(b.getAttribute('data-conferma-click'))) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  });

  /* I contatori dei campi che finiscono su Google: si vede mentre si scrive
     se il testo verrà tagliato. */
  document.querySelectorAll('[data-conta]').forEach(function (campo) {
    var uscita = document.getElementById(campo.getAttribute('data-conta'));
    var limite = parseInt(campo.getAttribute('data-limite'), 10) || 0;
    if (!uscita) return;

    function aggiorna() {
      var n = campo.value.length;
      uscita.textContent = n + (limite ? ' / ' + limite : '') + ' caratteri';
      uscita.setAttribute('data-oltre', limite && n > limite ? 'si' : 'no');
    }
    campo.addEventListener('input', aggiorna);
    aggiorna();
  });

  /* L'anteprima di come esce su Google, aggiornata mentre si scrive. */
  var anteprima = document.getElementById('anteprima-google');
  if (anteprima) {
    var fonti = {
      titolo: document.getElementById('campo-seo-title'),
      titoloRipiego: document.getElementById('campo-titolo'),
      descrizione: document.getElementById('campo-seo-description'),
      descrizioneRipiego: document.getElementById('campo-excerpt')
    };
    var mostra = {
      titolo: anteprima.querySelector('.g-titolo'),
      descrizione: anteprima.querySelector('.g-descrizione')
    };

    function dipingi() {
      var t = (fonti.titolo && fonti.titolo.value.trim()) ||
              ((fonti.titoloRipiego && fonti.titoloRipiego.value.trim()) || 'Titolo dell\u2019articolo') +
              ' \u2014 Simone Pizzi';
      var d = (fonti.descrizione && fonti.descrizione.value.trim()) ||
              (fonti.descrizioneRipiego && fonti.descrizioneRipiego.value.trim()) ||
              'Qui finisce il riassunto: se non lo scrivi, Google si arrangia da solo con le prime righe del testo.';
      mostra.titolo.textContent = t;
      mostra.descrizione.textContent = d;
    }
    Object.values(fonti).forEach(function (c) { if (c) c.addEventListener('input', dipingi); });
    dipingi();
  }

  /* Lo slug si scrive da solo finché nessuno lo tocca a mano: un articolo
     nuovo non deve costringere a inventarsi un indirizzo. */
  var titolo = document.getElementById('campo-titolo');
  var slug = document.getElementById('campo-slug');
  if (titolo && slug && slug.value.trim() === '') {
    var toccato = false;
    slug.addEventListener('input', function () { toccato = true; });
    titolo.addEventListener('input', function () {
      if (toccato) return;
      slug.value = titolo.value.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    });
  }

  /* Le azioni in blocco: il pulsante si accende solo quando c'è qualcosa da
     fare, e la casella in cima le seleziona tutte. */
  var tutte = document.getElementById('scegli-tutte');
  var caselle = Array.prototype.slice.call(document.querySelectorAll('input[name="scelti[]"]'));
  var azioni = document.getElementById('azioni-blocco');

  function contaScelti() {
    if (!azioni) return;
    var quanti = caselle.filter(function (c) { return c.checked; }).length;
    azioni.querySelectorAll('button, select').forEach(function (el) { el.disabled = quanti === 0; });
    var etichetta = azioni.querySelector('[data-quanti]');
    if (etichetta) {
      etichetta.textContent = quanti === 0 ? 'nessuno selezionato'
        : quanti === 1 ? 'uno selezionato' : quanti + ' selezionati';
    }
  }

  if (tutte) {
    tutte.addEventListener('change', function () {
      caselle.forEach(function (c) { c.checked = tutte.checked; });
      contaScelti();
    });
  }
  caselle.forEach(function (c) { c.addEventListener('change', contaScelti); });
  contaScelti();
})();

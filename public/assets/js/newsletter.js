/* newsletter.js — l'iscrizione senza ricaricare la pagina.
   Il modulo è un <form> vero con action e method: se il JavaScript non parte,
   o si rompe, l'invio funziona lo stesso per la via normale. Qui si aggiunge
   solo la comodità di restare dove si è. */

(function () {
  'use strict';

  var modulo = document.getElementById('modulo-newsletter');
  if (!modulo) return;

  var esito = document.getElementById('esito-newsletter');
  var campo = modulo.querySelector('input[type="email"]');
  var pulsante = modulo.querySelector('button');

  function scrivi(testo, tipo) {
    if (!esito) return;
    esito.textContent = testo;
    if (tipo) esito.setAttribute('data-tipo', tipo);
    else esito.removeAttribute('data-tipo');
  }

  modulo.addEventListener('submit', function (ev) {
    ev.preventDefault();

    var email = campo.value.trim();
    if (!email) return;

    pulsante.disabled = true;
    scrivi('Un momento…', null);

    fetch(modulo.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: email })
    })
      .then(function (r) { return r.json(); })
      .then(function (dati) {
        var ok = dati && (dati.status === 'success' || dati.status === 'already');
        var messaggio = (dati && dati.message)
          ? dati.message
          : 'Controlla la posta: c’è un link da confermare.';
        scrivi(messaggio, ok ? 'ok' : 'no');
        if (ok) modulo.reset();
      })
      .catch(function () {
        scrivi('Non sono riuscito a registrarti adesso. Riprova fra poco.', 'no');
      })
      .then(function () { pulsante.disabled = false; });
  });
})();

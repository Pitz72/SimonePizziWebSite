/* visite.js — conta le letture di un articolo e i clic sui suoi pulsanti.
   Ogni invio usa sendBeacon, il metodo che il browser tiene anche quando la
   pagina cambia: non rallenta la pagina e non aspetta risposta. Il conteggio vero,
   con la deduplica per giorno, lo fa api/analytics.php. Un'anteprima d'amministratore
   porta data-conta="0" e non conta nulla. */
(function () {
  'use strict';

  function invia(corpo) {
    var dati = JSON.stringify(corpo);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon('/api/analytics.php', new Blob([dati], { type: 'application/json' }))) return;
    } catch (e) { /* si ripiega sulla richiesta normale */ }
    fetch('/api/analytics.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: dati,
      keepalive: true
    }).catch(function () { /* un conteggio perso non è un errore per chi legge */ });
  }

  var lettura = document.getElementById('reazioni');
  var pulsanti = document.querySelector('.pulsanti-articolo');
  var origine = lettura || pulsanti;
  if (!origine) return;
  var articolo = parseInt(origine.getAttribute('data-conta'), 10);
  if (!articolo) return;

  if (lettura) invia({ type: 'view', article_id: articolo });

  document.addEventListener('click', function (ev) {
    var voce = ev.target.closest ? ev.target.closest('.pulsanti-articolo a[data-clic]') : null;
    if (!voce) return;
    invia({ type: 'click', article_id: articolo, button_label: voce.getAttribute('data-clic') });
  });
})();

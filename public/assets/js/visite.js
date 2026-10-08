/* visite.js — conta la lettura di un articolo.
   Una sola richiesta per pagina, col metodo che il browser usa per le uscite
   (sendBeacon): non rallenta la pagina e non aspetta risposta. Il conteggio vero,
   con la deduplica per giorno, lo fa api/analytics.php. */
(function () {
  'use strict';

  var pagina = document.getElementById('reazioni');
  if (!pagina) return;
  var articolo = parseInt(pagina.getAttribute('data-articolo'), 10);
  if (!articolo) return;

  var corpo = JSON.stringify({ type: 'view', article_id: articolo });
  try {
    if (navigator.sendBeacon && navigator.sendBeacon('/api/analytics.php', new Blob([corpo], { type: 'application/json' }))) return;
  } catch (e) { /* si ripiega sulla richiesta normale */ }
  fetch('/api/analytics.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: corpo,
    keepalive: true
  }).catch(function () { /* il conteggio perso non è un errore per chi legge */ });
})();

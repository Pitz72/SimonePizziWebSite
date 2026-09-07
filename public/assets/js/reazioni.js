/* reazioni.js — le cinque reazioni in fondo all'articolo, e la condivisione.
   Il conteggio arriva da /api/reactions.php; il click lo cambia subito e poi
   chiede al server. Se il server dice di no si torna indietro: meglio un
   numero che rimbalza di un numero che mente. */

(function () {
  'use strict';

  var fila = document.getElementById('reazioni');
  if (!fila) return;

  var idArticolo = parseInt(fila.getAttribute('data-articolo'), 10);
  if (!idArticolo) return;

  var pulsanti = {};
  fila.querySelectorAll('[data-reazione]').forEach(function (b) {
    pulsanti[b.getAttribute('data-reazione')] = b;
  });

  var mie = {};

  function scrivi(chiave, quante, attiva) {
    var b = pulsanti[chiave];
    if (!b) return;
    b.querySelector('b').textContent = quante > 0 ? String(quante) : '–';
    b.setAttribute('aria-pressed', attiva ? 'true' : 'false');
  }

  /* Il primo caricamento. Se non risponde — in sviluppo la tabella delle
     reazioni non c'è — i pulsanti restano com'erano: un trattino al posto del
     numero. Non è un errore da mostrare al lettore. */
  fetch('/api/reactions.php?article_id=' + idArticolo, { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (dati) {
      (dati.my_reactions || []).forEach(function (k) { mie[k] = true; });
      Object.keys(dati.counts || {}).forEach(function (k) {
        scrivi(k, dati.counts[k], !!mie[k]);
      });
    })
    .catch(function () { /* i contatori restano vuoti, la pagina funziona lo stesso */ });

  fila.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-reazione]');
    if (!b) return;

    var chiave = b.getAttribute('data-reazione');
    var contatore = b.querySelector('b');
    var prima = parseInt(contatore.textContent, 10) || 0;
    var eraMia = !!mie[chiave];

    // Si cambia subito, prima della risposta: il click deve sembrare istantaneo.
    var dopo = eraMia ? Math.max(0, prima - 1) : prima + 1;
    if (eraMia) delete mie[chiave]; else mie[chiave] = true;
    scrivi(chiave, dopo, !eraMia);
    b.disabled = true;

    fetch('/api/reactions.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ article_id: idArticolo, reaction: chiave })
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (dati) {
        // Il server ha l'ultima parola: se conosce il numero vero, si usa quello.
        if (dati && dati.counts && typeof dati.counts[chiave] === 'number') {
          scrivi(chiave, dati.counts[chiave], !!mie[chiave]);
        }
      })
      .catch(function () {
        if (eraMia) mie[chiave] = true; else delete mie[chiave];
        scrivi(chiave, prima, eraMia);
      })
      .then(function () { b.disabled = false; });
  });

  /* ── Condivisione ─────────────────────────────────────────────────────── */
  if (!document.getElementById('finestra-condividi')) return;

  var indirizzo = window.location.href.split('#')[0];
  var titolo = document.title;

  var campo = document.getElementById('indirizzo-pagina');
  if (campo) campo.value = indirizzo;

  var telegram = document.getElementById('condividi-telegram');
  if (telegram) {
    telegram.href = 'https://t.me/share/url?url=' + encodeURIComponent(indirizzo) +
                    '&text=' + encodeURIComponent(titolo);
  }

  var posta = document.getElementById('condividi-email');
  if (posta) {
    posta.href = 'mailto:?subject=' + encodeURIComponent(titolo) +
                 '&body=' + encodeURIComponent(indirizzo);
  }

  var copia = document.getElementById('copia-indirizzo');
  var esito = document.getElementById('esito-condividi');

  if (copia && esito) {
    copia.addEventListener('click', function () {
      function riuscito() {
        esito.textContent = 'Link copiato.';
        esito.setAttribute('data-tipo', 'ok');
      }
      function spiega() {
        // Alcuni browser rifiutano la scrittura negli appunti: allora si
        // seleziona il testo e si dice come si fa a mano.
        if (campo) { campo.focus(); campo.select(); }
        esito.textContent = 'Premi Ctrl+C per copiare.';
        esito.setAttribute('data-tipo', 'no');
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(indirizzo).then(riuscito, spiega);
      } else {
        spiega();
      }
    });
  }
})();

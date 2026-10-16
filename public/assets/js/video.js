/* video.js — il video di YouTube nasce solo quando il lettore lo avvia.
   Il riquadro lo scrive lib/video.php al posto dell'iframe; qui, al clic su
   «Avvia il video», si mette l'iframe vero, già in riproduzione. Prima del
   clic nessuna richiesta parte verso YouTube (revisione del 16 ottobre, M12).
   Senza JavaScript resta il link «Guardalo su YouTube». */

(function () {
  'use strict';

  document.addEventListener('click', function (ev) {
    var pulsante = ev.target.closest ? ev.target.closest('.video-avvia') : null;
    if (!pulsante) return;
    var riquadro = pulsante.closest('.video-attesa');
    if (!riquadro) return;

    var sorgente = riquadro.getAttribute('data-video') || '';
    // La stessa regola di safe_html(): solo il dominio senza cookie, solo un id.
    if (!/^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}$/.test(sorgente)) return;

    var iframe = document.createElement('iframe');
    iframe.src = sorgente + '?autoplay=1';
    iframe.title = riquadro.getAttribute('data-titolo') || 'Video YouTube';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    riquadro.parentNode.replaceChild(iframe, riquadro);
    iframe.focus();
  });
})();

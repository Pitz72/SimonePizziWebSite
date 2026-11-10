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

  /* I promo animati (lib/video.php, promo_al_clic): una pagina del sito in
     /promo/, che l'.htaccess serve in sandbox. Anche qui l'iframe nasce solo
     al clic, e in sandbox pure lui: niente stessa origine, quindi niente
     cookie del sito e niente accesso a questa pagina. Il promo pesa qualche
     megabyte: finché non è arrivato tutto, il riquadro resta davanti e dice
     che sta caricando; poi si toglie e il fuoco va al promo, che parte col
     suo pulsante o con la barra spaziatrice. */
  document.addEventListener('click', function (ev) {
    var pulsante = ev.target.closest ? ev.target.closest('.promo-avvia') : null;
    if (!pulsante) return;
    var riquadro = pulsante.closest('.video-attesa');
    if (!riquadro || riquadro.getAttribute('data-caricamento')) return;

    var sorgente = riquadro.getAttribute('data-promo') || '';
    // La stessa regola di lib/video.php: solo un file di /promo/.
    if (!/^\/promo\/[a-z0-9-]+\.html$/.test(sorgente)) return;

    riquadro.setAttribute('data-caricamento', '1');
    pulsante.disabled = true;
    var nota = riquadro.querySelector('.video-nota');
    if (nota) nota.textContent = 'Sto caricando il promo: ci vuole qualche secondo.';

    var iframe = document.createElement('iframe');
    iframe.title = riquadro.getAttribute('data-titolo') || 'Promo animato';
    iframe.setAttribute('sandbox', 'allow-scripts allow-popups allow-popups-to-escape-sandbox');
    iframe.setAttribute('allow', 'autoplay');
    // L'indirizzo va messo prima di inserire l'iframe: un iframe vuoto appena
    // inserito carica about:blank e manda subito «load», e il riquadro se ne
    // andrebbe prima del promo.
    iframe.src = sorgente;
    iframe.addEventListener('load', function () {
      if (riquadro.parentNode) riquadro.parentNode.removeChild(riquadro);
      iframe.focus();
    });
    riquadro.parentNode.insertBefore(iframe, riquadro);
  });
})();

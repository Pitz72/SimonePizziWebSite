/* particelle.js — il dettaglio dietro l'apertura della home.

   Il sito React aveva cinquanta particelle verdi a tutto schermo, con le linee
   fra le vicine e il mouse che le spingeva via (ParticleBackground.tsx, nella
   storia di git). Il piano del 7 settembre 2026 (DECISIONI §6) le voleva
   ridotte a «dettaglio dietro l'apertura, non un tappeto», e la migrazione le
   aveva lasciate fuori (revisione del 16 ottobre, §7). Tornano così:

   - solo dentro .apertura, dietro il testo, mai sopra;
   - nel grigio-verde spento del sito (--spento), non nel verde: il verde è il
     segnale di quello che è attivo, e un fondo che si muove non lo è;
   - ferme quando l'apertura esce dallo schermo o la scheda non si vede;
   - del tutto assenti per chi chiede al sistema meno movimento.

   Nessuna libreria, nessuna richiesta: un canvas e un ciclo di disegno. */

(function () {
  'use strict';

  var apertura = document.querySelector('.apertura');
  if (!apertura || !window.requestAnimationFrame) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.className = 'particelle';
  canvas.setAttribute('aria-hidden', 'true');
  apertura.insertBefore(canvas, apertura.firstChild);
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var QUANTE = 36;            // il React ne aveva 50 su tutto lo schermo
  var VICINE = 130;           // distanza in px sotto la quale si traccia la linea
  var COLORE = '125, 155, 132'; // --spento, #7d9b84
  var punti = [];
  var larghezza = 0, altezza = 0, rapporto = 1;
  var visibile = true, ciclo = null;

  function misura() {
    var r = apertura.getBoundingClientRect();
    rapporto = Math.min(window.devicePixelRatio || 1, 2);
    larghezza = r.width; altezza = r.height;
    canvas.width = Math.round(larghezza * rapporto);
    canvas.height = Math.round(altezza * rapporto);
    canvas.style.width = larghezza + 'px';
    canvas.style.height = altezza + 'px';
    ctx.setTransform(rapporto, 0, 0, rapporto, 0, 0);
  }

  function semina() {
    punti = [];
    for (var i = 0; i < QUANTE; i++) {
      punti.push({
        x: Math.random() * larghezza,
        y: Math.random() * altezza,
        vx: Math.random() * 0.3 - 0.15,
        vy: Math.random() * 0.3 - 0.15,
        r: Math.random() * 1.6 + 0.8
      });
    }
  }

  function disegna() {
    ctx.clearRect(0, 0, larghezza, altezza);
    for (var i = 0; i < punti.length; i++) {
      var p = punti[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > larghezza) p.vx *= -1;
      if (p.y < 0 || p.y > altezza) p.vy *= -1;
      for (var j = i + 1; j < punti.length; j++) {
        var q = punti[j];
        var dx = p.x - q.x, dy = p.y - q.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < VICINE) {
          ctx.strokeStyle = 'rgba(' + COLORE + ',' + (0.22 * (1 - d / VICINE)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(' + COLORE + ', 0.45)';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ciclo = (visibile && !document.hidden) ? window.requestAnimationFrame(disegna) : null;
  }

  function riparti() {
    if (!ciclo && visibile && !document.hidden) ciclo = window.requestAnimationFrame(disegna);
  }

  misura();
  semina();
  riparti();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (viste) {
      visibile = viste[0].isIntersecting;
      riparti();
    }).observe(apertura);
  }
  document.addEventListener('visibilitychange', riparti);

  var attesa = null;
  window.addEventListener('resize', function () {
    clearTimeout(attesa);
    attesa = setTimeout(function () { misura(); semina(); }, 200);
  });
})();

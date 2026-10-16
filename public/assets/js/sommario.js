/* sommario.js — la barretta verde segue la lettura.
   Un IntersectionObserver guarda i titoli dell'articolo e accende la voce
   corrispondente. Niente calcoli sullo scorrimento: il browser sa già dirci
   che cosa sta sullo schermo, e chiederglielo costa molto meno. */

(function () {
  'use strict';

  /* La barra in cima: quanta parte del testo hai già letto. Si guarda il
     corpo dell'articolo, non la pagina intera, così il piede e la lettera in
     fondo non la falsano. Un aggiornamento per fotogramma, non per evento. */
  var barra = document.getElementById('avanzamento');
  var testo = document.querySelector('.corpo');
  if (barra && testo) {
    var inAttesa = false;
    var aggiorna = function () {
      inAttesa = false;
      var r = testo.getBoundingClientRect();
      var percorso = r.height - window.innerHeight;
      var fatto = percorso > 0 ? Math.min(1, Math.max(0, -r.top / percorso)) : (r.top < 0 ? 1 : 0);
      barra.style.transform = 'scaleX(' + fatto.toFixed(4) + ')';
    };
    window.addEventListener('scroll', function () {
      if (!inAttesa) { inAttesa = true; window.requestAnimationFrame(aggiorna); }
    }, { passive: true });
    window.addEventListener('resize', aggiorna);
    aggiorna();
  }

  var sommario = document.getElementById('sommario');
  var corpo = document.querySelector('.corpo');
  if (!sommario || !corpo || !('IntersectionObserver' in window)) return;

  var voci = {};
  sommario.querySelectorAll('a[href^="#"]').forEach(function (a) {
    voci[decodeURIComponent(a.getAttribute('href').slice(1))] = a;
  });

  var titoli = corpo.querySelectorAll('h2[id], h3[id]');
  if (!titoli.length) return;

  var visibili = {};

  function accendi(id) {
    Object.keys(voci).forEach(function (k) {
      if (k === id) voci[k].setAttribute('aria-current', 'true');
      else voci[k].removeAttribute('aria-current');
    });
    // La voce accesa deve restare in vista anche in un sommario lungo.
    if (voci[id] && sommario.scrollHeight > sommario.clientHeight) {
      voci[id].scrollIntoView({ block: 'nearest' });
    }
  }

  var osservatore = new IntersectionObserver(function (viste) {
    viste.forEach(function (v) {
      if (v.isIntersecting) visibili[v.target.id] = true;
      else delete visibili[v.target.id];
    });

    /* Fra i titoli sullo schermo si accende il primo in ordine di documento;
       se non ce n'è nessuno — si sta leggendo il testo fra due titoli — resta
       acceso l'ultimo superato. */
    for (var i = 0; i < titoli.length; i++) {
      if (visibili[titoli[i].id]) { accendi(titoli[i].id); return; }
    }
    var ultimoSopra = null;
    titoli.forEach(function (t) {
      if (t.getBoundingClientRect().top < 120) ultimoSopra = t.id;
    });
    if (ultimoSopra) accendi(ultimoSopra);
  }, {
    // Si guarda la fascia centrale dello schermo: un titolo appena entrato
    // dal basso non è ancora quello che si sta leggendo.
    rootMargin: '-15% 0px -70% 0px',
    threshold: 0
  });

  titoli.forEach(function (t) { osservatore.observe(t); });
})();

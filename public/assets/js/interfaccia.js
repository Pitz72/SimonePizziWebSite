/* interfaccia.js — il menu del telefono e le finestre.
   Nessuna libreria: sono poche righe, e una libreria costerebbe più del
   problema che risolve.

   Le finestre sono <dialog>: il fuoco della tastiera, la chiusura con Esc e
   lo sfondo li fa il browser. Qui si aggiunge solo quello che manca — la
   chiusura cliccando fuori — e si tiene la compatibilità con i browser che
   showModal() non ce l'hanno. */

(function () {
  'use strict';

  /* ── Menu del telefono ────────────────────────────────────────────────
     Lo stato sta su un attributo del contenitore, così il CSS lo legge senza
     che il JavaScript debba conoscere le classi. */
  var barra = document.querySelector('.barra');
  var pulsanteMenu = document.querySelector('[data-apri="menu"]');

  if (barra && pulsanteMenu) {
    pulsanteMenu.addEventListener('click', function () {
      var aperto = barra.getAttribute('data-menu') === 'aperto';
      barra.setAttribute('data-menu', aperto ? 'chiuso' : 'aperto');
      pulsanteMenu.setAttribute('aria-expanded', String(!aperto));
      pulsanteMenu.textContent = aperto ? 'Menu' : 'Chiudi';
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && barra.getAttribute('data-menu') === 'aperto') {
        pulsanteMenu.click();
        pulsanteMenu.focus();
      }
    });
  }

  /* ── Le tendine delle sezioni ──────────────────────────────────────────
     Il CSS le apre già col mouse sopra e col tabulatore dentro. Qui si
     aggiunge il click, che è l'unico modo che ha uno schermo tattile, e le
     due cortesie che il CSS non sa fare: Esc chiude, e aprirne una chiude
     quella di prima. Lo stato sta su aria-expanded, che è anche il dato che
     legge un lettore di schermo: uno solo, non due che possono divergere. */
  var tendine = [].slice.call(document.querySelectorAll('.tendina-apri'));

  function chiudiTendine(tranne) {
    tendine.forEach(function (b) {
      if (b !== tranne) b.setAttribute('aria-expanded', 'false');
    });
  }

  if (tendine.length) {
    tendine.forEach(function (bottone) {
      bottone.addEventListener('click', function () {
        var aperta = bottone.getAttribute('aria-expanded') === 'true';
        chiudiTendine(bottone);
        bottone.setAttribute('aria-expanded', String(!aperta));
      });
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Escape') return;
      var aperta = document.querySelector('.tendina-apri[aria-expanded="true"]');
      if (!aperta) return;
      chiudiTendine(null);
      aperta.focus();
    });

    /* Un click fuori chiude. Dentro la tendina no: là ci sono i link, e
       chiuderla prima che il browser segua il link è un modo di non farlo
       seguire mai. */
    document.addEventListener('click', function (ev) {
      if (!ev.target.closest('.voce-con-tendina')) chiudiTendine(null);
    });
  }

  /* ── Finestre ─────────────────────────────────────────────────────────── */
  window.SP = window.SP || {};

  window.SP.apri = function (nome) {
    var f = document.getElementById('finestra-' + nome);
    if (!f) return null;
    if (typeof f.showModal === 'function') { if (!f.open) f.showModal(); }
    else f.setAttribute('open', '');           // ripiego: finestra non modale
    return f;
  };

  window.SP.chiudi = function (f) {
    if (!f) return;
    if (typeof f.close === 'function') f.close();
    else f.removeAttribute('open');
  };

  document.addEventListener('click', function (ev) {
    var apre = ev.target.closest('[data-apri]');
    if (apre) {
      var nome = apre.getAttribute('data-apri');
      if (nome !== 'menu') { ev.preventDefault(); window.SP.apri(nome); }
      return;
    }

    var chiude = ev.target.closest('[data-chiudi]');
    if (chiude) { window.SP.chiudi(chiude.closest('dialog')); return; }

    /* Cliccare sullo sfondo chiude. Il bersaglio del click sullo sfondo è il
       <dialog> stesso, perché il contenuto sta dentro un figlio: se il click
       cade fuori dal rettangolo del contenuto, si chiude. */
    if (ev.target.tagName === 'DIALOG') {
      var r = ev.target.getBoundingClientRect();
      var fuori = ev.clientY < r.top || ev.clientY > r.bottom ||
                  ev.clientX < r.left || ev.clientX > r.right;
      if (fuori) window.SP.chiudi(ev.target);
    }
  });
})();

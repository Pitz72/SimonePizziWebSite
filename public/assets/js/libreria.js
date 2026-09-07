/* libreria.js — le due finestre che l'editor e la scheda articolo chiedono:
   la libreria delle immagini e il cercatore di articoli per i link interni.

   Sono <dialog>: fuoco, Esc e sfondo li fa il browser. Qui c'è solo quello che
   il browser non sa — che cosa mostrare dentro. */

(function () {
  'use strict';

  var finestraMedia = document.getElementById('finestra-libreria');
  var finestraLink  = document.getElementById('finestra-link-interno');

  function apri(f) {
    if (!f) return;
    if (typeof f.showModal === 'function') { if (!f.open) f.showModal(); }
    else f.setAttribute('open', '');
  }
  function chiudi(f) {
    if (!f) return;
    if (typeof f.close === 'function') f.close();
    else f.removeAttribute('open');
  }

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-chiudi]');
    if (b) { ev.preventDefault(); chiudi(b.closest('dialog')); }
  });

  /* ── La libreria delle immagini ────────────────────────────────────────
     Serve a due padroni: l'editor, che ci mette una figura dentro il testo, e
     la scheda articolo, che ci sceglie la copertina. Perciò accetta una
     funzione e le passa quello che è stato scelto, senza sapere che cosa ne
     farà. */
  var quandoScelta = null;
  var griglia = document.getElementById('griglia-libreria');
  var statoMedia = document.getElementById('stato-libreria');
  var giaCaricata = false;

  window.spApriLibreria = function (richiama) {
    quandoScelta = richiama;
    apri(finestraMedia);
    if (!giaCaricata) carica();
  };

  /** Una casella della griglia. */
  function scheda(m) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';

    var box = document.createElement('div');
    box.className = 'anteprima';
    var img = document.createElement('img');
    img.src = m.url; img.alt = ''; img.loading = 'lazy';
    box.appendChild(img);

    var didascalia = document.createElement('figcaption');
    didascalia.textContent = m.nome;

    b.appendChild(box);
    b.appendChild(didascalia);
    b.addEventListener('click', function () {
      chiudi(finestraMedia);
      if (quandoScelta) quandoScelta(m);
    });

    li.appendChild(b);
    return li;
  }

  function carica() {
    if (!griglia) return;
    statoMedia.textContent = 'Carico…';

    fetch('/admin/dati.php?cosa=media', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        griglia.innerHTML = '';
        (d.media || []).forEach(function (m) { griglia.appendChild(scheda(m)); });
        statoMedia.textContent = (d.media || []).length + ' immagini.';
        giaCaricata = true;
      })
      .catch(function () {
        statoMedia.textContent = 'Non sono riuscito a leggere la libreria. Ricarica la pagina.';
      });
  }

  /* ── Caricare una nuova immagine ───────────────────────────────────────
     Il ridimensionamento e la conversione in WebP li fa il server: qui si
     manda il file e si rimette in cima alla griglia quello che torna, così si
     può usare subito senza ricaricare la finestra. */
  var moduloCarica = document.getElementById('modulo-carica');

  if (moduloCarica) {
    moduloCarica.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var campo = document.getElementById('file-nuovo');
      if (!campo.files || !campo.files.length) return;

      var dati = new FormData(moduloCarica);
      var pulsante = moduloCarica.querySelector('button');
      pulsante.disabled = true;
      statoMedia.textContent = 'Carico ' + campo.files[0].name + '…';
      statoMedia.removeAttribute('data-tipo');

      fetch('/admin/carica.php', { method: 'POST', body: dati })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (esito) {
          if (!esito.ok) {
            statoMedia.textContent = esito.d.errore || 'Il caricamento non è riuscito.';
            statoMedia.setAttribute('data-tipo', 'no');
            return;
          }
          moduloCarica.reset();
          statoMedia.textContent = esito.d.nome + ' caricata (' +
            Math.round(esito.d.peso / 1024) + ' KB). È la prima della griglia.';
          statoMedia.setAttribute('data-tipo', 'ok');
          griglia.insertBefore(scheda(esito.d), griglia.firstChild);
        })
        .catch(function () {
          statoMedia.textContent = 'Il caricamento non è riuscito. Riprova.';
          statoMedia.setAttribute('data-tipo', 'no');
        })
        .then(function () { pulsante.disabled = false; });
    });
  }

  /* ── Il cercatore di articoli ──────────────────────────────────────────── */
  var quandoLink = null;
  var campoLink = document.getElementById('campo-link-interno');
  var listaLink = document.getElementById('esiti-link-interno');
  var attesa = null;

  window.spApriLinkInterno = function (richiama) {
    quandoLink = richiama;
    apri(finestraLink);
    if (campoLink) { setTimeout(function () { campoLink.focus(); campoLink.select(); }, 0); cerca(); }
  };

  if (campoLink) {
    campoLink.addEventListener('input', function () {
      clearTimeout(attesa);
      attesa = setTimeout(cerca, 220);
    });
  }

  function cerca() {
    if (!listaLink) return;
    fetch('/admin/dati.php?cosa=articoli&q=' + encodeURIComponent(campoLink.value.trim()),
          { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        listaLink.innerHTML = '';
        (d.articoli || []).forEach(function (a) {
          var li = document.createElement('li');
          var b = document.createElement('button');
          b.type = 'button';
          b.style.cssText = 'background:none;border:0;color:inherit;cursor:pointer;text-align:left;width:100%;padding:12px 0';

          var t = document.createElement('strong');
          t.textContent = a.titolo;
          var s = document.createElement('span');
          s.textContent = a.indirizzo + ' · ' + a.quando +
                          (a.stato !== 'published' ? ' · bozza' : '');

          b.appendChild(t); b.appendChild(s);
          b.addEventListener('click', function () {
            chiudi(finestraLink);
            if (quandoLink) quandoLink(a);
          });
          li.appendChild(b);
          listaLink.appendChild(li);
        });
        if (!(d.articoli || []).length) {
          listaLink.innerHTML = '<li style="padding:12px 0;color:var(--spento)">Nessun articolo trovato.</li>';
        }
      })
      .catch(function () {
        listaLink.innerHTML = '<li style="padding:12px 0;color:#e8a0a0">La ricerca non ha risposto.</li>';
      });
  }
})();

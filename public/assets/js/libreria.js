/* libreria.js — le finestre che l'editor e la scheda articolo chiedono:
   la libreria delle immagini, quella dei PDF e degli archivi, e il cercatore
   di articoli per i link interni.

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

  /* ── Caricare immagini nuove ───────────────────────────────────────────
     La coda, le barre e gli errori li tiene caricamenti.js. Qui si rimette in
     cima alla griglia ogni immagine che arriva, così si può usare subito senza
     ricaricare la finestra. */
  var zonaCarica = finestraMedia ? finestraMedia.querySelector('[data-zona-carica]') : null;

  if (zonaCarica && griglia) {
    zonaCarica.addEventListener('sp:caricata', function (ev) {
      griglia.insertBefore(scheda(ev.detail), griglia.firstChild);
    });
    zonaCarica.addEventListener('sp:finita', function (ev) {
      var n = ev.detail.riuscite;
      if (!n) return;
      statoMedia.textContent = n === 1 ? 'È la prima della griglia: cliccala per usarla.'
                                       : 'Sono le prime ' + n + ' della griglia: clicca quella che ti serve.';
      statoMedia.setAttribute('data-tipo', 'ok');
    });
  }

  /* ── PDF e archivi ─────────────────────────────────────────────────────
     La finestra di «Collega un file» dell'editor: lo stesso giro della
     libreria, ma un elenco invece di una griglia, perché di un PDF non c'è
     niente da guardare. Tornata il 22 ottobre 2026: il React caricava PDF e
     archivi, il pannello in PHP no. */
  var finestraFile = document.getElementById('finestra-file');
  var elencoFile = document.getElementById('elenco-file');
  var statoFile = document.getElementById('stato-file');
  var quandoFile = null;
  var fileCaricati = false;

  function pesoBreve(byte) {
    if (byte < 1024 * 1024) return Math.max(1, Math.round(byte / 1024)) + ' KB';
    return (byte / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  }

  window.spApriFile = function (richiama) {
    quandoFile = richiama;
    apri(finestraFile);
    if (!fileCaricati) caricaFile();
  };

  function rigaFile(f) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.type = 'button';
    var tipo = document.createElement('span');
    tipo.className = 'tipo';
    tipo.textContent = f.tipo;
    var testo = document.createElement('span');
    var nome = document.createElement('strong');
    nome.textContent = f.nome;
    var peso = document.createElement('span');
    peso.textContent = pesoBreve(f.peso);
    testo.appendChild(nome);
    testo.appendChild(peso);
    b.appendChild(tipo);
    b.appendChild(testo);
    b.addEventListener('click', function () {
      chiudi(finestraFile);
      if (quandoFile) quandoFile(f);
    });
    li.appendChild(b);
    return li;
  }

  function caricaFile() {
    if (!elencoFile) return;
    statoFile.textContent = 'Carico…';
    fetch('/admin/dati.php?cosa=file', { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        elencoFile.innerHTML = '';
        (d.file || []).forEach(function (f) { elencoFile.appendChild(rigaFile(f)); });
        statoFile.textContent = (d.file || []).length
          ? (d.file.length === 1 ? 'Un file.' : d.file.length + ' file.')
          : 'Ancora nessun PDF o archivio: caricane uno qui sopra.';
        fileCaricati = true;
      })
      .catch(function () {
        statoFile.textContent = 'Non sono riuscito a leggere la libreria. Ricarica la pagina.';
      });
  }

  var zonaFile = finestraFile ? finestraFile.querySelector('[data-zona-carica]') : null;
  if (zonaFile && elencoFile) {
    zonaFile.addEventListener('sp:caricata', function (ev) {
      var d = ev.detail;
      elencoFile.insertBefore(rigaFile({
        id: d.id, url: d.url, nome: d.nome, peso: d.peso,
        tipo: (d.nome.split('.').pop() || '').toUpperCase()
      }), elencoFile.firstChild);
    });
    zonaFile.addEventListener('sp:finita', function (ev) {
      var n = ev.detail.riuscite;
      if (!n) return;
      statoFile.textContent = n === 1 ? 'È il primo dell\'elenco: cliccalo per collegarlo.'
                                      : 'Sono i primi ' + n + ' dell\'elenco: clicca quello che ti serve.';
      statoFile.setAttribute('data-tipo', 'ok');
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

/* caricamenti.js — i file che vanno al server (immagini, PDF, archivi), con la barra.

   Nel pannello React la percentuale la calcolava il browser
   (xhr.upload.onprogress in api.ts), e così si fa anche qui: fetch() non sa
   dire quanto ha spedito, XMLHttpRequest sì. Il server non c'entra, e
   session.upload_progress resta spenta (22 ottobre 2026, PHP2Shell).

   Ogni [data-zona-carica] della pagina diventa una zona: si trascinano o si
   scelgono più file, e partono uno dopo l'altro verso admin/carica.php, ognuno
   con la sua riga. Uno alla volta perché carica.php ne riceve uno per
   richiesta, e perché la conversione in WebP pesa su un server condiviso.

   Chi usa la zona ascolta due eventi sulla zona stessa:
     sp:caricata — un file è arrivato; in detail la risposta di carica.php
     sp:finita   — la coda è vuota; in detail { riuscite, fallite }
   Con data-dopo="ricarica" la pagina si rilegge da sola a fine coda, se
   nessun file è andato storto. */

(function () {
  'use strict';

  var zone = document.querySelectorAll('[data-zona-carica]');
  if (!zone.length || !window.FormData) return;

  /* Che cosa accetta la zona lo scrive il PHP (data-ammesse, da ZONA_TIPI in
     admin/_layout.php); le immagini hanno solo il limite del server, PDF e
     archivi anche il loro (data-massimo-file). */
  var IMMAGINI = ['jpg', 'jpeg', 'png', 'webp', 'gif'];   // come ESTENSIONI in admin/carica.php

  function peso(byte) {
    if (byte < 1024 * 1024) return Math.max(1, Math.round(byte / 1024)) + ' KB';
    return (byte / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
  }

  function estensione(nome) {
    var i = nome.lastIndexOf('.');
    return i < 0 ? '' : nome.slice(i + 1).toLowerCase();
  }

  function portaFile(ev) {
    var tipi = ev.dataTransfer ? ev.dataTransfer.types : null;
    return !!tipi && Array.prototype.indexOf.call(tipi, 'Files') >= 0;
  }

  /* Un file lasciato cadere fuori dalla zona il browser lo apre al posto
     della pagina, e quello che si stava scrivendo se ne va. Sulle pagine con
     una zona, un file trascinato altrove non fa niente. */
  ['dragover', 'drop'].forEach(function (tipo) {
    window.addEventListener(tipo, function (ev) { if (portaFile(ev)) ev.preventDefault(); });
  });

  /* Chiudere la scheda a metà coda interrompe i caricamenti: il browser chiede prima. */
  var inCorso = 0;
  window.addEventListener('beforeunload', function (ev) {
    if (inCorso > 0) { ev.preventDefault(); ev.returnValue = ''; }
  });

  Array.prototype.forEach.call(zone, function (zona) {
    var campo    = zona.querySelector('input[type="file"]');
    var lista    = zona.querySelector('.coda-carica');
    var annuncio = zona.querySelector('[data-annuncio]');
    var gettone  = zona.querySelector('input[name="gettone"]');
    var massimo  = parseInt(zona.getAttribute('data-massimo') || '0', 10);
    var massimoFile = parseInt(zona.getAttribute('data-massimo-file') || '0', 10);
    var ammesse  = (zona.getAttribute('data-ammesse') || IMMAGINI.join(',')).split(',');
    var coda = [];
    var attivo = false;
    var riuscite = 0, fallite = 0;
    var schede = {};   // in quali schede della Libreria è finito quello che è arrivato

    function annuncia(testo) { if (annuncio) annuncio.textContent = testo; }

    campo.addEventListener('change', function () {
      accoda(campo.files);
      campo.value = '';   // così lo stesso file si può scegliere di nuovo
    });

    /* dragenter e dragleave arrivano anche entrando e uscendo dai figli: si
       contano, se no l'evidenziazione lampeggia passando sopra le scritte. */
    var dentro = 0;
    zona.addEventListener('dragenter', function (ev) {
      if (!portaFile(ev)) return;
      ev.preventDefault();
      dentro++;
      zona.setAttribute('data-sopra', '');
    });
    zona.addEventListener('dragleave', function () {
      if (--dentro <= 0) { dentro = 0; zona.removeAttribute('data-sopra'); }
    });
    zona.addEventListener('dragover', function (ev) {
      if (!portaFile(ev)) return;
      ev.preventDefault();
      ev.dataTransfer.dropEffect = 'copy';
    });
    zona.addEventListener('drop', function (ev) {
      ev.preventDefault();
      dentro = 0;
      zona.removeAttribute('data-sopra');
      if (ev.dataTransfer && ev.dataTransfer.files.length) accoda(ev.dataTransfer.files);
    });

    function accoda(files) {
      if (!attivo) { riuscite = 0; fallite = 0; schede = {}; }
      Array.prototype.forEach.call(files, function (f) {
        var riga = nuovaRiga(f);
        var immagine = IMMAGINI.indexOf(estensione(f.name)) >= 0;
        if (ammesse.indexOf(estensione(f.name)) < 0) {
          fallite++;
          chiudiRiga(riga, 'no', 'formato non ammesso qui: vanno bene ' + ammesse.join(', '));
        } else if (massimo > 0 && f.size > massimo) {
          fallite++;
          chiudiRiga(riga, 'no', 'troppo grande: il server accetta fino a ' + peso(massimo));
        } else if (!immagine && massimoFile > 0 && f.size > massimoFile) {
          fallite++;
          chiudiRiga(riga, 'no', 'troppo grande: per PDF e archivi il limite è ' + peso(massimoFile));
        } else {
          coda.push({ file: f, riga: riga });
          inCorso++;
        }
      });
      if (!attivo) prossimo();
    }

    function nuovaRiga(f) {
      var li = document.createElement('li');
      var testa = document.createElement('div');
      testa.className = 'coda-testa';
      var nome = document.createElement('span');
      nome.className = 'coda-nome';
      nome.textContent = f.name;
      var dato = document.createElement('span');
      dato.className = 'coda-dato';
      dato.textContent = peso(f.size) + ' · in coda';
      testa.appendChild(nome);
      testa.appendChild(dato);

      var barra = document.createElement('progress');
      barra.max = 100;
      barra.value = 0;
      barra.setAttribute('aria-label', 'Caricamento di ' + f.name);

      li.appendChild(testa);
      li.appendChild(barra);
      lista.appendChild(li);
      return { li: li, dato: dato, barra: barra, totale: f.size };
    }

    function chiudiRiga(riga, tipo, testo) {
      riga.li.setAttribute('data-tipo', tipo);
      riga.barra.value = 100;
      riga.dato.textContent = testo;
    }

    function prossimo() {
      var voce = coda.shift();
      if (!voce) { attivo = false; finisci(); return; }
      attivo = true;
      manda(voce.file, voce.riga, function () { inCorso--; prossimo(); });
    }

    function manda(file, riga, poi) {
      var dati = new FormData();
      dati.append('gettone', gettone ? gettone.value : '');
      dati.append('file', file);

      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/admin/carica.php');
      xhr.setRequestHeader('Accept', 'application/json');
      riga.dato.textContent = peso(riga.totale) + ' · parte';

      xhr.upload.addEventListener('progress', function (ev) {
        if (!ev.lengthComputable) return;
        var p = Math.min(100, Math.round(ev.loaded / ev.total * 100));
        riga.barra.value = p;
        riga.dato.textContent = p + '% · ' + peso(Math.min(ev.loaded, riga.totale)) + ' di ' + peso(riga.totale);
      });
      /* Spedito tutto: adesso lavora il server, e quanto ci mette non si sa.
         Una barra senza valore lo dice meglio di un 100% fermo. */
      xhr.upload.addEventListener('load', function () {
        riga.barra.removeAttribute('value');
        riga.dato.textContent = IMMAGINI.indexOf(estensione(file.name)) >= 0
          ? 'arrivata · il server la prepara' : 'arrivato · il server lo registra';
      });

      xhr.addEventListener('load', function () {
        var d = null;
        try { d = JSON.parse(xhr.responseText); } catch (e) { d = null; }
        if (xhr.status === 200 && d && d.url) {
          riuscite++;
          schede[d.tipo || 'immagini'] = true;
          chiudiRiga(riga, 'ok', 'fatto · ' + peso(d.peso) + (/\.webp$/i.test(d.nome || '') ? ' in WebP' : ''));
          annuncia(file.name + ': fatto.');
          zona.dispatchEvent(new CustomEvent('sp:caricata', { detail: d }));
        } else {
          fallite++;
          var perche = d && d.errore ? d.errore
            : xhr.status === 419 ? 'il modulo è scaduto: ricarica la pagina e riprova'
            : 'risposta inattesa dal server (la sessione è scaduta?): ricarica la pagina e riprova';
          chiudiRiga(riga, 'no', perche);
          annuncia(file.name + ': ' + perche + '.');
        }
        poi();
      });
      xhr.addEventListener('error', function () {
        fallite++;
        chiudiRiga(riga, 'no', 'la connessione si è interrotta: riprova');
        annuncia(file.name + ': la connessione si è interrotta.');
        poi();
      });

      xhr.send(dati);
    }

    function finisci() {
      zona.dispatchEvent(new CustomEvent('sp:finita', { detail: { riuscite: riuscite, fallite: fallite } }));
      if (zona.getAttribute('data-dopo') !== 'ricarica' || riuscite === 0) return;

      /* Si torna alla scheda dove sono finiti i file: se sono tutti dello stesso
         tipo, quella; se no, quella che si stava guardando. */
      var dove = Object.keys(schede);
      var scheda = dove.length === 1 ? dove[0]
                 : (new URLSearchParams(location.search).get('tipo') || 'immagini');
      if (fallite === 0) {
        var detto = dove.length === 1 && dove[0] === 'immagini'
          ? (riuscite === 1 ? 'Un\'immagine caricata: è la prima della libreria.'
                            : riuscite + ' immagini caricate: sono le prime della libreria.')
          : (riuscite === 1 ? 'Un file caricato: è il primo della sua scheda.'
                            : riuscite + ' file caricati: sono i primi della loro scheda.');
        location.href = location.pathname + '?tipo=' + scheda + '&fatto=' + encodeURIComponent(detto);
        return;
      }
      /* Qualcosa è andato storto: le righe rosse restano da leggere, e la
         pagina si rilegge quando lo decide chi la sta guardando. */
      if (!zona.querySelector('.coda-rileggi')) {
        var a = document.createElement('a');
        a.className = 'btn btn-muto coda-rileggi';
        a.href = location.pathname + '?tipo=' + scheda;
        a.textContent = 'Mostra i nuovi nella libreria';
        zona.appendChild(a);
      }
    }
  });
})();

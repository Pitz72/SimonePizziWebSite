/* ricerca.js — la finestra della ricerca, Ctrl+K.
   Chiede a /api/cerca.php mentre si scrive, ma non a ogni tasto: aspetta che
   la mano si fermi. Le frecce e Invio funzionano senza toccare il mouse. */

(function () {
  'use strict';

  var finestra = document.getElementById('finestra-cerca');
  if (!finestra) return;

  var campo  = document.getElementById('campo-cerca');
  var lista  = document.getElementById('esiti-cerca');
  var stato  = document.getElementById('stato-cerca');
  var attesa = null;
  var richiestaInCorso = null;

  /* Ctrl+K (o Cmd+K) apre. Non si intercetta mentre si sta scrivendo altrove:
     dentro un campo di testo quella combinazione può servire alla pagina. */
  document.addEventListener('keydown', function (ev) {
    var tasto = ev.key ? ev.key.toLowerCase() : '';
    if ((ev.ctrlKey || ev.metaKey) && tasto === 'k') {
      ev.preventDefault();
      window.SP.apri('cerca');
      if (campo) { campo.focus(); campo.select(); }
    }
  });

  /* Aperta dal pulsante della barra: l'autofocus del markup basta al primo
     giro, ma se la finestra è già stata aperta e chiusa il browser non lo
     riapplica. Qui si rimette il fuoco a ogni apertura. */
  document.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-apri="cerca"]')) {
      setTimeout(function () { if (campo) { campo.focus(); campo.select(); } }, 0);
    }
  });

  finestra.addEventListener('close', function () { svuota(); });

  function svuota() {
    lista.innerHTML = '';
    stato.textContent = '';
    stato.removeAttribute('data-tipo');
  }

  campo.addEventListener('input', function () {
    clearTimeout(attesa);
    var testo = campo.value.trim();

    if (testo.length < 2) { svuota(); return; }

    // 220 ms: il tempo che passa fra un tasto e l'altro quando si sta ancora
    // scrivendo. Più corto e si chiedono ricerche di parole a metà.
    attesa = setTimeout(function () { chiedi(testo); }, 220);
  });

  function chiedi(testo) {
    if (richiestaInCorso) richiestaInCorso.abort();
    richiestaInCorso = new AbortController();

    stato.textContent = 'Cerco…';
    stato.removeAttribute('data-tipo');

    fetch('/api/cerca.php?q=' + encodeURIComponent(testo), {
      signal: richiestaInCorso.signal,
      headers: { 'Accept': 'application/json' }
    })
      .then(function (r) { return r.json(); })
      .then(function (dati) { mostra(dati, testo); })
      .catch(function (err) {
        if (err.name === 'AbortError') return;   // ne è partita una più nuova
        stato.textContent = 'La ricerca non ha risposto. Riprova fra un momento.';
        stato.setAttribute('data-tipo', 'no');
        lista.innerHTML = '';
      });
  }

  function mostra(dati, testo) {
    lista.innerHTML = '';
    var esiti = (dati && dati.esiti) || [];

    if (!esiti.length) {
      stato.textContent = 'Nessun risultato per «' + testo + '».';
      stato.removeAttribute('data-tipo');
      return;
    }

    stato.textContent = esiti.length === 1 ? 'Un risultato.' : esiti.length + ' risultati.';
    stato.setAttribute('data-tipo', 'ok');

    esiti.forEach(function (r) {
      var li = document.createElement('li');
      var a  = document.createElement('a');
      a.href = r.indirizzo;

      var titolo = document.createElement('strong');
      titolo.textContent = r.titolo;

      var sotto = document.createElement('span');
      sotto.textContent = [r.sezione, r.quando, r.genere === 'progetto' ? 'progetto' : '']
        .filter(Boolean).join(' · ');

      a.appendChild(titolo);
      a.appendChild(sotto);
      li.appendChild(a);
      lista.appendChild(li);
    });
  }

  /* Frecce e Invio: si scorre l'elenco senza lasciare il campo di testo. */
  campo.addEventListener('keydown', function (ev) {
    var link = lista.querySelectorAll('a');
    if (!link.length) return;

    if (ev.key === 'ArrowDown') { ev.preventDefault(); link[0].focus(); }
    else if (ev.key === 'Enter') { ev.preventDefault(); link[0].click(); }
  });

  lista.addEventListener('keydown', function (ev) {
    var link = Array.prototype.slice.call(lista.querySelectorAll('a'));
    var dove = link.indexOf(document.activeElement);
    if (dove < 0) return;

    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      (link[dove + 1] || link[0]).focus();
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      if (dove === 0) campo.focus();
      else link[dove - 1].focus();
    }
  });
})();

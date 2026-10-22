/* tag.js — il campo dei tag nella scheda articolo, fatto per il riuso.

   Era il TagPicker del React (v1.27.0), andato perso con la migrazione: il
   pannello in PHP aveva un campo di testo a virgole, e con trecento tag è più
   veloce inventarne uno nuovo che ritrovare quello giusto. È così che il
   vecchio pannello era arrivato a 208 tag usati una volta sola su 310.

   Qui il riuso è la strada in discesa:
     - ogni tag scelto è un'etichetta con il numero di articoli che lo usano;
     - scrivendo si apre l'elenco dei tag che contengono quelle lettere, i più
       usati per primi, e solo in fondo «crea» quello nuovo;
     - «Forse intendevi» intercetta i refusi: un tag esistente a una o due
       lettere di distanza vale più di un doppione;
     - i dieci più usati sono sempre a vista, da aggiungere con un clic;
     - sotto, il conto: da due a otto, come dice già l'aiuto.

   Il campo vero resta #campo-tag, nascosto, con i nomi separati da virgola: è
   quello che il PHP legge, ed è quello che si vede se questo file non arriva.
   Due tag sono lo stesso se hanno lo stesso slug, come in imposta_tag_articolo(). */

(function () {
  'use strict';

  var scatola = document.querySelector('[data-scelta-tag]');
  var vero = document.getElementById('campo-tag');
  if (!scatola || !vero || !window.fetch) return;

  /* La stessa trasformazione di slug() in lib/helpers.php. */
  function chiave(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  /* Quante lettere separano due parole (Levenshtein). */
  function distanza(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prima = [];
    for (var j = 0; j <= b.length; j++) prima.push(j);
    for (var i = 1; i <= a.length; i++) {
      var ora = [i];
      for (j = 1; j <= b.length; j++) {
        ora[j] = Math.min(prima[j] + 1, ora[j - 1] + 1, prima[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prima = ora;
    }
    return prima[b.length];
  }

  fetch('/admin/dati.php?cosa=tag', { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(function (d) { monta(d.tag || []); })
    .catch(function () { /* resta il campo a virgole: funziona lo stesso */ });

  function monta(tutti) {
    var perChiave = {};
    tutti.forEach(function (t) { perChiave[chiave(t.nome)] = t; });

    var scelti = [];          // nomi, nell'ordine in cui sono stati scelti
    var scritto = '';         // l'ultimo valore scritto da qui in #campo-tag
    var evidenziato = 0;
    var righe = [];           // le voci della tendina, per la tastiera

    /* ── L'impianto ─────────────────────────────────────────────────────── */
    var etichette = document.createElement('ul');
    etichette.className = 'tag-scelti';

    var cerca = document.createElement('input');
    cerca.type = 'text';
    cerca.id = 'campo-tag-cerca';
    cerca.autocomplete = 'off';
    cerca.placeholder = 'Cerca un tag esistente…';
    cerca.setAttribute('role', 'combobox');
    cerca.setAttribute('aria-autocomplete', 'list');
    cerca.setAttribute('aria-expanded', 'false');
    cerca.setAttribute('aria-controls', 'tendina-tag');

    var tendina = document.createElement('ul');
    tendina.className = 'tag-tendina';
    tendina.id = 'tendina-tag';
    tendina.setAttribute('role', 'listbox');
    tendina.hidden = true;

    var campo = document.createElement('div');
    campo.className = 'tag-campo';
    campo.appendChild(cerca);
    campo.appendChild(tendina);

    var popolari = document.createElement('p');
    popolari.className = 'tag-fila';

    var conto = document.createElement('p');
    conto.className = 'aiuto tag-conto';

    var aiuto = scatola.querySelector('.aiuto');
    vero.type = 'hidden';
    scatola.querySelector('label').setAttribute('for', 'campo-tag-cerca');
    scatola.insertBefore(etichette, aiuto);
    scatola.insertBefore(campo, aiuto);
    scatola.insertBefore(popolari, aiuto);
    scatola.insertBefore(conto, aiuto);
    aiuto.textContent = 'Servono a collegare articoli fra loro: prima di crearne uno, cercalo. '
                      + 'Un tag che vale per un articolo solo non raggruppa niente.';

    leggiDalCampo();

    /* ── Lo stato ───────────────────────────────────────────────────────── */
    function leggiDalCampo() {
      scelti = [];
      vero.value.split(',').forEach(function (n) {
        n = n.trim();
        if (n && !giaScelto(n)) scelti.push(n);
      });
      scritto = vero.value;
      disegna();
    }

    function scrivi() {
      vero.value = scelti.join(', ');
      scritto = vero.value;
      // L'editor sa che c'è da salvare (bozza locale, avviso all'uscita) da qui.
      vero.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function giaScelto(nome) {
      var k = chiave(nome);
      return scelti.some(function (s) { return chiave(s) === k; });
    }

    function aggiungi(nome) {
      nome = String(nome).replace(/\s+/g, ' ').trim();
      if (!nome || !chiave(nome) || giaScelto(nome)) return;
      var esistente = perChiave[chiave(nome)];
      scelti.push(esistente ? esistente.nome : nome);   // la forma che c'è già vince
      cerca.value = '';
      scrivi();
      disegna();
      cerca.focus();
    }

    function togli(i) {
      scelti.splice(i, 1);
      scrivi();
      disegna();
    }

    /* Se la bozza locale dell'editor rimette i campi, si riparte da lì. */
    vero.form.addEventListener('input', function (ev) {
      if (ev.target !== vero && vero.value !== scritto) leggiDalCampo();
    });

    /* ── Il disegno ─────────────────────────────────────────────────────── */
    function pulsanteTag(t, conNumero) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tag-proposta';
      b.textContent = t.nome;
      if (conNumero) {
        var n = document.createElement('small');
        n.textContent = ' ' + t.usati;
        b.appendChild(n);
      }
      b.addEventListener('click', function () { aggiungi(t.nome); });
      return b;
    }

    function disegna() {
      etichette.innerHTML = '';
      scelti.forEach(function (nome, i) {
        var li = document.createElement('li');
        var t = perChiave[chiave(nome)];
        var testo = document.createElement('span');
        testo.textContent = nome;
        li.appendChild(testo);
        if (t && t.usati > 0) {
          var n = document.createElement('small');
          n.textContent = t.usati;
          n.title = 'Usato in ' + t.usati + (t.usati === 1 ? ' articolo' : ' articoli');
          li.appendChild(n);
        }
        var x = document.createElement('button');
        x.type = 'button';
        x.textContent = '×';
        x.setAttribute('aria-label', 'Togli ' + nome);
        x.addEventListener('click', function () { togli(i); cerca.focus(); });
        li.appendChild(x);
        etichette.appendChild(li);
      });
      etichette.hidden = !scelti.length;

      // I più usati, quelli non ancora scelti.
      popolari.innerHTML = '';
      var piu = tutti.filter(function (t) { return t.usati > 0 && !giaScelto(t.nome); })
                     .sort(function (a, b) { return b.usati - a.usati; }).slice(0, 10);
      if (piu.length) {
        var e = document.createElement('span');
        e.className = 'eti';
        e.textContent = 'Più usati';
        popolari.appendChild(e);
        piu.forEach(function (t) { popolari.appendChild(pulsanteTag(t, true)); });
      }
      popolari.hidden = !piu.length;

      var n = scelti.length;
      conto.textContent = (n === 1 ? 'Un tag' : n + ' tag') + ' · ne servono da due a otto';
      conto.setAttribute('data-fuori', n < 2 || n > 8 ? 'si' : 'no');

      proponi();
    }

    /* Spazi e trattini non contano nella ricerca: «retrogaming» deve trovare
       «Retro Gaming», che per il server è un altro slug. */
    function compatta(k) { return k.replace(/-/g, ''); }
    function contiene(t, k) {
      var c = chiave(t.nome);
      return c.indexOf(k) >= 0 || compatta(c).indexOf(compatta(k)) >= 0;
    }

    /* La tendina, mentre si scrive: prima i tag che contengono quelle lettere,
       poi «Forse intendevi» (i refusi), in fondo «Crea». Tutto nella stessa
       lista, così le frecce e l'Invio arrivano dappertutto. */
    function proponi() {
      var q = cerca.value.replace(/\s+/g, ' ').trim();
      var k = chiave(q);
      tendina.innerHTML = '';
      righe = [];

      if (!k) { chiudiTendina(); return; }

      var trovati = tutti.filter(function (t) {
        return !giaScelto(t.nome) && contiene(t, k);
      }).sort(function (a, b) {
        // Prima chi comincia così, poi chi è usato di più: è quello che volevi.
        var ia = chiave(a.nome).indexOf(k) === 0 ? 0 : 1;
        var ib = chiave(b.nome).indexOf(k) === 0 ? 0 : 1;
        return ia - ib || b.usati - a.usati;
      }).slice(0, 8);
      trovati.forEach(function (t) { righe.push({ nome: t.nome, usati: t.usati }); });

      // Refusi: tag a una o due lettere di distanza che la ricerca non ha già trovato.
      var esiste = !!perChiave[k];
      if (k.length >= 4 && !esiste) {
        var soglia = k.length <= 6 ? 1 : 2;
        tutti.filter(function (t) { return !giaScelto(t.nome) && !contiene(t, k); })
          .map(function (t) { return { t: t, d: distanza(compatta(k), compatta(chiave(t.nome))) }; })
          .filter(function (x) { return x.d <= soglia; })
          .sort(function (a, b) { return a.d - b.d || b.t.usati - a.t.usati; })
          .slice(0, 3)
          .forEach(function (x, i) { righe.push({ nome: x.t.nome, usati: x.t.usati, forse: i === 0 }); });
      }
      if (!esiste && !giaScelto(q)) righe.push({ nome: q, nuovo: true });

      righe.forEach(function (r, i) {
        if (r.forse) {
          var testa = document.createElement('li');
          testa.className = 'tag-testa';
          testa.setAttribute('role', 'presentation');
          testa.textContent = 'Forse intendevi';
          tendina.appendChild(testa);
        }
        var li = document.createElement('li');
        li.id = 'tag-voce-' + i;
        li.setAttribute('role', 'option');
        if (r.nuovo) {
          li.className = 'tag-nuovo';
          li.textContent = '+ Crea «' + r.nome + '» — mai usato';
        } else {
          var s = document.createElement('span');
          s.textContent = r.nome;
          var c = document.createElement('small');
          c.textContent = r.usati;
          li.appendChild(s);
          li.appendChild(c);
        }
        // mousedown e non click: il click arriva dopo che il campo ha perso il fuoco.
        li.addEventListener('mousedown', function (ev) { ev.preventDefault(); aggiungi(r.nome); });
        tendina.appendChild(li);
      });
      evidenziato = Math.min(evidenziato, Math.max(0, righe.length - 1));
      apriTendina();
    }

    function apriTendina() {
      tendina.hidden = !righe.length;
      cerca.setAttribute('aria-expanded', righe.length ? 'true' : 'false');
      Array.prototype.forEach.call(tendina.querySelectorAll('[role="option"]'), function (li, i) {
        li.setAttribute('aria-selected', i === evidenziato ? 'true' : 'false');
        if (i === evidenziato && li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
      });
      if (righe.length) cerca.setAttribute('aria-activedescendant', 'tag-voce-' + evidenziato);
      else cerca.removeAttribute('aria-activedescendant');
    }

    function chiudiTendina() {
      tendina.hidden = true;
      cerca.setAttribute('aria-expanded', 'false');
      cerca.removeAttribute('aria-activedescendant');
    }

    /* ── La tastiera ────────────────────────────────────────────────────── */
    cerca.addEventListener('input', function () {
      // Una virgola chiude il tag che si stava scrivendo, come nel campo di prima.
      if (cerca.value.indexOf(',') >= 0) {
        var pezzi = cerca.value.split(',');
        cerca.value = pezzi.pop();
        pezzi.forEach(aggiungi);
      }
      evidenziato = 0;
      proponi();
    });

    cerca.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        if (tendina.hidden) proponi();
        evidenziato = Math.min(evidenziato + 1, righe.length - 1);
        apriTendina();
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        evidenziato = Math.max(evidenziato - 1, 0);
        apriTendina();
      } else if (ev.key === 'Enter') {
        // Invio qui dentro sceglie un tag, non spedisce l'articolo.
        ev.preventDefault();
        var r = righe[evidenziato];
        if (r && !tendina.hidden) aggiungi(r.nome);
        else if (cerca.value.trim()) aggiungi(cerca.value);
      } else if (ev.key === 'Escape') {
        if (!tendina.hidden) { ev.preventDefault(); chiudiTendina(); }
      } else if (ev.key === 'Backspace' && !cerca.value && scelti.length) {
        togli(scelti.length - 1);
      }
    });

    cerca.addEventListener('blur', function () { setTimeout(chiudiTendina, 120); });
    cerca.addEventListener('focus', function () { if (cerca.value.trim()) proponi(); });
  }
})();

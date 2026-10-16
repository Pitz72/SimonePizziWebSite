/* admin.js — le poche comodità del pannello che valgono una riga di JavaScript.
   Tutto il resto è HTML e POST: una schermata di lavoro deve funzionare anche
   quando qualcosa va storto. */

(function () {
  'use strict';

  /* Conferma prima di quello che non si può disfare. Il testo lo decide la
     pagina, così la domanda nomina la cosa: «Cancello Il Relitto Silente?» è
     un'altra domanda rispetto a «Sei sicuro?». */
  document.addEventListener('submit', function (ev) {
    var conferma = ev.target.getAttribute('data-conferma');
    if (conferma && !window.confirm(conferma)) ev.preventDefault();
  });

  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-conferma-click]');
    if (b && !window.confirm(b.getAttribute('data-conferma-click'))) {
      ev.preventDefault();
      ev.stopPropagation();
    }
  });

  /* I contatori dei campi che finiscono su Google: si vede mentre si scrive
     se il testo verrà tagliato. */
  document.querySelectorAll('[data-conta]').forEach(function (campo) {
    var uscita = document.getElementById(campo.getAttribute('data-conta'));
    var limite = parseInt(campo.getAttribute('data-limite'), 10) || 0;
    if (!uscita) return;

    function aggiorna() {
      var n = campo.value.length;
      uscita.textContent = n + (limite ? ' / ' + limite : '') + ' caratteri';
      uscita.setAttribute('data-oltre', limite && n > limite ? 'si' : 'no');
    }
    campo.addEventListener('input', aggiorna);
    aggiorna();
  });

  /* L'anteprima di come esce su Google, aggiornata mentre si scrive. */
  var anteprima = document.getElementById('anteprima-google');
  if (anteprima) {
    var fonti = {
      titolo: document.getElementById('campo-seo-title'),
      titoloRipiego: document.getElementById('campo-titolo'),
      descrizione: document.getElementById('campo-seo-description'),
      descrizioneRipiego: document.getElementById('campo-excerpt')
    };
    var mostra = {
      titolo: anteprima.querySelector('.g-titolo'),
      descrizione: anteprima.querySelector('.g-descrizione')
    };

    function dipingi() {
      var t = (fonti.titolo && fonti.titolo.value.trim()) ||
              ((fonti.titoloRipiego && fonti.titoloRipiego.value.trim()) || 'Titolo dell\u2019articolo') +
              ' \u2014 Simone Pizzi';
      var d = (fonti.descrizione && fonti.descrizione.value.trim()) ||
              (fonti.descrizioneRipiego && fonti.descrizioneRipiego.value.trim()) ||
              'Qui finisce il riassunto: se non lo scrivi, Google si arrangia da solo con le prime righe del testo.';
      mostra.titolo.textContent = t;
      mostra.descrizione.textContent = d;
    }
    Object.values(fonti).forEach(function (c) { if (c) c.addEventListener('input', dipingi); });
    dipingi();
  }

  /* Lo slug si scrive da solo finché nessuno lo tocca a mano: un articolo
     nuovo non deve costringere a inventarsi un indirizzo. */
  var titolo = document.getElementById('campo-titolo');
  var slug = document.getElementById('campo-slug');
  if (titolo && slug && slug.value.trim() === '') {
    var toccato = false;
    slug.addEventListener('input', function () { toccato = true; });
    titolo.addEventListener('input', function () {
      if (toccato) return;
      slug.value = titolo.value.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    });
  }

  /* Le azioni in blocco: il pulsante si accende solo quando c'è qualcosa da
     fare, e la casella in cima le seleziona tutte. */
  var tutte = document.getElementById('scegli-tutte');
  var caselle = Array.prototype.slice.call(document.querySelectorAll('input[name="scelti[]"]'));
  var azioni = document.getElementById('azioni-blocco');

  function contaScelti() {
    if (!azioni) return;
    var quanti = caselle.filter(function (c) { return c.checked; }).length;
    azioni.querySelectorAll('button, select').forEach(function (el) { el.disabled = quanti === 0; });
    var etichetta = azioni.querySelector('[data-quanti]');
    if (etichetta) {
      etichetta.textContent = quanti === 0 ? 'nessuno selezionato'
        : quanti === 1 ? 'uno selezionato' : quanti + ' selezionati';
    }
  }

  if (tutte) {
    tutte.addEventListener('change', function () {
      caselle.forEach(function (c) { c.checked = tutte.checked; });
      contaScelti();
    });
  }
  caselle.forEach(function (c) { c.addEventListener('change', contaScelti); });
  contaScelti();

  /* ── Quello che fino al 16 ottobre 2026 stava scritto dentro le pagine ──
     Tre <script> in linea (scheda articolo, immagini, messaggi) e un onclick
     nell'elenco degli articoli. Una CSP che vieta gli script in linea li
     fermava tutti, ed è per non romperli che dal 3 ottobre l'.htaccess
     mandava 'unsafe-inline' (revisione del 16 ottobre, G2). Adesso stanno
     qui, e ogni blocco parte solo se la sua pagina ha gli elementi che usa. */

  /* Scheda articolo: la copertina scelta dalla libreria. */
  var sceltaCopertina = document.getElementById('scegli-copertina');
  if (sceltaCopertina) {
    var campoCopertina = document.getElementById('campo-copertina');
    var boxCopertina = document.getElementById('anteprima-copertina');
    var nomeCopertina = document.getElementById('nome-copertina');

    var dipingiCopertina = function (url, etichetta) {
      boxCopertina.innerHTML = '';
      if (url) {
        var img = document.createElement('img');
        img.src = url; img.alt = '';
        boxCopertina.appendChild(img);
      }
      nomeCopertina.textContent = etichetta || 'Nessuna copertina.';
    };

    sceltaCopertina.addEventListener('click', function () {
      if (typeof window.spApriLibreria !== 'function') return;
      window.spApriLibreria(function (m) {
        campoCopertina.value = m.url;
        dipingiCopertina(m.url, m.nome);
      });
    });

    var togliCopertina = document.getElementById('togli-copertina');
    if (togliCopertina) {
      togliCopertina.addEventListener('click', function () {
        campoCopertina.value = '';
        dipingiCopertina('', '');
      });
    }
  }

  /* Scheda articolo: l'eco dello slug sotto il campo. */
  var ecoSlug = document.getElementById('eco-slug');
  if (slug && ecoSlug) {
    slug.addEventListener('input', function () { ecoSlug.textContent = slug.value || 'indirizzo'; });
    if (titolo) {
      titolo.addEventListener('input', function () { ecoSlug.textContent = slug.value || 'indirizzo'; });
    }
  }

  /* Immagini: copia dell'indirizzo. */
  var esitoCopia = document.getElementById('esito-copia');
  if (esitoCopia) {
    document.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-copia]');
      if (!b) return;
      var url = b.getAttribute('data-copia');
      var detto = function (t, tipo) { esitoCopia.textContent = t; esitoCopia.setAttribute('data-tipo', tipo); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          function () { detto('Indirizzo copiato: ' + url, 'ok'); },
          function () { detto('Non sono riuscito a copiare. Eccolo: ' + url, 'no'); }
        );
      } else {
        detto('Eccolo: ' + url, 'no');
      }
    });
  }

  /* ── La sessione viva mentre si scrive ─────────────────────────────────
     Sui moduli lunghi (scheda articolo, newsletter) ogni cinque minuti si
     chiede ad admin/ping.php quanto resta. Se nel frattempo si è scritto, la
     sessione si rinnova; se no, si chiede soltanto. Un quarto d'ora prima
     della fine compare un avviso; a sessione finita, il link per rientrare in
     un'altra scheda. Il testo intanto è nella bozza del browser (editor.js).
     È il segnale di FDCA (revisione del 16 ottobre, M6). */
  var tieniViva = document.querySelector('form[data-tieni-viva]');
  if (tieniViva && window.fetch) {
    var scritto = false;
    tieniViva.addEventListener('input', function () { scritto = true; });

    var avvisoSessione = document.createElement('p');
    avvisoSessione.className = 'avviso';
    avvisoSessione.setAttribute('role', 'status');
    avvisoSessione.hidden = true;
    tieniViva.insertBefore(avvisoSessione, tieniViva.firstChild);

    var dici = function (testo, cattivo, link) {
      avvisoSessione.textContent = testo;
      avvisoSessione.className = cattivo ? 'avviso avviso-no' : 'avviso';
      if (link) {
        var a = document.createElement('a');
        a.href = '/admin/entra.php?torna=' + encodeURIComponent(location.pathname + location.search);
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = ' Rientra in un’altra scheda';
        avvisoSessione.appendChild(a);
        avvisoSessione.appendChild(document.createTextNode(', poi torna qui e premi Salva.'));
      }
      avvisoSessione.hidden = false;
    };

    var chiedi = function () {
      var attivo = scritto ? '1' : '0';
      scritto = false;
      fetch('/admin/ping.php?attivo=' + attivo, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json().then(function (d) { return { codice: r.status, d: d }; }); })
        .then(function (x) {
          if (x.codice === 401 || !x.d || x.d.stato !== 'viva') {
            dici('La sessione del pannello è scaduta. Quello che hai scritto è al sicuro in questo browser.', true, true);
            return;
          }
          /* Il gettone può essere cambiato, se si è rientrati da un'altra
             scheda: si aggiorna quello del modulo, o «Salva» lo troverebbe vecchio. */
          if (x.d.gettone) {
            tieniViva.querySelectorAll('input[name="gettone"]').forEach(function (c) { c.value = x.d.gettone; });
          }
          if (x.d.resta < 900) {
            var minuti = Math.max(1, Math.ceil(x.d.resta / 60));
            dici(x.d.motivo === 'durata'
              ? 'Fra ' + minuti + ' minuti finiscono le dodici ore di questa sessione: salva adesso, poi rientra.'
              : 'Fra ' + minuti + ' minuti la sessione si chiude, se non scrivi niente.', false, false);
          } else {
            avvisoSessione.hidden = true;
          }
        })
        .catch(function () { /* niente rete: si riprova al giro dopo */ });
    };
    setInterval(chiedi, 5 * 60 * 1000);
  }

  /* Messaggi: la casella che li sceglie tutti e il conto dei selezionati. */
  var moduloMassa = document.getElementById('modulo-massa');
  var tuttiMessaggi = document.getElementById('scegli-tutti');
  var contaMessaggi = document.getElementById('conta-scelti');
  if (moduloMassa && tuttiMessaggi && contaMessaggi) {
    var caselleMessaggi = function () { return moduloMassa.querySelectorAll('input[name="scelti[]"]'); };
    var aggiornaMessaggi = function () {
      var n = 0, tot = caselleMessaggi().length;
      caselleMessaggi().forEach(function (c) { if (c.checked) n++; });
      contaMessaggi.textContent = n === 0 ? 'Nessuno selezionato'
        : (n === 1 ? '1 messaggio selezionato' : n + ' messaggi selezionati');
      tuttiMessaggi.checked = n > 0 && n === tot;
      tuttiMessaggi.indeterminate = n > 0 && n < tot;
    };
    tuttiMessaggi.addEventListener('change', function () {
      caselleMessaggi().forEach(function (c) { c.checked = tuttiMessaggi.checked; });
      aggiornaMessaggi();
    });
    moduloMassa.addEventListener('change', function (e) { if (e.target.name === 'scelti[]') aggiornaMessaggi(); });
    aggiornaMessaggi();
  }
})();

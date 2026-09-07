/* seo-check.js — il verificatore della scheda articolo.
 *
 * Torna a casa. Era nato qui come SeoScorePanel.tsx, è passato al Festival il
 * 7 settembre quando i tre siti sono stati parificati, e adesso rientra senza
 * React con le soglie unificate e un controllo in più — i tag, che gli altri
 * due siti non hanno. Legge i
 * campi del modulo, guarda il corpo dell'articolo attraverso l'editor, e a
 * ogni tasto ridisegna nove controlli con un punteggio da 0 a 100. Tutto nel
 * browser, nessuna chiamata al server.
 *
 * Le soglie sono quelle decise il 07/09/2026 per i tre siti (Festival,
 * Runtime Radio, SimonePizzi): se cambiano qui devono cambiare anche là.
 *
 *   titolo articolo        30-65 caratteri
 *   titolo per Google      ≤ 60 (vuoto: si valuta il titolo dell'articolo)
 *   descrizione per Google 120-158 ottimale; sotto 80 o sopra 165 è un avviso
 *                          (vuota: si valuta il sommario)
 *   copertina              presente
 *   corpo                  ≥ 300 parole (sotto 100 è un errore)
 *   struttura              almeno un H2 o un H3
 *   parola chiave          nel titolo, nella descrizione, nel corpo (dosata:
 *                          circa una ogni 100 parole, minimo 4) — tre punti
 *
 * Nessun punto «regalato» per aver compilato un campo: ogni riga dice
 * esattamente che cosa manca.
 */
(function () {
  'use strict';

  var box = document.getElementById('seo-check');
  if (!box) return;
  var form = box.closest('form');
  if (!form) return;

  function val(name) { var f = form.elements[name]; return f ? String(f.value || '') : ''; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function stripHtml(html) { return String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function countWords(text) { var t = stripHtml(text); return t ? t.split(/\s+/).length : 0; }
  /** Confronto insensibile ad accenti e maiuscole: «perché» trova «PERCHE'». */
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function len(s) { return String(s || '').trim().length; }

  function bodyHtml() {
    if (window.spEditor && window.spEditor.instance) return window.spEditor.instance.getHTML();
    return val('content');
  }

  function compute() {
    var title = val('title').trim();
    var seoTitle = val('seo_title').trim();
    var excerpt = val('excerpt').trim();
    var seoDesc = val('seo_description').trim();
    var cover = val('cover_image').trim();
    var kw = val('focus_keyword').trim();
    var content = bodyHtml();
    var checks = [];
    var score = 0;
    var MAX = 10;   // nove come gli altri due siti, più i tag, che solo questo ha

    // 1. Titolo dell'articolo
    var tl = len(title);
    if (tl === 0) checks.push({ l: 'Titolo', s: 'err', m: 'Il titolo è vuoto.' });
    else if (tl < 30) { checks.push({ l: 'Titolo', s: 'warn', m: 'Corto (' + tl + ' caratteri, minimo consigliato 30): aggiungi contesto.' }); score += 0.5; }
    else if (tl > 65) { checks.push({ l: 'Titolo', s: 'warn', m: 'Lungo (' + tl + ' caratteri): oltre 65 Google lo taglia. Se non vuoi accorciarlo, scrivi un «Titolo per Google».' }); score += 0.5; }
    else { checks.push({ l: 'Titolo', s: 'ok', m: 'Lunghezza giusta (' + tl + ' caratteri).' }); score += 1; }

    // 2. Titolo per Google: quello scritto a mano, altrimenti il titolo dell'articolo
    var gt = seoTitle || title;
    var gtl = len(gt);
    var gtLabel = seoTitle ? 'Titolo per Google' : 'Titolo per Google (= titolo)';
    if (gtl === 0) checks.push({ l: gtLabel, s: 'err', m: 'Niente da mostrare nei risultati di ricerca.' });
    else if (gtl > 60) { checks.push({ l: gtLabel, s: 'warn', m: gtl + ' caratteri: sopra i 60 Google taglia. ' + (seoTitle ? 'Accorcialo.' : 'Scrivi un titolo per Google più corto.') }); score += 0.5; }
    else { checks.push({ l: gtLabel, s: 'ok', m: gtl + ' caratteri: entra tutto.' }); score += 1; }

    // 3. Descrizione per Google: quella scritta a mano, altrimenti il sommario
    var gd = seoDesc || excerpt;
    var gdl = len(gd);
    var gdLabel = seoDesc ? 'Descrizione per Google' : 'Descrizione per Google (= sommario)';
    if (gdl === 0) checks.push({ l: gdLabel, s: 'err', m: 'Vuota: Google inventerà una riga a caso dal testo.' });
    else if (gdl < 80) { checks.push({ l: gdLabel, s: 'warn', m: 'Corta (' + gdl + ' caratteri, minimo 80): dì che cosa ci si trova.' }); score += 0.5; }
    else if (gdl > 165) { checks.push({ l: gdLabel, s: 'warn', m: 'Lunga (' + gdl + ' caratteri): oltre 165 Google taglia.' }); score += 0.5; }
    else if (gdl < 120 || gdl > 158) { checks.push({ l: gdLabel, s: 'ok', m: gdl + ' caratteri: accettabile (l’ideale è fra 120 e 158).' }); score += 1; }
    else { checks.push({ l: gdLabel, s: 'ok', m: gdl + ' caratteri: lunghezza ideale.' }); score += 1; }

    // 4. Copertina
    if (!cover) checks.push({ l: 'Copertina', s: 'err', m: 'Manca: è l’immagine delle anteprime social (og:image).' });
    else { checks.push({ l: 'Copertina', s: 'ok', m: 'Presente.' }); score += 1; }

    // 5. Lunghezza del corpo
    var words = countWords(content);
    if (words < 100) checks.push({ l: 'Lunghezza', s: 'err', m: 'Troppo breve (' + words + ' parole). Minimo consigliato: 300.' });
    else if (words < 300) { checks.push({ l: 'Lunghezza', s: 'warn', m: words + ' parole: Google preferisce almeno 300.' }); score += 0.5; }
    else { checks.push({ l: 'Lunghezza', s: 'ok', m: words + ' parole (~' + Math.max(1, Math.ceil(words / 200)) + ' min di lettura).' }); score += 1; }

    // 6. Struttura
    var hasH = /<h[23][\s>]/i.test(content);
    if (!hasH) checks.push({ l: 'Struttura', s: 'warn', m: 'Nessun titolo di sezione (H2/H3): spezza il testo.' });
    else { checks.push({ l: 'Struttura', s: 'ok', m: 'Ci sono titoli di sezione.' }); score += 1; }

    // 7-9. Parola chiave: dove deve comparire davvero
    var k = norm(kw);
    if (!k) {
      var nota = 'Scrivi la parola chiave principale (nel riquadro «Come esce su Google»): vale 3 punti su 9.';
      checks.push({ l: 'Chiave nel titolo', s: 'warn', m: nota });
      checks.push({ l: 'Chiave nella descrizione', s: 'warn', m: nota });
      checks.push({ l: 'Chiave nel testo', s: 'warn', m: nota });
    } else {
      var plain = norm(stripHtml(content));
      var inTitle = norm(gt).indexOf(k) !== -1 || norm(title).indexOf(k) !== -1;
      var inDesc = norm(gd).indexOf(k) !== -1;
      var heads = (content.match(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi) || []).join(' ');
      var inHead = norm(stripHtml(heads)).indexOf(k) !== -1;
      var occ = plain.split(k).length - 1;
      var q = '«' + kw + '»';

      if (inTitle) { checks.push({ l: 'Chiave nel titolo', s: 'ok', m: q + ' compare nel titolo.' }); score += 1; }
      else checks.push({ l: 'Chiave nel titolo', s: 'warn', m: q + ' non compare nel titolo, che è la riga cliccabile nei risultati.' });

      if (inDesc) { checks.push({ l: 'Chiave nella descrizione', s: 'ok', m: q + ' compare nella descrizione per Google.' }); score += 1; }
      else checks.push({ l: 'Chiave nella descrizione', s: 'warn', m: q + ' non compare nella riga che si legge sotto il link.' });

      var maxSensible = Math.max(4, Math.round(words / 100));
      if (occ === 0) checks.push({ l: 'Chiave nel testo', s: 'err', m: q + ' non compare mai nell’articolo. Se il pezzo parla di questo, dovrebbe esserci.' });
      else if (occ > maxSensible) { checks.push({ l: 'Chiave nel testo', s: 'warn', m: 'Ripetuta ' + occ + ' volte in ' + words + ' parole: troppe, suona forzata (limite consigliato ' + maxSensible + ').' }); score += 0.5; }
      else { checks.push({ l: 'Chiave nel testo', s: 'ok', m: 'Citata ' + occ + (occ === 1 ? ' volta' : ' volte') + (inHead ? ', anche in un titolo di sezione' : '') + ': dosaggio giusto.' }); score += 1; }
    }

    /* 10. I tag — solo questo dei tre siti li ha.
       Da 2 a 8. Sotto, l'articolo non entra in nessun archivio; sopra, i tag
       smettono di raggruppare e diventano etichette usa e getta: è così che
       questo sito si è ritrovato con duecento tag usati una volta sola. */
    var tags = val('tags').split(',').map(function (t) { return t.trim(); })
                          .filter(function (t) { return t !== ''; });
    if (tags.length === 0) {
      checks.push({ l: 'Tag', s: 'err', m: 'Nessun tag: l’articolo non comparirà in nessun archivio trasversale.' });
    } else if (tags.length === 1) {
      checks.push({ l: 'Tag', s: 'warn', m: 'Un tag solo: aggiungine almeno un altro, meglio se già usato da altri articoli.' });
      score += 0.5;
    } else if (tags.length > 8) {
      checks.push({ l: 'Tag', s: 'warn', m: tags.length + ' tag sono troppi: quando etichetti tutto non raggruppi niente.' });
      score += 0.5;
    } else {
      checks.push({ l: 'Tag', s: 'ok', m: tags.length + ' tag: numero giusto.' });
      score += 1;
    }

    return { checks: checks, score: Math.round((score / MAX) * 100), words: words };
  }

  function render() {
    var r = compute();
    var tone = r.score >= 80 ? 'ok' : r.score >= 50 ? 'warn' : 'err';
    var label = r.score >= 80 ? 'Ottimizzato' : r.score >= 50 ? 'Da migliorare' : 'Critico';
    var html = '<div class="voto">'
      + '<b>' + r.score + '</b>'
      + '<div class="barra-voto"><i style="width:' + r.score + '%"></i></div>'
      + '<span class="eti spento">' + label + ' · ' + r.words + ' parole · '
      + Math.max(1, Math.ceil(r.words / 200)) + ' min</span>'
      + '</div><ul class="controlli">';
    r.checks.forEach(function (c) {
      var classe = c.s === 'ok' ? 'si' : c.s === 'warn' ? 'ni' : 'no';
      var segno = c.s === 'ok' ? '&#10003;' : c.s === 'warn' ? '&#9651;' : '&#10007;';
      html += '<li class="' + classe + '"><span class="segno">' + segno + '</span>'
            + '<div><b>' + esc(c.l) + '</b><small>' + esc(c.m) + '</small></div></li>';
    });
    box.innerHTML = html + '</ul>';
  }

  var t = null;
  function schedule() { clearTimeout(t); t = setTimeout(render, 150); }
  form.addEventListener('input', schedule);
  form.addEventListener('change', schedule);
  document.addEventListener('fdca:editor-change', schedule);
  render();
})();

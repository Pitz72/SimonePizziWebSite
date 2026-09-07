/* editor.js — l'editor del pannello.
 *
 * Arriva da FDCA-PHP/public/assets/js/editor.js, dove è in produzione dalla
 * v1.14.0, e con lui arrivano le cose che costa mesi imparare: l'incolla che
 * riconosce il markdown, la pulizia di quello che esce da Word e da Google
 * Docs, i video YouTube, la bozza salvata in locale, e una lista bianca di tag
 * e attributi gemella di quella di safe_html() sul server — se le due
 * divergono, l'autore scrive cose che il sito butta via senza dirglielo.
 *
 * Tre differenze rispetto all'originale, tutte di questo sito:
 *   - le TABELLE sono ammesse e c'è un comando per inserirle: il conto dice
 *     che dieci articoli ne contengono, con 170 celle;
 *   - c'è il comando «Link interno», che cerca un articolo e ne inserisce
 *     l'indirizzo giusto invece di farlo copiare a mano dalla barra del browser;
 *   - i nomi globali sono spEditor e spApriLibreria.
 *
 * Se si tocca la lista ALLOWED qui sotto, si tocca anche HTML_AMMESSO in
 * public/lib/safe_html.php. Sono la stessa cosa scritta in due linguaggi.
 */
(function () {
  'use strict';

  /* =====================================================================
   * 0. Guardie sugli URL — specchio di $safeUrl in safe_html()
   * ===================================================================== */

  function hasControlChars(s) {
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      if (c < 0x20 || c === 0x7f) return true;
    }
    return false;
  }

  /** Default-deny: vero solo per URL palesemente sicuri. */
  function isSafeUrl(url) {
    var u = String(url || '').trim();
    if (u === '' || hasControlChars(u)) return false;
    if (u.charAt(0) === '/' || u.charAt(0) === '#' || u.charAt(0) === '?') return true;
    if (/^(https?:)?\/\//i.test(u)) return true;
    if (/^(mailto|tel):/i.test(u)) return true;
    return false;
  }

  /** «festival.it» vuol dire un sito: senza schema si assume https. */
  function normalizeUrl(url) {
    var u = String(url || '').trim();
    if (u === '') return u;
    if (/^[\/#?]/.test(u) || u.indexOf('//') === 0) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return u;   // uno schema c'è già: non si tocca
    return 'https://' + u;
  }

  var YT_EMBED = 'https://www.youtube-nocookie.com/embed/';

  /** L'id del video da un URL YouTube (o da un id nudo di 11 caratteri), o null. */
  function youtubeId(input) {
    var s = String(input || '').trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
    var u = normalizeUrl(s);
    if (!isSafeUrl(u)) return null;
    var m;
    try {
      var url = new URL(u, 'https://www.festivaldellacanzoneartificiale.it');
      var host = url.hostname.replace(/^www\./i, '').replace(/^m\./i, '').toLowerCase();
      if (host === 'youtu.be') {
        m = url.pathname.match(/^\/([A-Za-z0-9_-]{11})/);
        return m ? m[1] : null;
      }
      if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
        var v = url.searchParams.get('v');
        if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
        m = url.pathname.match(/^\/(?:embed|shorts|live|v)\/([A-Za-z0-9_-]{11})/);
        return m ? m[1] : null;
      }
    } catch (e) { return null; }
    return null;
  }

  /* =====================================================================
   * 1. Markdown → HTML
   * ===================================================================== */

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var TOK = String.fromCharCode(0);

  /** I segni inline di una riga già escapata. I code span si proteggono per primi. */
  function inline(src) {
    var codes = [];
    var s = src.replace(/`([^`]+)`/g, function (_m, c) {
      codes.push('<code>' + c + '</code>');
      return TOK + (codes.length - 1) + TOK;
    });
    // Un livello di parentesi bilanciate nell'URL: wikipedia.org/wiki/Roma_(città)
    var URL_PART = '((?:[^()\\s]|\\([^()\\s]*\\))+)';
    var imgRe = new RegExp('!\\[([^\\]]*)\\]\\(' + URL_PART + '\\)', 'g');
    var linkRe = new RegExp('\\[([^\\]]+)\\]\\(' + URL_PART + '\\)', 'g');
    s = s.replace(imgRe, function (_m, alt, url) {
      var u = normalizeUrl(url);
      return isSafeUrl(u) ? '<img src="' + u + '" alt="' + alt + '">' : alt;
    });
    s = s.replace(linkRe, function (_m, txt, url) {
      var u = normalizeUrl(url);
      return isSafeUrl(u) ? '<a href="' + u + '">' + txt + '</a>' : txt;
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*\s][^*]*)\*/g, '<em>$1</em>');
    s = s.replace(/~~([^~]+)~~/g, '<s>$1</s>');
    return s.replace(new RegExp(TOK + '([0-9]+)' + TOK, 'g'), function (_m, i) { return codes[Number(i)]; });
  }

  var HR_RE = /^(?:-{3,}|\*{3,}|_{3,})\s*$/;
  function isBlockStart(l) {
    return /^(#{1,6}\s|>|```|\s*[-*+]\s+\S|\s*\d+[.)]\s+\S)/.test(l) || HR_RE.test(l);
  }

  /**
   * Converte un blocco di markdown in HTML pronto per l'editor.
   * Differenza dichiarata rispetto a Runtime: qui il corpo non può avere un
   * H1 (è il titolo della pagina), quindi `# Titolo` diventa un H2, e i
   * livelli 5 e 6 si appoggiano al 4 — la scala è quella di safe_html().
   */
  function markdownToHtml(md) {
    var lines = String(md || '').replace(/\r\n?/g, '\n').split('\n');
    var out = [];
    var i = 0, line, buf, items, h, level;
    while (i < lines.length) {
      line = lines[i];

      if (/^```/.test(line)) {
        buf = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++;
        out.push('<pre><code>' + esc(buf.join('\n')) + '</code></pre>');
        continue;
      }
      if (/^\s*$/.test(line)) { i++; continue; }

      h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        level = Math.min(Math.max(h[1].length, 2), 4);
        out.push('<h' + level + '>' + inline(esc(h[2])) + '</h' + level + '>');
        i++; continue;
      }
      if (HR_RE.test(line)) { out.push('<hr>'); i++; continue; }

      if (/^>\s?/.test(line)) {
        buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, '')); i++; }
        out.push('<blockquote><p>' + inline(esc(buf.join(' '))) + '</p></blockquote>');
        continue;
      }
      if (/^\s*[-*+]\s+\S/.test(line)) {
        items = [];
        while (i < lines.length && /^\s*[-*+]\s+\S/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*+]\s+/, '')); i++; }
        out.push('<ul>' + items.map(function (t) { return '<li>' + inline(esc(t)) + '</li>'; }).join('') + '</ul>');
        continue;
      }
      if (/^\s*\d+[.)]\s+\S/.test(line)) {
        items = [];
        while (i < lines.length && /^\s*\d+[.)]\s+\S/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+[.)]\s+/, '')); i++; }
        out.push('<ol>' + items.map(function (t) { return '<li>' + inline(esc(t)) + '</li>'; }).join('') + '</ol>');
        continue;
      }
      // Paragrafo: righe consecutive fino a una riga vuota o a un blocco.
      buf = [line]; i++;
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !isBlockStart(lines[i])) { buf.push(lines[i]); i++; }
      out.push('<p>' + buf.map(function (l) { return inline(esc(l)); }).join('<br>') + '</p>');
    }
    return out.join('');
  }

  /**
   * Vero se il testo semplice incollato somiglia a markdown. A punteggio: i
   * segni di blocco pesano più di quelli inline e ne servono almeno due punti,
   * così «riunione alle 9*» o una riga che inizia con un trattino non scatenano
   * la conversione, un `# Titolo` da solo sì.
   */
  function looksLikeMarkdown(text) {
    var t = String(text || ''), score = 0, ul, ol;
    if (/^#{1,6}\s+\S/m.test(t)) score += 2;
    if (/^```/m.test(t)) score += 2;
    if (/^>\s?\S/m.test(t)) score += 1;
    ul = t.match(/^\s*[-*+]\s+\S/gm);
    if (ul) score += ul.length >= 2 ? 2 : 1;
    ol = t.match(/^\s*\d+[.)]\s+\S/gm);
    if (ol && ol.length >= 2) score += 2;
    if (/\*\*[^*\n]+\*\*/.test(t)) score += 1;
    if (/\[[^\]\n]+\]\([^)\s]+\)/.test(t)) score += 2;
    if (/`[^`\n]+`/.test(t)) score += 1;
    if (/~~[^~\n]+~~/.test(t)) score += 1;
    return score >= 2;
  }

  /** Testo semplice che NON è markdown: paragrafi sulle righe vuote, <br> sulle altre. */
  function plainToHtml(text) {
    var parts = String(text || '').replace(/\r\n?/g, '\n').split(/\n{2,}/);
    return parts.filter(function (p) { return p.trim() !== ''; }).map(function (p) {
      return '<p>' + p.split('\n').map(esc).join('<br>') + '</p>';
    }).join('');
  }

  /* =====================================================================
   * 2. Pulizia dell'HTML — la stessa allowlist di safe_html()
   * ===================================================================== */

  var ALLOWED = {
    p: [], br: [], strong: [], em: [], u: [], s: [],
    ul: [], ol: [], li: [], h2: [], h3: [], h4: [],
    blockquote: ['cite'], pre: [], code: [], hr: [],
    figure: ['class'], figcaption: [],
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    iframe: ['src', 'title', 'allow', 'allowfullscreen', 'loading'],
    /* Le tabelle: gemelle di HTML_AMMESSO in lib/safe_html.php. Dieci articoli
       ne contengono, quindi passano. */
    table: [], thead: [], tbody: [], tfoot: [], tr: [],
    th: ['colspan', 'rowspan', 'scope'], td: ['colspan', 'rowspan']
  };
  var RENAME = { b: 'strong', i: 'em', strike: 's', del: 's', h1: 'h2', h5: 'h4', h6: 'h4' };
  /* Di questi si butta anche il contenuto: non hanno testo che valga la pena tenere. */
  var DROP = { script: 1, style: 1, object: 1, embed: 1, form: 1, svg: 1, head: 1, meta: 1, link: 1, title: 1, noscript: 1, template: 1, button: 1, input: 1, select: 1, textarea: 1 };
  var BLOCKS = { p: 1, h2: 1, h3: 1, h4: 1, ul: 1, ol: 1, li: 1, blockquote: 1, pre: 1, figure: 1, hr: 1, figcaption: 1,
                 table: 1, thead: 1, tbody: 1, tfoot: 1, tr: 1, th: 1, td: 1 };
  /* Contenitori sconosciuti: se dentro hanno solo testo e inline diventano un
     paragrafo (un <div> di Google Docs, una cella di tabella), se dentro hanno
     blocchi si spogliano e i blocchi restano. */
  var CONTAINERS = { div: 1, section: 1, article: 1, dd: 1, dt: 1, center: 1, header: 1, footer: 1, main: 1, aside: 1, nav: 1, address: 1, summary: 1, details: 1 };

  function isBlock(node) { return node.nodeType === 1 && BLOCKS[node.tagName.toLowerCase()] === 1; }
  function hasBlockChildren(node) {
    for (var c = node.firstElementChild; c; c = c.nextElementSibling) {
      var t = c.tagName.toLowerCase();
      if (BLOCKS[t] || CONTAINERS[t] || t === 'table' || t === 'tr' || t === 'tbody' || t === 'thead' || t === 'dl') return true;
    }
    return false;
  }
  function trimBreaks(el) {
    while (el.firstChild && ((el.firstChild.nodeType === 1 && el.firstChild.tagName === 'BR') || (el.firstChild.nodeType === 3 && el.firstChild.nodeValue.trim() === ''))) el.removeChild(el.firstChild);
    while (el.lastChild && ((el.lastChild.nodeType === 1 && el.lastChild.tagName === 'BR') || (el.lastChild.nodeType === 3 && el.lastChild.nodeValue.trim() === ''))) el.removeChild(el.lastChild);
  }

  /** Un <span style="font-weight:700"> di Google Docs è un grassetto: si traduce prima di sparire. */
  function styledWrappers(el, doc) {
    var st = el.getAttribute && el.getAttribute('style');
    if (!st) return null;
    st = st.toLowerCase();
    var wrappers = [];
    if (/font-weight\s*:\s*(bold|bolder|[6-9]00)/.test(st)) wrappers.push('strong');
    if (/font-style\s*:\s*italic/.test(st)) wrappers.push('em');
    if (/text-decoration(?:-line)?\s*:\s*[^;]*underline/.test(st)) wrappers.push('u');
    if (/text-decoration(?:-line)?\s*:\s*[^;]*line-through/.test(st)) wrappers.push('s');
    if (!wrappers.length) return null;
    var outer = null, inner = null;
    wrappers.forEach(function (t) {
      var w = doc.createElement(t);
      if (inner) inner.appendChild(w); else outer = w;
      inner = w;
    });
    return { outer: outer, inner: inner };
  }

  function unwrap(el) {
    var parent = el.parentNode;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  }

  function isEmptyBlock(el) {
    if (el.querySelector('img,iframe,hr,figure')) return false;
    return el.textContent.replace(/\u00a0/g, ' ').trim() === '';
  }

  function walk(node, doc, inPre) {
    var children = Array.prototype.slice.call(node.childNodes);
    children.forEach(function (child) {
      if (child.nodeType === 3) {
        if (!inPre) child.nodeValue = child.nodeValue.replace(/\u00a0/g, ' ');
        return;
      }
      if (child.nodeType !== 1) { node.removeChild(child); return; }   // commenti, PI

      var tag = child.tagName.toLowerCase();
      if (DROP[tag]) { node.removeChild(child); return; }

      /* Google Docs incolla <b style="font-weight:normal"> attorno a tutto:
         un grassetto che dice di non esserlo. Si spoglia, non si traduce. */
      if (tag === 'b' && /font-weight\s*:\s*(normal|400)/i.test(child.getAttribute('style') || '')) {
        walk(child, doc, inPre); unwrap(child); return;
      }

      if (RENAME[tag]) {
        var renamed = doc.createElement(RENAME[tag]);
        while (child.firstChild) renamed.appendChild(child.firstChild);
        node.replaceChild(renamed, child);
        child = renamed; tag = RENAME[tag];
      }

      walk(child, doc, inPre || tag === 'pre');

      if (CONTAINERS[tag]) {
        if (hasBlockChildren(child)) { unwrap(child); return; }
        var asP = doc.createElement('p');
        while (child.firstChild) asP.appendChild(child.firstChild);
        node.replaceChild(asP, child);
        child = asP; tag = 'p';
      }

      if (!ALLOWED[tag]) {
        var wr = styledWrappers(child, doc);
        if (wr) {
          while (child.firstChild) wr.inner.appendChild(child.firstChild);
          node.replaceChild(wr.outer, child);
        } else {
          unwrap(child);
        }
        return;
      }

      /* Attributi: solo quelli in allowlist, e gli URL passano dalla guardia. */
      Array.prototype.slice.call(child.attributes).forEach(function (a) {
        var name = a.name.toLowerCase();
        if (ALLOWED[tag].indexOf(name) === -1) { child.removeAttribute(a.name); return; }
        if (name === 'href' || name === 'src') {
          var clean = normalizeUrl(a.value);
          if (!isSafeUrl(clean)) child.removeAttribute(a.name); else child.setAttribute(name, clean);
        }
        if ((name === 'width' || name === 'height') && !/^\d+$/.test(a.value)) child.removeAttribute(a.name);
      });

      if (tag === 'a') {
        if (!child.getAttribute('href')) { unwrap(child); return; }
        if (child.getAttribute('target')) child.setAttribute('rel', 'noopener noreferrer');
      }
      if (tag === 'img' && !child.getAttribute('src')) { node.removeChild(child); return; }
      if (tag === 'iframe') {
        var src = child.getAttribute('src') || '';
        var m = src.match(/^https:\/\/www\.youtube-nocookie\.com\/embed\/([A-Za-z0-9_-]{11})(?:[?#].*)?$/);
        var id = m ? m[1] : youtubeId(src);
        if (!id) { node.removeChild(child); return; }
        setYoutubeAttrs(child, id);
        child.textContent = '';
      }
      if (tag === 'figure') {
        var hasVideo = !!child.querySelector('iframe');
        if (hasVideo) child.setAttribute('class', 'video'); else child.removeAttribute('class');
        if (!hasVideo && !child.querySelector('img')) { unwrap(child); return; }
      }
      if (tag === 'li') {
        var ps = child.children;
        if (ps.length === 1 && ps[0].tagName === 'P') unwrap(ps[0]);
      }
      if (tag === 'p' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'li' || tag === 'figcaption') {
        trimBreaks(child);   // <br> in testa o in coda non dicono niente
      }
      if ((tag === 'p' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'li' || tag === 'blockquote' || tag === 'figcaption') && isEmptyBlock(child)) {
        node.removeChild(child);
      }
    });
  }

  /** Spazi bianchi: fuori da <pre> il browser li collassa comunque, tanto vale farlo prima. */
  function collapseWhitespace(root) {
    var it = root.ownerDocument.createTreeWalker(root, 4 /* SHOW_TEXT */);
    var n, list = [];
    while ((n = it.nextNode())) list.push(n);
    list.forEach(function (t) {
      if (t.parentNode.closest('pre')) return;
      t.nodeValue = t.nodeValue.replace(/[ \t\r\n]+/g, ' ');
      var p = t.parentNode;
      if (t === p.firstChild && (isBlock(p) || p === root)) t.nodeValue = t.nodeValue.replace(/^ /, '');
      if (t === p.lastChild && (isBlock(p) || p === root)) t.nodeValue = t.nodeValue.replace(/ $/, '');
      if (t.nodeValue === '') p.removeChild(t);
    });
  }

  function setYoutubeAttrs(iframe, id) {
    iframe.setAttribute('src', YT_EMBED + id);
    iframe.setAttribute('title', 'Video YouTube');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
    iframe.setAttribute('allowfullscreen', '');
  }

  /** Testo e inline sciolti fra i blocchi finiscono in un <p>; un <hr> o un iframe nudo prendono la loro cornice. */
  function wrapLoose(container, doc) {
    var run = [];
    function flush() {
      if (!run.length) return;
      var hasContent = run.some(function (n) {
        return n.nodeType === 1 ? (n.tagName === 'IMG' || n.textContent.trim() !== '' || n.tagName === 'BR') : n.nodeValue.trim() !== '';
      });
      if (hasContent) {
        var p = doc.createElement('p');
        container.insertBefore(p, run[0]);
        run.forEach(function (n) { p.appendChild(n); });
        // <br> in testa o in coda a un paragrafo non dicono niente
        while (p.firstChild && p.firstChild.nodeType === 1 && p.firstChild.tagName === 'BR') p.removeChild(p.firstChild);
        while (p.lastChild && p.lastChild.nodeType === 1 && p.lastChild.tagName === 'BR') p.removeChild(p.lastChild);
        if (isEmptyBlock(p)) container.removeChild(p);
      } else {
        run.forEach(function (n) { container.removeChild(n); });
      }
      run = [];
    }
    Array.prototype.slice.call(container.childNodes).forEach(function (n) {
      if (n.nodeType === 1 && n.tagName === 'IFRAME') {
        flush();
        var fig = doc.createElement('figure'); fig.setAttribute('class', 'video');
        container.insertBefore(fig, n); fig.appendChild(n);
        return;
      }
      if (isBlock(n) || (n.nodeType === 1 && (n.tagName === 'UL' || n.tagName === 'OL'))) { flush(); return; }
      run.push(n);
    });
    flush();
  }

  /**
   * Ripulisce un frammento HTML e lo restituisce nella forma che safe_html()
   * lascerebbe passare. Serve in entrata (incolla, caricamento) e in uscita
   * (consegna al textarea): è la stessa funzione, così i due lati non divergono.
   */
  function cleanHtml(html) {
    var doc = new DOMParser().parseFromString('<!DOCTYPE html><html><body><div id="fdca-ed-root">' + String(html || '') + '</div></body></html>', 'text/html');
    var root = doc.getElementById('fdca-ed-root');
    walk(root, doc, false);
    wrapLoose(root, doc);
    Array.prototype.slice.call(root.querySelectorAll('blockquote')).forEach(function (bq) { wrapLoose(bq, doc); });
    root.normalize();
    collapseWhitespace(root);
    /* Un paragrafo che contiene solo una figura: la figura esce, il paragrafo sparisce. */
    Array.prototype.slice.call(root.querySelectorAll('p > figure')).forEach(function (f) {
      var p = f.parentNode; p.parentNode.insertBefore(f, p); if (isEmptyBlock(p)) p.parentNode.removeChild(p);
    });
    return root.innerHTML;
  }

  /** L'HTML che va nel database: pulito, un blocco per riga, senza code vuote. */
  function serialize(area) {
    var html = cleanHtml(area.innerHTML);
    var doc = new DOMParser().parseFromString('<div id="r">' + html + '</div>', 'text/html');
    var root = doc.getElementById('r');
    while (root.lastChild && root.lastChild.nodeType === 1 && root.lastChild.tagName === 'P' && isEmptyBlock(root.lastChild)) root.removeChild(root.lastChild);
    var out = [];
    Array.prototype.slice.call(root.childNodes).forEach(function (n) {
      if (n.nodeType === 1) out.push(n.outerHTML);
      else if (n.nodeValue.trim() !== '') out.push('<p>' + esc(n.nodeValue.trim()) + '</p>');
    });
    return out.join('\n');
  }

  /* =====================================================================
   * 3. L'editor
   * ===================================================================== */

  function countWords(text) {
    var t = String(text || '').replace(/\u00a0/g, ' ').trim();
    return t ? t.split(/\s+/).length : 0;
  }

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }

  var TOOLS = [
    { cmd: 'undo', label: '↶', title: 'Annulla (Ctrl+Z)' },
    { cmd: 'redo', label: '↷', title: 'Ripristina (Ctrl+Y)' },
    { sep: true },
    { cmd: 'bold', label: 'B', title: 'Grassetto (Ctrl+B)', cls: 'ed-b' },
    { cmd: 'italic', label: 'I', title: 'Corsivo (Ctrl+I)', cls: 'ed-i' },
    { cmd: 'underline', label: 'U', title: 'Sottolineato (Ctrl+U)', cls: 'ed-u' },
    { cmd: 'strike', label: 'S', title: 'Barrato', cls: 'ed-s' },
    { sep: true },
    { cmd: 'ul', label: '• Elenco', title: 'Elenco puntato' },
    { cmd: 'ol', label: '1. Elenco', title: 'Elenco numerato' },
    { sep: true },
    { cmd: 'link', label: 'Link', title: 'Inserisci o togli un link' },
    { cmd: 'interno', label: 'Link interno', title: 'Cerca un articolo del sito e mettine il link' },
    { cmd: 'img', label: '+ Immagine', title: 'Immagine dalla libreria media', cls: 'ed-hot' },
    { cmd: 'yt', label: '▶ YouTube', title: 'Incorpora un video YouTube' },
    { cmd: 'tabella', label: 'Tabella', title: 'Inserisci una tabella 3×3 con intestazione' },
    { cmd: 'hr', label: '—', title: 'Riga di separazione' },
    { sep: true },
    { cmd: 'clear', label: 'Pulisci', title: 'Cancella la formattazione' }
  ];

  function mount(textarea) {
    var form = textarea.form;
    var wrap = el('div', { 'class': 'ed' });
    var tools = el('div', { 'class': 'ed-tools', role: 'toolbar', 'aria-label': 'Formattazione' });
    var blockSel = el('select', { 'class': 'a-select ed-block', 'aria-label': 'Tipo di blocco' },
      '<option value="p">Testo</option><option value="h2">Titolo H2</option><option value="h3">Titolo H3</option>' +
      '<option value="h4">Titolo H4</option><option value="blockquote">Citazione</option>');
    tools.appendChild(blockSel);
    var buttons = {};
    TOOLS.forEach(function (t) {
      if (t.sep) { tools.appendChild(el('span', { 'class': 'ed-sep' })); return; }
      var b = el('button', { type: 'button', title: t.title, 'data-cmd': t.cmd, 'class': t.cls || '' }, t.label);
      buttons[t.cmd] = b;
      tools.appendChild(b);
    });
    var pop = el('div', { 'class': 'ed-pop', hidden: '' },
      '<label class="ed-pop-label"></label><input type="text" class="ed-pop-input" spellcheck="false">' +
      '<div class="ed-pop-err" role="alert" hidden></div>' +
      '<div class="ed-pop-acts"><button type="button" class="a-btn a-btn--sm" data-pop="ok">Inserisci</button>' +
      '<button type="button" class="a-btn a-btn--ghost a-btn--sm" data-pop="cancel">Annulla</button></div>');
    var area = el('div', { 'class': 'ed-area article-body', contenteditable: 'true', spellcheck: 'true', 'aria-label': 'Corpo dell’articolo' });
    var foot = el('div', { 'class': 'ed-foot' }, '<span class="ed-count"></span><span class="ed-draft"></span>');

    wrap.appendChild(tools); wrap.appendChild(pop); wrap.appendChild(area); wrap.appendChild(foot);
    textarea.parentNode.insertBefore(wrap, textarea);
    textarea.classList.add('ed-src');
    form.classList.add('ed-mounted');

    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
      document.execCommand('styleWithCSS', false, false);
    } catch (e) { /* non tutti i browser accettano entrambe: la pulizia in uscita rimedia */ }

    area.innerHTML = cleanHtml(textarea.value) || '<p><br></p>';
    if (!area.firstChild) area.innerHTML = '<p><br></p>';

    /* ---- selezione: si salva per ridarla all'area dopo un popup ---- */
    var savedRange = null;
    function selectionInArea() {
      var sel = window.getSelection();
      if (!sel || !sel.rangeCount) return null;
      var r = sel.getRangeAt(0);
      return area.contains(r.commonAncestorContainer) ? r : null;
    }
    function restoreSelection() {
      area.focus();
      if (!savedRange) return;
      var sel = window.getSelection();
      sel.removeAllRanges(); sel.addRange(savedRange);
    }
    function closestBlock() {
      var r = selectionInArea(); if (!r) return null;
      var n = r.commonAncestorContainer;
      if (n.nodeType === 3) n = n.parentNode;
      while (n && n !== area) {
        if (isBlock(n) && n.tagName !== 'LI' && n.tagName !== 'FIGCAPTION') return n;
        n = n.parentNode;
      }
      return null;
    }
    function closestTag(tag) {
      var r = selectionInArea(); if (!r) return null;
      var n = r.commonAncestorContainer;
      if (n.nodeType === 3) n = n.parentNode;
      return n && n !== area ? n.closest(tag) : null;
    }
    function exec(cmd, val) {
      area.focus();
      document.execCommand(cmd, false, val == null ? null : val);
      onInput();
    }
    function insertHtml(html) {
      restoreSelection();
      document.execCommand('insertHTML', false, html);
      onInput();
    }

    /* ---- barra: riflette il punto in cui sta il cursore ---- */
    function refreshToolbar() {
      var inside = !!selectionInArea();
      if (inside) savedRange = window.getSelection().getRangeAt(0).cloneRange();
      var state = function (c) { try { return inside && document.queryCommandState(c); } catch (e) { return false; } };
      buttons.bold.classList.toggle('on', state('bold'));
      buttons.italic.classList.toggle('on', state('italic'));
      /* Sottolineato e barrato si leggono dall'albero, non da queryCommandState:
         Chrome risponde «sottolineato» dentro qualunque link, perché lo vede tale. */
      buttons.underline.classList.toggle('on', inside && !!closestTag('u'));
      buttons.strike.classList.toggle('on', inside && !!closestTag('s'));
      buttons.ul.classList.toggle('on', state('insertUnorderedList'));
      buttons.ol.classList.toggle('on', state('insertOrderedList'));
      var link = inside && closestTag('a');
      buttons.link.classList.toggle('on', !!link);
      buttons.link.textContent = link ? 'Togli link' : 'Link';
      var b = inside && closestBlock();
      var v = 'p';
      if (b) {
        var t = b.tagName.toLowerCase();
        if (t === 'h2' || t === 'h3' || t === 'h4' || t === 'blockquote') v = t;
        else if (b.closest('blockquote') && area.contains(b.closest('blockquote'))) v = 'blockquote';
      }
      blockSel.value = v;
    }
    document.addEventListener('selectionchange', refreshToolbar);

    /* ---- popup per link e YouTube ---- */
    var popMode = null;
    var popInput = pop.querySelector('.ed-pop-input');
    var popErr = pop.querySelector('.ed-pop-err');
    function openPop(mode, label, value, placeholder) {
      popMode = mode;
      pop.querySelector('.ed-pop-label').textContent = label;
      popInput.value = value || ''; popInput.placeholder = placeholder || '';
      popErr.hidden = true; pop.hidden = false;
      popInput.focus(); popInput.select();
    }
    function closePop() { pop.hidden = true; popMode = null; restoreSelection(); }
    function popError(msg) { popErr.textContent = msg; popErr.hidden = false; popInput.focus(); }
    function popOk() {
      var v = popInput.value.trim();
      if (!v) { closePop(); return; }
      if (popMode === 'link') {
        var u = normalizeUrl(v);
        if (!isSafeUrl(u)) { popError('Indirizzo non ammesso: usa http(s), mailto, tel o un percorso interno.'); return; }
        restoreSelection();
        if (savedRange && savedRange.collapsed) {
          document.execCommand('insertHTML', false, '<a href="' + esc(u) + '">' + esc(u) + '</a>');
        } else {
          document.execCommand('createLink', false, u);
        }
        pop.hidden = true; popMode = null; onInput();
        return;
      }
      if (popMode === 'yt') {
        var id = youtubeId(v);
        if (!id) { popError('Serve un link di YouTube (youtube.com o youtu.be) o l’id del video.'); return; }
        var f = document.createElement('figure'); f.className = 'video';
        var i = document.createElement('iframe'); setYoutubeAttrs(i, id); f.appendChild(i);
        pop.hidden = true; popMode = null;
        insertHtml(f.outerHTML + '<p><br></p>');
      }
    }
    pop.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pop]'); if (!b) return;
      if (b.getAttribute('data-pop') === 'ok') popOk(); else closePop();
    });
    popInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); popOk(); }
      if (e.key === 'Escape') { e.preventDefault(); closePop(); }
    });

    /* ---- comandi ---- */
    var COMMANDS = {
      undo: function () { exec('undo'); },
      redo: function () { exec('redo'); },
      bold: function () { exec('bold'); },
      italic: function () { exec('italic'); },
      underline: function () { exec('underline'); },
      strike: function () { exec('strikeThrough'); },
      ul: function () { exec('insertUnorderedList'); },
      ol: function () { exec('insertOrderedList'); },
      hr: function () { insertHtml('<hr><p><br></p>'); },
      clear: function () {
        exec('removeFormat'); exec('unlink');
        var b = closestBlock(); if (b && b.tagName !== 'P') exec('formatBlock', '<p>');
      },
      link: function () {
        var a = closestTag('a');
        if (a) {
          // Il cursore sta dentro un link: si toglie quello, tutto intero.
          var r = document.createRange(); r.selectNodeContents(a);
          var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
          exec('unlink'); return;
        }
        if (!selectionInArea()) { area.focus(); refreshToolbar(); }
        openPop('link', 'Indirizzo del link', '', 'https://…  oppure  /news/…');
      },
      yt: function () {
        if (!selectionInArea()) { area.focus(); refreshToolbar(); }
        openPop('yt', 'Link o id del video YouTube', '', 'https://www.youtube.com/watch?v=…');
      },
      /* Una tabella nasce già con l'intestazione: senza <th> la prima riga è
         una riga come le altre, e chi legge con un lettore di schermo non sa
         che cosa sta sentendo. */
      tabella: function () {
        if (!selectionInArea()) { area.focus(); refreshToolbar(); }
        var righe = '<table><thead><tr><th scope="col">Voce</th><th scope="col">Valore</th>' +
                    '<th scope="col">Nota</th></tr></thead><tbody>';
        for (var r = 0; r < 2; r++) righe += '<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>';
        righe += '</tbody></table>';
        insertHtml(righe + '<p><br></p>');
      },

      /* Il link interno: si cerca l'articolo per titolo e l'indirizzo lo mette
         il pannello. Copiarlo a mano dalla barra del browser vuol dire copiarlo
         sbagliato una volta su dieci — e un link interno rotto non se ne accorge
         nessuno finché non ci clicca un lettore. */
      interno: function () {
        if (!selectionInArea()) { area.focus(); refreshToolbar(); }
        if (typeof window.spApriLinkInterno !== 'function') {
          alert('Il cercatore di articoli non è disponibile in questa pagina.');
          return;
        }
        var r = selectionInArea();
        var testoScelto = r && !r.collapsed ? String(r) : '';
        window.spApriLinkInterno(function (a) {
          var testo = testoScelto || a.titolo;
          insertHtml('<a href="' + esc(a.indirizzo) + '">' + esc(testo) + '</a>');
        });
      },

      img: function () {
        if (!selectionInArea()) { area.focus(); refreshToolbar(); }
        if (typeof window.spApriLibreria !== 'function') { alert('La libreria media non è disponibile in questa pagina.'); return; }
        window.spApriLibreria(function (m) {
          var f = document.createElement('figure');
          var im = document.createElement('img');
          im.setAttribute('src', m.url); im.setAttribute('alt', m.alt || '');
          if (m.width && m.height) { im.setAttribute('width', m.width); im.setAttribute('height', m.height); }
          im.setAttribute('loading', 'lazy');
          var cap = document.createElement('figcaption'); cap.textContent = m.alt || '';
          f.appendChild(im); f.appendChild(cap);
          insertHtml(f.outerHTML + '<p><br></p>');
        });
      }
    };
    tools.addEventListener('mousedown', function (e) { if (e.target.closest('button')) e.preventDefault(); });   // non rubare la selezione
    tools.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-cmd]'); if (!b) return;
      e.preventDefault();
      var fn = COMMANDS[b.getAttribute('data-cmd')]; if (fn) fn();
    });
    blockSel.addEventListener('change', function () {
      var v = blockSel.value;
      restoreSelection();
      var inQuote = !!closestTag('blockquote');
      if (v === 'blockquote') {
        if (!inQuote) exec('formatBlock', '<blockquote>');
      } else {
        if (inQuote) exec('outdent');
        exec('formatBlock', '<' + v + '>');
      }
      refreshToolbar();
    });

    /* ---- tastiera: Invio in fondo a un titolo apre un paragrafo, non un altro titolo ---- */
    area.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        var b = closestBlock();
        if (b && /^H[234]$/.test(b.tagName)) {
          var sel = window.getSelection();
          if (sel.rangeCount && sel.isCollapsed) {
            var r = sel.getRangeAt(0).cloneRange();
            r.setStart(r.endContainer, r.endOffset); r.setEndAfter(b.lastChild || b);
            if (r.toString().trim() === '') {
              e.preventDefault();
              var p = document.createElement('p'); p.innerHTML = '<br>';
              b.parentNode.insertBefore(p, b.nextSibling);
              var nr = document.createRange(); nr.setStart(p, 0); nr.collapse(true);
              sel.removeAllRanges(); sel.addRange(nr);
              onInput();
            }
          }
        }
      }
      /* Una figura selezionata (video o immagine) si cancella con Canc o Backspace. */
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedFigure) {
        e.preventDefault();
        var next = selectedFigure.nextElementSibling;
        selectedFigure.parentNode.removeChild(selectedFigure);
        selectedFigure = null;
        if (next) { var nr2 = document.createRange(); nr2.setStart(next, 0); nr2.collapse(true); var s2 = window.getSelection(); s2.removeAllRanges(); s2.addRange(nr2); }
        onInput();
      }
    });
    var selectedFigure = null;
    area.addEventListener('click', function (e) {
      var f = e.target.closest('figure');
      if (selectedFigure && selectedFigure !== f) selectedFigure.classList.remove('ed-selected');
      selectedFigure = null;
      if (f && (e.target.tagName === 'IMG' || e.target.tagName === 'IFRAME' || e.target === f)) {
        f.classList.add('ed-selected'); selectedFigure = f;
      }
    });
    area.addEventListener('blur', function () {
      if (selectedFigure) { selectedFigure.classList.remove('ed-selected'); selectedFigure = null; }
    });

    /* ---- incolla: HTML ripulito, markdown convertito, testo impaginato ---- */
    area.addEventListener('paste', function (e) {
      var cb = e.clipboardData; if (!cb) return;
      var html = cb.getData('text/html');
      var text = cb.getData('text/plain');
      var out;
      if (html && html.trim() !== '') out = cleanHtml(html);
      else if (looksLikeMarkdown(text)) out = markdownToHtml(text);
      else out = plainToHtml(text);
      if (out === '' && text) out = plainToHtml(text);
      e.preventDefault();
      document.execCommand('insertHTML', false, out);
      onInput();
    });
    area.addEventListener('drop', function (e) { e.preventDefault(); });   // niente file trascinati dentro il testo

    /* ---- sincronizzazione, conteggio, bozza ---- */
    var countEl = foot.querySelector('.ed-count');
    var draftEl = foot.querySelector('.ed-draft');
    var dirty = false, draftTimer = null;

    function sync() {
      textarea.value = serialize(area);
      // Sull'HTML con i tag sostituiti da spazi, come fa il verificatore:
      // textContent incolla «titoloParagrafo» e conta una parola in meno per blocco.
      var w = countWords(textarea.value.replace(/<[^>]*>/g, ' '));
      countEl.textContent = w + (w === 1 ? ' parola' : ' parole') + ' · ~' + Math.max(1, Math.ceil(w / 200)) + ' min di lettura';
      document.dispatchEvent(new CustomEvent('fdca:editor-change'));
    }
    function onInput() {
      dirty = true;
      sync();
      scheduleDraft();
    }
    area.addEventListener('input', onInput);

    /* La bozza locale: ogni campo della scheda, nel browser, ogni due secondi di
       quiete. Un refresh o una sessione scaduta non buttano via un articolo. */
    var idField = form.querySelector('input[name="id"]');
    var DRAFT_KEY = 'fdca_news_draft_' + ((idField && idField.value && idField.value !== '0') ? idField.value : 'new');
    var DRAFT_FIELDS = ['title', 'slug', 'excerpt', 'seo_title', 'seo_description', 'focus_keyword', 'cover_image', 'category', 'status', 'published_at'];
    function fieldsSnapshot() {
      var snap = {};
      DRAFT_FIELDS.forEach(function (n) { var f = form.elements[n]; if (f) snap[n] = f.value; });
      snap.content = textarea.value;
      return snap;
    }
    function saveDraft() {
      try {
        var snap = fieldsSnapshot(); snap.savedAt = new Date().toISOString();
        localStorage.setItem(DRAFT_KEY, JSON.stringify(snap));
        draftEl.textContent = 'bozza locale ' + new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
      } catch (e) { /* storage pieno o negato: si scrive comunque sul server */ }
    }
    function scheduleDraft() { clearTimeout(draftTimer); draftTimer = setTimeout(saveDraft, 2000); }
    function dropDraft() { try { localStorage.removeItem(DRAFT_KEY); } catch (e) {} }
    form.addEventListener('input', function (e) { if (e.target !== area && !area.contains(e.target)) { dirty = true; scheduleDraft(); } });

    (function offerDraft() {
      var raw = null;
      try { raw = localStorage.getItem(DRAFT_KEY); } catch (e) { return; }
      if (!raw) return;
      var draft; try { draft = JSON.parse(raw); } catch (e) { dropDraft(); return; }
      var now = fieldsSnapshot(); var differs = false;
      Object.keys(now).forEach(function (k) { if ((draft[k] || '') !== (now[k] || '')) differs = true; });
      if (!differs) { dropDraft(); return; }
      var when = draft.savedAt ? new Date(draft.savedAt).toLocaleString('it-IT') : '';
      var banner = el('div', { 'class': 'a-flash ed-banner' },
        '<strong>C’è una bozza non salvata</strong> (' + esc(when) + '), scritta in questo browser e mai spedita al server. ' +
        '<button type="button" class="a-btn a-btn--sm" data-draft="restore">Ripristina</button> ' +
        '<button type="button" class="a-btn a-btn--ghost a-btn--sm" data-draft="discard">Ignora</button>');
      form.insertBefore(banner, form.firstChild);
      banner.addEventListener('click', function (e) {
        var b = e.target.closest('[data-draft]'); if (!b) return;
        if (b.getAttribute('data-draft') === 'restore') {
          DRAFT_FIELDS.forEach(function (n) { var f = form.elements[n]; if (f && draft[n] != null) f.value = draft[n]; });
          area.innerHTML = cleanHtml(draft.content || '') || '<p><br></p>';
          sync(); dirty = true;
          form.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          dropDraft();
        }
        banner.parentNode.removeChild(banner);
      });
    })();

    form.addEventListener('submit', function () { sync(); dirty = false; dropDraft(); });
    window.addEventListener('beforeunload', function (e) {
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    });

    sync();
    refreshToolbar();

    return {
      getHTML: function () { return textarea.value; },
      getText: function () { return area.textContent; },
      setHTML: function (html) { area.innerHTML = cleanHtml(html) || '<p><br></p>'; onInput(); }
    };
  }

  /* API pubblica: la usa seo-check.js e la prova in docs/collaudo/prova-editor.html */
  window.spEditor = {
    markdownToHtml: markdownToHtml,
    looksLikeMarkdown: looksLikeMarkdown,
    plainToHtml: plainToHtml,
    cleanHtml: cleanHtml,
    isSafeUrl: isSafeUrl,
    normalizeUrl: normalizeUrl,
    youtubeId: youtubeId,
    countWords: countWords,
    instance: null
  };

  var ta = document.getElementById('content');
  if (ta && ta.form && !ta.hasAttribute('data-no-editor')) {
    window.spEditor.instance = mount(ta);
  }
})();

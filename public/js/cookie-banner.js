/**
 * Cookie Banner — Simone Pizzi Portfolio
 * Banner informativo minimo (cookie tecnici only, nessuna scelta da bloccare).
 * Usa localStorage per ricordare la presa visione. Zero dipendenze esterne.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'cookie_consent';
  var BANNER_ID   = 'sp-cookie-banner';

  // Se già visto, non mostrare
  if (localStorage.getItem(STORAGE_KEY)) return;

  var banner = document.createElement('div');
  banner.id = BANNER_ID;
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', 'Informativa cookie');
  banner.innerHTML =
    '<div class="sp-cb-inner">' +
      '<p class="sp-cb-text">' +
        '🍪 Questo sito utilizza solo <strong>cookie tecnici essenziali</strong> per il suo funzionamento. ' +
        'Nessun cookie di profilazione o di terze parti. ' +
        '<a href="/cookie-policy" class="sp-cb-link">Cookie Policy</a> · ' +
        '<a href="/privacy" class="sp-cb-link">Privacy Policy</a>' +
      '</p>' +
      '<button id="sp-cb-close" class="sp-cb-btn" aria-label="Chiudi banner cookie">Capito</button>' +
    '</div>';

  var style = document.createElement('style');
  style.textContent =
    '#' + BANNER_ID + '{' +
      'position:fixed;bottom:0;left:0;right:0;z-index:9999;' +
      'background:rgba(17,17,17,0.97);border-top:1px solid #1e1e1e;' +
      'backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);' +
      'padding:14px 20px;' +
      'animation:sp-slide-up 0.35s ease;' +
    '}' +
    '@keyframes sp-slide-up{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}' +
    '.sp-cb-inner{' +
      'max-width:900px;margin:0 auto;display:flex;align-items:center;' +
      'justify-content:space-between;gap:16px;flex-wrap:wrap;' +
    '}' +
    '.sp-cb-text{color:#9ca3af;font-size:0.85rem;line-height:1.5;margin:0;flex:1;min-width:200px;}' +
    '.sp-cb-text strong{color:#d1d5db;}' +
    '.sp-cb-link{color:#22c55e;text-decoration:none;}' +
    '.sp-cb-link:hover{text-decoration:underline;}' +
    '.sp-cb-btn{' +
      'background:#22c55e;color:#000;border:none;border-radius:6px;' +
      'padding:8px 20px;font-size:0.85rem;font-weight:700;cursor:pointer;' +
      'white-space:nowrap;transition:background 0.2s;flex-shrink:0;' +
    '}' +
    '.sp-cb-btn:hover{background:#16a34a;}';

  document.head.appendChild(style);
  document.body.appendChild(banner);

  document.getElementById('sp-cb-close').addEventListener('click', function () {
    localStorage.setItem(STORAGE_KEY, 'acknowledged');
    var el = document.getElementById(BANNER_ID);
    if (el) {
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(100%)';
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }
  });
})();

<?php
date_default_timezone_set('Europe/Rome');
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$baseUrl  = $protocol . $_SERVER['HTTP_HOST'];
$year     = date('Y');
?>
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cookie Policy | Simone Pizzi</title>
    <meta name="description" content="Informativa sull'uso dei cookie del sito simonepizzi.runtimeradio.it. Questo sito utilizza solo cookie tecnici essenziali." />
    <link rel="canonical" href="<?= $baseUrl ?>/cookie-policy" />
    <meta name="robots" content="noindex, follow" />
    <style>
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{--bg:#0a0a0a;--surface:#111;--border:#1e1e1e;--text:#d1d5db;--muted:#6b7280;--accent:#22c55e;--heading:#fff}
        body{background:var(--bg);color:var(--text);font-family:'Segoe UI',system-ui,sans-serif;font-size:16px;line-height:1.75;min-height:100vh}
        a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
        .site-header{background:rgba(0,0,0,.6);border-bottom:1px solid var(--border);backdrop-filter:blur(12px);padding:16px 24px}
        .site-header a{font-weight:700;font-size:1.1rem;letter-spacing:.05em;text-transform:uppercase}
        .hero{padding:64px 24px 40px;text-align:center;border-bottom:1px solid var(--border);background:radial-gradient(ellipse 70% 60% at 50% 0%,rgba(34,197,94,.12),transparent)}
        .hero .badge{display:inline-block;background:rgba(34,197,94,.15);color:var(--accent);border:1px solid rgba(34,197,94,.3);border-radius:999px;padding:4px 14px;font-size:.8rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;margin-bottom:20px}
        .hero h1{color:var(--heading);font-size:clamp(1.8rem,4vw,2.8rem);font-weight:700;margin-bottom:12px}
        .hero p{color:var(--muted);font-size:.95rem}
        .content{max-width:800px;margin:0 auto;padding:48px 24px 80px}
        .section{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:28px 32px;margin-bottom:24px}
        .section h2{color:var(--heading);font-size:1.1rem;font-weight:700;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px}
        .section p{margin-bottom:10px}.section p:last-child{margin-bottom:0}
        .section ul{list-style:none;padding:0}
        .section ul li{padding:6px 0 6px 20px;position:relative}
        .section ul li::before{content:'→';position:absolute;left:0;color:var(--accent);font-size:.85rem}
        table{width:100%;border-collapse:collapse;font-size:.9rem;margin-top:14px}
        th{background:rgba(34,197,94,.08);color:var(--accent);font-weight:600;text-align:left;padding:10px 14px;border-bottom:1px solid var(--border)}
        td{padding:10px 14px;border-bottom:1px solid rgba(255,255,255,.04)}
        tr:last-child td{border-bottom:none}
        .ok{display:inline-block;background:rgba(34,197,94,.15);color:var(--accent);border:1px solid rgba(34,197,94,.3);border-radius:4px;padding:2px 8px;font-size:.75rem;font-weight:600}
        .no{display:inline-block;background:rgba(107,114,128,.15);color:var(--muted);border:1px solid rgba(107,114,128,.3);border-radius:4px;padding:2px 8px;font-size:.75rem;font-weight:600}
        .highlight{background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:8px;padding:14px 18px;margin-top:12px;font-size:.9rem}
        .site-footer{border-top:1px solid var(--border);padding:24px;text-align:center;color:var(--muted);font-size:.85rem}
        .site-footer a{color:var(--muted);margin:0 8px}.site-footer a:hover{color:var(--accent)}
    </style>
</head>
<body>
<header class="site-header"><a href="<?= $baseUrl ?>">← Simone Pizzi</a></header>
<div class="hero">
    <div class="badge">🍪 Cookie Policy</div>
    <h1>Cookie Policy</h1>
    <p>Informativa sull'uso dei cookie &mdash; Ultimo aggiornamento: Aprile <?= $year ?></p>
</div>
<main class="content">
    <div class="section">
        <h2><span>ℹ️</span> Cosa sono i Cookie</h2>
        <p>I cookie sono piccoli file di testo che i siti web salvano nel browser dell'utente durante la navigazione, usati per far funzionare il sito, ricordare preferenze o raccogliere statistiche.</p>
    </div>
    <div class="section">
        <h2><span>🍪</span> Cookie Utilizzati da questo Sito</h2>
        <p>Questo sito utilizza <strong>esclusivamente cookie tecnici</strong>. Non sono presenti cookie di profilazione o di terze parti.</p>
        <table>
            <thead><tr><th>Nome</th><th>Tipo</th><th>Finalità</th><th>Durata</th><th>Consenso</th></tr></thead>
            <tbody>
                <tr>
                    <td><code>PHPSESSID</code></td>
                    <td>Tecnico sessione</td>
                    <td>Sessione autenticata pannello admin. <strong>Non impostato nella navigazione pubblica.</strong></td>
                    <td>Fine sessione</td>
                    <td><span class="ok">Non richiesto</span></td>
                </tr>
                <tr>
                    <td><code>cookie_consent</code></td>
                    <td>Preferenza (localStorage)</td>
                    <td>Memorizza presa visione banner cookie.</td>
                    <td>12 mesi</td>
                    <td><span class="ok">Non richiesto</span></td>
                </tr>
            </tbody>
        </table>
        <div class="highlight">✅ <strong>Nessun cookie di profilazione.</strong> Non utilizziamo Google Analytics, Facebook Pixel, cookie pubblicitari o strumenti di tracciamento di terze parti.</div>
    </div>
    <div class="section">
        <h2><span>🚫</span> Cookie di Terze Parti</h2>
        <p>Questo sito non carica risorse da domini terzi che possano impostare cookie. Sono assenti:</p>
        <ul>
            <li>Google Analytics / Google Tag Manager <span class="no">Assente</span></li>
            <li>Facebook Pixel / Meta <span class="no">Assente</span></li>
            <li>Cookie pubblicitari <span class="no">Assente</span></li>
            <li>Widget social (Like, Share) <span class="no">Assente</span></li>
        </ul>
    </div>
    <div class="section">
        <h2><span>⚙️</span> Come Gestire i Cookie</h2>
        <p>Puoi configurare il tuo browser per bloccare o eliminare i cookie:</p>
        <ul>
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/it/kb/Attivare%20e%20disattivare%20i%20cookie" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
            <li><a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
        </ul>
    </div>
    <div class="section">
        <h2><span>📞</span> Contatti</h2>
        <p><strong>Simone Pizzi</strong> — <a href="mailto:simonepizzi.1972@proton.me">simonepizzi.1972@proton.me</a></p>
        <p>Per l'informativa completa: <a href="<?= $baseUrl ?>/privacy">Privacy Policy</a>.</p>
    </div>
</main>
<footer class="site-footer">
    <p><a href="<?= $baseUrl ?>">Home</a><a href="<?= $baseUrl ?>/privacy">Privacy Policy</a><a href="<?= $baseUrl ?>/cookie-policy">Cookie Policy</a><a href="<?= $baseUrl ?>/contatti">Contatti</a></p>
    <p style="margin-top:10px">&copy; <?= $year ?> Simone Pizzi. Tutti i diritti riservati.</p>
</footer>
</body>
</html>

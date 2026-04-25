<?php
/**
 * Privacy Policy — Simone Pizzi Portfolio
 * Servita direttamente come file PHP per garantire meta tag corretti e canonica stabile.
 */

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
    <title>Privacy Policy | Simone Pizzi</title>
    <meta name="description" content="Informativa sul trattamento dei dati personali del sito simonepizzi.runtimeradio.it, ai sensi del GDPR (Reg. UE 2016/679)." />
    <link rel="canonical" href="<?= $baseUrl ?>/privacy" />
    <meta name="robots" content="noindex, follow" />
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
            --bg: #0a0a0a;
            --surface: #111111;
            --border: #1e1e1e;
            --text: #d1d5db;
            --text-muted: #6b7280;
            --accent: #22c55e;
            --heading: #ffffff;
        }
        body {
            background: var(--bg);
            color: var(--text);
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            font-size: 16px;
            line-height: 1.75;
            min-height: 100vh;
        }
        a { color: var(--accent); text-decoration: none; }
        a:hover { text-decoration: underline; }

        /* ── Header ── */
        .site-header {
            background: rgba(0,0,0,0.6);
            border-bottom: 1px solid var(--border);
            backdrop-filter: blur(12px);
            padding: 16px 24px;
        }
        .site-header a {
            font-weight: 700;
            font-size: 1.1rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        /* ── Hero ── */
        .hero {
            padding: 64px 24px 40px;
            text-align: center;
            border-bottom: 1px solid var(--border);
            background: radial-gradient(ellipse 70% 60% at 50% 0%, rgba(34,197,94,0.12), transparent);
        }
        .hero .badge {
            display: inline-block;
            background: rgba(34,197,94,0.15);
            color: var(--accent);
            border: 1px solid rgba(34,197,94,0.3);
            border-radius: 999px;
            padding: 4px 14px;
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 20px;
        }
        .hero h1 {
            color: var(--heading);
            font-size: clamp(1.8rem, 4vw, 2.8rem);
            font-weight: 700;
            margin-bottom: 12px;
        }
        .hero p {
            color: var(--text-muted);
            font-size: 0.95rem;
        }

        /* ── Content ── */
        .content {
            max-width: 800px;
            margin: 0 auto;
            padding: 48px 24px 80px;
        }
        .section {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 28px 32px;
            margin-bottom: 24px;
        }
        .section h2 {
            color: var(--heading);
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 14px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .section h2 .icon {
            color: var(--accent);
            font-size: 1rem;
        }
        .section p { margin-bottom: 10px; color: var(--text); }
        .section p:last-child { margin-bottom: 0; }
        .section ul {
            list-style: none;
            padding: 0;
        }
        .section ul li {
            padding: 6px 0 6px 20px;
            position: relative;
            color: var(--text);
        }
        .section ul li::before {
            content: '→';
            position: absolute;
            left: 0;
            color: var(--accent);
            font-size: 0.85rem;
        }
        .section .table-wrap {
            overflow-x: auto;
            margin-top: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
        }
        th {
            background: rgba(34,197,94,0.08);
            color: var(--accent);
            font-weight: 600;
            text-align: left;
            padding: 10px 14px;
            border-bottom: 1px solid var(--border);
        }
        td {
            padding: 10px 14px;
            border-bottom: 1px solid rgba(255,255,255,0.04);
            color: var(--text);
        }
        tr:last-child td { border-bottom: none; }
        .highlight {
            background: rgba(34,197,94,0.08);
            border: 1px solid rgba(34,197,94,0.2);
            border-radius: 8px;
            padding: 14px 18px;
            margin-top: 12px;
            font-size: 0.9rem;
            color: var(--text);
        }

        /* ── Footer ── */
        .site-footer {
            border-top: 1px solid var(--border);
            padding: 24px;
            text-align: center;
            color: var(--text-muted);
            font-size: 0.85rem;
        }
        .site-footer a { color: var(--text-muted); margin: 0 8px; }
        .site-footer a:hover { color: var(--accent); }
    </style>
</head>
<body>

<header class="site-header">
    <a href="<?= $baseUrl ?>">← Simone Pizzi</a>
</header>

<div class="hero">
    <div class="badge">⚖️ Documento Legale</div>
    <h1>Privacy Policy</h1>
    <p>Informativa ai sensi del Regolamento UE 2016/679 (GDPR) &mdash; Ultimo aggiornamento: Aprile <?= $year ?></p>
</div>

<main class="content">

    <div class="section">
        <h2><span class="icon">👤</span> Titolare del Trattamento</h2>
        <p><strong>Simone Pizzi</strong><br>
        Indirizzo email: <a href="mailto:simonepizzi.1972@proton.me">simonepizzi.1972@proton.me</a></p>
        <p>Il Titolare può essere contattato in qualsiasi momento per esercitare i diritti previsti dal GDPR o per qualsiasi richiesta relativa al trattamento dei dati personali.</p>
    </div>

    <div class="section">
        <h2><span class="icon">📋</span> Dati Raccolti, Finalità e Base Giuridica</h2>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Modulo</th>
                        <th>Dati raccolti</th>
                        <th>Finalità</th>
                        <th>Base giuridica</th>
                        <th>Conservazione</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>Form Contatti</strong></td>
                        <td>Nome, Email, Oggetto, Messaggio</td>
                        <td>Rispondere alla richiesta dell'utente</td>
                        <td>Consenso esplicito (checkbox obbligatoria)</td>
                        <td>Fino a 12 mesi, o su richiesta di cancellazione</td>
                    </tr>
                    <tr>
                        <td><strong>Newsletter</strong></td>
                        <td>Email, Nome (facoltativo)</td>
                        <td>Invio aggiornamenti sui nuovi contenuti del sito</td>
                        <td>Consenso esplicito (double opt-in)</td>
                        <td>Fino alla disiscrizione</td>
                    </tr>
                    <tr>
                        <td><strong>Analytics interno</strong></td>
                        <td>Identificatore tecnico anonimo (hash SHA-256 di IP + data), ID articolo visualizzato</td>
                        <td>Conteggio visualizzazioni per migliorare i contenuti</td>
                        <td>Legittimo interesse (art. 6 par. 1 lett. f)</td>
                        <td>Aggregato, senza scadenza fissa</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="highlight">
            ℹ️ <strong>Note sull'analytics:</strong> Il sito <strong>non utilizza Google Analytics</strong> né alcun tracker di terze parti. Il sistema interno calcola un hash SHA-256 non reversibile dell'indirizzo IP combinato con la data corrente, esclusivamente per evitare il conteggio doppio delle visualizzazioni. Tale hash <strong>non è riconducibile all'utente</strong> e non viene conservato in forma leggibile.
        </div>
    </div>

    <div class="section">
        <h2><span class="icon">🍪</span> Cookie e Tecnologie di Tracciamento</h2>
        <p>Questo sito utilizza <strong>esclusivamente cookie tecnici di sessione</strong>, necessari per il funzionamento del pannello di amministrazione riservato. Tali cookie:</p>
        <ul>
            <li>Non sono presenti durante la normale navigazione degli utenti pubblici</li>
            <li>Sono strettamente necessari e quindi esenti dall'obbligo di consenso (art. 122 D.Lgs. 196/2003)</li>
            <li>Vengono cancellati automaticamente alla chiusura del browser</li>
        </ul>
        <p style="margin-top:12px;"><strong>Il sito non utilizza cookie di profilazione, cookie di terze parti, pixel di tracciamento o tecnologie simili.</strong></p>
        <p>Per maggiori dettagli, consulta la <a href="<?= $baseUrl ?>/cookie-policy">Cookie Policy</a>.</p>
    </div>

    <div class="section">
        <h2><span class="icon">🔄</span> Newsletter: Gestione del Consenso</h2>
        <p>L'iscrizione alla newsletter avviene tramite un processo di <strong>double opt-in</strong>:</p>
        <ul>
            <li>L'utente inserisce la propria email e invia il modulo</li>
            <li>Viene inviata un'email con un link di conferma univoco</li>
            <li>L'iscrizione si attiva solo dopo il click sul link di conferma</li>
            <li>Ogni email inviata contiene un link di disiscrizione immediata</li>
        </ul>
        <p style="margin-top:12px;">Per disiscriversi è sufficiente cliccare il link in fondo a qualsiasi email ricevuta, oppure inviare richiesta a <a href="mailto:simonepizzi.1972@proton.me">simonepizzi.1972@proton.me</a>.</p>
    </div>

    <div class="section">
        <h2><span class="icon">🔒</span> Comunicazione e Trasferimento dei Dati</h2>
        <p>I dati personali sono conservati su server situati in Europa e <strong>non vengono ceduti, venduti o comunicati a terze parti</strong>, salvo obblighi di legge.</p>
        <p>I messaggi ricevuti tramite il form contatti vengono inoltrati via email al Titolare e conservati nel database del sito. Non vengono condivisi con soggetti esterni.</p>
    </div>

    <div class="section">
        <h2><span class="icon">✅</span> Diritti dell'Interessato</h2>
        <p>Ai sensi degli artt. 15-22 del GDPR, l'utente ha il diritto di:</p>
        <ul>
            <li><strong>Accesso</strong> — ottenere conferma che siano trattati dati che lo riguardano e riceverne copia</li>
            <li><strong>Rettifica</strong> — richiedere la correzione di dati inesatti o incompleti</li>
            <li><strong>Cancellazione ("diritto all'oblio")</strong> — ottenere la rimozione dei propri dati</li>
            <li><strong>Limitazione</strong> — richiedere la sospensione del trattamento in determinate circostanze</li>
            <li><strong>Portabilità</strong> — ricevere i propri dati in formato strutturato e leggibile da macchina</li>
            <li><strong>Opposizione</strong> — opporsi al trattamento basato su legittimo interesse</li>
            <li><strong>Revoca del consenso</strong> — in qualsiasi momento, senza pregiudicare la liceità del trattamento precedente</li>
        </ul>
        <p style="margin-top:12px;">Per esercitare questi diritti, scrivi a: <a href="mailto:simonepizzi.1972@proton.me">simonepizzi.1972@proton.me</a><br>
        Il Titolare risponderà entro 30 giorni dalla ricezione della richiesta.</p>
        <p>In caso di risposta insoddisfacente, hai il diritto di presentare reclamo al <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">Garante per la protezione dei dati personali</a>.</p>
    </div>

    <div class="section">
        <h2><span class="icon">📅</span> Modifiche alla Privacy Policy</h2>
        <p>Il Titolare si riserva il diritto di apportare modifiche alla presente informativa, dandone comunicazione agli utenti su questa pagina. Si raccomanda di consultarla periodicamente.</p>
        <p><em>Data di ultima revisione: Aprile <?= $year ?></em></p>
    </div>

</main>

<footer class="site-footer">
    <p>
        <a href="<?= $baseUrl ?>">Home</a>
        <a href="<?= $baseUrl ?>/privacy">Privacy Policy</a>
        <a href="<?= $baseUrl ?>/cookie-policy">Cookie Policy</a>
        <a href="<?= $baseUrl ?>/contatti">Contatti</a>
    </p>
    <p style="margin-top:10px;">&copy; <?= $year ?> Simone Pizzi. Tutti i diritti riservati.</p>
</footer>

</body>
</html>

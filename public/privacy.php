<?php
/**
 * Privacy Policy — Simone Pizzi Portfolio
 * Servita direttamente come file PHP per garantire meta tag corretti e canonica stabile.
 */

// Di solito la include index.php, che ha già caricato l'avvio; aperta come
// /privacy.php lo carica da sé. L'indirizzo del sito viene da SITO_URL e non
// dall'header Host, che chiunque può falsificare (revisione del 16 ottobre).
if (!defined('SITO_URL')) require __DIR__ . '/lib/avvio.php';
$baseUrl  = SITO_URL;
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
    <p>Informativa ai sensi del Regolamento UE 2016/679 (GDPR) &mdash; Ultimo aggiornamento: 16 ottobre 2026 (versione 2026-10)</p>
</div>

<main class="content">

    <div class="section">
        <h2><span class="icon">👤</span> Titolare del Trattamento</h2>
        <p><strong>Simone Pizzi</strong><br>
        Contatto: <a href="<?= $baseUrl ?>/contatti">modulo dei contatti del sito</a></p>
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
                        <td>Nome, Email, Messaggio (e le risposte scambiate); un’impronta della rete da cui arriva il messaggio, per limitare gli invii ripetuti</td>
                        <td>Rispondere alla richiesta dell'utente</td>
                        <td>Consenso esplicito (checkbox obbligatoria)</td>
                        <td>6 mesi dall'ultimo scambio di messaggi, poi si cancellano da soli; oppure prima, su richiesta di cancellazione. L’impronta si toglie dopo un’ora</td>
                    </tr>
                    <tr>
                        <td><strong>Newsletter</strong></td>
                        <td>Email, Nome (facoltativo), e la prova del consenso: data e ora, testo accettato, versione dell'informativa, modo in cui è stato dato</td>
                        <td>Invio aggiornamenti sui nuovi contenuti del sito</td>
                        <td>Consenso esplicito (double opt-in)</td>
                        <td>Fino alla disiscrizione. Chi esce resta nell'elenco solo con lo stato «uscito», per non riceverne più, e si cancella a richiesta</td>
                    </tr>
                    <tr>
                        <td><strong>Letture degli articoli</strong></td>
                        <td>Un’impronta della rete da cui arriva la visita, calcolata dall’indirizzo IP e dalla data con una chiave segreta del sito; l’articolo letto; il giorno</td>
                        <td>Contare le letture, una per rete al giorno, per capire che cosa viene letto</td>
                        <td>Legittimo interesse (art. 6 par. 1 lett. f)</td>
                        <td>L’impronta si sostituisce con un segnaposto il giorno dopo; resta solo il conteggio</td>
                    </tr>
                    <tr>
                        <td><strong>Reazioni agli articoli</strong></td>
                        <td>Un’impronta della rete e del browser, calcolata con la chiave segreta del sito; la reazione scelta; l’articolo</td>
                        <td>Contare le reazioni, e permettere a chi ne ha data una di toglierla</td>
                        <td>Legittimo interesse (art. 6 par. 1 lett. f)</td>
                        <td>Finché la reazione resta; con l’articolo se ne vanno anche le sue reazioni</td>
                    </tr>
                    <tr>
                        <td><strong>Protezione dei moduli</strong></td>
                        <td>Un’impronta della rete, calcolata con la chiave segreta del sito, e l’ora di ogni tentativo</td>
                        <td>Limitare i tentativi ripetuti su accesso al pannello, recupero della password, newsletter, contatti e reazioni</td>
                        <td>Legittimo interesse alla sicurezza del sito (art. 6 par. 1 lett. f)</td>
                        <td>Da un quarto d’ora a un giorno, secondo il modulo; poi il conteggio si cancella</td>
                    </tr>
                    <tr>
                        <td><strong>Log del server</strong></td>
                        <td>Indirizzo IP, data e ora, pagina richiesta, browser</td>
                        <td>Sicurezza e funzionamento del servizio di hosting</td>
                        <td>Legittimo interesse (art. 6 par. 1 lett. f)</td>
                        <td>Li tiene il fornitore dell’hosting, per circa una settimana</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="highlight">
            ℹ️ <strong>Le impronte.</strong> Il sito <strong>non usa Google Analytics</strong> né altri strumenti di terzi per contare le visite, e nel suo database non scrive nessun indirizzo IP. Dove serve riconoscere una visita, una reazione o un tentativo ripetuto calcola un’impronta: un codice ottenuto dalla rete di provenienza (l’indirizzo IP, ridotto alla rete di casa per l’IPv6) con una chiave segreta che sta sul server, fuori dal database. Senza quella chiave l’impronta non riporta all’indirizzo. Con la chiave il Titolare potrebbe in teoria verificarla, ed è per questo che ogni impronta si toglie appena ha finito il suo lavoro. Le impronte registrate prima del 16 ottobre 2026, calcolate senza chiave, sono state sostituite da un segnaposto quel giorno.
        </div>
    </div>

    <div class="section">
        <h2><span class="icon">🍪</span> Cookie e Tecnologie di Tracciamento</h2>
        <p>Questo sito usa <strong>un solo cookie, tecnico</strong>: quello della sessione del pannello di amministrazione riservato (<code>__Host-sp_admin</code>). Questo cookie:</p>
        <ul>
            <li>Non viene impostato durante la normale lettura del sito: nasce solo aprendo la pagina d’ingresso del pannello</li>
            <li>È strettamente necessario e quindi esente dall'obbligo di consenso (art. 122 D.Lgs. 196/2003)</li>
            <li>Si cancella alla chiusura del browser, e comunque la sessione si chiude dopo due ore senza attività</li>
        </ul>
        <p style="margin-top:12px;"><strong>Il sito non utilizza cookie di profilazione, cookie di terze parti, pixel di tracciamento o tecnologie simili.</strong> L’unica eccezione la decide chi legge: un video di YouTube avviato con un clic (vedi sotto).</p>
        <p>Per maggiori dettagli, consulta la <a href="<?= $baseUrl ?>/cookie-policy">Cookie Policy</a>.</p>
    </div>

    <div class="section">
        <h2><span class="icon">🔄</span> Newsletter: Gestione del Consenso</h2>
        <p>L'iscrizione alla newsletter avviene tramite un processo di <strong>double opt-in</strong>:</p>
        <ul>
            <li>L'utente inserisce la propria email e spunta la casella del consenso, che non è mai precompilata</li>
            <li>Viene inviata un'email con un link di conferma univoco</li>
            <li>Il link porta a una pagina con un pulsante: l'iscrizione si attiva solo premendolo, non aprendo il link</li>
            <li>Ogni email inviata contiene un link di disiscrizione immediata</li>
        </ul>
        <p style="margin-top:12px;"><strong>La prova del consenso.</strong> Quando il consenso viene dato, il sito registra la data e l'ora, il testo esatto che l'utente ha letto, la versione di questa informativa in vigore e il modo in cui è stato dato (modulo del sito, conferma dell'iscrizione o riconferma). Se il testo del consenso o questa informativa cambiano, la versione cambia: così si sa sempre quale testo ha accettato ciascun iscritto. La versione in vigore è la <strong>2026-10</strong>.</p>
        <p>Chi si era iscritto prima di ottobre 2026 non ha una prova di questo tipo: a queste persone non viene inviata la newsletter, ma una sola email in cui si chiede di confermare il consenso con un clic. Chi non risponde non riceve più niente. Se qualcuno scrive uno di questi indirizzi nel modulo del sito, parte la stessa richiesta: il consenso si registra solo con il clic nella casella di chi lo deve dare.</p>
        <p>Per disiscriversi è sufficiente cliccare il link in fondo a qualsiasi email ricevuta (la disiscrizione si completa con un pulsante), oppure scrivere dal <a href="<?= $baseUrl ?>/contatti">modulo dei contatti</a>.</p>
    </div>

    <div class="section">
        <h2><span class="icon">🔒</span> Comunicazione e Trasferimento dei Dati</h2>
        <p>I dati personali <strong>non vengono ceduti, venduti o comunicati a terze parti</strong>, salvo obblighi di legge. Per far funzionare il sito il Titolare si serve di fornitori che li trattano per suo conto, come responsabili del trattamento:</p>
        <ul>
            <li><strong>DreamHost</strong> (New Dream Network, LLC), che ospita il sito e il suo database su server negli <strong>Stati Uniti</strong>;</li>
            <li><strong>Google</strong> (Gmail), attraverso cui partono le email del sito: le conferme della newsletter, le risposte ai messaggi, gli avvisi al Titolare;</li>
            <li><strong>Proton</strong>, la casella di posta del Titolare, dove arrivano gli avvisi dei messaggi ricevuti dal modulo.</li>
        </ul>
        <p>I dati che arrivano negli Stati Uniti vi arrivano con le garanzie che questi fornitori offrono per i trasferimenti fuori dall’Unione europea (artt. 44-49 del GDPR).</p>
        <p>I messaggi ricevuti tramite il form contatti vengono salvati nel database del sito, e al Titolare ne arriva un avviso per email. La risposta parte per email dal sito; chi la riceve può continuare la conversazione da una pagina del sito, raggiunta con un link personale che vale 60 giorni dall'ultima risposta del Titolare. Il sito non pubblica nessun indirizzo email. Le conversazioni si cancellano da sole, con tutte le risposte, sei mesi dopo l'ultimo messaggio scambiato. A parte i fornitori di posta qui sopra, i messaggi non passano da nessun altro.</p>
        <p><strong>Le copie di sicurezza.</strong> Ogni settimana il database (compresi iscritti e messaggi) e le immagini del sito si copiano in una cartella dell’hosting che il web non raggiunge; restano le ultime quattordici copie, e il Titolare ne tiene una sul proprio computer. Un dato cancellato dal sito sparisce dalle copie man mano che vengono sostituite dalle nuove.</p>
    </div>

    <div class="section">
        <h2><span class="icon">▶️</span> I video di YouTube</h2>
        <p>Alcuni articoli contengono un video ospitato su YouTube. Al posto del video la pagina mostra un riquadro con il pulsante <strong>«Avvia il video»</strong>: finché non lo premi, il tuo browser non si collega a YouTube e Google non riceve niente.</p>
        <p>Se premi il pulsante, il video si carica da <code>youtube-nocookie.com</code>: da quel momento Google (YouTube) riceve il tuo indirizzo IP e i dati tecnici del browser, e durante la riproduzione può salvare cookie e dati nel browser, secondo la <a href="https://policies.google.com/privacy?hl=it" target="_blank" rel="noopener noreferrer">sua informativa</a>. È una scelta tua, e vale solo per quel video: il riquadro accanto ha anche il link per guardarlo direttamente su YouTube.</p>
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
        <p style="margin-top:12px;">Per esercitare questi diritti, scrivi dal <a href="<?= $baseUrl ?>/contatti">modulo dei contatti</a>.<br>
        Il Titolare risponderà entro 30 giorni dalla ricezione della richiesta.</p>
        <p>In caso di risposta insoddisfacente, hai il diritto di presentare reclamo al <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">Garante per la protezione dei dati personali</a>.</p>
    </div>

    <div class="section">
        <h2><span class="icon">📅</span> Modifiche alla Privacy Policy</h2>
        <p>Il Titolare si riserva il diritto di apportare modifiche alla presente informativa, dandone comunicazione agli utenti su questa pagina. Si raccomanda di consultarla periodicamente.</p>
        <p><em>Data di ultima revisione: 16 ottobre 2026 (versione 2026-10). Il 16 ottobre sono stati aggiunti le impronte, le reazioni, la protezione dei moduli, i log del server, i fornitori e il luogo dei server, le copie di sicurezza e i video di YouTube; la parte sulla newsletter e il testo del consenso non sono cambiati.</em></p>
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

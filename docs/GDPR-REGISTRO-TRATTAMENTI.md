# Registro delle attività di trattamento — simonepizzi.runtimeradio.it

**Art. 30 Reg. UE 2016/679.** Ultimo aggiornamento: **16 ottobre 2026**, con la revisione
generale del sito (`AUDIT-2026-10-16.md`).

> **Questo repository è pubblico.** Il registro qui contiene solo quello che il sito fa dei
> dati. I dati anagrafici del titolare (codice fiscale, residenza) non si scrivono qui: stanno
> nel registro di FDCA, che ha lo stesso titolare e non si pubblica
> (`FDCA-PHP/docs/GDPR-REGISTRO-TRATTAMENTI.md`).

Serve a due cose: rispondere al Garante se lo chiede, e tenere l'informativa (`/privacy`)
allineata al codice. Il 16 ottobre 2026 non lo era: diceva «server in Europa», non nominava i
fornitori, chiamava «non riconducibile» un'impronta che si poteva ricalcolare. Ogni volta che il
codice cambia il modo in cui tratta un dato, si aggiorna questa pagina e poi l'informativa.

## Titolare

| | |
|---|---|
| **Titolare** | Simone Pizzi, persona fisica (dati anagrafici: vedi il registro di FDCA) |
| **Contatto per gli interessati** | il modulo di `/contatti` |
| **Responsabile della protezione dei dati** | non nominato: non ricorre nessun caso dell'art. 37 |

---

## 1. Messaggi dal modulo dei contatti

| | |
|---|---|
| **Finalità** | Rispondere a chi scrive |
| **Dati** | Nome, email, testo, le risposte; un'impronta HMAC della rete (per il freno a quattro messaggi l'ora) |
| **Base giuridica** | Consenso, art. 6.1.a (casella obbligatoria, non precompilata) |
| **Conservazione** | Sei mesi dall'ultimo scambio, poi la cancellazione automatica (`lib/messaggi_pulizia.php`). L'impronta si toglie dopo un'ora (`anonimizza_impronte_vecchie()`) |
| **Destinatari** | DreamHost (database), Google/Gmail (invio delle risposte e degli avvisi), Proton (casella del titolare dove arrivano gli avvisi) |
| **Misure** | Nessun indirizzo email in pagina; la conversazione continua da `/messaggio` con un gettone personale che vale 60 giorni |

## 2. Newsletter

| | |
|---|---|
| **Finalità** | Mandare gli aggiornamenti del sito |
| **Dati** | Email, nome facoltativo, prova del consenso (data e ora, testo, versione dell'informativa, fonte), date di conferma e di uscita |
| **Base giuridica** | Consenso, art. 6.1.a, con doppia conferma. Gli iscritti di prima di ottobre 2026 senza prova del consenso non ricevono numeri, solo la richiesta di riconferma |
| **Conservazione** | Fino all'uscita; chi esce resta solo con lo stato «uscito», per non ricevere più niente. Le iscrizioni non confermate si cancellano dopo 30 giorni |
| **Destinatari** | DreamHost, Google/Gmail |
| **Misure** | Conferma e uscita solo con un pulsante (mai con un GET); il consenso di un iscritto storico si registra solo dal clic nella sua casella, non dal modulo del sito (corretto il 16 ottobre 2026); freno di tre iscrizioni per rete ogni quarto d'ora |

## 3. Letture degli articoli

| | |
|---|---|
| **Finalità** | Contare le letture, una per rete al giorno |
| **Dati** | Impronta HMAC di rete (IPv6 ridotto a /64) e data; articolo; giorno |
| **Base giuridica** | Legittimo interesse, art. 6.1.f |
| **Conservazione** | L'impronta si sostituisce con un segnaposto il giorno dopo; resta il conteggio |
| **Destinatari** | DreamHost |
| **Misure** | Nessun cookie, nessuna sessione (fino al 16 ottobre 2026 il segnale di lettura apriva una sessione); la chiave HMAC sta in un file fuori dal docroot e fuori dal database |

## 4. Reazioni agli articoli

| | |
|---|---|
| **Finalità** | Contare le reazioni e permettere di toglierne una |
| **Dati** | Impronta HMAC di rete e User-Agent; reazione; articolo |
| **Base giuridica** | Legittimo interesse, art. 6.1.f |
| **Conservazione** | Finché la reazione resta; se ne va con l'articolo. Le impronte di prima del 16 ottobre 2026 (sha256 senza chiave) sono state sostituite da un segnaposto |
| **Destinatari** | DreamHost |

## 5. Protezione dei moduli

| | |
|---|---|
| **Finalità** | Limitare i tentativi ripetuti: login, recupero password, newsletter, contatti, reazioni, ricerca, letture |
| **Dati** | Impronta HMAC della rete (o del nome utente, per il login) e l'ora di ogni tentativo |
| **Base giuridica** | Legittimo interesse alla sicurezza, art. 6.1.f |
| **Conservazione** | La finestra del freno (da un minuto a un giorno); i file fermi da due giorni si cancellano |
| **Destinatari** | Nessuno: file sul server, fuori dal docroot (`lib/freno.php`) |
| **Misure** | Dal 16 ottobre 2026 nessun IP nel database: la tabella `login_attempts`, che li teneva in chiaro, è stata svuotata |

## 6. Log del server

| | |
|---|---|
| **Finalità** | Sicurezza e funzionamento dell'hosting |
| **Dati** | IP, data e ora, indirizzo richiesto, browser, codice di risposta |
| **Base giuridica** | Legittimo interesse, art. 6.1.f |
| **Conservazione** | Li tiene DreamHost: il 16 ottobre 2026 c'erano circa otto giorni di log |
| **Destinatari** | DreamHost |
| **Nota** | Il titolare li legge solo per diagnosi (per esempio, il 16 ottobre, per capire chi usava le vecchie API) |

## 7. Pannello di amministrazione

| | |
|---|---|
| **Finalità** | Gestire il sito |
| **Dati** | Utente unico (il titolare): nome utente, email, hash della password, cookie di sessione `__Host-sp_admin` |
| **Conservazione** | La sessione dura al massimo dodici ore, due senza attività |
| **Misure** | CSP senza script in linea, SameSite=Strict, gettone su ogni modulo, freno per rete e per nome utente |

## 8. Copie di sicurezza

| | |
|---|---|
| **Finalità** | Recuperare il sito dopo un guasto |
| **Dati** | Tutto il database (quindi anche iscritti e messaggi) e le immagini |
| **Conservazione** | Le ultime quattordici copie del database in `~/backup-db` sul server, fuori dal docroot; l'archivio delle immagini aggiornato a ogni copia; una copia sul computer del titolare (`F:\Backup\SimonePizziWebSite\backup-sito`, `scripts/server-tools/scarica_backup.py`) |
| **Misure** | La copia sul computer del titolare va trattata come il server: non si condivide. Un dato cancellato sparisce dalle copie man mano che vengono sostituite |

---

## Fornitori (responsabili del trattamento)

| Fornitore | Che cosa fa | Dove | Garanzie per il trasferimento |
|---|---|---|---|
| **DreamHost** (New Dream Network, LLC) | Hosting del sito e del database, log, copie di sicurezza | Stati Uniti (sede in California; i log hanno l'ora del Pacifico) | **Da verificare.** La politica di DreamHost si definisce «data processor» per i dati dei clienti e parla di «appropriate safeguards», senza nominare né le clausole contrattuali tipo né il Data Privacy Framework (letta il 16 ottobre 2026) |
| **Google** (Gmail) | Invio della posta del sito via SMTP | Stati Uniti | Da verificare sul pannello dell'account Google (termini di trattamento dei dati) |
| **Proton** | Casella del titolare dove arrivano gli avvisi | Svizzera (decisione di adeguatezza) | — |

## Da fare, a cura del titolare

1. **Il trasferimento verso DreamHost.** Verificare quale strumento copre i dati che DreamHost
   tratta per conto del titolare (un DPA da accettare dal pannello o da chiedere al supporto, le
   clausole contrattuali tipo, o la certificazione al Data Privacy Framework sul sito
   ufficiale del DPF) e scriverlo qui e, in una riga, nell'informativa.
2. **Lo stesso per Google** (Gmail come SMTP del sito).
3. Ricontrollare questa pagina a ogni versione che tocca dati personali.

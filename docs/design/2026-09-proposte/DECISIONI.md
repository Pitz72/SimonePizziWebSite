# DECISIONI — il sito nuovo in PHP puro

Sessione 1 della migrazione descritta in
[`docs/2026-09-07-consegna-migrazione-php-puro.md`](../../2026-09-07-consegna-migrazione-php-puro.md).
Direzione scelta da Simone il 7 settembre 2026: **D — Officina Notturna**
([mockup](D-officina-notturna.html), [README](README.md)).

Questo documento fissa le scelte tecniche. Da qui in poi si scrive codice.

---

## 0. L'apertura: campo nero

**Deciso da Simone il 7 settembre 2026: l'apertura è a campo nero**, la seconda delle due
varianti del mockup. Il titolo grande in bianco con «ibride» in verde, il filetto verde
sotto, i contatori in fila.

Il campo verde pieno resta nel mockup come alternativa vista e scartata: era la mossa più
rumorosa della direzione, e su un sito che vive di articoli lunghi il nero regge meglio la
lettura. Con questa scelta il verde torna a essere solo segnale, ovunque e senza eccezioni —
la regola del §1 diventa più semplice, non più debole.

Nel codice è la classe `.apertura` senza modificatori; il campo verde, se un giorno servisse
per una pagina sola, è `.apertura--piena`.

---

## 1. Niente framework CSS: token e basta

**Decisione: token CSS, Tailwind esce.** Con Tailwind fuori, dal sito esce anche npm:
niente `node_modules`, niente build, niente `dist/`. Si modifica un file e si carica quel
file.

Il motivo non è ideologico. Tailwind sarebbe rimasto l'unica dipendenza npm di un sito che
non ne ha più bisogno, e avrebbe portato con sé una build da rifare a ogni modifica del
CSS — cioè esattamente la cosa che questa migrazione toglie di mezzo. Il Festival è già
così; Runtime Magazine ha scelto diversamente, ma quello è un altro sito con un'altra
squadra.

I token, presi dal mockup e da tenere in `assets/css/base.css`:

```css
:root{
  --nero:#04070a;      /* fondo pagina */
  --pece:#080e0d;      /* barra, righe al passaggio */
  --pannello:#0b1310;  /* schede, citazioni */
  --filo:#16241c;      /* bordo visibile */
  --filo2:#0f1a15;     /* separatore fra righe */
  --testo:#dce8de;
  --spento:#7d9b84;    /* testo secondario, etichette */
  --verde:#22c55e;     /* segnale: solo dove c'è qualcosa di attivo */
  --verde2:#4ade80;    /* verde al passaggio del mouse */
  --gabbia:1300px;
}
```

**Il verde è un segnale, non una decorazione.** Regola da rispettare in tutto il sito:
compare solo sulla voce di menu corrente, sui link dentro il testo, sui pulsanti che
agiscono, sul punto della lettura in cui sei, sullo stato «in corso», e sul campo pieno
dell'apertura. Da nessun'altra parte.

**Il responsive si fa a media query.** Nel mockup erano container query, ma lì servivano a
mostrare il telefono accanto al desktop nella stessa pagina. Nel sito vero il contenitore è
la finestra, e per usare `@container` bisognerebbe dichiarare il `body` come contenitore:
`container-type: inline-size` porta con sé `contain: layout`, che cambia il punto di
riferimento di tutto ciò che è `position: fixed`. Non vale il prezzo. Le container query
restano disponibili per i singoli blocchi riusabili, dove il contenitore è un `div` normale.

## 2. I caratteri, tutti in casa

| Ruolo | Carattere | Stato |
|---|---|---|
| Titoli | **Bricolage Grotesque** (variabile, asse `wdth` a 78) | **da scaricare** |
| Corpo e interfaccia | **DM Sans** | c'è già, oggi via Google Fonts |
| Etichette, stati, date, dati | **Courier Prime** | c'è già, oggi via Google Fonts |

Tutti e tre self-hostati in `assets/fonts/` con `@font-face` e `font-display:swap`, come fa
il Festival: oggi il sito li chiede a `fonts.googleapis.com` a ogni visita, il che significa
mandare l'indirizzo IP di ogni lettore a Google senza averlo chiesto a nessuno. Portati in
casa, dalla CSP escono `fonts.googleapis.com` e `fonts.gstatic.com`.

Di Bricolage Grotesque serve solo il file variabile: un `.woff2` copre tutti i pesi e le
larghezze usate.

## 3. La struttura delle cartelle

Sul modello di `FDCA-PHP/public/`, che è già in produzione e funziona:

```
public/
  sito.php             front controller: legge l'URL, sceglie la pagina, stampa
                       ← si chiamerà index.php al taglio; finché il sito React
                         è in produzione i due file convivono
  dev-router.php       fa in locale quello che in produzione fa mod_rewrite
  .htaccess            invariato salvo la CSP (vedi §7)
  lib/
    avvio.php          sessione, config, connessione, funzioni comuni
    rotte.php          la tabella delle rotte con i testi SEO (vedi §4)
    db.php             PDO           ← si sposta da api/db.php
    config.php         credenziali   ← si sposta da api/config.php, resta fuori da git
    db_maintenance.php le ensure*    ← si sposta da api/
    helpers.php        slug, date in italiano, tempo di lettura, formattazioni
    safe_html.php      la ripulitura dell'HTML degli articoli (vedi §7)
                       ← copiata da FDCA-PHP/public/lib/helpers.php:804
    seo.php            <title>, description, JSON-LD, briciole di pane, OG
  partials/
    head.php  nav.php  footer.php  newsletter-form.php  scheda-articolo.php
    riga-lavorazione.php  stato.php
  pages/
    home.php  categoria.php  articolo.php  tag.php  progetti.php
    contatti.php  newsletter-conferma.php  newsletter-disiscrizione.php  404.php
  assets/
    css/base.css       token, tipografia, gabbia
    css/main.css       i blocchi del sito
    js/               (vedi §6)
    fonts/            i tre caratteri
    img/
  admin/               il pannello, una pagina PHP per schermata (vedi §8)
  api/                 solo gli endpoint che restano (vedi §5)
  uploads/             invariato, è dove stanno le immagini vere
```

Le cartelle `src/`, `node_modules/`, `dist/` e i file `package.json`, `vite.config.ts`,
`tsconfig*.json`, `prerender*.js`, `clean-dist.js`, `fix-slug.js` spariscono **all'ultimo
passo**, non al primo: finché il sito nuovo non è in produzione, il vecchio deve poter
essere ricostruito e ricaricato in dieci minuti.

## 4. Le rotte: una tabella sola

`lib/rotte.php` come nel Festival: una tabella che per ogni rotta dice quale pagina
stampare e con quali testi SEO scritti a mano. Le rotte con un segnaposto (`:slug`) hanno i
testi presi dal database, non dalla tabella.

| URL di oggi | Diventa | Da dove nasce |
|---|---|---|
| `/` | `pages/home.php` | `Hero` + `FeaturedCard` + `PortfolioGrid` + `ArticleArchive` |
| `/tutti-i-progetti` | `pages/progetti.php` | `AllProjects.tsx` |
| `/contatti` | `pages/contatti.php` | `ContactPage.tsx` |
| `/newsletter/confermato` | `pages/newsletter-conferma.php` | pagina statica |
| `/newsletter/disiscritto` | `pages/newsletter-disiscrizione.php` | pagina statica |
| `/tag/{tag}` | `pages/tag.php` | `TagArchiveWrapper` |
| `/{categoria}` | `pages/categoria.php` | `DynamicArchiveWrapper` |
| `/{categoria}/{slug}` | `pages/articolo.php` | `SingleArticle` + il ramo crawler di `index.php` |
| qualsiasi altra | `pages/404.php` con HTTP 404 vero | |

`/sitemap.xml` e `/robots.txt` restano come sono: già serviti da `sitemap.php` e
`robots.php` via `RewriteRule`. `/api/rss.php` resta.

**Il punto di partenza del lavoro non è una pagina bianca:** `public/index.php` alle righe
~200-800 già scrive in HTML l'articolo (con briciole di pane e JSON-LD `Article`), la
categoria, il tag, i progetti, i contatti e la home — lo fa solo quando passa un crawler.
Quel ramo diventa la pagina per tutti. È il pezzo più prezioso che c'è già e va letto per
primo.

**L'ordine di risoluzione conta.** `/{categoria}` e `/tutti-i-progetti` si assomigliano:
le rotte fisse si controllano prima, poi si cerca lo slug fra le categorie, poi si dà 404.
Le categorie sono gerarchiche (`parent_id`), ma le URL restano piatte a un livello come
oggi: `/il-relitto-silente`, non `/videogiochi/il-relitto-silente`.

## 5. Gli endpoint JSON che restano

Dopo la migrazione la maggior parte degli endpoint non serve più al pubblico, perché i dati
li legge direttamente la pagina PHP dal database. Restano vivi solo quelli che il
JavaScript del sito chiama davvero:

| Endpoint | Perché resta |
|---|---|
| `api/cerca.php` | la ricerca con Ctrl+K (nuovo: sostituisce `search.php` per il pubblico) |
| `api/reactions.php` | le reazioni si aggiungono senza ricaricare |
| `api/subscribers.php` | iscrizione alla newsletter senza ricaricare |
| `api/analytics.php` | registra la visita |
| `api/download.php` | i download dei file dei progetti |
| `api/rss.php` | il feed |

**Il modulo contatti diventa un POST normale** con redirect dopo l'invio (schema
post/redirect/get): funziona anche senza JavaScript, e `api/messages.php` resta solo per il
pannello.

Tutti gli altri (`articles`, `projects`, `categories`, `tags`, `media`, `upload`,
`navigation`, `stats`, `settings`, `auth`, `backup`, `optimize_db`, `newsletter_send`)
diventano **endpoint di solo pannello**: restano dove sono, ma non li chiama più nessuna
pagina pubblica. Conservano l'`X-Robots-Tag: noindex` aggiunto alla v1.27.0.

## 6. Il JavaScript pubblico: cinque file, nessuna libreria

| File | Che cosa fa | Da dove viene |
|---|---|---|
| `ricerca.js` | Ctrl+K, chiama `search.php`, elenco con tastiera | `SearchModal.tsx` |
| `reazioni.js` | le reazioni, con l'aggiornamento ottimistico | `ReactionBar.tsx` |
| `newsletter.js` | invio del modulo e messaggi di esito | `NewsletterSignup.tsx` |
| `sommario.js` | evidenzia la sezione in cui sei (`IntersectionObserver`) | `TableOfContents.tsx` |
| `interfaccia.js` | menu del telefono, modali (condividi, scrivi a Simone), torna su, barra di avanzamento | vari |

**Quello che sparisce e non viene rimpiazzato:** `framer-motion` (le transizioni si fanno
con le View Transitions native e `animation-timeline: view()`, come nel `main.css` del
Festival), `react-helmet-async` (i meta li scrive PHP), `dompurify` (la ripulitura si fa
sul server, vedi §7), `react-router-dom` (le rotte sono §4).

**Il cursore personalizzato e la grana non passano nel sito nuovo.** Il cursore nasconde
quello di sistema su tutto il sito e non serve a niente; la grana è un rettangolo animato a
schermo intero che gira sempre. Se ne sente la mancanza si rimettono, ma partiamo senza.
Le particelle diventano il dettaglio dietro l'apertura, non un tappeto.

## 7. Sicurezza: due cose da chiudere per costruzione

**`safe_html()`.** Oggi `public/index.php:553` passa il corpo dell'articolo per
`strip_tags($article['content'], '<p><br><h2><h3><h4><ul><ol><li><strong><em><a><blockquote><pre><code>')`.
`strip_tags` toglie i tag non ammessi ma **non tocca gli attributi**: un
`<a href="javascript:…">` o un `<p onmouseover="…">` scritti nell'editor passano interi.
Nel sito nuovo c'è un solo punto in cui l'articolo viene stampato, e ci passa `safe_html()`,
che si copia da **`FDCA-PHP/public/lib/helpers.php:804`**: DOMDocument, lista bianca di tag
**e attributi**, e controllo sullo schema degli URL. La lista bianca deve essere gemella di
quella dell'editor (§8), altrimenti l'autore scrive cose che il sito poi butta via senza
dirglielo.

**La CSP con il nonce.** Oggi `script-src 'self'` funziona perché il JavaScript sta tutto
in file esterni. Nel sito nuovo servirà qualche script in linea (i dati della pagina, il
grafico del pannello): ognuno riceve un `nonce` generato per richiesta, e la CSP diventa
`script-src 'self' 'nonce-…'`. Da `style-src` e `font-src` escono i domini di Google quando
i caratteri sono in casa (§2). `frame-src` di YouTube resta.

Le altre dieci voci dell'hardening della v1.19.0 non si toccano.

## 8. Il pannello

Server-rendered, una pagina PHP per schermata, sul modello di `FDCA-PHP/public/admin/`.

**Arrivano già fatte dal Festival:** login e recupero password, elenco e scheda news,
libreria media con il selettore, newsletter, messaggi, impostazioni, sistema, profilo.

**Sono di questo sito e vanno scritte:** progetti, categorie gerarchiche, tag (rinomina e
unione, con i conteggi), elenco articoli con azioni in blocco e duplica, cruscotto con il
grafico delle visite (Chart.js self-hostato, un file solo).

**L'editor** è `FDCA-PHP/public/assets/js/editor.js`, copiato e adattato: lista bianca
gemella di `safe_html()`, markdown all'incolla, pulizia di quello che arriva da Word e
Google Docs, video YouTube, bozza locale. Da aggiungere: il **selettore dei link interni**
(oggi `InternalLinkSelector.tsx`). Le tabelle si portano **solo se Simone le usa davvero**:
prima si controlla sul database (`SELECT COUNT(*) FROM articles WHERE content LIKE '%<table%'`),
poi si decide.

**Il verificatore SEO** è `seo-check.js` del Festival, con in più il controllo sui tag (2-8)
che gli altri due siti non hanno. Le soglie sono quelle unificate nella consegna, non quelle
di `SeoScorePanel.tsx`.

**La scheda articolo a una colonna,** nell'ordine: dati (titolo, slug, riassunto, riquadro
«Come esce su Google», copertina, categoria, tag, stato, data, vetrina, i due CTA), poi
l'editor, poi il verificatore, in fondo il grafico delle visite.

## 9. Il database: tre colonne nuove, nessuna migrazione di dati

Tutte e tre aggiunte con una funzione `ensure*` in `lib/db_maintenance.php` — **mai più uno
script PHP caricato sul server**, il protocollo è già quello su Runtime.

| Tabella | Colonna | A che serve |
|---|---|---|
| `articles` | `seo_title` | «Titolo per Google», ≤ 60 caratteri; se vuoto si usa `title` |
| `articles` | `seo_description` | «Descrizione per Google»; se vuota si usa `excerpt` |
| `projects` | `stato` | `in_corso` · `pubblicato` · `open_source` · `archiviato` |

La terza è quella che regge le etichette del mockup. Oggi quel dato non esiste da nessuna
parte, e senza di esso le etichette sarebbero finte: è la cosa che va riempita a mano una
volta sola, diciotto righe.

Se si decide di mostrare lo stato anche sugli articoli, la stessa colonna va su `articles` —
ma vale la pena aspettare di vedere il sito in piedi prima di decidere.

Tutto il resto dello schema resta com'è.

## 9-bis. Il database in sviluppo

MySQL di DreamHost non accetta connessioni da fuori (errore 1045): in locale il database
non c'è, e senza database non si prova niente. Le API pubbliche del sito però rispondono a
chiunque, quindi i dati veri si prendono da lì e si mettono in un file SQLite:

```bash
bash scripts/sviluppo/scarica-dati.sh        # 78 articoli, 28 categorie, 16 progetti
php  scripts/sviluppo/crea-db-sviluppo.php   # → scratch/sviluppo.sqlite
```

`lib/db.php` sceglie da solo: SQLite quando gira sotto `php -S`, MySQL altrimenti. La
produzione non può finire su SQLite nemmeno per sbaglio, perché la distinzione è il SAPI.

Il prezzo è una regola nelle query, scritta in cima a `lib/query.php`: solo SQL che MySQL e
SQLite parlano entrambi. Niente `NOW()` (l'adesso arriva da PHP), niente `DATE_FORMAT` (le
date si formattano in `helpers.php`, che per i mesi in italiano serviva comunque), niente
`GROUP_CONCAT` (la sintassi del separatore è diversa fra i due).

## 10. Il deploy, senza build

Oggi `.secrets/deploy.py` (paramiko, solo `put`) carica `dist/` su
`~/simonepizzi.runtimeradio.it/`. Senza build `dist/` non esiste più: si carica direttamente
`public/`.

Il file va adattato con tre regole:

1. **Non caricare mai** `lib/config.php` (credenziali del database, diverse in produzione),
   `uploads/` (le immagini vere stanno lì e sono più recenti di quelle locali), e qualunque
   `.map`.
2. **Copia di sicurezza dei file sovrascritti** prima di sostituirli, come fa il deploy del
   Festival: senza build, un errore di battitura in un `.php` è offline immediato.
3. **Caricare `.htaccess` per ultimo**, così se il caricamento si interrompe a metà il sito
   vecchio continua a funzionare.

Resta valido quello che si sa già: MySQL da remoto è chiuso (errore 1045), quindi ogni cosa
che tocchi il database passa dalle `ensure*` al primo caricamento di una pagina.

## 11. Che cosa non si tocca

- **Nessuna URL cambia.** Né le rotte della tabella al §4, né gli slug, né la struttura
  `/{categoria}/{slug}`. I due `RedirectMatch` in `.htaccess` (`/software` →
  `/progetti-software`, `/libri` → `/narrativa-e-pubblicazioni`) restano.
  Due cose si aggiungono, e sono redirect permanenti, non cambi: la barra finale porta
  all'indirizzo senza barra, e un articolo chiesto con la categoria sbagliata porta a quella
  giusta. Oggi lo stesso articolo risponde 200 sotto qualunque categoria, il che significa
  che a Google può arrivare la stessa pagina a più indirizzi.
- **Nessun dato si migra.** Stesso database, stesse tabelle, stesse righe.
- **Nessun CDN.** Caratteri, script e CSS stanno tutti in casa.
- **`uploads/` non si tocca**, e `api/upload.php` (ridimensiona sopra i 1920px e converte in
  WebP con GD) resta esattamente com'è.

## 12. L'ordine di lavoro

| | Che cosa | Come si sa che è finita |
|---|---|---|
| **2** ✅ | `lib/`, `partials/`, le rotte, `safe_html()`, i caratteri in casa | ✅ 26 rotte su 26, 17 prove su `safe_html()` |
| **3** ✅ | home, categoria, tag, articolo, progetti + i cinque JS | ✅ 32 rotte su 32, le pagine hanno i blocchi del mockup |
| **4-6** ✅ | il pannello, l'editor, il verificatore, il cruscotto | ✅ 26 prove: si scrive, si pubblica, si duplica e si cancella davvero |
| **7** ✅ | collaudo e deploy | ✅ 165 URL della sitemap su 165; resta da premere il pulsante del caricamento |

Il collaudo si fa senza Node, sul modello di `FDCA-PHP/docs/collaudo/`: le funzioni pure
provate direttamente, `safe_html()` con una batteria di HTML cattivo, le rotte con `curl`
contro `dev-router.php`. Ogni indirizzo che oggi risponde 200 deve rispondere 200 domani,
con lo stesso `<title>` e la stessa description, salvo i miglioramenti voluti.

---

## 13. Dove siamo — fine della Sessione 2

Quello che risponde già, con i dati veri del sito:

```bash
php -S 127.0.0.1:8123 -t public public/dev-router.php    # il sito nuovo
bash docs/collaudo/prova-rotte.sh                        # 26 rotte su 26
php  docs/collaudo/prova-safe-html.php                   # 17 prove su 17
```

**Esiste e funziona:** le nove rotte, la barra con la categoria corrente illuminata (anche
quando si è in una sottocategoria), il piede, le briciole di pane, i `<title>` e le
description veri, i JSON-LD (`Article`, `CollectionPage`, `BreadcrumbList`, `WebSite`), la
CSP con il nonce, i tre caratteri in casa, la paginazione degli archivi, il 404 con il suo
stato HTTP, e il corpo degli articoli che passa da `safe_html()`.

**Non esiste ancora, ed è la Sessione 3:** i blocchi disegnati del mockup — il campo pieno
in apertura, la scheda in primo piano, le righe delle lavorazioni con la copertina che si
accende, le schede dei progetti, il sommario dell'articolo — e i cinque moduli JavaScript.
Le pagine di adesso mostrano gli stessi dati in elenchi nudi.

### Tre cose imparate strada facendo

**Gli articoli stanno nelle sottocategorie.** `videogiochi` e `progetti-software` non hanno
un solo articolo assegnato direttamente: senza raccogliere anche le figlie, le pagine delle
sei categorie principali sarebbero vuote. `api/articles.php` lo faceva dalla v1.10.2, il
ramo per i crawler di `index.php` no — le stesse pagine mostravano cose diverse a Google e
ai lettori. Adesso il percorso è uno solo (`slug_del_ramo()` in `query.php`).

**Nessun articolo è segnato «in vetrina».** Tutti e 78 hanno `is_featured = 0`, quindi la
home ha un ripiego: se non c'è niente in vetrina si prende il più recente, invece di
lasciare un buco perché una casella non è mai stata spuntata. Nella Sessione 3 l'elenco
sotto dovrà escludere l'articolo in apertura, che altrimenti compare due volte.

**Un partial condivide lo scope di chi lo include.** Il `foreach` della barra usava `$c`
come variabile di ciclo e portava via alla home i suoi conteggi: quattro warning stampati in
mezzo alla pagina, dentro una risposta 200. Il test non se ne accorgeva, perché
`display_errors` scrive `<b>Warning</b>:` e la stringa «Warning:» non compare mai per
intero. Adesso `prova-rotte.sh` toglie i tag prima di cercare, e nei partial le variabili
hanno nomi lunghi.

---

## 14. Fine della Sessione 3

Le pagine hanno i blocchi disegnati del mockup, e i moduli JavaScript sono al loro posto.

```bash
php -S 127.0.0.1:8123 -t public public/dev-router.php
bash docs/collaudo/prova-rotte.sh        # 32 rotte su 32
php  docs/collaudo/prova-safe-html.php   # 17 prove su 17
```

**Le pagine.** Apertura a campo nero con i quattro numeri veri; scheda «in primo piano»
con la copertina che si accende al passaggio; righe delle lavorazioni al posto delle card;
schede dei progetti con i due comandi sempre in fondo; articolo con il sommario numerato a
lato, la barretta verde che segue la lettura, le cinque reazioni e i tag; archivi di
categoria e di tag con la paginazione; la lettera in fondo a ogni pagina.

**I moduli JavaScript** (`assets/js/`, nessuna libreria, in tutto 18 KB):
`interfaccia.js` (menu del telefono, finestre), `ricerca.js` (Ctrl+K, frecce e Invio),
`sommario.js` (IntersectionObserver), `reazioni.js` (aggiornamento ottimistico più
condivisione), `newsletter.js`. Tutti `defer`: la pagina si legge prima che arrivino.

**`api/cerca.php` è nuovo e sostituisce `search.php` per il pubblico.** Due ragioni:
`search.php` cerca ancora in `articles.tags`, colonna che la v1.26.0 ha sostituito con la
tabella `article_tags`, e non passa da `lib/`, quindi in sviluppo non si può nemmeno
provare. `search.php` resta finché il pannello non è migrato: lo usa ancora lui.

### Quattro difetti trovati guardando le pagine vere

**`.apertura-dentro{padding:52px 0 0}` cancellava il margine laterale della gabbia.** La
scorciatoia `padding` sovrascrive tutti e quattro i lati, e `.gab` veniva prima nel
cascade: il titolo toccava il bordo dello schermo su ogni pagina e a ogni larghezza. Le
classi che convivono con `.gab` adesso usano `padding-block`. È la collisione più banale
del CSS e non si vede finché non si guarda.

**Le copertine sparivano nel fondo.** `grayscale(1) brightness(.72)` su fotografie già
scure — palchi, notti, schermi spenti — dava rettangoli neri. Adesso si toglie il colore e
non la luce: `grayscale(1) contrast(1.04)`.

**La ricerca si apriva con il fuoco sul pulsante «Esc»**, così chi la apriva e cominciava a
scrivere digitava nel vuoto. Risolto con `autofocus` nel markup più un rimessa a fuoco a
ogni apertura, perché il browser applica `autofocus` una volta sola.

**Sulla barra del telefono stavano quattro cose e andavano a capo.** «Tutti i progetti» è
sceso dentro il menu a discesa, e il nome non si spezza più.

### Quello che in locale non si può provare

`reactions.php` e `subscribers.php` parlano ancora con `api/db.php`, cioè con MySQL: in
sviluppo non rispondono. Il JavaScript lo sa e non se ne lamenta con il lettore — i
contatori delle reazioni restano a trattino e la pagina funziona lo stesso. Vanno provati
in produzione, o dopo che `api/config.php` si sarà spostato in `lib/`.

**Le etichette di stato non si vedono ancora**, perché `projects.stato` non esiste: il
blocco è scritto e funziona, ma finché la colonna è vuota l'etichetta non si stampa. Meglio
niente che un'etichetta finta — che è esattamente il difetto che questa direzione voleva
togliere di mezzo.

---

## 15. Fine delle Sessioni 4-6 — il pannello

```bash
php -S 127.0.0.1:8123 -t public public/dev-router.php
bash docs/collaudo/prova-pannello.sh     # 26 prove: entra, apre tutto, scrive e cancella
bash docs/collaudo/prova-rotte.sh        # 32 rotte
php  docs/collaudo/prova-safe-html.php   # 17 prove
```

In sviluppo si entra con **simone / sviluppo-locale**. Il riquadro che lo dice compare solo
sotto `php -S`: in produzione non esiste.

### Le schermate

| | Che cosa fa |
|---|---|
| **Cruscotto** | i sei numeri che contano (cliccabili), il grafico delle visite di trenta giorni, i più letti, gli ultimi toccati, e l'avviso sulla coda dei tag |
| **Articoli** | elenco con ricerca, filtri per stato e categoria, paginazione, e le azioni in blocco: pubblica, rimetti in bozza, duplica, elimina |
| **Scheda articolo** | una colonna sola: dati → «come esce su Google» con l'anteprima → editor → verificatore. Sotto, la barra dei comandi che resta a portata mentre si scrive |
| **Progetti** | elenco e scheda nella stessa pagina, con lo **stato** e i due comandi |
| **Categorie** | la gerarchia a due livelli; una categoria con articoli dentro non si cancella, e il pannello lo dice prima |
| **Tag** | rinomina in riga, unione dei doppioni, evidenza degli orfani e di quelli sotto la soglia dell'indice |
| **Immagini** | la libreria, con la copia dell'indirizzo |
| **Messaggi** | quelli dal modulo contatti, con il pallino su quelli da leggere |
| **Newsletter** | iscritti divisi per stato del doppio consenso |
| **Sistema** | ambiente, schema, migrazioni applicate, e le cinque cose che si rompono in silenzio |

### L'editor

Arriva da `FDCA-PHP/public/assets/js/editor.js`, dove è in produzione dalla v1.14.0, e porta
con sé quello che costa mesi imparare: l'incolla che riconosce il markdown, la pulizia di
Word e Google Docs, i video YouTube, la bozza salvata in locale. Tre differenze, tutte di
questo sito: le **tabelle**, il comando **«Link interno»** che cerca un articolo e ne
inserisce l'indirizzo giusto invece di farlo copiare a mano, e i nomi globali (`spEditor`,
`spApriLibreria`).

La lista bianca dell'editor e `HTML_AMMESSO` di `lib/safe_html.php` sono la stessa cosa
scritta in due linguaggi: se si tocca una, si tocca l'altra. Altrimenti l'autore scrive
cose che il sito butta via senza dirglielo.

Il **verificatore** è tornato a casa: era nato qui come `SeoScorePanel.tsx`, è passato al
Festival il 7 settembre, e rientra senza React con le soglie unificate e un decimo controllo
che gli altri due siti non hanno — i tag, da 2 a 8.

### La sicurezza del pannello

Sessione con `session_version` (una password cambiata invalida le sessioni aperte), freno a
otto tentativi per indirizzo IP ogni quarto d'ora, hash finto verificato anche quando
l'utente non esiste (senza, il tempo di risposta direbbe quali nomi utente esistono), un
messaggio solo per «nome sbagliato» e «password sbagliata», gettone anti-CSRF su ogni
modulo, e `X-Robots-Tag: noindex` più `Cache-Control: no-store` su tutte le pagine.

### Il database di sviluppo, completo

`scripts/sviluppo/popola-dati-finti.php` aggiunge quello che le API pubbliche non danno:
un utente, otto messaggi, quarantadue iscritti, settecento reazioni, cinquemila visite
distribuite su novanta giorni con un profilo credibile, la libreria immagini e le
impostazioni. **È tutto finto e si riconosce**: gli indirizzi finiscono in `@esempio.it`.
L'unica eccezione dichiarata è lo stato dei sedici progetti, ricavato dagli articoli veri —
in produzione la colonna nasce vuota e va riempita a mano una volta sola, dal pannello.

### Quattro difetti trovati aprendo le schermate

**Aprire un articolo la cui categoria è stata cancellata, e premere Salva, gli toglieva la
categoria.** Il `<select>` non aveva quell'opzione, quindi mandava una stringa vuota:
l'articolo perdeva il suo indirizzo pubblico senza che nessuno dicesse niente. Adesso la
categoria orfana resta in elenco, marcata, e il pannello spiega la situazione.

**Il riquadro del link nell'editor era sempre aperto.** `editor.js` lo crea con
l'attributo `hidden`, ma il CSS gli dava `display:flex`, che vince: la regola `[hidden]`
va scritta, non data per scontata.

**«Un copia creata».** Il messaggio si componeva incollando «Un » davanti al nome
dell'operazione. In italiano l'articolo dipende dal nome che segue: adesso il singolare
arriva scritto per intero.

**`categoria_per_id()` non leggeva `sort_order`**, così la scheda della categoria apriva
quel campo vuoto e ogni salvataggio rimetteva l'ordine a zero.

### Che cosa manca al sito nuovo per andare in produzione

Niente, tranne premere il pulsante: vedi §16.

---

## 16. Il taglio — pronto per il deploy

Le quattro cose che mancavano sono fatte.

**`sito.php` è diventato `index.php`.** Il vecchio motore — il guscio React con l'HTML
per i soli crawler — è diventato `index-react.php` e non lo raggiunge più nessuna rotta.
Resta nel repo, spento, finché non sarà chiaro che non serve: rinominarlo e ricostruire
`dist/` riporta su il sito di prima in dieci minuti.

**Dalla `.htaccess` è uscita la CSP.** Adesso la manda `partials/head.php` con il nonce,
che un file di configurazione non può generare perché cambia a ogni richiesta.
`Header always set` avrebbe vinto su quella di PHP, quindi la riga vecchia è commentata,
con scritto perché e come si rimette se serve.

**Le immagini si caricano.** `admin/carica.php` fa quello che faceva `api/upload.php` —
estensione in elenco, byte veri controllati, niente punti nel nome (`shell.php.jpg` con
certe configurazioni di Apache viene eseguito), ridimensionamento sopra i 1920px e WebP a
qualità 82 — ma passando da `lib/`, quindi funziona anche in sviluppo. La finestra della
libreria ha il campo per caricare, e la nuova immagine compare in cima alla griglia senza
ricaricare la pagina.

**Il recupero password c'è**: `admin/recupera.php` e `admin/reimposta.php`. La risposta è
sempre la stessa che il nome esista o no, il link vale un'ora, e cambiare la password alza
`session_version`, cioè butta fuori le sessioni aperte altrove — che è il motivo per cui un
recupero esiste. In sviluppo, dove non c'è un server di posta, il link si mostra a schermo
invece di fingere di averlo mandato.

### Il confronto con la sitemap

```bash
curl -sS -A "Mozilla/5.0 Chrome/128" https://simonepizzi.runtimeradio.it/sitemap.xml      -o scratch/dati-produzione/sitemap.xml
php docs/collaudo/confronta-con-la-sitemap.php
```

**165 indirizzi su 165 rispondono 200.** Nessuno si perde, nessuno rimanda altrove, tutti
hanno un `<title>`. È la prova che conta prima di caricare: un 404 su una URL già
indicizzata costa mesi, e non se ne accorge nessuno finché non arrivano le segnalazioni.

### Il caricamento

```bash
python scripts/deploy/carica.py --prova     # dice che cosa farebbe
python scripts/deploy/carica.py             # carica
```

116 file, circa 2,9 MB (i caratteri sono la metà). Tre regole scritte dentro allo script:

1. `lib/config.php`, `api/config.php` e `uploads/` **non partono mai**. Il primo
   staccherebbe il sito dal database, l'ultimo cancellerebbe le copertine.
2. Ogni file sovrascritto finisce prima in `.backup-AAAAMMGG-HHMMSS/` sul server. Senza una
   build che controlli la sintassi, un errore di battitura in un `.php` è il sito offline:
   il ripristino dev'essere una copia, non un ricaricamento a memoria.
3. `.htaccess` si carica **per ultimo**: se il caricamento si interrompe a metà, quello
   vecchio continua a servire il sito vecchio, che è ancora tutto lì.

### Il difetto che si sarebbe visto solo in produzione

Lo schema della tabella `media` che avevo simulato aveva le colonne `file_name`,
`alt_text`, `file_size`. Quelle vere, cioè quelle che scrive `api/upload.php`, sono
`filename`, `mime_type`, `size`. In sviluppo tutto funzionava; al primo caricamento in
produzione la libreria si sarebbe rotta. **Uno schema di sviluppo che si discosta da quello
di produzione non fa risparmiare tempo: lo sposta più avanti, dove costa di più.**

### Dopo il caricamento

1. Home, un articolo, un archivio di categoria, uno di tag.
2. Il pannello: la prima apertura applica le migrazioni (`seo_title`, `seo_description`,
   `projects.stato`) — si controlla dalla schermata Sistema.
3. I sedici stati dei progetti, da mettere a mano una volta sola.
4. `/sitemap.xml` e `/robots.txt`.
5. Search Console dopo una settimana.

---

## 17. Due difetti trovati pubblicando il primo articolo (8 settembre 2026)

Il primo articolo messo **in programmazione** dopo il taglio ha fatto emergere due cose che
il collaudo non copriva, perché nessuna delle due si vede fino a quando non si usa il sito
per il lavoro vero.

### 1. L'anteprima di un articolo programmato dava 404 anche all'amministratore

`SOLO_PUBBLICATI` (`lib/query.php`) taglia via `published_at > adesso`, e un articolo
programmato è esattamente `status='published'` con la data nel futuro. Quindi
`articolo_per_slug()` non lo trovava e `index.php` rispondeva 404 — **a chiunque, sessione
del pannello compresa**, perché nessuna pagina pubblica carica `lib/auth.php` e il sito non
sa chi sta guardando.

Non era una regressione dello stato dell'arte, era una funzione persa nella migrazione: il
sito React aveva `?admin=true` sugli endpoint, che scavalcava i filtri di visibilità
(bozze e articoli futuri). Il sito PHP non l'ha portata dietro.

Peggiorava la confusione il pannello, che offriva il link «Vedi sul sito» per tutti gli
articoli `published`, programmati compresi, verso un indirizzo che sapeva già rispondere 404.

**Come è stata rimessa.** Tre pezzi, e nessuno tocca né le URL né quello che vede un
visitatore:

- `admin_in_ascolto()` in `lib/avvio.php` — dice se chi guarda è l'amministratore già
  entrato nel pannello. Apre la sessione **solo se il browser porta già il cookie
  `sp_admin`**: senza quel freno, ogni visita di ogni lettore aprirebbe una sessione PHP e
  ne scriverebbe il file su disco, un costo pagato da tutti per servire uno.
- `articolo_per_slug_in_anteprima()` in `lib/query.php` — **l'unica lettura del sito
  pubblico che scavalca `SOLO_PUBBLICATI`**, e va tenuta l'unica. Se anche gli elenchi
  mostrassero i programmati, nessuno riuscirebbe più a capire che cosa è davvero online.
- La rotta 4 di `index.php` la prova solo quando la ricerca pubblica ha già fallito, così
  la strada normale non cambia di una query.

La pagina in anteprima si dichiara `noindex`, mette «Anteprima · » nel `<title>` e stampa
in cima una **fascia verde piena** che dice quando l'articolo esce e che al pubblico quello
stesso indirizzo risponde «pagina non trovata». È l'unico verde pieno del sito pubblico
fuori dall'apertura, ed è voluto: un riquadro discreto qui sarebbe un difetto, perché il
rischio è credere che una cosa sia online quando non lo è.

Nel pannello «Vedi sul sito ↗» e «Anteprima ↗» sono ora due parole diverse per due cose
diverse (`link_al_sito()` in `admin/_layout.php`), e le bozze — che prima non avevano
nessun modo di essere viste — hanno il loro link.

### 2. La tendina delle categorie mescolava sezioni e sottocategorie

`admin_categorie()` torna un elenco piatto ordinato per `sort_order`, che è una **sequenza
globale in ordine di nascita**, non un ordine dentro il ramo. Le figlie finivano dove le
aveva messe la data di creazione: le sei di «Software» alle posizioni 11, 12, 15, 17, 22 e
28, e «Il Mistero della Santa Maria» in fondo alla tendina invece che sotto «Videogiochi».
Il prefisso `— ` diceva che una voce era figlia, non **di chi**.

La schermata Categorie faceva già la cosa giusta (cicla le radici e annida le figlie); le
tendine no. Adesso `admin_categorie_ad_albero()` riordina in `sezione → sue figlie` — con
`sort_order` rispettato dentro ogni ramo, lo stesso ordine che il sito pubblico usa in
`sottocategorie()` — ed `etichetta_categoria()` rientra le figlie con `↳`. La usano tutti e
tre i punti che ne avevano bisogno: l'editor degli articoli, quello dei progetti e **il
filtro per categoria dell'elenco articoli**, che soffriva dello stesso disordine senza che
nessuno l'avesse segnalato.

Una figlia il cui genitore è stato cancellato non sparisce: va in fondo. Gli articoli che
ha dentro esistono e vanno pur assegnati a qualcosa.

### Un difetto latente chiuso per strada

`index.php` mandava un `Location` verso `url_articolo()` senza controllare che l'articolo
avesse una categoria. Con la categoria vuota l'indirizzo è `//slug`, che per un browser non
è un percorso ma **l'host `slug`**. In anteprima capita spesso — una bozza si comincia a
scriverla prima di decidere dove va — quindi il controllo c'è ora.

### La cache, che qui è una questione di sostanza

In produzione la pagina di un articolo esce con **`Cache-Control: max-age=600`**, messo a
livello Apache: non sta in questo repo, è l'`.htaccess` della home — lo stesso che appende
un `max-age` agli endpoint, annotato alla v1.25.0. Su una risposta d'anteprima quel valore è
sbagliato due volte: una cache condivisa potrebbe servire a un visitatore un articolo non
ancora uscito, e il browser dell'amministratore gli mostrerebbe la fascia per dieci minuti
**dopo** la pubblicazione.

`pages/articolo.php` manda quindi `Cache-Control: private, no-store` prima di `head.php`,
solo in anteprima. **Da verificare al primo caricamento**, perché un `Header set` di Apache
vince su un `header()` di PHP e quello della home è fuori dal nostro controllo:

```bash
curl -sI -b 'sp_admin=…' https://simonepizzi.runtimeradio.it/{categoria}/{slug} | grep -i cache
```

Se vince Apache, la correzione è una riga nel nostro `.htaccess`, che è più specifico di
quello della home e quindi si applica dopo:

```apache
Header always set Cache-Control "private, no-store" "expr=%{HTTP_COOKIE} =~ /sp_admin=/"
```

Non è stata messa adesso perché un `.htaccess` sbagliato è il sito offline, e va provata
sapendo già che serve.

### Il collaudo

`prova-pannello.sh` passa da 26 a **32 prove**: la bozza e il programmato danno 404 al
pubblico e 200 con il cookie del pannello, la fascia c'è, il `noindex` c'è, la fascia nomina
la data di uscita, e la risposta si dichiara `no-store`.

```bash
bash docs/collaudo/prova-pannello.sh     # 32 prove
bash docs/collaudo/prova-rotte.sh        # 32 rotte
php  docs/collaudo/prova-safe-html.php   # 17 prove
php  docs/collaudo/confronta-con-la-sitemap.php   # 165 indirizzi
```

### Restano da fare a mano, dal pannello

Due nomi di categoria hanno una maiuscola di troppo — **«Il Relitto SIlente»** e **«Good
VIbrations»** — e il nome della categoria finisce nel `<title>`, nella meta description,
negli `og:` e nel JSON-LD della pagina di sezione. Si correggono da `/admin/categorie.php`
toccando il solo campo **Nome**: lo slug resta, quindi nessun indirizzo cambia. Da qui non
si possono correggere, perché MySQL non accetta connessioni da fuori.

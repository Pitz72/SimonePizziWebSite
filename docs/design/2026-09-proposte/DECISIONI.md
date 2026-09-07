# DECISIONI — il sito nuovo in PHP puro

Sessione 1 della migrazione descritta in
[`docs/2026-09-07-consegna-migrazione-php-puro.md`](../../2026-09-07-consegna-migrazione-php-puro.md).
Direzione scelta da Simone il 7 settembre 2026: **D — Officina Notturna**
([mockup](D-officina-notturna.html), [README](README.md)).

Questo documento fissa le scelte tecniche. Da qui in poi si scrive codice.

---

## 0. L'unica cosa ancora aperta

**L'apertura è a campo verde o a campo nero?** Il mockup mostra le due versioni una
sotto l'altra. Finché Simone non dice altro **vale il campo verde**, che è la versione
principale del file: è la mossa che tiene in piedi la direzione, e il nero la ammorbidisce
fino a farla somigliare a «Segnale». Nel codice è una classe sola sul contenitore
dell'apertura (`.hero.sobria`), quindi si cambia idea in un minuto anche a sito fatto.

Tutto il resto qui sotto non dipende da questa scelta.

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
| `api/search.php` | la ricerca con Ctrl+K cerca senza ricaricare la pagina |
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
| **3** | home, categoria, tag, articolo, progetti, contatti + i cinque JS | ogni URL della sitemap risponde 200 con il suo contenuto |
| **4-6** | il pannello, l'editor, il verificatore, il cruscotto | si scrive e si pubblica un articolo senza toccare il vecchio |
| **7** | collaudo e deploy | confronto URL per URL con la sitemap, poi Search Console dopo una settimana |

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

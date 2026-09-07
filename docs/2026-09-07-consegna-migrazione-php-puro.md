# Consegna del 07/09/2026 — perché questo repo non è stato toccato, e la migrazione a PHP puro

> Chi legge: il Claude che lavora in questo repo nella prossima sessione. Questo documento
> spiega che cosa è successo il 7 settembre negli altri due siti di casa e perché qui non è
> cambiato niente; poi descrive **il lavoro deciso da Simone per questo repo**: la migrazione
> del sito a HTML + JavaScript + PHP, abbandonando React, **preceduta da due o tre proposte di
> design nuovo da mostrare a Simone visivamente prima di scrivere una riga di codice**.

---

## Parte 1 — Che cosa è successo, e perché qui non c'è traccia

### La decisione del 7 settembre

Simone ha chiesto di parificare gli editor articoli dei tre siti: Festival della Canzone
Artificiale (`FDCA-PHP`, PHP puro server-rendered), Runtime Radio (`SitoRuntime`, React +
Tiptap) e questo. L'analisi completa sta nel repo del manuale:
`MODELLO-UNIVERSALE-miniCMS/_ricognizioni/2026-09-07-omologazione-editor-tre-siti.md`. Da questo
repo sono state prese due cose e portate negli altri due:

- **il verificatore SEO** (`src/components/admin/SeoScorePanel.tsx`), tradotto in JavaScript
  puro per il Festival (`assets/js/seo-check.js`) e in un componente per Runtime
  (`SeoCheck.tsx` + `utils/seoCheck.ts`);
- **la parola chiave principale** (`focus_keyword`, tua dalla v1.27.0), diventata colonna anche
  in `news` degli altri due.

Il Festival ha dato agli altri i campi «Titolo per Google» e «Descrizione per Google»; Runtime
ha dato al Festival l'incolla-markdown. Nel giro di una giornata Festival (v1.14.0) e Runtime
(v2.35.0) sono stati parificati e messi in produzione.

**Questo repo è stato lasciato com'era, di proposito.** Simone ha deciso che la sua parte
dell'omologazione — passare a una colonna sola, ricevere i campi Google, ricevere
l'incolla-markdown — non si fa sul React attuale, perché si butterebbe: **si fa dentro la
migrazione a PHP puro**, dove l'editor arriva già pronto dal Festival.

### Le soglie del verificatore sono cambiate (negli altri due)

Il tuo `SeoScorePanel.tsx` è l'origine, ma nel porting le soglie sono state **unificate** con
quelle del Festival. Quando lo riscriverai nel sito nuovo, usa queste, non quelle del file
attuale:

| Controllo | Oggi qui | **Soglia unica dei tre siti** |
|---|---|---|
| Titolo | 30-65 | 30-65 |
| Titolo per Google | non c'è | ≤ 60 (vuoto: si valuta il titolo) |
| Descrizione (excerpt / descrizione per Google) | 80-165 | 120-158 ideale, 80-165 accettabile, fuori è un avviso |
| Copertina | presente | presente |
| Corpo | ≥ 300 (errore < 100) | uguale |
| Struttura | almeno un H2/H3 | uguale |
| Tag | 2-8 | resta **solo qui** (gli altri non hanno i tag): punteggio su 10 invece che su 9 |
| Parola chiave | titolo, riassunto, corpo | uguale, con «riassunto» che diventa la descrizione per Google se scritta |

### Un difetto che hai e che gli altri due non hanno più

`public/index.php`, riga 553 (oggi): il corpo dell'articolo per i crawler passa da
`strip_tags($article['content'], '<p><br><h2>…')`. `strip_tags` toglie i **tag** non ammessi
ma non tocca gli **attributi**: un `<a href="javascript:…">` o un `<p onmouseover="…">`
passano. È il buco che il manuale racconta nel CAP 11 §4. Runtime lo ha chiuso con
`sanitize_html.php` (DOMDocument), il Festival è nato con `safe_html()` (DOMDocument, allowlist
di tag **e** attributi, guardia sugli schemi degli URL). Nel sito nuovo c'è **un solo percorso
di render** e la funzione del Festival si copia tale e quale: il buco si chiude per costruzione.
Se la migrazione dovesse slittare di mesi, questa è l'unica cosa che vale la pena fare sul
codice attuale prima.

---

## Parte 2 — L'inventario di quello che c'è (misurato il 07/09/2026, v1.27.0)

### Il lato React (`src/`): 12.296 righe TS/TSX in 45 file

**Rotte pubbliche** (`App.tsx`):

| Rotta | Componente | Note |
|---|---|---|
| `/` | Hero + FeaturedCard + PortfolioGrid + ArticleArchive + CommunityHub + NewsletterSignup | home |
| `/tutti-i-progetti` | `AllProjects` | griglia progetti con filtri |
| `/contatti` | `ContactPage` | modulo → `messages.php` |
| `/newsletter/confermato`, `/newsletter/disiscritto` | due pagine statiche | esito del double opt-in |
| `/tag/:tagSlug` | `TagArchiveWrapper` | dalla v1.26.0 |
| `/:categorySlug` | `DynamicArchiveWrapper` | categorie gerarchiche da DB, paginazione |
| `/:categorySlug/:projectSlug` | `SingleArticle` | TOC, ShareModal, LetterModal, ReactionBar, DOMPurify |
| `*` | 404 in linea | |

**Pannello** (`/admin`, 15 pagine in `src/pages/admin/`): Login, RecoveryRequest,
ResetPassword, Dashboard (analytics con Chart.js), Settings, ArticlesList (azioni in blocco,
duplica), ArticleEditor (715 righe: bozza locale, blocco navigazione, avviso redirect, CTA,
grafico visite), ProjectsList, ProjectEditor, MediaGallery, CategoryManager (gerarchia),
TagsList (rinomina/unisci, conteggi), NewsletterAdmin, MessagesList. Più i componenti admin:
RichTextEditor (Tiptap, 521 righe), InternalLinkSelector, MediaSelectorModal, TagPicker,
SeoScorePanel, NavigationBlocker.

**Componenti pubblici che sono JavaScript vero** e vanno riscritti in vanilla, non in PHP:
`ParticleBackground` (canvas: è già JS puro dentro un componente), `SearchModal` (Ctrl+K, chiama
`search.php`), `ReactionBar` (toggle con optimistic update, `reactions.php`), `NewsletterSignup`
(`subscribers.php`), `ShareModal` e `LetterModal`, `TableOfContents` (scrollspy),
`ScrollProgress`, `BackToTop`.

**Dipendenze che spariscono:** react, react-dom, react-router-dom 7 (loaders in
`loaders.ts`), framer-motion, react-helmet-async, dompurify, i 12 pacchetti Tiptap,
react-chartjs-2 (Chart.js può restare, self-hosted), tailwindcss 4 (vedi la decisione in
Parte 4).

### Il lato PHP (`public/`): 4.467 righe in 27 file — **si tiene quasi tutto**

`auth.php` (login, recovery, reset), `articles.php` (565 righe: CRUD, duplica, azioni in
blocco, slug con normalizzazione e unicità lato server, `focus_keyword`), `projects.php`,
`categories.php`, `tags.php`, `media.php`, `upload.php` (WebP), `messages.php`,
`subscribers.php` + `newsletter_send.php`, `reactions.php`, `analytics.php`, `search.php`,
`rss.php`, `backup.php`, `db_maintenance.php` (registro `schema_version`), `settings.php`,
`stats.php`, `navigation.php`, `download.php`, `optimize_db.php`, `robots.php`, `sitemap.php`,
`auth_helper.php`, `db.php`, `config.php`.

`index.php` (814 righe) è il pezzo più interessante: per i crawler scrive **già** nel `<body>`
l'HTML di articolo (con breadcrumb e JSON-LD `Article`), categoria, tag, progetti, contatti e
home. **Il sito nuovo parte da lì**: quel ramo diventa la pagina per tutti, non solo per i bot.

**Database MySQL, invariato:** `articles`, `projects`, `categories`, `tags` (+ la tabella di
collegamento), `subscribers`, `messages`, `article_reactions`, le tabelle di `analytics.php`,
`app_settings`, `schema_version`. **Zero migrazione dati.**

**URL pubblici da conservare identici** (la lezione di Keyla: `KEYLADAMAER.COM/DECISIONE-01-stack.md`):
tutte le rotte della tabella sopra, più i due `RedirectMatch` in `.htaccess`
(`/software` → `/progetti-software`, `/libri` → `/narrativa-e-pubblicazioni`), `robots.txt` e
`sitemap.xml` già in PHP.

### L'identità visiva attuale (da cui partono le proposte)

`src/index.css`, blocco `@theme`: font **DM Sans** (testo), **DM Serif Display** (titoli),
**Courier Prime** (mono), caricati da Google Fonts (`index.html`: **non** self-hosted, da
sistemare per il GDPR come fa il Festival). Palette «v3»: fondo `#05080a`, superficie
`#0c1410`, testo `#d4e8d8`, secondario `#6a9070`, terziario `#1a2e20`, accento
**verde `#22c55e`** (`dis-green`, ereditato da DISINTELLIGENZA). Particelle animate sul
canvas in home, transizioni fade/slide fra le pagine con framer-motion, ricerca Ctrl+K.

---

## Parte 3 — Il lavoro, in ordine

### Sessione 0 — le proposte di design (**prima di qualunque codice**)

Simone vuole **due o tre proposte di design nuovo**, mostrate **visivamente**, e sceglie lui
prima che si tocchi il sito. Quindi:

1. Leggi questo documento e `docs/25-04-2026-roadmap.md` per capire che cosa il sito è e
   che cosa deve continuare a fare. Guarda com'è oggi (screenshot delle pagine principali:
   home, un archivio di categoria, un articolo, i progetti).
2. Prepara **tre direzioni**, ciascuna come pagina HTML statica **autonoma** (un file, CSS
   dentro, font self-hosted o con fallback, dati finti ma verosimili: titoli veri degli articoli
   presi da `articles.php`), con **home, archivio di categoria e articolo singolo** — le tre
   pagine che fanno il sito. Mettile in `docs/design/2026-09-proposte/` (una cartella per
   direzione) e, se la sessione lo permette, pubblicale anche come artifact o canvas di
   Claude Design, così Simone le apre da qualunque dispositivo. Ogni proposta ha un paragrafo
   che dice **che cosa cambia e perché**, non una descrizione di che cosa si vede.
3. Le tre direzioni non le decido io oggi, ma perché siano davvero diverse e non tre versioni
   dello stesso sito, ecco tre assi su cui si può ragionare:
   - **Continuità evoluta**: la palette verde-su-nero resta, si irrigidisce la griglia,
     si alza la tipografia (il serif dei titoli più grande, il mono per le etichette), le
     particelle diventano un dettaglio e non un tappeto. Chi conosce il sito lo riconosce.
   - **Carta e inchiostro**: tema **chiaro**, serif in lettura, margini larghi, il portfolio
     come un libro d'autore. È la direzione più lontana dall'attuale e la più adatta a un
     sito che vive di articoli lunghi e narrativa.
   - **Rivista a filo**: griglia a 1px, mono come voce di sistema, due soli accenti, molto
     bianco su nero o nero su bianco a scelta, il contenuto come oggetto editoriale. È
     l'evoluzione che Runtime ha messo in attesa per la propria v3 (`SitoRuntime/docs/planning/mockup-v3-home.html`): guardalo, per **non** fare la stessa cosa.
   Ogni direzione deve rispondere a quattro cose con un'immagine: com'è la home, com'è un
   articolo lungo con TOC, come si vede un progetto con i due CTA, e com'è su un telefono.
4. **Fermati.** La sessione finisce con le tre proposte consegnate e una domanda a Simone.
   Non si scrive PHP finché non ha scelto.

### Sessione 1 — progettazione tecnica

Con la direzione scelta: `docs/design/…/DECISIONI.md` che fissa (a) **Tailwind come compilatore
sui `.php`** oppure **token CSS senza framework** (vedi Parte 4); (b) la struttura delle
cartelle sul modello del Festival (`index.php` front controller, `lib/`, `partials/`,
`pages/`, `assets/`, `admin/`, `api/`); (c) quali endpoint JSON restano per il JavaScript
pubblico; (d) la mappa **rotta → pagina PHP** che sostituisce `App.tsx` + il ramo crawler di
`index.php`; (e) il piano di deploy senza build (o con la sola build CSS).

### Sessioni 2-3 — il sito pubblico

Le pagine in PHP partendo dall'HTML che `index.php` già scrive per i crawler; i partial
(head con meta e JSON-LD, nav, footer, form newsletter); i 5-6 moduli JavaScript vanilla
(particelle, ricerca, reazioni, newsletter, modali, scrollspy); le transizioni con **View
Transitions native** e `animation-timeline: view()` come nel Festival (`main.css`), al posto
di framer-motion. **`safe_html()` copiata dal Festival**, e la CSP col nonce.

### Sessioni 4-6 — il pannello

Server-rendered, sul modello di `FDCA-PHP/public/admin/`: il Festival ha già login, news,
media (con picker), newsletter, messaggi, utenti, impostazioni, sistema, profilo. **Specifici
di questo sito e da scrivere**: progetti, categorie gerarchiche, tag (rinomina/unisci),
elenco articoli con azioni in blocco e duplica, cruscotto analytics (Chart.js self-hosted,
un file). **L'editor è `FDCA-PHP/public/assets/js/editor.js`**, copiato e adattato: allowlist
gemella di `safe_html()`, markdown all'incolla, pulizia di Word e Google Docs, video YouTube,
bozza locale; a questo sito serviranno in più il selettore dei link interni
(`InternalLinkSelector`) e le tabelle **solo se** Simone le usa davvero (verifica sugli
articoli in database prima di portarle). Il verificatore è `seo-check.js` del Festival con
in più il controllo sui tag. La scheda articolo a **una colonna**: dati (titolo, slug, riassunto,
riquadro «Come esce su Google» con parola chiave, copertina dai media, categoria, tag, stato,
data, vetrina, i due CTA), poi l'editor, poi il verificatore, in fondo il grafico visite. E
`seo_title` / `seo_description` su `articles` (migrazione additiva nel registro
`schema_version`), lette da `index.php` con ripiego su titolo ed excerpt.

### Sessione 7 — collaudo e deploy

Prove PHP senza Node sul modello di `FDCA-PHP/docs/collaudo/` (le funzioni pure, `safe_html()`,
le rotte con `curl` contro il server di sviluppo); confronto **URL per URL** con la sitemap
attuale (ogni indirizzo di oggi deve rispondere 200 domani, stesso `<title>` e stessa
`description` salvo miglioramenti voluti); deploy via SFTP con backup dei file sovrascritti,
come fa il Festival; un giro in Search Console la settimana dopo.

**Stima complessiva: 6-10 sessioni**, senza migrazione dati e senza cambio di hosting.

---

## Parte 4 — Le decisioni aperte che spettano a Simone

1. **La direzione di design** (Sessione 0).
2. **Tailwind o token CSS.** Runtime Magazine ha scelto Tailwind come compilatore sui `.php`
   (`rruntime-magazine/concept/RECUPERO_02_REALTA_TECNICA.md`); il Festival ha scelto i token
   CSS senza framework. La proposta è **token**: questo sito ha una palette sua, e Tailwind
   sarebbe l'ultimo `npm` rimasto in un sito che non ne ha più bisogno. Ma dipende dalla
   direzione scelta: se la proposta vincente è costruita con utility, si tiene Tailwind.
3. **Tabelle nell'editor**: sì o no (vedi Sessione 4-6).
4. **Font self-hosted**: oggi da Google Fonts; nel sito nuovo si portano in casa come fa il
   Festival (GDPR), a meno che Simone non voglia cambiare font con il design.

---

## Parte 5 — Che cosa NON fare

- **Non fare la Fase B in React** (una colonna, campi Google, markdown in Tiptap): Simone l'ha
  esclusa il 7 settembre, si butterebbe tutto.
- **Non cambiare nessun URL**, né gli slug, né la struttura `/{categoria}/{slug}`.
- **Non toccare il database** se non per aggiungere `seo_title` e `seo_description`.
- **Non far dipendere il sito nuovo da un CDN** (font, script, CSS): tutto in casa.
- **Non scrivere codice prima che Simone abbia scelto il design.**

---

## Riferimenti

- L'analisi dei tre siti, con la Parte 3 dedicata a questa migrazione:
  `MODELLO-UNIVERSALE-miniCMS/_ricognizioni/2026-09-07-omologazione-editor-tre-siti.md`
- Il sito modello per lo stack senza React: `FDCA-PHP` (README, `public/`, `docs/collaudo/`)
- L'editor e il verificatore da riusare: `FDCA-PHP/public/assets/js/editor.js`,
  `FDCA-PHP/public/assets/js/seo-check.js`, `FDCA-PHP/docs/CHANGELOG-v1.14.0.md`
- Il manuale rimappato senza React: `rruntime-magazine/concept/RECUPERO_02_REALTA_TECNICA.md`
- La consegna gemella su Runtime: `SitoRuntime/docs/planning/2026-09-07-consegna-omologazione-e-slug.md`

# Tre direzioni di design per il sito nuovo — settembre 2026

Sessione 0 della migrazione a PHP puro descritta in
[`docs/2026-09-07-consegna-migrazione-php-puro.md`](../../2026-09-07-consegna-migrazione-php-puro.md).
**Qui non c'è codice del sito nuovo: ci sono tre proposte da guardare e una scelta da fare.**

## Come si guardano

Ogni direzione è un file HTML unico, che si apre con un doppio clic e funziona anche
senza rete (le copertine sono incorporate nel file). Ogni file mostra, in fila:

1. il ragionamento della direzione, con palette e caratteri;
2. la **home** a 1280 px;
3. l'**archivio di categoria** (`/progetti-software`);
4. l'**articolo lungo con sommario** (il devlog di FDCA, 14 minuti);
5. il **telefono**, due schermi a 390 px.

I contenuti sono veri: titoli, riassunti, date, tag e copertine sono quelli in
produzione al 7 settembre 2026, presi da `api/articles.php` e `api/projects.php`.

| | File | Link da qualunque dispositivo |
|---|---|---|
| **D — Officina Notturna** ✅ **scelta** | [`D-officina-notturna.html`](D-officina-notturna.html) | https://claude.ai/code/artifact/11c00fd4-7929-4b3f-b8f3-cb7d60efd6cd |
| A — Segnale | [`A-segnale.html`](A-segnale.html) | https://claude.ai/code/artifact/11af703d-c85b-4cf3-8267-590a61595a3a |
| B — Quaderno | [`B-quaderno.html`](B-quaderno.html) | https://claude.ai/code/artifact/546b2d2e-bef5-4b2c-847c-78db737bfb58 |
| C — Officina | [`C-officina.html`](C-officina.html) | https://claude.ai/code/artifact/5f2d0ce0-eebc-4634-83df-8c2839568626 |

## La scelta, 7 settembre 2026

Simone ha scelto **l'impianto di C con i colori di A**: officina, ma dark mode, con il
verde come colore di riferimento. Da qui nasce **D — Officina Notturna**, che è la
direzione da cui parte la Sessione 1. A, B e C restano nella cartella come storia della
decisione: non si toccano più.

Che cosa tiene D da ciascuna:

- **Da Officina (C)** — il campo pieno in apertura col titolo dentro, la grottesca stretta
  e pesante a misure grosse, le righe piene al posto delle card, le immagini spente che si
  accendono al passaggio, il sommario numerato in colonna, e l'etichetta di **stato** su
  ogni cosa (in corso, open source, pubblicato, archiviato).
- **Da Segnale (A)** — tutta la palette: `#04070a` di fondo, filetti `#16241c`,
  grigio-verde `#7d9b84`, testo `#dce8de`, e il verde `#22c55e` solo dove c'è qualcosa di
  attivo.
- **Un cambio rispetto a C** — il corpo non è più Public Sans ma **DM Sans**, quello che il
  sito usa già, e le etichette tornano a **Courier Prime**. Così la sola famiglia nuova da
  portare in casa è Bricolage Grotesque.

**Una cosa resta da decidere, ed è dentro il file D:** in Officina il campo pieno
dell'apertura era giallo; qui è il verde del sito, ed è l'unico punto in cui la direzione
alza la voce. Il file mostra **la stessa apertura in due versioni**, campo verde e campo
nero, una sotto l'altra. Tutto il resto della pagina non cambia fra le due.

## Che cosa propone ognuna, in breve

**A — Segnale.** Continuità evoluta. Il verde su nero resta, ma smette di essere
atmosfera: compare solo dove c'è qualcosa di attivo (la voce di menu corrente, il link
nel testo, il pulsante, il punto della lettura). Spariscono ombre, card e comparse allo
scorrimento; al loro posto una gabbia a filetti da 1px e la **data come prima colonna**
di ogni elenco. Il corpo degli articoli passa a una serif da lettura. Chi conosce il
sito lo riconosce al primo sguardo.
*Palette:* `#04070a` `#080e0d` `#16241c` `#7d9b84` `#dce8de` `#22c55e`.
*Caratteri:* DM Serif Display, DM Sans, **Source Serif 4** (nuovo), Courier Prime.

**B — Quaderno.** Carta e inchiostro. Fondo chiaro, una colonna di lettura sola,
immagini in bianco e nero tranne quella che conta. L'archivio non è una griglia di
riquadri ma un **indice** — titolo a sinistra, data a destra, i puntini in mezzo — e
nell'articolo sommario e note stanno **a margine**, dove stanno in un libro. È la
direzione più lontana da com'è il sito oggi: chi arriva non pensa più «ecco lo
sviluppatore», pensa «ecco l'autore».
*Palette:* `#e9eae2` `#f4f4ee` `#cdd0c3` `#767c6c` `#191d14` `#1f6b3f`.
*Caratteri:* Fraunces, Newsreader, IBM Plex Mono. Nessuna grottesca.

**C — Officina.** Il sito come banco di lavoro. Fondo cemento, nero pieno, e il giallo
di segnalazione usato come **campo intero**: l'apertura è un blocco giallo con il titolo
dentro. Tipografia grottesca stretta e pesante, niente serif. Ogni scheda porta scritto
**in che stato si trova**: pubblicato, in corso, open source, archiviato.
*Palette:* `#e4e4e0` `#fafaf8` `#c8c8c2` `#6c6c66` `#101012` `#ffd400`.
*Caratteri:* Bricolage Grotesque, Public Sans.

## Due scelte fatte, che vanno dette

**La terza direzione non è quella suggerita dalla consegna.** Il documento proponeva una
«rivista a filo»: griglia a 1px, mono come voce di sistema, due accenti, molto contrasto.
È esattamente quello che Runtime Radio ha messo in cantiere per la propria v3
(`SitoRuntime/docs/planning/mockup-v3-home.html`: ardesia `#0c0e12`, verde acqua `#3ec9a0`,
mono, filetti da 1px). Due siti tuoi che escono nello stesso anno non devono somigliarsi,
quindi la terza è diventata «Officina», che va nella direzione opposta: chiara, rumorosa,
gialla. Se la «rivista a filo» ti interessa lo stesso, si fa — ma allora conviene decidere
prima quale dei due siti se la tiene.

**Le etichette di stato di C non sono un vezzo grafico.** Sono l'unica cosa che il sito di
oggi non dice da nessuna parte e che invece racconta come lavori: TelegramBot venduto zero
copie e poi aperto, FeedDownloader uscito dal mercato, Sbargold archiviato, il Relitto
ancora in corso. Se scegli A o B, quel dato vale la pena tenerlo comunque: è una colonna
nuova su `articles` o su `projects`, non un impianto grafico.

## Che cosa resta aperto per la Sessione 1

1. **Apertura a campo verde o a campo nero** (le due varianti nel file D).
2. **Tailwind o token CSS.** D è scritta a token, senza framework: la proposta è quella, e
   npm esce del tutto dal sito. Va messo per iscritto in `DECISIONI.md`.
3. **Font in casa.** In D i caratteri arrivano ancora da Google Fonts. Nel sito nuovo vanno
   portati in casa come nel Festival (GDPR): serve solo Bricolage Grotesque, perché DM Sans
   e Courier Prime ci sono già.
4. **Le etichette di stato vogliono un dato vero.** Oggi nel database non esiste: serve una
   colonna su `projects` (e forse su `articles`), aggiunta con una `ensure*` in
   `db_maintenance.php`, non con uno script caricato sul server.

## Come sono fatti questi file

I sorgenti stanno in [`_sorgenti/`](_sorgenti/) con i segnaposto `{{img:chiave}}` al posto
delle copertine. Per rigenerare i tre file dopo una modifica:

```bash
node docs/design/2026-09-proposte/_sorgenti/build.cjs
```

`_sorgenti/covers.json` contiene le dodici copertine ridimensionate a 880 e 440 px e
codificate in base64 (484 KB in tutto). Sono state prese dal sito in produzione con
`scratch/design/fetch-covers.cjs`.

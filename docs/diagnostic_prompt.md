# PROMPT DIAGNOSTICO PER LA PROSSIMA SESSIONE
## Progetto: SimonePizziWebSite
## Stato Versione: v1.10.3

### Problema:
Le sottocategorie gerarchiche sono state implementate nel backend (MySQL + API PHP) e nell'admin (CategoryManager + Editor), ma **non appaiono come menu a tendina (dropdown)** nell'Header del sito pubblico, nonostante il codice del componente `Header.tsx` sia predisposto per farlo.

### Contesto Tecnico:
1.  **Backend:** `navigation.php` è stato aggiornato per costruire l'albero gerarchico lato PHP. Una chiamata diretta all'endpoint restituisce la struttura delle categorie madri, ma inizialmente le `subcategories` risultavano vuote.
2.  **Database:** La connessione è OK. Le sottocategorie esistono (viste nell'admin) e hanno articoli assegnati.
3.  **Frontend:** `Header.tsx` usa l'hook `useCategories` che consuma `api.getNavigation()`. La visualizzazione desktop usa `group-hover` su un container `relative` per mostrare un div `absolute`.
4.  **Prerendering:** È attivo un sistema di prerendering statico. Lo script `prerender.php` rileva correttamente le rotte delle sottocategorie (es. `/runtime-telegrambot-titan-edition/...`), confermando che il sistema "vede" i contenuti associati.

### Ipotesi da Indagare:
- **Mismatch di Idratazione:** Il prerendering potrebbe generare un HTML "piatto" (senza sottocategorie) se l'API non risponde velocemente durante la generazione, e React potrebbe non aggiornare correttamente il menu dopo l'idratazione.
- **CSS Hover Gap:** Potrebbe esserci un piccolo spazio (gap) fisico tra la voce di menu e il dropdown che causa la perdita dell'evento `hover`.
- **Z-Index/Overflow:** Un possibile conflitto di stacking context nell'Header che rende invisibile o taglia il dropdown.
- **Data Structure:** Verificare se `useCategories` riceve l'oggetto `subcategories` come array di oggetti o se ci sono problemi di serializzazione JSON (es. stringhe vs numeri per gli ID).

### File Chiave da Analizzare:
- `src/components/Header.tsx` (Logica dropdown e CSS hover)
- `public/api/navigation.php` (Costruzione dell'albero JSON)
- `src/hooks/useCategories.ts` (Fetch dei dati di navigazione)
- `public/api/test_db.php` (Già presente sul server per test rapidi)

### Obiettivo:
Assicurarsi che quando l'utente passa il mouse su una categoria madre (es. "Software"), appaia l'elenco delle sottocategorie assegnate.

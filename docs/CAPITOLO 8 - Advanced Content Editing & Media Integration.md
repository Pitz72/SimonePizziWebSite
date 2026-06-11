# Capitolo 8: Advanced Content Editing & Media Integration

## 8.1 Evoluzione dell'Editor: Migrazione a Tiptap v2
Il passaggio da editor basati su `contenteditable` grezzo o librerie legacy (come Quill) a **Tiptap v2** è stato dettato dalla necessità di un controllo granulare sul DOM e di una sanificazione nativa del contenuto.

### Perché Tiptap?
- **Headless UI**: Permette di costruire la toolbar con componenti React/Tailwind custom, garantendo coerenza estetica con il resto dell'admin.
- **Schema-based**: Ogni elemento (paragrafo, immagine, tabella) segue uno schema rigido, impedendo l'iniezione di HTML non autorizzato.
- **Performance**: Grazie al code-splitting, l'editor viene caricato solo quando necessario, riducendo il bundle iniziale di oltre 150KB.

### Integrazione YouTube & Tabelle
L'editor supporta ora l'incorporamento dinamico di video YouTube e la gestione di tabelle responsive.

```typescript
// Esempio di configurazione estensioni in RichTextEditor.tsx
import { Table } from '@tiptap/extension-table';
import { Youtube } from '@tiptap/extension-youtube';

const extensions = [
  StarterKit,
  Table.configure({
    resizable: true,
    HTMLAttributes: { class: 'w-full border-collapse my-4' },
  }),
  Youtube.configure({
    nocookie: true,
    HTMLAttributes: { class: 'w-full aspect-video rounded-xl my-4 shadow-lg' },
  }),
  // ... altre estensioni
];
```

## 8.2 Real-time SEO Analysis: SeoScorePanel.tsx
Per migliorare la qualità dei contenuti prima della pubblicazione, è stato introdotto il componente `SeoScorePanel.tsx`. Questo effettua un'analisi euristica lato client senza chiamate API, fornendo feedback immediato.

### Logica di Analisi
Il componente valuta 7 parametri chiave:
1. **Titolo**: Lunghezza ottimale (30-65 car).
2. **Meta Description**: Presenza e lunghezza (80-165 car).
3. **Copertina**: Presenza dell'immagine per Open Graph.
4. **Tagging**: Numero di tag (2-8 consigliati).
5. **Word Count**: Minimo 300 parole per un buon posizionamento.
6. **Heading Structure**: Presenza di H2/H3 per la leggibilità.
7. **Keyword Consistency**: Presenza del primo tag nel titolo o nell'excerpt.

```typescript
// Snippet della logica di calcolo score
function computeChecks(title, excerpt, content, tags) {
    let score = 0;
    // ... logic ...
    const wordCount = countWords(content);
    if (wordCount >= 300) score += 1;
    else if (wordCount >= 100) score += 0.5;
    
    return Math.round((score / maxScore) * 100);
}
```

## 8.3 Gestione Paste & Sanificazione
Tiptap gestisce automaticamente il filtraggio dell'HTML durante l'incollaggio (paste handling). Questo evita che stili inline sporchi provenienti da Word o Google Docs rompano il layout del sito.

- **Unset All Marks**: Un pulsante dedicato permette di pulire istantaneamente qualsiasi formattazione residua.
- **Auto-link**: I link incollati vengono riconosciuti e convertiti automaticamente in tag `<a>` sicuri.

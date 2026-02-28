# Indice Strutturale del Progetto (Structure Index)

Questo documento traccia l'architettura macroscopica e la logica delle cartelle del progetto "Simone Pizzi - Portfolio Creativo". Server come bussola per LLM, developer e architetti di sistema affinché i file non vengano più generati o abbandonati in posizioni accidentali (root pollution).

## Struttura della Root `.`

*   **`/src/`**: IL CUORE DEL PROGETTO FREONTED. Niente codice logico deve mai esistere fuori da questa directory.
    *   `/src/components/`: Tutti i componenti visuali e modali di React.
    *   `/src/data/`: `portfolioData.ts` (il Motore Dati della pagina).
    *   `/src/utils/`: Hooks e funzioni agnostiche.
    *   `src/types.ts`: Definizioni delle interface TypeScript del PortfolioItem.
*   **`/docs/`**: IL CUORE DELLA DOCUMENTAZIONE. Qualsiasi file markdown, piano testuale e archivio di sistema risiede qui.
    *   `README.md`: Il Master Index della documentazione.
    *   `project_status.md`: Lo snapshot architetturale più recente.
    *   `structure_index.md`: Questo file.
    *   `/docs/changelogs/`: Storico lineare delle versioni testuali del progetto.
*   **`/public/`**: ASSET STATICI. Immagini scalate, favicon e PDF non manipolati dalla build.
    *   `/public/images/`: Tutte le copertine dei progetti e artwork (webp, png, jpg ottimizzati).
*   **`/scripts/`**: CASSETTA DEGLI ATTREZZI. Utility esterne al compilatore.
    *   `optimize_image.ps1`: Script PowerShell per ottimizzazione immagini bulk.
*   **File Config in Root**:
    *   `package.json`, `vite.config.ts`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`.

---
> **Regola d'Oro per gli Agenti Autonomi**:  Non iniettare cartelle come `components` o file come `types.ts` nella root del progetto. Seguire l'architettura `src/`. Non abbandonare immagini pesanti in root come storage temporaneo. Usare `/public` o non esportare affatto.

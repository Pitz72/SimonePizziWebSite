# Simone Pizzi - Portfolio Creativo

![Version](https://img.shields.io/badge/version-1.11.1-green.svg)
![React](https://img.shields.io/badge/react-v19.2.4-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-v5.2.2-blue.svg)
![Vite](https://img.shields.io/badge/vite-v7.3.1-646cff.svg)
![Tailwind](https://img.shields.io/badge/tailwindcss-v4.2.1-38bdf8.svg)

Una Single Page Application (SPA) moderna con Mini-CMS integrato, sviluppata con **React 19** e **Tailwind CSS v4**, con backend **PHP/MySQL**. Il sito funge da portfolio e hub personale, con un'architettura ibrida frontend/backend ottimizzata per SEO e performance estreme.

Per la documentazione completa: **[Master Index della Documentazione](docs/README.md)**.

---

## Tecnologie Utilizzate

**Frontend:**
- **React 19.2.4** + TypeScript 5.2.2
- **Vite 7.3.1** (build tool con HMR istantaneo)
- **Tailwind CSS v4.2.1** (framework utility-first di nuova generazione)
- **React Router v7.13.1** (gestione rotte con Data Loaders e Prerendering)
- **Framer Motion 12** (transizioni fluide tra le pagine e micro-interazioni)
- **Chart.js** (visualizzazione dati e analytics nel pannello admin)
- **Tiptap Editor** (editor WYSIWYG professionale personalizzato)

**Backend:**
- **PHP 8.x** con layer REST API in `/public/api/`
- **MySQL** su host dedicato per alta disponibilità
- **SEO server-side:** `public/index.php` gestisce meta tag OpenGraph e TwitterCard dinamici
- **Prerendering Statico:** Generazione automatica di HTML statico per i crawler motori di ricerca

---

## Struttura del Progetto

```
.
├── src/                      # Codice sorgente React (frontend)
│   ├── components/           # Componenti UI e logici
│   ├── pages/admin/          # Moduli del Pannello CMS
│   ├── loaders.ts            # Caricamento dati via React Router 7
│   ├── api.ts                # Client API centralizzato
│   └── App.tsx               # Entry point e Layout pubblici
├── public/                   # Asset statici + backend PHP
│   ├── api/                  # Endpoints REST PHP
│   ├── index.php             # SEO Router & Dispatcher
│   └── .htaccess             # Direttive Apache per SPA
├── docs/                     # Documentazione tecnica e Master Plan
│   ├── changelogs/           # Storico versioni (fino a v1.11.1)
│   └── archive/              # Versioni archiviate della documentazione
├── scripts/                  # Script Node/PowerShell di manutenzione
└── dist/                     # Bundle di produzione ottimizzato
```

---

## Funzionalità Principali

**Esperienza Utente:**
- **Transizioni Fluide:** Navigazione tra le sezioni con effetti fade-in/slide-up morbidi.
- **Ricerca Globale (Ctrl+K):** Modal di ricerca istantanea in tutto l'archivio.
- **Filtri Avanzati:** Navigazione gerarchica con supporto a Categorie e Sottocategorie.
- **SEO Ready:** Prerendering statico e meta tag dinamici per ogni articolo/progetto.

**Mini-CMS Admin:**
- **Local Draft Recovery:** Salvataggio automatico locale (localStorage) per prevenire la perdita di dati negli editor.
- **Analytics Visuali:** Dashboard interattiva per il monitoraggio di visualizzazioni e click CTA.
- **Gestione Newsletter:** Sistema integrato per l'invio massivo e la gestione iscritti.
- **Media Gallery:** Upload drag&drop con ottimizzazione automatica WebP.
- **Scheduling:** Possibilità di programmare la data di pubblicazione dei contenuti.

---

## Sviluppo Locale

### Installazione
```bash
git clone <repository-url>
npm install
```

### Avvio
```bash
# Avvia il server di sviluppo Vite
npm run dev
```
*Nota: Il backend PHP deve essere configurato parallelamente (es. tramite Apache/MAMP) per puntare alla cartella `/public/api/`.*

### Build
```bash
npm run build
```

---
*Progetto curato da Simone Pizzi. v1.11.1 - Chiusura Fase Sviluppo 2026*

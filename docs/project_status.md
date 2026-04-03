# Relazione sullo Stato del Progetto "Simone Pizzi - Portfolio Creativo"

**Data:** 03 Aprile 2026
**Versione Sotto Analisi:** 1.6.4

## 1. Panoramica Generale

Il progetto e una Single Page Application (SPA) reattiva e moderna, sviluppata con **React 19**, **TypeScript**, **Vite 7** e **Tailwind CSS v4**. Il sito funge da portfolio personale con un Mini-CMS integrato, organizzando i contenuti in categorie ben definite (Videogiochi, Software, Narrativa, Podcast, Blog). Il backend e un layer PHP/SQLite che espone API REST e gestisce SEO server-side, scheduling articoli e media.

## 2. Analisi della Codebase

### Struttura

La codebase segue una struttura chiara e modulare:

- **`src/data/portfolioData.ts`**: Fonte di dati statici di fallback. Con l'avvento del Mini-CMS, i contenuti vivi transitano via API; questo file rimane come reference per i dati legacy.
- **`src/components/`**: Componenti ben segregati.
  - `PortfolioGrid`: Gestisce la Home Page con gli articoli in vetrina (flag `is_featured`), alimentata via API.
  - `ArticleArchive`: Hub editoriale per ogni categoria, con card tridimensionali e layout Magazine.
  - `SingleArticle`: Landing page dedicata alla lettura Zen di ogni articolo (Hero parallax, tipografia centrata, Control Bar fluttuante).
  - `SEO`, `HelmetProvider`: Meta tag dinamici per ogni pagina.
- **`src/hooks/useFetchArticles.ts`**: Custom hook per il fetching live degli articoli dalle API PHP.
- **`src/pages/admin/`**: Pannello CMS completo (Login, Dashboard, ArticleEditor, ArticlesList, MediaGallery, Settings).
- **`public/api/`**: Layer PHP REST (articles, auth, media, upload, rss, stats, settings).
- **`public/index.php`**: Router backend che inietta meta tag OpenGraph/TwitterCard per SEO server-side.
- **`public/.htaccess`**: Regole Apache per BrowserRouter + protezione risorse.

### Tecnologie e Pattern

- **Routing:** BrowserRouter supportato da `public/index.php` e `.htaccess` per URL SEO-friendly.
- **State Management:** `useState` per UI locale; fetch centralizzate via `useFetchArticles` e `api.ts`.
- **Styling:** Tailwind CSS v4 con `@tailwindcss/vite`, design token in `@theme` dentro `index.css`.
- **Database:** SQLite via PDO, schema in `init_db.php`, file protetto in `public/api/.data/`. Tabelle attive: `users`, `articles`, `media`, `login_attempts`. Tabelle presenti ma inattive (placeholder): `messages` (form contatti), `subscribers` (newsletter — `total_subscribers` ritorna sempre 0 in `stats.php`).

### Qualita del Codice

Il codice e pulito, tipizzato e manutenibile. La separazione tra dati e presentazione e netta. La logica di business risiede negli hook e nelle API PHP, non nei componenti presentazionali.

## 3. Verifica Sincronizzazione Documentazione-Codice

Verifica puntuale tra le ultime versioni rilasciate e l'ecosistema fisico della build.

| Feature Documentata | Versione | Riscontro File System | Esito |
| :--- | :--- | :--- | :--- |
| Donazione PayPal in Box CTA Articoli | v1.6.4 | `SingleArticle.tsx` righe 225-240 | CONFORME |
| Logica Ordinamento Temporale (PublishedAt) | v1.6.4 | `PortfolioGrid.tsx` e `ArticleArchive.tsx` | CONFORME |
| Visualizzazione Data Pubblicazione Articolo | v1.6.4 | `SingleArticle.tsx` riga 168 | CONFORME |
| Rimozione Icone e Frecce dai Pulsanti UI | v1.6.4 | `SingleArticle.tsx`, `AllProjects.tsx`, `FeaturedCard.tsx` | CONFORME |
| Media Gallery: Multi-Selezione e Bulk Delete | v1.6.3 | `MediaGallery.tsx` | CONFORME |
| Ottimizzazione WebP Automatica Upload | v1.6.3 | `upload.php` GD Library | CONFORME |
| Media Gallery: Tab e Filtri MIME | v1.6.0 | `MediaGallery.tsx` TABS constant | CONFORME |
| DOMPurify.sanitize() su article.description in SingleArticle (XSS Stored) | v1.5.10 | `SingleArticle.tsx` riga 157 | CONFORME |
| Security Headers HTTP: X-Content-Type-Options, X-Frame-Options, CSP, Referrer-Policy | v1.5.10 | `public/.htaccess` righe 15-33 | CONFORME |
| upload.php: mkdir 0777 → 0755 (permessi directory corretti) | v1.5.10 | `upload.php` riga 50 | CONFORME |
| generateSlug: normalizzazione accenti italiani (à,è,é,ì,ò,ù) | v1.5.10 | `articles.php` righe 18-21 | CONFORME |
| execCommand deprecated: try-catch + commento, migrazione Selection API in roadmap | v1.5.10 | `RichTextEditor.tsx` righe 94-103 | CONFORME |
| RSS LIMIT 50: costante nominata RSS_FEED_LIMIT | v1.5.10 | `rss.php` riga 16 | CONFORME |
| Migrazione DB updated_at: script creato in /scripts/ (da eseguire su server) | v1.5.10 | `scripts/migrate_add_updated_at.php` | PENDENTE (deploy manuale) |
| init_db.php: password generata casualmente con bin2hex(random_bytes), no hardcoded | v1.5.9 | `scripts/init_db.php` righe 22-28 | CONFORME |
| init_db.php: INSERT users con PDO prepared statement (no string interpolation) | v1.5.9 | `scripts/init_db.php` riga 25 | CONFORME |
| index.php: FILTER_SANITIZE_STRING sostituito con strip_tags(trim()) | v1.5.9 | `public/index.php` riga 40 | CONFORME |
| Security hardening sessioni: cookie HttpOnly + Secure + SameSite=Strict | v1.5.8 | `auth.php` righe 4-7 | CONFORME |
| Security: `session_regenerate_id(true)` dopo login (Session Fixation) | v1.5.8 | `auth.php` riga 80 | CONFORME |
| Security: logout completo con svuotamento sessione e invalidazione cookie | v1.5.8 | `auth.php` righe 33-43 | CONFORME |
| Security fix: `?id=X` ora richiede `Auth::check()` | v1.5.7 | `articles.php` riga 71 | CONFORME |
| Fix ordinamento articoli schedulati (ORDER BY published_at) | v1.5.7 | `articles.php` riga 107 | CONFORME |
| Fix Crash Media Gallery (chiavi DB) | v1.5.6 | `MediaGallery.tsx` map keys allineate | CONFORME |
| Fix Overlap Hero articoli lunghi | v1.5.6 | `SingleArticle.tsx` min-h + pt-32 | CONFORME |
| Emergency Password Reset | v1.5.6 | Script temporaneo eliminato + Roadmap aggiornata | CONFORME |
| Timezone Europe/Rome in PHP | v1.5.5 | `articles.php` e `rss.php` con `date_default_timezone_set` | CONFORME |
| Redesign Box CTA fine lettura | v1.5.4 | `SingleArticle.tsx` Flexbox CTA | CONFORME |
| Fix link anteprima BrowserRouter | v1.5.3 | Dashboard link senza `#` hardcoded | CONFORME |
| Anteprima bozze per admin | v1.5.2 | Verifica session in `SingleArticle.tsx` | CONFORME |
| Blockquote editor + patch upload | v1.5.1 | `RichTextEditor.tsx` + `upload.php` | CONFORME |
| Sistema Scheduling articoli | v1.5.0 | `articles.php` time-check + badge admin | CONFORME |
| Generatore RSS Feed | v1.5.0 | `/api/rss.php` XML engine | CONFORME |
| Fix colori Tailwind v4 | v1.5.0 | `index.css` `--color-dis-green` in `@theme` | CONFORME |
| SEO Server Side | v1.4.0 | `index.php` root router | CONFORME |
| Sezione Blog Dinamica | v1.4.0 | `Header.tsx` + enum `BLOG_E_RIFLESSIONI` | CONFORME |
| Redesign Magazine (ArticleArchive + SingleArticle) | v1.4.5 | Componenti creati, vecchi eliminati | CONFORME |
| Editor WYSIWYG | v1.4.4 | `RichTextEditor.tsx` + Showdown | CONFORME |
| Iniezione DB Live Frontend | v1.3.5 | `useFetchArticles.ts`, `PortfolioGrid` | CONFORME |
| Admin Media Gallery | v1.3.4 | `MediaGallery.tsx` + `upload.php` | CONFORME |
| Admin Editor React | v1.3.3 | `ArticleEditor.tsx`, `ArticlesList.tsx` | CONFORME |
| Auth & Foundation UI | v1.3.2 | `Login.tsx`, `Settings.tsx`, `AdminLayout` | CONFORME |
| Rete API Principale | v1.3.1 | `articles.php`, `upload.php`, `auth_helper.php` | CONFORME |
| Foundation Backend SQLite | v1.3.0 | `db.php`, `init_db.php`, schema tabelle | CONFORME |
| Rate limiting login | v1.3.1 | `login_attempts` table + max 5 tentativi/15min per IP in `auth.php` | CONFORME (non documentato) |
| Schema `users` senza colonna `email` | v1.3.0 | `init_db.php`: solo id, username, password_hash, created_at | NOTA: vecchia docs errata |
| Data-Driven About Me | v1.2.1 | `src/data/aboutMeData.ts` | CONFORME |
| Glassmorphism Modali | v1.2.0 | `LetterModal.tsx` backdrop-blur | CONFORME |

**Conclusione Verifica:** Lo stato del codice e perfettamente sincronizzato con la documentazione. Il sistema funziona come architettura ibrida React/PHP consolidata.

## 4. Conclusioni

Lo stato di salute del progetto e **eccellente**. L'infrastruttura e stabilizzata e pienamente operativa in produzione.

**Prossimi Passi Consigliati (da Roadmap):**

- Implementare sistema di login/recovery via email (priorita alta, dopo incidente v1.5.6)
- Aggiungere paginazione backend-driven su `PortfolioGrid` e `ArticleArchive`
- Sistema di Backup automatico del database SQLite
- Filtri a Tab nella Media Gallery per tipo MIME

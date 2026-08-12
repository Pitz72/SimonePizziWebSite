import React, { useMemo } from 'react';
import { CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';

// ─── Tipi ──────────────────────────────────────────────────────────────────────

interface SeoScorePanelProps {
    title: string;
    excerpt: string;
    content: string;
    cover_image: string;
    tags: string[];
    /**
     * [v1.27.0] Parola chiave principale dell'articolo.
     * Prima questo ruolo lo faceva `tags[0]`: il punteggio saliva solo se il primo
     * tag compariva nel titolo o nell'excerpt, e questo spingeva a inventare un tag
     * su misura per ogni articolo (208 tag usati una volta sola). I tag sono una
     * tassonomia condivisa, la parola chiave è un dato del singolo pezzo: separati.
     */
    focusKeyword: string;
}

interface SeoCheck {
    label: string;
    status: 'ok' | 'warn' | 'error';
    message: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const stripHtml = (html: string): string => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const countWords = (text: string): number => {
    const plain = stripHtml(text);
    if (!plain) return 0;
    return plain.split(/\s+/).filter(w => w.length > 0).length;
};

const estimateReadTime = (words: number): number => Math.ceil(words / 200);

// ─── Calcola i check SEO (tutto frontend, nessuna API) ─────────────────────────

/** Confronto insensibile ad accenti e maiuscole: "perché" trova "PERCHE'". */
const norm = (s: string): string =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function computeChecks(
    title: string,
    excerpt: string,
    content: string,
    cover_image: string,
    tags: string[],
    focusKeyword: string
): { checks: SeoCheck[]; score: number } {
    const checks: SeoCheck[] = [];
    let score = 0;
    const maxScore = 9;

    // 1. Titolo — lunghezza
    const titleLen = title.trim().length;
    if (titleLen === 0) {
        checks.push({ label: 'Titolo', status: 'error', message: 'Il titolo è vuoto.' });
    } else if (titleLen < 30) {
        checks.push({ label: 'Titolo', status: 'warn', message: `Troppo corto (${titleLen}/30 min). Aggiungi più contesto.` });
        score += 0.5;
    } else if (titleLen > 65) {
        checks.push({ label: 'Titolo', status: 'warn', message: `Troppo lungo (${titleLen} car.). Google tronca oltre 65.` });
        score += 0.5;
    } else {
        checks.push({ label: 'Titolo', status: 'ok', message: `Lunghezza ottimale (${titleLen} caratteri).` });
        score += 1;
    }

    // 2. Excerpt / Meta Description — lunghezza
    const excerptLen = excerpt.trim().length;
    if (excerptLen === 0) {
        checks.push({ label: 'Meta Description', status: 'error', message: 'L\'excerpt (meta description) è vuoto.' });
    } else if (excerptLen < 80) {
        checks.push({ label: 'Meta Description', status: 'warn', message: `Troppo corto (${excerptLen}/80 min). Aggiungi più dettagli.` });
        score += 0.5;
    } else if (excerptLen > 165) {
        checks.push({ label: 'Meta Description', status: 'warn', message: `Troppo lungo (${excerptLen} car.). Google tronca oltre 165.` });
        score += 0.5;
    } else {
        checks.push({ label: 'Meta Description', status: 'ok', message: `Lunghezza ottimale (${excerptLen} caratteri).` });
        score += 1;
    }

    // 3. Copertina
    if (!cover_image.trim()) {
        checks.push({ label: 'Immagine di Copertina', status: 'error', message: 'Manca l\'immagine di copertina (og:image).' });
    } else {
        checks.push({ label: 'Immagine di Copertina', status: 'ok', message: 'Immagine presente — ottimo per Open Graph.' });
        score += 1;
    }

    // 4. Tag — conta solo la quantità.
    // NON si controlla più se un tag compare nel testo: era quel controllo a
    // spingere verso un tag inventato per articolo. I tag servono a collegare
    // fra loro articoli diversi, non a ripetere parole di questo.
    if (tags.length === 0) {
        checks.push({ label: 'Tag', status: 'warn', message: 'Nessun tag. Aggiungine 2-5, riusando quelli che esistono già.' });
    } else if (tags.length < 2) {
        checks.push({ label: 'Tag', status: 'warn', message: `Solo ${tags.length} tag. Consigliati almeno 2.` });
        score += 0.5;
    } else if (tags.length > 8) {
        checks.push({ label: 'Tag', status: 'warn', message: `${tags.length} tag. Troppi: diluiscono invece di collegare (max 8).` });
        score += 0.5;
    } else {
        checks.push({ label: 'Tag', status: 'ok', message: `${tags.length} tag — buon collegamento con gli altri articoli.` });
        score += 1;
    }

    // 5. Lunghezza contenuto
    const wordCount = countWords(content);
    if (wordCount < 100) {
        checks.push({ label: 'Lunghezza Contenuto', status: 'error', message: `Troppo breve (${wordCount} parole). Minimo consigliato: 300.` });
    } else if (wordCount < 300) {
        checks.push({ label: 'Lunghezza Contenuto', status: 'warn', message: `Contenuto corto (${wordCount} parole). Google preferisce ≥ 300.` });
        score += 0.5;
    } else {
        checks.push({ label: 'Lunghezza Contenuto', status: 'ok', message: `${wordCount} parole (~${estimateReadTime(wordCount)} min di lettura).` });
        score += 1;
    }

    // 6. Heading nel contenuto
    const hasH2 = /<h2/i.test(content);
    const hasH3 = /<h3/i.test(content);
    if (!hasH2 && !hasH3) {
        checks.push({ label: 'Struttura Heading', status: 'warn', message: 'Nessun H2/H3 nel contenuto. Usa i titoli per strutturare.' });
    } else {
        checks.push({ label: 'Struttura Heading', status: 'ok', message: 'Heading H2/H3 presenti — struttura leggibile.' });
        score += 1;
    }

    // 7-9. Parola chiave principale — dove deve comparire davvero.
    // Google valuta il testo, non la tassonomia: titolo, apertura e corpo.
    const kw = norm(focusKeyword.trim());

    // Tre controlli indipendenti, un punto ciascuno. Nessun punto "regalato" per
    // aver solo compilato il campo, e nessun tutto-o-niente su due cose insieme:
    // ogni riga dice esattamente quale dei tre posti manca.
    const kwLabel = focusKeyword.trim();

    if (!kw) {
        const nota = 'Imposta la Parola chiave principale (campo a sinistra): vale 3 punti su 9.';
        checks.push({ label: 'Chiave nel titolo',   status: 'warn', message: nota });
        checks.push({ label: 'Chiave nel riassunto', status: 'warn', message: nota });
        checks.push({ label: 'Chiave nel testo',     status: 'warn', message: nota });
    } else {
        const plain = norm(stripHtml(content));
        const inTitle = norm(title).includes(kw);
        const inExcerpt = norm(excerpt).includes(kw);
        const inHeading = norm((content.match(/<h[23][^>]*>(.*?)<\/h[23]>/gis) || []).join(' ')).includes(kw);
        const occurrences = plain.split(kw).length - 1;

        // 7. Nel titolo — è la riga che Google mostra come link.
        if (inTitle) {
            checks.push({ label: 'Chiave nel titolo', status: 'ok', message: `"${kwLabel}" compare nel titolo.` });
            score += 1;
        } else {
            checks.push({ label: 'Chiave nel titolo', status: 'warn', message: `"${kwLabel}" non compare nel titolo, che è la riga cliccabile nei risultati di ricerca.` });
        }

        // 8. Nel riassunto — è il testo sotto il link nei risultati di ricerca.
        if (inExcerpt) {
            checks.push({ label: 'Chiave nel riassunto', status: 'ok', message: `"${kwLabel}" compare nel Breve Riassunto.` });
            score += 1;
        } else {
            checks.push({ label: 'Chiave nel riassunto', status: 'warn', message: `"${kwLabel}" non compare nel Breve Riassunto, il testo mostrato sotto il link su Google.` });
        }

        // 9. Nel corpo — presenza reale, con un tetto oltre il quale la ripetizione
        // diventa forzata (circa una ogni 100 parole, minimo 4).
        const maxSensible = Math.max(4, Math.round(wordCount / 100));
        if (occurrences === 0) {
            checks.push({ label: 'Chiave nel testo', status: 'error', message: `"${kwLabel}" non compare mai nell'articolo. Se il pezzo parla di questo, dovrebbe esserci.` });
        } else if (occurrences > maxSensible) {
            checks.push({ label: 'Chiave nel testo', status: 'warn', message: `Ripetuta ${occurrences} volte in ${wordCount} parole: troppe, suona forzata (limite consigliato ${maxSensible}).` });
            score += 0.5;
        } else {
            const bonus = inHeading ? ', anche in un sottotitolo' : '';
            checks.push({ label: 'Chiave nel testo', status: 'ok', message: `Citata ${occurrences} ${occurrences === 1 ? 'volta' : 'volte'}${bonus}: dosaggio giusto.` });
            score += 1;
        }
    }

    return { checks, score: Math.round((score / maxScore) * 100) };
}

// ─── Componente ────────────────────────────────────────────────────────────────

const SeoScorePanel: React.FC<SeoScorePanelProps> = ({ title, excerpt, content, cover_image, tags, focusKeyword }) => {
    const { checks, score } = useMemo(
        () => computeChecks(title, excerpt, content, cover_image, tags, focusKeyword || ''),
        [title, excerpt, content, cover_image, tags, focusKeyword]
    );

    const scoreColor =
        score >= 80 ? 'text-emerald-400' :
        score >= 50 ? 'text-amber-400' :
        'text-red-400';

    const scoreBg =
        score >= 80 ? 'from-emerald-500/20 to-emerald-500/5' :
        score >= 50 ? 'from-amber-500/20 to-amber-500/5' :
        'from-red-500/20 to-red-500/5';

    const scoreLabel =
        score >= 80 ? 'Ottimizzato' :
        score >= 50 ? 'Da Migliorare' :
        'Critico';

    const wordCount = useMemo(() => countWords(content), [content]);
    const readTime = estimateReadTime(wordCount);

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Search size={16} className="text-dis-green" />
                <h3 className="text-sm font-bold text-white">SEO Score</h3>
            </div>

            {/* Score Ring */}
            <div className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br ${scoreBg} border border-zinc-800`}>
                <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#27272a" strokeWidth="3" />
                        <circle
                            cx="18" cy="18" r="15.9" fill="none"
                            stroke={score >= 80 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171'}
                            strokeWidth="3"
                            strokeDasharray={`${score} ${100 - score}`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className={`text-lg font-black ${scoreColor}`}>{score}</span>
                </div>
                <div>
                    <p className={`text-base font-bold ${scoreColor}`}>{scoreLabel}</p>
                    <p className="text-xs text-zinc-500">{wordCount} parole · {readTime} min lettura</p>
                </div>
            </div>

            {/* Checks */}
            <ul className="space-y-2">
                {checks.map((check, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0">
                            {check.status === 'ok'   && <CheckCircle  size={15} className="text-emerald-400" />}
                            {check.status === 'warn'  && <AlertCircle  size={15} className="text-amber-400" />}
                            {check.status === 'error' && <XCircle      size={15} className="text-red-400" />}
                        </span>
                        <div>
                            <p className="text-xs font-semibold text-zinc-300">{check.label}</p>
                            <p className="text-xs text-zinc-500">{check.message}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SeoScorePanel;

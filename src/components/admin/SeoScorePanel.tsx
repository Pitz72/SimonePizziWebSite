import React, { useMemo } from 'react';
import { CheckCircle, XCircle, AlertCircle, Search } from 'lucide-react';

// ─── Tipi ──────────────────────────────────────────────────────────────────────

interface SeoScorePanelProps {
    title: string;
    excerpt: string;
    content: string;
    cover_image: string;
    tags: string[];
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

function computeChecks(
    title: string,
    excerpt: string,
    content: string,
    cover_image: string,
    tags: string[]
): { checks: SeoCheck[]; score: number } {
    const checks: SeoCheck[] = [];
    let score = 0;
    const maxScore = 7;

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

    // 4. Tag
    if (tags.length === 0) {
        checks.push({ label: 'Tag', status: 'warn', message: 'Nessun tag. Aggiungi 2-5 tag rilevanti.' });
    } else if (tags.length < 2) {
        checks.push({ label: 'Tag', status: 'warn', message: `Solo ${tags.length} tag. Consigliati almeno 2.` });
        score += 0.5;
    } else if (tags.length > 8) {
        checks.push({ label: 'Tag', status: 'warn', message: `${tags.length} tag. Evita keyword stuffing (max 8).` });
        score += 0.5;
    } else {
        checks.push({ label: 'Tag', status: 'ok', message: `${tags.length} tag — buona copertura tematica.` });
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

    // 7. Keyword nel titolo e nell'excerpt
    if (tags.length > 0 && titleLen > 0 && excerptLen > 0) {
        const firstTag = tags[0].toLowerCase();
        const titleLow = title.toLowerCase();
        const excerptLow = excerpt.toLowerCase();
        if (titleLow.includes(firstTag) || excerptLow.includes(firstTag)) {
            checks.push({ label: 'Keyword nel Testo', status: 'ok', message: `Il tag principale "${tags[0]}" è presente nel titolo o nell'excerpt.` });
            score += 1;
        } else {
            checks.push({ label: 'Keyword nel Testo', status: 'warn', message: `Il tag "${tags[0]}" non compare nel titolo o nell'excerpt.` });
        }
    } else {
        checks.push({ label: 'Keyword nel Testo', status: 'warn', message: 'Impossibile verificare — aggiungi almeno un tag.' });
    }

    return { checks, score: Math.round((score / maxScore) * 100) };
}

// ─── Componente ────────────────────────────────────────────────────────────────

const SeoScorePanel: React.FC<SeoScorePanelProps> = ({ title, excerpt, content, cover_image, tags }) => {
    const { checks, score } = useMemo(
        () => computeChecks(title, excerpt, content, cover_image, tags),
        [title, excerpt, content, cover_image, tags]
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

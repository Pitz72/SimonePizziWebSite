import React from 'react';
import { Tag as TagIcon, X, Plus, AlertTriangle, TrendingUp } from 'lucide-react';

export interface AvailableTag {
    id: number;
    name: string;
    slug: string;
    article_count?: number | string;
}

interface Props {
    value: string[];
    onChange: (tags: string[]) => void;
    available: AvailableTag[];
}

/** Confronto insensibile ad accenti, maiuscole e spazi doppi. */
const norm = (s: string): string =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();

/**
 * Distanza di Levenshtein — quante lettere separano due parole.
 * Serve a intercettare i refusi: "leonaardo" dista 1 da "leonardo", quindi
 * proponiamo quello esistente invece di creare un doppione.
 */
const distance = (a: string, b: string): number => {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
        const curr = [i];
        for (let j = 1; j <= b.length; j++) {
            curr[j] = Math.min(
                prev[j] + 1,
                curr[j - 1] + 1,
                prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
        prev = curr;
    }
    return prev[b.length];
};

const countOf = (t: AvailableTag): number => Number(t.article_count ?? 0);

/**
 * [v1.27.0] Selettore tag orientato al RIUSO.
 *
 * Sostituisce il vecchio input con <datalist>, che filtrava solo per lettera
 * iniziale e non mostrava nulla finché non si iniziava a digitare: con 310 tag
 * era più veloce inventarne uno nuovo che ritrovare quello giusto. Da lì 208 tag
 * usati una volta sola, refusi compresi.
 *
 * Qui il riuso è la strada in discesa: i tag più usati sono già a schermo, la
 * ricerca trova il testo ovunque nella parola, ogni voce mostra quanti articoli
 * la usano, e creare un tag nuovo richiede un passaggio in più con avviso esplicito.
 */
const TagPicker: React.FC<Props> = ({ value, onChange, available }) => {
    const [input, setInput] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [highlight, setHighlight] = React.useState(0);
    const boxRef = React.useRef<HTMLDivElement>(null);

    const selected = Array.isArray(value) ? value : [];
    const isSelected = (name: string) => selected.some(t => norm(t) === norm(name));

    // Chiude la tendina cliccando fuori.
    React.useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    const q = norm(input);

    // Corrispondenze: match ovunque nella parola, i più usati per primi.
    const matches = React.useMemo(() => {
        if (!q) return [];
        return available
            .filter(t => !isSelected(t.name) && norm(t.name).includes(q))
            .sort((a, b) => {
                // A parità di pertinenza vince chi è già usato di più: è il tag
                // che con ogni probabilità volevi.
                const aStarts = norm(a.name).startsWith(q) ? 0 : 1;
                const bStarts = norm(b.name).startsWith(q) ? 0 : 1;
                if (aStarts !== bStarts) return aStarts - bStarts;
                return countOf(b) - countOf(a);
            })
            .slice(0, 8);
    }, [q, available, selected]);

    const exactExists = available.some(t => norm(t.name) === q);

    // Refusi: tag esistenti a distanza 1-2 che NON sono già fra le corrispondenze.
    const typoSuggestions = React.useMemo(() => {
        if (!q || q.length < 4 || exactExists) return [];
        const maxDist = q.length <= 6 ? 1 : 2;
        return available
            .filter(t => !isSelected(t.name) && !norm(t.name).includes(q))
            .map(t => ({ tag: t, d: distance(q, norm(t.name)) }))
            .filter(x => x.d <= maxDist)
            .sort((a, b) => a.d - b.d || countOf(b.tag) - countOf(a.tag))
            .slice(0, 3)
            .map(x => x.tag);
    }, [q, available, exactExists, selected]);

    // Scorciatoia sempre visibile: i tag più usati non ancora selezionati.
    const popular = React.useMemo(
        () => available
            .filter(t => !isSelected(t.name) && countOf(t) > 0)
            .sort((a, b) => countOf(b) - countOf(a))
            .slice(0, 10),
        [available, selected]
    );

    const addTag = (name: string) => {
        const clean = name.trim();
        if (!clean || isSelected(clean)) return;
        onChange([...selected, clean]);
        setInput('');
        setHighlight(0);
        setOpen(false);
    };

    const removeTag = (i: number) => onChange(selected.filter((_, idx) => idx !== i));

    // Righe navigabili da tastiera: prima le corrispondenze, poi "crea nuovo".
    const rows: Array<{ kind: 'existing'; tag: AvailableTag } | { kind: 'new'; name: string }> = [
        ...matches.map(t => ({ kind: 'existing' as const, tag: t })),
        ...(q && !exactExists ? [{ kind: 'new' as const, name: input.trim() }] : []),
    ];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
            setHighlight(h => Math.min(h + 1, rows.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight(h => Math.max(h - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const row = rows[highlight];
            if (row) addTag(row.kind === 'existing' ? row.tag.name : row.name);
        } else if (e.key === 'Escape') {
            setOpen(false);
        } else if (e.key === 'Backspace' && !input && selected.length) {
            removeTag(selected.length - 1);
        }
    };

    return (
        <div className="space-y-2" ref={boxRef}>
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                <TagIcon size={16} />
                Tag
                <span className="text-xs font-normal text-zinc-500">— servono a collegare articoli fra loro</span>
            </label>

            {/* Tag selezionati */}
            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selected.map((tag, i) => {
                        const known = available.find(t => norm(t.name) === norm(tag));
                        const isNew = !known;
                        return (
                            <span
                                key={`${tag}-${i}`}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${
                                    isNew
                                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/40'
                                        : 'bg-zinc-800 text-dis-green border-zinc-700'
                                }`}
                                title={isNew ? 'Tag nuovo: verrà creato al salvataggio' : `Usato in ${countOf(known!)} articoli`}
                            >
                                {isNew && <Plus size={12} />}
                                {tag}
                                {!isNew && countOf(known!) > 0 && (
                                    <span className="text-[10px] text-zinc-500">{countOf(known!)}</span>
                                )}
                                <button type="button" onClick={() => removeTag(i)} className="text-zinc-400 hover:text-white">
                                    <X size={14} />
                                </button>
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Campo con autocomplete */}
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={e => { setInput(e.target.value); setOpen(true); setHighlight(0); }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Cerca un tag esistente..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-dis-green focus:outline-none placeholder-zinc-700"
                />

                {open && rows.length > 0 && (
                    <ul className="absolute z-30 left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                        {rows.map((row, i) => (
                            <li key={row.kind === 'existing' ? row.tag.id : '__new__'}>
                                <button
                                    type="button"
                                    onMouseEnter={() => setHighlight(i)}
                                    onClick={() => addTag(row.kind === 'existing' ? row.tag.name : row.name)}
                                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                                        i === highlight ? 'bg-zinc-800' : ''
                                    }`}
                                >
                                    {row.kind === 'existing' ? (
                                        <>
                                            <span className="text-white text-sm">{row.tag.name}</span>
                                            <span className="text-[11px] text-zinc-500 shrink-0">
                                                {countOf(row.tag)} {countOf(row.tag) === 1 ? 'articolo' : 'articoli'}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-amber-300 text-sm flex items-center gap-2">
                                                <Plus size={14} />
                                                Crea il tag nuovo «{row.name}»
                                            </span>
                                            <span className="text-[11px] text-amber-500/70 shrink-0">mai usato prima</span>
                                        </>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Possibili refusi */}
            {typoSuggestions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                    <span className="text-xs text-amber-200">Forse intendevi:</span>
                    {typoSuggestions.map(t => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => addTag(t.name)}
                            className="px-2.5 py-1 bg-amber-500/20 text-amber-100 rounded-full text-xs font-medium hover:bg-amber-500/30 transition-colors"
                        >
                            {t.name} <span className="opacity-60">({countOf(t)})</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Scorciatoia ai tag più usati */}
            {popular.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="flex items-center gap-1 text-[11px] text-zinc-500 mr-1">
                        <TrendingUp size={12} /> Più usati:
                    </span>
                    {popular.map(t => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => addTag(t.name)}
                            className="px-2.5 py-1 bg-zinc-800/70 border border-zinc-700 text-zinc-300 rounded-full text-xs hover:border-dis-green hover:text-white transition-colors"
                        >
                            {t.name} <span className="text-zinc-500">{countOf(t)}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagPicker;

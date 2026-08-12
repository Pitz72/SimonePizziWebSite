import React from 'react';
import { List, ChevronDown } from 'lucide-react';
import { slugify } from '../utils/slugify';

export interface TocItem {
    id: string;
    text: string;
    level: 2 | 3;
}

/**
 * [v1.26.0] Estrae l'indice dai titoli h2/h3 di un articolo già sanificato.
 *
 * Restituisce l'HTML con gli `id` iniettati sui titoli (necessari per gli
 * ancoraggi) e la lista delle voci. Gli id sono garantiti univoci: due sezioni
 * con lo stesso titolo riceverebbero altrimenti lo stesso ancoraggio e il
 * secondo link porterebbe sempre al primo.
 *
 * Va invocata DOPO DOMPurify: aggiungendo gli id prima, il sanitizer potrebbe
 * rimuoverli.
 */
export const buildToc = (html: string): { html: string; items: TocItem[] } => {
    if (!html || typeof window === 'undefined') return { html, items: [] };

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const headings = Array.from(doc.querySelectorAll('h2, h3'));
    if (headings.length === 0) return { html, items: [] };

    const used = new Set<string>();
    const items: TocItem[] = [];

    headings.forEach((h, index) => {
        const text = (h.textContent || '').trim();
        if (!text) return;

        const base = slugify(text) || `sezione-${index + 1}`;

        let id = base;
        let n = 2;
        while (used.has(id)) id = `${base}-${n++}`;
        used.add(id);

        h.id = id;
        // Compensa l'header fisso: senza questo il titolo finisce sotto la barra.
        (h as HTMLElement).style.scrollMarginTop = '110px';

        items.push({ id, text, level: h.tagName === 'H3' ? 3 : 2 });
    });

    return { html: doc.body.innerHTML, items };
};

interface Props {
    items: TocItem[];
    /** Layout: 'sidebar' per desktop sticky, 'inline' per il pannello mobile. */
    variant?: 'sidebar' | 'inline';
}

const TableOfContents: React.FC<Props> = ({ items, variant = 'sidebar' }) => {
    const [activeId, setActiveId] = React.useState<string>('');
    const [open, setOpen] = React.useState(false);

    // Scroll-spy: evidenzia la sezione più in alto tra quelle visibili.
    React.useEffect(() => {
        if (items.length === 0) return;

        const observer = new IntersectionObserver(
            entries => {
                const visible = entries
                    .filter(e => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible.length > 0) setActiveId(visible[0].target.id);
            },
            // La banda alta della viewport è ciò che il lettore sta effettivamente leggendo.
            { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
        );

        items.forEach(i => {
            const el = document.getElementById(i.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [items]);

    const handleClick = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        const el = document.getElementById(id);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Aggiorna l'URL senza far saltare la pagina (il salto lo fa lo scroll dolce).
        window.history.replaceState(null, '', `#${id}`);
        setOpen(false);
    };

    if (items.length === 0) return null;

    const list = (
        <nav aria-label="Indice dei contenuti">
            <ul className="space-y-1">
                {items.map(item => {
                    const isActive = item.id === activeId;
                    return (
                        <li key={item.id} style={{ paddingLeft: item.level === 3 ? '14px' : 0 }}>
                            <a
                                href={`#${item.id}`}
                                onClick={e => handleClick(e, item.id)}
                                className="block py-1.5 leading-snug transition-colors"
                                style={{
                                    fontSize: item.level === 3 ? '12px' : '13px',
                                    color: isActive ? '#22c55e' : '#6a9070',
                                    borderLeft: `2px solid ${isActive ? '#22c55e' : 'rgba(34,197,94,0.15)'}`,
                                    paddingRight: '8px',
                                    paddingLeft: '12px',
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#d4e8d8'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#6a9070'; }}
                            >
                                {item.text}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );

    if (variant === 'inline') {
        return (
            <div
                className="xl:hidden mb-10"
                style={{ background: '#0c1410', border: '1px solid rgba(34,197,94,0.12)', borderRadius: '2px' }}
            >
                <button
                    type="button"
                    onClick={() => setOpen(o => !o)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 font-mono text-[11px] tracking-[0.16em] uppercase text-dis-green"
                >
                    <span className="flex items-center gap-2.5">
                        <List size={14} />
                        Indice · {items.length} sezioni
                    </span>
                    <ChevronDown
                        size={16}
                        style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }}
                    />
                </button>
                {open && (
                    <div className="px-5 pb-5 pt-1" style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
                        {list}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="hidden xl:block sticky" style={{ top: '112px' }}>
            <div className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.18em] uppercase text-dis-green mb-4">
                <List size={13} />
                Indice
            </div>
            {list}
        </div>
    );
};

export default TableOfContents;

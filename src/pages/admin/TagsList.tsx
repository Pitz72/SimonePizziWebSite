import { useState, useEffect, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import { Plus, Pencil, Trash2, Check, X, Merge, Search } from 'lucide-react';
import { api } from '../../api';

/** Soglia oltre la quale la pagina del tag entra nell'indice di Google.
 *  Deve restare allineata a TAG_INDEX_MIN_ARTICLES in public/api/db.php. */
const SOGLIA_INDICE = 3;

/** Articoli PUBBLICATI: è questo numero a decidere l'indicizzazione della pagina tag. */
const pubOf = (t: any): number => Number(t.article_count ?? 0);
/** TUTTI gli articoli, bozze e programmati compresi: è questo che dice se il tag è in uso. */
const totOf = (t: any): number => Number(t.total_count ?? t.article_count ?? 0);

export default function TagsList() {
    const initialTags = useLoaderData() as any[];
    const [tags, setTags] = useState<any[]>(initialTags || []);
    const [error, setError] = useState<string | null>(null);

    // [v1.27.0] Strumenti di riordino: con 310 tag serve poterli cercare,
    // ordinare per frequenza e unire.
    const [filter, setFilter] = useState('');
    const [sortBy, setSortBy] = useState<'usage' | 'name'>('usage');
    const [mergeFrom, setMergeFrom] = useState<any | null>(null);
    const [mergeToId, setMergeToId] = useState<string>('');
    const [merging, setMerging] = useState(false);

    // Stato form nuovo tag
    const [newName, setNewName] = useState('');
    const [newSlug, setNewSlug] = useState('');
    const [creating, setCreating] = useState(false);

    // Stato modifica inline
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editSlug, setEditSlug] = useState('');

    const load = async () => {
        try {
            const data = await api.getTags(true);
            setTags(data);
        } catch {
            setError('Errore caricamento tags.');
        }
    };

    // Elenco filtrato e ordinato + statistiche di riepilogo.
    const visibleTags = useMemo(() => {
        const q = filter.trim().toLowerCase();
        const list = q ? tags.filter(t => t.name.toLowerCase().includes(q) || t.slug.includes(q)) : [...tags];
        return list.sort((a, b) =>
            sortBy === 'usage'
                ? totOf(b) - totOf(a) || a.name.localeCompare(b.name)
                : a.name.localeCompare(b.name)
        );
    }, [tags, filter, sortBy]);

    const stats = useMemo(() => ({
        totali: tags.length,
        // "Mai usati" deve significare davvero mai: si guarda il totale, non i
        // soli pubblicati, altrimenti un tag presente solo in una bozza sembra
        // eliminabile e cancellandolo lo si toglie a un articolo vero.
        inutilizzati: tags.filter(t => totOf(t) === 0).length,
        unaVolta: tags.filter(t => totOf(t) === 1).length,
        indicizzati: tags.filter(t => pubOf(t) >= SOGLIA_INDICE).length,
        // Tag in uso solo da bozze o articoli programmati: non indicizzati ma
        // nemmeno orfani. Vanno lasciati stare.
        soloBozze: tags.filter(t => totOf(t) > 0 && pubOf(t) === 0).length,
    }), [tags]);

    const handleMerge = async () => {
        if (!mergeFrom || !mergeToId) return;
        const target = tags.find(t => String(t.id) === mergeToId);
        if (!target) return;
        if (!confirm(
            `Unire "${mergeFrom.name}" in "${target.name}"?\n\n` +
            `Tutti gli articoli che usano "${mergeFrom.name}" passeranno a "${target.name}", ` +
            `e "${mergeFrom.name}" verrà eliminato.\n\nL'operazione non è reversibile.`
        )) return;

        setMerging(true);
        try {
            await api.mergeTags(mergeFrom.id, target.id);
            setMergeFrom(null);
            setMergeToId('');
            await load();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setMerging(false);
        }
    };

    useEffect(() => {
        if (initialTags) {
            setTags(initialTags);
        }
    }, [initialTags]);

    const handleNameChange = (value: string) => {
        setNewName(value);
        setNewSlug(
            value.toLowerCase()
                .replace(/[àáâã]/g, 'a').replace(/[èéêë]/g, 'e')
                .replace(/[ìíîï]/g, 'i').replace(/[òóôõ]/g, 'o')
                .replace(/[ùúûü]/g, 'u')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '')
        );
    };

    const handleCreate = async () => {
        if (!newName.trim() || !newSlug.trim()) return;
        setCreating(true);
        try {
            await api.createTag({ name: newName.trim(), slug: newSlug.trim() });
            setNewName('');
            setNewSlug('');
            await load();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setCreating(false);
        }
    };

    const startEdit = (tag: any) => {
        setEditingId(tag.id);
        setEditName(tag.name);
        setEditSlug(tag.slug);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditSlug('');
    };

    const saveEdit = async (tag: any) => {
        if (!editName.trim() || !editSlug.trim()) return;
        try {
            await api.updateTag(tag.id, { name: editName.trim(), slug: editSlug.trim() });
            cancelEdit();
            await load();
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleDelete = async (tag: any) => {
        const tot = totOf(tag);
        const pub = pubOf(tag);
        // Avviso esplicito quando il tag è in uso solo da contenuti non ancora
        // online: è il caso in cui il badge mostra 0 pubblicati e sembra un orfano.
        const avviso = tot === 0
            ? `Eliminare il tag "${tag.name}"?\n\nNessun articolo lo usa: eliminazione sicura.`
            : pub === 0
                ? `ATTENZIONE: "${tag.name}" è usato da ${tot} articolo/i non ancora pubblicati (bozze o programmati).\n\nEliminandolo lo perderai da quegli articoli. Procedere?`
                : `Eliminare il tag "${tag.name}"?\n\nVerrà slegato da ${tot} articolo/i (${pub} già pubblicati).`;
        if (!confirm(avviso)) return;
        try {
            await api.deleteTag(tag.id);
            await load();
        } catch (e: any) {
            setError(e.message);
        }
    };


    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white">Tag Dinamici</h1>
                <p className="text-zinc-400 mt-2">
                    I tag servono a collegare articoli diversi fra loro. Un tag usato una volta sola
                    non collega niente: conviene unirlo a uno esistente o eliminarlo.
                </p>
            </header>

            {/* [v1.27.0] Riepilogo dello stato di salute della tassonomia.
                I conteggi sono su TUTTI gli articoli (bozze e programmati compresi),
                tranne "Indicizzati" che per forza guarda solo i pubblicati. */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Tag totali', value: stats.totali, tone: 'text-white',
                      hint: 'Quanti tag esistono in archivio.' },
                    { label: `Indicizzati su Google (${SOGLIA_INDICE}+ articoli pubblicati)`, value: stats.indicizzati, tone: 'text-dis-green',
                      hint: 'La loro pagina /tag/… è proposta ai motori di ricerca.' },
                    { label: 'Usati in un solo articolo', value: stats.unaVolta, tone: 'text-amber-400',
                      hint: 'Collegano un pezzo solo: candidati a essere uniti.' },
                    { label: 'Mai usati da nessun articolo', value: stats.inutilizzati, tone: 'text-red-400',
                      hint: 'Nessun articolo li usa, nemmeno fra le bozze: eliminabili senza conseguenze.' },
                ].map(s => (
                    <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4" title={s.hint}>
                        <p className={`text-2xl font-black ${s.tone}`}>{s.value}</p>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-tight">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
                <p className="text-xs text-zinc-300 leading-relaxed">
                    <strong className="text-white">Come leggere questa pagina.</strong> Il numero accanto a
                    ogni tag è quante volte lo usi <em>in tutto</em>. Diventa verde quando il tag arriva a{' '}
                    {SOGLIA_INDICE} articoli <em>già pubblicati</em>: da lì la sua pagina entra nell'indice
                    di Google. Sotto quella soglia la pagina esiste e funziona, semplicemente non viene
                    proposta ai motori.
                </p>
                {stats.unaVolta > 0 && (
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Hai <strong className="text-amber-400">{stats.unaVolta} tag usati una volta sola</strong>:
                        non collegano niente a niente. Con <em>Unisci</em> li accorpi a un tag più frequente,
                        che così sale verso la soglia.
                    </p>
                )}
                {stats.soloBozze > 0 && (
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        <strong className="text-blue-400">{stats.soloBozze} tag</strong> compaiono solo in bozze
                        o articoli programmati: mostrano <span className="text-zinc-300">0 pubbl.</span> ma
                        <strong> sono in uso</strong>. Non eliminarli.
                    </p>
                )}
            </div>

            {/* Pannello di unione */}
            {mergeFrom && (
                <div className="p-4 bg-zinc-900 border border-dis-green/40 rounded-xl space-y-3">
                    <p className="text-white font-bold text-sm flex items-center gap-2">
                        <Merge size={16} className="text-dis-green" />
                        Unisci «{mergeFrom.name}» in un altro tag
                    </p>
                    <p className="text-xs text-zinc-400">
                        I {totOf(mergeFrom)} articoli che usano «{mergeFrom.name}» (bozze comprese) passeranno al tag scelto.
                        «{mergeFrom.name}» verrà eliminato.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select
                            value={mergeToId}
                            onChange={e => setMergeToId(e.target.value)}
                            className="flex-1 bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-dis-green"
                        >
                            <option value="">Scegli il tag di destinazione…</option>
                            {[...tags]
                                .filter(t => t.id !== mergeFrom.id)
                                .sort((a, b) => totOf(b) - totOf(a) || a.name.localeCompare(b.name))
                                .map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.name} ({totOf(t)} usi)
                                    </option>
                                ))}
                        </select>
                        <button
                            onClick={handleMerge}
                            disabled={!mergeToId || merging}
                            className="px-5 py-2 bg-dis-green text-black font-bold text-sm rounded-lg hover:bg-green-400 transition-colors disabled:opacity-40"
                        >
                            {merging ? 'Unione…' : 'Unisci'}
                        </button>
                        <button
                            onClick={() => { setMergeFrom(null); setMergeToId(''); }}
                            className="px-4 py-2 bg-zinc-800 text-zinc-300 font-bold text-sm rounded-lg hover:text-white transition-colors"
                        >
                            Annulla
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X size={16} /></button>
                </div>
            )}

            {/* Elenco Tags */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center gap-3">
                    <h2 className="text-white font-semibold flex items-baseline gap-2 shrink-0">
                        Lista Tag
                        <span className="bg-dis-green/10 text-dis-green px-2 py-0.5 rounded-full text-xs">
                            {visibleTags.length} / {tags.length}
                        </span>
                    </h2>
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                        <input
                            type="text"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            placeholder="Filtra i tag..."
                            className="w-full bg-zinc-950 border border-zinc-800 py-2 pl-9 pr-3 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-dis-green"
                        />
                    </div>
                    <select
                        value={sortBy}
                        onChange={e => setSortBy(e.target.value as 'usage' | 'name')}
                        className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-dis-green shrink-0"
                    >
                        <option value="usage">Ordina per utilizzo</option>
                        <option value="name">Ordina per nome</option>
                    </select>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                    <ul className="divide-y divide-zinc-800">
                        {visibleTags.map((tag) => (
                            <li key={tag.id} className="px-6 py-4 flex items-center gap-4">
                                {editingId === tag.id ? (
                                    <div className="flex-1 flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            placeholder="Nome tag"
                                            className="flex-1 bg-zinc-800 border border-zinc-600 text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-dis-green"
                                        />
                                        <input
                                            type="text"
                                            value={editSlug}
                                            onChange={e => setEditSlug(e.target.value)}
                                            placeholder="slug-url"
                                            className="flex-1 bg-zinc-800 border border-zinc-600 text-zinc-300 font-mono px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-dis-green"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => saveEdit(tag)} className="p-2 bg-dis-green/10 border border-dis-green/30 text-dis-green rounded-lg hover:bg-dis-green/20">
                                                <Check size={16} />
                                            </button>
                                            <button onClick={cancelEdit} className="p-2 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-lg hover:text-white">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-white font-medium truncate">{tag.name}</p>
                                            <p className="text-zinc-500 text-xs font-mono mt-0.5">#{tag.slug}</p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {/* Due numeri diversi, e la differenza conta:
                                                - totale  = quante volte il tag è usato (bozze incluse)
                                                - pubbl.  = quanti di quegli articoli sono online
                                                Un tag con totale>0 e pubbl.=0 è IN USO ma invisibile:
                                                mostrarlo come "0" e basta invitava a cancellarlo. */}
                                            {(() => {
                                                const tot = totOf(tag);
                                                const pub = pubOf(tag);
                                                const soloBozze = tot > 0 && pub === 0;

                                                const tone = pub >= SOGLIA_INDICE
                                                    ? 'bg-dis-green/10 text-dis-green border-dis-green/30'
                                                    : tot === 0
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                                        : soloBozze
                                                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30';

                                                const title = tot === 0
                                                    ? 'Nessun articolo usa questo tag, nemmeno fra le bozze: eliminabile'
                                                    : soloBozze
                                                        ? `Usato in ${tot} articolo/i, ma nessuno ancora pubblicato (bozze o programmati). NON eliminare.`
                                                        : pub >= SOGLIA_INDICE
                                                            ? `${pub} articoli pubblicati — la pagina del tag è nell'indice di Google`
                                                            : `${pub} pubblicati su ${tot}: sotto la soglia di ${SOGLIA_INDICE}, pagina non indicizzata`;

                                                return (
                                                    <span className={`px-2 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap ${tone}`} title={title}>
                                                        {tot} {tot === 1 ? 'uso' : 'usi'}
                                                        {tot > 0 && pub !== tot && (
                                                            <span className="font-normal opacity-70"> · {pub} pubbl.</span>
                                                        )}
                                                    </span>
                                                );
                                            })()}
                                            <button onClick={() => { setMergeFrom(tag); setMergeToId(''); }} className="p-2 text-zinc-400 hover:text-dis-green hover:bg-zinc-800 rounded-lg" title="Unisci a un altro tag">
                                                <Merge size={16} />
                                            </button>
                                            <button onClick={() => startEdit(tag)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg" title="Rinomina">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(tag)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg" title="Elimina">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Form Nuovo Tag */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4">Aggiungi Nuovo Tag</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Nome Tag</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={e => handleNameChange(e.target.value)}
                            placeholder="es. Intelligenza Artificiale"
                            className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-dis-green"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Slug (auto-generato)</label>
                        <input
                            type="text"
                            value={newSlug}
                            onChange={e => setNewSlug(e.target.value)}
                            placeholder="intelligenza-artificiale"
                            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-dis-green"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleCreate}
                            disabled={creating || !newName.trim() || !newSlug.trim()}
                            className="flex items-center gap-2 px-5 py-2 bg-zinc-800 border border-zinc-700 text-white font-bold rounded-lg hover:bg-zinc-700 hover:border-zinc-500 transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                            <Plus size={16} />
                            {creating ? 'Creazione...' : 'Crea Rapido'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

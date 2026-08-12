import { useEffect, useState } from 'react';
import { Link, useLoaderData, useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, ExternalLink, Calendar, ChevronLeft, ChevronRight, Filter, X, Pin, PinOff, Copy, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '../../api';
import { useCategories } from '../../hooks/useCategories';

export default function ArticlesList() {
    const { categories } = useCategories();
    const navigate = useNavigate();
    const loaderData = useLoaderData() as { data: any[], total: number };
    const [searchParams, setSearchParams] = useSearchParams();

    // [v1.26.0] Selezione multipla e azioni di gruppo.
    const [selected, setSelected] = useState<number[]>([]);
    const [bulkBusy, setBulkBusy] = useState(false);
    const [duplicatingId, setDuplicatingId] = useState<number | null>(null);
    
    // Sincronizziamo dati dal loader
    const [articles, setArticles] = useState<any[]>(loaderData.data || []);
    const [total, setTotal] = useState<number>(loaderData.total || 0);
    const [tags, setTags] = useState<any[]>([]);
    
    // Valori correnti dai SearchParams
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;

    // Local state per la ricerca testuale — evita che ogni tasto rilanci il loader
    const [searchInput, setSearchInput] = useState(q);

    useEffect(() => { setSearchInput(q); }, [q]);

    useEffect(() => {
        const timer = setTimeout(() => { handleFilterChange('q', searchInput); }, 400);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    useEffect(() => {
        if (loaderData) {
            setArticles(loaderData.data || []);
            setTotal(loaderData.total || 0);
            // La selezione vale per la pagina corrente: cambiando pagina o filtro
            // le righe non sono più a schermo e tenerle selezionate è pericoloso.
            setSelected([]);
        }
    }, [loaderData]);

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('it-IT', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    useEffect(() => {
        const loadTags = async () => {
            try {
                const res = await api.getTags();
                setTags(res);
            } catch (err) { console.error(err); }
        };
        loadTags();
    }, []);

    const handleFilterChange = (name: string, value: string) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set(name, value);
        } else {
            newParams.delete(name);
        }
        newParams.set('page', '1'); // Reset paginazione su cambio filtro
        setSearchParams(newParams);
    };

    const handlePageChange = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', newPage.toString());
        setSearchParams(newParams);
    };

    const handleDelete = async (id: number, title: string) => {
        if (!window.confirm(`Sei sicuro di voler eliminare "${title}"?`)) return;
        try {
            await api.deleteArticle(id);
            setArticles(articles.filter(a => a.id !== id));
            setTotal(prev => prev - 1);
        } catch (err) {
            alert('Errore eliminazione articolo');
        }
    };

    // ── [v1.26.0] Duplica articolo ──────────────────────────────
    const handleDuplicate = async (id: number, title: string) => {
        setDuplicatingId(id);
        try {
            const res = await api.duplicateArticle(id);
            // Si va dritti nell'editor della copia: duplicare serve quasi sempre
            // come punto di partenza per scrivere, non per lasciarla lì.
            navigate(`/admin/articles/edit/${res.id}`);
        } catch (err: any) {
            alert(err.message || `Errore nella duplicazione di "${title}"`);
            setDuplicatingId(null);
        }
    };

    // ── [v1.26.0] Azioni multiple ───────────────────────────────
    const allOnPageSelected = articles.length > 0 && selected.length === articles.length;

    const toggleSelectAll = () => {
        setSelected(allOnPageSelected ? [] : articles.map(a => a.id));
    };

    const toggleSelectOne = (id: number) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleBulkStatus = async (status: 'draft' | 'published') => {
        const label = status === 'published' ? 'pubblicare' : 'rimettere in bozza';
        if (!window.confirm(`Vuoi ${label} ${selected.length} articoli selezionati?`)) return;
        setBulkBusy(true);
        try {
            await api.bulkSetArticleStatus(selected, status);
            setArticles(prev => prev.map(a => selected.includes(a.id) ? { ...a, status } : a));
            setSelected([]);
        } catch (err: any) {
            alert(err.message || 'Errore durante l\'aggiornamento multiplo');
        } finally {
            setBulkBusy(false);
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(
            `Stai per eliminare DEFINITIVAMENTE ${selected.length} articoli.\n\nL'operazione non è reversibile. Procedere?`
        )) return;
        setBulkBusy(true);
        try {
            const res = await api.bulkDeleteArticles(selected);
            setArticles(prev => prev.filter(a => !selected.includes(a.id)));
            setTotal(prev => Math.max(0, prev - (res?.affected ?? selected.length)));
            setSelected([]);
        } catch (err: any) {
            alert(err.message || 'Errore durante l\'eliminazione multipla');
        } finally {
            setBulkBusy(false);
        }
    };

    const handleToggleFeatured = async (id: number, currentStatus: number | boolean) => {
        const newStatus = currentStatus ? 0 : 1;
        setArticles(articles.map(a => a.id === id ? { ...a, is_featured: newStatus } : a));
        try {
            await api.toggleFeatured(id, !!newStatus);
        } catch (err) {
            alert('Errore durante l\'aggiornamento dello stato vetrina sul server.');
            setArticles(articles.map(a => a.id === id ? { ...a, is_featured: currentStatus } : a));
        }
    };

    const handleToggleCategoryPin = async (id: number, currentCategory: string, currentStatus: number | boolean) => {
        const newStatus = currentStatus ? 0 : 1;
        // Ottimisticamente: rimuove il pin dagli altri articoli della stessa categoria, poi lo imposta su questo
        setArticles(articles.map(a => {
            if (a.id === id) return { ...a, is_category_pinned: newStatus };
            if (newStatus && a.category === currentCategory) return { ...a, is_category_pinned: 0 };
            return a;
        }));
        try {
            await api.toggleCategoryPin(id, !!newStatus);
        } catch (err) {
            alert('Errore durante l\'aggiornamento del pin categoria sul server.');
            setArticles(articles.map(a => a.id === id ? { ...a, is_category_pinned: currentStatus } : a));
        }
    };

    const totalPages = Math.ceil(total / limit);
    const hasFilters = q || category || tag || startDate || endDate;
    const loading = false; // Il caricamento è gestito dal router ora


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gestione Articoli</h1>
                    <p className="text-zinc-400 mt-1">Crea, modifica ed elimina i progetti dal portfolio. Ottieni il feed RSS.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + '/api/rss.php');
                            alert('Link Feed RSS copiato negli appunti!');
                        }}
                        className="flex items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors w-full sm:w-auto"
                        title="Copia l'indirizzo del Feed RSS da dare ai distributori"
                    >
                        <ExternalLink size={18} />
                        <span>Copia RSS</span>
                    </button>
                    <Link
                        to="/admin/articles/new"
                        className="flex items-center justify-center gap-2 bg-dis-green text-black font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition-colors w-full sm:w-auto shadow-lg shadow-dis-green/20"
                    >
                        <Plus size={20} />
                        <span>Nuovo Articolo</span>
                    </Link>
                </div>
            </header>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Cerca nel titolo o nel testo..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-800 py-2 pl-9 pr-4 rounded-lg text-white text-sm placeholder-zinc-600 focus:outline-none focus:border-dis-green transition-colors"
                            />
                        </div>
                        
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <select 
                                value={category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-dis-green w-full md:w-40"
                            >
                                <option value="">Tutte le Categorie</option>
                                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                            </select>

                            <select 
                                value={tag}
                                onChange={(e) => handleFilterChange('tag', e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-dis-green w-full md:w-40"
                            >
                                <option value="">Tutti i Tag</option>
                                {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </select>

                            {hasFilters && (
                                <button 
                                    onClick={() => setSearchParams(new URLSearchParams())}
                                    className="p-2 text-zinc-500 hover:text-white transition-colors"
                                    title="Pulisci Filtri"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-zinc-800/50">
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Dal:</label>
                            <input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-dis-green [color-scheme:dark]"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Al:</label>
                            <input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded px-2 py-1 focus:outline-none focus:border-dis-green [color-scheme:dark]"
                            />
                        </div>
                        <div className="ml-auto text-[10px] text-zinc-600 font-medium italic">
                            Trovati {total} articoli
                        </div>
                    </div>
                </div>

                {/* [v1.26.0] Barra azioni multiple — compare solo con righe selezionate */}
                {selected.length > 0 && (
                    <div className="px-4 py-3 bg-dis-green/10 border-b border-dis-green/30 flex flex-wrap items-center gap-3 animate-in fade-in duration-200">
                        <span className="text-sm font-bold text-white">
                            {selected.length} selezionat{selected.length === 1 ? 'o' : 'i'}
                        </span>
                        <span className="text-[10px] text-zinc-400 italic">su questa pagina</span>

                        <div className="flex flex-wrap items-center gap-2 ml-auto">
                            <button
                                onClick={() => handleBulkStatus('published')}
                                disabled={bulkBusy}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-200 hover:border-dis-green hover:text-white transition-colors disabled:opacity-40"
                            >
                                <Eye size={14} /> Pubblica
                            </button>
                            <button
                                onClick={() => handleBulkStatus('draft')}
                                disabled={bulkBusy}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-200 hover:border-orange-400 hover:text-white transition-colors disabled:opacity-40"
                            >
                                <EyeOff size={14} /> Metti in bozza
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkBusy}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/40 rounded-lg text-xs font-bold text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors disabled:opacity-40"
                            >
                                {bulkBusy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Elimina
                            </button>
                            <button
                                onClick={() => setSelected([])}
                                disabled={bulkBusy}
                                className="p-1.5 text-zinc-500 hover:text-white transition-colors disabled:opacity-40"
                                title="Annulla selezione"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="bg-zinc-950/50 text-zinc-400 text-sm border-b border-zinc-800">
                                <th className="p-4 font-medium w-[4%]">
                                    <input
                                        type="checkbox"
                                        checked={allOnPageSelected}
                                        onChange={toggleSelectAll}
                                        disabled={articles.length === 0}
                                        className="w-4 h-4 accent-dis-green bg-zinc-900 border-zinc-700 rounded cursor-pointer"
                                        title="Seleziona tutti gli articoli di questa pagina"
                                    />
                                </th>
                                <th className="p-4 font-medium w-[27%]">Titolo</th>
                                <th className="p-4 font-medium w-[16%]">Categoria</th>
                                <th className="p-4 font-medium w-[11%]">Stato</th>
                                <th className="p-4 font-medium w-[12%]">Data</th>
                                <th className="p-4 font-medium w-[6%] text-center" title="Vetrina Homepage">★</th>
                                <th className="p-4 font-medium w-[6%] text-center" title="Articolo di Riferimento per la Categoria">📌</th>
                                <th className="p-4 font-medium w-[18%] text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-dis-green border-t-transparent rounded-full animate-spin" />
                                            <span className="text-zinc-500 text-sm font-medium">Sincronizzazione dati...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : articles.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                            <Filter size={32} className="text-zinc-600" />
                                            <span className="text-zinc-500 text-sm">Nessun articolo corrisponde ai filtri selezionati.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                articles.map(article => (
                                    <tr
                                        key={article.id}
                                        className={`hover:bg-zinc-800/30 transition-colors group ${selected.includes(article.id) ? 'bg-dis-green/5' : ''}`}
                                    >
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selected.includes(article.id)}
                                                onChange={() => toggleSelectOne(article.id)}
                                                className="w-4 h-4 accent-dis-green bg-zinc-900 border-zinc-700 rounded cursor-pointer"
                                                aria-label={`Seleziona ${article.title}`}
                                            />
                                        </td>
                                        <td className="p-4 min-w-0">
                                            <p className="font-medium text-white group-hover:text-dis-green transition-colors truncate">{article.title}</p>
                                            <p className="text-sm text-zinc-500 mt-1 truncate">{article.slug}</p>
                                        </td>
                                        <td className="p-4">
                                            <span 
                                                className="inline-flex items-center px-2 py-1 rounded border border-zinc-700 bg-zinc-800 text-dis-green text-xs font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-full shadow-sm"
                                                title={categories.find(c => c.slug === article.category)?.name || article.category}
                                            >
                                                {categories.find(c => c.slug === article.category)?.name || article.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {(() => {
                                                const isScheduled = article.status === 'published' && new Date(article.published_at) > new Date();
                                                const statusLabel = isScheduled ? 'Programmato' : (article.status === 'published' ? 'Pubblicato' : 'Bozza');
                                                const statusColor = isScheduled ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                    (article.status === 'published' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20');

                                                return (
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${statusColor}`}>
                                                        {statusLabel}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-4">
                                            {(() => {
                                                const isScheduled = article.status === 'published' && new Date(article.published_at) > new Date();
                                                const isDraft = article.status !== 'published';
                                                const dateValue = isDraft ? article.created_at : article.published_at;
                                                const dateLabel = isDraft ? 'Creato' : (isScheduled ? 'Sched.' : 'Pubbl.');
                                                const dateColor = isDraft ? 'text-zinc-500' : (isScheduled ? 'text-blue-400' : 'text-zinc-400');

                                                return (
                                                    <div className={`flex items-center gap-1.5 text-xs ${dateColor}`}>
                                                        <Calendar size={12} />
                                                        <span className="text-zinc-600 font-medium">{dateLabel}</span>
                                                        <span>{formatDate(dateValue)}</span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleToggleFeatured(article.id, article.is_featured)}
                                                className="transition-transform hover:scale-125 focus:outline-none focus:ring-0 active:scale-90"
                                                title={article.is_featured ? "Rimuovi dalla Vetrina Homepage" : "Aggiungi in Vetrina Homepage"}
                                            >
                                                {article.is_featured ? (
                                                    <span className="text-yellow-500 text-xl drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">★</span>
                                                ) : (
                                                    <span className="text-zinc-600 text-xl hover:text-yellow-500/50">☆</span>
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleToggleCategoryPin(article.id, article.category, article.is_category_pinned)}
                                                className="transition-transform hover:scale-125 focus:outline-none focus:ring-0 active:scale-90 flex items-center justify-center mx-auto"
                                                title={article.is_category_pinned ? "Rimuovi pin dalla Categoria" : "Fissa come Articolo di Riferimento della Categoria"}
                                            >
                                                {article.is_category_pinned ? (
                                                    <Pin size={16} className="text-dis-green drop-shadow-[0_0_6px_rgba(34,197,94,0.7)]" />
                                                ) : (
                                                    <PinOff size={16} className="text-zinc-600 hover:text-dis-green/50" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* [v1.26.0] Le bozze e gli articoli programmati non hanno una
                                                    URL pubblica: si aprono in anteprima, altrimenti darebbero 404. */}
                                                {(() => {
                                                    const isLive = article.status === 'published' && new Date(article.published_at) <= new Date();
                                                    const href = isLive
                                                        ? `/${article.category}/${article.slug}`
                                                        : `/${article.category}/${article.slug}?preview=1`;
                                                    return (
                                                        <a
                                                            href={href}
                                                            target="_blank"
                                                            /* niente 'noreferrer': servirebbe a poco e può
                                                               impedire l'invio del cookie SameSite=Strict
                                                               necessario all'anteprima delle bozze */
                                                            rel="noopener"
                                                            className={`p-2 hover:bg-zinc-800 rounded transition-colors ${isLive ? 'text-zinc-400 hover:text-blue-400' : 'text-orange-400/70 hover:text-orange-400'}`}
                                                            title={isLive ? 'Vedi sul sito' : 'Anteprima (non ancora pubblico)'}
                                                        >
                                                            <ExternalLink size={18} />
                                                        </a>
                                                    );
                                                })()}
                                                <Link to={`/admin/articles/edit/${article.id}`} className="p-2 text-zinc-400 hover:text-dis-green hover:bg-zinc-800 rounded transition-colors" title="Modifica">
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDuplicate(article.id, article.title)}
                                                    disabled={duplicatingId !== null}
                                                    className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded transition-colors disabled:opacity-40"
                                                    title="Duplica come bozza"
                                                >
                                                    {duplicatingId === article.id
                                                        ? <Loader2 size={18} className="animate-spin" />
                                                        : <Copy size={18} />}
                                                </button>
                                                <button onClick={() => handleDelete(article.id, article.title)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors" title="Elimina">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Control */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-zinc-800 bg-zinc-950/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-xs text-zinc-500">
                            Pagina <span className="text-white font-bold">{page}</span> di <span className="text-white font-bold">{totalPages}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(Math.max(1, page - 1))}
                                disabled={page === 1 || loading}
                                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs font-bold text-zinc-400 hover:text-white hover:border-dis-green disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-zinc-800 transition-all"
                            >
                                <ChevronLeft size={14} /> Precedente
                            </button>
                            
                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const p = i + 1;
                                    // Mostra solo alcune pagine se sono troppe
                                    if (totalPages > 7 && Math.abs(p - page) > 2 && p !== 1 && p !== totalPages) {
                                        if (p === 2 || p === totalPages - 1) return <span key={p} className="text-zinc-600 px-1">...</span>;
                                        return null;
                                    }
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`w-8 h-8 rounded text-xs font-bold transition-all ${page === p ? 'bg-dis-green text-black shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
 
                             <button
                                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages || loading}
                                className="flex items-center gap-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-xs font-bold text-zinc-400 hover:text-white hover:border-dis-green disabled:opacity-30 disabled:hover:text-zinc-400 disabled:hover:border-zinc-800 transition-all"
                            >
                                Successivo <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

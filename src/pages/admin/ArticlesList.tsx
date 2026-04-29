import { useEffect, useState } from 'react';
import { Link, useLoaderData, useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, ExternalLink, Calendar, ChevronLeft, ChevronRight, Filter, X, Pin, PinOff } from 'lucide-react';
import { api } from '../../api';
import { useCategories } from '../../hooks/useCategories';

export default function ArticlesList() {
    const { categories } = useCategories();
    const loaderData = useLoaderData() as { data: any[], total: number };
    const [searchParams, setSearchParams] = useSearchParams();
    
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

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="bg-zinc-950/50 text-zinc-400 text-sm border-b border-zinc-800">
                                <th className="p-4 font-medium w-[30%]">Titolo</th>
                                <th className="p-4 font-medium w-[17%]">Categoria</th>
                                <th className="p-4 font-medium w-[12%]">Stato</th>
                                <th className="p-4 font-medium w-[13%]">Data</th>
                                <th className="p-4 font-medium w-[7%] text-center" title="Vetrina Homepage">★</th>
                                <th className="p-4 font-medium w-[7%] text-center" title="Articolo di Riferimento per la Categoria">📌</th>
                                <th className="p-4 font-medium w-[14%] text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-dis-green border-t-transparent rounded-full animate-spin" />
                                            <span className="text-zinc-500 text-sm font-medium">Sincronizzazione dati...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : articles.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-40">
                                            <Filter size={32} className="text-zinc-600" />
                                            <span className="text-zinc-500 text-sm">Nessun articolo corrisponde ai filtri selezionati.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                articles.map(article => (
                                    <tr key={article.id} className="hover:bg-zinc-800/30 transition-colors group">
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
                                                <a href={`/${article.category}/${article.slug}`} target="_blank" rel="noreferrer" className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded transition-colors" title="Vedi Anteprima / Vedi sul sito">
                                                    <ExternalLink size={18} />
                                                </a>
                                                <Link to={`/admin/articles/edit/${article.id}`} className="p-2 text-zinc-400 hover:text-dis-green hover:bg-zinc-800 rounded transition-colors" title="Modifica">
                                                    <Edit2 size={18} />
                                                </Link>
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

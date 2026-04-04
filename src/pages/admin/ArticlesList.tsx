import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, ExternalLink, Calendar } from 'lucide-react';
import { api } from '../../api';

export default function ArticlesList() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('it-IT', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        setLoading(true);
        try {
            const data = await api.getArticles(undefined, true);
            setArticles(data);
        } catch (err) {
            console.error('Failed to load articles', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, title: string) => {
        if (!window.confirm(`Sei sicuro di voler eliminare "${title}"?`)) return;
        try {
            await api.deleteArticle(id);
            setArticles(articles.filter(a => a.id !== id));
        } catch (err) {
            alert('Errore eliminazione articolo');
        }
    };

    const handleToggleFeatured = async (id: number, currentStatus: number | boolean) => {
        const newStatus = currentStatus ? 0 : 1;

        // Optimistic UI Update per percezione di reattività immediata
        setArticles(articles.map(a => a.id === id ? { ...a, is_featured: newStatus } : a));

        try {
            await api.toggleFeatured(id, !!newStatus);
        } catch (err) {
            alert('Errore durante l\'aggiornamento dello stato vetrina sul server.');
            // Revert the pessimistic state back on error
            setArticles(articles.map(a => a.id === id ? { ...a, is_featured: currentStatus } : a));
        }
    };

    const filteredArticles = articles.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-zinc-800">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Cerca per titolo o categoria..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 py-2 pl-10 pr-4 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-dis-green"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="bg-zinc-950/50 text-zinc-400 text-sm border-b border-zinc-800">
                                <th className="p-4 font-medium">Titolo</th>
                                <th className="p-4 font-medium w-[160px]">Categoria</th>
                                <th className="p-4 font-medium w-[120px]">Stato</th>
                                <th className="p-4 font-medium w-[150px]">Data</th>
                                <th className="p-4 font-medium w-[70px]">Vetrina</th>
                                <th className="p-4 font-medium w-[110px] text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-zinc-500">
                                        Caricamento articoli in corso...
                                    </td>
                                </tr>
                            ) : filteredArticles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-zinc-500">
                                        Nessun articolo trovato.
                                    </td>
                                </tr>
                            ) : (
                                filteredArticles.map(article => (
                                    <tr key={article.id} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="p-4 min-w-0">
                                            <p className="font-medium text-white group-hover:text-dis-green transition-colors truncate">{article.title}</p>
                                            <p className="text-sm text-zinc-500 mt-1 truncate">{article.slug}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-medium">
                                                {article.category}
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
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleToggleFeatured(article.id, article.is_featured)}
                                                className="transition-transform hover:scale-125 focus:outline-none focus:ring-0 active:scale-90"
                                                title={article.is_featured ? "Rimuovi dalla Vetrina" : "Aggiungi in Vetrina"}
                                            >
                                                {article.is_featured ? (
                                                    <span className="text-yellow-500 text-xl drop-shadow-[0_0_8px_rgba(234,179,8,0.6)]">★</span>
                                                ) : (
                                                    <span className="text-zinc-600 text-xl hover:text-yellow-500/50">☆</span>
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
            </div>
        </div>
    );
}

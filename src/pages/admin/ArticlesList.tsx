import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, ExternalLink } from 'lucide-react';
import { api } from '../../api';

export default function ArticlesList() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        setLoading(true);
        try {
            const data = await api.getArticles();
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
                    <p className="text-zinc-400 mt-1">Crea, modifica ed elimina i progetti dal portfolio.</p>
                </div>
                <Link
                    to="/admin/articles/new"
                    className="flex items-center gap-2 bg-dis-green text-black font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition-colors"
                >
                    <Plus size={20} />
                    <span>Nuovo Articolo</span>
                </Link>
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
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-950/50 text-zinc-400 text-sm border-b border-zinc-800">
                                <th className="p-4 font-medium">Titolo</th>
                                <th className="p-4 font-medium">Categoria</th>
                                <th className="p-4 font-medium">Stato</th>
                                <th className="p-4 font-medium">Vetrina</th>
                                <th className="p-4 font-medium text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                                        Caricamento articoli in corso...
                                    </td>
                                </tr>
                            ) : filteredArticles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-zinc-500">
                                        Nessun articolo trovato.
                                    </td>
                                </tr>
                            ) : (
                                filteredArticles.map(article => (
                                    <tr key={article.id} className="hover:bg-zinc-800/30 transition-colors group">
                                        <td className="p-4">
                                            <p className="font-medium text-white group-hover:text-dis-green transition-colors">{article.title}</p>
                                            <p className="text-sm text-zinc-500 mt-1 max-w-md truncate">{article.slug}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs font-medium">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${article.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                                {article.status === 'published' ? 'Pubblicato' : 'Bozza'}
                                            </span>
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
                                                {article.status === 'published' && (
                                                    <a href={`#/${article.category}/${article.slug}`} target="_blank" rel="noreferrer" className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-zinc-800 rounded transition-colors" title="Vedi sul sito">
                                                        <ExternalLink size={18} />
                                                    </a>
                                                )}
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

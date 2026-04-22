import { useState, useEffect } from 'react';
import { Search, X, BookOpen, Layout, Loader2, ArrowRight, Link as LinkIcon, Globe, Check } from 'lucide-react';
import { api } from '../../api';

interface InternalLinkSelectorProps {
    onSelect: (url: string) => void;
    onClose: () => void;
}

interface LinkableItem {
    id: number;
    title: string;
    slug: string;
    category: string;
    type: 'article' | 'project';
}

type TabKey = 'internal' | 'manual';

export function InternalLinkSelector({ onSelect, onClose }: InternalLinkSelectorProps) {
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [manualUrl, setManualUrl] = useState('');
    const [items, setItems] = useState<LinkableItem[]>([]);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<TabKey>('internal');

    useEffect(() => {
        const loadItems = async () => {
            setLoading(true);
            try {
                // Fetch articoli (admin: true per avere tutto)
                const articlesData = await api.getArticles({ admin: true });
                
                // Fix: articlesData.data invece di articlesData.items
                const rawArticles = Array.isArray(articlesData) ? articlesData : (articlesData.data || articlesData.items || []);
                
                const mappedArticles: LinkableItem[] = rawArticles.map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    slug: a.slug,
                    category: a.category,
                    type: 'article'
                }));

                setItems(mappedArticles);
            } catch (err) {
                setError('Impossibile caricare i link interni.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadItems();

        // Close on Escape
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        
        // Bloque scroll body
        document.body.style.overflow = 'hidden';
        
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    const filteredItems = items.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (item: LinkableItem) => {
        // Pattern: /[categoria]/[slug]
        const url = `/${item.category}/${item.slug}`;
        onSelect(url);
    };

    const handleManualSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (manualUrl.trim()) {
            onSelect(manualUrl.trim());
        }
    };

    // Verifica se la ricerca sembra un URL per suggerimento rapido
    const looksLikeUrl = search.startsWith('http') || search.startsWith('/') || search.startsWith('www.');

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-dis-green/20 rounded-lg text-dis-green">
                            <LinkIcon size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-white tracking-tight leading-none">Gestione Link</h3>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Interni o Esterni</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-zinc-700"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-zinc-800 bg-zinc-950/30 p-1">
                    <button
                        onClick={() => setActiveTab('internal')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                            activeTab === 'internal' 
                            ? 'bg-zinc-800 text-dis-green shadow-inner border border-zinc-700' 
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                        }`}
                    >
                        <BookOpen size={16} />
                        Articoli
                    </button>
                    <button
                        onClick={() => setActiveTab('manual')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
                            activeTab === 'manual' 
                            ? 'bg-zinc-800 text-dis-green shadow-inner border border-zinc-700' 
                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                        }`}
                    >
                        <Globe size={16} />
                        URL Libero
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto max-h-[450px] p-4 bg-zinc-900/30">
                    {activeTab === 'internal' ? (
                        <div className="space-y-4">
                            {/* Search Box */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input
                                    autoFocus
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cerca per titolo o categoria..."
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-dis-green focus:ring-1 focus:ring-dis-green/20 transition-all font-medium text-sm"
                                />
                            </div>

                            {/* Quick Action Suggestion */}
                            {looksLikeUrl && (
                                <button
                                    onClick={() => onSelect(search)}
                                    className="w-full p-3 bg-dis-green/5 border border-dis-green/20 rounded-xl flex items-center justify-between group hover:bg-dis-green/10 transition-all animate-in slide-in-from-top-2"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-dis-green/20 rounded-lg text-dis-green">
                                            <Globe size={14} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-dis-green uppercase tracking-tighter">Usa come URL diretto</p>
                                            <p className="text-[10px] text-zinc-400 truncate max-w-[280px]">{search}</p>
                                        </div>
                                    </div>
                                    <Check size={16} className="text-dis-green opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            )}

                            {/* List */}
                            <div className="min-h-[200px]">
                                {loading && items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full gap-3 py-12 text-zinc-500">
                                        <Loader2 size={32} className="animate-spin text-dis-green" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Sincronizzazione contenuti...</p>
                                    </div>
                                ) : error ? (
                                    <div className="p-8 text-center text-red-400 text-sm font-medium bg-red-400/5 rounded-xl border border-red-400/10">
                                        {error}
                                    </div>
                                ) : filteredItems.length === 0 ? (
                                    <div className="py-12 text-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-950/20">
                                        <p className="text-zinc-500 text-sm">Nessun contenuto trovato</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredItems.map(item => (
                                            <button
                                                key={`${item.type}-${item.id}`}
                                                onClick={() => handleSelect(item)}
                                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800/80 group transition-all text-left border border-transparent hover:border-zinc-700 shadow-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-800 text-zinc-500 group-hover:text-dis-green group-hover:border-dis-green/30 transition-all">
                                                        {item.type === 'article' ? <BookOpen size={16} /> : <Layout size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors line-clamp-1">{item.title}</p>
                                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5 font-medium">{item.category}</p>
                                                    </div>
                                                </div>
                                                <div className="p-1 px-2.5 rounded-lg border border-transparent group-hover:border-dis-green/20 group-hover:bg-dis-green/10 text-zinc-700 group-hover:text-dis-green transition-all translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                                                    <ArrowRight size={14} />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleManualSubmit} className="space-y-6 flex flex-col items-center justify-center py-6 min-h-[250px]">
                            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center text-dis-green shadow-xl border border-zinc-700">
                                <Globe size={32} />
                            </div>
                            
                            <div className="w-full space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-black ml-1">Indirizzo URL</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={manualUrl}
                                        onChange={(e) => setManualUrl(e.target.value)}
                                        placeholder="https://esempio.it o /contatti"
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-white placeholder-zinc-700 focus:outline-none focus:border-dis-green focus:ring-1 focus:ring-dis-green/20 transition-all font-mono text-sm"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!manualUrl.trim()}
                                    className="w-full bg-dis-green text-black font-black uppercase tracking-widest py-3 rounded-xl hover:bg-green-400 transition-all shadow-lg shadow-dis-green/20 disabled:opacity-50 disabled:grayscale"
                                >
                                    Inserisci Link
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer Info */}
                <div className="p-4 bg-zinc-950/50 border-t border-zinc-800">
                    <div className="flex items-center justify-between gap-4">
                        <p className="text-[10px] text-zinc-600 uppercase tracking-tighter font-bold">
                            {activeTab === 'internal' ? 'Formato relativo: /categoria/slug' : 'Formato libero: http:// o /percorso'}
                        </p>
                        <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded uppercase font-bold">v2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

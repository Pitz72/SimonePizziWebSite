import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLoaderData } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, LayoutTemplate, X, Tag as TagIcon, Loader2, Check, Link as LinkIcon, Mail } from 'lucide-react';
import { api } from '../../api';
import { CategoryItem } from '../../types';
import { RichTextEditor } from '../../components/admin/RichTextEditor';
import { NavigationBlocker } from '../../components/admin/NavigationBlocker';

const getLocalDatetime = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
};

export default function ArticleEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;
    const { article, categories, tags: availableTags } = useLoaderData() as { article: any, categories: CategoryItem[], tags: any[] };

    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState('');
    const [btnAType, setBtnAType] = useState<'url' | 'email'>('url');
    const [btnBType, setBtnBType] = useState<'url' | 'email'>('url');
    const [initialData, setInitialData] = useState<any>(null);

    // Helper per mostrare le categorie indentate nel select
    const getHierarchicalCategories = (items: CategoryItem[]) => {
        const build = (parentId: number | null = null, level = 0): (CategoryItem & { display: string })[] => {
            let result: any[] = [];
            items
                .filter(c => (c.parent_id === parentId || (!c.parent_id && !parentId)))
                .sort((a, b) => a.sort_order - b.sort_order)
                .forEach(c => {
                    result.push({ ...c, display: level > 0 ? `${'—'.repeat(level)} ${c.name}` : c.name });
                    result = [...result, ...build(c.id, level + 1)];
                });
            return result;
        };
        return build();
    };

    const hierarchicalCategories = getHierarchicalCategories(categories);

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        cover_image: '',
        category: categories[0]?.slug || '',
        tags: [] as string[],
        is_featured: false,
        status: 'draft',
        published_at: getLocalDatetime(),
        button_a_label: '',
        button_a_link: '',
        button_b_label: '',
        button_b_link: ''
    });

    useEffect(() => {
        if (article) {
            const linkA = article.button_a_link || '';
            const linkB = article.button_b_link || '';
            
            if (linkA.startsWith('mailto:')) setBtnAType('email');
            if (linkB.startsWith('mailto:')) setBtnBType('email');

            const loadedData = {
                ...article,
                button_a_link: linkA.startsWith('mailto:') ? linkA.replace('mailto:', '') : linkA,
                button_b_link: linkB.startsWith('mailto:') ? linkB.replace('mailto:', '') : linkB,
                tags: article.tags ? (typeof article.tags === 'string' ? article.tags.split(',').map((t: string) => t.trim()) : article.tags) : [],
                is_featured: article.is_featured === 1 || article.is_featured === true,
                published_at: article.published_at ? article.published_at.replace(' ', 'T').slice(0, 16) : getLocalDatetime()
            };
            setFormData(loadedData);
            setInitialData(loadedData);
        } else {
            // Per i nuovi articoli, resettiamo lo stato iniziale
            const freshData = {
                ...formData,
                category: categories[0]?.slug || ''
            };
            setFormData(freshData);
            setInitialData(freshData);
        }
    }, [article, categories]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaveSuccess(false);
        setError('');

        try {
            const payload = {
                ...formData,
                button_a_link: btnAType === 'email' && formData.button_a_link ? `mailto:${formData.button_a_link.trim()}` : formData.button_a_link?.trim() || '',
                button_b_link: btnBType === 'email' && formData.button_b_link ? `mailto:${formData.button_b_link.trim()}` : formData.button_b_link?.trim() || '',
                is_featured: formData.is_featured ? 1 : 0,
                published_at: formData.published_at ? formData.published_at.replace('T', ' ') + ':00' : null
            };

            if (isEditing) {
                await api.updateArticle(Number(id), payload);
            } else {
                await api.createArticle(payload);
            }
            
            
            setSaveSuccess(true);
            setInitialData(formData); // Resetta lo stato dirty dopo il salvataggio
            
            setTimeout(() => {
                navigate('/admin/articles');
            }, 1200);
        } catch (err: any) {
            setError(err.message || 'Errore durante il salvataggio.');
            setSaving(false);
        }
    };

    // Calcolo stato Dirty
    const isDirty = !!(initialData && JSON.stringify(formData) !== JSON.stringify(initialData));

    // Blocco chiusura Tab/Browser
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);


    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 active-in fade-in duration-500 relative">
            <NavigationBlocker isDirty={isDirty && !saveSuccess} />
            <style>{`
                @keyframes pb-indeterminate {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            `}</style>
            
            {/* OVERLAY FEEDBACK SALVATAGGIO */}
            {(saving || saveSuccess) && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl w-full max-w-sm flex flex-col items-center gap-6 text-center overflow-hidden relative">
                        
                        {saveSuccess && <div className="absolute inset-0 bg-dis-green/5 animate-in fade-in duration-500 pointer-events-none" />}

                        {saveSuccess ? (
                            <div className="w-20 h-20 bg-dis-green/20 text-dis-green rounded-full flex items-center justify-center animate-in zoom-in duration-300 relative z-10">
                                <Check size={40} strokeWidth={3} />
                            </div>
                        ) : (
                            <div className="relative w-20 h-20 flex items-center justify-center z-10">
                                <div className="absolute inset-0 border-4 border-zinc-800 rounded-full" />
                                <div className="absolute inset-0 border-4 border-dis-green rounded-full border-t-transparent animate-spin" />
                                <Save size={24} className="text-dis-green animate-pulse" />
                            </div>
                        )}

                        <div className="space-y-2 relative z-10 w-full">
                            <h3 className="text-2xl font-bold text-white tracking-tight">
                                {saveSuccess ? 'Completato!' : 'Salvataggio in Corso'}
                            </h3>
                            <p className="text-sm text-zinc-400">
                                {saveSuccess 
                                    ? "Reindirizzamento all'archivio..." 
                                    : "Sincronizzazione in corso sul DB..."}
                            </p>
                        </div>

                        {/* Barra di Avanzamento Dinamica */}
                        <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden relative z-10 border border-zinc-800/50">
                            {saveSuccess ? (
                                <div className="absolute inset-0 bg-dis-green w-full transition-all duration-300 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            ) : (
                                <div className="absolute top-0 bottom-0 left-0 bg-dis-green w-1/3 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" style={{ animation: 'pb-indeterminate 1.5s infinite ease-in-out' }} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Link to="/admin/articles" className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-dis-green transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{isEditing ? 'Modifica Articolo' : 'Nuovo Articolo'}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">

                    <button
                        onClick={handleSave}
                        disabled={saving || saveSuccess}
                        className="flex items-center gap-2 bg-dis-green text-black font-bold px-5 py-2 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 min-w-[140px] justify-center"
                    >
                        {saving && !saveSuccess ? (
                            <><Loader2 size={18} className="animate-spin" /> In corso...</>
                        ) : saveSuccess ? (
                            <><Check size={18} /> Salvato</>
                        ) : (
                            <><Save size={18} /> Salva</>
                        )}
                    </button>
                </div>
            </header>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 font-medium">{error}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Editor Content (Left 2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Titolo Principale *</label>
                            <input
                                required
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="E.g., Il mio nuovo gioco fantastico"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-lg font-medium focus:border-dis-green focus:outline-none placeholder-zinc-700"
                            />
                        </div>

                        <div className="space-y-2 flex-1 flex flex-col">
                            <label className="text-sm font-medium text-zinc-300 flex justify-between">
                                Corpo dell'Articolo (Editor Visuale) *
                            </label>
                            <RichTextEditor
                                value={formData.content}
                                onChange={(val) => setFormData(prev => ({ ...prev, content: val }))}
                                className="h-[calc(100vh-300px)]"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Options (Right 1/3) */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Stato Pubblicazione</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-dis-green focus:outline-none"
                            >
                                <option value="draft">Bozza (Non visibile)</option>
                                <option value="published">Pubblicato (Live / Programmato)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Data e Ora di Pubblicazione</label>
                            <input
                                type="datetime-local"
                                name="published_at"
                                value={formData.published_at}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-dis-green focus:outline-none [color-scheme:dark]"
                            />
                            <p className="text-xs text-zinc-500">Imposta una data futura per programmare l'uscita dell'articolo.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300 flex justify-between items-center">
                                Copertina URL
                                <ImageIcon size={16} className="text-zinc-500" />
                            </label>
                            <input
                                name="cover_image"
                                value={formData.cover_image}
                                onChange={handleChange}
                                placeholder="/uploads/immagine.jpg"
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:border-dis-green focus:outline-none"
                            />
                            {formData.cover_image && (
                                <div className="mt-2 aspect-video bg-black rounded-lg overflow-hidden border border-zinc-800">
                                    <img src={formData.cover_image} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Categoria</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-dis-green focus:outline-none"
                            >
                                {hierarchicalCategories.map(c => <option key={c.id} value={c.slug}>{c.display}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2 pb-2">
                            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                <TagIcon size={16} />
                                Tag Dinamici (Premi Invio per aggiungere)
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {Array.isArray(formData.tags) && formData.tags.map((tag, i) => (
                                    <span key={i} className="flex items-center gap-1 bg-zinc-800 text-dis-green px-3 py-1.5 rounded-full text-sm border border-zinc-700">
                                        {tag}
                                        <button type="button" onClick={() => setFormData(prev => ({...prev, tags: (prev.tags as string[]).filter((_, idx) => idx !== i)}))} className="text-zinc-400 hover:text-white">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <input
                                type="text"
                                placeholder="Aggiungi un tag e premi Invio..."
                                list="available-tags"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const newTag = e.currentTarget.value.trim();
                                        if (newTag && !(formData.tags as string[]).includes(newTag)) {
                                            setFormData(prev => ({ ...prev, tags: [...(prev.tags as string[]), newTag] }));
                                        }
                                        e.currentTarget.value = '';
                                    }
                                }}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:border-dis-green focus:outline-none placeholder-zinc-700"
                            />
                            <datalist id="available-tags">
                                {availableTags.map(t => (
                                    <option key={t.id} value={t.name} />
                                ))}
                            </datalist>
                            <p className="text-xs text-zinc-500 mt-1">Se inserisci un tag nuovo non presente a sistema, verrà creato dinamicamente al salvataggio.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-300">Breve Riassunto (Excerpt)</label>
                            <textarea
                                name="excerpt"
                                value={formData.excerpt}
                                onChange={handleChange}
                                rows={3}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white text-sm focus:border-dis-green focus:outline-none resize-none"
                                placeholder="Un piccolo trafiletto introduttivo..."
                            />
                        </div>

                        <label className="flex items-center gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-lg cursor-pointer hover:border-dis-green/50 transition-colors">
                            <input
                                type="checkbox"
                                name="is_featured"
                                checked={formData.is_featured}
                                onChange={handleChange}
                                className="w-5 h-5 accent-dis-green bg-zinc-900 border-zinc-700 rounded"
                            />
                            <div>
                                <p className="text-sm font-bold text-white">Metti in Vetrina</p>
                                <p className="text-xs text-zinc-500">Mostra in evidenza come primo layout speciale della categoria.</p>
                            </div>
                        </label>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                            <LayoutTemplate size={16} className="text-dis-green" />
                            Call To Action (Bottoni)
                        </h3>

                        <div className="space-y-4">
                            {/* Bottone Primario */}
                            <div className="p-4 bg-dis-green/5 border border-dis-green/20 rounded-lg space-y-3 relative overflow-hidden">
                                <label className="text-xs font-black text-dis-green uppercase tracking-wider block relative z-10">Bottone Primario (Verde)</label>
                                <p className="text-xs text-zinc-400 mb-2 relative z-10">Usato per l'azione principale (Es: Vai GitHub, Contattami)</p>
                                <input name="button_a_label" value={formData.button_a_label} onChange={handleChange} placeholder="Testo Bottone (Es: VISITA SITO)" className="w-full bg-zinc-950/80 border border-dis-green/30 rounded-lg p-3 text-white text-sm focus:border-dis-green focus:outline-none relative z-10" />
                                
                                {/* Type Toggle & Link Input */}
                                <div className="space-y-2 relative z-10 mt-2">
                                    <div className="flex bg-zinc-950 border border-dis-green/20 rounded-lg p-1 w-max">
                                        <button type="button" onClick={() => setBtnAType('url')} className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${btnAType === 'url' ? 'bg-dis-green/20 text-dis-green' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                            <LinkIcon size={12} /> Web URL
                                        </button>
                                        <button type="button" onClick={() => setBtnAType('email')} className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${btnAType === 'email' ? 'bg-dis-green/20 text-dis-green' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                            <Mail size={12} /> E-Mail
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {btnAType === 'email' ? <Mail size={16} className="text-zinc-500" /> : <LinkIcon size={16} className="text-zinc-500" />}
                                        </div>
                                        <input 
                                            name="button_a_link" 
                                            type={btnAType === 'email' ? 'email' : 'text'}
                                            value={formData.button_a_link} 
                                            onChange={handleChange} 
                                            placeholder={btnAType === 'email' ? "indirizzo@email.com" : "https://..."} 
                                            className="w-full bg-zinc-950/80 border border-dis-green/30 rounded-lg p-3 pl-10 text-white text-sm focus:border-dis-green focus:outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Bottone Secondario */}
                            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3 relative overflow-hidden">
                                <label className="text-xs font-black text-zinc-300 uppercase tracking-wider block relative z-10">Bottone Secondario (Grigio)</label>
                                <p className="text-xs text-zinc-500 mb-2 relative z-10">Usato per materiale bonus o approfondimenti secondari.</p>
                                <input name="button_b_label" value={formData.button_b_label} onChange={handleChange} placeholder="Testo Bottone (Es: SCARICA MATERIALE)" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm focus:border-zinc-500 focus:outline-none relative z-10" />
                                
                                {/* Type Toggle & Link Input */}
                                <div className="space-y-2 relative z-10 mt-2">
                                    <div className="flex bg-black border border-zinc-700 rounded-lg p-1 w-max">
                                        <button type="button" onClick={() => setBtnBType('url')} className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${btnBType === 'url' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                            <LinkIcon size={12} /> Web URL
                                        </button>
                                        <button type="button" onClick={() => setBtnBType('email')} className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${btnBType === 'email' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                            <Mail size={12} /> E-Mail
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {btnBType === 'email' ? <Mail size={16} className="text-zinc-500" /> : <LinkIcon size={16} className="text-zinc-500" />}
                                        </div>
                                        <input 
                                            name="button_b_link" 
                                            type={btnBType === 'email' ? 'email' : 'text'}
                                            value={formData.button_b_link} 
                                            onChange={handleChange} 
                                            placeholder={btnBType === 'email' ? "indirizzo@email.com" : "https://..."} 
                                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 pl-10 text-white text-sm focus:border-zinc-500 focus:outline-none" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

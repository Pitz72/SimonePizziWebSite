import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, LayoutTemplate, X, Tag as TagIcon } from 'lucide-react';
import { api } from '../../api';
import { CategoryItem } from '../../types';
import { RichTextEditor } from '../../components/admin/RichTextEditor';

const getLocalDatetime = () => {
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
};

export default function ArticleEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [availableTags, setAvailableTags] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        content: '',
        cover_image: '',
        category: '',
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
        const init = async () => {
            try {
                const [cats, tags] = await Promise.all([api.getCategories(), api.getTags()]);
                setCategories(cats);
                setAvailableTags(tags);

                if (isEditing) {
                    const article = await api.getArticle(Number(id));
                    setFormData({
                        ...article,
                        tags: article.tags ? (typeof article.tags === 'string' ? article.tags.split(',').map((t: string) => t.trim()) : article.tags) : [],
                        is_featured: article.is_featured === 1 || article.is_featured === true,
                        published_at: article.published_at ? article.published_at.replace(' ', 'T').slice(0, 16) : getLocalDatetime()
                    });
                } else if (cats.length > 0) {
                    setFormData(prev => ({ ...prev, category: cats[0].slug }));
                }
            } catch (err: any) {
                setError('Impossibile caricare i dati: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [id, isEditing]);

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
        setError('');

        try {
            const payload = {
                ...formData,
                is_featured: formData.is_featured ? 1 : 0,
                published_at: formData.published_at ? formData.published_at.replace('T', ' ') + ':00' : null
            };

            if (isEditing) {
                await api.updateArticle(Number(id), payload);
            } else {
                await api.createArticle(payload);
            }
            navigate('/admin/articles');
        } catch (err: any) {
            setError(err.message || 'Errore durante il salvataggio.');
            setSaving(false);
        }
    };

    if (loading) return <div className="text-zinc-500 animate-pulse p-8">Caricamento editor...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20 active-in fade-in duration-500">
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
                        disabled={saving}
                        className="flex items-center gap-2 bg-dis-green text-black font-bold px-5 py-2 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Salvataggio...' : 'Salva'}
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
                                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
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
                            <div className="p-4 bg-dis-green/5 border border-dis-green/20 rounded-lg space-y-3">
                                <label className="text-xs font-black text-dis-green uppercase tracking-wider block">Bottone Primario (Verde)</label>
                                <p className="text-xs text-zinc-400 mb-2">Usato per l'azione principale (Es: Vai GitHub, Ascolta, ecc...)</p>
                                <input name="button_a_label" value={formData.button_a_label} onChange={handleChange} placeholder="Testo Bottone (Es: VISITA SITO)" className="w-full bg-zinc-950/80 border border-dis-green/30 rounded-lg p-3 text-white text-sm focus:border-dis-green focus:outline-none" />
                                <input name="button_a_link" value={formData.button_a_link} onChange={handleChange} placeholder="URL del link (Es: https://...)" className="w-full bg-zinc-950/80 border border-dis-green/30 rounded-lg p-3 text-white text-sm focus:border-dis-green focus:outline-none" />
                            </div>

                            {/* Bottone Secondario */}
                            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg space-y-3">
                                <label className="text-xs font-black text-zinc-300 uppercase tracking-wider block">Bottone Secondario (Grigio)</label>
                                <p className="text-xs text-zinc-500 mb-2">Usato per materiale bonus o approfondimenti secondari.</p>
                                <input name="button_b_label" value={formData.button_b_label} onChange={handleChange} placeholder="Testo Bottone (Es: SCARICA MATERIALE)" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white text-sm focus:border-zinc-500 focus:outline-none" />
                                <input name="button_b_link" value={formData.button_b_link} onChange={handleChange} placeholder="URL del link (Es: https://...)" className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white text-sm focus:border-zinc-500 focus:outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

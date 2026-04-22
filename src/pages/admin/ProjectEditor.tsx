import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, useLoaderData } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Check, Link as LinkIcon, Mail } from 'lucide-react';
import { NavigationBlocker } from '../../components/admin/NavigationBlocker';
import { api } from '../../api';
import { CategoryItem, Project } from '../../types';

interface FormData {
    name: string;
    category: string;
    description: string;
    cover_image: string;
    button_a_label: string;
    button_a_url: string;
    button_b_label: string;
    button_b_url: string;
    is_visible: boolean;
}

const EMPTY_FORM: FormData = {
    name: '',
    category: '', // Sarà impostata al caricamento delle categorie
    description: '',
    cover_image: '',
    button_a_label: 'Scopri',
    button_a_url: '',
    button_b_label: '',
    button_b_url: '',
    is_visible: true,
};

export default function ProjectEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const { project: projData, categories } = useLoaderData() as { project: Project | null, categories: CategoryItem[] };

    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState('');
    const [btnAType, setBtnAType] = useState<'url' | 'email'>('url');
    const [btnBType, setBtnBType] = useState<'url' | 'email'>('url');
    const [initialData, setInitialData] = useState<FormData | null>(null);

    useEffect(() => {
        if (projData) {
            if ((projData.button_a_url || '').startsWith('mailto:')) setBtnAType('email');
            if ((projData.button_b_url || '').startsWith('mailto:')) setBtnBType('email');

            const loadedForm = {
                name: projData.name || '',
                category: projData.category || '',
                description: projData.description || '',
                cover_image: projData.cover_image || '',
                button_a_label: projData.button_a_label || 'Scopri',
                button_a_url: (projData.button_a_url || '').startsWith('mailto:') ? (projData.button_a_url || '').replace('mailto:', '') : (projData.button_a_url || ''),
                button_b_label: projData.button_b_label || '',
                button_b_url: (projData.button_b_url || '').startsWith('mailto:') ? (projData.button_b_url || '').replace('mailto:', '') : (projData.button_b_url || ''),
                is_visible: Boolean(projData.is_visible),
            };
            setForm(loadedForm);
            setInitialData(loadedForm);
        } else if (categories.length > 0) {
            const newForm = { ...EMPTY_FORM, category: categories[0].slug };
            setForm(newForm);
            setInitialData(newForm);
        }
    }, [projData, categories]);

    const set = (field: keyof FormData, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Il nome è obbligatorio.'); return; }

        setSaving(true);
        setSaveSuccess(false);
        setError('');

        const payload = {
            ...form,
            button_a_url: btnAType === 'email' && form.button_a_url ? `mailto:${form.button_a_url.trim()}` : form.button_a_url.trim(),
            button_b_url: btnBType === 'email' && form.button_b_url ? `mailto:${form.button_b_url.trim()}` : form.button_b_url.trim(),
            is_visible: form.is_visible ? 1 : 0,
        };

        try {
            if (isEdit) {
                await api.updateProject(Number(id), payload);
            } else {
                await api.createProject(payload);
            }
            
            setSaveSuccess(true);
            setInitialData(form); // Reset dirty state
            setTimeout(() => {
                navigate('/admin/projects');
            }, 1200);
        } catch (e: any) {
            setError(e.message);
            setSaving(false);
        }
    };

    // Calcolo stato Dirty
    const isDirty = !!(initialData && JSON.stringify(form) !== JSON.stringify(initialData));

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
        <div className="max-w-2xl mx-auto relative">
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

            <div className="flex items-center gap-4 mb-8">
                <Link to="/admin/projects" className="text-zinc-400 hover:text-white transition-colors">
                    <ArrowLeft size={22} />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {isEdit ? 'Modifica Progetto' : 'Nuovo Progetto'}
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1">
                        {isEdit ? 'Aggiorna i dettagli del progetto' : 'Aggiungi un nuovo progetto alla lista pubblica'}
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-6 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Nome progetto *</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="Es. Cronache di Valemoor"
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-dis-green"
                        required
                    />
                </div>

                {/* Categoria */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Categoria *</label>
                    <select
                        value={form.category}
                        onChange={e => set('category', e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-dis-green"
                    >
                        {categories.map(c => (
                            <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                    </select>
                </div>

                {/* Descrizione */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">Descrizione</label>
                    <textarea
                        value={form.description}
                        onChange={e => set('description', e.target.value)}
                        rows={4}
                        placeholder="Breve descrizione del progetto..."
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-dis-green resize-none"
                    />
                </div>

                {/* Cover image */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-2">URL immagine di copertina</label>
                    <input
                        type="text"
                        value={form.cover_image}
                        onChange={e => set('cover_image', e.target.value)}
                        placeholder="/uploads/copertina-progetto.jpg"
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-dis-green"
                    />
                    {form.cover_image && (
                        <div className="mt-2">
                            <img
                                src={form.cover_image}
                                alt="Anteprima"
                                className="h-24 rounded-lg object-cover border border-zinc-700"
                                onError={e => (e.currentTarget.style.display = 'none')}
                            />
                        </div>
                    )}
                    <p className="text-zinc-600 text-xs mt-1">Puoi usare percorsi da Media Gallery (es. /uploads/...) o URL esterni.</p>
                </div>

                {/* Pulsante A */}
                <div className="border border-zinc-800 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-300">Pulsante principale</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Etichetta</label>
                            <input
                                type="text"
                                value={form.button_a_label}
                                onChange={e => set('button_a_label', e.target.value)}
                                placeholder="Scopri"
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-dis-green"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-end">
                                <label className="block text-xs text-zinc-500">Azione</label>
                                <div className="flex bg-zinc-800 border border-zinc-700/50 rounded-md p-1">
                                    <button type="button" onClick={() => setBtnAType('url')} className={`px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 transition-colors ${btnAType === 'url' ? 'bg-dis-green text-black' : 'text-zinc-400 hover:text-white'}`}>
                                        <LinkIcon size={10} /> Web
                                    </button>
                                    <button type="button" onClick={() => setBtnAType('email')} className={`px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 transition-colors ${btnAType === 'email' ? 'bg-dis-green text-black' : 'text-zinc-400 hover:text-white'}`}>
                                        <Mail size={10} /> Email
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                    {btnAType === 'email' ? <Mail size={14} className="text-zinc-500" /> : <LinkIcon size={14} className="text-zinc-500" />}
                                </div>
                                <input
                                    type={btnAType === 'email' ? 'email' : 'text'}
                                    value={form.button_a_url}
                                    onChange={e => set('button_a_url', e.target.value)}
                                    placeholder={btnAType === 'email' ? "indirizzo@email.com" : "https://..."}
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 pl-8 text-sm focus:outline-none focus:border-dis-green"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pulsante B */}
                <div className="border border-zinc-800 rounded-lg p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-300">Pulsante secondario <span className="text-zinc-600 font-normal">(opzionale)</span></h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">Etichetta</label>
                            <input
                                type="text"
                                value={form.button_b_label}
                                onChange={e => set('button_b_label', e.target.value)}
                                placeholder="Download"
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-dis-green"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-end">
                                <label className="block text-xs text-zinc-500">Azione</label>
                                <div className="flex bg-zinc-800 border border-zinc-700/50 rounded-md p-1">
                                    <button type="button" onClick={() => setBtnBType('url')} className={`px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 transition-colors ${btnBType === 'url' ? 'bg-zinc-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
                                        <LinkIcon size={10} /> Web
                                    </button>
                                    <button type="button" onClick={() => setBtnBType('email')} className={`px-2 py-0.5 text-[10px] font-bold rounded flex items-center gap-1 transition-colors ${btnBType === 'email' ? 'bg-zinc-600 text-white' : 'text-zinc-500 hover:text-white'}`}>
                                        <Mail size={10} /> Email
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                    {btnBType === 'email' ? <Mail size={14} className="text-zinc-500" /> : <LinkIcon size={14} className="text-zinc-500" />}
                                </div>
                                <input
                                    type={btnBType === 'email' ? 'email' : 'text'}
                                    value={form.button_b_url}
                                    onChange={e => set('button_b_url', e.target.value)}
                                    placeholder={btnBType === 'email' ? "indirizzo@email.com" : "https://..."}
                                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 pl-8 text-sm focus:outline-none focus:border-dis-green"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visibilità */}
                <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.is_visible}
                            onChange={e => set('is_visible', e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-10 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:bg-dis-green transition-colors" />
                        <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4" />
                    </label>
                    <span className="text-sm text-zinc-300">
                        {form.is_visible ? 'Visibile al pubblico' : 'Nascosto al pubblico'}
                    </span>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={saving || saveSuccess}
                        className="flex items-center gap-2 bg-dis-green text-black font-bold px-6 py-2.5 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 min-w-[170px] justify-center"
                    >
                        {saving && !saveSuccess ? (
                            <><Loader2 size={18} className="animate-spin" /> In corso...</>
                        ) : saveSuccess ? (
                            <><Check size={18} /> Salvato</>
                        ) : (
                            <><Save size={18} /> {isEdit ? 'Aggiorna Progetto' : 'Crea Progetto'}</>
                        )}
                    </button>
                    <Link to="/admin/projects" className="text-zinc-400 hover:text-white text-sm transition-colors">
                        Annulla
                    </Link>
                </div>
            </form>
        </div>
    );
}

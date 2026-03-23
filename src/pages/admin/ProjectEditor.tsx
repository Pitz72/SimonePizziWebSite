import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '../../api';
import { Category } from '../../types';

const CATEGORY_OPTIONS = [
    { value: Category.VIDEOGIOCHI, label: 'Videogiochi' },
    { value: Category.PROGETTI_SOFTWARE, label: 'Progetti Software' },
    { value: Category.NARRATIVA_E_PUBBLICAZIONI, label: 'Narrativa e Pubblicazioni' },
    { value: Category.PODCAST_AUDIO_ALTRO, label: 'Podcast, Audio e Altro' },
    { value: Category.BLOG_E_RIFLESSIONI, label: 'Blog e Riflessioni' },
];

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
    category: Category.PROGETTI_SOFTWARE,
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

    const [form, setForm] = useState<FormData>(EMPTY_FORM);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isEdit) return;
        api.getProject(Number(id))
            .then((p: any) => {
                setForm({
                    name: p.name || '',
                    category: p.category || Category.PROGETTI_SOFTWARE,
                    description: p.description || '',
                    cover_image: p.cover_image || '',
                    button_a_label: p.button_a_label || 'Scopri',
                    button_a_url: p.button_a_url || '',
                    button_b_label: p.button_b_label || '',
                    button_b_url: p.button_b_url || '',
                    is_visible: Boolean(p.is_visible),
                });
            })
            .catch(e => setError('Errore caricamento: ' + e.message))
            .finally(() => setLoading(false));
    }, [id, isEdit]);

    const set = (field: keyof FormData, value: string | boolean) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) { setError('Il nome è obbligatorio.'); return; }

        setSaving(true);
        setError('');

        const payload = {
            ...form,
            is_visible: form.is_visible ? 1 : 0,
        };

        try {
            if (isEdit) {
                await api.updateProject(Number(id), payload);
            } else {
                await api.createProject(payload);
            }
            navigate('/admin/projects');
        } catch (e: any) {
            setError(e.message);
            setSaving(false);
        }
    };

    if (loading) return <p className="text-zinc-400">Caricamento progetto...</p>;

    return (
        <div className="max-w-2xl mx-auto">
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
                        {CATEGORY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
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
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">URL / Percorso</label>
                            <input
                                type="text"
                                value={form.button_a_url}
                                onChange={e => set('button_a_url', e.target.value)}
                                placeholder="https://... o /categoria/slug"
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-dis-green"
                            />
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
                        <div>
                            <label className="block text-xs text-zinc-500 mb-1">URL / Percorso</label>
                            <input
                                type="text"
                                value={form.button_b_url}
                                onChange={e => set('button_b_url', e.target.value)}
                                placeholder="https://... o /uploads/file.zip"
                                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-dis-green"
                            />
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
                        disabled={saving}
                        className="flex items-center gap-2 bg-dis-green text-black font-bold px-6 py-2.5 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Salvataggio...' : isEdit ? 'Aggiorna Progetto' : 'Crea Progetto'}
                    </button>
                    <Link to="/admin/projects" className="text-zinc-400 hover:text-white text-sm transition-colors">
                        Annulla
                    </Link>
                </div>
            </form>
        </div>
    );
}

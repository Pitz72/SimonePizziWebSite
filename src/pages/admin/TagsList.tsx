import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { api } from '../../api';

export default function TagsList() {
    const [tags, setTags] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            const data = await api.getTags();
            setTags(data);
        } catch {
            setError('Errore caricamento tags.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

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
        if (!confirm(`Eliminare il tag "${tag.name}"? Verrà slegato da tutti gli articoli che ne fanno uso.`)) return;
        try {
            await api.deleteTag(tag.id);
            await load();
        } catch (e: any) {
            setError(e.message);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-dis-green"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white">Tag Dinamici</h1>
                <p className="text-zinc-400 mt-2">Crea, rinomina o elimina i tag utilizzati all'interno degli articoli.</p>
            </header>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X size={16} /></button>
                </div>
            )}

            {/* Elenco Tags */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800">
                    <h2 className="text-white font-semibold flex items-baseline gap-2">
                        Lista Tag <span className="bg-dis-green/10 text-dis-green px-2 py-0.5 rounded-full text-xs">{tags.length} TOTALI</span>
                    </h2>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                    <ul className="divide-y divide-zinc-800">
                        {tags.map((tag) => (
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
                                    <div className="flex-1 flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-medium">{tag.name}</p>
                                            <p className="text-zinc-500 text-xs font-mono mt-0.5">#{tag.slug}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => startEdit(tag)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg">
                                                <Pencil size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(tag)} className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg">
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

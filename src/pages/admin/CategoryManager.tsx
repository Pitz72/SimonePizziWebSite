import { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import { Plus, Pencil, Trash2, Check, X, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '../../api';
import { CategoryItem } from '../../types';

export default function CategoryManager() {
    const initialCategories = useLoaderData() as CategoryItem[];
    const [categories, setCategories] = useState<CategoryItem[]>(initialCategories || []);
    const [error, setError] = useState<string | null>(null);

    // Stato form nuova categoria
    const [newName, setNewName] = useState('');
    const [newSlug, setNewSlug] = useState('');
    const [newParentId, setNewParentId] = useState<number | null>(null);
    const [creating, setCreating] = useState(false);

    // Stato modifica inline
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const [editParentId, setEditParentId] = useState<number | null>(null);

    // Costruisce l'albero per la visualizzazione gerarchica
    const buildTree = (items: CategoryItem[], parentId: number | null = null): CategoryItem[] => {
        return items
            .filter(c => (c.parent_id === parentId || (!c.parent_id && !parentId)))
            .map(c => ({
                ...c,
                subcategories: buildTree(items, c.id)
            }));
    };

    // Appiattisce l'albero per il rendering sequenziale con indentazione
    const flattenTree = (tree: CategoryItem[], level = 0): (CategoryItem & { level: number })[] => {
        let result: (CategoryItem & { level: number })[] = [];
        tree.forEach(node => {
            result.push({ ...node, level });
            if (node.subcategories) {
                result = [...result, ...flattenTree(node.subcategories, level + 1)];
            }
        });
        return result;
    };

    const displayList = flattenTree(buildTree(categories));

    const load = async () => {
        try {
            const data = await api.getCategories();
            setCategories(data);
        } catch {
            setError('Errore caricamento categorie.');
        }
    };

    useEffect(() => {
        if (initialCategories) {
            setCategories(initialCategories);
        }
    }, [initialCategories]);

    // Auto-genera slug dal nome (solo per la creazione)
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
            await api.createCategory({ 
                name: newName.trim(), 
                slug: newSlug.trim(),
                parent_id: newParentId 
            });
            setNewName('');
            setNewSlug('');
            setNewParentId(null);
            await load();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setCreating(false);
        }
    };

    const startEdit = (cat: CategoryItem) => {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditSlug(cat.slug);
        setEditParentId(cat.parent_id || null);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
        setEditSlug('');
        setEditParentId(null);
    };

    const saveEdit = async (cat: CategoryItem) => {
        if (!editName.trim() || !editSlug.trim()) return;
        try {
            await api.updateCategory(cat.id, { 
                name: editName.trim(), 
                slug: editSlug.trim(), 
                sort_order: cat.sort_order,
                parent_id: editParentId
            });
            cancelEdit();
            await load();
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleDelete = async (cat: CategoryItem) => {
        if (!confirm(`Eliminare la categoria "${cat.name}"?\n\nATTENZIONE: gli articoli con questa categoria non verranno cancellati, ma la categoria non sarà più visibile nel menu di navigazione.`)) return;
        try {
            await api.deleteCategory(cat.id);
            await load();
        } catch (e: any) {
            setError(e.message);
        }
    };

    const moveOrder = async (index: number, direction: 'up' | 'down') => {
        const newList = [...categories];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newList.length) return;

        [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]];

        // Aggiorna sort_order locale e salva entrambe le categorie
        const updated = newList.map((c, i) => ({ ...c, sort_order: i + 1 }));
        setCategories(updated);

        try {
            await api.updateCategory(updated[index].id, { name: updated[index].name, slug: updated[index].slug, sort_order: updated[index].sort_order });
            await api.updateCategory(updated[swapIndex].id, { name: updated[swapIndex].name, slug: updated[swapIndex].slug, sort_order: updated[swapIndex].sort_order });
        } catch {
            await load(); // Ripristina in caso di errore
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white">Gestione Categorie</h1>
                <p className="text-zinc-400 mt-2">Crea, rinomina o elimina le categorie del sito. L'ordine determina la posizione nel menu di navigazione.</p>
            </header>

            {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError(null)}><X size={16} /></button>
                </div>
            )}

            {/* Elenco Categorie */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-800">
                    <h2 className="text-white font-semibold">Categorie Attive ({categories.length})</h2>
                </div>
                <ul className="divide-y divide-zinc-800">
                    {displayList.map((cat) => (
                        <li 
                            key={cat.id} 
                            className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
                            style={{ paddingLeft: `${1.5 + (cat.level * 2)}rem` }}
                        >
                            {/* Pulsanti Ordine */}
                            <div className="flex flex-col gap-0.5">
                                <button
                                    onClick={() => moveOrder(categories.findIndex(c => c.id === cat.id), 'up')}
                                    disabled={categories.findIndex(c => c.id === cat.id) === 0}
                                    className="p-1 text-zinc-600 hover:text-white disabled:opacity-20 transition-colors"
                                    title="Sposta su"
                                >
                                    <ArrowUp size={14} />
                                </button>
                                <button
                                    onClick={() => moveOrder(categories.findIndex(c => c.id === cat.id), 'down')}
                                    disabled={categories.findIndex(c => c.id === cat.id) === categories.length - 1}
                                    className="p-1 text-zinc-600 hover:text-white disabled:opacity-20 transition-colors"
                                    title="Sposta giù"
                                >
                                    <ArrowDown size={14} />
                                </button>
                            </div>

                            {editingId === cat.id ? (
                                // Modalità modifica
                                <div className="flex-1 flex flex-col sm:flex-row gap-2 items-end">
                                    <div className="flex-1 w-full space-y-1">
                                        <label className="text-[10px] text-zinc-500 uppercase font-bold">Nome</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            placeholder="Nome categoria"
                                            className="w-full bg-zinc-800 border border-zinc-600 text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-dis-green"
                                        />
                                    </div>
                                    <div className="flex-1 w-full space-y-1">
                                        <label className="text-[10px] text-zinc-500 uppercase font-bold">Slug</label>
                                        <input
                                            type="text"
                                            value={editSlug}
                                            onChange={e => setEditSlug(e.target.value)}
                                            placeholder="slug-url"
                                            className="w-full bg-zinc-800 border border-zinc-600 text-zinc-300 font-mono px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-dis-green"
                                        />
                                    </div>
                                    <div className="flex-1 w-full space-y-1">
                                        <label className="text-[10px] text-zinc-500 uppercase font-bold">Padre</label>
                                        <select
                                            value={editParentId || ''}
                                            onChange={e => setEditParentId(e.target.value ? Number(e.target.value) : null)}
                                            className="w-full bg-zinc-800 border border-zinc-600 text-white px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:border-dis-green"
                                        >
                                            <option value="">Nessuno (Principale)</option>
                                            {categories
                                                .filter(c => c.id !== cat.id) // Non può essere padre di se stesso
                                                .map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="flex gap-2 pb-0.5">
                                        <button
                                            onClick={() => saveEdit(cat)}
                                            className="p-2 bg-dis-green/10 border border-dis-green/30 text-dis-green rounded-lg hover:bg-dis-green/20 transition-colors"
                                            title="Salva"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="p-2 bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-lg hover:text-white transition-colors"
                                            title="Annulla"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Modalità visualizzazione
                                <div className="flex-1 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {cat.level > 0 && <div className="w-4 h-px bg-zinc-700" />}
                                        <div>
                                            <p className="text-white font-medium flex items-center gap-2">
                                                {cat.name}
                                                {cat.level > 0 && <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-700 uppercase">Sotto</span>}
                                            </p>
                                            <p className="text-zinc-500 text-xs font-mono mt-0.5">/{cat.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEdit(cat)}
                                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                            title="Modifica"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat)}
                                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="Elimina"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Form Nuova Categoria */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-white font-semibold mb-4">Aggiungi Nuova Categoria</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="flex-1">
                        <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Nome visualizzato</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={e => handleNameChange(e.target.value)}
                            placeholder="es. Musica e Podcast"
                            className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-dis-green"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Slug URL (auto-generato)</label>
                        <input
                            type="text"
                            value={newSlug}
                            onChange={e => setNewSlug(e.target.value)}
                            placeholder="musica-e-podcast"
                            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-dis-green"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-zinc-500 mb-1 uppercase tracking-wider">Categoria Genitore</label>
                        <select
                            value={newParentId || ''}
                            onChange={e => setNewParentId(e.target.value ? Number(e.target.value) : null)}
                            className="w-full bg-zinc-800 border border-zinc-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-dis-green"
                        >
                            <option value="">Nessuna (Principale)</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={handleCreate}
                            disabled={creating || !newName.trim() || !newSlug.trim()}
                            className="w-full flex items-center justify-center gap-2 px-5 py-2 bg-dis-green text-black font-bold rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            <Plus size={16} />
                            {creating ? 'Aggiunta...' : 'Aggiungi'}
                        </button>
                    </div>
                </div>
                <p className="text-zinc-600 text-xs mt-3">
                    Lo slug diventerà il percorso URL della categoria (es. /musica-e-podcast). Una volta pubblicato, cambiarlo romperà i link esistenti.
                </p>
            </div>
        </div>
    );
}

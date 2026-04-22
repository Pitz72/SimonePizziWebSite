import { useEffect, useState } from 'react';
import { Link, useLoaderData, useSearchParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { api } from '../../api';
import { Project, CategoryItem } from '../../types';

export default function ProjectsList() {
    const loaderData = useLoaderData() as { projects: Project[], categories: CategoryItem[] };
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [projects, setProjects] = useState<Project[]>(loaderData.projects || []);
    const categories = loaderData.categories || [];
    
    const filterCategory = searchParams.get('category') || '';

    useEffect(() => {
        if (loaderData.projects) {
            setProjects(loaderData.projects);
        }
    }, [loaderData.projects]);

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Eliminare il progetto "${name}"? L'operazione è irreversibile.`)) return;
        try {
            await api.deleteProject(id);
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (e: any) {
            alert('Errore eliminazione: ' + e.message);
        }
    };

    const handleToggleVisibility = async (project: Project) => {
        try {
            await api.patchProject(project.id, { is_visible: project.is_visible ? 0 : 1 });
            setProjects(prev => prev.map(p => p.id === project.id ? { ...p, is_visible: p.is_visible ? 0 : 1 } : p));
        } catch (e: any) {
            alert('Errore visibilità: ' + e.message);
        }
    };

    const handleMove = async (project: Project, direction: 'up' | 'down') => {
        const categoryProjects = projects
            .filter(p => p.category === project.category)
            .sort((a, b) => a.sort_order - b.sort_order);

        const idx = categoryProjects.findIndex(p => p.id === project.id);
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= categoryProjects.length) return;

        const other = categoryProjects[swapIdx];
        const newOrderA = other.sort_order;
        const newOrderB = project.sort_order;

        try {
            await Promise.all([
                api.patchProject(project.id, { sort_order: newOrderA }),
                api.patchProject(other.id, { sort_order: newOrderB }),
            ]);
            setProjects(prev => prev.map(p => {
                if (p.id === project.id) return { ...p, sort_order: newOrderA };
                if (p.id === other.id) return { ...p, sort_order: newOrderB };
                return p;
            }));
        } catch (e: any) {
            alert('Errore riordinamento: ' + e.message);
        }
    };

    // Raggruppa per categoria nell'ordine definito dal database
    const grouped: { cat: CategoryItem, projects: Project[] }[] = [];
    
    categories.forEach(cat => {
        const catProjects = projects
            .filter(p => p.category === cat.slug)
            .sort((a, b) => a.sort_order - b.sort_order);
        
        // Se c'è un filtro attivo, mostriamo solo quella categoria. 
        // Altrimenti mostriamo tutte le categorie che hanno progetti.
        if (filterCategory === cat.slug || (!filterCategory && catProjects.length > 0)) {
            grouped.push({ cat, projects: catProjects });
        }
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Tutti i Progetti</h1>
                    <p className="text-zinc-400 mt-1 text-sm">Gestisci i progetti pubblici per categoria</p>
                </div>
                <Link
                    to="/admin/projects/new"
                    className="flex items-center gap-2 bg-dis-green text-black font-bold px-4 py-2 rounded-lg hover:bg-green-400 transition-colors"
                >
                    <Plus size={18} /> Nuovo Progetto
                </Link>
            </div>

            {/* Filtro categoria */}
            <div className="mb-6">
                <select
                    value={filterCategory}
                    onChange={e => {
                        const val = e.target.value;
                        setSearchParams(prev => {
                            if (val) prev.set('category', val);
                            else prev.delete('category');
                            return prev;
                        });
                    }}
                    className="bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-dis-green"
                >
                    <option value="">Tutte le categorie</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.slug}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {grouped.map(({ cat, projects: catProjects }) => (
                <div key={cat.id} className="mb-8">
                    <h2 className="text-lg font-semibold text-dis-green border-b border-zinc-800 pb-2 mb-4">
                        {cat.name} <span className="text-zinc-500 text-sm font-normal">({catProjects.length})</span>
                    </h2>

                    {catProjects.length === 0 ? (
                        <p className="text-zinc-600 text-sm italic">Nessun progetto in questa categoria.</p>
                    ) : (
                        <div className="space-y-2">
                            {catProjects.map((project, idx) => (
                                <div
                                    key={project.id}
                                    className={`flex items-center gap-4 bg-zinc-900 border rounded-lg px-4 py-3 transition-colors ${project.is_visible ? 'border-zinc-800' : 'border-zinc-800/40 opacity-60'}`}
                                >
                                    {/* Cover thumbnail */}
                                    {project.cover_image ? (
                                        <img
                                            src={project.cover_image}
                                            alt={project.name}
                                            className="w-14 h-10 object-cover rounded flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-14 h-10 bg-zinc-800 rounded flex-shrink-0" />
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{project.name}</p>
                                        {project.description && (
                                            <p className="text-zinc-500 text-xs truncate">{project.description}</p>
                                        )}
                                    </div>

                                    {/* Sort controls */}
                                    <div className="flex flex-col gap-0.5">
                                        <button
                                            onClick={() => handleMove(project, 'up')}
                                            disabled={idx === 0}
                                            className="text-zinc-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleMove(project, 'down')}
                                            disabled={idx === catProjects.length - 1}
                                            className="text-zinc-500 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleVisibility(project)}
                                            title={project.is_visible ? 'Nascondi' : 'Mostra'}
                                            className="text-zinc-500 hover:text-yellow-400 transition-colors p-1"
                                        >
                                            {project.is_visible ? <Eye size={17} /> : <EyeOff size={17} />}
                                        </button>
                                        <Link
                                            to={`/admin/projects/edit/${project.id}`}
                                            className="text-zinc-500 hover:text-blue-400 transition-colors p-1"
                                            title="Modifica"
                                        >
                                            <Pencil size={17} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(project.id, project.name)}
                                            className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                                            title="Elimina"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

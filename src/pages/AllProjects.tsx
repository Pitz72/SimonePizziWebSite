import React from 'react';
import { useLoaderData, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Project, CategoryItem } from '../types';
import SEO from '../components/SEO';

// Determina il tipo di URL per il rendering del pulsante
function detectUrlType(url: string): 'external' | 'download' | 'internal' {
    if (url.startsWith('http://') || url.startsWith('https://')) return 'external';
    if (url.startsWith('/uploads/') || url.match(/\.(zip|pdf|exe|dmg|rar|7z|tar|gz)$/i)) return 'download';
    return 'internal';
}

interface ProjectButtonProps {
    label: string;
    url: string;
    variant?: 'primary' | 'secondary';
}

const ProjectButton: React.FC<ProjectButtonProps> = ({ label, url, variant = 'primary' }) => {
    const type = detectUrlType(url);

    const baseClass = variant === 'primary'
        ? 'inline-flex items-center gap-2 bg-green-500 text-black font-bold text-xs px-4 py-2 rounded-lg hover:bg-green-400 transition-all duration-200 shadow-lg shadow-green-500/20'
        : 'inline-flex items-center gap-2 border border-zinc-600 text-zinc-300 font-medium text-xs px-4 py-2 rounded-lg hover:border-zinc-400 hover:text-white transition-all duration-200';

    if (type === 'external') {
        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className={baseClass}>
                {label}
            </a>
        );
    }
    if (type === 'download') {
        return (
            <a href={url} download className={baseClass}>
                {label}
            </a>
        );
    }
    return (
        <Link to={url} className={baseClass}>
            {label}
        </Link>
    );
};

const ProjectCard: React.FC<{ project: Project; index: number }> = ({ project, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="group relative w-full rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:shadow-xl hover:shadow-black/40"
        >
            {project.cover_image ? (
                /* Card con immagine: layout flex-col → immagine + pannello testo separato */
                <div className="flex flex-col">
                    {/* Immagine con titolo sovrapposto */}
                    <div className="relative overflow-hidden flex-shrink-0">
                        <img
                            src={project.cover_image}
                            alt={project.name}
                            className="w-full h-48 sm:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {/* Gradiente scuro sul 60% inferiore dell'immagine per leggibilità titolo */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                        {/* Titolo sovrapposto — solo il titolo, non la descrizione */}
                        <div className="absolute bottom-0 left-0 right-0 px-5 py-4">
                            <h3 className="text-white font-bold text-lg sm:text-xl leading-tight drop-shadow-lg">
                                {project.name}
                            </h3>
                        </div>
                    </div>
                    {/* Pannello testo e pulsanti — fuori dall'immagine, in flusso normale */}
                    <div className="bg-zinc-950 px-5 py-4 flex flex-col gap-4">
                        {project.description && (
                            <p className="text-zinc-300 text-sm leading-relaxed">
                                {project.description}
                            </p>
                        )}
                        {(project.button_a_url || project.button_b_url) && (
                            <div className="flex flex-col sm:flex-row gap-2">
                                {project.button_a_url && project.button_a_label && (
                                    <ProjectButton label={project.button_a_label} url={project.button_a_url} variant="primary" />
                                )}
                                {project.button_b_url && project.button_b_label && (
                                    <ProjectButton label={project.button_b_label} url={project.button_b_url} variant="secondary" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                /* Card senza immagine: sfondo solido */
                <div className="bg-zinc-900 p-5">
                    <h3 className="text-white font-bold text-xl mb-2 leading-tight">{project.name}</h3>
                    {project.description && (
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4">{project.description}</p>
                    )}
                    {(project.button_a_url || project.button_b_url) && (
                        <div className="flex flex-col sm:flex-row gap-2">
                            {project.button_a_url && project.button_a_label && (
                                <ProjectButton label={project.button_a_label} url={project.button_a_url} variant="primary" />
                            )}
                            {project.button_b_url && project.button_b_label && (
                                <ProjectButton label={project.button_b_label} url={project.button_b_url} variant="secondary" />
                            )}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default function AllProjects() {
    const { projects, categories: categoryList } = useLoaderData() as { projects: Project[], categories: CategoryItem[] };

    const getProjectsByCategory = (catSlug: string) =>
        projects.filter(p => p.category === catSlug).sort((a, b) => a.sort_order - b.sort_order);

    // Costruisce l'albero per la visualizzazione gerarchica
    const buildTree = (items: CategoryItem[], parentId: number | null = null): CategoryItem[] => {
        return items
            .filter(c => (c.parent_id === parentId || (!c.parent_id && !parentId)))
            .map(c => ({
                ...c,
                subcategories: buildTree(items, c.id)
            }));
    };

    const categoryTree = buildTree(categoryList);

    const renderCategory = (cat: CategoryItem, level: number = 0) => {
        const catProjects = getProjectsByCategory(cat.slug);
        const subTree = cat.subcategories || [];
        const hasProjects = catProjects.length > 0;
        const hasChildrenWithContent = subTree.some(sub => getProjectsByCategory(sub.slug).length > 0 || (sub.subcategories && sub.subcategories.length > 0));

        if (!hasProjects && !hasChildrenWithContent) return null;

        return (
            <section key={cat.id} className={level > 0 ? 'mt-12' : ''}>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`flex items-center gap-4 ${level === 0 ? 'mb-8' : 'mb-6'}`}
                >
                    <h2 className={`${level === 0 ? 'text-xl md:text-2xl font-bold' : 'text-lg md:text-xl font-semibold opacity-80'} text-green-400 flex items-center gap-3`}>
                        {level > 0 && <span className="w-6 h-px bg-green-500/30" />}
                        {cat.name}
                    </h2>
                    <div className="flex-1 h-px bg-gradient-to-r from-green-500/20 to-transparent" />
                </motion.div>

                <div className={`flex flex-col gap-5 ${level > 0 ? 'ml-6 md:ml-10 border-l border-zinc-800/50 pl-6' : ''}`}>
                    {hasProjects && catProjects.map((project, idx) => (
                        <ProjectCard key={project.id} project={project} index={idx} />
                    ))}
                    
                    {subTree.length > 0 && subTree.map(sub => renderCategory(sub, level + 1))}
                </div>
            </section>
        );
    };

    return (
        <>
            <SEO
                title="Tutti i Progetti"
                description="Panoramica di tutti i progetti di Simone Pizzi: videogiochi, software, narrativa, podcast e riflessioni."
            />
            <div className="max-w-6xl mx-auto py-16">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Tutti i Progetti
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Una panoramica ordinata di tutto quello che ho creato: videogiochi, software, narrativa, podcast e molto altro.
                    </p>
                </motion.div>

                <div className="space-y-20">
                        {categoryTree.map((cat) => renderCategory(cat))}

                        {projects.length === 0 && (
                            <p className="text-center text-zinc-600 py-20">Nessun progetto disponibile al momento.</p>
                        )}
                </div>
            </div>
        </>
    );
}

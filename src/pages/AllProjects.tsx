import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api';
import { Project, Category } from '../types';
import SEO from '../components/SEO';

const CATEGORIES: { key: Category; label: string }[] = [
    { key: Category.VIDEOGIOCHI, label: 'Videogiochi' },
    { key: Category.PROGETTI_SOFTWARE, label: 'Progetti Software' },
    { key: Category.NARRATIVA_E_PUBBLICAZIONI, label: 'Narrativa e Pubblicazioni' },
    { key: Category.PODCAST_AUDIO_ALTRO, label: 'Podcast, Audio e Altro' },
    { key: Category.BLOG_E_RIFLESSIONI, label: 'Blog e Riflessioni' },
];

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
                /* Card con immagine: immagine full-width che sfuma verso il testo in basso */
                <div className="relative">
                    <img
                        src={project.cover_image}
                        alt={project.name}
                        className="w-full h-56 sm:h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradiente che copre la metà inferiore dell'immagine e si estende nel testo */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />

                    {/* Testo sovrapposto in basso sull'immagine sfumata */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-white font-bold text-xl mb-2 leading-tight drop-shadow">{project.name}</h3>
                        {project.description && (
                            <p className="text-zinc-300 text-sm leading-relaxed mb-4 max-w-3xl">{project.description}</p>
                        )}
                        {(project.button_a_url || project.button_b_url) && (
                            <div className="flex flex-wrap gap-2">
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
                /* Card senza immagine: sfondo solido con testo */
                <div className="bg-zinc-900 p-6">
                    <h3 className="text-white font-bold text-xl mb-2 leading-tight">{project.name}</h3>
                    {project.description && (
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4 max-w-3xl">{project.description}</p>
                    )}
                    {(project.button_a_url || project.button_b_url) && (
                        <div className="flex flex-wrap gap-2">
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
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getProjects()
            .then(setProjects)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getProjectsByCategory = (cat: Category) =>
        projects.filter(p => p.category === cat).sort((a, b) => a.sort_order - b.sort_order);

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

                {loading && (
                    <div className="text-center text-zinc-500 py-20">Caricamento...</div>
                )}

                {!loading && (
                    <div className="space-y-16">
                        {CATEGORIES.map(({ key, label }) => {
                            const catProjects = getProjectsByCategory(key);
                            if (catProjects.length === 0) return null;

                            return (
                                <section key={key}>
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="flex items-center gap-4 mb-8"
                                    >
                                        <h2 className="text-xl md:text-2xl font-bold text-green-400">{label}</h2>
                                        <div className="flex-1 h-px bg-gradient-to-r from-green-500/30 to-transparent" />
                                    </motion.div>

                                    <div className="flex flex-col gap-5">
                                        {catProjects.map((project, idx) => (
                                            <ProjectCard key={project.id} project={project} index={idx} />
                                        ))}
                                    </div>
                                </section>
                            );
                        })}

                        {projects.length === 0 && (
                            <p className="text-center text-zinc-600 py-20">Nessun progetto disponibile al momento.</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

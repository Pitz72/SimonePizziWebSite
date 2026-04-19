
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import SEO from './SEO';
import { useFetchArticles } from '../hooks/useFetchArticles';

/** Formatta "19 apr 2026 · 14:30" da una stringa ISO */
const formatDateTime = (dateStr: string): string => {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${date} · ${hh}:${mm}`;
};

interface ArticleArchiveProps {
    title: string;
    category?: string; // Slug categoria (dinamico da DB v1.6.5)
}

const ArticleArchive: React.FC<ArticleArchiveProps> = ({ title, category }) => {
    const navigate = useNavigate();
    const { items, loading, error } = useFetchArticles(category);

    if (loading) {
        return (
            <section className="container mx-auto py-32 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-dis-green mb-6"></div>
                <p className="text-zinc-400 text-lg">Caricamento articoli {title}...</p>
            </section>
        );
    }

    if (error || !items || items.length === 0) {
        return (
            <section className="container mx-auto py-24 text-center min-h-[50vh]">
                <SEO title={title} />
                <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight text-balance mb-8 opacity-20">{title}</h1>
                <div className="inline-block bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
                    <p className="text-gray-400 text-lg">{error ? `Errore: ${error} ` : 'Nessun articolo pubblicato in questa categoria.'}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="container mx-auto py-16 sm:py-24 min-h-[80vh] animate-in fade-in duration-700">
            <SEO title={title} description={`Archivio articoli della sezione ${title} `} />

            {/* HEADER DELLA CATEGORIA */}
            <div className="mb-16 md:mb-24 text-center md:text-left relative">
                <div className="absolute -top-12 -left-12 w-48 h-48 bg-dis-green/10 rounded-full blur-3xl mix-blend-screen pointer-events-none"></div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 relative z-10">{title}</h1>
                <p className="text-xl text-zinc-400 font-medium max-w-2xl relative z-10">Esplora tutti i contenuti, gli approfondimenti e i progetti pubblicati in questa sezione.</p>
                <div className="h-1 w-24 bg-dis-green rounded-full mt-8 md:mx-0 mx-auto relative z-10"></div>
            </div>

            {/* ORDINAMENTO INTELLIGENTE */}
            {(() => {
                const sortedItems = [...items].sort((a, b) => {
                    if (a.isFeatured && !b.isFeatured) return -1;
                    if (!a.isFeatured && b.isFeatured) return 1;
                    
                    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
                    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
                    
                    if (dateB !== dateA) return dateB - dateA;
                    return b.id - a.id;
                });

                const heroItem = sortedItems[0];
                const gridItems = sortedItems.slice(1);

                return (
                    <>
                        <div className="flex flex-col gap-8 md:gap-12 mb-12">
                            {/* HERO ITEM (1° Articolo come Hub) */}
                            {heroItem && (
                                <article
                                    onClick={() => navigate(`/${category || heroItem.category}/${heroItem.slug}`)}
                                    className="group flex flex-col md:flex-row bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden cursor-pointer hover:border-dis-green/60 transition-all duration-500 hover:shadow-[0_0_60px_-10px_rgba(34,197,94,0.4)] hover:-translate-y-1 animate-[fade-in_0.5s_ease-out_forwards]"
                                >
                                    <div className="w-full md:w-3/5 lg:w-2/3 relative aspect-[16/10] md:aspect-auto md:h-full min-h-[300px] overflow-hidden bg-black">
                                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-900 via-zinc-900/40 md:via-zinc-900/10 to-transparent z-10 opacity-80 group-hover:opacity-40 transition-opacity duration-500"></div>
                                        <img
                                            src={heroItem.imageUrl}
                                            alt={heroItem.title}
                                            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="w-full md:w-2/5 lg:w-1/3 p-8 md:p-12 flex flex-col justify-center relative z-20 bg-zinc-900 shadow-[-20px_0_30px_rgba(9,9,11,1)]">
                                        <div className="mb-4 flex flex-wrap gap-2">
                                            {heroItem.isFeatured && (
                                                <span className="bg-dis-green text-black text-[10px] md:text-xs font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest">In Primo Piano</span>
                                            )}
                                            <span className="bg-zinc-800 border border-zinc-700 text-white text-[10px] md:text-xs font-black px-3 py-1.5 rounded-full shadow-lg uppercase tracking-widest">
                                                {(category || heroItem.category).replace(/-/g, ' ')}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-6 group-hover:text-dis-green transition-colors text-balance tracking-tight">
                                            {heroItem.title}
                                        </h2>
                                        <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-8 line-clamp-4">
                                            {heroItem.summary || "Continua a leggere questo approfondimento per scoprire i dettagli completi del progetto."}
                                        </p>
                                        {heroItem.publishedAt && (
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4">
                                                <Calendar size={11} />
                                                <span>{formatDateTime(heroItem.publishedAt)}</span>
                                            </div>
                                        )}
                                        <div className="mt-auto pt-6 border-t border-zinc-800">
                                            <span className="inline-flex items-center gap-3 text-sm font-bold text-white group-hover:text-dis-green transition-colors tracking-wide uppercase">
                                                Leggi l'Articolo
                                                <ArrowRight size={18} className="transform group-hover:translate-x-2 transition-transform" />
                                            </span>
                                        </div>
                                    </div>
                                </article >
                            )}
                        </div >

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                            {gridItems.map((item, index) => {
                                const urlCategory = category || item.category;
                                const targetUrl = `/${urlCategory}/${item.slug}`;

                                return (
                                    <article
                                        key={item.id}
                                        onClick={() => navigate(targetUrl)}
                                        className="group relative flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-dis-green/60 transition-all duration-500 hover:shadow-[0_0_50px_-5px_rgba(34,197,94,0.5)] hover:-translate-y-2 opacity-0 animate-[fade-in_0.5s_ease-out_forwards]"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        {/* Etichette in Hover/Top */}
                                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20 pointer-events-none">
                                            {item.isFeatured ? (
                                                <div className="bg-dis-green text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                                                    IN VETRINA
                                                </div>
                                            ) : <div></div>}
                                            <div className="px-3 py-1 bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 text-white text-[10px] font-bold tracking-widest uppercase rounded-full shadow-lg">
                                                {urlCategory.replace(/-/g, ' ')}
                                            </div>
                                        </div>

                                        {/* THUMBNAIL CON EFFETTO ELASTICO ZOOM */}
                                        <div className="relative aspect-[16/10] overflow-hidden bg-black">
                                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-500"></div>
                                            <img
                                                src={item.imageUrl}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                loading="lazy"
                                            />
                                        </div>

                                        {/* CORPO DELLA CARD */}
                                        <div className="p-6 md:p-8 flex flex-col flex-1 relative z-20 bg-zinc-900">

                                            {/* Metadati (Tag e Data) */}
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                                                {item.tags.slice(0, 2).map(tag => (
                                                    <span key={tag} className="text-xs font-bold text-dis-green uppercase tracking-wider">{tag}</span>
                                                ))}
                                                <div className="flex items-center text-xs text-zinc-500 gap-1 ml-auto">
                                                    <Calendar size={12} />
                                                    <span>{item.publishedAt ? formatDateTime(item.publishedAt) : 'Articolo'}</span>
                                                </div>
                                            </div>

                                            {/* Titolo e Riassunto */}
                                            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-dis-green transition-colors line-clamp-2">
                                                {item.title}
                                            </h2>
                                            <p className="text-zinc-400 text-sm leading-relaxed mb-8 line-clamp-3">
                                                {item.summary || "Clicca per leggere l'intero approfondimento editoriale associato a questa pubblicazione..."}
                                            </p>

                                            {/* Call to Action Elastica nel bottom */}
                                            <div className="mt-auto pt-4 border-t border-zinc-800 flex items-center justify-between">
                                                <span className="text-sm font-bold text-white group-hover:text-dis-green transition-colors flex items-center gap-2">
                                                    Leggi Articolo
                                                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                                                </span>
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-dis-green/20 transition-colors">
                                                    <div className="w-2 h-2 rounded-full bg-zinc-600 group-hover:bg-dis-green transition-colors"></div>
                                                </div>
                                            </div>
                                        </div>

                                    </article>
                                );
                            })}
                        </div>
                    </>
                );
            })()}
        </section >
    );
};

export default ArticleArchive;

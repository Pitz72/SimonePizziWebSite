import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from './SEO';
import { useFetchArticles } from '../hooks/useFetchArticles';
import { PortfolioItem } from '../types';

const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
};

interface ArticleArchiveProps {
    title: string;
    category?: string;
    initialItems?: PortfolioItem[];
}

const ArticleArchive: React.FC<ArticleArchiveProps> = ({ title, category, initialItems }) => {
    const navigate = useNavigate();
    const { items, loading, error, hasMore, loadMore, loadingMore } = useFetchArticles(category, 10, initialItems);

    if (loading) {
        return (
            <section className="px-6 md:px-[52px] py-32 flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-dis-green border-t-transparent rounded-full animate-spin mb-6" />
                <p className="font-mono text-[11px] tracking-widest uppercase" style={{ color: '#6a9070' }}>
                    Caricamento {title}...
                </p>
            </section>
        );
    }

    if (error || !items || items.length === 0) {
        return (
            <section className="px-6 md:px-[52px] py-24 text-center min-h-[50vh]">
                <SEO title={title} />
                <h1 className="font-serif text-white opacity-20 mb-8 tracking-tight"
                    style={{ fontSize: 'clamp(40px, 6vw, 72px)', letterSpacing: '-0.02em' }}>
                    {title}
                </h1>
                <div className="inline-block p-8" style={{ border: '1px solid rgba(34,197,94,0.1)', background: '#0c1410' }}>
                    <p className="font-mono text-[11px] tracking-wider uppercase" style={{ color: '#6a9070' }}>
                        {error ? `Errore: ${error}` : 'Nessun articolo pubblicato in questa categoria.'}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="px-6 md:px-[52px] py-20 min-h-[80vh]">
            <SEO title={title} description={`Archivio articoli della sezione ${title}`} />

            {/* ── CATEGORY HEADER ── */}
            <div className="mb-20 pb-8" style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
                <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] uppercase text-dis-green mb-5">
                    <span className="w-6 h-px bg-dis-green" />
                    Archivio
                </div>
                <h1 className="font-serif text-white tracking-tight"
                    style={{ fontSize: 'clamp(40px, 6vw, 72px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    {title}
                </h1>
                <p className="mt-4 font-light" style={{ fontSize: '17px', color: '#6a9070', maxWidth: '560px' }}>
                    Esplora tutti i contenuti, gli approfondimenti e i progetti pubblicati in questa sezione.
                </p>
                <div className="mt-8 h-px w-16 bg-dis-green" />
            </div>

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
                        {/* ── HERO CARD ── */}
                        {heroItem && (
                            <div className="mb-[3px]">
                                <article
                                    onClick={() => navigate(`/${category || heroItem.category}/${heroItem.slug}`)}
                                    className="group flex flex-col md:flex-row overflow-hidden cursor-pointer transition-all duration-500"
                                    style={{ background: '#0c1410', border: '1px solid rgba(34,197,94,0.12)', borderRadius: '2px' }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.5)';
                                        (e.currentTarget as HTMLElement).style.boxShadow = '0 0 60px -10px rgba(34,197,94,0.25)';
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.12)';
                                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                                    }}
                                >
                                    <div className="w-full md:w-3/5 lg:w-2/3 min-h-[280px] md:min-h-[400px] relative overflow-hidden" style={{ background: '#05080a' }}>
                                        <div className="absolute inset-0 z-10 opacity-80 group-hover:opacity-40 transition-opacity duration-500"
                                            style={{ background: 'linear-gradient(to right, #0c1410, rgba(12,20,16,0.1), transparent)' }} />
                                        {heroItem.imageUrl ? (
                                            <img
                                                src={heroItem.imageUrl} alt={heroItem.title}
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                                                style={{ filter: 'brightness(0.75) saturate(0.9)' }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0"
                                                style={{ background: 'linear-gradient(135deg, #0c1410 0%, #071209 100%)' }} />
                                        )}
                                    </div>
                                    <div className="w-full md:w-2/5 lg:w-1/3 p-8 md:p-12 flex flex-col justify-center relative z-20"
                                        style={{ background: '#0c1410', boxShadow: '-20px 0 30px rgba(2,6,4,1)' }}>
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {heroItem.isFeatured && (
                                                <span className="font-mono text-[10px] tracking-[0.18em] uppercase px-3 py-1.5 text-black bg-dis-green">
                                                    In Primo Piano
                                                </span>
                                            )}
                                            <span className="font-mono text-[10px] tracking-[0.18em] uppercase px-3 py-1.5 text-white"
                                                style={{ border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.05)' }}>
                                                {(category || heroItem.category).replace(/-/g, ' ')}
                                            </span>
                                        </div>
                                        {heroItem.publishedAt && (
                                            <div className="mb-4 font-mono text-[11px]" style={{ color: '#3a5540' }}>
                                                {formatDate(heroItem.publishedAt)}
                                            </div>
                                        )}
                                        <h2 className="font-serif text-white leading-[1.2] mb-5 group-hover:text-dis-green transition-colors tracking-tight"
                                            style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)', letterSpacing: '-0.02em' }}>
                                            {heroItem.title}
                                        </h2>
                                        <p className="leading-[1.7] mb-8 line-clamp-4" style={{ color: '#6a9070', fontSize: '15px' }}>
                                            {heroItem.summary || 'Continua a leggere questo approfondimento per scoprire i dettagli completi.'}
                                        </p>
                                        <div className="pt-5" style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
                                            <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-dis-green group-hover:text-white transition-colors">
                                                Leggi l'Articolo →
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            </div>
                        )}

                        {/* ── GRID CARDS ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[3px] mt-[3px]">
                            {gridItems.map((item) => {
                                const urlCategory = category || item.category;
                                return (
                                    <article
                                        key={item.id}
                                        onClick={() => navigate(`/${urlCategory}/${item.slug}`)}
                                        className="v3-card h-[280px] cursor-pointer"
                                        style={{ background: '#0c1410' }}
                                    >
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl} alt={item.title}
                                                className="absolute inset-0 w-full h-full object-cover"
                                                style={{ filter: 'brightness(0.7) saturate(0.85)', transition: 'transform 1.2s cubic-bezier(0.16,1,0.3,1), filter 0.5s' }}
                                            />
                                        ) : (
                                            <div className="absolute inset-0"
                                                style={{ background: 'linear-gradient(135deg, #0c1410 0%, #071209 100%)' }} />
                                        )}
                                        <div className="absolute inset-0 z-10 pointer-events-none"
                                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }} />
                                        <div className="v3-card-body absolute bottom-0 left-0 right-0 z-30 p-5 pb-6">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                {item.isFeatured && (
                                                    <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-black bg-dis-green px-2 py-0.5">
                                                        Vetrina
                                                    </span>
                                                )}
                                                {item.tags.slice(0, 1).map(tag => (
                                                    <span key={tag} className="font-mono text-[10px] tracking-[0.12em] uppercase text-dis-green">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <h2 className="font-serif text-white leading-[1.3] mb-1.5 line-clamp-2"
                                                style={{ fontSize: 'clamp(15px, 1.6vw, 20px)' }}>
                                                {item.title}
                                            </h2>
                                            <p className="v3-card-sum text-[12px] leading-[1.6]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                                {item.summary}
                                            </p>
                                            <span className="v3-card-cta font-mono text-[10px] tracking-[0.12em] uppercase text-dis-green flex items-center gap-1.5 mt-2">
                                                Leggi Articolo →
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {hasMore && (
                            <div className="mt-16 text-center">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="font-mono text-[11px] tracking-[0.15em] uppercase px-8 py-4 text-dis-green transition-all duration-200 disabled:opacity-50"
                                    style={{ border: '1px solid rgba(34,197,94,0.3)' }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#22c55e')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)')}
                                >
                                    {loadingMore ? 'Caricamento...' : 'Carica Altri →'}
                                </button>
                            </div>
                        )}
                    </>
                );
            })()}
        </section>
    );
};

export default ArticleArchive;

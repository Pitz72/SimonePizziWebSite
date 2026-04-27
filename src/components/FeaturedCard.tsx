import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Category, PortfolioItem } from '../types';

interface FeaturedCardProps {
    item: PortfolioItem;
    category: Category | string;
    isHero?: boolean;
    isProject?: boolean;
}

const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── HERO CARD — horizontal layout with V3 styling ─────────────
const HeroCard: React.FC<{ item: PortfolioItem; category: string; isProject: boolean }> = ({ item, category, isProject }) => {
    const targetUrl = isProject ? '#' : `/${category}/${item.slug}`;

    const Content = (
        <motion.div
            whileHover={!isProject ? { y: -4, transition: { duration: 0.3 } } : {}}
            className="flex flex-col md:flex-row overflow-hidden transition-all duration-500"
            style={{
                background: '#0c1410',
                border: '1px solid rgba(34,197,94,0.12)',
                borderRadius: '3px',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(34,197,94,0.5)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 60px -10px rgba(34,197,94,0.25)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(34,197,94,0.12)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
        >
            {/* Image */}
            <div className="w-full md:w-3/5 lg:w-2/3 min-h-[300px] md:min-h-[420px] relative overflow-hidden" style={{ background: '#05080a' }}>
                <div className="absolute inset-0 z-10 transition-opacity duration-500 opacity-80 group-hover:opacity-40"
                    style={{ background: 'linear-gradient(to right, #0c1410, rgba(12,20,16,0.1), transparent)' }} />
                <img
                    src={item.imageUrl} alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    style={{ filter: 'brightness(0.75) saturate(0.9)' }}
                />
            </div>

            {/* Content */}
            <div className="w-full md:w-2/5 lg:w-1/3 p-8 md:p-12 flex flex-col justify-center relative z-20"
                style={{ background: '#0c1410', boxShadow: '-20px 0 30px rgba(2,6,4,1)' }}>

                <div className="mb-3 flex flex-wrap gap-2">
                    {!isProject && (
                        <span className="font-mono text-[10px] tracking-[0.18em] uppercase px-3 py-1.5 text-black bg-dis-green">
                            In Primo Piano
                        </span>
                    )}
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase px-3 py-1.5 text-white"
                        style={{ border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.05)' }}>
                        {category.replace(/-/g, ' ')}
                    </span>
                </div>

                {item.publishedAt && (
                    <div className="flex items-center gap-1.5 mb-4" style={{ color: '#3a5540', fontSize: '11px' }}>
                        <Calendar size={11} />
                        <span>{formatDate(item.publishedAt)}</span>
                    </div>
                )}

                <h3
                    className="font-serif text-white leading-[1.2] mb-5 group-hover:text-dis-green transition-colors"
                    style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2.5rem)', letterSpacing: '-0.02em' }}
                >
                    {item.title}
                </h3>
                <p className="leading-[1.7] mb-8 line-clamp-4" style={{ color: '#6a9070', fontSize: '15px' }}>
                    {item.summary}
                </p>

                <div className="pt-5" style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
                    {isProject ? (
                        <div className="flex flex-wrap gap-3">
                            {item.link && item.buttonText && (
                                <a href={item.link} target="_blank" rel="noopener noreferrer"
                                    className="font-bold font-sans text-[11px] tracking-[0.08em] uppercase px-6 py-3 bg-dis-green text-black transition-all hover:bg-green-400">
                                    {item.buttonText}
                                </a>
                            )}
                            {item.extraLink && item.extraLinkText && (
                                <a href={item.extraLink} target="_blank" rel="noopener noreferrer"
                                    className="font-bold font-sans text-[11px] tracking-[0.08em] uppercase px-6 py-3 text-white transition-all"
                                    style={{ border: '1px solid rgba(34,197,94,0.2)', background: 'transparent' }}
                                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.5)')}
                                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(34,197,94,0.2)')}>
                                    {item.extraLinkText}
                                </a>
                            )}
                        </div>
                    ) : (
                        <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-dis-green group-hover:text-white transition-colors flex items-center gap-2">
                            Leggi l'Articolo →
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );

    return isProject
        ? <div className="block w-full">{Content}</div>
        : <Link to={targetUrl} className="block w-full group">{Content}</Link>;
};

// ── GRID CARD — full-image overlay (articles) / compact (projects) ──
const GridCard: React.FC<{ item: PortfolioItem; category: string; isProject: boolean }> = ({ item, category, isProject }) => {
    const targetUrl = isProject ? '#' : `/${category}/${item.slug}`;

    if (!isProject) {
        // V3 full-image overlay card
        const card = (
            <div
                className="v3-card h-[300px] block"
                style={{ background: '#0c1410', cursor: isProject ? 'default' : undefined }}
            >
                <img
                    src={item.imageUrl} alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: 'brightness(0.7) saturate(0.85)', transition: 'transform 1.2s cubic-bezier(0.16,1,0.3,1), filter 0.5s' }}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 z-10 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)' }} />
                {/* Content */}
                <div className="v3-card-body absolute bottom-0 left-0 right-0 z-30 p-6 pb-7">
                    <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-dis-green block mb-1.5">
                        {category.replace(/-/g, ' ')}
                    </span>
                    <h3 className="font-serif text-white leading-[1.2] mb-1.5"
                        style={{ fontSize: 'clamp(17px, 1.8vw, 22px)' }}>
                        {item.title}
                    </h3>
                    <p className="v3-card-sum text-[12px] leading-[1.6]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        {item.summary}
                    </p>
                    <span className="v3-card-cta font-mono text-[10px] tracking-[0.12em] uppercase text-dis-green flex items-center gap-1.5 mt-2.5">
                        Leggi l'articolo →
                    </span>
                </div>
            </div>
        );
        return <Link to={targetUrl} className="block h-full">{card}</Link>;
    }

    // Project grid card — compact with CTA buttons
    return (
        <div
            className="flex flex-col h-full overflow-hidden transition-all duration-500"
            style={{
                background: '#0c1410',
                border: '1px solid rgba(34,197,94,0.12)',
                borderRadius: '2px',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(34,197,94,0.4)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 40px -5px rgba(34,197,94,0.2)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(34,197,94,0.12)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
        >
            <div className="h-52 overflow-hidden relative" style={{ background: '#05080a', flexShrink: 0 }}>
                <div className="absolute inset-0 z-10 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, #0c1410, transparent)', opacity: 0.8 }} />
                <img src={item.imageUrl} alt={item.title}
                    className="w-full h-full object-cover"
                    style={{ filter: 'brightness(0.7) saturate(0.85)', transition: 'transform 0.7s ease' }} />
            </div>
            <div className="p-6 flex-1 flex flex-col">
                <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-dis-green block mb-2">
                    {category.replace(/-/g, ' ')}
                </span>
                <h3 className="font-serif text-white leading-[1.3] mb-3" style={{ fontSize: '18px' }}>{item.title}</h3>
                <p className="text-[13px] leading-[1.6] flex-1 mb-5 line-clamp-3" style={{ color: '#6a9070' }}>{item.summary}</p>
                <div className="flex flex-col gap-2 pt-4" style={{ borderTop: '1px solid rgba(34,197,94,0.1)' }}>
                    {item.link && item.buttonText && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer"
                            className="w-full text-center font-bold font-sans text-[10px] tracking-[0.08em] uppercase py-2.5 bg-dis-green text-black transition-all hover:bg-green-400">
                            {item.buttonText}
                        </a>
                    )}
                    {item.extraLink && item.extraLinkText && (
                        <a href={item.extraLink} target="_blank" rel="noopener noreferrer"
                            className="w-full text-center font-bold font-sans text-[10px] tracking-[0.08em] uppercase py-2.5 text-white transition-all"
                            style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
                            {item.extraLinkText}
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

// ── MAIN COMPONENT ─────────────────────────────────────────────
const FeaturedCard: React.FC<FeaturedCardProps> = ({ item, category, isHero = false, isProject = false }) => {
    const displayCategory = typeof category === 'string' ? category : String(category);

    if (isHero) {
        return <HeroCard item={item} category={displayCategory} isProject={isProject} />;
    }

    return <GridCard item={item} category={displayCategory} isProject={isProject} />;
};

export default FeaturedCard;

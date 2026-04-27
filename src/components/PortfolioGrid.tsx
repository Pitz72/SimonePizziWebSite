import React, { useState } from 'react';
import Hero from './Hero';
import Modal from './Modal';
import SEO from './SEO';
import { useLoaderData } from 'react-router-dom';
import { PortfolioItem } from '../types';
import { aboutMeData } from '../data/aboutMeData';
import FeaturedCard from './FeaturedCard';
import CommunityHub from './CommunityHub';

const SectionEyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] uppercase text-dis-green mb-4">
        <span className="w-6 h-px bg-dis-green flex-shrink-0" />
        {children}
    </div>
);

const PortfolioGrid: React.FC = () => {
    const { articles, projects } = useLoaderData() as { articles: PortfolioItem[], projects: PortfolioItem[] };

    const sortedArticles = [...articles].sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        if (dateB !== dateA) return dateB - dateA;
        return b.id - a.id;
    });

    const displayArticles = sortedArticles.map(item => ({ item, category: item.category })).slice(0, 7);
    const displayProjects = projects.map(item => ({ item, category: item.category }));

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <SEO title="Home" />
            <Hero onOpenModal={() => setIsModalOpen(true)} />

            {/* ── ULTIMI AGGIORNAMENTI ── */}
            <section id="featured" className="px-6 md:px-[52px] pt-20 pb-12">
                <div className="mb-14 pb-6" style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
                    <SectionEyebrow>Ultimi Aggiornamenti</SectionEyebrow>
                    <h2 className="font-serif text-white" style={{ fontSize: 'clamp(32px, 4vw, 54px)', letterSpacing: '-0.02em' }}>
                        In Primo Piano
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[3px] min-h-[400px]">
                    {displayArticles.length === 0 ? (
                        <div className="col-span-full text-center py-10 font-mono text-[12px] tracking-widest uppercase" style={{ color: '#3a5540' }}>
                            Nessun progetto o articolo pubblicato al momento.
                        </div>
                    ) : (
                        <>
                            {displayArticles.length > 0 && (
                                <div className="col-span-full mb-[3px]">
                                    <FeaturedCard item={displayArticles[0].item} category={displayArticles[0].category} isHero={true} />
                                </div>
                            )}
                            {displayArticles.slice(1).map(({ item, category }) => (
                                <FeaturedCard key={item.id} item={item} category={category} isHero={false} />
                            ))}
                        </>
                    )}
                </div>
            </section>

            <CommunityHub />

            {/* ── ULTIMI PROGETTI ── */}
            {displayProjects.length > 0 && (
                <section className="px-6 md:px-[52px] pt-12 pb-24" style={{ borderTop: '1px solid rgba(34,197,94,0.08)' }}>
                    <div className="mb-14 pb-6" style={{ borderBottom: '1px solid rgba(34,197,94,0.1)' }}>
                        <SectionEyebrow>Portfolio</SectionEyebrow>
                        <h2 className="font-serif text-white" style={{ fontSize: 'clamp(32px, 4vw, 54px)', letterSpacing: '-0.02em' }}>
                            Ultimi <em className="not-italic text-dis-green">Progetti</em>
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="col-span-full mb-4">
                            <FeaturedCard item={displayProjects[0].item} category={displayProjects[0].category} isHero={true} isProject={true} />
                        </div>
                        {displayProjects.slice(1).map(({ item, category }) => (
                            <FeaturedCard key={item.id} item={item} category={category} isHero={false} isProject={true} />
                        ))}
                    </div>
                </section>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={aboutMeData.title}>
                {aboutMeData.sections.map((section, index) => (
                    <React.Fragment key={index}>
                        {section.title && <h3>{section.title}</h3>}
                        {section.paragraphs.map((paragraph, pIndex) => (
                            <p key={pIndex}>{paragraph}</p>
                        ))}
                    </React.Fragment>
                ))}
            </Modal>
        </div>
    );
};

export default PortfolioGrid;

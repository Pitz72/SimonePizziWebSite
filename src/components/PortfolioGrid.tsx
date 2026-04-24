import React, { useState } from 'react';
import Hero from './Hero';
import Modal from './Modal'; // Import Modal component
import SEO from './SEO';
import { useLoaderData } from 'react-router-dom';
import { PortfolioItem } from '../types';
import { aboutMeData } from '../data/aboutMeData';
import FeaturedCard from './FeaturedCard';
import CommunityHub from './CommunityHub';

const PortfolioGrid: React.FC = () => {
    // Caricamento via Loader (Code Splitting & Parallel Fetching)
    const items = useLoaderData() as PortfolioItem[];

    // Filtra e Ordina i dati
    const sortedItems = [...items].sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;

        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        
        if (dateB !== dateA) return dateB - dateA;
        return b.id - a.id;
    });

    const displayItems = sortedItems.map(item => ({ item, category: item.category })).slice(0, 7);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    return (
        <div>
            <SEO title="Home" />
            <Hero onOpenModal={toggleModal} /> {/* Pass toggleModal to Hero */}
            <section className="container mx-auto py-16 sm:py-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white">Ultimi Aggiornamenti</h2>
                    <p className="text-lg text-gray-400 mt-2">Le modifiche o le pubblicazioni più recenti dei miei progetti.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
                    {displayItems.length === 0 ? (
                        <div className="col-span-full text-center text-zinc-500 py-10">Nessun progetto o articolo pubblicato al momento.</div>
                    ) : (
                        <>
                            {/* HERO ITEM (primo elemento a larghezza intera) */}
                            {displayItems.length > 0 && (
                                <div className="col-span-full mb-8">
                                    <FeaturedCard item={displayItems[0].item} category={displayItems[0].category} isHero={true} />
                                </div>
                            )}

                            {/* GRID STANDARD (elementi dal 2 in poi) */}
                            {displayItems.slice(1).map(({ item, category }) => (
                                <FeaturedCard key={item.id} item={item} category={category} isHero={false} />
                            ))}
                        </>
                    )}
                </div>
            </section>

            <CommunityHub />

            {/* Render Modal component */}
            <Modal isOpen={isModalOpen} onClose={toggleModal} title={aboutMeData.title}>
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

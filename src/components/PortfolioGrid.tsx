import React, { useState } from 'react';
import Hero from './Hero';
import Modal from './Modal'; // Import Modal component
import SEO from './SEO';
import { useFetchArticles } from '../hooks/useFetchArticles';
import { aboutMeData } from '../data/aboutMeData';

import FeaturedCard from './FeaturedCard';

const PortfolioGrid: React.FC = () => {
    // Caricamento Dinamico Home Page: preleviamo solo i primi 7 articoli per il layout
    const { items, loading, error } = useFetchArticles(undefined, 7);

    // Filtra e Ordina i dati del Database
    const sortedItems = [...items].sort((a, b) => {
        // 1. Quelli in vetrina vanno SEMPRE in alto
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;

        // 2. A parità di Vetrina (o nessuno dei due), vale la data di pubblicazione (I più recenti in alto)
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        
        if (dateB !== dateA) return dateB - dateA;

        // Fallback all'ID se le date sono uguali
        return b.id - a.id;
    });

    const displayItems = sortedItems.map(item => ({ item, category: item.category })).slice(0, 7); // Layout completo: 1 hero + 6 card griglia 3x2

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
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center justify-center text-zinc-500 py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dis-green mb-4"></div>
                            <p>Caricamento griglia portfolio...</p>
                        </div>
                    ) : error ? (
                        <div className="col-span-full text-center text-red-400 py-10 bg-red-500/10 rounded-xl border border-red-500/20">{error}</div>
                    ) : displayItems.length === 0 ? (
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

            <section className="container mx-auto py-16 sm:py-24 text-center">
                <h2 className="text-4xl font-bold text-white mb-4">Contattami</h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
                    Hai un'idea brillante, un progetto in mente o semplicemente vuoi scambiare due chiacchiere sui miei lavori? Sono sempre aperto a nuove collaborazioni, feedback costruttivi e proposte innovative. Non esitare a contattarmi!
                </p>
                <div className="flex justify-center space-x-4">
                    <a
                        href="https://github.com/Pitz72"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-green-500 text-black font-bold text-lg px-8 py-4 rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/40 ring-1 ring-green-400/50 hover:ring-white/50"
                    >
                        IL MIO GITHUB
                    </a>
                    <a
                        href="mailto:pizzisimone1972@gmail.com"
                        className="inline-block bg-gray-800/80 backdrop-blur-md text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-900/20 ring-1 ring-white/10 hover:ring-green-500/50"
                    >
                        INVIAMI UNA MAIL
                    </a>
                </div>
            </section>

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

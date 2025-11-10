import React from 'react';
import Hero from './Hero';
import { portfolioData } from '../data/portfolioData';
import { Category, PortfolioItem } from '../types';

const FeaturedCard: React.FC<{ item: PortfolioItem, category: Category }> = ({ item, category }) => (
    <a 
        href={`#/${category}`} 
        className="block bg-white/5 border border-white/10 rounded-xl p-6 group transition-all duration-300 hover:border-green-400/50 hover:bg-white/10 transform hover:-translate-y-2"
    >
        <div className="h-40 mb-6 rounded-lg overflow-hidden">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        </div>
        <h3 className="font-bold text-xl text-white mb-2">{item.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-3 mb-4">{item.summary}</p>
        <span className="font-semibold text-green-400 text-sm">
            Scopri di più &rarr;
        </span>
    </a>
);

const HomePage: React.FC = () => {
    const featuredVideogiochi = portfolioData[Category.VIDEOGIOCHI]?.[0];
    const featuredSoftware = portfolioData[Category.PROGETTI_SOFTWARE]?.[0];
    const featuredNarrativa = portfolioData[Category.NARRATIVA_E_PUBBLICAZIONI]?.[0];

    return (
        <div>
            <Hero />
            <section className="container mx-auto py-16 sm:py-24">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white">Progetti in Evidenza</h2>
                    <p className="text-lg text-gray-400 mt-2">Una selezione dei miei lavori più rappresentativi.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredVideogiochi && <FeaturedCard item={featuredVideogiochi} category={Category.VIDEOGIOCHI} />}
                    {featuredSoftware && <FeaturedCard item={featuredSoftware} category={Category.PROGETTI_SOFTWARE} />}
                    {featuredNarrativa && <FeaturedCard item={featuredNarrativa} category={Category.NARRATIVA_E_PUBBLICAZIONI} />}
                </div>
            </section>
        </div>
    );
};

export default HomePage;

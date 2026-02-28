import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Category, PortfolioItem } from '../types';

interface FeaturedCardProps {
    item: PortfolioItem;
    category: Category;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ item, category }) => (
    <Link to={`/${category}`}>
        <motion.div
            whileHover={{
                scale: 1.02,
                rotateX: 5,
                rotateY: 5,
                transition: { duration: 0.3 }
            }}
            className="block bg-white/5 border border-white/10 rounded-xl p-6 group backdrop-blur-md hover:bg-white/10 hover:border-green-400/50 hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-2 ring-1 ring-transparent hover:ring-green-500/30 transition-all duration-300"
            style={{ transformStyle: 'preserve-3d' }}
        >
            <div className="h-40 mb-6 rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
            <h3 className="font-bold text-xl text-white mb-2 group-hover:text-green-400 transition-colors">{item.title}</h3>
            <p className="text-gray-400 text-sm line-clamp-3 mb-4">{item.summary}</p>
            <span className="font-semibold text-green-400 text-sm flex items-center gap-2 group-hover:translate-x-2 transition-transform">
                Scopri di più &rarr;
            </span>
        </motion.div>
    </Link>
);

export default FeaturedCard;

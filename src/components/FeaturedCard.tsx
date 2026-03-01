import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Category, PortfolioItem } from '../types';
import { slugify } from '../utils/slugify';

interface FeaturedCardProps {
    item: PortfolioItem;
    category: Category | string;
    isHero?: boolean;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ item, category, isHero = false }) => {
    const targetUrl = `/${category}/${slugify(item.title)}`;

    if (isHero) {
        return (
            <Link to={targetUrl} className="block w-full group">
                <motion.div
                    whileHover={{ scale: 1.01, transition: { duration: 0.3 } }}
                    className="flex flex-col md:flex-row bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-dis-green/60 hover:shadow-[0_0_60px_-10px_rgba(34,197,94,0.4)] transition-all duration-500 hover:-translate-y-1"
                >
                    <div className="w-full md:w-3/5 lg:w-2/3 h-[300px] md:h-auto min-h-[400px] relative overflow-hidden bg-black">
                        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-zinc-900 via-zinc-900/40 md:via-zinc-900/10 to-transparent z-10 opacity-80 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105" />
                    </div>
                    <div className="w-full md:w-2/5 lg:w-1/3 p-8 md:p-12 flex flex-col justify-center relative z-20 bg-zinc-900 shadow-[-20px_0_30px_rgba(9,9,11,1)]">
                        <div className="mb-4">
                            <span className="inline-block px-3 py-1.5 bg-dis-green text-black text-xs font-black tracking-widest uppercase rounded-full shadow-lg">
                                In Primo Piano
                            </span>
                        </div>
                        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-6 group-hover:text-dis-green transition-colors tracking-tight text-balance">{item.title}</h3>
                        <p className="text-zinc-400 text-base md:text-lg leading-relaxed mb-8 line-clamp-4">{item.summary}</p>
                        <div className="mt-auto pt-6 border-t border-zinc-800">
                            <span className="inline-flex items-center gap-3 text-sm font-bold text-white group-hover:text-dis-green transition-colors tracking-wide uppercase">
                                Leggi Articolo &rarr;
                            </span>
                        </div>
                    </div>
                </motion.div>
            </Link>
        );
    }

    // Default Grid Card
    return (
        <Link to={targetUrl} className="block h-full cursor-pointer">
            <motion.div
                whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group hover:border-dis-green/60 hover:shadow-[0_0_50px_-5px_rgba(34,197,94,0.3)] transition-all duration-500 hover:-translate-y-2"
            >
                <div className="h-56 overflow-hidden relative bg-black">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent z-10 opacity-80" />
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                </div>
                <div className="p-6 md:p-8 flex-1 flex flex-col relative z-20 bg-zinc-900">
                    <h3 className="font-bold text-2xl text-white mb-3 group-hover:text-dis-green transition-colors leading-tight lg:leading-tight">{item.title}</h3>
                    <p className="text-zinc-400 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">{item.summary}</p>
                    <div className="mt-auto pt-4 border-t border-zinc-800">
                        <span className="mt-auto font-bold text-white group-hover:text-dis-green text-sm flex items-center gap-2 transition-colors tracking-wide uppercase">
                            Scopri di più &rarr;
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};

export default FeaturedCard;

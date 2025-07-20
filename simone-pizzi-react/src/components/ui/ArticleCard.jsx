import React from 'react';
import { Clock, Calendar } from 'lucide-react';

const ArticleCard = ({
  imageUrl,
  imageAlt,
  title,
  date,
  readTime,
  preview,
  link
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <article className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden transition-all duration-500 h-full flex flex-col hover:-translate-y-2 hover:shadow-2xl hover:border-[#00ff88] hover:scale-105 group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={imageAlt} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Overlay gradiente al hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#00ff88]/80 via-[#00ff88]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-4 mb-4 text-sm text-[#b3b3b3] md:flex-row flex-col md:items-center md:gap-4 items-start gap-2">
          <span className="flex items-center gap-1">
            <Calendar size={16} />
            {formatDate(date)}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={16} />
            {readTime} min di lettura
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-white leading-tight mb-4 line-clamp-2 md:text-lg text-lg line-clamp-3 text-base line-clamp-3 group-hover:text-[#00ff88] transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-[#a0a0a0] leading-relaxed mb-6 flex-1 line-clamp-3 md:text-base text-sm line-clamp-2">
          {preview}
        </p>
        
        <a 
          href={link} 
          className="mt-auto self-start text-[#00ff88] no-underline font-semibold px-6 py-3 rounded-xl bg-[#00ff88]/10 border border-[#00ff88] transition-all duration-200 inline-block whitespace-nowrap hover:bg-[#00ff88] hover:text-[#1a1a1a] hover:-translate-y-0.5"
        >
          Leggi articolo
        </a>
      </div>
    </article>
  );
};

export default ArticleCard;

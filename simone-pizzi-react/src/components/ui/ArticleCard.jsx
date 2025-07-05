import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import './ArticleCard.css';

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
    <article className="article-card">
      <div className="article-image">
        <img src={imageUrl} alt={imageAlt} loading="lazy" />
      </div>
      
      <div className="article-content">
        <div className="article-meta">
          <span className="article-date">
            <Calendar size={16} />
            {formatDate(date)}
          </span>
          <span className="article-read-time">
            <Clock size={16} />
            {readTime} min di lettura
          </span>
        </div>
        
        <h3 className="article-title">{title}</h3>
        
        <p className="article-preview">{preview}</p>
        
        <a href={link} className="article-link btn btn-secondary">
          Leggi articolo
        </a>
      </div>
    </article>
  );
};

export default ArticleCard;

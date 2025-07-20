import React from 'react';
import { Link } from 'react-router-dom';

const Card = ({
  children,
  variant = 'default',
  href,
  to,
  onClick,
  className = '',
  image,
  imageAlt,
  badge,
  featured = false,
  hover = true,
  ...props
}) => {
  const baseClasses = 'relative overflow-hidden transition-all duration-300 group';
  
  const variants = {
    default: 'bg-bg-surface border border-border-primary rounded-xl',
    elevated: 'bg-bg-surface border border-border-primary rounded-xl shadow-lg',
    glass: 'glass rounded-xl',
    featured: 'bg-gradient-to-br from-bg-surface to-bg-accent border border-primary-500 rounded-xl',
    interactive: 'bg-bg-surface border border-border-primary rounded-xl cursor-pointer',
  };
  
  const hoverClasses = hover ? 'hover:-translate-y-2 hover:shadow-xl hover:border-primary-500 hover:shadow-glow' : '';
  const featuredClasses = featured ? 'ring-2 ring-primary-500/20' : '';
  
  const cardClasses = `${baseClasses} ${variants[variant]} ${hoverClasses} ${featuredClasses} ${className}`;
  
  const content = (
    <>
      {image && (
        <div className="relative aspect-video overflow-hidden">
          <img 
            src={image} 
            alt={imageAlt || ''} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {badge && (
            <div className="absolute top-3 right-3">
              {badge}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/5 to-primary-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </>
  );
  
  if (href) {
    return (
      <a 
        href={href}
        className={cardClasses}
        {...props}
      >
        {content}
      </a>
    );
  }
  
  if (to) {
    return (
      <Link 
        to={to}
        className={cardClasses}
        {...props}
      >
        {content}
      </Link>
    );
  }
  
  if (onClick) {
    return (
      <button 
        type="button"
        className={cardClasses}
        onClick={onClick}
        {...props}
      >
        {content}
      </button>
    );
  }
  
  return (
    <div 
      className={cardClasses}
      {...props}
    >
      {content}
    </div>
  );
};

// Card sub-components
Card.Header = ({ children, className = '', ...props }) => (
  <div className={`mb-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.Title = ({ children, className = '', ...props }) => (
  <h3 className={`text-xl font-semibold text-text-primary mb-2 ${className}`} {...props}>
    {children}
  </h3>
);

Card.Subtitle = ({ children, className = '', ...props }) => (
  <p className={`text-text-muted text-sm ${className}`} {...props}>
    {children}
  </p>
);

Card.Content = ({ children, className = '', ...props }) => (
  <div className={`text-text-secondary leading-relaxed ${className}`} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`mt-6 pt-4 border-t border-border-primary ${className}`} {...props}>
    {children}
  </div>
);

Card.Badge = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-primary-500/10 text-primary-500 border border-primary-500/20',
    secondary: 'bg-bg-secondary text-text-muted border border-border-primary',
    success: 'bg-green-500/10 text-green-500 border border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
    danger: 'bg-red-500/10 text-red-500 border border-red-500/20',
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Card; 
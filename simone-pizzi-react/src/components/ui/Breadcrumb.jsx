import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();
  
  // Escludi la homepage dal breadcrumb
  if (location.pathname === '/') return null;

  const pathSegments = location.pathname
    .split('/')
    .filter(segment => segment !== '')
    .map((segment, index, array) => {
      const path = '/' + array.slice(0, index + 1).join('/');
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return { path, label, isLast: index === array.length - 1 };
    });

  return (
    <nav className="py-4 px-6 bg-bg-secondary/50 backdrop-blur-sm border-b border-border-primary/50">
      <div className="container mx-auto">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link 
              to="/" 
              className="flex items-center gap-1 text-text-muted hover:text-primary-500 transition-colors duration-200"
            >
              <Home size={16} />
              <span>Home</span>
            </Link>
          </li>
          
          {pathSegments.map((segment, index) => (
            <li key={segment.path} className="flex items-center">
              <ChevronRight size={16} className="text-text-muted mx-2" />
              {segment.isLast ? (
                <span className="text-primary-500 font-medium">
                  {segment.label}
                </span>
              ) : (
                <Link 
                  to={segment.path}
                  className="text-text-muted hover:text-primary-500 transition-colors duration-200"
                >
                  {segment.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb; 
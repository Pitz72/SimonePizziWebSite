import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PortfolioItem, Category } from '../types';
import SEO from './SEO';
import LetterModal from './LetterModal';
import ProjectList from './ProjectList';
import ProjectDetail from './ProjectDetail';
import { slugify } from '../utils/slugify';

interface PortfolioShowcaseProps {
  items: PortfolioItem[];
  title: string;
  category: Category;
}

const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({ items, title, category }) => {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);

  useEffect(() => {
    if (items && items.length > 0) {
      if (projectSlug) {
        const found = items.find(item => slugify(item.title) === projectSlug);
        if (found) {
          setSelectedItem(found);
        } else {
          setSelectedItem(items[0]);
        }
      } else {
        setSelectedItem(items[0]);
      }
    } else {
      setSelectedItem(null);
    }
  }, [items, projectSlug]);

  const handleSelect = (item: PortfolioItem) => {
    navigate(`/${category}/${slugify(item.title)}`);
  };

  if (!items || items.length === 0) {
    return (
      <section className="container mx-auto py-24 text-center">
        <SEO title={title} />
        <p className="text-gray-400">Nessun progetto in questa categoria.</p>
      </section>
    );
  }

  return (
    <section className="container mx-auto py-16 sm:py-24">
      <SEO title={selectedItem ? selectedItem.title : title} description={selectedItem?.summary} image={selectedItem?.imageUrl} />
      <LetterModal isOpen={isLetterModalOpen} onClose={() => setIsLetterModalOpen(false)} />
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(34, 197, 94, 0.3); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(34, 197, 94, 0.5); }
      `}</style>
      <div className="mb-16">
        <h1 className="text-5xl font-bold text-white tracking-tight text-balance">{title}</h1>
      </div>
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">

        <div className="lg:col-span-4">
          <ProjectList
            items={items}
            selectedItem={selectedItem}
            onSelect={handleSelect}
          />
        </div>

        <div className="lg:col-span-8">
          {selectedItem && (
            <ProjectDetail
              selectedItem={selectedItem}
              onOpenLetterModal={() => setIsLetterModalOpen(true)}
            />
          )}
        </div>

      </div>
    </section>
  );
};

export default PortfolioShowcase;

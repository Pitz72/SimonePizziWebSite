import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PortfolioItem, Category } from '../types';
import SEO from './SEO';
import LetterModal from './LetterModal';
import ProjectList from './ProjectList';
import ProjectDetail from './ProjectDetail';
import { slugify } from '../utils/slugify';
import { useFetchArticles } from '../hooks/useFetchArticles';

interface PortfolioShowcaseProps {
  title: string;
  category?: Category; // Resa Opzionale per le liste non filtrate (es Blog)
  items?: PortfolioItem[];
}

const PortfolioShowcase: React.FC<PortfolioShowcaseProps> = ({ title, category }) => {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const navigate = useNavigate();

  // Utilizziamo il Custom Hook passando la categoria di appartenenza della Showcase in corso
  const { items, loading, error } = useFetchArticles(category);

  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && items && items.length > 0) {
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
    } else if (!loading) {
      setSelectedItem(null);
    }
  }, [items, projectSlug, loading]);

  const handleSelect = (item: PortfolioItem) => {
    // Se la prop category è undefined (cioè navighiamo in un aggregatore globale tipo il Blog feed),
    // navighiamo usando la categoria nativa dell'item recuperata dal DB, altrimenti usiamo la category prop per restare nel contesto vetrina.
    const urlCategory = category || item.category;
    navigate(`/${urlCategory}/${slugify(item.title)}`);
  };

  if (loading) {
    return (
      <section className="container mx-auto py-32 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-dis-green mb-6"></div>
        <p className="text-zinc-400 text-lg">Caricamento progetti {title}...</p>
      </section>
    );
  }

  if (error || !items || items.length === 0) {
    return (
      <section className="container mx-auto py-24 text-center">
        <SEO title={title} />
        <h1 className="text-5xl font-bold text-white tracking-tight text-balance mb-8 opacity-50">{title}</h1>
        <div className="inline-block bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
          <p className="text-gray-400 text-lg">{error ? `Errore: ${error}` : 'Nessun progetto pubblicato in questa categoria.'}</p>
        </div>
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

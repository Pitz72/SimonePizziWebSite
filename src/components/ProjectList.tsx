import React from 'react';
import { PortfolioItem } from '../types';

interface ProjectListProps {
    items: PortfolioItem[];
    selectedItem: PortfolioItem | null;
    onSelect: (item: PortfolioItem) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ items, selectedItem, onSelect }) => {
    return (
        <ul className="space-y-4">
            {items.map((item) => (
                <li key={item.id}>
                    <button
                        onClick={() => onSelect(item)}
                        className={`w-full text-left p-4 rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500/50 transform group ${selectedItem?.id === item.id
                            ? 'bg-green-600/20 border-l-4 border-green-400 shadow-lg shadow-green-500/10' // Se selezionato
                            : item.isVisible // Se è abilitato
                                ? 'bg-gray-900/30 border-l-4 border-transparent hover:bg-gray-800/50 hover:border-green-400/70 hover:translate-x-1'
                                : 'bg-gray-900/30 border-l-4 border-transparent cursor-not-allowed opacity-50' // Se disabilitato
                            }`}
                        disabled={!item.isVisible} // Disabilita se non è visibile
                    >
                        <h3 className={`font-semibold text-lg transition-colors duration-300 ${selectedItem?.id === item.id ? 'text-green-300' : (item.isVisible ? 'text-white group-hover:text-green-300' : 'text-gray-500')}`}>{item.title}</h3>
                        <p className={`text-sm line-clamp-2 mt-1 ${selectedItem?.id === item.id ? 'text-gray-300' : (item.isVisible ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500')}`}>{item.summary}</p>
                    </button>
                </li>
            ))}
        </ul>
    );
};

export default ProjectList;

import React, { useState } from 'react';
import { PortfolioItem } from '../types';
import { Share2 } from 'lucide-react';
import ShareModal from './ShareModal';

interface ProjectDetailProps {
    selectedItem: PortfolioItem;
    onOpenLetterModal: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ selectedItem, onOpenLetterModal }) => {
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const currentUrl = window.location.href;

    return (
        <div key={selectedItem.id} className="sticky top-28 animate-fade-in">
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                url={currentUrl}
                title={selectedItem.title}
            />
            <div className="bg-gray-900/30 backdrop-blur-md rounded-2xl p-6 lg:p-8 border border-white/10 overflow-hidden">
                <div className="aspect-video w-full mb-8 rounded-lg overflow-hidden shadow-2xl shadow-black/50">
                    <img
                        src={selectedItem.imageUrl}
                        alt={selectedItem.title}
                        className="w-full h-full object-cover object-[50%_65%]"
                    />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{selectedItem.title}</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                    {selectedItem.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 text-sm font-medium text-green-300 bg-green-900/60 rounded-full">
                            {tag}
                        </span>
                    ))}
                </div>
                <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white max-h-[45vh] overflow-y-auto custom-scrollbar max-w-full">
                    <div dangerouslySetInnerHTML={{ __html: selectedItem.description }} />
                </div>

                <div className="mt-10 flex flex-wrap gap-4 items-center">
                    {selectedItem.link && selectedItem.link !== '#' && (
                        <a
                            href={selectedItem.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-green-500 text-black font-bold text-lg px-8 py-4 rounded-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30"
                        >
                            {selectedItem.buttonText || 'Scopri di più'}
                        </a>
                    )}

                    {selectedItem.extraLink && (
                        <a
                            href={selectedItem.extraLink}
                            download
                            className="inline-block bg-green-600 text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-green-500 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-600/30"
                        >
                            {selectedItem.extraLinkText || 'Download Extra'}
                        </a>
                    )}

                    {selectedItem.relatedLink && (
                        <a
                            href={selectedItem.relatedLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-gray-800 text-green-400 border border-green-500/50 font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-700 hover:border-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-900/20"
                        >
                            {selectedItem.relatedLinkText || 'Vedi Correlato'}
                        </a>
                    )}

                    {/* Pulsante Lettera alla Community (solo per The Safe Place) */}
                    {selectedItem.hasLetter && (
                        <button
                            onClick={onOpenLetterModal}
                            className="inline-block bg-gray-800 text-green-400 border border-green-500/50 font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-700 hover:border-green-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-900/20"
                        >
                            Lettera Alla Community
                        </button>
                    )}

                    {/* Pulsante Condivisione */}
                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="inline-flex items-center justify-center bg-gray-800 text-white border border-white/10 font-bold text-lg p-4 rounded-lg hover:bg-gray-700 hover:border-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-black/20"
                        title="Condividi questo progetto"
                    >
                        <Share2 size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;

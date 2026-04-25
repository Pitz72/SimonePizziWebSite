"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FileText, Layout, ArrowRight, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  cover_image: string;
  type: 'article' | 'project';
  url?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useRouter();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const response = await fetch(`/api/search.php?q=${encodeURIComponent(query)}`);
          const data = await response.json();
          setResults(data);
          setSelectedIndex(0);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (result: SearchResult) => {
    onClose();
    if (result.type === 'article') {
      navigate.push(`/${result.category}/${result.slug}`);
    } else {
      // Per i progetti, se c'è un URL esterno andiamo lì, altrimenti alla sezione progetti
      if (result.url && result.url.startsWith('http')) {
        window.open(result.url, '_blank');
      } else {
        navigate.push('/tutti-i-progetti');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-gray-900/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            onKeyDown={handleKeyDown}
          >
            {/* Input Header */}
            <div className="flex items-center px-5 py-4 border-b border-white/5">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Cerca articoli, progetti o idee..."
                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder:text-gray-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-2">
                {query && (
                  <button onClick={() => setQuery('')} className="p-1 hover:bg-white/5 rounded">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                <kbd className="hidden sm:flex h-6 items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100">
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results Area */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              {!query && (
                <div className="py-12 text-center text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Inizia a scrivere per cercare nel portfolio</p>
                </div>
              )}

              {query && query.length < 2 && (
                <div className="py-8 text-center text-gray-500 text-sm">
                  Digita almeno due caratteri...
                </div>
              )}

              {query.length >= 2 && results.length === 0 && !loading && (
                <div className="py-12 text-center text-gray-500">
                  <p>Nessun risultato trovato per "{query}"</p>
                </div>
              )}

              {loading && (
                <div className="py-12 text-center">
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 text-left group ${
                        index === selectedIndex ? 'bg-green-500/10 border border-green-500/30' : 'border border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        result.type === 'article' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {result.type === 'article' ? <FileText size={20} /> : <Layout size={20} />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-white font-medium truncate">{result.title}</span>
                          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            result.type === 'article' ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' : 'border-purple-500/30 text-purple-400 bg-purple-500/5'
                          }`}>
                            {result.type === 'article' ? 'Articolo' : 'Progetto'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {result.description || 'Nessuna descrizione disponibile'}
                        </p>
                      </div>

                      {index === selectedIndex && (
                        <div className="flex items-center gap-2 text-green-400">
                          <span className="text-[10px] font-mono opacity-60">Vai</span>
                          <CornerDownLeft size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-black/20 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest font-medium">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-white/10 px-1 rounded border border-white/10 text-gray-300">↑↓</kbd> Naviga
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="bg-white/10 px-1 rounded border border-white/10 text-gray-300">Enter</kbd> Seleziona
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowRight size={10} className="text-green-500" />
                <span>Global Search v1.0</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;

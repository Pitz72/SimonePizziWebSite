import { useState, useEffect } from 'react';
import { api } from '../api';
import { CategoryItem, Category } from '../types';

// Valori di fallback corrispondenti all'Enum Category originale
// (usati finché la chiamata API non risponde o in caso di errore)
export const DEFAULT_CATEGORIES: CategoryItem[] = [
    { id: 0, name: 'Videogiochi',               slug: Category.VIDEOGIOCHI,               sort_order: 1 },
    { id: 0, name: 'Progetti Software',         slug: Category.PROGETTI_SOFTWARE,         sort_order: 2 },
    { id: 0, name: 'Narrativa e Pubblicazioni', slug: Category.NARRATIVA_E_PUBBLICAZIONI, sort_order: 3 },
    { id: 0, name: 'Podcast, Audio e Altro',    slug: Category.PODCAST_AUDIO_ALTRO,       sort_order: 4 },
    { id: 0, name: 'Blog e Riflessioni',        slug: Category.BLOG_E_RIFLESSIONI,        sort_order: 5 },
];

export const useCategories = () => {
    // Inizializzato con i valori di fallback: le route vengono renderizzate subito
    const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getNavigation()
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setCategories(data);
                }
            })
            .catch(() => {
                // Mantieni i valori di default in caso di errore API
            })
            .finally(() => setLoading(false));
    }, []);

    return { categories, loading };
};

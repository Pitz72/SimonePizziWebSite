import { useState, useEffect } from 'react';
import { api } from '../api';
import { CategoryItem, Category } from '../types';

// Valori di fallback corrispondenti all'Enum Category originale
// (usati finché la chiamata API non risponde o in caso di errore)
// Nomi allineati a quelli pubblici correnti nel DB (evita il lampeggio di nomi
// obsoleti a ogni caricamento e nomi errati se l'API di navigazione fallisce).
export const DEFAULT_CATEGORIES: CategoryItem[] = [
    { id: 1, name: 'Videogiochi',     slug: Category.VIDEOGIOCHI,               sort_order: 1 },
    { id: 2, name: 'Software',        slug: Category.PROGETTI_SOFTWARE,         sort_order: 2 },
    { id: 3, name: 'Pubblicazioni',   slug: Category.NARRATIVA_E_PUBBLICAZIONI, sort_order: 3 },
    { id: 4, name: 'Podcast & Radio', slug: Category.PODCAST_AUDIO_ALTRO,       sort_order: 4 },
    { id: 5, name: 'Blog',            slug: Category.BLOG_E_RIFLESSIONI,        sort_order: 5 },
    { id: 6, name: 'Web',             slug: 'web',                              sort_order: 6 },
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

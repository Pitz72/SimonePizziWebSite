import { useState, useEffect } from 'react';
import { api } from '../api';
import { PortfolioItem, Category } from '../types';

// Funzione Helper per mappare il record del DB (Article) nel pre-esistente type PortfolioItem
const mapArticleToPortfolioItem = (article: any): PortfolioItem => {
    return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        summary: article.excerpt || '',
        description: article.content, // Verrà renderizzato da showdown altrove o passato nativamente se HTML
        imageUrl: article.cover_image || '/api/placeholder/800/600', // Placeholder fallback
        category: article.category as Category,
        tags: article.tags ? article.tags.split(',').map((t: string) => t.trim()) : [],
        isFeatured: article.is_featured === 1 || article.is_featured === true,
        // Mapping Bottoni
        link: article.button_a_link || undefined,
        buttonText: article.button_a_label || undefined,
        extraLink: article.button_b_link || undefined,
        extraLinkText: article.button_b_label || undefined,
        // Campi legacy non gestiti dal db CMS per ora, ma necessari al type
        isVisible: true,
        hasLetter: false
    };
};

export const useFetchArticles = (categoryFilter?: string) => {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            try {
                // Recuperiamo sempre tutti i published. Se passiamo un id categoryFilter lo aggiungiamo.
                // Poiché non siamo garantiti dall'API pubblica a nascondere le bozze (attualmente le espone tutte), 
                // dobbiamo filtrarle qui sul frontend, idealmente andrebbe filtrato in articles.php.
                // Per ora prendiamoli tutti e filtriamo.
                const data = await api.getArticles(categoryFilter);

                // Filter gestito a monte dal backend per gli utenti non autenticati.
                // Mappa verso PortfolioItem
                const mappedItems = data.map(mapArticleToPortfolioItem);

                setItems(mappedItems);
            } catch (err: any) {
                console.error("useFetchArticles error:", err);
                setError(err.message || 'Errore nel caricamento degli articoli.');
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, [categoryFilter]);

    return { items, loading, error };
};

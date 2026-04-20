import { useState, useEffect, useRef, useCallback } from 'react';
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
        publishedAt: article.published_at,
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

export const useFetchArticles = (categoryFilter?: string, limit: number = 10) => {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const pageRef = useRef(1);

    const loadData = async (isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
            pageRef.current += 1;
        } else {
            setLoading(true);
            pageRef.current = 1;
            setError(null);
        }

        try {
            const res = await api.getArticles(categoryFilter, false, pageRef.current, limit);
            const data = Array.isArray(res) ? res : res.data;
            const total = !Array.isArray(res) && res.total !== undefined ? res.total : data.length;

            const mappedItems = data.map(mapArticleToPortfolioItem);

            if (isLoadMore) {
                setItems(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newUnique = mappedItems.filter((i: PortfolioItem) => !existingIds.has(i.id));
                    return [...prev, ...newUnique];
                });
            } else {
                setItems(mappedItems);
            }

            setHasMore((isLoadMore ? items.length + mappedItems.length : mappedItems.length) < total);
            
        } catch (err: any) {
            console.error("useFetchArticles error:", err);
            setError(err.message || 'Errore nel caricamento degli articoli.');
            if (isLoadMore) pageRef.current -= 1;
        } finally {
            if (isLoadMore) setLoadingMore(false);
            else setLoading(false);
        }
    };

    useEffect(() => {
        loadData(false);
    }, [categoryFilter]); // Ignoriamo volontariamente limit per non ricaricare

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            loadData(true);
        }
    }, [loadingMore, hasMore, categoryFilter]);

    return { items, loading, error, hasMore, loadMore, loadingMore };
};

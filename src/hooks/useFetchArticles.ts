import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';
import { PortfolioItem } from '../types';

import { mapArticleToPortfolioItem } from '../utils/mappers';

/**
 * Carica articoli con paginazione "Carica altri".
 * `tagFilter` (v1.26.0) è alternativo a `categoryFilter`: alimenta /tag/:slug.
 */
export const useFetchArticles = (
    categoryFilter?: string,
    limit: number = 10,
    initialItems?: PortfolioItem[],
    tagFilter?: string
) => {
    const [items, setItems] = useState<PortfolioItem[]>(initialItems || []);
    const [loading, setLoading] = useState<boolean>(!initialItems);
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
            const res = await api.getArticles({
                category: categoryFilter,
                tag: tagFilter,
                admin: false,
                page: pageRef.current,
                limit
            });
            const data = Array.isArray(res) ? res : res.data;
            const total = !Array.isArray(res) && res.total !== undefined ? res.total : data.length;

            const mappedItems = data.map(mapArticleToPortfolioItem);

            if (isLoadMore) {
                setItems(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newUnique = mappedItems.filter((i: PortfolioItem) => !existingIds.has(i.id));
                    const merged = [...prev, ...newUnique];
                    // Calcolato dentro il callback per evitare closure stantia su items
                    setHasMore(merged.length < total);
                    return merged;
                });
            } else {
                setItems(mappedItems);
                setHasMore(mappedItems.length < total);
            }
            
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
    }, [categoryFilter, tagFilter]); // Ignoriamo volontariamente limit per non ricaricare

    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            loadData(true);
        }
    }, [loadingMore, hasMore, categoryFilter, tagFilter]);

    return { items, loading, error, hasMore, loadMore, loadingMore };
};

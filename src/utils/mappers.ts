import { PortfolioItem, Category } from '../types';

/**
 * Mappa un record grezzo dal database (Article) nel tipo PortfolioItem usato dal frontend.
 */
export const mapArticleToPortfolioItem = (article: any): PortfolioItem => {
    return {
        id: article.id,
        slug: article.slug,
        title: article.title,
        summary: article.excerpt || '',
        description: article.content,
        imageUrl: article.cover_image || '/api/placeholder/800/600',
        category: article.category as Category,
        tags: article.tags ? article.tags.split(',').map((t: string) => t.trim()) : [],
        isFeatured: article.is_featured === 1 || article.is_featured === true,
        publishedAt: article.published_at,
        link: article.button_a_link || undefined,
        buttonText: article.button_a_label || undefined,
        extraLink: article.button_b_link || undefined,
        extraLinkText: article.button_b_label || undefined,
        isVisible: true,
        hasLetter: article.tags && article.tags.toLowerCase().includes('lettera')
    };
};

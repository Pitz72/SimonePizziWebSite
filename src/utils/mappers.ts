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
        isCategoryPinned: article.is_category_pinned === 1 || article.is_category_pinned === true,
        publishedAt: article.published_at,
        link: article.button_a_link || undefined,
        buttonText: article.button_a_label || undefined,
        extraLink: article.button_b_link || undefined,
        extraLinkText: article.button_b_label || undefined,
        isVisible: true,
        hasLetter: article.tags && article.tags.toLowerCase().includes('lettera')
    };
};
/**
 * Mappa un record grezzo dal database (Project) nel tipo PortfolioItem usato dal frontend.
 */
export const mapProjectToPortfolioItem = (project: any): PortfolioItem => {
    return {
        id: project.id,
        slug: `project-${project.id}`, // I progetti usano URL diretti, ma serve uno slug per la chiave React
        title: project.name,
        summary: project.description || '',
        description: project.description || '',
        imageUrl: project.cover_image || '/api/placeholder/800/600',
        category: project.category as Category,
        tags: [],
        isFeatured: false,
        publishedAt: project.created_at,
        link: project.button_a_url || undefined,
        buttonText: project.button_a_label || undefined,
        extraLink: project.button_b_url || undefined,
        extraLinkText: project.button_b_label || undefined,
        isVisible: project.is_visible === 1 || project.is_visible === true,
    };
};

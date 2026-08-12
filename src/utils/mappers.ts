import { PortfolioItem, Category } from '../types';
import { slugify } from './slugify';

/**
 * Mappa un record grezzo dal database (Article) nel tipo PortfolioItem usato dal frontend.
 */
/** Normalizza il campo tags: accetta array, stringa CSV o valori assenti. */
const parseTags = (tags: any): string[] => {
    if (Array.isArray(tags)) return tags.map((t: any) => String(t).trim()).filter(Boolean);
    if (typeof tags === 'string') return tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    return [];
};

export const mapArticleToPortfolioItem = (article: any): PortfolioItem => {
    const tags = parseTags(article.tags);
    // [v1.26.0] Slug dei tag per costruire i link /tag/:slug. Il backend li
    // restituisce nello stesso ordine dei nomi (entrambi ORDER BY name).
    // Fallback su slugify solo per gli articoli legacy che hanno ancora i tag
    // nella vecchia colonna CSV e nessuna riga in article_tags.
    const rawSlugs = parseTags(article.tag_slugs);
    const tagSlugs = tags.map((name, i) => rawSlugs[i] || slugify(name));
    return {
        id: article.id,
        tagSlugs,
        slug: article.slug,
        title: article.title,
        summary: article.excerpt || '',
        description: article.content,
        imageUrl: article.cover_image || '/api/placeholder/800/600',
        category: article.category as Category,
        tags,
        isFeatured: article.is_featured === 1 || article.is_featured === true,
        isCategoryPinned: article.is_category_pinned === 1 || article.is_category_pinned === true,
        publishedAt: article.published_at,
        link: article.button_a_link || undefined,
        buttonText: article.button_a_label || undefined,
        extraLink: article.button_b_link || undefined,
        extraLinkText: article.button_b_label || undefined,
        isVisible: true,
        hasLetter: tags.some(t => t.toLowerCase().includes('lettera'))
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
        tagSlugs: [],
        isFeatured: false,
        publishedAt: project.created_at,
        link: project.button_a_url || undefined,
        buttonText: project.button_a_label || undefined,
        extraLink: project.button_b_url || undefined,
        extraLinkText: project.button_b_label || undefined,
        isVisible: project.is_visible === 1 || project.is_visible === true,
    };
};

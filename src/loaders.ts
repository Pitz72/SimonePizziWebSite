import { LoaderFunctionArgs, redirect } from 'react-router-dom';
import { api } from './api';
import { mapArticleToPortfolioItem, mapProjectToPortfolioItem } from './utils/mappers';
import { CategoryItem } from './types';

/**
 * Loader per la protezione delle rotte Admin.
 * Verifica la sessione prima di caricare qualsiasi dato.
 */
export const adminAuthLoader = async () => {
    try {
        const session = await api.checkSession();
        if (!session || !session.user) {
            return redirect('/admin/login');
        }
        return session;
    } catch {
        return redirect('/admin/login');
    }
};

// --- PUBLIC LOADERS ---

export const portfolioLoader = async () => {
    const [articlesRes, projectsRes] = await Promise.all([
        api.getArticles({ limit: 10 }),
        api.getProjects()
    ]);
    
    const articlesData = Array.isArray(articlesRes) ? articlesRes : articlesRes.data;
    const projectsData = Array.isArray(projectsRes) ? projectsRes : projectsRes.data;

    // Ordiniamo i progetti per data di creazione decrescente per prendere gli ultimi 4
    const recentProjects = projectsData
        .filter((p: any) => p.is_visible === 1 || p.is_visible === true)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4);

    return {
        articles: articlesData.map(mapArticleToPortfolioItem),
        projects: recentProjects.map(mapProjectToPortfolioItem)
    };
};

export const allProjectsLoader = async () => {
    const [projects, categories] = await Promise.all([
        api.getProjects(),
        api.getCategories()
    ]);
    return { projects, categories };
};

export const categoryArticlesLoader = async ({ params }: LoaderFunctionArgs) => {
    const { categorySlug } = params;
    if (!categorySlug) throw new Error("Categoria non specificata");
    
    // Recuperiamo in parallelo categorie e articoli per abbattere la latenza
    const [categories, res] = await Promise.all([
        api.getCategories(),
        api.getArticles({ category: categorySlug, limit: 100 })
    ]);

    const category = (categories as CategoryItem[]).find(c => c.slug === categorySlug);
    
    if (!category) {
        throw new Response("Categoria non trovata", { status: 404 });
    }

    const data = Array.isArray(res) ? res : res.data;
    const articles = data.map(mapArticleToPortfolioItem);
    
    return { category, articles };
};

export const singleArticleLoader = async ({ params }: LoaderFunctionArgs) => {
    const { projectSlug } = params;
    if (!projectSlug) throw new Error("Slug non specificato");
    
    const article = await api.getArticleBySlug(projectSlug);
    if (!article) {
        throw new Response("Articolo non trovato", { status: 404 });
    }
    
    const mappedArticle = mapArticleToPortfolioItem(article);
    
    // Recupera le reazioni in parallelo dopo aver ottenuto l'id articolo
    const reactions = await api.getReactions(article.id);
    
    return { article: mappedArticle, reactions };
};

// --- ADMIN LOADERS ---

export const adminDashboardLoader = async () => {
    const [stats, analytics] = await Promise.all([
        api.getStats(),
        api.getAnalytics()
    ]);
    return { stats, analytics };
};

export const adminArticlesLoader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const q = url.searchParams.get('q') || '';
    const category = url.searchParams.get('category') || '';
    const tag = url.searchParams.get('tag') || '';
    const startDate = url.searchParams.get('startDate') || '';
    const endDate = url.searchParams.get('endDate') || '';
    
    return await api.getArticles({ admin: true, page, limit: 10, q, category, tag, startDate, endDate });
};

export const adminArticleEditLoader = async ({ params }: LoaderFunctionArgs) => {
    const { id } = params;
    
    const [article, categories, tags] = await Promise.all([
        id ? api.getArticle(parseInt(id)) : Promise.resolve(null),
        api.getCategories(),
        api.getTags()
    ]);

    // Recupera analytics solo in modalità edit (l'articolo esiste già)
    const articleAnalytics = (id && article)
        ? await api.getArticleAnalytics(parseInt(id), 30)
        : { total_views: 0, daily_views: [] };
    
    return { article, categories, tags, articleAnalytics };
};

export const adminProjectsLoader = async ({ request }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || '';
    
    const [projects, categories] = await Promise.all([
        api.getProjects(category || undefined),
        api.getCategories()
    ]);
    
    return { projects, categories };
};

export const adminProjectEditLoader = async ({ params }: LoaderFunctionArgs) => {
    const { id } = params;
    const [project, categories] = await Promise.all([
        id ? api.getProject(parseInt(id)) : Promise.resolve(null),
        api.getCategories()
    ]);
    return { project, categories };
};

export const adminCategoriesLoader = async () => {
    return await api.getCategories();
};

export const adminTagsLoader = async () => {
    return await api.getTags();
};

export const adminNewsletterLoader = async () => {
    const [subscribers, history, articles] = await Promise.all([
        api.getSubscribers(),
        api.getNewsletterHistory(),
        api.getArticles({ limit: 10 })
    ]);
    return { subscribers, history, articles: Array.isArray(articles) ? articles : articles.data };
};

export const adminSettingsLoader = async () => {
    return await api.getAppSettings();
};
export const adminMediaLoader = async () => {
    return await api.getMedia();
};

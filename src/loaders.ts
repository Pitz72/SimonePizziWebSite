import { LoaderFunctionArgs, redirect } from 'react-router-dom';
import { api } from './api';
import { mapArticleToPortfolioItem, mapProjectToPortfolioItem } from './utils/mappers';
import { CategoryItem, PortfolioItem } from './types';

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

/**
 * [v1.26.0] Archivio per tag: /tag/:tagSlug.
 * Un tag inesistente o senza articoli pubblicati alza un 404 vero, coerente
 * con quanto index.php serve ai crawler (niente pagine archivio vuote indicizzate).
 */
export const tagArticlesLoader = async ({ params }: LoaderFunctionArgs) => {
    const { tagSlug } = params;
    if (!tagSlug) throw new Response('Tag non specificato', { status: 404 });

    const tag = await api.getTagBySlug(tagSlug);
    if (!tag) throw new Response('Tag non trovato', { status: 404 });

    const res = await api.getArticles({ tag: tag.slug, limit: 100 });
    const data = Array.isArray(res) ? res : res.data;
    const articles = data.map(mapArticleToPortfolioItem);

    if (articles.length === 0) throw new Response('Tag senza articoli', { status: 404 });

    return { tag, articles };
};

export const singleArticleLoader = async ({ params, request }: LoaderFunctionArgs) => {
    const { projectSlug } = params;
    if (!projectSlug) throw new Error("Slug non specificato");

    // [v1.26.0] Anteprima bozza: articles.php restituisce già gli articoli non
    // pubblicati quando esiste una sessione admin. Qui serve solo sapere che
    // siamo in anteprima, per mostrare il banner e non contare la visita.
    const isPreview = new URL(request.url).searchParams.get('preview') === '1';

    const article = await api.getArticleBySlug(projectSlug);
    if (!article) {
        throw new Response("Articolo non trovato", { status: 404 });
    }

    const mappedArticle = mapArticleToPortfolioItem(article);
    const previewStatus: string | undefined = article.status;

    // Recupera le reazioni in parallelo dopo aver ottenuto l'id articolo
    const reactions = await api.getReactions(article.id);

    // Articoli correlati: stessa categoria, escluso l'articolo corrente, max 3.
    // Fallback silenzioso a lista vuota: la sezione viene semplicemente nascosta.
    let related: PortfolioItem[] = [];
    try {
        const relRes = await api.getArticles({ category: article.category, limit: 7 });
        const relData = Array.isArray(relRes) ? relRes : relRes.data;
        related = relData
            .map(mapArticleToPortfolioItem)
            .filter((a: PortfolioItem) => a.id !== mappedArticle.id)
            .slice(0, 3);
    } catch {
        related = [];
    }

    return { article: mappedArticle, reactions, related, isPreview, previewStatus };
};

// --- ADMIN LOADERS ---

export const adminDashboardLoader = async () => {
    try {
        const [stats, analytics] = await Promise.all([
            api.getStats(),
            api.getAnalytics()
        ]);
        return { stats, analytics };
    } catch {
        // Degrado morbido: se stats/analytics falliscono la dashboard mostra zeri
        // invece di crashare (il componente accede a rawStats.* senza guardie).
        const stats = {
            total_articles: 0, total_media: 0, total_subscribers: 0,
            total_views: 0, total_clicks: 0, system_status: 'Non disponibile'
        };
        const analytics = {
            total_views: 0, total_clicks: 0, total_reactions: 0,
            top_articles: [], top_articles_by_reactions: [],
            clicks_by_button: [], reactions_by_type: [], weekly_views: []
        };
        return { stats, analytics };
    }
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

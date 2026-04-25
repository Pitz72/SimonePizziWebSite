import PortfolioGrid from "../src/components/PortfolioGrid";
import { api } from "../src/api";

export default async function Home() {
  let data = [];
  try {
    const res = await api.getArticles({ limit: 40 });
    data = Array.isArray(res) ? res : res.data || [];
  } catch (error) {
    console.error("Failed to fetch articles:", error);
  }

  // Mapping logic based on portfolioLoader
  const mapArticleToPortfolioItem = (article: any) => ({
    id: article.id,
    title: article.title,
    category: article.category_slug,
    imageUrl: article.cover_image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    slug: article.slug,
    summary: article.excerpt || article.content.substring(0, 150) + '...',
    publishedAt: article.published_at,
    isFeatured: Boolean(article.is_featured)
  });

  const items = data.map(mapArticleToPortfolioItem);

  return <PortfolioGrid items={items} />;
}
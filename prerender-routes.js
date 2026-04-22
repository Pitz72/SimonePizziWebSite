/**
 * Script per generare la lista di route da prerendere
 * Scopre tutte le categorie e gli articoli dal backend PHP
 * Usato da vite-plugin-prerender durante il build
 */

const BASE_URL = 'http://localhost:8888'; // Localhost per lo sviluppo locale
const API_URL = `${BASE_URL}/api`;

async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/categories.php`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const categories = await res.json();
    console.log(`✓ Scoperte ${categories.length} categorie`);
    return categories;
  } catch (err) {
    console.error('Errore nel recupero categorie:', err.message);
    return [];
  }
}

async function fetchArticles(categorySlug, limit = 1000) {
  try {
    const res = await fetch(`${API_URL}/articles.php?category=${encodeURIComponent(categorySlug)}&limit=${limit}&admin=false`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const articles = Array.isArray(data) ? data : (data.data || []);
    console.log(`  ✓ Categoria "${categorySlug}": ${articles.length} articoli`);
    return articles;
  } catch (err) {
    console.error(`  ✗ Errore categoria "${categorySlug}":`, err.message);
    return [];
  }
}

async function generateRoutes() {
  console.log('🔍 Generazione route per prerendering...\n');

  // Route statiche (sempre presenti)
  const staticRoutes = [
    '/',
    '/tutti-i-progetti',
    '/contatti',
    '/newsletter/confermato',
    '/newsletter/disiscritto',
  ];

  // Scopri categorie
  const categories = await fetchCategories();
  if (categories.length === 0) {
    console.warn('⚠️  Nessuna categoria trovata, usando solo route statiche');
    return staticRoutes;
  }

  // Scopri articoli per ogni categoria
  const dynamicRoutes = [];
  for (const category of categories) {
    const articles = await fetchArticles(category.slug);
    
    // Aggiungi rotta categoria
    dynamicRoutes.push(`/${category.slug}`);

    // Aggiungi rotte singoli articoli
    for (const article of articles) {
      dynamicRoutes.push(`/${category.slug}/${article.slug}`);
    }
  }

  const allRoutes = [...staticRoutes, ...dynamicRoutes];
  console.log(`\n✅ Totale route generate: ${allRoutes.length}`);
  console.log(`   Statiche: ${staticRoutes.length}`);
  console.log(`   Dinamiche: ${dynamicRoutes.length}\n`);

  return allRoutes;
}

// Esporta per uso in prerender.js
export { generateRoutes };

import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useLocation, Outlet, useLoaderData } from 'react-router-dom';
import { PortfolioItem, CategoryItem } from './types';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import PortfolioGrid from './components/PortfolioGrid';
import ArticleArchive from './components/ArticleArchive';
import SingleArticle from './components/SingleArticle';
import SEO from './components/SEO';
import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';
import SearchModal from './components/SearchModal';
import Loader from './components/Loader';

// Lazy imports per ottimizzazione bundle (Code Splitting)
const Login = React.lazy(() => import('./pages/admin/Login'));
const RecoveryRequest = React.lazy(() => import('./pages/admin/RecoveryRequest'));
const ResetPassword = React.lazy(() => import('./pages/admin/ResetPassword'));
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const Settings = React.lazy(() => import('./pages/admin/Settings'));
const ArticlesList = React.lazy(() => import('./pages/admin/ArticlesList'));
const ArticleEditor = React.lazy(() => import('./pages/admin/ArticleEditor'));
const MediaGallery = React.lazy(() => import('./pages/admin/MediaGallery'));
const ProjectsList = React.lazy(() => import('./pages/admin/ProjectsList'));
const ProjectEditor = React.lazy(() => import('./pages/admin/ProjectEditor'));
const CategoryManager = React.lazy(() => import('./pages/admin/CategoryManager'));
const TagsList = React.lazy(() => import('./pages/admin/TagsList'));
const NewsletterAdmin = React.lazy(() => import('./pages/admin/NewsletterAdmin'));

const AllProjects = React.lazy(() => import('./pages/AllProjects'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const NewsletterConfirm = React.lazy(() => import('./pages/NewsletterConfirm'));
const NewsletterUnsubscribe = React.lazy(() => import('./pages/NewsletterUnsubscribe'));

const backgroundStyle = {
  background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.3), rgba(0, 0, 0, 0))',
};

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Wrapper per caricare l'archivio basandosi sui dati caricati dal loader
const DynamicArchiveWrapper = () => {
  const { category, articles } = useLoaderData() as { category: CategoryItem, articles: PortfolioItem[] };

  return <ArticleArchive title={category.name} category={category.slug} initialItems={articles} />;
};

const PublicLayout: React.FC = () => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <ScrollToTop />
      <ScrollProgress />
      <BackToTop />
      <SEO /> {/* Default SEO */}
      <div className="min-h-screen bg-black text-gray-200" style={backgroundStyle}>
        <ParticleBackground />
        <div className="absolute inset-0 h-full w-full bg-black bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10"></div>

        <Header onOpenSearch={() => setIsSearchOpen(true)} />
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

        <main className="px-4 sm:px-6 lg:px-8">
          <React.Suspense fallback={<Loader />}>
            <Outlet />
          </React.Suspense>
        </main>

        <Footer />
      </div>
    </>
  );
};

import { 
  portfolioLoader, allProjectsLoader, categoryArticlesLoader, singleArticleLoader,
  adminDashboardLoader, adminArticlesLoader, adminArticleEditLoader, 
  adminProjectsLoader, adminProjectEditLoader, adminCategoriesLoader, 
  adminTagsLoader, adminNewsletterLoader, adminSettingsLoader,
  adminAuthLoader
} from './loaders';

// Definizione del router con createBrowserRouter (Richiesto per useBlocker in RR7)
const router = createBrowserRouter([
  {
    // Rotte Admin (Fuori dal PublicLayout)
    path: "/admin",
    children: [
      { path: "login", element: <Login /> },
      { path: "recovery", element: <RecoveryRequest /> },
      { path: "reset-password/:token", element: <ResetPassword /> },
      {
        path: "",
        element: <AdminLayout />,
        loader: adminAuthLoader,
        HydrateFallback: Loader,
        children: [
          { index: true, element: <Dashboard />, loader: adminDashboardLoader },
          { path: "dashboard", element: <Dashboard />, loader: adminDashboardLoader },
          { path: "settings", element: <Settings />, loader: adminSettingsLoader },
          { path: "articles", element: <ArticlesList />, loader: adminArticlesLoader },
          { path: "articles/new", element: <ArticleEditor />, loader: adminArticleEditLoader },
          { path: "articles/edit/:id", element: <ArticleEditor />, loader: adminArticleEditLoader },
          { path: "projects", element: <ProjectsList />, loader: adminProjectsLoader },
          { path: "projects/new", element: <ProjectEditor />, loader: adminProjectEditLoader },
          { path: "projects/edit/:id", element: <ProjectEditor />, loader: adminProjectEditLoader },
          { path: "media", element: <MediaGallery /> },
          { path: "categories", element: <CategoryManager />, loader: adminCategoriesLoader },
          { path: "tags", element: <TagsList />, loader: adminTagsLoader },
          { path: "newsletter", element: <NewsletterAdmin />, loader: adminNewsletterLoader },
        ]
      }
    ]
  },
  {
    // Rotte Pubbliche (Dentro PublicLayout)
    path: "/",
    element: <PublicLayout />,
    HydrateFallback: Loader,
    children: [
      { index: true, element: <PortfolioGrid />, loader: portfolioLoader },
      { path: "tutti-i-progetti", element: <AllProjects />, loader: allProjectsLoader },
      { path: "contatti", element: <ContactPage /> },
      { path: "newsletter/confermato", element: <NewsletterConfirm /> },
      { path: "newsletter/disiscritto", element: <NewsletterUnsubscribe /> },
      
      // Gestione dinamica delle categorie (Fallback su slugs)
      {
          path: ":categorySlug",
          element: <DynamicArchiveWrapper />,
          loader: categoryArticlesLoader
      },
      {
          path: ":categorySlug/:projectSlug",
          element: <SingleArticle />,
          loader: singleArticleLoader
      },

      { path: "*", element: <div className="min-h-[50vh] flex items-center justify-center text-white text-2xl">404 - Pagina non trovata</div>}
    ]
  }
]);

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <React.Suspense fallback={<Loader />}>
        <RouterProvider router={router} />
      </React.Suspense>
    </HelmetProvider>
  );
};

export default App;

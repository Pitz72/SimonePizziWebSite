import React, { useEffect, useRef } from 'react';
import { createBrowserRouter, RouterProvider, useLocation, Outlet, useLoaderData, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioItem, CategoryItem } from './types';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
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

// ── Custom cursor (pointer devices only) ──────────────────────
const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
      animId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    animId = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cur-dot" aria-hidden="true" />
      <div ref={ringRef} className="cur-ring" aria-hidden="true" />
    </>
  );
};

// Component to handle scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

// Wrapper per caricare l'archivio basandosi sui dati caricati dal loader
const DynamicArchiveWrapper = () => {
  const { category, articles } = useLoaderData() as { category: CategoryItem, articles: PortfolioItem[] };
  return <ArticleArchive title={category.name} category={category.slug} initialItems={articles} />;
};

// Componente per gestire gli errori in modo elegante (UX Premium)
const RootBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return (
        <div className="min-h-screen text-white flex flex-col items-center justify-center p-4" style={{ background: '#05080a' }}>
          <h1 className="text-6xl font-bold text-dis-green mb-4 font-serif">404</h1>
          <p className="text-xl text-v3-fg2 mb-8 text-center max-w-md">La pagina che cerchi è svanita nel vuoto digitale o non è mai esistita.</p>
          <a href="/" className="px-8 py-3 bg-dis-green text-black font-bold transition-all hover:bg-green-400">Torna in superficie</a>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen text-white flex flex-col items-center justify-center p-4" style={{ background: '#05080a' }}>
      <h1 className="text-4xl font-bold text-red-500 mb-4">Errore di Sistema</h1>
      <p className="text-xl text-v3-fg2 mb-8 text-center max-w-md">Si è verificato un problema tecnico durante il recupero dei dati.</p>
      <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 hover:bg-red-500 transition-all font-bold">Riavvia Moduli</button>
    </div>
  );
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
      <SEO />
      <CustomCursor />

      {/* V3 Grain texture */}
      <div className="v3-grain" aria-hidden="true" />

      {/* V3 Atmosphere — dual aurora top-left + top-right */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at -10% -10%, rgba(34,197,94,0.09) 0%, transparent 65%),
            radial-gradient(ellipse 50% 50% at 110% -5%,  rgba(34,197,94,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 80% 40% at 50% 110%,  rgba(34,197,94,0.04) 0%, transparent 60%)
          `,
        }}
      />

      {/* V3 Grid texture — green-tinted lines */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,197,94,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,197,94,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 80% 80% at 50% 0%, #000 30%, transparent 100%)',
        }}
      />

      <div className="relative z-10 min-h-screen text-gray-200">
        <Header onOpenSearch={() => setIsSearchOpen(true)} />
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

        <main>
          <AnimatePresence>
            <motion.div
              key={useLocation().pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <React.Suspense fallback={<Loader />}>
                <Outlet />
              </React.Suspense>
            </motion.div>
          </AnimatePresence>
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
  adminAuthLoader, adminMediaLoader
} from './loaders';

const router = createBrowserRouter([
  {
    path: '/admin',
    children: [
      { path: 'login', element: <Login /> },
      { path: 'recovery', element: <RecoveryRequest /> },
      { path: 'reset-password/:token', element: <ResetPassword /> },
      {
        path: '',
        element: <AdminLayout />,
        loader: adminAuthLoader,
        HydrateFallback: Loader,
        children: [
          { index: true, element: <Dashboard />, loader: adminDashboardLoader },
          { path: 'dashboard', element: <Dashboard />, loader: adminDashboardLoader },
          { path: 'settings', element: <Settings />, loader: adminSettingsLoader },
          { path: 'articles', element: <ArticlesList />, loader: adminArticlesLoader },
          { path: 'articles/new', element: <ArticleEditor />, loader: adminArticleEditLoader },
          { path: 'articles/edit/:id', element: <ArticleEditor />, loader: adminArticleEditLoader },
          { path: 'projects', element: <ProjectsList />, loader: adminProjectsLoader },
          { path: 'projects/new', element: <ProjectEditor />, loader: adminProjectEditLoader },
          { path: 'projects/edit/:id', element: <ProjectEditor />, loader: adminProjectEditLoader },
          { path: 'media', element: <MediaGallery />, loader: adminMediaLoader },
          { path: 'categories', element: <CategoryManager />, loader: adminCategoriesLoader },
          { path: 'tags', element: <TagsList />, loader: adminTagsLoader },
          { path: 'newsletter', element: <NewsletterAdmin />, loader: adminNewsletterLoader },
        ]
      }
    ]
  },
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <RootBoundary />,
    HydrateFallback: Loader,
    children: [
      { index: true, element: <PortfolioGrid />, loader: portfolioLoader },
      { path: 'tutti-i-progetti', element: <AllProjects />, loader: allProjectsLoader },
      { path: 'contatti', element: <ContactPage /> },
      { path: 'newsletter/confermato', element: <NewsletterConfirm /> },
      { path: 'newsletter/disiscritto', element: <NewsletterUnsubscribe /> },
      { path: ':categorySlug', element: <DynamicArchiveWrapper />, loader: categoryArticlesLoader },
      { path: ':categorySlug/:projectSlug', element: <SingleArticle />, loader: singleArticleLoader },
      { path: '*', element: <div className="min-h-[50vh] flex items-center justify-center text-white text-2xl">404 - Pagina non trovata</div> }
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

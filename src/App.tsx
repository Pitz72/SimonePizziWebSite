import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useLocation, Outlet, useParams } from 'react-router-dom';
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
import Login from './pages/admin/Login';
import RecoveryRequest from './pages/admin/RecoveryRequest';
import ResetPassword from './pages/admin/ResetPassword';
import AdminLayout from './pages/admin/AdminLayout';

import Dashboard from './pages/admin/Dashboard';
import Settings from './pages/admin/Settings';
import ArticlesList from './pages/admin/ArticlesList';
import ArticleEditor from './pages/admin/ArticleEditor';
import MediaGallery from './pages/admin/MediaGallery';
import ProjectsList from './pages/admin/ProjectsList';
import ProjectEditor from './pages/admin/ProjectEditor';
import CategoryManager from './pages/admin/CategoryManager';
import TagsList from './pages/admin/TagsList';
import NewsletterAdmin from './pages/admin/NewsletterAdmin';
import AllProjects from './pages/AllProjects';
import ContactPage from './pages/ContactPage';
import NewsletterConfirm from './pages/NewsletterConfirm';
import NewsletterUnsubscribe from './pages/NewsletterUnsubscribe';
import { useCategories } from './hooks/useCategories';

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

// Wrapper per caricare l'archivio basandosi sullo slug nella URL (per createBrowserRouter)
const DynamicArchiveWrapper = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const { categories } = useCategories();
  const category = categories.find(c => c.slug === categorySlug);

  if (!category) {
      // Potrebbe essere un 404 o un caricamento
      return <div className="min-h-[50vh] flex items-center justify-center text-white text-2xl">Caricamento categoria...</div>;
  }

  return <ArticleArchive title={category.name} category={category.slug} />;
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
          <Outlet />
        </main>

        <Footer />
      </div>
    </>
  );
};

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
        children: [
          { index: true, element: <Dashboard /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "settings", element: <Settings /> },
          { path: "articles", element: <ArticlesList /> },
          { path: "articles/new", element: <ArticleEditor /> },
          { path: "articles/edit/:id", element: <ArticleEditor /> },
          { path: "projects", element: <ProjectsList /> },
          { path: "projects/new", element: <ProjectEditor /> },
          { path: "projects/edit/:id", element: <ProjectEditor /> },
          { path: "media", element: <MediaGallery /> },
          { path: "categories", element: <CategoryManager /> },
          { path: "tags", element: <TagsList /> },
          { path: "newsletter", element: <NewsletterAdmin /> },
        ]
      }
    ]
  },
  {
    // Rotte Pubbliche (Dentro PublicLayout)
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <PortfolioGrid /> },
      { path: "tutti-i-progetti", element: <AllProjects /> },
      { path: "contatti", element: <ContactPage /> },
      { path: "newsletter/confermato", element: <NewsletterConfirm /> },
      { path: "newsletter/disiscritto", element: <NewsletterUnsubscribe /> },
      
      // Gestione dinamica delle categorie (Fallback su slugs)
      {
          path: ":categorySlug",
          element: <DynamicArchiveWrapper />
      },
      {
          path: ":categorySlug/:projectSlug",
          element: <SingleArticle />
      },

      { path: "*", element: <div className="min-h-[50vh] flex items-center justify-center text-white text-2xl">404 - Pagina non trovata</div>}
    ]
  }
]);

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  );
};

export default App;

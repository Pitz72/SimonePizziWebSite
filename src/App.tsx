import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import Login from './pages/admin/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Settings from './pages/admin/Settings';
import ArticlesList from './pages/admin/ArticlesList';
import ArticleEditor from './pages/admin/ArticleEditor';
import MediaGallery from './pages/admin/MediaGallery';
import ProjectsList from './pages/admin/ProjectsList';
import ProjectEditor from './pages/admin/ProjectEditor';
import CategoryManager from './pages/admin/CategoryManager';
import NewsletterAdmin from './pages/admin/NewsletterAdmin';
import AllProjects from './pages/AllProjects';
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

const PublicLayout: React.FC = () => {
  const { categories } = useCategories();

  return (
    <>
      <ScrollToTop />
      <ScrollProgress />
      <BackToTop />
      <SEO /> {/* Default SEO */}
      <div className="min-h-screen bg-black text-gray-200" style={backgroundStyle}>
        <ParticleBackground />
        <div className="absolute inset-0 h-full w-full bg-black bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10"></div>

        <Header />

        <main className="px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<PortfolioGrid />} />
            <Route path="/tutti-i-progetti" element={<AllProjects />} />
            <Route path="/newsletter/confermato" element={<NewsletterConfirm />} />
            <Route path="/newsletter/disiscritto" element={<NewsletterUnsubscribe />} />

            {/* Route dinamiche generate dalle categorie caricate dal DB */}
            {categories.map(cat => (
              <React.Fragment key={cat.slug}>
                <Route
                  path={`/${cat.slug}`}
                  element={<ArticleArchive title={cat.name} category={cat.slug} />}
                />
                <Route
                  path={`/${cat.slug}/:projectSlug`}
                  element={<SingleArticle />}
                />
              </React.Fragment>
            ))}

            <Route path="*" element={<div className="min-h-[50vh] flex items-center justify-center text-white text-2xl">404 - Pagina non trovata</div>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Rotte del Pannello di Controllo */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="articles" element={<ArticlesList />} />
            <Route path="articles/new" element={<ArticleEditor />} />
            <Route path="articles/edit/:id" element={<ArticleEditor />} />
            <Route path="projects" element={<ProjectsList />} />
            <Route path="projects/new" element={<ProjectEditor />} />
            <Route path="projects/edit/:id" element={<ProjectEditor />} />
            <Route path="media" element={<MediaGallery />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="newsletter" element={<NewsletterAdmin />} />
            <Route index element={<Dashboard />} />
          </Route>

          {/* Rotte Pubbliche */}
          <Route path="/*" element={<PublicLayout />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
};

export default App;

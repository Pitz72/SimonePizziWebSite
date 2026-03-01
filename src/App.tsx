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
import { Category } from './types';

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
            <Route
              path={`/${Category.VIDEOGIOCHI}`}
              element={<ArticleArchive title="Videogiochi" category={Category.VIDEOGIOCHI} />}
            />
            <Route
              path={`/${Category.VIDEOGIOCHI}/:projectSlug`}
              element={<SingleArticle />}
            />
            <Route
              path={`/${Category.PROGETTI_SOFTWARE}`}
              element={<ArticleArchive title="Progetti Software" category={Category.PROGETTI_SOFTWARE} />}
            />
            <Route
              path={`/${Category.PROGETTI_SOFTWARE}/:projectSlug`}
              element={<SingleArticle />}
            />
            <Route
              path={`/${Category.NARRATIVA_E_PUBBLICAZIONI}`}
              element={<ArticleArchive title="Narrativa e Pubblicazioni" category={Category.NARRATIVA_E_PUBBLICAZIONI} />}
            />
            <Route
              path={`/${Category.NARRATIVA_E_PUBBLICAZIONI}/:projectSlug`}
              element={<SingleArticle />}
            />
            <Route
              path={`/${Category.PODCAST_AUDIO_ALTRO}`}
              element={<ArticleArchive title="Podcast, Audio e Altro" category={Category.PODCAST_AUDIO_ALTRO} />}
            />
            <Route
              path={`/${Category.PODCAST_AUDIO_ALTRO}/:projectSlug`}
              element={<SingleArticle />}
            />
            <Route
              path={`/${Category.BLOG_E_RIFLESSIONI}`}
              element={<ArticleArchive title="Blog e Riflessioni" />}
            />
            <Route
              path={`/${Category.BLOG_E_RIFLESSIONI}/:projectSlug`}
              element={<SingleArticle />}
            />
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
            <Route path="media" element={<MediaGallery />} />
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

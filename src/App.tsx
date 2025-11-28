import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/Header';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import HomePage from './components/PortfolioGrid';
import PortfolioShowcase from './components/PortfolioShowcase';
import SEO from './components/SEO';
import { portfolioData } from './data/portfolioData';
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

import ScrollProgress from './components/ScrollProgress';
import BackToTop from './components/BackToTop';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
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
              <Route path="/" element={<HomePage />} />
              <Route
                path={`/${Category.VIDEOGIOCHI}`}
                element={<PortfolioShowcase title="Videogiochi" items={portfolioData[Category.VIDEOGIOCHI]} />}
              />
              <Route
                path={`/${Category.PROGETTI_SOFTWARE}`}
                element={<PortfolioShowcase title="Progetti Software" items={portfolioData[Category.PROGETTI_SOFTWARE]} />}
              />
              <Route
                element={<PortfolioShowcase title="Narrativa e Pubblicazioni" items={portfolioData[Category.NARRATIVA_E_PUBBLICAZIONI]} />}
              />
              <Route
                path={`/${Category.PODCAST_AUDIO_ALTRO}`}
                element={<PortfolioShowcase title="Podcast, Audio e Altro" items={portfolioData[Category.PODCAST_AUDIO_ALTRO]} />}
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  );
};

export default App;

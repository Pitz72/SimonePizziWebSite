import React from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import ParticleBackground from './components/ParticleBackground';
import HomePage from './components/PortfolioGrid';
import PortfolioShowcase from './components/PortfolioShowcase';
import { portfolioData } from './data/portfolioData';
import { Category } from './types';
import { useHashNavigation } from './utils/navigation';

const backgroundStyle = {
  background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34, 197, 94, 0.3), rgba(0, 0, 0, 0))',
};

const App: React.FC = () => {
  const route = useHashNavigation();
  
  const renderPage = () => {
    switch (route) {
      case Category.VIDEOGIOCHI:
        return <PortfolioShowcase key={Category.VIDEOGIOCHI} title="Videogiochi" items={portfolioData[Category.VIDEOGIOCHI]} />;
      case Category.PROGETTI_SOFTWARE:
        return <PortfolioShowcase key={Category.PROGETTI_SOFTWARE} title="Progetti Software" items={portfolioData[Category.PROGETTI_SOFTWARE]} />;
      case Category.NARRATIVA_E_PUBBLICAZIONI:
        return <PortfolioShowcase key={Category.NARRATIVA_E_PUBBLICAZIONI} title="Narrativa e Pubblicazioni" items={portfolioData[Category.NARRATIVA_E_PUBBLICAZIONI]} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200" style={backgroundStyle}>
      <ParticleBackground />
      <div className="absolute inset-0 h-full w-full bg-black bg-[linear-gradient(to_right,#161616_1px,transparent_1px),linear-gradient(to_bottom,#161616_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-10"></div>
      
      <Header currentRoute={route} />
      
      <main className="px-4 sm:px-6 lg:px-8">
        <div key={route} className="animate-fade-in">
          {renderPage()}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
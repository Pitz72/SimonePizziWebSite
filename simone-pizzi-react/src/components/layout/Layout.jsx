import React from 'react';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

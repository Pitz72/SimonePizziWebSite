import React from 'react';
import Header from './Header';
import Footer from './Footer';
import Breadcrumb from '../ui/Breadcrumb';
import ScrollProgress from '../ui/ScrollProgress';
import { ToastContainer, useToast } from '../ui/Toast';

const Layout = ({ children }) => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      <ScrollProgress />
      <Header />
      <Breadcrumb />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default Layout;

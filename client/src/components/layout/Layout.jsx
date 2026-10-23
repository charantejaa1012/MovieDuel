import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-[#09090B] text-[#F4F4F5]">
      <Navbar />
      <main className={`flex-1 w-full flex flex-col ${isHome ? '' : 'pt-20 sm:pt-24'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;

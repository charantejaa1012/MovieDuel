import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#09090B] text-[#F4F4F5]">
      <Navbar />
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;

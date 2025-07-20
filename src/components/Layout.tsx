import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14 sm:pt-16">
        <Outlet />
      </main>
    </div>
  );
};
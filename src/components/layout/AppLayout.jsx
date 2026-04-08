import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ThemeProvider, useTheme } from '@/lib/Theme';

function AppLayoutInner() {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen bg-background ${theme}`}>
      <Sidebar />
      <main className="lg:ml-64 min-h-screen transition-all duration-300">
        <div className="p-4 pt-16 lg:pt-6 lg:p-8 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default function AppLayout() {
  return (
    <ThemeProvider>
      <AppLayoutInner />
    </ThemeProvider>
  );
}
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Background Blurs for Glassmorphism wrapped to prevent overflow and unintended root scrolling */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="glass-blob-1 absolute -left-20 -top-20 w-[40vw] h-[40vw] max-w-[600px] rounded-full bg-blue-400/10 dark:bg-blue-600/5 blur-[120px]" />
        <div className="glass-blob-2 absolute -right-20 -bottom-20 w-[40vw] h-[40vw] max-w-[600px] rounded-full bg-purple-400/10 dark:bg-purple-600/5 blur-[120px]" />
        <div className="glass-blob-3 absolute left-[30vw] top-[20vh] w-[30vw] h-[30vw] max-w-[400px] rounded-full bg-cyan-400/0 dark:bg-cyan-600/0 blur-[150px]" />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Viewport */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Navbar onMenuOpen={() => setSidebarOpen(true)} />

        {/* Content View */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

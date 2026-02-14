'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import BottomTabBar from './BottomTabBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved === 'true') setCollapsed(true);
    } catch {}

    const handler = (e: Event) => {
      setCollapsed((e as CustomEvent).detail);
    };
    window.addEventListener('sidebar-collapse', handler);

    // Register service worker for push notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    return () => window.removeEventListener('sidebar-collapse', handler);
  }, []);

  return (
    <div className="min-h-screen bg-dash-bg safe-area-inset">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <TopBar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="p-4 sm:p-6 pb-24 lg:pb-6 safe-area-bottom animate-page-in">
          {children}
        </main>
      </div>
      <BottomTabBar />
    </div>
  );
}

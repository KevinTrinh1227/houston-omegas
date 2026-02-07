'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

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
    return () => window.removeEventListener('sidebar-collapse', handler);
  }, []);

  return (
    <div className="min-h-screen bg-dash-bg">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className={`transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        <TopBar onMenuToggle={() => setMobileOpen(!mobileOpen)} />
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

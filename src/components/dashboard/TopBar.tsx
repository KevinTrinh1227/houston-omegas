'use client';

import { useAuth } from './AuthProvider';
import ThemeToggle from './ThemeToggle';
import { Menu } from 'lucide-react';

export default function TopBar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { member } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-dash-topbar border-b border-dash-border">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-dash-text-secondary hover:text-dash-text transition-colors"
        >
          <Menu size={22} />
        </button>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="text-right">
            <p className="text-xs font-medium text-dash-text">{member?.first_name} {member?.last_name}</p>
            <p className="text-[10px] text-dash-text-muted uppercase tracking-wider">{member?.role}</p>
          </div>
          {member?.avatar_url ? (
            <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-dash-badge-bg flex items-center justify-center text-dash-text-secondary text-xs font-semibold">
              {member?.first_name?.[0]}{member?.last_name?.[0]}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

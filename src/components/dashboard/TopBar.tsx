'use client';

import { useAuth } from './AuthProvider';

export default function TopBar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { member } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden lg:block" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-medium text-gray-900">{member?.first_name} {member?.last_name}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{member?.role}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-semibold">
            {member?.first_name?.[0]}{member?.last_name?.[0]}
          </div>
        </div>
      </div>
    </header>
  );
}

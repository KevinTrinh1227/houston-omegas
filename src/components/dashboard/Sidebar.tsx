'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { isExecRole, ROLE_LABELS, type Role } from '@/lib/roles';
import {
  Home, DollarSign, Users, Calendar, Star,
  FileText, Building2, FolderOpen, Mail, BarChart3,
  Settings, Megaphone, Image as ImageIcon,
  BookOpen, Handshake, ChevronLeft, ChevronDown, Info,
  LogOut, CalendarDays,
} from 'lucide-react';

const EXEC = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary'];

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: '',
    items: [
      { label: 'Overview', href: '/dashboard', icon: <Home size={18} /> },
    ],
  },
  {
    title: 'Executive Board',
    items: [
      { label: 'Members', href: '/dashboard/members', icon: <Users size={18} />, roles: EXEC },
      { label: 'Finance', href: '/dashboard/finance', icon: <DollarSign size={18} />, roles: EXEC },
      { label: 'Meetings', href: '/dashboard/meetings', icon: <FileText size={18} />, roles: EXEC },
      { label: 'Submissions', href: '/dashboard/submissions', icon: <Mail size={18} />, roles: EXEC },
      { label: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 size={18} />, roles: EXEC },
    ],
  },
  {
    title: 'Brotherhood',
    items: [
      { label: 'Events', href: '/dashboard/events', icon: <Calendar size={18} /> },
      { label: 'Points', href: '/dashboard/points', icon: <Star size={18} /> },
      { label: 'Greek Orgs', href: '/dashboard/greek-orgs', icon: <Building2 size={18} />, roles: EXEC },
      { label: 'Wiki', href: '/dashboard/wiki', icon: <BookOpen size={18} /> },
      { label: 'Calendar', href: '/dashboard/calendar', icon: <CalendarDays size={18} /> },
    ],
  },
  {
    title: 'External',
    items: [
      { label: 'Content', href: '/dashboard/blog', icon: <Megaphone size={18} /> },
      { label: 'Partners', href: '/dashboard/partners', icon: <Handshake size={18} />, roles: EXEC },
      { label: 'Media', href: '/dashboard/media', icon: <ImageIcon size={18} /> },
      { label: 'Documents', href: '/dashboard/documents', icon: <FolderOpen size={18} /> },
    ],
  },
];

// Changelog modal content
function ChangelogModal({ onClose }: { onClose: () => void }) {
  const [commits, setCommits] = useState<{ sha: string; message: string; author: string; date: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/github/releases', { credentials: 'include' })
      .then(res => res.ok ? res.json() : { commits: [] })
      .then(data => setCommits(data.commits || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[70vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">Changelog</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[55vh] p-5">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>
          ) : commits.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No recent changes.</p>
          ) : (
            <div className="space-y-3">
              {commits.slice(0, 20).map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-900 break-words">{(c.message as string)?.split('\n')[0]}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                      <code className="bg-gray-100 px-1 py-0.5 rounded">{c.sha}</code>
                      <span>{new Date(c.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { member, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [showChangelog, setShowChangelog] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved === 'true') setCollapsed(true);
      const savedGroups = localStorage.getItem('sidebar-groups');
      if (savedGroups) setCollapsedGroups(JSON.parse(savedGroups));
    } catch {}
  }, []);

  // Persist collapsed state
  useEffect(() => {
    try { localStorage.setItem('sidebar-collapsed', String(collapsed)); } catch {}
  }, [collapsed]);

  useEffect(() => {
    try { localStorage.setItem('sidebar-groups', JSON.stringify(collapsedGroups)); } catch {}
  }, [collapsedGroups]);

  // Broadcast collapse state to other components
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebar-collapse', { detail: collapsed }));
  }, [collapsed]);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const filteredGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => {
        if (!item.roles) return true;
        return member && item.roles.includes(member.role);
      }),
    }))
    .filter(group => group.items.length > 0);

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`py-5 border-b border-gray-800 ${collapsed && !isMobile ? 'px-3' : 'px-5'}`}>
        <Link href="/" className="flex items-center gap-2.5 group" onClick={onClose}>
          <Image src="/images/omega-logo.jpg" alt="Logo" width={28} height={28} className="rounded-full shrink-0" />
          {(!collapsed || isMobile) && (
            <span className="text-white text-xs uppercase tracking-[0.06em] font-bold" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              Houston Omegas
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className={`flex-1 py-3 overflow-y-auto ${collapsed && !isMobile ? 'px-2' : 'px-3'}`}>
        {filteredGroups.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <button
                onClick={() => toggleGroup(group.title)}
                className={`w-full flex items-center justify-between text-[9px] text-gray-500 uppercase tracking-[0.15em] font-semibold pt-4 pb-1 hover:text-gray-300 transition-colors ${collapsed && !isMobile ? 'px-1 justify-center' : 'px-3'}`}
              >
                {collapsed && !isMobile ? (
                  <span className="text-[8px]">&middot;&middot;&middot;</span>
                ) : (
                  <>
                    <span>{group.title}</span>
                    <ChevronDown size={10} className={`transition-transform duration-200 ${collapsedGroups[group.title] ? '-rotate-90' : ''}`} />
                  </>
                )}
              </button>
            )}
            <div
              className="space-y-0.5 overflow-hidden transition-all duration-200"
              style={{
                maxHeight: group.title && collapsedGroups[group.title] && !(collapsed && !isMobile) ? '0px' : '500px',
                opacity: group.title && collapsedGroups[group.title] && !(collapsed && !isMobile) ? 0 : 1,
              }}
            >
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  title={collapsed && !isMobile ? item.label : undefined}
                  className={`flex items-center gap-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    collapsed && !isMobile ? 'justify-center px-2' : 'px-3'
                  } ${
                    isActive(item.href)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  {(!collapsed || isMobile) && item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className={`border-t border-gray-800 ${collapsed && !isMobile ? 'px-2 py-3' : 'px-4 py-4'}`}>
        {/* Settings + Info */}
        <div className={`flex items-center mb-3 ${collapsed && !isMobile ? 'flex-col gap-2' : 'gap-2'}`}>
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            title="Settings"
            className={`flex items-center gap-3 py-2 rounded-lg text-xs font-medium transition-all ${
              collapsed && !isMobile ? 'justify-center px-2' : 'px-3 flex-1'
            } ${
              isActive('/dashboard/settings')
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings size={16} />
            {(!collapsed || isMobile) && 'Settings'}
          </Link>
          <button
            onClick={() => setShowChangelog(true)}
            title="Changelog"
            className="text-gray-500 hover:text-gray-300 p-2 rounded-lg hover:bg-white/5 transition-all"
          >
            <Info size={14} />
          </button>
        </div>

        {/* User */}
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-3 mb-3">
            {member?.avatar_url ? (
              <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-semibold">
                {member?.first_name?.[0]}{member?.last_name?.[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{member?.first_name} {member?.last_name}</p>
              <p className="text-gray-500 text-[10px] uppercase tracking-wider">{ROLE_LABELS[member?.role as Role] || member?.role}</p>
            </div>
          </div>
        )}

        {/* Sign out + Collapse toggle */}
        <div className={`flex items-center ${collapsed && !isMobile ? 'flex-col gap-2' : 'gap-2'}`}>
          <button
            onClick={logout}
            title="Sign Out"
            className={`flex items-center gap-2 text-gray-500 hover:text-gray-300 text-[11px] uppercase tracking-wider transition-colors ${collapsed && !isMobile ? 'p-2' : 'flex-1'}`}
          >
            <LogOut size={14} />
            {(!collapsed || isMobile) && 'Sign Out'}
          </button>
          {/* Collapse toggle - desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex text-gray-500 hover:text-gray-300 p-2 rounded-lg hover:bg-white/5 transition-all"
          >
            <ChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-[#0e1012] z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        {sidebarContent(false)}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
          <aside className="fixed left-0 top-0 bottom-0 w-60 bg-[#0e1012] z-50 lg:hidden">
            {sidebarContent(true)}
          </aside>
        </>
      )}
    </>
  );
}

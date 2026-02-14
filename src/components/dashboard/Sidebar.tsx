'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { isExecRole, ROLE_LABELS, type Role } from '@/lib/roles';
import {
  Home, DollarSign, Users, Calendar,
  FileText, FolderOpen, Mail, BarChart3,
  Settings, UserPlus, BookOpen,
  ChevronLeft, ChevronDown, Info, LogOut,
  GraduationCap, PartyPopper, Camera, HeartHandshake,
  Sun, Moon, Archive, PenSquare, CalendarDays, ExternalLink, Share2,
  CreditCard,
} from 'lucide-react';
import { useTheme } from 'next-themes';

const EXEC = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary'];

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  chairPositions?: string[];
  external?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const POSTIZ_BASE_URL = 'https://social.houstonomegas.com';

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
      { label: 'Finance & Sponsors', href: '/dashboard/finance', icon: <DollarSign size={18} />, roles: EXEC },
      { label: 'Payments', href: '/dashboard/payments', icon: <CreditCard size={18} />, roles: ['admin', 'president', 'treasurer'] },
      { label: 'Meetings', href: '/dashboard/meetings', icon: <FileText size={18} />, roles: EXEC },
      { label: 'Inquiries', href: '/dashboard/submissions', icon: <Mail size={18} />, roles: EXEC },
      { label: 'SEO Content', href: '/dashboard/content', icon: <Sparkles size={18} />, roles: EXEC },
    ],
  },
  {
    title: 'Chairs',
    items: [
      { label: 'Recruitment', href: '/dashboard/recruitment', icon: <UserPlus size={18} />, roles: EXEC, chairPositions: ['recruitment'] },
      { label: 'Alumni Relations', href: '/dashboard/alumni', icon: <GraduationCap size={18} />, roles: EXEC, chairPositions: ['alumni'] },
      { label: 'Events & Socials', href: '/dashboard/events', icon: <PartyPopper size={18} />, roles: EXEC, chairPositions: ['social'] },
      { label: 'Social Media', href: '/dashboard/socials', icon: <Share2 size={18} />, roles: EXEC, chairPositions: ['social_media'] },
      { label: 'Brotherhood', href: '/dashboard/points', icon: <HeartHandshake size={18} />, roles: EXEC, chairPositions: ['brotherhood'] },
      { label: 'Historian', href: '/dashboard/historian', icon: <Archive size={18} />, roles: EXEC, chairPositions: ['historian'] },
    ],
  },
  {
    title: 'Social Media',
    items: [
      { label: 'Compose', href: `${POSTIZ_BASE_URL}/launches`, icon: <PenSquare size={18} />, roles: EXEC, chairPositions: ['social_media'], external: true },
      { label: 'Calendar', href: `${POSTIZ_BASE_URL}/calendar`, icon: <CalendarDays size={18} />, roles: EXEC, chairPositions: ['social_media'], external: true },
      { label: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 size={18} />, roles: EXEC, chairPositions: ['social_media'] },
    ],
  },
  {
    title: 'Community',
    items: [
      { label: 'Events', href: '/dashboard/calendar', icon: <Calendar size={18} /> },
      { label: 'Wiki', href: '/dashboard/wiki', icon: <BookOpen size={18} /> },
      { label: 'Blog', href: '/dashboard/blog', icon: <BarChart3 size={18} /> },
      { label: 'Files', href: '/dashboard/files', icon: <FolderOpen size={18} /> },
    ],
  },
];

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
      <div className="bg-dash-card rounded-xl shadow-xl max-w-lg w-full max-h-[70vh] overflow-hidden border border-dash-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-dash-border">
          <h2 className="text-sm font-medium text-dash-text">Changelog</h2>
          <button onClick={onClose} className="text-dash-text-muted hover:text-dash-text transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[55vh] p-5">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-dash-border border-t-dash-text rounded-full animate-spin" /></div>
          ) : commits.length === 0 ? (
            <p className="text-sm text-dash-text-muted text-center py-8">No recent changes.</p>
          ) : (
            <div className="space-y-3">
              {commits.slice(0, 20).map((c, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-dash-text-muted mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-dash-text break-words">{(c.message as string)?.split('\n')[0]}</p>
                    <div className="flex items-center gap-2 text-[10px] text-dash-text-muted mt-0.5">
                      <code className="bg-dash-badge-bg px-1 py-0.5 rounded">{c.sha}</code>
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

function SidebarThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="p-2 w-[44px] h-[44px] sm:w-[31px] sm:h-[31px]" />;
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex items-center justify-center p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg text-dash-sidebar-text-muted hover:text-dash-sidebar-text-active hover:bg-dash-sidebar-hover transition-all"
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { member, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved === 'true') setCollapsed(true);
      const savedGroups = localStorage.getItem('sidebar-groups');
      if (savedGroups) setCollapsedGroups(JSON.parse(savedGroups));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('sidebar-collapsed', String(collapsed)); } catch {}
  }, [collapsed]);

  useEffect(() => {
    try { localStorage.setItem('sidebar-groups', JSON.stringify(collapsedGroups)); } catch {}
  }, [collapsedGroups]);

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

  const canSeeItem = (item: NavItem): boolean => {
    if (!member) return false;
    if (!item.roles && !item.chairPositions) return true;
    if (isExecRole(member.role)) return true;
    if (item.chairPositions && member.chair_position) {
      if (item.chairPositions.includes(member.chair_position)) return true;
    }
    if (item.roles && !item.chairPositions && item.roles.includes(member.role)) return true;
    return false;
  };

  const filteredGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(canSeeItem),
    }))
    .filter(group => group.items.length > 0);

  const sidebarContent = (isMobile: boolean) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`h-14 flex items-center border-b border-dash-sidebar-border ${collapsed && !isMobile ? 'px-3' : 'px-5'}`}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group" onClick={onClose}>
          <Image src="/images/omega-logo.jpg" alt="Logo" width={28} height={28} className="rounded-full shrink-0" />
          {(!collapsed || isMobile) && (
            <span className="text-dash-sidebar-text-active text-xs uppercase tracking-[0.06em] font-bold" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
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
                className={`w-full flex items-center justify-between text-[9px] text-dash-sidebar-text-muted uppercase tracking-[0.15em] font-semibold pt-4 pb-1 hover:text-dash-sidebar-text transition-colors ${collapsed && !isMobile ? 'px-1 justify-center' : 'px-3'}`}
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
                item.external ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                    title={collapsed && !isMobile ? item.label : undefined}
                    className={`flex items-center gap-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      collapsed && !isMobile ? 'justify-center px-2' : 'px-3'
                    } text-dash-sidebar-text hover:text-dash-sidebar-text-active hover:bg-dash-sidebar-hover`}
                  >
                    {item.icon}
                    {(!collapsed || isMobile) && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        <ExternalLink size={12} className="opacity-50" />
                      </>
                    )}
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    title={collapsed && !isMobile ? item.label : undefined}
                    className={`flex items-center gap-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                      collapsed && !isMobile ? 'justify-center px-2' : 'px-3'
                    } ${
                      isActive(item.href)
                        ? 'bg-dash-sidebar-active text-dash-sidebar-text-active'
                        : 'text-dash-sidebar-text hover:text-dash-sidebar-text-active hover:bg-dash-sidebar-hover'
                    }`}
                  >
                    {item.icon}
                    {(!collapsed || isMobile) && item.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div className={`mt-auto border-t border-dash-sidebar-border ${collapsed && !isMobile ? 'px-2 py-3' : 'px-3 py-3'}`}>
        {/* User profile */}
        {(!collapsed || isMobile) ? (
          <div className="flex items-center gap-3 px-2 mb-3">
            {member?.avatar_url ? (
              <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-dash-sidebar-active flex items-center justify-center text-dash-sidebar-text-active text-xs font-semibold shrink-0">
                {member?.first_name?.[0]}{member?.last_name?.[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-dash-sidebar-text-active text-xs font-medium truncate">{member?.first_name} {member?.last_name}</p>
              <p className="text-dash-sidebar-text-muted text-[10px] uppercase tracking-wider">{ROLE_LABELS[member?.role as Role] || member?.role}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            {member?.avatar_url ? (
              <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-dash-sidebar-active flex items-center justify-center text-dash-sidebar-text-active text-xs font-semibold">
                {member?.first_name?.[0]}{member?.last_name?.[0]}
              </div>
            )}
          </div>
        )}

        {/* Action buttons row - min 44px touch targets on mobile */}
        <div className={`flex items-center ${collapsed && !isMobile ? 'flex-col gap-1' : 'gap-1'}`}>
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            title="Settings"
            className={`flex items-center justify-center p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg transition-all ${
              isActive('/dashboard/settings')
                ? 'bg-dash-sidebar-active text-dash-sidebar-text-active'
                : 'text-dash-sidebar-text-muted hover:text-dash-sidebar-text-active hover:bg-dash-sidebar-hover'
            }`}
          >
            <Settings size={15} />
          </Link>
          <SidebarThemeToggle />
          <button
            onClick={() => setShowChangelog(true)}
            title="Changelog"
            className="flex items-center justify-center p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg text-dash-sidebar-text-muted hover:text-dash-sidebar-text-active hover:bg-dash-sidebar-hover transition-all"
          >
            <Info size={15} />
          </button>
          <button
            onClick={logout}
            title="Sign Out"
            className="flex items-center justify-center p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-lg text-dash-sidebar-text-muted hover:text-red-400 hover:bg-dash-sidebar-hover transition-all"
          >
            <LogOut size={15} />
          </button>
          {(!collapsed || isMobile) && <div className="flex-1" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex items-center justify-center p-2 rounded-lg text-dash-sidebar-text-muted hover:text-dash-sidebar-text-active hover:bg-dash-sidebar-hover transition-all"
          >
            <ChevronLeft size={15} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-dash-sidebar border-r border-dash-sidebar-border z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        {sidebarContent(false)}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
          <aside className="fixed left-0 top-0 bottom-0 w-60 bg-dash-sidebar border-r border-dash-sidebar-border z-50 lg:hidden">
            {sidebarContent(true)}
          </aside>
        </>
      )}
    </>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, Users, Calendar, DollarSign, Menu, X, Settings, FileText, Inbox, Share2, UserPlus, FolderOpen, BookOpen } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { isExecRole } from '@/lib/roles';

interface TabItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const PRIMARY_TABS: TabItem[] = [
  { label: 'Home', href: '/dashboard', icon: <Home size={22} /> },
  { label: 'Members', href: '/dashboard/members', icon: <Users size={22} /> },
  { label: 'Events', href: '/dashboard/calendar', icon: <Calendar size={22} /> },
  { label: 'Finance', href: '/dashboard/finance', icon: <DollarSign size={22} /> },
];

interface MoreMenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  chairPositions?: string[];
}

const EXEC = ['admin', 'president', 'vpi', 'vpx', 'treasurer', 'secretary'];

const MORE_MENU_ITEMS: MoreMenuItem[] = [
  { label: 'Content', href: '/dashboard/blog', icon: <FileText size={20} /> },
  { label: 'Social Media', href: '/dashboard/socials', icon: <Share2 size={20} />, roles: EXEC, chairPositions: ['social_media'] },
  { label: 'Files', href: '/dashboard/files', icon: <FolderOpen size={20} /> },
  { label: 'Recruitment', href: '/dashboard/recruitment', icon: <UserPlus size={20} />, roles: EXEC, chairPositions: ['recruitment'] },
  { label: 'Inbox', href: '/dashboard/submissions', icon: <Inbox size={20} />, roles: EXEC },
  { label: 'Wiki', href: '/dashboard/wiki', icon: <BookOpen size={20} /> },
  { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} /> },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const { member } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const canSeeItem = (item: MoreMenuItem): boolean => {
    if (!member) return false;
    if (!item.roles && !item.chairPositions) return true;
    if (isExecRole(member.role)) return true;
    if (item.chairPositions && member.chair_position) {
      if (item.chairPositions.includes(member.chair_position)) return true;
    }
    if (item.roles && !item.chairPositions && item.roles.includes(member.role)) return true;
    return false;
  };

  const filteredMoreItems = MORE_MENU_ITEMS.filter(canSeeItem);
  const isMoreActive = filteredMoreItems.some(item => isActive(item.href));

  return (
    <>
      {/* Bottom Tab Bar - only show on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-dash-sidebar border-t border-dash-sidebar-border lg:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {PRIMARY_TABS.map((tab) => {
            const active = isActive(tab.href);
            const needsExec = tab.href === '/dashboard/members' || tab.href === '/dashboard/finance';
            if (needsExec && member && !isExecRole(member.role)) {
              return null;
            }
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center flex-1 h-full min-w-[64px] transition-colors ${
                  active ? 'text-dash-sidebar-text-active' : 'text-dash-sidebar-text-muted'
                }`}
              >
                <span className={`transition-transform ${active ? 'scale-110' : ''}`}>
                  {tab.icon}
                </span>
                <span className="text-[10px] font-medium mt-1">{tab.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center justify-center flex-1 h-full min-w-[64px] transition-colors ${
              isMoreActive || moreOpen ? 'text-dash-sidebar-text-active' : 'text-dash-sidebar-text-muted'
            }`}
          >
            <Menu size={22} />
            <span className="text-[10px] font-medium mt-1">More</span>
          </button>
        </div>
      </nav>

      {/* More Menu */}
      {moreOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-50 lg:hidden animate-fade-in"
            onClick={() => setMoreOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-50 lg:hidden animate-slide-up">
            <div className="bg-dash-sidebar rounded-t-3xl border-t border-dash-sidebar-border max-h-[80vh] overflow-y-auto safe-area-bottom">
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-dash-sidebar-border rounded-full" />
              </div>
              <div className="flex items-center justify-between px-6 py-3 border-b border-dash-sidebar-border">
                <h2 className="text-sm font-semibold text-dash-sidebar-text-active">More</h2>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="p-2 -mr-2 text-dash-sidebar-text-muted hover:text-dash-sidebar-text-active transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {filteredMoreItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all active:scale-95 ${
                        active
                          ? 'bg-dash-sidebar-active text-dash-sidebar-text-active'
                          : 'bg-dash-sidebar-hover text-dash-sidebar-text hover:text-dash-sidebar-text-active'
                      }`}
                    >
                      {item.icon}
                      <span className="text-[11px] font-medium mt-2 text-center">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="px-6 py-4 border-t border-dash-sidebar-border">
                <div className="flex items-center gap-3">
                  {member?.avatar_url ? (
                    <img src={member.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-dash-sidebar-active flex items-center justify-center text-dash-sidebar-text-active text-sm font-semibold">
                      {member?.first_name?.[0]}{member?.last_name?.[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dash-sidebar-text-active truncate">
                      {member?.first_name} {member?.last_name}
                    </p>
                    <p className="text-[11px] text-dash-sidebar-text-muted uppercase tracking-wider">
                      {member?.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { isExecRole, ROLE_LABELS, type Role } from '@/lib/roles';
import {
  Home, DollarSign, Users, Calendar, ClipboardCheck, Star,
  FileText, Building2, FolderOpen, UserPlus, Mail, BarChart3,
  Clock, Settings, Megaphone, Image as ImageIcon, Share2,
  BookOpen, Handshake,
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
      { label: 'Finance', href: '/dashboard/finance', icon: <DollarSign size={18} />, roles: EXEC },
      { label: 'Members', href: '/dashboard/members', icon: <Users size={18} />, roles: EXEC },
      { label: 'Meetings', href: '/dashboard/meetings', icon: <FileText size={18} />, roles: EXEC },
      { label: 'Recruitment', href: '/dashboard/recruitment', icon: <UserPlus size={18} />, roles: EXEC },
      { label: 'Inquiries', href: '/dashboard/inquiries', icon: <Mail size={18} />, roles: EXEC },
      { label: 'Attendance', href: '/dashboard/attendance', icon: <ClipboardCheck size={18} />, roles: EXEC },
      { label: 'Analytics', href: '/dashboard/analytics', icon: <BarChart3 size={18} />, roles: EXEC },
    ],
  },
  {
    title: 'Chapter',
    items: [
      { label: 'Events', href: '/dashboard/events', icon: <Calendar size={18} /> },
      { label: 'Points', href: '/dashboard/points', icon: <Star size={18} /> },
      { label: 'Content', href: '/dashboard/blog', icon: <Megaphone size={18} /> },
      { label: 'Documents', href: '/dashboard/documents', icon: <FolderOpen size={18} /> },
      { label: 'Greek Orgs', href: '/dashboard/greek-orgs', icon: <Building2 size={18} />, roles: EXEC },
      { label: 'Partners', href: '/dashboard/partners', icon: <Handshake size={18} />, roles: EXEC },
      { label: 'Media', href: '/dashboard/media', icon: <ImageIcon size={18} /> },
      { label: 'Socials', href: '/dashboard/socials', icon: <Share2 size={18} />, roles: EXEC },
    ],
  },
  {
    title: 'Resources',
    items: [
      { label: 'Wiki', href: '/dashboard/wiki', icon: <BookOpen size={18} /> },
      { label: 'Changelog', href: '/dashboard/changelog', icon: <Clock size={18} /> },
      { label: 'Settings', href: '/dashboard/settings', icon: <Settings size={18} /> },
    ],
  },
];

export default function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { member, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
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

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2.5 group" onClick={onClose}>
          <Image src="/images/omega-logo.jpg" alt="Logo" width={28} height={28} className="rounded-full" />
          <span className="text-white text-xs uppercase tracking-[0.06em] font-bold" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
            Houston Omegas
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {filteredGroups.map((group, gi) => (
          <div key={gi}>
            {group.title && (
              <p className="text-[9px] text-gray-500 uppercase tracking-[0.15em] font-semibold px-3 pt-4 pb-1">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-800">
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
        <button
          onClick={logout}
          className="w-full text-left text-gray-500 hover:text-gray-300 text-[11px] uppercase tracking-wider transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-[#0e1012] z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
          <aside className="fixed left-0 top-0 bottom-0 w-60 bg-[#0e1012] z-50 lg:hidden">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

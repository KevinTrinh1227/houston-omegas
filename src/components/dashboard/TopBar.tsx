'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { Menu, ChevronRight } from 'lucide-react';

const PAGE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  members: 'Members',
  finance: 'Finance & Sponsors',
  meetings: 'Meetings',
  submissions: 'Inquiries',
  recruitment: 'Recruitment',
  alumni: 'Alumni Relations',
  events: 'Events & Socials',
  analytics: 'Social Media',
  points: 'Brotherhood',
  historian: 'Historian',
  calendar: 'Events',
  wiki: 'Wiki',
  blog: 'Blog',
  files: 'Files',
  settings: 'Settings',
  partners: 'Partners',
  announcements: 'Announcements',
  attendance: 'Attendance',
  new: 'New',
};

export default function TopBar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { member } = useAuth();
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: PAGE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
    href: '/' + segments.slice(0, i + 1).join('/'),
  }));

  const pageTitle = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 1].label : 'Dashboard';

  return (
    <header className="sticky top-0 z-30 bg-dash-topbar border-b border-dash-border">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-dash-text-secondary hover:text-dash-text transition-colors"
          >
            <Menu size={22} />
          </button>

          {/* Mobile: page title */}
          <span className="lg:hidden text-sm font-medium text-dash-text">{pageTitle}</span>

          {/* Desktop: breadcrumbs */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight size={12} className="text-dash-text-muted" />}
                {i < breadcrumbs.length - 1 ? (
                  <Link href={crumb.href} className="text-dash-text-muted hover:text-dash-text transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-dash-text font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
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

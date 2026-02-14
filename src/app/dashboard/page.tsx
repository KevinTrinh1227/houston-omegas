'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';
import {
  PenSquare, LayoutGrid, Users, Settings, Calendar, BookOpen,
  ArrowRight, FileText, FolderOpen, Star, ClipboardList, Share2,
  Instagram, Twitter, ExternalLink,
} from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

interface DashboardStats {
  total_members: number;
  active_members: number;
  published_posts: number;
  recruitment_submissions: number;
  inquiry_submissions: number;
  active_announcements: number;
}

interface Analytics {
  active_users_7d: number;
  active_users_30d: number;
  total_members: number;
  active_members: number;
  dues_collection_rate: number;
  dues_total_due: number;
  dues_total_paid: number;
  attendance_avg: number;
  total_points: number;
  total_events: number;
  total_meetings: number;
  total_documents: number;
  recent_activity: { action: string; page: string | null; count: number }[];
}

interface PageViewData {
  by_page: { page: string; views: number }[];
  by_day: { day: string; views: number }[];
  total: number;
}

interface SocialAnalytics {
  source: string;
  totalAccounts: number;
  activeAccounts: number;
  totalFollowers?: number;
  totalPosts?: number;
  totalLikes?: number;
  totalViews?: number;
  platforms: Array<{
    name: string;
    followers?: number;
    posts?: number;
  }>;
  postizConnected: boolean;
}

const POSTIZ_BASE_URL = 'https://social.houstonomegas.com';

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E4405F', twitter: '#1DA1F2', tiktok: '#000000',
  youtube: '#FF0000', facebook: '#1877F2', linkedin: '#0A66C2',
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardOverview() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [analyticsData, setAnalyticsData] = useState<Analytics | null>(null);
  const [pageViews, setPageViews] = useState<PageViewData | null>(null);
  const [socialAnalytics, setSocialAnalytics] = useState<SocialAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fetchAnalytics = useCallback(async () => {
    if (!isExec) { setAnalyticsLoading(false); return; }
    setAnalyticsLoading(true);
    try {
      const [analyticsRes, viewsRes, socialRes] = await Promise.all([
        fetch('/api/dashboard/analytics', { credentials: 'include' }),
        fetch('/api/analytics/views?days=30', { credentials: 'include' }).catch(() => null),
        fetch('/api/social/analytics', { credentials: 'include' }).catch(() => null),
      ]);
      if (analyticsRes.ok) setAnalyticsData(await analyticsRes.json());
      if (viewsRes && viewsRes.ok) setPageViews(await viewsRes.json());
      if (socialRes && socialRes.ok) setSocialAnalytics(await socialRes.json());
    } catch { /* */ }
    finally { setAnalyticsLoading(false); }
  }, [isExec]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const quickActions = [
    { label: 'New Blog Post', href: '/dashboard/blog/new', icon: <PenSquare size={16} />, check: (r: string) => isExecRole(r) || r === 'active' || r === 'junior_active' },
    { label: 'Manage Content', href: '/dashboard/blog', icon: <LayoutGrid size={16} />, check: (r: string) => isExecRole(r) },
    { label: 'View Members', href: '/dashboard/members', icon: <Users size={16} />, check: (r: string) => isExecRole(r) },
    { label: 'Edit Profile', href: '/dashboard/settings', icon: <Settings size={16} />, check: () => true },
    { label: 'Events', href: '/dashboard/calendar', icon: <Calendar size={16} />, check: () => true },
    { label: 'Wiki', href: '/dashboard/wiki', icon: <BookOpen size={16} />, check: () => true },
  ];

  const statCards = [
    { label: 'Active Members', value: stats?.active_members ?? '-', href: '/dashboard/members', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
    { label: 'Blog Posts', value: stats?.published_posts ?? '-', href: '/dashboard/blog', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2' },
    { label: 'Announcements', value: stats?.active_announcements ?? '-', href: '/dashboard/announcements', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6' },
    ...(isExec ? [
      { label: 'Recruitment', value: stats?.recruitment_submissions ?? '-', href: '/dashboard/recruitment', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
      { label: 'Venue Inquiries', value: stats?.inquiry_submissions ?? '-', href: '/dashboard/submissions', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { label: 'Total Members', value: stats?.total_members ?? '-', href: '/dashboard/members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0' },
    ] : []),
  ];

  const sectionCards = isExec ? [
    { label: 'Events', href: '/dashboard/calendar', icon: <Calendar size={18} />, count: analyticsData?.total_events },
    { label: 'Meetings', href: '/dashboard/meetings', icon: <ClipboardList size={18} />, count: analyticsData?.total_meetings },
    { label: 'Files', href: '/dashboard/files', icon: <FolderOpen size={18} />, count: analyticsData?.total_documents },
    { label: 'Points', href: '/dashboard/points', icon: <Star size={18} />, count: analyticsData?.total_points },
  ] : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-dash-text">
          {getGreeting()}, {member?.first_name}
        </h1>
        <p className="text-sm text-dash-text-secondary mt-1">Here&apos;s what&apos;s happening with Houston Omegas</p>
      </div>

      {/* Quick actions */}
      <div className="mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions
            .filter(a => a.check(member?.role || ''))
            .map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-2.5 bg-dash-card rounded-lg border border-dash-border px-4 py-3 text-xs font-medium text-dash-text-secondary hover:border-dash-text-muted/50 hover:text-dash-text transition-all"
              >
                <span className="text-dash-text-muted">{action.icon}</span>
                {action.label}
              </Link>
            ))}
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-dash-card rounded-xl border border-dash-border p-5 animate-pulse">
              <div className="h-4 bg-dash-badge-bg rounded w-24 mb-3" />
              <div className="h-8 bg-dash-badge-bg rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <Link key={card.label} href={card.href} className="bg-dash-card rounded-xl border border-dash-border p-5 hover:border-dash-text-muted/30 transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-dash-text-secondary uppercase tracking-wider font-medium">{card.label}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-dash-text-muted">
                  <path d={card.icon} />
                </svg>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold text-dash-text">{card.value}</p>
                <ArrowRight size={14} className="text-dash-text-muted opacity-0 group-hover:opacity-100 transition-opacity mb-1" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Section summary cards (exec) */}
      {isExec && !analyticsLoading && analyticsData && sectionCards.length > 0 && (
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {sectionCards.map(card => (
            <Link
              key={card.label}
              href={card.href}
              className="flex items-center gap-3 bg-dash-card rounded-lg border border-dash-border px-4 py-3 hover:border-dash-text-muted/30 transition-colors group"
            >
              <span className="text-dash-text-muted">{card.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-dash-text">{card.label}</p>
                <p className="text-[10px] text-dash-text-muted">{card.count ?? 0} total</p>
              </div>
              <ArrowRight size={14} className="text-dash-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {/* Analytics Charts (exec only) */}
      {isExec && !analyticsLoading && analyticsData && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-dash-text mb-4">Analytics Overview</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-dash-card rounded-xl border border-dash-border p-6">
              <h3 className="text-sm font-medium text-dash-text mb-3">Dues Collection Rate</h3>
              <div className="w-full bg-dash-badge-bg rounded-full h-6">
                <div
                  className={`h-6 rounded-full flex items-center justify-end pr-2 text-[10px] font-semibold text-white ${
                    analyticsData.dues_collection_rate > 75 ? 'bg-green-500' : analyticsData.dues_collection_rate > 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(analyticsData.dues_total_due > 0 ? Math.round((analyticsData.dues_total_paid / analyticsData.dues_total_due) * 100) : 0, 5)}%` }}
                >
                  {analyticsData.dues_collection_rate}%
                </div>
              </div>
              <p className="text-[10px] text-dash-text-muted mt-2">{fmt(analyticsData.dues_total_paid)} collected of {fmt(analyticsData.dues_total_due)} total</p>
            </div>

            <div className="bg-dash-card rounded-xl border border-dash-border p-6">
              <h3 className="text-sm font-medium text-dash-text mb-3">Average Attendance</h3>
              <div className="w-full bg-dash-badge-bg rounded-full h-6">
                <div
                  className={`h-6 rounded-full flex items-center justify-end pr-2 text-[10px] font-semibold text-white ${
                    analyticsData.attendance_avg > 75 ? 'bg-green-500' : analyticsData.attendance_avg > 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(Math.round(analyticsData.attendance_avg), 5)}%` }}
                >
                  {Math.round(analyticsData.attendance_avg)}%
                </div>
              </div>
              <p className="text-[10px] text-dash-text-muted mt-2">Across all events with recorded attendance</p>
            </div>
          </div>

          {pageViews && pageViews.by_day.length > 1 && (
            <div className="bg-dash-card rounded-xl border border-dash-border p-6 mb-8">
              <h3 className="text-sm font-medium text-dash-text mb-4">Page Views (30 days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={pageViews.by_day.map(d => ({ date: new Date(d.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), views: d.views }))}>
                  <CartesianGrid strokeDasharray="3 3" className="[&_line]:stroke-dash-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} className="[&_text]:fill-dash-text-muted" />
                  <YAxis tick={{ fontSize: 10 }} className="[&_text]:fill-dash-text-muted" />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--dash-border)', background: 'var(--dash-card)', color: 'var(--dash-text)' }} />
                  <Area type="monotone" dataKey="views" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {pageViews && pageViews.by_page.length > 0 && (
            <div className="bg-dash-card rounded-xl border border-dash-border p-6 mb-8">
              <h3 className="text-sm font-medium text-dash-text mb-3">Top Pages (30d)</h3>
              <ResponsiveContainer width="100%" height={Math.min(pageViews.by_page.length * 32, 320)}>
                <BarChart data={pageViews.by_page.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="[&_line]:stroke-dash-border" />
                  <XAxis type="number" tick={{ fontSize: 10 }} className="[&_text]:fill-dash-text-muted" />
                  <YAxis type="category" dataKey="page" tick={{ fontSize: 10 }} width={120} className="[&_text]:fill-dash-text-secondary" />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--dash-border)', background: 'var(--dash-card)', color: 'var(--dash-text)' }} />
                  <Bar dataKey="views" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Social Media Analytics Widget */}
          {socialAnalytics && (
            <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-xl border border-violet-200 dark:border-violet-800 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white">
                    <Share2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-dash-text">Social Media</h3>
                    <p className="text-[10px] text-dash-text-muted">
                      {socialAnalytics.postizConnected ? 'Managed via Postiz' : 'Local analytics'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/socials"
                    className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-dash-text-muted hover:text-dash-text font-medium"
                  >
                    View All
                    <ArrowRight size={12} />
                  </Link>
                  {socialAnalytics.postizConnected && (
                    <a
                      href={POSTIZ_BASE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium ml-3"
                    >
                      Postiz
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Followers</p>
                  <p className="text-lg font-semibold text-dash-text">{formatNumber(socialAnalytics.totalFollowers || 0)}</p>
                </div>
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Posts</p>
                  <p className="text-lg font-semibold text-dash-text">{formatNumber(socialAnalytics.totalPosts || 0)}</p>
                </div>
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Likes</p>
                  <p className="text-lg font-semibold text-dash-text">{formatNumber(socialAnalytics.totalLikes || 0)}</p>
                </div>
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Views</p>
                  <p className="text-lg font-semibold text-dash-text">{formatNumber(socialAnalytics.totalViews || 0)}</p>
                </div>
              </div>

              {socialAnalytics.platforms && socialAnalytics.platforms.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socialAnalytics.platforms.slice(0, 6).map((platform) => (
                    <div
                      key={platform.name}
                      className="flex items-center gap-2 bg-white/50 dark:bg-black/20 rounded-full px-3 py-1.5"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold"
                        style={{ backgroundColor: PLATFORM_COLORS[platform.name] || '#666' }}
                      >
                        {platform.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs text-dash-text capitalize">{platform.name}</span>
                      {platform.followers !== undefined && (
                        <span className="text-[10px] text-dash-text-muted">{formatNumber(platform.followers)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

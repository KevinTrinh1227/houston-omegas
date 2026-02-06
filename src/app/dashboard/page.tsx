'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';

interface DashboardStats {
  total_members: number;
  active_members: number;
  published_posts: number;
  recruitment_submissions: number;
  inquiry_submissions: number;
  active_announcements: number;
}

export default function DashboardOverview() {
  const { member } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Active Members', value: stats?.active_members ?? '-', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
    { label: 'Blog Posts', value: stats?.published_posts ?? '-', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2' },
    { label: 'Announcements', value: stats?.active_announcements ?? '-', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6' },
    ...(isExecRole(member?.role || '') ? [
      { label: 'Recruitment', value: stats?.recruitment_submissions ?? '-', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
      { label: 'Venue Inquiries', value: stats?.inquiry_submissions ?? '-', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { label: 'Total Members', value: stats?.total_members ?? '-', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0' },
    ] : []),
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome back, {member?.first_name}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening with Houston Omegas</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{card.label}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={card.icon} />
                </svg>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-8">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'New Blog Post', href: '/dashboard/blog/new', check: (r: string) => isExecRole(r) || r === 'active' },
            { label: 'Manage Announcements', href: '/dashboard/announcements', check: (r: string) => isExecRole(r) },
            { label: 'View Members', href: '/dashboard/members', check: (r: string) => isExecRole(r) },
            { label: 'Edit Profile', href: '/dashboard/settings', check: (r: string) => isExecRole(r) || r === 'active' || r === 'alumni' },
          ]
            .filter(a => a.check(member?.role || ''))
            .map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="block bg-white rounded-lg border border-gray-200 px-4 py-3 text-xs font-medium text-gray-700 hover:border-gray-300 hover:text-gray-900 transition-all"
              >
                {action.label}
                <span className="float-right text-gray-400">&rarr;</span>
              </a>
            ))}
        </div>
      </div>
    </div>
  );
}

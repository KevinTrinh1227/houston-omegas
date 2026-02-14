'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';
import {
  AreaChart, Area, BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Eye, Users, Globe, ArrowUpRight, ArrowDownRight, TrendingUp, ExternalLink, Share2 } from 'lucide-react';
import Link from 'next/link';

/* ───── Types ───── */
interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  url: string | null;
  is_active: number;
}

interface SocialMetric {
  id: string;
  account_id: string;
  recorded_date: string;
  followers: number;
  posts_count: number;
  likes: number;
  views: number;
}

interface PageViewData {
  by_page: { page: string; views: number; visitors: number }[];
  by_day: { day: string; views: number }[];
  by_day_unique: { day: string; visitors: number }[];
  top_referrers: { referrer: string; views: number }[];
  total: number;
  unique_visitors: number;
}

/* ───── Helpers ───── */
const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E4405F', twitter: '#1DA1F2', tiktok: '#000000',
  youtube: '#FF0000', facebook: '#1877F2', linkedin: '#0A66C2',
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram', twitter: 'Twitter / X', tiktok: 'TikTok',
  youtube: 'YouTube', facebook: 'Facebook', linkedin: 'LinkedIn',
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

const CHART_TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 8,
  border: '1px solid var(--dash-border)',
  background: 'var(--dash-card)',
  color: 'var(--dash-text)',
};

const DATE_RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

/* ───── Website Analytics Tab ───── */
function WebsiteAnalytics() {
  const [data, setData] = useState<PageViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/views?days=${days}`, { credentials: 'include' });
      if (res.ok) setData(await res.json());
    } catch { /* */ }
    finally { setLoading(false); }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-dash-card rounded-xl border border-dash-border p-6 animate-pulse">
            <div className="h-4 bg-dash-badge-bg rounded w-32 mb-3" />
            <div className="h-40 bg-dash-badge-bg rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center text-sm text-dash-text-muted">
        No analytics data available.
      </div>
    );
  }

  // Merge views and visitors by day for the combined chart
  const dailyChart = data.by_day.map((d, i) => ({
    date: new Date(d.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    views: d.views,
    visitors: data.by_day_unique[i]?.visitors ?? 0,
  }));

  // Calculate trends (compare last half to first half of period)
  const mid = Math.floor(dailyChart.length / 2);
  const firstHalf = dailyChart.slice(0, mid);
  const secondHalf = dailyChart.slice(mid);
  const avgFirst = firstHalf.length ? firstHalf.reduce((s, d) => s + d.views, 0) / firstHalf.length : 0;
  const avgSecond = secondHalf.length ? secondHalf.reduce((s, d) => s + d.views, 0) / secondHalf.length : 0;
  const trend = avgFirst > 0 ? Math.round(((avgSecond - avgFirst) / avgFirst) * 100) : 0;
  const avgDaily = dailyChart.length ? Math.round(data.total / dailyChart.length) : 0;

  return (
    <div className="space-y-6">
      {/* Date range selector */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-dash-text-secondary">Showing data for the last {days} days</p>
        <div className="flex items-center gap-1 bg-dash-card border border-dash-border rounded-lg p-1">
          {DATE_RANGES.map(r => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all ${
                days === r.days
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'text-dash-text-secondary hover:text-dash-text'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: formatNumber(data.total), icon: Eye, color: 'text-blue-500' },
          { label: 'Unique Visitors', value: formatNumber(data.unique_visitors), icon: Users, color: 'text-violet-500' },
          { label: 'Avg Daily Views', value: formatNumber(avgDaily), icon: TrendingUp, color: 'text-emerald-500' },
          {
            label: 'Trend',
            value: `${trend >= 0 ? '+' : ''}${trend}%`,
            icon: trend >= 0 ? ArrowUpRight : ArrowDownRight,
            color: trend >= 0 ? 'text-emerald-500' : 'text-red-500',
          },
        ].map(card => (
          <div key={card.label} className="bg-dash-card rounded-xl border border-dash-border p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-dash-text-muted uppercase tracking-wider font-medium">{card.label}</span>
              <card.icon size={16} className={card.color} />
            </div>
            <p className="text-xl font-semibold text-dash-text">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Traffic chart */}
      {dailyChart.length > 1 && (
        <div className="bg-dash-card rounded-xl border border-dash-border p-6">
          <h3 className="text-sm font-medium text-dash-text mb-4">Traffic Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyChart}>
              <CartesianGrid strokeDasharray="3 3" className="[&_line]:stroke-dash-border" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} className="[&_text]:fill-dash-text-muted" />
              <YAxis tick={{ fontSize: 10 }} className="[&_text]:fill-dash-text-muted" />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="views" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} strokeWidth={2} name="Page Views" />
              <Area type="monotone" dataKey="visitors" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.05} strokeWidth={2} strokeDasharray="5 5" name="Unique Visitors" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top pages */}
        {data.by_page.length > 0 && (
          <div className="bg-dash-card rounded-xl border border-dash-border p-6">
            <h3 className="text-sm font-medium text-dash-text mb-4">Top Pages</h3>
            <div className="space-y-3">
              {data.by_page.slice(0, 10).map((p, i) => {
                const maxViews = data.by_page[0]?.views || 1;
                return (
                  <div key={p.page}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-dash-text truncate max-w-[200px]">{p.page}</span>
                      <div className="flex items-center gap-3 text-[10px] text-dash-text-muted shrink-0">
                        <span>{formatNumber(p.views)} views</span>
                        <span>{formatNumber(p.visitors)} visitors</span>
                      </div>
                    </div>
                    <div className="w-full bg-dash-badge-bg rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-indigo-500"
                        style={{ width: `${Math.max((p.views / maxViews) * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top referrers */}
        <div className="bg-dash-card rounded-xl border border-dash-border p-6">
          <h3 className="text-sm font-medium text-dash-text mb-4">Top Referrers</h3>
          {data.top_referrers.length > 0 ? (
            <div className="space-y-3">
              {data.top_referrers.map((r) => {
                const maxViews = data.top_referrers[0]?.views || 1;
                let displayName = r.referrer;
                try { displayName = new URL(r.referrer).hostname; } catch { /* */ }
                return (
                  <div key={r.referrer}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Globe size={12} className="text-dash-text-muted shrink-0" />
                        <span className="text-xs text-dash-text truncate max-w-[180px]">{displayName}</span>
                      </div>
                      <span className="text-[10px] text-dash-text-muted shrink-0">{formatNumber(r.views)} visits</span>
                    </div>
                    <div className="w-full bg-dash-badge-bg rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-violet-500"
                        style={{ width: `${Math.max((r.views / maxViews) * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-dash-text-muted text-center py-8">No referrer data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const POSTIZ_BASE_URL = 'https://social.houstonomegas.com';

interface PostizAnalytics {
  source: string;
  totalAccounts: number;
  activeAccounts: number;
  totalFollowers?: number;
  totalPosts?: number;
  totalLikes?: number;
  totalViews?: number;
  platforms: Array<{
    name: string;
    count?: number;
    followers?: number;
    posts?: number;
    likes?: number;
    views?: number;
    accounts?: Array<{ id: string; name: string; handle: string; picture?: string }>;
  }>;
  postizConnected: boolean;
  postizUrl?: string;
}

/* ───── Social Media Tab ───── */
function SocialMediaTab() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [metricsMap, setMetricsMap] = useState<Record<string, SocialMetric[]>>({});
  const [postizData, setPostizData] = useState<PostizAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ platform: 'instagram', handle: '', url: '' });
  const [loggingAccount, setLoggingAccount] = useState<SocialAccount | null>(null);
  const [metricForm, setMetricForm] = useState({ followers: '', posts: '', likes: '', views: '' });
  const [message, setMessage] = useState('');

  const fetchSocials = useCallback(async () => {
    setLoading(true);
    try {
      const [accountsRes, postizRes] = await Promise.all([
        fetch('/api/social/accounts', { credentials: 'include' }),
        fetch('/api/social/analytics', { credentials: 'include' }),
      ]);

      if (accountsRes.ok) {
        const data: SocialAccount[] = await accountsRes.json();
        setAccounts(data);
        const metricsEntries = await Promise.all(
          data.map(async (acc) => {
            const mRes = await fetch(`/api/social/metrics?account_id=${acc.id}`, { credentials: 'include' });
            const metrics = mRes.ok ? await mRes.json() : [];
            return [acc.id, metrics] as [string, SocialMetric[]];
          })
        );
        setMetricsMap(Object.fromEntries(metricsEntries));
      }

      if (postizRes.ok) {
        const postizAnalytics = await postizRes.json();
        setPostizData(postizAnalytics);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSocials(); }, [fetchSocials]);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/social/accounts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ platform: addForm.platform, handle: addForm.handle, url: addForm.url || null }),
    });
    if (res.ok) { setShowAdd(false); setAddForm({ platform: 'instagram', handle: '', url: '' }); fetchSocials(); setMessage('Account added.'); }
    else { const d = await res.json(); setMessage(d.error || 'Failed.'); }
  };

  const handleLogMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingAccount) return;
    const res = await fetch('/api/social/metrics', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({
        account_id: loggingAccount.id, recorded_date: new Date().toISOString().split('T')[0],
        followers: parseInt(metricForm.followers) || 0, posts_count: parseInt(metricForm.posts) || 0,
        likes: parseInt(metricForm.likes) || 0, views: parseInt(metricForm.views) || 0,
      }),
    });
    if (res.ok) { setLoggingAccount(null); setMetricForm({ followers: '', posts: '', likes: '', views: '' }); fetchSocials(); setMessage('Metrics logged.'); }
  };

  const handleDeleteAccount = async (acc: SocialAccount) => {
    if (!confirm(`Delete ${PLATFORM_LABELS[acc.platform]} @${acc.handle}?`)) return;
    const res = await fetch(`/api/social/${acc.id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) fetchSocials();
  };

  const inputClass = 'w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all';

  // Build follower chart data
  const followerChartData: { date: string; [key: string]: string | number }[] = [];
  const dateMap: Record<string, Record<string, number>> = {};
  accounts.forEach(acc => {
    const metrics = metricsMap[acc.id] || [];
    metrics.slice(0, 12).reverse().forEach(m => {
      if (!dateMap[m.recorded_date]) dateMap[m.recorded_date] = {};
      dateMap[m.recorded_date][acc.platform] = m.followers;
    });
  });
  Object.entries(dateMap).sort(([a], [b]) => a.localeCompare(b)).forEach(([date, platforms]) => {
    followerChartData.push({ date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), ...platforms });
  });

  return (
    <div className="space-y-6">
      {/* Postiz Quick Stats */}
      {postizData && (
        <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-xl border border-violet-200 dark:border-violet-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white">
                <Share2 size={20} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-dash-text">Social Media Overview</h3>
                <p className="text-[10px] text-dash-text-muted">
                  {postizData.postizConnected ? 'Connected to Postiz' : 'Using local analytics'}
                </p>
              </div>
            </div>
            <a
              href={POSTIZ_BASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium"
            >
              Open Postiz
              <ExternalLink size={12} />
            </a>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Total Followers</p>
              <p className="text-lg font-semibold text-dash-text">{formatNumber(postizData.totalFollowers || 0)}</p>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Total Posts</p>
              <p className="text-lg font-semibold text-dash-text">{formatNumber(postizData.totalPosts || 0)}</p>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Total Likes</p>
              <p className="text-lg font-semibold text-dash-text">{formatNumber(postizData.totalLikes || 0)}</p>
            </div>
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
              <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Total Views</p>
              <p className="text-lg font-semibold text-dash-text">{formatNumber(postizData.totalViews || 0)}</p>
            </div>
          </div>
          {postizData.platforms && postizData.platforms.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {postizData.platforms.map((platform) => (
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
                  <span className="text-xs text-dash-text">{PLATFORM_LABELS[platform.name] || platform.name}</span>
                  {platform.followers !== undefined && (
                    <span className="text-[10px] text-dash-text-muted">{formatNumber(platform.followers)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-dash-text-secondary">{accounts.length} account{accounts.length !== 1 ? 's' : ''} tracked</p>
        <button onClick={() => setShowAdd(true)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">
          Add Account
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-lg text-xs text-center bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
          {message}<button onClick={() => setMessage('')} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* Follower Growth Chart */}
      {followerChartData.length > 1 && (
        <div className="bg-dash-card rounded-xl border border-dash-border p-6">
          <h3 className="text-sm font-medium text-dash-text mb-4">Follower Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={followerChartData}>
              <CartesianGrid strokeDasharray="3 3" className="[&_line]:stroke-dash-border" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} className="[&_text]:fill-dash-text-muted" />
              <YAxis tick={{ fontSize: 10 }} className="[&_text]:fill-dash-text-muted" />
              <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
              {accounts.map(acc => (
                <Line key={acc.id} type="monotone" dataKey={acc.platform} stroke={PLATFORM_COLORS[acc.platform] || '#666'} strokeWidth={2} dot={{ r: 3 }} name={PLATFORM_LABELS[acc.platform]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Social Account Cards */}
      {loading ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
          <div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin mx-auto" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center text-sm text-dash-text-muted">No social accounts tracked yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => {
            const metrics = metricsMap[acc.id] || [];
            const latest = metrics.length ? metrics[0] : null;
            const previous = metrics.length > 1 ? metrics[1] : null;
            return (
              <div key={acc.id} className="bg-dash-card rounded-xl border border-dash-border p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-bold uppercase" style={{ backgroundColor: PLATFORM_COLORS[acc.platform] || '#666' }}>
                      {acc.platform.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-dash-text">{PLATFORM_LABELS[acc.platform] || acc.platform}</p>
                      <p className="text-[10px] text-dash-text-muted">@{acc.handle}</p>
                    </div>
                  </div>
                </div>
                {latest ? (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Followers', value: latest.followers, prev: previous?.followers ?? 0 },
                      { label: 'Posts', value: latest.posts_count, prev: previous?.posts_count ?? 0 },
                      { label: 'Likes', value: latest.likes, prev: previous?.likes ?? 0 },
                      { label: 'Views', value: latest.views, prev: previous?.views ?? 0 },
                    ].map(m => {
                      const diff = m.value - m.prev;
                      return (
                        <div key={m.label}>
                          <p className="text-[10px] text-dash-text-muted uppercase tracking-wider">{m.label}</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-semibold text-dash-text">{formatNumber(m.value)}</span>
                            {m.prev > 0 && diff !== 0 && (
                              <span className={`text-[10px] ${diff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {diff > 0 ? '+' : ''}{formatNumber(diff)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-dash-bg rounded-lg p-4 mb-4 text-center text-[10px] text-dash-text-muted uppercase">No metrics logged</div>
                )}
                <div className="flex gap-2 pt-3 border-t border-dash-border">
                  <button onClick={() => { setLoggingAccount(acc); setMetricForm({ followers: latest?.followers?.toString() || '', posts: latest?.posts_count?.toString() || '', likes: latest?.likes?.toString() || '', views: latest?.views?.toString() || '' }); }} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">Log</button>
                  <button onClick={() => handleDeleteAccount(acc)} className="text-red-400 text-[10px] uppercase font-semibold px-3 py-2 rounded-lg hover:text-red-600 transition-all ml-auto">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Account Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddAccount} className="bg-dash-card rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-dash-border">
            <h2 className="text-sm font-medium text-dash-text">Add Social Account</h2>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Platform</label>
              <select value={addForm.platform} onChange={e => setAddForm({ ...addForm, platform: e.target.value })} className={inputClass}>
                {Object.entries(PLATFORM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Handle</label>
              <input type="text" value={addForm.handle} onChange={e => setAddForm({ ...addForm, handle: e.target.value })} placeholder="@handle" required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">URL (optional)</label>
              <input type="url" value={addForm.url} onChange={e => setAddForm({ ...addForm, url: e.target.value })} className={inputClass} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">Add</button>
              <button type="button" onClick={() => setShowAdd(false)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Log Metrics Modal */}
      {loggingAccount && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleLogMetrics} className="bg-dash-card rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-dash-border">
            <h2 className="text-sm font-medium text-dash-text">
              Log &mdash; <span style={{ color: PLATFORM_COLORS[loggingAccount.platform] }}>{PLATFORM_LABELS[loggingAccount.platform]}</span> @{loggingAccount.handle}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Followers</label><input type="number" min="0" value={metricForm.followers} onChange={e => setMetricForm({ ...metricForm, followers: e.target.value })} className={inputClass} /></div>
              <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Posts</label><input type="number" min="0" value={metricForm.posts} onChange={e => setMetricForm({ ...metricForm, posts: e.target.value })} className={inputClass} /></div>
              <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Likes</label><input type="number" min="0" value={metricForm.likes} onChange={e => setMetricForm({ ...metricForm, likes: e.target.value })} className={inputClass} /></div>
              <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Views</label><input type="number" min="0" value={metricForm.views} onChange={e => setMetricForm({ ...metricForm, views: e.target.value })} className={inputClass} /></div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">Log</button>
              <button type="button" onClick={() => setLoggingAccount(null)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ───── Main Page ───── */
export default function AnalyticsPage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');
  const [tab, setTab] = useState<'website' | 'social'>('website');

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Analytics</h1>
          <p className="text-sm text-dash-text-secondary mt-1">Website traffic and social media performance</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-dash-border mb-6">
        {[
          { key: 'website' as const, label: 'Website' },
          { key: 'social' as const, label: 'Social Media' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 -mb-px ${
              tab === t.key
                ? 'border-dash-text text-dash-text'
                : 'border-transparent text-dash-text-muted hover:text-dash-text-secondary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'website' ? <WebsiteAnalytics /> : <SocialMediaTab />}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';
import {
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

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

export default function SocialMediaPage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');

  // Social state
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [metricsMap, setMetricsMap] = useState<Record<string, SocialMetric[]>>({});
  const [socialLoading, setSocialLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ platform: 'instagram', handle: '', url: '' });
  const [loggingAccount, setLoggingAccount] = useState<SocialAccount | null>(null);
  const [metricForm, setMetricForm] = useState({ followers: '', posts: '', likes: '', views: '' });
  const [message, setMessage] = useState('');

  const fetchSocials = useCallback(async () => {
    setSocialLoading(true);
    try {
      const res = await fetch('/api/social/accounts', { credentials: 'include' });
      if (res.ok) {
        const data: SocialAccount[] = await res.json();
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
    } catch {}
    finally { setSocialLoading(false); }
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

  const inputClass = 'w-full px-3 py-2.5 bg-dash-card border border-dash-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';

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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Social Media</h1>
          <p className="text-sm text-dash-text-secondary mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Add Account</button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 text-green-600 border border-green-200">
          {message}<button onClick={() => setMessage('')} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* Follower Growth Chart */}
      {followerChartData.length > 1 && (
        <div className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6">
          <h3 className="text-sm font-medium text-dash-text mb-4">Follower Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={followerChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#999' }} />
              <YAxis tick={{ fontSize: 10, fill: '#999' }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              {accounts.map(acc => (
                <Line key={acc.id} type="monotone" dataKey={acc.platform} stroke={PLATFORM_COLORS[acc.platform] || '#666'} strokeWidth={2} dot={{ r: 3 }} name={PLATFORM_LABELS[acc.platform]} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Social Account Cards */}
      {socialLoading ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
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
                              <span className={`text-[10px] ${diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
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
                  <button onClick={() => { setLoggingAccount(acc); setMetricForm({ followers: latest?.followers?.toString() || '', posts: latest?.posts_count?.toString() || '', likes: latest?.likes?.toString() || '', views: latest?.views?.toString() || '' }); }} className="bg-gray-900 text-white text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-2 rounded-lg hover:bg-gray-800 transition-all">Log</button>
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
          <form onSubmit={handleAddAccount} className="bg-dash-card rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
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
              <button type="submit" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Add</button>
              <button type="button" onClick={() => setShowAdd(false)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-gray-300 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Log Metrics Modal */}
      {loggingAccount && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleLogMetrics} className="bg-dash-card rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
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
              <button type="submit" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Log</button>
              <button type="button" onClick={() => setLoggingAccount(null)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-gray-300 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

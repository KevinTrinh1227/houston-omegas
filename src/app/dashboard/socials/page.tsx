'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';

interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  url: string | null;
  is_active: number;
  created_at: string;
}

interface SocialMetric {
  id: string;
  account_id: string;
  recorded_date: string;
  followers: number;
  following: number;
  posts_count: number;
  likes: number;
  comments: number;
  views: number;
  notes: string | null;
  recorded_by: string;
  created_at: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  tiktok: '#000000',
  youtube: '#FF0000',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
};

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  twitter: 'Twitter / X',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

function formatDelta(current: number, previous: number): { text: string; color: string } {
  if (previous === 0) return { text: '--', color: 'text-gray-400' };
  const diff = current - previous;
  if (diff === 0) return { text: '0', color: 'text-gray-400' };
  const sign = diff > 0 ? '+' : '';
  return {
    text: `${sign}${formatNumber(diff)}`,
    color: diff > 0 ? 'text-green-600' : 'text-red-500',
  };
}

export default function SocialsPage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');

  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [metricsMap, setMetricsMap] = useState<Record<string, SocialMetric[]>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Add account modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ platform: 'instagram', handle: '', url: '' });

  // Log metrics modal
  const [loggingAccount, setLoggingAccount] = useState<SocialAccount | null>(null);
  const [metricForm, setMetricForm] = useState({ followers: '', posts: '', likes: '', views: '' });

  // Edit modal
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);
  const [editForm, setEditForm] = useState({ handle: '', url: '' });

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/social/accounts', { credentials: 'include' });
      if (res.ok) {
        const data: SocialAccount[] = await res.json();
        setAccounts(data);
        // Fetch metrics for each account
        const metricsEntries = await Promise.all(
          data.map(async (acc) => {
            const mRes = await fetch(`/api/social/metrics?account_id=${acc.id}`, { credentials: 'include' });
            const metrics = mRes.ok ? await mRes.json() : [];
            return [acc.id, metrics] as [string, SocialMetric[]];
          })
        );
        setMetricsMap(Object.fromEntries(metricsEntries));
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ platform: addForm.platform, handle: addForm.handle, url: addForm.url || null }),
      });
      if (res.ok) {
        setShowAdd(false);
        setAddForm({ platform: 'instagram', handle: '', url: '' });
        fetchAccounts();
        setMessage('Account added.');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to add account.');
      }
    } catch { setMessage('Connection error.'); }
  };

  const handleLogMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingAccount) return;
    try {
      const res = await fetch('/api/social/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          account_id: loggingAccount.id,
          recorded_date: new Date().toISOString().split('T')[0],
          followers: parseInt(metricForm.followers) || 0,
          posts_count: parseInt(metricForm.posts) || 0,
          likes: parseInt(metricForm.likes) || 0,
          views: parseInt(metricForm.views) || 0,
        }),
      });
      if (res.ok) {
        setLoggingAccount(null);
        setMetricForm({ followers: '', posts: '', likes: '', views: '' });
        fetchAccounts();
        setMessage('Metrics logged.');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to log metrics.');
      }
    } catch { setMessage('Connection error.'); }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    try {
      const res = await fetch(`/api/social/${editingAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ handle: editForm.handle, url: editForm.url || null }),
      });
      if (res.ok) {
        setEditingAccount(null);
        fetchAccounts();
        setMessage('Account updated.');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to update.');
      }
    } catch { setMessage('Connection error.'); }
  };

  const handleToggleActive = async (acc: SocialAccount) => {
    try {
      await fetch(`/api/social/${acc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: acc.is_active ? 0 : 1 }),
      });
      fetchAccounts();
    } catch { /* */ }
  };

  const handleDelete = async (acc: SocialAccount) => {
    if (!confirm(`Delete ${PLATFORM_LABELS[acc.platform] || acc.platform} account @${acc.handle}?`)) return;
    try {
      const res = await fetch(`/api/social/${acc.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) { fetchAccounts(); setMessage('Account deleted.'); }
    } catch { setMessage('Delete failed.'); }
  };

  const getLatestMetrics = (accountId: string): SocialMetric | null => {
    const metrics = metricsMap[accountId];
    return metrics?.length ? metrics[0] : null;
  };

  const getPreviousMetrics = (accountId: string): SocialMetric | null => {
    const metrics = metricsMap[accountId];
    return metrics?.length > 1 ? metrics[1] : null;
  };

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';

  // Non-exec access denied
  if (!isExec) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Social Media</h1>
          <p className="text-sm text-gray-500 mt-1">Social media tracking</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">
          Executive board access only.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Social Media</h1>
          <p className="text-sm text-gray-500 mt-1">{accounts.length} account{accounts.length !== 1 ? 's' : ''} tracked</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Add Account</button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 text-green-600 border border-green-200">
          {message}
          <button onClick={() => setMessage('')} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* Add account modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddAccount} className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-sm font-medium text-gray-900">Add Social Account</h2>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Platform</label>
              <select value={addForm.platform} onChange={e => setAddForm({ ...addForm, platform: e.target.value })} className={inputClass}>
                {Object.entries(PLATFORM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Handle</label>
              <input type="text" value={addForm.handle} onChange={e => setAddForm({ ...addForm, handle: e.target.value })} placeholder="@yourhandle" required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Profile URL (optional)</label>
              <input type="url" value={addForm.url} onChange={e => setAddForm({ ...addForm, url: e.target.value })} placeholder="https://..." className={inputClass} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Add</button>
              <button type="button" onClick={() => setShowAdd(false)} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Log metrics modal */}
      {loggingAccount && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleLogMetrics} className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-sm font-medium text-gray-900">
              Log Metrics &mdash; <span style={{ color: PLATFORM_COLORS[loggingAccount.platform] || '#666' }}>{PLATFORM_LABELS[loggingAccount.platform]}</span> @{loggingAccount.handle}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Followers</label>
                <input type="number" min="0" value={metricForm.followers} onChange={e => setMetricForm({ ...metricForm, followers: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Posts</label>
                <input type="number" min="0" value={metricForm.posts} onChange={e => setMetricForm({ ...metricForm, posts: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Likes</label>
                <input type="number" min="0" value={metricForm.likes} onChange={e => setMetricForm({ ...metricForm, likes: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Views</label>
                <input type="number" min="0" value={metricForm.views} onChange={e => setMetricForm({ ...metricForm, views: e.target.value })} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Log</button>
              <button type="button" onClick={() => setLoggingAccount(null)} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Edit account modal */}
      {editingAccount && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdateAccount} className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-sm font-medium text-gray-900">Edit Account</h2>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Handle</label>
              <input type="text" value={editForm.handle} onChange={e => setEditForm({ ...editForm, handle: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Profile URL</label>
              <input type="url" value={editForm.url} onChange={e => setEditForm({ ...editForm, url: e.target.value })} className={inputClass} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Save</button>
              <button type="button" onClick={() => setEditingAccount(null)} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Account cards */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">No social accounts tracked yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => {
            const latest = getLatestMetrics(acc.id);
            const previous = getPreviousMetrics(acc.id);
            const metrics = metricsMap[acc.id] || [];
            const last6 = metrics.slice(0, 6).reverse();
            const maxFollowers = Math.max(...last6.map(m => m.followers), 1);

            return (
              <div key={acc.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[10px] font-bold uppercase"
                      style={{ backgroundColor: PLATFORM_COLORS[acc.platform] || '#666' }}
                    >
                      {acc.platform.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900">{PLATFORM_LABELS[acc.platform] || acc.platform}</p>
                      <p className="text-[10px] text-gray-400">@{acc.handle}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${acc.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {acc.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Metrics */}
                {latest ? (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { label: 'Followers', value: latest.followers, prev: previous?.followers ?? 0 },
                      { label: 'Posts', value: latest.posts_count, prev: previous?.posts_count ?? 0 },
                      { label: 'Likes', value: latest.likes, prev: previous?.likes ?? 0 },
                      { label: 'Views', value: latest.views, prev: previous?.views ?? 0 },
                    ].map(m => {
                      const delta = formatDelta(m.value, m.prev);
                      return (
                        <div key={m.label}>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">{m.label}</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-semibold text-gray-900">{formatNumber(m.value)}</span>
                            <span className={`text-[10px] ${delta.color}`}>{delta.text}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-center text-[10px] text-gray-400 uppercase tracking-wider">
                    No metrics logged yet
                  </div>
                )}

                {/* Followers trend bar chart */}
                {last6.length > 1 && (
                  <div className="mb-4">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Followers Trend</p>
                    <div className="space-y-1">
                      {last6.map((m, i) => (
                        <div key={m.id || i} className="flex items-center gap-2">
                          <span className="text-[9px] text-gray-400 w-12 text-right shrink-0">
                            {new Date(m.recorded_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${Math.max((m.followers / maxFollowers) * 100, 2)}%`,
                                backgroundColor: PLATFORM_COLORS[acc.platform] || '#666',
                                opacity: 0.7 + (i / last6.length) * 0.3,
                              }}
                            />
                          </div>
                          <span className="text-[9px] text-gray-500 w-10 shrink-0">{formatNumber(m.followers)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-3 border-t border-gray-100">
                  <button
                    onClick={() => { setLoggingAccount(acc); setMetricForm({ followers: latest?.followers?.toString() || '', posts: latest?.posts_count?.toString() || '', likes: latest?.likes?.toString() || '', views: latest?.views?.toString() || '' }); }}
                    className="bg-gray-900 text-white text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-2 rounded-lg hover:bg-gray-800 transition-all"
                  >
                    Log Metrics
                  </button>
                  <button
                    onClick={() => { setEditingAccount(acc); setEditForm({ handle: acc.handle, url: acc.url || '' }); }}
                    className="text-gray-500 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(acc)}
                    className="text-gray-400 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-2 rounded-lg hover:text-gray-600 transition-all"
                  >
                    {acc.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDelete(acc)}
                    className="text-red-400 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-2 rounded-lg hover:text-red-600 transition-all ml-auto"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

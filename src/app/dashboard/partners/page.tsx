'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';

interface Partner {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  category: string;
  tier: string;
  website_url: string | null;
  instagram: string | null;
  tiktok: string | null;
  twitter: string | null;
  facebook: string | null;
  youtube: string | null;
  email: string | null;
  phone: string | null;
  images: string;
  is_active: number;
  is_current: number;
  sort_order: number;
  created_at: string;
}

const CATEGORIES = ['sponsor', 'affiliate', 'organization', 'vendor'];
const TIERS = ['gold', 'silver', 'bronze', 'community'];

export default function PartnersManagePage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');

  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', category: 'sponsor', tier: 'bronze',
    website_url: '', instagram: '', tiktok: '', twitter: '', facebook: '', youtube: '',
    email: '', phone: '', sort_order: 0, is_current: true,
  });

  const fetchPartners = useCallback(async () => {
    try {
      const res = await fetch('/api/partners', { credentials: 'include' });
      if (res.ok) setPartners(await res.json());
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const resetForm = () => {
    setForm({ name: '', description: '', category: 'sponsor', tier: 'bronze', website_url: '', instagram: '', tiktok: '', twitter: '', facebook: '', youtube: '', email: '', phone: '', sort_order: 0, is_current: true });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (p: Partner) => {
    setForm({
      name: p.name, description: p.description || '', category: p.category, tier: p.tier,
      website_url: p.website_url || '', instagram: p.instagram || '', tiktok: p.tiktok || '',
      twitter: p.twitter || '', facebook: p.facebook || '', youtube: p.youtube || '',
      email: p.email || '', phone: p.phone || '', sort_order: p.sort_order, is_current: !!p.is_current,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/partners/${editingId}` : '/api/partners';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { resetForm(); fetchPartners(); }
    } catch { /* */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this partner?')) return;
    try {
      await fetch(`/api/partners/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchPartners();
    } catch { /* */ }
  };

  const toggleCurrent = async (p: Partner) => {
    try {
      await fetch(`/api/partners/${p.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_current: !p.is_current }),
      });
      fetchPartners();
    } catch { /* */ }
  };

  const tierColor: Record<string, string> = {
    gold: 'bg-amber-100 text-amber-700',
    silver: 'bg-dash-badge-bg text-dash-text-secondary',
    bronze: 'bg-orange-100 text-orange-700',
    community: 'bg-blue-100 text-blue-700',
  };

  const categoryColor: Record<string, string> = {
    sponsor: 'bg-green-100 text-green-700',
    affiliate: 'bg-purple-100 text-purple-700',
    organization: 'bg-blue-100 text-blue-700',
    vendor: 'bg-orange-100 text-orange-700',
  };

  const inputClass = 'w-full px-3 py-2.5 bg-dash-card border border-dash-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';
  const selectClass = 'w-full px-3 py-2.5 bg-dash-card border border-dash-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 outline-none transition-all';

  if (!isExec) {
    return (
      <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
        <p className="text-dash-text-muted text-sm">You don&apos;t have permission to manage partners.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Partners</h1>
          <p className="text-sm text-dash-text-secondary mt-1">Manage sponsors, affiliates, and partner organizations</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">
            Add Partner
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6 space-y-4">
          <h2 className="text-sm font-medium text-dash-text">{editingId ? 'Edit' : 'New'} Partner</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={selectClass}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Tier</label>
                <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })} className={selectClass}>
                  {TIERS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Website</label>
              <input type="url" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Instagram</label>
              <input type="text" value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@handle" className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">TikTok</label>
              <input type="text" value={form.tiktok} onChange={e => setForm({ ...form, tiktok: e.target.value })} placeholder="@handle" className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Twitter/X</label>
              <input type="text" value={form.twitter} onChange={e => setForm({ ...form, twitter: e.target.value })} placeholder="@handle" className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Facebook</label>
              <input type="text" value={form.facebook} onChange={e => setForm({ ...form, facebook: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">YouTube</label>
              <input type="text" value={form.youtube} onChange={e => setForm({ ...form, youtube: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className={inputClass} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_current} onChange={e => setForm({ ...form, is_current: e.target.checked })} className="rounded border-gray-300" />
                <span className="text-sm text-dash-text">Current partner</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-gray-300 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-dash-card rounded-xl border border-dash-border p-5 animate-pulse">
              <div className="h-4 bg-dash-badge-bg rounded w-48 mb-2" />
              <div className="h-3 bg-dash-badge-bg rounded w-72" />
            </div>
          ))}
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
          <p className="text-dash-text-muted text-sm mb-4">No partners yet.</p>
          <button onClick={() => setShowForm(true)} className="text-dash-text-secondary text-xs hover:underline">Add your first partner</button>
        </div>
      ) : (
        <div className="bg-dash-card rounded-xl border border-dash-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dash-border">
                  <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Partner</th>
                  <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 hidden sm:table-cell">Category</th>
                  <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Tier</th>
                  <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 hidden sm:table-cell">Status</th>
                  <th className="text-right text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.map(p => (
                  <tr key={p.id} className={`border-b border-dash-border/50 hover:bg-dash-card-hover transition-colors ${!p.is_current ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.logo_url ? (
                          <img src={p.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-dash-badge-bg flex items-center justify-center text-dash-text-muted text-xs font-bold">
                            {p.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-dash-text">{p.name}</p>
                          {p.website_url && <p className="text-[11px] text-dash-text-muted truncate max-w-[200px]">{p.website_url}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${categoryColor[p.category]}`}>{p.category}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${tierColor[p.tier]}`}>{p.tier}</span>
                    </td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${p.is_current ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {p.is_current ? 'Current' : 'Past'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleCurrent(p)} className="text-xs text-dash-text-muted hover:text-dash-text-secondary transition-colors">
                          {p.is_current ? 'Mark Past' : 'Mark Current'}
                        </button>
                        <button onClick={() => startEdit(p)} className="text-xs text-dash-text-muted hover:text-dash-text-secondary transition-colors">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

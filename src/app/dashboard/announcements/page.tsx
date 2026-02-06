'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';

interface Announcement {
  id: number;
  title: string;
  body: string;
  type: string;
  priority: string;
  link_url: string | null;
  link_text: string | null;
  is_active: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export default function AnnouncementsPage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', body: '', type: 'banner', priority: 'normal',
    link_url: '', link_text: '', starts_at: '', ends_at: '',
  });

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/announcements', { credentials: 'include' });
      if (res.ok) setAnnouncements(await res.json());
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);

  const resetForm = () => {
    setForm({ title: '', body: '', type: 'banner', priority: 'normal', link_url: '', link_text: '', starts_at: '', ends_at: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (a: Announcement) => {
    setForm({
      title: a.title, body: a.body, type: a.type, priority: a.priority,
      link_url: a.link_url || '', link_text: a.link_text || '',
      starts_at: a.starts_at || '', ends_at: a.ends_at || '',
    });
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId ? `/api/announcements/${editingId}` : '/api/announcements';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        resetForm();
        fetchAnnouncements();
      }
    } catch { /* */ }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await fetch(`/api/announcements/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchAnnouncements();
    } catch { /* */ }
  };

  const toggleActive = async (a: Announcement) => {
    try {
      await fetch(`/api/announcements/${a.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !a.is_active }),
      });
      fetchAnnouncements();
    } catch { /* */ }
  };

  const priorityColor: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    normal: 'bg-blue-100 text-blue-700',
    low: 'bg-gray-100 text-gray-600',
  };

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';
  const selectClass = 'px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 outline-none transition-all';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">Manage announcements shown on the website</p>
        </div>
        {isExec && !showForm && (
          <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">
            New Announcement
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && isExec && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="text-sm font-medium text-gray-900">{editingId ? 'Edit' : 'New'} Announcement</h2>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Title</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className={inputClass} />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Body</label>
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required rows={3} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={selectClass}>
                <option value="banner">Banner</option>
                <option value="popup">Popup</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={selectClass}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Starts At</label>
              <input type="datetime-local" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Ends At</label>
              <input type="datetime-local" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Link URL (optional)</label>
              <input type="url" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Link Text (optional)</label>
              <input type="text" value={form.link_text} onChange={e => setForm({ ...form, link_text: e.target.value })} placeholder="Learn more" className={inputClass} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={resetForm} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-48 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-72" />
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className={`bg-white rounded-xl border border-gray-200 p-5 ${!a.is_active ? 'opacity-50' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{a.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${priorityColor[a.priority]}`}>{a.priority}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 uppercase">{a.type}</span>
                    {!a.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 uppercase">Inactive</span>}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{a.body}</p>
                  {a.link_url && <p className="text-xs text-blue-500 mt-1 truncate">{a.link_text || a.link_url}</p>}
                </div>
                {isExec && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggleActive(a)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                      {a.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => startEdit(a)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Edit</button>
                    <button onClick={() => handleDelete(a.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

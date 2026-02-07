'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  views: number;
  created_at: string;
  first_name: string;
  last_name: string;
  author_id: string;
}

interface Announcement {
  id: number;
  title: string;
  body: string;
  type: string;
  priority: string;
  link_url: string | null;
  link_text: string | null;
  image_url: string | null;
  target_pages: string | null;
  display_mode: string;
  is_active: number;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export default function ContentPage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'announcements' ? 'announcements' : 'blog';
  const [tab, setTab] = useState<'blog' | 'announcements'>(initialTab);

  // Blog state
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  // Announcement state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', body: '', type: 'banner', priority: 'normal',
    link_url: '', link_text: '', starts_at: '', ends_at: '',
    image_url: '', target_pages: [] as string[], display_mode: 'toast',
  });

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/blog-posts', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || data);
      }
    } catch { /* */ }
    finally { setPostsLoading(false); }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await fetch('/api/announcements', { credentials: 'include' });
      if (res.ok) setAnnouncements(await res.json());
    } catch { /* */ }
    finally { setAnnouncementsLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); fetchAnnouncements(); }, [fetchPosts, fetchAnnouncements]);

  // Blog handlers
  const handleDeletePost = async (slug: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await fetch(`/api/blog/${slug}`, { method: 'DELETE', credentials: 'include' });
      fetchPosts();
    } catch { /* */ }
  };

  // Announcement handlers
  const resetForm = () => {
    setForm({ title: '', body: '', type: 'banner', priority: 'normal', link_url: '', link_text: '', starts_at: '', ends_at: '', image_url: '', target_pages: [], display_mode: 'toast' });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (a: Announcement) => {
    let pages: string[] = [];
    try { pages = JSON.parse(a.target_pages || '[]'); } catch { /* */ }
    setForm({
      title: a.title, body: a.body, type: a.type, priority: a.priority,
      link_url: a.link_url || '', link_text: a.link_text || '',
      starts_at: a.starts_at || '', ends_at: a.ends_at || '',
      image_url: a.image_url || '', target_pages: pages,
      display_mode: a.display_mode || 'toast',
    });
    setEditingId(a.id);
    setShowForm(true);
  };

  const handleSubmitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/announcements/${editingId}` : '/api/announcements';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, target_pages: JSON.stringify(form.target_pages) }),
      });
      if (res.ok) { resetForm(); fetchAnnouncements(); }
    } catch { /* */ }
    finally { setSaving(false); }
  };

  const handleDeleteAnnouncement = async (id: number) => {
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

  const statusColor: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-yellow-100 text-yellow-700',
    archived: 'bg-dash-badge-bg text-dash-text-secondary',
  };

  const priorityColor: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700',
    high: 'bg-orange-100 text-orange-700',
    normal: 'bg-blue-100 text-blue-700',
    low: 'bg-dash-badge-bg text-dash-text-secondary',
  };

  const inputClass = 'w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 outline-none transition-all';
  const selectClass = 'px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 outline-none transition-all';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Content</h1>
          <p className="text-sm text-dash-text-secondary mt-1">Manage blog posts and announcements</p>
        </div>
        <div className="flex items-center gap-3">
          {tab === 'blog' && (isExec || member?.role === 'active' || member?.role === 'junior_active') && (
            <Link href="/dashboard/blog/new" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">
              New Post
            </Link>
          )}
          {tab === 'announcements' && isExec && !showForm && (
            <button onClick={() => setShowForm(true)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">
              New Announcement
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dash-badge-bg rounded-lg p-1 w-fit">
        <button onClick={() => setTab('blog')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'blog' ? 'bg-dash-card text-dash-text shadow-sm' : 'text-dash-text-secondary hover:text-dash-text'}`}>
          Blog Posts
        </button>
        {isExec && (
          <button onClick={() => setTab('announcements')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'announcements' ? 'bg-dash-card text-dash-text shadow-sm' : 'text-dash-text-secondary hover:text-dash-text'}`}>
            Announcements
          </button>
        )}
      </div>

      {/* Blog Tab */}
      {tab === 'blog' && (
        <>
          {postsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-dash-card rounded-xl border border-dash-border p-5 animate-pulse">
                  <div className="h-4 bg-dash-badge-bg rounded w-48 mb-2" />
                  <div className="h-3 bg-dash-badge-bg rounded w-72" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
              <p className="text-dash-text-muted text-sm mb-4">No blog posts yet.</p>
              <Link href="/dashboard/blog/new" className="text-dash-text-secondary text-xs hover:underline">Create your first post</Link>
            </div>
          ) : (
            <div className="bg-dash-card rounded-xl border border-dash-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dash-border">
                      <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Title</th>
                      <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 hidden sm:table-cell">Author</th>
                      <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Status</th>
                      <th className="text-right text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 hidden sm:table-cell">Views</th>
                      <th className="text-right text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post.id} className="border-b border-dash-border/50 hover:bg-dash-card-hover transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-sm font-medium text-dash-text truncate max-w-xs">{post.title}</p>
                          <p className="text-[11px] text-dash-text-muted mt-0.5">{post.published_at ? new Date(post.published_at + 'Z').toLocaleDateString() : 'Not published'}</p>
                        </td>
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <p className="text-xs text-dash-text-secondary">{post.first_name} {post.last_name}</p>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${statusColor[post.status]}`}>{post.status}</span>
                        </td>
                        <td className="px-5 py-3 text-right hidden sm:table-cell">
                          <span className="text-xs text-dash-text-secondary">{post.views}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/blog/edit?slug=${post.slug}`} className="text-xs text-dash-text-muted hover:text-dash-text-secondary transition-colors">Edit</Link>
                            {(post.author_id === member?.id || isExec) && (
                              <button onClick={() => handleDeletePost(post.slug)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Announcements Tab */}
      {tab === 'announcements' && isExec && (
        <>
          {/* Form */}
          {showForm && (
            <form onSubmit={handleSubmitAnnouncement} className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6 space-y-4">
              <h2 className="text-sm font-medium text-dash-text">{editingId ? 'Edit' : 'New'} Announcement</h2>

              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className={inputClass} />
              </div>

              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Body</label>
                <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required rows={3} className={inputClass} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div>
                  <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={selectClass}>
                    <option value="banner">Banner</option>
                    <option value="popup">Popup</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Display</label>
                  <select value={form.display_mode} onChange={e => setForm({ ...form, display_mode: e.target.value })} className={selectClass}>
                    <option value="toast">Toast</option>
                    <option value="center">Center Modal</option>
                    <option value="image_only">Image Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className={selectClass}>
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Starts At</label>
                  <input type="datetime-local" value={form.starts_at} onChange={e => setForm({ ...form, starts_at: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Ends At</label>
                  <input type="datetime-local" value={form.ends_at} onChange={e => setForm({ ...form, ends_at: e.target.value })} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Link URL (optional)</label>
                  <input type="url" value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Link Text (optional)</label>
                  <input type="text" value={form.link_text} onChange={e => setForm({ ...form, link_text: e.target.value })} placeholder="Learn more" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Image URL (optional)</label>
                <input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://... or /media/..." className={inputClass} />
              </div>

              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Target Pages (leave unchecked for all pages)</label>
                <div className="flex items-center gap-4 flex-wrap mt-1">
                  {[
                    { label: 'Home', value: '/' },
                    { label: 'Recruitment', value: '/recruitment' },
                    { label: 'Partners', value: '/partners' },
                    { label: 'Rent', value: '/rent' },
                    { label: 'Blog', value: '/blog' },
                  ].map(page => (
                    <label key={page.value} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.target_pages.includes(page.value)}
                        onChange={e => {
                          const pages = e.target.checked
                            ? [...form.target_pages, page.value]
                            : form.target_pages.filter(p => p !== page.value);
                          setForm({ ...form, target_pages: pages });
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-xs text-dash-text-secondary">{page.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50">
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={resetForm} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* List */}
          {announcementsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-dash-card rounded-xl border border-dash-border p-5 animate-pulse">
                  <div className="h-4 bg-dash-badge-bg rounded w-48 mb-2" />
                  <div className="h-3 bg-dash-badge-bg rounded w-72" />
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
              <p className="text-dash-text-muted text-sm">No announcements yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map(a => (
                <div key={a.id} className={`bg-dash-card rounded-xl border border-dash-border p-5 ${!a.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-medium text-dash-text truncate">{a.title}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${priorityColor[a.priority]}`}>{a.priority}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-dash-badge-bg text-dash-text-secondary uppercase">{a.type}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-dash-badge-bg text-dash-text-secondary uppercase">{a.display_mode || 'toast'}</span>
                        {!a.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 uppercase">Inactive</span>}
                      </div>
                      <p className="text-xs text-dash-text-secondary line-clamp-2">{a.body}</p>
                      {a.link_url && <p className="text-xs text-blue-500 mt-1 truncate">{a.link_text || a.link_url}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleActive(a)} className="text-xs text-dash-text-muted hover:text-dash-text-secondary transition-colors">
                        {a.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => startEdit(a)} className="text-xs text-dash-text-muted hover:text-dash-text-secondary transition-colors">Edit</button>
                      <button onClick={() => handleDeleteAnnouncement(a.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

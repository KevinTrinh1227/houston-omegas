'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';

interface WikiPage {
  id: string;
  slug: string;
  title: string;
  body: string;
  category: string;
  role_tag: string | null;
  created_by: string;
  author_first: string;
  author_last: string;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = ['Getting Started', 'Role Guides', 'How-To', 'Policies', 'General'] as const;

export default function WikiPage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');

  const [pages, setPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<WikiPage | null>(null);
  const [loadingPage, setLoadingPage] = useState(false);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', body: '', category: 'General', role_tag: '' });

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', body: '', category: 'General', role_tag: '' });
  const [showPreview, setShowPreview] = useState(false);

  const fetchPages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wiki', { credentials: 'include' });
      if (res.ok) setPages(await res.json());
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  const fetchPage = useCallback(async (slug: string) => {
    setLoadingPage(true);
    try {
      const res = await fetch(`/api/wiki/${slug}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCurrentPage(data);
      } else {
        setCurrentPage(null);
        setMessage('Page not found.');
      }
    } catch { setMessage('Failed to load page.'); }
    finally { setLoadingPage(false); }
  }, []);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  useEffect(() => {
    if (selectedSlug) fetchPage(selectedSlug);
    else setCurrentPage(null);
  }, [selectedSlug, fetchPage]);

  // Select first page on load
  useEffect(() => {
    if (!loading && pages.length > 0 && !selectedSlug) {
      setSelectedSlug(pages[0].slug);
    }
  }, [loading, pages, selectedSlug]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/wiki', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: createForm.title,
          body: createForm.body,
          category: createForm.category,
          role_tag: createForm.role_tag || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowCreate(false);
        setCreateForm({ title: '', body: '', category: 'General', role_tag: '' });
        await fetchPages();
        setSelectedSlug(data.slug);
        setMessage('Page created.');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to create page.');
      }
    } catch { setMessage('Connection error.'); }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPage) return;
    try {
      const res = await fetch(`/api/wiki/${currentPage.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editForm.title,
          body: editForm.body,
          category: editForm.category,
          role_tag: editForm.role_tag || null,
        }),
      });
      if (res.ok) {
        setEditing(false);
        setShowPreview(false);
        const data = await res.json();
        await fetchPages();
        setSelectedSlug(data.slug || currentPage.slug);
        fetchPage(data.slug || currentPage.slug);
        setMessage('Page updated.');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to update page.');
      }
    } catch { setMessage('Connection error.'); }
  };

  const handleDelete = async () => {
    if (!currentPage || !confirm(`Delete "${currentPage.title}"?`)) return;
    try {
      const res = await fetch(`/api/wiki/${currentPage.slug}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setSelectedSlug(null);
        setCurrentPage(null);
        fetchPages();
        setMessage('Page deleted.');
      }
    } catch { setMessage('Delete failed.'); }
  };

  // Group pages by category, filtered by search
  const groupedPages = useMemo(() => {
    const filtered = search
      ? pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
      : pages;

    const groups: Record<string, WikiPage[]> = {};
    for (const cat of CATEGORIES) groups[cat] = [];
    for (const page of filtered) {
      if (groups[page.category]) groups[page.category].push(page);
      else {
        if (!groups['General']) groups['General'] = [];
        groups['General'].push(page);
      }
    }
    return groups;
  }, [pages, search]);

  const inputClass = 'w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 outline-none transition-all';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Wiki</h1>
          <p className="text-sm text-dash-text-secondary mt-1">Internal documentation and guides</p>
        </div>
        {isExec && (
          <button onClick={() => { setShowCreate(true); setEditing(false); }} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">New Page</button>
        )}
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
          {message}
          <button onClick={() => setMessage('')} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* Create page modal */}
      {showCreate && isExec && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-dash-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-sm font-medium text-dash-text">New Wiki Page</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Title</label>
                <input type="text" value={createForm.title} onChange={e => setCreateForm({ ...createForm, title: e.target.value })} required className={inputClass} />
              </div>
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Category</label>
                <select value={createForm.category} onChange={e => setCreateForm({ ...createForm, category: e.target.value })} className={inputClass}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Role Tag (optional)</label>
              <input type="text" value={createForm.role_tag} onChange={e => setCreateForm({ ...createForm, role_tag: e.target.value })} placeholder="e.g. treasurer, president" className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Content (Markdown)</label>
              <textarea value={createForm.body} onChange={e => setCreateForm({ ...createForm, body: e.target.value })} rows={12} required className={inputClass + ' font-mono text-xs'} placeholder="Write your page content in Markdown..." />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
          <div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin mx-auto" />
        </div>
      ) : pages.length === 0 && !showCreate ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center text-sm text-dash-text-muted">No wiki pages yet.</div>
      ) : (
        <div className="flex gap-6 items-start">
          {/* Left sidebar */}
          <div className="w-64 shrink-0 hidden md:block">
            <div className="bg-dash-card rounded-xl border border-dash-border p-4 sticky top-4">
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search pages..."
                  className="w-full px-3 py-2 bg-dash-bg border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 outline-none transition-all"
                />
              </div>

              {/* Category groups */}
              <nav className="space-y-4">
                {CATEGORIES.map(cat => {
                  const catPages = groupedPages[cat] || [];
                  if (catPages.length === 0) return null;
                  return (
                    <div key={cat}>
                      <p className="text-[10px] text-dash-text-muted uppercase tracking-wider font-medium mb-1.5">{cat}</p>
                      <div className="space-y-0.5">
                        {catPages.map(p => (
                          <button
                            key={p.slug}
                            onClick={() => { setSelectedSlug(p.slug); setEditing(false); setShowPreview(false); }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-all truncate ${selectedSlug === p.slug ? 'bg-dash-badge-bg text-dash-text font-medium' : 'text-dash-text-secondary hover:text-dash-text hover:bg-dash-bg'}`}
                          >
                            {p.title}
                            {p.role_tag && (
                              <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-dash-badge-bg text-dash-text-muted uppercase">{p.role_tag}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Mobile sidebar (dropdown) */}
          <div className="md:hidden w-full mb-4">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search pages..."
              className="w-full px-3 py-2 bg-dash-card border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 outline-none transition-all mb-2"
            />
            <select
              value={selectedSlug || ''}
              onChange={e => { setSelectedSlug(e.target.value || null); setEditing(false); setShowPreview(false); }}
              className={inputClass}
            >
              <option value="">Select a page...</option>
              {CATEGORIES.map(cat => {
                const catPages = groupedPages[cat] || [];
                if (catPages.length === 0) return null;
                return (
                  <optgroup key={cat} label={cat}>
                    {catPages.map(p => (
                      <option key={p.slug} value={p.slug}>{p.title}</option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          {/* Right pane - content */}
          <div className="flex-1 min-w-0">
            {loadingPage ? (
              <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
                <div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin mx-auto" />
              </div>
            ) : !currentPage ? (
              <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center text-sm text-dash-text-muted">
                Select a page from the sidebar to view its content.
              </div>
            ) : editing && isExec ? (
              /* Edit mode */
              <form onSubmit={handleUpdate} className="bg-dash-card rounded-xl border border-dash-border p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-dash-text">Editing: {currentPage.title}</h2>
                  <div className="flex gap-1 bg-dash-badge-bg rounded-lg p-1">
                    <button type="button" onClick={() => setShowPreview(false)} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${!showPreview ? 'bg-dash-card text-dash-text shadow-sm' : 'text-dash-text-secondary'}`}>Edit</button>
                    <button type="button" onClick={() => setShowPreview(true)} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${showPreview ? 'bg-dash-card text-dash-text shadow-sm' : 'text-dash-text-secondary'}`}>Preview</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Title</label>
                    <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Category</label>
                    <select value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className={inputClass}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Role Tag (optional)</label>
                  <input type="text" value={editForm.role_tag} onChange={e => setEditForm({ ...editForm, role_tag: e.target.value })} className={inputClass} />
                </div>
                {showPreview ? (
                  <div className="prose prose-sm max-w-none border border-dash-border rounded-lg p-4 min-h-[200px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{editForm.body}</ReactMarkdown>
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Content (Markdown)</label>
                    <textarea value={editForm.body} onChange={e => setEditForm({ ...editForm, body: e.target.value })} rows={16} required className={inputClass + ' font-mono text-xs'} />
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="submit" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">Save</button>
                  <button type="button" onClick={() => { setEditing(false); setShowPreview(false); }} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all">Cancel</button>
                </div>
              </form>
            ) : (
              /* View mode */
              <div className="bg-dash-card rounded-xl border border-dash-border">
                {/* Page header */}
                <div className="p-6 border-b border-dash-border">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-dash-text">{currentPage.title}</h2>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase bg-dash-badge-bg text-dash-text-secondary">{currentPage.category}</span>
                        {currentPage.role_tag && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase bg-blue-100 text-blue-600">{currentPage.role_tag}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-dash-text-muted mt-2">
                        By {currentPage.author_first} {currentPage.author_last} &middot; Updated {new Date(currentPage.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    {isExec && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setEditing(true);
                            setEditForm({
                              title: currentPage.title,
                              body: currentPage.body,
                              category: currentPage.category,
                              role_tag: currentPage.role_tag || '',
                            });
                          }}
                          className="text-dash-text-secondary text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-2 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={handleDelete}
                          className="text-red-400 text-[10px] uppercase tracking-[0.15em] font-semibold px-3 py-2 rounded-lg border border-red-200 hover:border-red-300 hover:bg-red-50 transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Rendered markdown content */}
                <div className="p-6 prose prose-sm max-w-none prose-headings:text-dash-text prose-p:text-dash-text-secondary prose-a:text-blue-600 prose-strong:text-dash-text prose-code:text-gray-800 prose-code:bg-dash-badge-bg prose-code:px-1 prose-code:rounded prose-pre:bg-dash-bg prose-pre:border prose-pre:border-dash-border prose-table:text-sm prose-th:text-left prose-th:px-3 prose-th:py-2 prose-td:px-3 prose-td:py-2 prose-hr:border-dash-border">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentPage.body}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

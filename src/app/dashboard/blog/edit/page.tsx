'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function EditPostInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    body: '',
    cover_image_url: '',
    status: 'draft',
    slug: '',
  });

  useEffect(() => {
    if (!slug) { router.push('/dashboard/blog'); return; }

    fetch(`/api/blog/${slug}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setForm({
            title: data.title || '',
            excerpt: data.excerpt || '',
            body: data.body || '',
            cover_image_url: data.cover_image_url || '',
            status: data.status || 'draft',
            slug: data.slug || '',
          });
        } else {
          router.push('/dashboard/blog');
        }
      })
      .catch(() => router.push('/dashboard/blog'))
      .finally(() => setLoading(false));
  }, [slug, router]);

  const handleSubmit = async (status?: string) => {
    setSaving(true);
    setError('');

    const payload = { ...form };
    if (status) payload.status = status;

    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/dashboard/blog');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update post.');
      }
    } catch {
      setError('Connection error.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/blog/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setForm(prev => ({ ...prev, cover_image_url: data.url }));
      }
    } catch { /* */ }
  };

  const inputClass = 'w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 outline-none transition-all';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Edit Post</h1>
          <p className="text-sm text-dash-text-secondary mt-1">{form.title || 'Untitled'}</p>
        </div>
        <button
          onClick={() => setPreview(!preview)}
          className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2.5 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all"
        >
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">{error}</div>
      )}

      <div className="bg-dash-card rounded-xl border border-dash-border p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Title</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Slug</label>
            <input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Excerpt</label>
          <input type="text" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className={inputClass} />
        </div>

        <div>
          <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Cover Image</label>
          <div className="flex items-center gap-3">
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="text-xs text-dash-text-secondary" />
            {form.cover_image_url && <span className="text-xs text-green-600">Image set</span>}
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Content (Markdown)</label>
          {preview ? (
            <div className="border border-dash-border rounded-lg p-4 min-h-[300px] bg-dash-bg">
              <pre className="whitespace-pre-wrap text-sm text-dash-text">{form.body || 'Nothing to preview...'}</pre>
            </div>
          ) : (
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={16} className={`${inputClass} font-mono text-[13px] leading-relaxed`} />
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={() => handleSubmit()} disabled={saving} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save'}
          </button>
          {form.status !== 'published' && (
            <button onClick={() => handleSubmit('published')} disabled={saving} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50">
              Publish
            </button>
          )}
          {form.status === 'published' && (
            <button onClick={() => handleSubmit('draft')} disabled={saving} className="text-yellow-600 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-yellow-200 hover:border-yellow-300 transition-all disabled:opacity-50">
              Unpublish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EditBlogPost() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin" />
      </div>
    }>
      <EditPostInner />
    </Suspense>
  );
}

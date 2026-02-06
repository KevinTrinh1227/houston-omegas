'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBlogPost() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    body: '',
    cover_image_url: '',
    status: 'draft',
  });

  const handleSubmit = async (status: string) => {
    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, status }),
      });

      if (res.ok) {
        router.push('/dashboard/blog');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create post.');
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
        setForm({ ...form, cover_image_url: data.url });
      }
    } catch { /* */ }
  };

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">New Blog Post</h1>
          <p className="text-sm text-gray-500 mt-1">Write and publish content</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(!preview)}
            className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
          >
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Post title"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Excerpt</label>
          <input
            type="text"
            value={form.excerpt}
            onChange={e => setForm({ ...form, excerpt: e.target.value })}
            placeholder="Brief summary (optional)"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Cover Image</label>
          <div className="flex items-center gap-3">
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="text-xs text-gray-500" />
            {form.cover_image_url && (
              <span className="text-xs text-green-600">Uploaded</span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">
            Content (Markdown)
          </label>
          {preview ? (
            <div className="prose prose-sm max-w-none border border-gray-200 rounded-lg p-4 min-h-[300px] bg-gray-50">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">{form.body || 'Nothing to preview...'}</pre>
            </div>
          ) : (
            <textarea
              value={form.body}
              onChange={e => setForm({ ...form, body: e.target.value })}
              placeholder="Write your post in markdown..."
              rows={16}
              className={`${inputClass} font-mono text-[13px] leading-relaxed`}
            />
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={saving || !form.title || !form.body}
            className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSubmit('published')}
            disabled={saving || !form.title || !form.body}
            className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}

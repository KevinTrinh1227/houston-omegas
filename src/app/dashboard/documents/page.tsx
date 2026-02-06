'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';

interface Category { id: string; name: string; description: string | null; }
interface Document { id: string; category_id: string | null; title: string; file_name: string; file_size: number; content_type: string; version: number; visibility: string; uploader_first: string; uploader_last: string; category_name: string | null; created_at: string; }

const FILE_ICONS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
};

export default function DocumentsPage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');

  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Upload form
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', category_id: '', visibility: 'members' });

  // New category
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const fetchCategories = useCallback(async () => {
    const res = await fetch('/api/document-categories', { credentials: 'include' });
    if (res.ok) setCategories(await res.json());
  }, []);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    const q = selectedCategory ? `?category_id=${selectedCategory}` : '';
    const res = await fetch(`/api/documents${q}`, { credentials: 'include' });
    if (res.ok) setDocuments(await res.json());
    setLoading(false);
  }, [selectedCategory]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = (e.target as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) { setMessage('Please select a file.'); return; }

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', uploadForm.title);
    if (uploadForm.category_id) fd.append('category_id', uploadForm.category_id);
    fd.append('visibility', uploadForm.visibility);

    try {
      const res = await fetch('/api/documents', { method: 'POST', credentials: 'include', body: fd });
      if (res.ok) {
        setShowUpload(false);
        setUploadForm({ title: '', category_id: '', visibility: 'members' });
        fetchDocuments();
        setMessage('Document uploaded.');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Upload failed.');
      }
    } catch { setMessage('Upload failed.'); }
    finally { setUploading(false); }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/document-categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ name: newCatName }),
    });
    if (res.ok) { setShowNewCat(false); setNewCatName(''); fetchCategories(); }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchDocuments();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">{documents.length} file{documents.length !== 1 ? 's' : ''}</p>
        </div>
        {isExec && (
          <div className="flex gap-2">
            <button onClick={() => setShowNewCat(true)} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">New Category</button>
            <button onClick={() => setShowUpload(true)} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Upload</button>
          </div>
        )}
      </div>

      {message && <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 text-green-600 border border-green-200">{message}<button onClick={() => setMessage('')} className="ml-2 underline">dismiss</button></div>}

      {/* Category tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit overflow-x-auto">
        <button onClick={() => setSelectedCategory('')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${!selectedCategory ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>All</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setSelectedCategory(c.id)} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${selectedCategory === c.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{c.name}</button>
        ))}
      </div>

      {/* New category form */}
      {showNewCat && isExec && (
        <form onSubmit={handleCreateCategory} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 flex gap-3 items-end">
          <div className="flex-1"><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Category Name</label><input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} required className={inputClass} /></div>
          <button type="submit" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Create</button>
          <button type="button" onClick={() => setShowNewCat(false)} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2.5 rounded-lg border border-gray-200">Cancel</button>
        </form>
      )}

      {/* Upload form */}
      {showUpload && isExec && (
        <form onSubmit={handleUpload} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="text-sm font-medium text-gray-900">Upload Document</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Title</label><input type="text" value={uploadForm.title} onChange={e => setUploadForm({ ...uploadForm, title: e.target.value })} required className={inputClass} /></div>
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Category</label><select value={uploadForm.category_id} onChange={e => setUploadForm({ ...uploadForm, category_id: e.target.value })} className={inputClass}><option value="">Uncategorized</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          </div>
          <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">File (max 10MB)</label><input type="file" required className="text-sm text-gray-700" /></div>
          <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Visibility</label><select value={uploadForm.visibility} onChange={e => setUploadForm({ ...uploadForm, visibility: e.target.value })} className={inputClass}><option value="members">All Members</option><option value="exec">Exec Only</option></select></div>
          <div className="flex gap-3">
            <button type="submit" disabled={uploading} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload'}</button>
            <button type="button" onClick={() => setShowUpload(false)} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-gray-200">Cancel</button>
          </div>
        </form>
      )}

      {/* Document list */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" /></div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">No documents yet.</div>
      ) : (
        <div className="space-y-2">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-gray-300 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                {FILE_ICONS[doc.content_type] || 'FILE'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                <div className="flex gap-2 mt-0.5 text-[10px] text-gray-400">
                  <span>{doc.file_name}</span>
                  <span>&middot;</span>
                  <span>{formatSize(doc.file_size)}</span>
                  {doc.category_name && <><span>&middot;</span><span>{doc.category_name}</span></>}
                  <span>&middot;</span>
                  <span>{doc.uploader_first} {doc.uploader_last}</span>
                  {doc.visibility === 'exec' && <><span>&middot;</span><span className="text-amber-500">Exec Only</span></>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <a href={`/api/documents/${doc.id}?download=1`} className="text-xs text-gray-500 hover:text-gray-700 transition-colors">Download</a>
                {isExec && <button onClick={() => handleDelete(doc.id, doc.title)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

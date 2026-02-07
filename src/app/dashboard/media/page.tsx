'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';

interface MediaFile {
  id: string;
  filename: string;
  r2_key: string;
  content_type: string;
  size_bytes: number;
  category: string;
  description: string | null;
  uploaded_by: string;
  uploader_first_name: string;
  uploader_last_name: string;
  created_at: string;
}

const CATEGORIES = ['all', 'general', 'events', 'brotherhood', 'other'] as const;
const CATEGORY_LABELS: Record<string, string> = { all: 'All', general: 'General', events: 'Events', brotherhood: 'Brotherhood', other: 'Other' };

const FILE_TYPE_ICONS: Record<string, string> = {
  image: 'IMG',
  video: 'VID',
  audio: 'AUD',
  application: 'DOC',
};

function getFileIcon(contentType: string): string {
  const type = contentType.split('/')[0];
  return FILE_TYPE_ICONS[type] || 'FILE';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function isImageType(contentType: string): boolean {
  return contentType.startsWith('image/');
}

export default function MediaPage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');

  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [message, setMessage] = useState('');

  // Upload modal
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ category: 'general', description: '' });

  // Lightbox
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const q = category !== 'all' ? `?category=${category}` : '';
      const res = await fetch(`/api/media${q}`, { credentials: 'include' });
      if (res.ok) setFiles(await res.json());
    } catch { /* */ }
    finally { setLoading(false); }
  }, [category]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = (e.target as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) { setMessage('Please select a file.'); return; }

    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', uploadForm.category);
    if (uploadForm.description) fd.append('description', uploadForm.description);

    try {
      const res = await fetch('/api/media', { method: 'POST', credentials: 'include', body: fd });
      if (res.ok) {
        setShowUpload(false);
        setUploadForm({ category: 'general', description: '' });
        fetchFiles();
        setMessage('File uploaded successfully.');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Upload failed.');
      }
    } catch { setMessage('Upload failed.'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setMessage('File deleted.');
        if (selectedFile?.id === id) setSelectedFile(null);
        fetchFiles();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Delete failed.');
      }
    } catch { setMessage('Delete failed.'); }
  };

  const canDelete = (file: MediaFile) => isExec || file.uploaded_by === member?.id;

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Media Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">{files.length} file{files.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowUpload(true)} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Upload</button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 text-green-600 border border-green-200">
          {message}
          <button onClick={() => setMessage('')} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit overflow-x-auto">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${category === c ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpload} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-sm font-medium text-gray-900">Upload File</h2>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">File</label>
              <input type="file" required className="text-sm text-gray-700" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Category</label>
              <select value={uploadForm.category} onChange={e => setUploadForm({ ...uploadForm, category: e.target.value })} className={inputClass}>
                <option value="general">General</option>
                <option value="events">Events</option>
                <option value="brotherhood">Brotherhood</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Description (optional)</label>
              <input type="text" value={uploadForm.description} onChange={e => setUploadForm({ ...uploadForm, description: e.target.value })} placeholder="Brief description..." className={inputClass} />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={uploading} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50">
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button type="button" onClick={() => setShowUpload(false)} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Lightbox modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFile(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Preview area */}
            <div className="bg-gray-50 rounded-t-xl flex items-center justify-center min-h-[200px] p-8">
              {isImageType(selectedFile.content_type) ? (
                <img
                  src={`/api/media/${selectedFile.id}`}
                  alt={selectedFile.filename}
                  className="max-w-full max-h-[50vh] object-contain rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 mx-auto mb-3">
                    {getFileIcon(selectedFile.content_type)}
                  </div>
                  <p className="text-sm text-gray-500">Preview not available</p>
                </div>
              )}
            </div>

            {/* File info */}
            <div className="p-6 space-y-3">
              <h3 className="text-sm font-medium text-gray-900 break-all">{selectedFile.filename}</h3>
              {selectedFile.description && (
                <p className="text-xs text-gray-500">{selectedFile.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase bg-gray-100 text-gray-500">{CATEGORY_LABELS[selectedFile.category] || selectedFile.category}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase bg-gray-100 text-gray-500">{formatSize(selectedFile.size_bytes)}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase bg-gray-100 text-gray-500">{selectedFile.content_type}</span>
              </div>
              <div className="text-[10px] text-gray-400">
                Uploaded by {selectedFile.uploader_first_name} {selectedFile.uploader_last_name} on {new Date(selectedFile.created_at).toLocaleDateString()}
              </div>
              <div className="flex gap-3 pt-2">
                <a
                  href={`/api/media/${selectedFile.id}?download=1`}
                  className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all"
                >
                  Download
                </a>
                {canDelete(selectedFile) && (
                  <button
                    onClick={() => handleDelete(selectedFile.id, selectedFile.filename)}
                    className="text-red-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg border border-red-200 hover:border-red-300 hover:bg-red-50 transition-all"
                  >
                    Delete
                  </button>
                )}
                <button onClick={() => setSelectedFile(null)} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all ml-auto">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File grid */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
        </div>
      ) : files.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">No files yet.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map(file => (
            <button
              key={file.id}
              onClick={() => setSelectedFile(file)}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors text-left group"
            >
              {/* Thumbnail area */}
              <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                {isImageType(file.content_type) ? (
                  <img
                    src={`/api/media/${file.id}`}
                    alt={file.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 mx-auto mb-1.5 group-hover:bg-gray-300 transition-colors">
                      {getFileIcon(file.content_type)}
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase">{file.content_type.split('/')[1]?.toUpperCase() || 'FILE'}</p>
                  </div>
                )}
                {/* Category badge */}
                <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase bg-white/80 text-gray-600 backdrop-blur-sm">
                  {CATEGORY_LABELS[file.category] || file.category}
                </span>
              </div>

              {/* File info */}
              <div className="p-3">
                <p className="text-xs font-medium text-gray-900 truncate">{file.filename}</p>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-gray-400">
                  <span>{formatSize(file.size_bytes)}</span>
                  <span>&middot;</span>
                  <span className="truncate">{file.uploader_first_name} {file.uploader_last_name}</span>
                </div>
                <p className="text-[10px] text-gray-300 mt-0.5">{new Date(file.created_at).toLocaleDateString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

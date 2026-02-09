'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';
import { Upload, Trash2, Image as ImageIcon, X } from 'lucide-react';

interface MediaFile {
  id: string;
  filename: string;
  size_bytes: number;
  content_type: string;
  r2_key: string;
  category: string;
  description: string | null;
  uploaded_by: string;
  uploader_first_name: string;
  uploader_last_name: string;
  created_at: string;
}

export default function HistorianPage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');
  const canManage = isExec || member?.chair_position === 'historian';
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<MediaFile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch('/api/media?category=historian', { credentials: 'include' });
      if (res.ok) setFiles(await res.json());
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const showMsg = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'historian');

      try {
        const res = await fetch('/api/media', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json();
          showMsg(data.error || `Failed to upload ${file.name}`);
        }
      } catch {
        showMsg(`Failed to upload ${file.name}`);
      }
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
    fetchFiles();
    showMsg('Upload complete.');
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Delete "${file.filename}"?`)) return;
    try {
      const res = await fetch(`/api/media/${file.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        showMsg('File deleted.');
        fetchFiles();
        if (preview?.id === file.id) setPreview(null);
      } else {
        const data = await res.json();
        showMsg(data.error || 'Failed to delete.');
      }
    } catch {
      showMsg('Connection error.');
    }
  };

  const imageFiles = files.filter(f => f.content_type.startsWith('image/'));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Historian</h1>
          <p className="text-sm text-dash-text-secondary mt-1">Photo gallery and media archive</p>
        </div>
        {canManage && (
          <label className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all cursor-pointer flex items-center gap-2">
            <Upload size={14} />
            {uploading ? 'Uploading...' : 'Upload'}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">
          {message}
        </div>
      )}

      {loading ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
          <div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin mx-auto" />
        </div>
      ) : imageFiles.length === 0 ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-16 text-center">
          <ImageIcon size={40} className="mx-auto text-dash-text-muted mb-3" />
          <p className="text-sm text-dash-text-muted">No photos yet.</p>
          {canManage && <p className="text-xs text-dash-text-muted mt-1">Upload images to get started.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {imageFiles.map(file => (
            <div
              key={file.id}
              className="group relative bg-dash-card rounded-lg border border-dash-border overflow-hidden cursor-pointer hover:border-dash-text-muted/30 transition-colors"
              onClick={() => setPreview(file)}
            >
              <div className="aspect-square">
                <img
                  src={`/api/media/${file.id}`}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-2">
                <p className="text-[10px] text-dash-text truncate">{file.filename}</p>
                <p className="text-[9px] text-dash-text-muted">
                  {file.uploader_first_name} {file.uploader_last_name} &middot; {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
              {canManage && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox preview */}
      {preview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <button
            onClick={() => setPreview(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
          <img
            src={`/api/media/${preview.id}`}
            alt={preview.filename}
            className="max-w-full max-h-[85vh] rounded-lg object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

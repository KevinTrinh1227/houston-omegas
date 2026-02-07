'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';

// Media interfaces
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

// Document interfaces
interface DocCategory { id: string; name: string; description: string | null; }
interface Document { id: string; category_id: string | null; title: string; file_name: string; file_size: number; content_type: string; version: number; visibility: string; uploader_first: string; uploader_last: string; category_name: string | null; created_at: string; }

// Media constants
const MEDIA_CATEGORIES = ['all', 'general', 'events', 'brotherhood', 'other'] as const;
const MEDIA_CATEGORY_LABELS: Record<string, string> = { all: 'All', general: 'General', events: 'Events', brotherhood: 'Brotherhood', other: 'Other' };

const FILE_TYPE_ICONS: Record<string, string> = {
  image: 'IMG',
  video: 'VID',
  audio: 'AUD',
  application: 'DOC',
};

// Document constants
const DOC_FILE_ICONS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
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

export default function FilesPage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');
  const [activeTab, setActiveTab] = useState<'media' | 'documents'>('media');

  // Media state
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaCategory, setMediaCategory] = useState('all');
  const [mediaMessage, setMediaMessage] = useState('');
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaUploadForm, setMediaUploadForm] = useState({ category: 'general', description: '' });
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);

  // Documents state
  const [docCategories, setDocCategories] = useState<DocCategory[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocCategory, setSelectedDocCategory] = useState('');
  const [docLoading, setDocLoading] = useState(true);
  const [docUploading, setDocUploading] = useState(false);
  const [docMessage, setDocMessage] = useState('');
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [docUploadForm, setDocUploadForm] = useState({ title: '', category_id: '', visibility: 'members' });
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Media fetch
  const fetchFiles = useCallback(async () => {
    setMediaLoading(true);
    try {
      const q = mediaCategory !== 'all' ? `?category=${mediaCategory}` : '';
      const res = await fetch(`/api/media${q}`, { credentials: 'include' });
      if (res.ok) setFiles(await res.json());
    } catch { /* */ }
    finally { setMediaLoading(false); }
  }, [mediaCategory]);

  useEffect(() => { if (activeTab === 'media') fetchFiles(); }, [fetchFiles, activeTab]);

  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = (e.target as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) { setMediaMessage('Please select a file.'); return; }

    setMediaUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', mediaUploadForm.category);
    if (mediaUploadForm.description) fd.append('description', mediaUploadForm.description);

    try {
      const res = await fetch('/api/media', { method: 'POST', credentials: 'include', body: fd });
      if (res.ok) {
        setShowMediaUpload(false);
        setMediaUploadForm({ category: 'general', description: '' });
        fetchFiles();
        setMediaMessage('File uploaded successfully.');
      } else {
        const data = await res.json();
        setMediaMessage(data.error || 'Upload failed.');
      }
    } catch { setMediaMessage('Upload failed.'); }
    finally { setMediaUploading(false); }
  };

  const handleMediaDelete = async (id: string, filename: string) => {
    if (!confirm(`Delete "${filename}"?`)) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setMediaMessage('File deleted.');
        if (selectedFile?.id === id) setSelectedFile(null);
        fetchFiles();
      } else {
        const data = await res.json();
        setMediaMessage(data.error || 'Delete failed.');
      }
    } catch { setMediaMessage('Delete failed.'); }
  };

  const canDeleteMedia = (file: MediaFile) => isExec || file.uploaded_by === member?.id;

  // Documents fetch
  const fetchDocCategories = useCallback(async () => {
    const res = await fetch('/api/document-categories', { credentials: 'include' });
    if (res.ok) setDocCategories(await res.json());
  }, []);

  const fetchDocuments = useCallback(async () => {
    setDocLoading(true);
    const q = selectedDocCategory ? `?category_id=${selectedDocCategory}` : '';
    const res = await fetch(`/api/documents${q}`, { credentials: 'include' });
    if (res.ok) setDocuments(await res.json());
    setDocLoading(false);
  }, [selectedDocCategory]);

  useEffect(() => { if (activeTab === 'documents') { fetchDocCategories(); fetchDocuments(); } }, [activeTab, fetchDocCategories, fetchDocuments]);

  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = (e.target as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) { setDocMessage('Please select a file.'); return; }

    setDocUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', docUploadForm.title);
    if (docUploadForm.category_id) fd.append('category_id', docUploadForm.category_id);
    fd.append('visibility', docUploadForm.visibility);

    try {
      const res = await fetch('/api/documents', { method: 'POST', credentials: 'include', body: fd });
      if (res.ok) {
        setShowDocUpload(false);
        setDocUploadForm({ title: '', category_id: '', visibility: 'members' });
        fetchDocuments();
        setDocMessage('Document uploaded.');
      } else {
        const data = await res.json();
        setDocMessage(data.error || 'Upload failed.');
      }
    } catch { setDocMessage('Upload failed.'); }
    finally { setDocUploading(false); }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/document-categories', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ name: newCatName }),
    });
    if (res.ok) { setShowNewCat(false); setNewCatName(''); fetchDocCategories(); }
  };

  const handleDocDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/documents/${id}`, { method: 'DELETE', credentials: 'include' });
    fetchDocuments();
  };

  const inputClass = 'w-full px-3 py-2.5 bg-dash-card border border-dash-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';

  const totalCount = (activeTab === 'media' ? files.length : documents.length);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Files</h1>
          <p className="text-sm text-dash-text-secondary mt-1">{totalCount} file{totalCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'media' && (
            <button onClick={() => setShowMediaUpload(true)} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Upload</button>
          )}
          {activeTab === 'documents' && isExec && (
            <div className="flex gap-2">
              <button onClick={() => setShowNewCat(true)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2.5 rounded-lg border border-dash-border hover:border-gray-300 transition-all">New Category</button>
              <button onClick={() => setShowDocUpload(true)} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Upload</button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('media')} className={`text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg transition-all ${activeTab === 'media' ? 'bg-gray-900 text-white' : 'text-dash-text-secondary border border-dash-border hover:border-gray-300'}`}>Media</button>
        <button onClick={() => setActiveTab('documents')} className={`text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg transition-all ${activeTab === 'documents' ? 'bg-gray-900 text-white' : 'text-dash-text-secondary border border-dash-border hover:border-gray-300'}`}>Documents</button>
      </div>

      {/* ===== MEDIA TAB ===== */}
      {activeTab === 'media' && (
        <>
          {mediaMessage && (
            <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 text-green-600 border border-green-200">
              {mediaMessage}
              <button onClick={() => setMediaMessage('')} className="ml-2 underline">dismiss</button>
            </div>
          )}

          {/* Category tabs */}
          <div className="flex gap-1 mb-6 bg-dash-badge-bg rounded-lg p-1 w-fit overflow-x-auto">
            {MEDIA_CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setMediaCategory(c)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${mediaCategory === c ? 'bg-dash-card text-dash-text shadow-sm' : 'text-dash-text-secondary hover:text-dash-text'}`}
              >
                {MEDIA_CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>

          {/* Upload modal */}
          {showMediaUpload && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <form onSubmit={handleMediaUpload} className="bg-dash-card rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                <h2 className="text-sm font-medium text-dash-text">Upload File</h2>
                <div>
                  <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">File</label>
                  <input type="file" required className="text-sm text-dash-text" />
                </div>
                <div>
                  <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Category</label>
                  <select value={mediaUploadForm.category} onChange={e => setMediaUploadForm({ ...mediaUploadForm, category: e.target.value })} className={inputClass}>
                    <option value="general">General</option>
                    <option value="events">Events</option>
                    <option value="brotherhood">Brotherhood</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Description (optional)</label>
                  <input type="text" value={mediaUploadForm.description} onChange={e => setMediaUploadForm({ ...mediaUploadForm, description: e.target.value })} placeholder="Brief description..." className={inputClass} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={mediaUploading} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50">
                    {mediaUploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button type="button" onClick={() => setShowMediaUpload(false)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-gray-300 transition-all">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Lightbox modal */}
          {selectedFile && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedFile(null)}>
              <div className="bg-dash-card rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Preview area */}
                <div className="bg-dash-bg rounded-t-xl flex items-center justify-center min-h-[200px] p-8">
                  {isImageType(selectedFile.content_type) ? (
                    <img
                      src={`/api/media/${selectedFile.id}`}
                      alt={selectedFile.filename}
                      className="max-w-full max-h-[50vh] object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center text-lg font-bold text-dash-text-secondary mx-auto mb-3">
                        {getFileIcon(selectedFile.content_type)}
                      </div>
                      <p className="text-sm text-dash-text-secondary">Preview not available</p>
                    </div>
                  )}
                </div>

                {/* File info */}
                <div className="p-6 space-y-3">
                  <h3 className="text-sm font-medium text-dash-text break-all">{selectedFile.filename}</h3>
                  {selectedFile.description && (
                    <p className="text-xs text-dash-text-secondary">{selectedFile.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase bg-dash-badge-bg text-dash-text-secondary">{MEDIA_CATEGORY_LABELS[selectedFile.category] || selectedFile.category}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase bg-dash-badge-bg text-dash-text-secondary">{formatSize(selectedFile.size_bytes)}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase bg-dash-badge-bg text-dash-text-secondary">{selectedFile.content_type}</span>
                  </div>
                  <div className="text-[10px] text-dash-text-muted">
                    Uploaded by {selectedFile.uploader_first_name} {selectedFile.uploader_last_name} on {new Date(selectedFile.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <a
                      href={`/api/media/${selectedFile.id}?download=1`}
                      className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all"
                    >
                      Download
                    </a>
                    {canDeleteMedia(selectedFile) && (
                      <button
                        onClick={() => handleMediaDelete(selectedFile.id, selectedFile.filename)}
                        className="text-red-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg border border-red-200 hover:border-red-300 hover:bg-red-50 transition-all"
                      >
                        Delete
                      </button>
                    )}
                    <button onClick={() => setSelectedFile(null)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg border border-dash-border hover:border-gray-300 transition-all ml-auto">Close</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File grid */}
          {mediaLoading ? (
            <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
            </div>
          ) : files.length === 0 ? (
            <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center text-sm text-dash-text-muted">No files yet.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className="bg-dash-card rounded-xl border border-dash-border overflow-hidden hover:border-gray-300 transition-colors text-left group"
                >
                  {/* Thumbnail area */}
                  <div className="aspect-square bg-dash-bg flex items-center justify-center relative">
                    {isImageType(file.content_type) ? (
                      <img
                        src={`/api/media/${file.id}`}
                        alt={file.filename}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-sm font-bold text-dash-text-secondary mx-auto mb-1.5 group-hover:bg-gray-300 transition-colors">
                          {getFileIcon(file.content_type)}
                        </div>
                        <p className="text-[10px] text-dash-text-muted uppercase">{file.content_type.split('/')[1]?.toUpperCase() || 'FILE'}</p>
                      </div>
                    )}
                    {/* Category badge */}
                    <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase bg-dash-card/80 text-dash-text-secondary backdrop-blur-sm">
                      {MEDIA_CATEGORY_LABELS[file.category] || file.category}
                    </span>
                  </div>

                  {/* File info */}
                  <div className="p-3">
                    <p className="text-xs font-medium text-dash-text truncate">{file.filename}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-dash-text-muted">
                      <span>{formatSize(file.size_bytes)}</span>
                      <span>&middot;</span>
                      <span className="truncate">{file.uploader_first_name} {file.uploader_last_name}</span>
                    </div>
                    <p className="text-[10px] text-dash-text-muted mt-0.5">{new Date(file.created_at).toLocaleDateString()}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== DOCUMENTS TAB ===== */}
      {activeTab === 'documents' && (
        <>
          {docMessage && <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 text-green-600 border border-green-200">{docMessage}<button onClick={() => setDocMessage('')} className="ml-2 underline">dismiss</button></div>}

          {/* Category tabs */}
          <div className="flex gap-1 mb-6 bg-dash-badge-bg rounded-lg p-1 w-fit overflow-x-auto">
            <button onClick={() => setSelectedDocCategory('')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${!selectedDocCategory ? 'bg-dash-card text-dash-text shadow-sm' : 'text-dash-text-secondary hover:text-dash-text'}`}>All</button>
            {docCategories.map(c => (
              <button key={c.id} onClick={() => setSelectedDocCategory(c.id)} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${selectedDocCategory === c.id ? 'bg-dash-card text-dash-text shadow-sm' : 'text-dash-text-secondary hover:text-dash-text'}`}>{c.name}</button>
            ))}
          </div>

          {/* New category form */}
          {showNewCat && isExec && (
            <form onSubmit={handleCreateCategory} className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6 flex gap-3 items-end">
              <div className="flex-1"><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Category Name</label><input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} required className={inputClass} /></div>
              <button type="submit" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Create</button>
              <button type="button" onClick={() => setShowNewCat(false)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2.5 rounded-lg border border-dash-border">Cancel</button>
            </form>
          )}

          {/* Upload form */}
          {showDocUpload && isExec && (
            <form onSubmit={handleDocUpload} className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6 space-y-4">
              <h2 className="text-sm font-medium text-dash-text">Upload Document</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Title</label><input type="text" value={docUploadForm.title} onChange={e => setDocUploadForm({ ...docUploadForm, title: e.target.value })} required className={inputClass} /></div>
                <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Category</label><select value={docUploadForm.category_id} onChange={e => setDocUploadForm({ ...docUploadForm, category_id: e.target.value })} className={inputClass}><option value="">Uncategorized</option>{docCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
              </div>
              <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">File (max 10MB)</label><input type="file" required className="text-sm text-dash-text" /></div>
              <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Visibility</label><select value={docUploadForm.visibility} onChange={e => setDocUploadForm({ ...docUploadForm, visibility: e.target.value })} className={inputClass}><option value="members">All Members</option><option value="exec">Exec Only</option></select></div>
              <div className="flex gap-3">
                <button type="submit" disabled={docUploading} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50">{docUploading ? 'Uploading...' : 'Upload'}</button>
                <button type="button" onClick={() => setShowDocUpload(false)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border">Cancel</button>
              </div>
            </form>
          )}

          {/* Document list */}
          {docLoading ? (
            <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" /></div>
          ) : documents.length === 0 ? (
            <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center text-sm text-dash-text-muted">No documents yet.</div>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="bg-dash-card rounded-xl border border-dash-border p-4 flex items-center gap-4 hover:border-gray-300 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-dash-badge-bg flex items-center justify-center text-[10px] font-bold text-dash-text-secondary shrink-0">
                    {DOC_FILE_ICONS[doc.content_type] || 'FILE'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-dash-text truncate">{doc.title}</p>
                    <div className="flex gap-2 mt-0.5 text-[10px] text-dash-text-muted">
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
                    <a href={`/api/documents/${doc.id}?download=1`} className="text-xs text-dash-text-secondary hover:text-dash-text transition-colors">Download</a>
                    {isExec && <button onClick={() => handleDocDelete(doc.id, doc.title)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>}
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

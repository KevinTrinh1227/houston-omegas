'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/dashboard/AuthProvider';

interface Semester { id: string; name: string; is_current: number; }
interface Meeting { id: string; title: string; meeting_type: string; meeting_date: string; notes: string | null; creator_first: string; creator_last: string; }
interface ActionItem { id: string; description: string; assigned_to: string | null; assigned_first: string | null; assigned_last: string | null; due_date: string | null; status: string; }
interface Attachment { id: string; file_name: string; file_key: string; file_size: number; content_type: string; }
interface Member { id: string; first_name: string; last_name: string; }

const TYPE_LABELS: Record<string, string> = { chapter: 'Chapter', exec: 'Exec', committee: 'Committee', special: 'Special' };
const STATUS_COLORS: Record<string, string> = { open: 'bg-red-100 text-red-700', in_progress: 'bg-yellow-100 text-yellow-700', completed: 'bg-green-100 text-green-700' };

export default function MeetingsPage() {
  const { member } = useAuth();
  const searchParams = useSearchParams();
  const meetingId = searchParams.get('id');
  const canManage = ['admin', 'president', 'secretary'].includes(member?.role || '');

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState('');

  // Detail
  const [detail, setDetail] = useState<(Meeting & { action_items: ActionItem[]; attachments: Attachment[] }) | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [editing, setEditing] = useState(false);
  const [editNotes, setEditNotes] = useState('');

  // New form
  const [form, setForm] = useState({ title: '', meeting_type: 'chapter', meeting_date: '', notes: '' });

  const fetchSemesters = useCallback(async () => {
    const res = await fetch('/api/semesters', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setSemesters(data);
      const current = data.find((s: Semester) => s.is_current);
      if (current) setSelectedSemester(current.id);
      else if (data.length) setSelectedSemester(data[0].id);
    }
  }, []);

  const fetchMeetings = useCallback(async () => {
    if (!selectedSemester) return;
    setLoading(true);
    const res = await fetch(`/api/meetings?semester_id=${selectedSemester}`, { credentials: 'include' });
    if (res.ok) setMeetings(await res.json());
    setLoading(false);
  }, [selectedSemester]);

  const fetchDetail = useCallback(async (id: string) => {
    const [mtRes, memRes] = await Promise.all([
      fetch(`/api/meetings/${id}`, { credentials: 'include' }),
      fetch('/api/members', { credentials: 'include' }),
    ]);
    if (mtRes.ok) {
      const data = await mtRes.json();
      setDetail(data);
      setEditNotes(data.notes || '');
    }
    if (memRes.ok) setMembers(await memRes.json());
  }, []);

  useEffect(() => { fetchSemesters(); }, [fetchSemesters]);
  useEffect(() => { if (selectedSemester) fetchMeetings(); }, [selectedSemester, fetchMeetings]);
  useEffect(() => { if (meetingId) fetchDetail(meetingId); }, [meetingId, fetchDetail]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/meetings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ ...form, semester_id: selectedSemester }),
    });
    if (res.ok) { setShowNew(false); setForm({ title: '', meeting_type: 'chapter', meeting_date: '', notes: '' }); fetchMeetings(); }
    else { const d = await res.json(); setMessage(d.error || 'Failed'); }
  };

  const handleSaveNotes = async () => {
    if (!meetingId) return;
    const res = await fetch(`/api/meetings/${meetingId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ notes: editNotes }),
    });
    if (res.ok) { setEditing(false); fetchDetail(meetingId); setMessage('Notes saved.'); }
  };

  const handleActionStatus = async (itemId: string, status: string) => {
    await fetch(`/api/action-items/${itemId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ status }),
    });
    if (meetingId) fetchDetail(meetingId);
  };

  const inputClass = 'w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 outline-none transition-all';

  // Detail view
  if (meetingId && detail) {
    return (
      <div>
        <div className="mb-6">
          <a href="/dashboard/meetings" className="text-xs text-dash-text-muted hover:text-dash-text-secondary transition-colors">&larr; Back to Meetings</a>
          <h1 className="text-xl font-semibold text-dash-text mt-2">{detail.title}</h1>
          <div className="flex gap-3 mt-1 text-xs text-dash-text-secondary">
            <span className="bg-dash-badge-bg px-2 py-0.5 rounded-full uppercase">{TYPE_LABELS[detail.meeting_type]}</span>
            <span>{new Date(detail.meeting_date).toLocaleDateString()}</span>
            <span>by {detail.creator_first} {detail.creator_last}</span>
          </div>
        </div>

        {message && <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">{message}</div>}

        {/* Notes */}
        <div className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-dash-text">Meeting Notes</h2>
            {canManage && !editing && <button onClick={() => setEditing(true)} className="text-[10px] text-dash-text-muted hover:text-dash-text-secondary uppercase tracking-wider">Edit</button>}
          </div>
          {editing ? (
            <div>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={12} className={`${inputClass} font-mono text-xs`} />
              <div className="flex gap-3 mt-3">
                <button onClick={handleSaveNotes} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">Save</button>
                <button onClick={() => { setEditing(false); setEditNotes(detail.notes || ''); }} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-dash-text whitespace-pre-wrap text-sm">{detail.notes || <span className="text-dash-text-muted italic">No notes yet.</span>}</div>
          )}
        </div>

        {/* Action Items */}
        <div className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6">
          <h2 className="text-sm font-medium text-dash-text mb-3">Action Items</h2>
          {detail.action_items.length === 0 ? (
            <p className="text-sm text-dash-text-muted">No action items.</p>
          ) : (
            <div className="space-y-2">
              {detail.action_items.map(ai => (
                <div key={ai.id} className="flex items-center gap-3 py-2 border-b border-dash-border/50 last:border-0">
                  <select
                    value={ai.status}
                    onChange={e => handleActionStatus(ai.id, e.target.value)}
                    disabled={ai.assigned_to !== member?.id && !canManage}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase border-0 ${STATUS_COLORS[ai.status]} ${ai.assigned_to === member?.id || canManage ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <span className={`text-xs flex-1 ${ai.status === 'completed' ? 'line-through text-dash-text-muted' : 'text-dash-text'}`}>{ai.description}</span>
                  {ai.assigned_first && <span className="text-[10px] text-dash-text-muted">{ai.assigned_first} {ai.assigned_last}</span>}
                  {ai.due_date && <span className="text-[10px] text-dash-text-muted">{new Date(ai.due_date).toLocaleDateString()}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attachments */}
        {detail.attachments.length > 0 && (
          <div className="bg-dash-card rounded-xl border border-dash-border p-6">
            <h2 className="text-sm font-medium text-dash-text mb-3">Attachments</h2>
            <div className="space-y-2">
              {detail.attachments.map(att => (
                <div key={att.id} className="flex items-center gap-3 text-xs">
                  <span className="text-dash-text">{att.file_name}</span>
                  <span className="text-dash-text-muted">{(att.file_size / 1024).toFixed(0)} KB</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Meeting Notes</h1>
          <p className="text-sm text-dash-text-secondary mt-1">{meetings.length} meeting{meetings.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} className="px-3 py-2 bg-dash-card border border-dash-border rounded-lg text-sm">
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {canManage && <button onClick={() => setShowNew(true)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">New Meeting</button>}
        </div>
      </div>

      {message && <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800">{message}</div>}

      {showNew && canManage && (
        <form onSubmit={handleCreate} className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6 space-y-4">
          <h2 className="text-sm font-medium text-dash-text">Create Meeting</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Title</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className={inputClass} /></div>
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Type</label><select value={form.meeting_type} onChange={e => setForm({ ...form, meeting_type: e.target.value })} className={inputClass}>{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Date</label><input type="date" value={form.meeting_date} onChange={e => setForm({ ...form, meeting_date: e.target.value })} required className={inputClass} /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">Create</button>
            <button type="button" onClick={() => setShowNew(false)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center"><div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin mx-auto" /></div>
      ) : meetings.length === 0 ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center text-sm text-dash-text-muted">No meetings yet.</div>
      ) : (
        <div className="space-y-3">
          {meetings.map(mt => (
            <a key={mt.id} href={`/dashboard/meetings?id=${mt.id}`} className="block bg-dash-card rounded-xl border border-dash-border p-5 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-medium text-dash-text">{mt.title}</h3>
                  <span className="text-[10px] bg-dash-badge-bg text-dash-text-secondary px-2 py-0.5 rounded-full uppercase mt-1 inline-block">{TYPE_LABELS[mt.meeting_type]}</span>
                </div>
                <div className="text-xs text-dash-text-muted">{new Date(mt.meeting_date).toLocaleDateString()}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';
import { GraduationCap, Mail, Search, Calendar, Star, Users } from 'lucide-react';

interface AlumniMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  class_year: string | null;
  major: string | null;
  phone: string | null;
  instagram: string | null;
  avatar_url: string | null;
  last_login_at: string | null;
  created_at: string;
  events_attended: number;
  total_points: number;
}

export default function AlumniRelationsPage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');
  const isAlumniChair = member?.chair_position === 'alumni';
  const canManage = isExec || isAlumniChair;

  const [alumni, setAlumni] = useState<AlumniMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'directory' | 'communications'>('directory');

  // Email form
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sending, setSending] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');

  const fetchAlumni = useCallback(async () => {
    try {
      const res = await fetch('/api/members?role=alumni', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAlumni(Array.isArray(data) ? data : data.members || []);
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAlumni(); }, [fetchAlumni]);

  const filtered = alumni.filter(a => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      a.first_name.toLowerCase().includes(s) ||
      a.last_name.toLowerCase().includes(s) ||
      a.email.toLowerCase().includes(s) ||
      (a.class_year && a.class_year.includes(s)) ||
      (a.major && a.major.toLowerCase().includes(s))
    );
  });

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) return;
    setSending(true);
    setEmailMessage('');
    try {
      const res = await fetch('/api/members/alumni-email', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: emailSubject, body: emailBody }),
      });
      if (res.ok) {
        setEmailMessage('Email sent to all alumni successfully.');
        setEmailSubject('');
        setEmailBody('');
      } else {
        const data = await res.json();
        setEmailMessage(data.error || 'Failed to send email.');
      }
    } catch {
      setEmailMessage('Failed to send email.');
    } finally {
      setSending(false);
    }
  };

  const stats = {
    total: alumni.length,
    recentlyActive: alumni.filter(a => {
      if (!a.last_login_at) return false;
      const d = new Date(a.last_login_at);
      return Date.now() - d.getTime() < 90 * 24 * 60 * 60 * 1000;
    }).length,
    avgPoints: alumni.length > 0 ? Math.round(alumni.reduce((s, a) => s + (a.total_points || 0), 0) / alumni.length) : 0,
  };

  if (!canManage) {
    return (
      <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
        <p className="text-dash-text-muted text-sm">You don&apos;t have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Alumni Relations</h1>
          <p className="text-sm text-dash-text-secondary mt-1">Manage alumni engagement and communications</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-dash-card rounded-xl border border-dash-border p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-dash-text-secondary uppercase tracking-wider font-medium">Total Alumni</span>
            <Users size={16} className="text-dash-text-muted" />
          </div>
          <p className="text-2xl font-semibold text-dash-text">{stats.total}</p>
        </div>
        <div className="bg-dash-card rounded-xl border border-dash-border p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-dash-text-secondary uppercase tracking-wider font-medium">Active (90d)</span>
            <Calendar size={16} className="text-dash-text-muted" />
          </div>
          <p className="text-2xl font-semibold text-dash-text">{stats.recentlyActive}</p>
        </div>
        <div className="bg-dash-card rounded-xl border border-dash-border p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-dash-text-secondary uppercase tracking-wider font-medium">Avg Points</span>
            <Star size={16} className="text-dash-text-muted" />
          </div>
          <p className="text-2xl font-semibold text-dash-text">{stats.avgPoints}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dash-badge-bg rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('directory')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${tab === 'directory' ? 'bg-dash-card text-dash-text shadow-sm' : 'text-dash-text-secondary hover:text-dash-text'}`}
        >
          Directory
        </button>
        <button
          onClick={() => setTab('communications')}
          className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${tab === 'communications' ? 'bg-dash-card text-dash-text shadow-sm' : 'text-dash-text-secondary hover:text-dash-text'}`}
        >
          Communications
        </button>
      </div>

      {tab === 'directory' && (
        <>
          {/* Search */}
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-text-muted" />
              <input
                type="text"
                placeholder="Search alumni..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600"
              />
            </div>
          </div>

          {/* Alumni List */}
          {loading ? (
            <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
              <div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
              <GraduationCap size={32} className="text-dash-text-muted mx-auto mb-3" />
              <p className="text-dash-text-muted text-sm">{search ? 'No alumni match your search.' : 'No alumni members found.'}</p>
            </div>
          ) : (
            <div className="bg-dash-card rounded-xl border border-dash-border overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-dash-border">
                    <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Name</th>
                    <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Class</th>
                    <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 hidden sm:table-cell">Major</th>
                    <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 hidden md:table-cell">Last Active</th>
                    <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <tr key={a.id} className="border-b border-dash-border/50 hover:bg-dash-card-hover transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {a.avatar_url ? (
                            <img src={a.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-dash-badge-bg flex items-center justify-center text-dash-text-secondary text-xs font-semibold">
                              {a.first_name[0]}{a.last_name[0]}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-dash-text">{a.first_name} {a.last_name}</p>
                            <p className="text-[11px] text-dash-text-muted">{a.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-dash-text-secondary">{a.class_year || '-'}</td>
                      <td className="px-5 py-3 text-xs text-dash-text-secondary hidden sm:table-cell">{a.major || '-'}</td>
                      <td className="px-5 py-3 text-xs text-dash-text-secondary hidden md:table-cell">
                        {a.last_login_at ? new Date(a.last_login_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {a.phone && <span className="text-xs text-dash-text-muted">{a.phone}</span>}
                          {a.instagram && <span className="text-xs text-dash-text-muted">@{a.instagram}</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'communications' && (
        <div className="bg-dash-card rounded-xl border border-dash-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mail size={16} className="text-dash-text-secondary" />
            <h2 className="text-sm font-medium text-dash-text">Send Alumni Email</h2>
          </div>
          <p className="text-xs text-dash-text-muted mb-4">
            Send a bulk email to all {alumni.length} alumni members via Resend.
          </p>

          {emailMessage && (
            <div className={`mb-4 p-3 rounded-lg text-xs text-center border ${
              emailMessage.includes('success') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
            }`}>
              {emailMessage}
            </div>
          )}

          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={e => setEmailSubject(e.target.value)}
                required
                placeholder="Email subject..."
                className="w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600"
              />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Body</label>
              <textarea
                value={emailBody}
                onChange={e => setEmailBody(e.target.value)}
                required
                rows={8}
                placeholder="Write your message to alumni..."
                className="w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm outline-none focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 resize-y"
              />
            </div>
            <button
              type="submit"
              disabled={sending || !emailSubject.trim() || !emailBody.trim()}
              className="bg-gray-900 dark:bg-dash-card text-white dark:text-dash-text text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-dash-badge-bg transition-all disabled:opacity-50"
            >
              {sending ? 'Sending...' : `Send to ${alumni.length} Alumni`}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

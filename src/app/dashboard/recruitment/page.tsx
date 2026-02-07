'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// ── Interfaces ──────────────────────────────────────────────

interface RecruitmentSubmission {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  classification: string;
  major: string | null;
  instagram: string;
  heard_from: string;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
  is_reviewed: number;
}

interface Prospect {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  age: number | null;
  major: string | null;
  is_uh_student: number;
  status: 'new' | 'contacted' | 'interested' | 'not_interested' | 'pledged';
  notes: string | null;
  assigned_members: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface MemberOption {
  id: string;
  first_name: string;
  last_name: string;
}

// ── Constants ───────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  interested: 'bg-green-100 text-green-700',
  not_interested: 'bg-dash-badge-bg text-dash-text-secondary',
  pledged: 'bg-purple-100 text-purple-700',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  not_interested: 'Not Interested',
  pledged: 'Pledged',
};

const ALL_STATUSES = ['new', 'contacted', 'interested', 'not_interested', 'pledged'] as const;

const INPUT_CLASS = 'w-full px-3 py-2.5 bg-dash-card border border-dash-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';

const EMPTY_PROSPECT_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  instagram: '',
  age: '',
  major: '',
  is_uh_student: true,
  status: 'new' as 'new' | 'contacted' | 'interested' | 'not_interested' | 'pledged',
  notes: '',
  assigned_members: [] as string[],
};

// ── Inner Component ─────────────────────────────────────────

function RecruitmentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'submissions' | 'prospects'>(
    (searchParams.get('tab') as 'submissions' | 'prospects') || 'submissions'
  );

  // ── Submissions state ──
  const [recruitments, setRecruitments] = useState<RecruitmentSubmission[]>([]);
  const [recruitTotal, setRecruitTotal] = useState(0);
  const [recruitLoading, setRecruitLoading] = useState(true);
  const [recruitSearch, setRecruitSearch] = useState(searchParams.get('search') || '');
  const recruitPage = parseInt(searchParams.get('page') || '1');

  // ── Prospects state ──
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [prospectsLoading, setProspectsLoading] = useState(true);
  const [prospectSearch, setProspectSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedProspect, setExpandedProspect] = useState<string | null>(null);
  const [editingProspect, setEditingProspect] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_PROSPECT_FORM);
  const [addForm, setAddForm] = useState(EMPTY_PROSPECT_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // ── Fetch Submissions ──
  const fetchRecruitment = useCallback(async () => {
    setRecruitLoading(true);
    try {
      const params = new URLSearchParams({ page: String(recruitPage), limit: '25' });
      if (recruitSearch) params.set('search', recruitSearch);
      const res = await fetch(`/api/dashboard/recruitment?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRecruitments(data.submissions);
        setRecruitTotal(data.total);
      }
    } catch { /* */ }
    finally { setRecruitLoading(false); }
  }, [recruitPage, recruitSearch]);

  // ── Fetch Prospects ──
  const fetchProspects = useCallback(async () => {
    setProspectsLoading(true);
    try {
      const res = await fetch('/api/prospects', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProspects(data);
      }
    } catch { /* */ }
    finally { setProspectsLoading(false); }
  }, []);

  // ── Fetch Members (for assignment) ──
  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/members', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.map((m: MemberOption) => ({ id: m.id, first_name: m.first_name, last_name: m.last_name })));
      }
    } catch { /* */ }
  }, []);

  useEffect(() => { fetchRecruitment(); }, [fetchRecruitment]);
  useEffect(() => { fetchProspects(); fetchMembers(); }, [fetchProspects, fetchMembers]);

  // ── Tab change ──
  const handleTabChange = (newTab: 'submissions' | 'prospects') => {
    setTab(newTab);
    router.push(`/dashboard/recruitment?tab=${newTab}`);
  };

  // ── Submission pagination ──
  const recruitTotalPages = Math.ceil(recruitTotal / 25);

  // ── Prospect filtering ──
  const filteredProspects = prospects.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (prospectSearch) {
      const q = prospectSearch.toLowerCase();
      const name = `${p.first_name} ${p.last_name}`.toLowerCase();
      const email = (p.email || '').toLowerCase();
      const ig = (p.instagram || '').toLowerCase();
      if (!name.includes(q) && !email.includes(q) && !ig.includes(q)) return false;
    }
    return true;
  });

  // ── Prospect status counts ──
  const statusCounts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = prospects.filter(p => p.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  // ── Add Prospect ──
  const handleAddProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const body = {
        first_name: addForm.first_name,
        last_name: addForm.last_name,
        email: addForm.email || null,
        phone: addForm.phone || null,
        instagram: addForm.instagram || null,
        age: addForm.age ? parseInt(addForm.age) : null,
        major: addForm.major || null,
        is_uh_student: addForm.is_uh_student ? 1 : 0,
        status: addForm.status,
        notes: addForm.notes || null,
        assigned_members: JSON.stringify(addForm.assigned_members),
      };
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setAddForm(EMPTY_PROSPECT_FORM);
        setShowAddModal(false);
        setMessage('Prospect added successfully.');
        fetchProspects();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to add prospect.');
      }
    } catch { setMessage('Connection error.'); }
    finally { setSaving(false); }
  };

  // ── Update Prospect ──
  const handleUpdateProspect = async (id: string) => {
    setSaving(true);
    setMessage('');
    try {
      const body = {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email || null,
        phone: editForm.phone || null,
        instagram: editForm.instagram || null,
        age: editForm.age ? parseInt(editForm.age) : null,
        major: editForm.major || null,
        is_uh_student: editForm.is_uh_student ? 1 : 0,
        status: editForm.status,
        notes: editForm.notes || null,
        assigned_members: JSON.stringify(editForm.assigned_members),
      };
      const res = await fetch(`/api/prospects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditingProspect(null);
        setMessage('Prospect updated.');
        fetchProspects();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to update prospect.');
      }
    } catch { setMessage('Connection error.'); }
    finally { setSaving(false); }
  };

  // ── Quick Status Update ──
  const handleQuickStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/prospects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      fetchProspects();
    } catch { /* */ }
  };

  // ── Delete Prospect ──
  const handleDeleteProspect = async (id: string, name: string) => {
    if (!confirm(`Delete prospect "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/prospects/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setMessage('Prospect deleted.');
        setExpandedProspect(null);
        setEditingProspect(null);
        fetchProspects();
      } else {
        setMessage('Failed to delete prospect.');
      }
    } catch { setMessage('Connection error.'); }
  };

  // ── Start editing a prospect ──
  const startEditing = (p: Prospect) => {
    let assignedArr: string[] = [];
    try { assignedArr = JSON.parse(p.assigned_members || '[]'); } catch { /* */ }
    setEditForm({
      first_name: p.first_name,
      last_name: p.last_name,
      email: p.email || '',
      phone: p.phone || '',
      instagram: p.instagram || '',
      age: p.age ? String(p.age) : '',
      major: p.major || '',
      is_uh_student: p.is_uh_student === 1,
      status: p.status,
      notes: p.notes || '',
      assigned_members: assignedArr,
    });
    setEditingProspect(p.id);
  };

  // ── Resolve member names from IDs ──
  const getMemberName = (id: string) => {
    const m = members.find(m => m.id === id);
    return m ? `${m.first_name} ${m.last_name}` : id.slice(0, 8);
  };

  const getMemberInitials = (id: string) => {
    const m = members.find(m => m.id === id);
    return m ? `${m.first_name[0]}${m.last_name[0]}` : '??';
  };

  // ── Toggle assigned member in form ──
  const toggleAssigned = (
    form: typeof EMPTY_PROSPECT_FORM,
    setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_PROSPECT_FORM>>,
    memberId: string
  ) => {
    const current = form.assigned_members;
    if (current.includes(memberId)) {
      setForm({ ...form, assigned_members: current.filter(id => id !== memberId) });
    } else {
      setForm({ ...form, assigned_members: [...current, memberId] });
    }
  };

  // ── Clear message after delay ──
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(''), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Recruitment</h1>
          <p className="text-sm text-dash-text-secondary mt-1">Submissions and prospect tracking</p>
        </div>
        {tab === 'prospects' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all"
          >
            Add Prospect
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-xs text-center ${message.includes('success') || message.includes('updated') || message.includes('deleted') || message.includes('added') ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleTabChange('submissions')}
          className={`text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg transition-all ${
            tab === 'submissions' ? 'bg-gray-900 text-white' : 'text-dash-text-secondary border border-dash-border hover:border-gray-300'
          }`}
        >
          Submissions ({recruitTotal})
        </button>
        <button
          onClick={() => handleTabChange('prospects')}
          className={`text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg transition-all ${
            tab === 'prospects' ? 'bg-gray-900 text-white' : 'text-dash-text-secondary border border-dash-border hover:border-gray-300'
          }`}
        >
          Prospects ({prospects.length})
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════ */}
      {/* SUBMISSIONS TAB                                         */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'submissions' && (
        <>
          <form onSubmit={(e) => { e.preventDefault(); router.push(`/dashboard/recruitment?tab=submissions${recruitSearch ? `&search=${recruitSearch}` : ''}`); }} className="mb-4">
            <input
              type="text"
              value={recruitSearch}
              onChange={e => setRecruitSearch(e.target.value)}
              placeholder="Search by name, Instagram, phone..."
              className="w-full max-w-sm px-3 py-2.5 bg-dash-card border border-dash-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all"
            />
          </form>

          {recruitLoading ? (
            <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
            </div>
          ) : recruitments.length === 0 ? (
            <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
              <p className="text-dash-text-muted text-sm">No submissions found.</p>
            </div>
          ) : (
            <div className="bg-dash-card rounded-xl border border-dash-border overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-dash-border">
                    {['Name', 'Phone', 'Instagram', 'Classification', 'Major', 'Heard From', 'Location', 'Date'].map(h => (
                      <th key={h} className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recruitments.map(s => (
                    <tr key={s.id} className="border-b border-dash-border/50 hover:bg-dash-bg transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-dash-text">{s.first_name} {s.last_name}</td>
                      <td className="px-4 py-3 text-xs text-dash-text-secondary">{s.phone}</td>
                      <td className="px-4 py-3 text-xs text-dash-text-secondary">{s.instagram}</td>
                      <td className="px-4 py-3 text-xs text-dash-text-secondary">{s.classification}</td>
                      <td className="px-4 py-3 text-xs text-dash-text-secondary">{s.major || '-'}</td>
                      <td className="px-4 py-3 text-xs text-dash-text-secondary">{s.heard_from}</td>
                      <td className="px-4 py-3 text-xs text-dash-text-muted">{[s.city, s.country].filter(Boolean).join(', ') || '-'}</td>
                      <td className="px-4 py-3 text-xs text-dash-text-muted">{new Date(s.created_at + 'Z').toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {recruitTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: recruitTotalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => router.push(`/dashboard/recruitment?tab=submissions&page=${p}${recruitSearch ? `&search=${recruitSearch}` : ''}`)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === recruitPage ? 'bg-gray-900 text-white' : 'text-dash-text-secondary hover:bg-dash-badge-bg'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* PROSPECTS TAB                                           */}
      {/* ════════════════════════════════════════════════════════ */}
      {tab === 'prospects' && (
        <>
          {/* Filter bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-dash-card border border-dash-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all sm:w-48"
            >
              <option value="all">All Statuses</option>
              {ALL_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <input
              type="text"
              value={prospectSearch}
              onChange={e => setProspectSearch(e.target.value)}
              placeholder="Search by name, email, Instagram..."
              className="flex-1 max-w-sm px-3 py-2.5 bg-dash-card border border-dash-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all"
            />
          </div>

          {/* Status count cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
                className={`bg-dash-card rounded-xl border p-3 text-center transition-all ${statusFilter === s ? 'border-gray-400 ring-1 ring-gray-300' : 'border-dash-border hover:border-gray-300'}`}
              >
                <p className="text-lg font-semibold text-dash-text">{statusCounts[s]}</p>
                <p className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase inline-block mt-1 ${STATUS_COLORS[s]}`}>
                  {STATUS_LABELS[s]}
                </p>
              </button>
            ))}
          </div>

          {/* Prospect list */}
          {prospectsLoading ? (
            <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredProspects.length === 0 ? (
            <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
              <p className="text-dash-text-muted text-sm">No prospects found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProspects.map(p => {
                const isExpanded = expandedProspect === p.id;
                const isEditing = editingProspect === p.id;
                let assignedArr: string[] = [];
                try { assignedArr = JSON.parse(p.assigned_members || '[]'); } catch { /* */ }

                return (
                  <div key={p.id} className="bg-dash-card rounded-xl border border-dash-border overflow-hidden hover:border-gray-300 transition-colors">
                    {/* Card header */}
                    <div className="px-5 py-4 flex items-center justify-between">
                      <button
                        onClick={() => { setExpandedProspect(isExpanded ? null : p.id); if (isEditing) setEditingProspect(null); }}
                        className="flex-1 text-left flex items-center gap-3 min-w-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-dash-badge-bg flex items-center justify-center text-dash-text-secondary text-[10px] font-semibold shrink-0">
                          {p.first_name[0]}{p.last_name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-dash-text truncate">{p.first_name} {p.last_name}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {p.major && <span className="text-[11px] text-dash-text-muted">{p.major}</span>}
                            {p.is_uh_student === 1 && (
                              <span className="text-[9px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-medium uppercase">UH</span>
                            )}
                            {p.age && <span className="text-[11px] text-dash-text-muted">Age {p.age}</span>}
                          </div>
                        </div>
                      </button>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        {/* Quick status dropdown */}
                        <select
                          value={p.status}
                          onChange={e => handleQuickStatus(p.id, e.target.value)}
                          className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase border-0 cursor-pointer ${STATUS_COLORS[p.status]}`}
                        >
                          {ALL_STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                          ))}
                        </select>

                        {/* Expand chevron */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && !isEditing && (
                      <div className="px-5 pb-4 border-t border-dash-border pt-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div><span className="text-dash-text-muted">Email:</span> <span className="text-dash-text">{p.email || '-'}</span></div>
                          <div><span className="text-dash-text-muted">Phone:</span> <span className="text-dash-text">{p.phone || '-'}</span></div>
                          <div><span className="text-dash-text-muted">Instagram:</span> <span className="text-dash-text">{p.instagram || '-'}</span></div>
                          <div><span className="text-dash-text-muted">Age:</span> <span className="text-dash-text">{p.age || '-'}</span></div>
                          <div><span className="text-dash-text-muted">Major:</span> <span className="text-dash-text">{p.major || '-'}</span></div>
                          <div><span className="text-dash-text-muted">UH Student:</span> <span className="text-dash-text">{p.is_uh_student ? 'Yes' : 'No'}</span></div>
                          <div><span className="text-dash-text-muted">Created:</span> <span className="text-dash-text">{new Date(p.created_at + 'Z').toLocaleDateString()}</span></div>
                          <div><span className="text-dash-text-muted">Updated:</span> <span className="text-dash-text">{new Date(p.updated_at + 'Z').toLocaleDateString()}</span></div>
                          {assignedArr.length > 0 && (
                            <div className="col-span-full">
                              <span className="text-dash-text-muted">Assigned:</span>{' '}
                              <span className="inline-flex gap-1 flex-wrap mt-1">
                                {assignedArr.map(id => (
                                  <span key={id} className="text-[10px] bg-dash-badge-bg text-dash-text-secondary px-2 py-0.5 rounded font-medium" title={getMemberName(id)}>
                                    {getMemberInitials(id)}
                                  </span>
                                ))}
                              </span>
                            </div>
                          )}
                          {p.notes && (
                            <div className="col-span-full">
                              <span className="text-dash-text-muted">Notes:</span>
                              <p className="text-dash-text mt-1 whitespace-pre-wrap">{p.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => startEditing(p)}
                            className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg border border-dash-border hover:border-gray-300 transition-all"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProspect(p.id, `${p.first_name} ${p.last_name}`)}
                            className="text-red-400 text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg border border-red-200 hover:border-red-300 hover:text-red-600 transition-all"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Edit form */}
                    {isExpanded && isEditing && (
                      <div className="px-5 pb-5 border-t border-dash-border pt-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">First Name</label>
                            <input type="text" value={editForm.first_name} onChange={e => setEditForm({ ...editForm, first_name: e.target.value })} required className={INPUT_CLASS} />
                          </div>
                          <div>
                            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Last Name</label>
                            <input type="text" value={editForm.last_name} onChange={e => setEditForm({ ...editForm, last_name: e.target.value })} required className={INPUT_CLASS} />
                          </div>
                          <div>
                            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Status</label>
                            <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as typeof editForm.status })} className={INPUT_CLASS}>
                              {ALL_STATUSES.map(s => (
                                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Email</label>
                            <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} className={INPUT_CLASS} />
                          </div>
                          <div>
                            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Phone</label>
                            <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} className={INPUT_CLASS} />
                          </div>
                          <div>
                            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Instagram</label>
                            <input type="text" value={editForm.instagram} onChange={e => setEditForm({ ...editForm, instagram: e.target.value })} placeholder="@handle" className={INPUT_CLASS} />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Age</label>
                            <input type="number" value={editForm.age} onChange={e => setEditForm({ ...editForm, age: e.target.value })} className={INPUT_CLASS} />
                          </div>
                          <div>
                            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Major</label>
                            <input type="text" value={editForm.major} onChange={e => setEditForm({ ...editForm, major: e.target.value })} className={INPUT_CLASS} />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                              <input type="checkbox" checked={editForm.is_uh_student} onChange={e => setEditForm({ ...editForm, is_uh_student: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-dash-text focus:ring-gray-300" />
                              <span className="text-sm text-dash-text">UH Student</span>
                            </label>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Notes</label>
                          <textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} rows={3} className={INPUT_CLASS} />
                        </div>
                        <div>
                          <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Assigned Members</label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {members.map(m => (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => toggleAssigned(editForm, setEditForm, m.id)}
                                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                                  editForm.assigned_members.includes(m.id)
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'text-dash-text-secondary border-dash-border hover:border-gray-300'
                                }`}
                              >
                                {m.first_name} {m.last_name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleUpdateProspect(p.id)}
                            disabled={saving}
                            className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={() => setEditingProspect(null)}
                            className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-gray-300 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════ */}
      {/* ADD PROSPECT MODAL                                      */}
      {/* ════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddModal(false)} />
          <form
            onSubmit={handleAddProspect}
            className="relative bg-dash-card rounded-xl border border-dash-border shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4"
          >
            <h2 className="text-sm font-medium text-dash-text">Add Prospect</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">First Name *</label>
                <input type="text" value={addForm.first_name} onChange={e => setAddForm({ ...addForm, first_name: e.target.value })} required className={INPUT_CLASS} />
              </div>
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Last Name *</label>
                <input type="text" value={addForm.last_name} onChange={e => setAddForm({ ...addForm, last_name: e.target.value })} required className={INPUT_CLASS} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Email</label>
                <input type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })} className={INPUT_CLASS} />
              </div>
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Phone</label>
                <input type="text" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} className={INPUT_CLASS} />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Instagram</label>
              <input type="text" value={addForm.instagram} onChange={e => setAddForm({ ...addForm, instagram: e.target.value })} placeholder="@handle" className={INPUT_CLASS} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Age</label>
                <input type="number" value={addForm.age} onChange={e => setAddForm({ ...addForm, age: e.target.value })} className={INPUT_CLASS} />
              </div>
              <div>
                <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Major</label>
                <input type="text" value={addForm.major} onChange={e => setAddForm({ ...addForm, major: e.target.value })} className={INPUT_CLASS} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={addForm.is_uh_student} onChange={e => setAddForm({ ...addForm, is_uh_student: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-dash-text focus:ring-gray-300" />
                <span className="text-sm text-dash-text">UH Student</span>
              </label>
            </div>

            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Status</label>
              <select value={addForm.status} onChange={e => setAddForm({ ...addForm, status: e.target.value as typeof addForm.status })} className={INPUT_CLASS}>
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Notes</label>
              <textarea value={addForm.notes} onChange={e => setAddForm({ ...addForm, notes: e.target.value })} rows={3} className={INPUT_CLASS} />
            </div>

            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Assigned Members</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {members.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleAssigned(addForm, setAddForm, m.id)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      addForm.assigned_members.includes(m.id)
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'text-dash-text-secondary border-dash-border hover:border-gray-300'
                    }`}
                  >
                    {m.first_name} {m.last_name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Prospect'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setAddForm(EMPTY_PROSPECT_FORM); }}
                className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Page Export (with Suspense) ──────────────────────────────

export default function RecruitmentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>}>
      <RecruitmentInner />
    </Suspense>
  );
}

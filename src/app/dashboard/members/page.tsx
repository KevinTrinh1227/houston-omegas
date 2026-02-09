'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole, ROLE_LABELS, ROLE_COLORS, CHAIR_LABELS, CHAIR_COLORS, type Role } from '@/lib/roles';
import {
  Shield, Crown, UserCog, Globe, Wallet, ClipboardList,
  Sprout, UserCheck, GraduationCap, UserX,
} from 'lucide-react';

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield size={10} />,
  president: <Crown size={10} />,
  vpi: <UserCog size={10} />,
  vpx: <Globe size={10} />,
  treasurer: <Wallet size={10} />,
  secretary: <ClipboardList size={10} />,
  junior_active: <Sprout size={10} />,
  active: <UserCheck size={10} />,
  alumni: <GraduationCap size={10} />,
  inactive: <UserX size={10} />,
};

interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  chair_position: string | null;
  phone: string | null;
  class_year: string | null;
  major: string | null;
  instagram: string | null;
  discord_id: string | null;
  avatar_url: string | null;
  is_active: number;
  created_at: string;
  last_login_at: string | null;
}

type FilterTab = 'all' | 'active' | 'alumni' | 'inactive';

function ActionsMenu({ member, currentMemberId, onAction }: {
  member: Member;
  currentMemberId: string;
  onAction: (action: string, member: Member) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.right });
    }
    setOpen(!open);
  };

  if (member.id === currentMemberId) return null;

  const neverLoggedIn = !member.last_login_at;
  const isActive = member.is_active === 1;

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        className="p-1.5 rounded-md hover:bg-dash-card-hover text-dash-text-muted hover:text-dash-text transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>
      {open && (
        <div
          ref={menuRef}
          className="fixed bg-dash-card border border-dash-border rounded-lg shadow-lg z-50 min-w-[160px] py-1"
          style={{ top: pos.top, left: pos.left, transform: 'translateX(-100%)' }}
        >
          {neverLoggedIn && (
            <button
              onClick={() => { setOpen(false); onAction('resend', member); }}
              className="w-full text-left px-3 py-2 text-xs text-dash-text hover:bg-dash-card-hover transition-colors flex items-center gap-2"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>
              Resend Invite
            </button>
          )}
          {isActive && (
            <button
              onClick={() => { setOpen(false); onAction('deactivate', member); }}
              className="w-full text-left px-3 py-2 text-xs text-yellow-600 dark:text-yellow-400 hover:bg-dash-card-hover transition-colors flex items-center gap-2"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              Deactivate
            </button>
          )}
          {!isActive && (
            <button
              onClick={() => { setOpen(false); onAction('reactivate', member); }}
              className="w-full text-left px-3 py-2 text-xs text-green-600 dark:text-green-400 hover:bg-dash-card-hover transition-colors flex items-center gap-2"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Reactivate
            </button>
          )}
          {neverLoggedIn && (
            <button
              onClick={() => { setOpen(false); onAction('remove', member); }}
              className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-dash-card-hover transition-colors flex items-center gap-2"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              Remove
            </button>
          )}
        </div>
      )}
    </>
  );
}

export default function MembersPage() {
  const { member: currentMember } = useAuth();
  const isExec = isExecRole(currentMember?.role || '');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', first_name: '', last_name: '', role: 'active' });
  const [createForm, setCreateForm] = useState({ email: '', first_name: '', last_name: '', role: 'active', class_year: '', major: '', phone: '', instagram: '', discord_id: '' });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/members', { credentials: 'include' });
      if (res.ok) setMembers(await res.json());
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const showMsg = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(inviteForm),
      });

      if (res.ok) {
        const newMember = await res.json();
        await fetch('/api/members/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ member_id: newMember.id }),
        });
        setInviteForm({ email: '', first_name: '', last_name: '', role: 'active' });
        setShowInvite(false);
        showMsg('Member invited and email sent successfully.');
        fetchMembers();
      } else {
        const data = await res.json();
        showMsg(data.error || 'Failed to invite member.');
      }
    } catch {
      showMsg('Connection error.');
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      });
      fetchMembers();
    } catch { /* */ }
  };

  const handleChairChange = async (id: string, chair_position: string | null) => {
    try {
      await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ chair_position }),
      });
      fetchMembers();
    } catch { /* */ }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/members/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify(createForm),
      });
      if (res.ok) {
        setCreateForm({ email: '', first_name: '', last_name: '', role: 'active', class_year: '', major: '', phone: '', instagram: '', discord_id: '' });
        setShowCreate(false);
        showMsg('Profile created (pending). Member can now log in to activate.');
        fetchMembers();
      } else {
        const data = await res.json();
        showMsg(data.error || 'Failed to create profile.');
      }
    } catch { showMsg('Connection error.'); }
    finally { setSaving(false); }
  };

  const handleAction = async (action: string, member: Member) => {
    const name = `${member.first_name} ${member.last_name}`;

    if (action === 'resend') {
      try {
        const res = await fetch('/api/members/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ member_id: member.id }),
        });
        if (res.ok) {
          showMsg(`Invite email resent to ${member.email}.`);
        } else {
          const data = await res.json();
          showMsg(data.error || 'Failed to resend invite.');
        }
      } catch { showMsg('Connection error.'); }
    }

    if (action === 'deactivate') {
      if (!confirm(`Deactivate ${name}? They will be logged out immediately.`)) return;
      try {
        await fetch(`/api/members/${member.id}`, { method: 'DELETE', credentials: 'include' });
        showMsg(`${name} has been deactivated.`);
        fetchMembers();
      } catch { showMsg('Failed to deactivate.'); }
    }

    if (action === 'reactivate') {
      if (!confirm(`Reactivate ${name}? They will be able to log in again.`)) return;
      try {
        await fetch(`/api/members/${member.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ is_active: true, role: 'active' }),
        });
        showMsg(`${name} has been reactivated.`);
        fetchMembers();
      } catch { showMsg('Failed to reactivate.'); }
    }

    if (action === 'remove') {
      if (!confirm(`Permanently remove ${name}? This cannot be undone.`)) return;
      try {
        const res = await fetch(`/api/members/${member.id}?permanent=true`, { method: 'DELETE', credentials: 'include' });
        if (res.ok) {
          showMsg(`${name} has been removed.`);
          fetchMembers();
        } else {
          const data = await res.json();
          showMsg(data.error || 'Failed to remove member.');
        }
      } catch { showMsg('Connection error.'); }
    }
  };

  // Filter logic
  const filteredMembers = members.filter(m => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return m.is_active === 1 && m.role !== 'alumni' && m.role !== 'inactive';
    if (activeTab === 'alumni') return m.role === 'alumni';
    if (activeTab === 'inactive') return m.role === 'inactive' || m.is_active === 0;
    return true;
  });

  const tabCounts = {
    all: members.length,
    active: members.filter(m => m.is_active === 1 && m.role !== 'alumni' && m.role !== 'inactive').length,
    alumni: members.filter(m => m.role === 'alumni').length,
    inactive: members.filter(m => m.role === 'inactive' || m.is_active === 0).length,
  };

  const roleColor = ROLE_COLORS;

  const inputClass = 'w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 outline-none transition-all';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Members</h1>
          <p className="text-sm text-dash-text-secondary mt-1">{members.length} total member{members.length !== 1 ? 's' : ''}</p>
        </div>
        {isExec && !showInvite && !showCreate && (
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(true)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all">
              Create Profile
            </button>
            <button onClick={() => setShowInvite(true)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all">
              Invite Member
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-xs text-center ${message.includes('success') || message.includes('sent') || message.includes('reactivated') || message.includes('removed') || message.includes('deactivated') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
          {message}
        </div>
      )}

      {/* Invite form */}
      {showInvite && isExec && (
        <form onSubmit={handleInvite} className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6 space-y-4">
          <h2 className="text-sm font-medium text-dash-text">Invite New Member</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">First Name</label>
              <input type="text" value={inviteForm.first_name} onChange={e => setInviteForm({ ...inviteForm, first_name: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Last Name</label>
              <input type="text" value={inviteForm.last_name} onChange={e => setInviteForm({ ...inviteForm, last_name: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Role</label>
              <select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })} className={inputClass}>
                <option value="active">Active</option>
                <option value="junior_active">J.A.</option>
                <option value="president">President</option>
                <option value="vpi">VP Internal</option>
                <option value="vpx">VP External</option>
                <option value="treasurer">Treasurer</option>
                <option value="secretary">Secretary</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} required placeholder="member@email.com" className={inputClass} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50">
              {saving ? 'Inviting...' : 'Invite'}
            </button>
            <button type="button" onClick={() => setShowInvite(false)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Create Profile form */}
      {showCreate && isExec && (
        <form onSubmit={handleCreate} className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6 space-y-4">
          <h2 className="text-sm font-medium text-dash-text">Create Member Profile</h2>
          <p className="text-[10px] text-dash-text-muted">Creates a pending profile. The member will activate when they first log in.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">First Name</label><input type="text" value={createForm.first_name} onChange={e => setCreateForm({ ...createForm, first_name: e.target.value })} required className={inputClass} /></div>
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Last Name</label><input type="text" value={createForm.last_name} onChange={e => setCreateForm({ ...createForm, last_name: e.target.value })} required className={inputClass} /></div>
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Role</label>
              <select value={createForm.role} onChange={e => setCreateForm({ ...createForm, role: e.target.value })} className={inputClass}>
                <option value="active">Active</option>
                <option value="junior_active">J.A.</option>
                <option value="president">President</option>
                <option value="vpi">VP Internal</option>
                <option value="vpx">VP External</option>
                <option value="treasurer">Treasurer</option>
                <option value="secretary">Secretary</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
          </div>
          <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Email</label><input type="email" value={createForm.email} onChange={e => setCreateForm({ ...createForm, email: e.target.value })} required className={inputClass} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Class Year</label><input type="text" value={createForm.class_year} onChange={e => setCreateForm({ ...createForm, class_year: e.target.value })} placeholder="e.g. 2026" className={inputClass} /></div>
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Major</label><input type="text" value={createForm.major} onChange={e => setCreateForm({ ...createForm, major: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Phone</label><input type="text" value={createForm.phone} onChange={e => setCreateForm({ ...createForm, phone: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Instagram</label><input type="text" value={createForm.instagram} onChange={e => setCreateForm({ ...createForm, instagram: e.target.value })} placeholder="@handle" className={inputClass} /></div>
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Discord ID</label><input type="text" value={createForm.discord_id} onChange={e => setCreateForm({ ...createForm, discord_id: e.target.value })} placeholder="User ID" className={inputClass} /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Profile'}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all">Cancel</button>
          </div>
        </form>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 bg-dash-card rounded-lg border border-dash-border p-1">
        {(['all', 'active', 'alumni', 'inactive'] as FilterTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-[11px] uppercase tracking-wider font-medium px-3 py-2 rounded-md transition-all ${
              activeTab === tab
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                : 'text-dash-text-secondary hover:text-dash-text hover:bg-dash-card-hover'
            }`}
          >
            {tab === 'all' ? 'All' : tab === 'active' ? 'Active' : tab === 'alumni' ? 'Alumni' : 'Inactive'}
            <span className={`ml-1.5 text-[10px] ${activeTab === tab ? 'opacity-70' : 'text-dash-text-muted'}`}>
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Member list */}
      {loading ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
          <div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-dash-card rounded-xl border border-dash-border overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-dash-border">
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Name</th>
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Email</th>
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Role</th>
                {isExec && <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Chair</th>}
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 hidden sm:table-cell">Last Login</th>
                {isExec && <th className="text-right text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 w-12"></th>}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(m => (
                <tr key={m.id} className={`border-b border-dash-border/50 hover:bg-dash-card-hover transition-colors ${!m.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {m.avatar_url ? (
                        <img src={m.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-dash-badge-bg flex items-center justify-center text-dash-text-secondary text-[10px] font-semibold shrink-0">
                          {m.first_name[0]}{m.last_name[0]}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-dash-text">{m.first_name} {m.last_name}</span>
                        {!m.last_login_at && m.is_active === 1 && (
                          <span className="text-[9px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded-full uppercase font-medium">Invited</span>
                        )}
                        {!m.is_active && (
                          <span className="text-[9px] bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full uppercase font-medium">Inactive</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-dash-text-secondary">{m.email}</td>
                  <td className="px-5 py-3">
                    {isExec && m.id !== currentMember?.id ? (
                      <select
                        value={m.role}
                        onChange={e => handleRoleChange(m.id, e.target.value)}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase border-0 cursor-pointer ${roleColor[m.role as Role] || 'bg-dash-badge-bg text-dash-text-secondary'}`}
                      >
                        <option value="admin">Admin</option>
                        <option value="president">President</option>
                        <option value="vpi">VP Internal</option>
                        <option value="vpx">VP External</option>
                        <option value="treasurer">Treasurer</option>
                        <option value="secretary">Secretary</option>
                        <option value="junior_active">J.A.</option>
                        <option value="active">Active</option>
                        <option value="alumni">Alumni</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium uppercase ${roleColor[m.role as Role] || 'bg-dash-badge-bg text-dash-text-secondary'}`}>
                        {ROLE_ICONS[m.role]}
                        {ROLE_LABELS[m.role as Role] || m.role}
                      </span>
                    )}
                  </td>
                  {isExec && (
                    <td className="px-5 py-3">
                      {m.id !== currentMember?.id ? (
                        <select
                          value={m.chair_position || ''}
                          onChange={e => handleChairChange(m.id, e.target.value || null)}
                          className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase border-0 cursor-pointer ${
                            m.chair_position ? (CHAIR_COLORS[m.chair_position] || 'bg-dash-badge-bg text-dash-text-secondary') : 'bg-transparent text-dash-text-muted'
                          }`}
                        >
                          <option value="">None</option>
                          <option value="recruitment">Recruitment</option>
                          <option value="alumni">Alumni</option>
                          <option value="social">Social</option>
                          <option value="social_media">Social Media</option>
                          <option value="brotherhood">Brotherhood</option>
                          <option value="historian">Historian</option>
                        </select>
                      ) : (
                        m.chair_position ? (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase ${CHAIR_COLORS[m.chair_position] || 'bg-dash-badge-bg text-dash-text-secondary'}`}>
                            {CHAIR_LABELS[m.chair_position] || m.chair_position}
                          </span>
                        ) : (
                          <span className="text-[10px] text-dash-text-muted">&mdash;</span>
                        )
                      )}
                    </td>
                  )}
                  <td className="px-5 py-3 text-xs text-dash-text-muted hidden sm:table-cell">
                    {m.last_login_at ? new Date(m.last_login_at + 'Z').toLocaleDateString() : 'Never'}
                  </td>
                  {isExec && (
                    <td className="px-5 py-3 text-right">
                      <ActionsMenu member={m} currentMemberId={currentMember?.id || ''} onAction={handleAction} />
                    </td>
                  )}
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={isExec ? 6 : 4} className="px-5 py-8 text-center text-xs text-dash-text-muted">
                    No members found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

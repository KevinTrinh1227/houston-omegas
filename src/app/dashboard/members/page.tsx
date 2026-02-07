'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole, ROLE_LABELS, ROLE_COLORS, type Role } from '@/lib/roles';

interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
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

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/members', { credentials: 'include' });
      if (res.ok) setMembers(await res.json());
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

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
        setInviteForm({ email: '', first_name: '', last_name: '', role: 'active' });
        setShowInvite(false);
        setMessage('Member invited successfully.');
        fetchMembers();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to invite member.');
      }
    } catch {
      setMessage('Connection error.');
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
        setMessage('Profile created (pending). Member can now log in to activate.');
        fetchMembers();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to create profile.');
      }
    } catch { setMessage('Connection error.'); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Deactivate ${name}? They will be logged out immediately.`)) return;
    try {
      await fetch(`/api/members/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchMembers();
    } catch { /* */ }
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
        <div className={`mb-4 p-3 rounded-lg text-xs text-center ${message.includes('success') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
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

      {/* Member list */}
      {loading ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
          <div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-dash-card rounded-xl border border-dash-border overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-dash-border">
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Name</th>
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Email</th>
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Role</th>
                <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 hidden sm:table-cell">Last Login</th>
                {isExec && <th className="text-right text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
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
                      <span className="text-xs font-medium text-dash-text">{m.first_name} {m.last_name}</span>
                      {(m as Member & { status?: string }).status === 'pending' && (
                        <span className="text-[9px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full uppercase font-medium">Pending</span>
                      )}
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
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium uppercase ${roleColor[m.role as Role] || 'bg-dash-badge-bg text-dash-text-secondary'}`}>{ROLE_LABELS[m.role as Role] || m.role}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-dash-text-muted hidden sm:table-cell">
                    {m.last_login_at ? new Date(m.last_login_at + 'Z').toLocaleDateString() : 'Never'}
                  </td>
                  {isExec && (
                    <td className="px-5 py-3 text-right">
                      {m.id !== currentMember?.id && m.is_active === 1 && (
                        <button onClick={() => handleDeactivate(m.id, `${m.first_name} ${m.last_name}`)} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                          Deactivate
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

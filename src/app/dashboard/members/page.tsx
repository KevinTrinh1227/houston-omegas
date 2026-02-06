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
  const [saving, setSaving] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', first_name: '', last_name: '', role: 'active' });
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

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Deactivate ${name}? They will be logged out immediately.`)) return;
    try {
      await fetch(`/api/members/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchMembers();
    } catch { /* */ }
  };

  const roleColor = ROLE_COLORS;

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Members</h1>
          <p className="text-sm text-gray-500 mt-1">{members.length} total member{members.length !== 1 ? 's' : ''}</p>
        </div>
        {isExec && !showInvite && (
          <button onClick={() => setShowInvite(true)} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">
            Invite Member
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-xs text-center ${message.includes('success') ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          {message}
        </div>
      )}

      {/* Invite form */}
      {showInvite && isExec && (
        <form onSubmit={handleInvite} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="text-sm font-medium text-gray-900">Invite New Member</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">First Name</label>
              <input type="text" value={inviteForm.first_name} onChange={e => setInviteForm({ ...inviteForm, first_name: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Last Name</label>
              <input type="text" value={inviteForm.last_name} onChange={e => setInviteForm({ ...inviteForm, last_name: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Role</label>
              <select value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })} className={inputClass}>
                <option value="active">Active</option>
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
            <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} required placeholder="member@email.com" className={inputClass} />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50">
              {saving ? 'Inviting...' : 'Invite'}
            </button>
            <button type="button" onClick={() => setShowInvite(false)} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Member list */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Name</th>
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Email</th>
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Role</th>
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3 hidden sm:table-cell">Last Login</th>
                {isExec && <th className="text-right text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${!m.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {m.avatar_url ? (
                        <img src={m.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[10px] font-semibold shrink-0">
                          {m.first_name[0]}{m.last_name[0]}
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-900">{m.first_name} {m.last_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500">{m.email}</td>
                  <td className="px-5 py-3">
                    {isExec && m.id !== currentMember?.id ? (
                      <select
                        value={m.role}
                        onChange={e => handleRoleChange(m.id, e.target.value)}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase border-0 cursor-pointer ${roleColor[m.role as Role] || 'bg-gray-100 text-gray-500'}`}
                      >
                        <option value="admin">Admin</option>
                        <option value="president">President</option>
                        <option value="vpi">VP Internal</option>
                        <option value="vpx">VP External</option>
                        <option value="treasurer">Treasurer</option>
                        <option value="secretary">Secretary</option>
                        <option value="active">Active</option>
                        <option value="alumni">Alumni</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    ) : (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${roleColor[m.role as Role] || 'bg-gray-100 text-gray-500'}`}>{ROLE_LABELS[m.role as Role] || m.role}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400 hidden sm:table-cell">
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

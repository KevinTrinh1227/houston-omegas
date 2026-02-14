'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Mail, User, Send, Loader2 } from 'lucide-react';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (member: { id: string; email: string; first_name: string; last_name: string }) => void;
}

export default function AddMemberModal({ open, onClose, onSuccess }: AddMemberModalProps) {
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'active',
    send_invite: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const inputClass = 'w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all';

  const checkEmail = async (email: string) => {
    if (!email || !email.includes('@')) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/members/check-email?email=${encodeURIComponent(email)}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setEmailExists(data.exists);
    } catch {
      // Ignore errors
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailExists) {
      setError('A member with this email already exists');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Create the member
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          role: form.role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create member');
      }

      const newMember = await res.json();

      // Send invite if requested
      if (form.send_invite) {
        await fetch('/api/members/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ member_id: newMember.id }),
        });
      }

      onSuccess(newMember);
      setForm({ email: '', first_name: '', last_name: '', role: 'active', send_invite: true });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setForm({ email: '', first_name: '', last_name: '', role: 'active', send_invite: true });
      setError('');
      setEmailExists(false);
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add New Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              required
              className={inputClass}
              placeholder="John"
            />
          </div>
          <div>
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              required
              className={inputClass}
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">
            Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dash-text-muted" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setEmailExists(false);
              }}
              onBlur={(e) => checkEmail(e.target.value)}
              required
              className={`${inputClass} pl-9 ${emailExists ? 'border-red-500' : ''}`}
              placeholder="member@email.com"
            />
            {checking && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dash-text-muted animate-spin" />
            )}
          </div>
          {emailExists && (
            <p className="text-[10px] text-red-500 mt-1">This email is already registered</p>
          )}
        </div>

        <div>
          <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">
            Initial Role
          </label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className={inputClass}
          >
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

        <div className="flex items-center gap-3 p-3 bg-dash-input/50 rounded-lg">
          <input
            type="checkbox"
            id="send_invite"
            checked={form.send_invite}
            onChange={(e) => setForm({ ...form, send_invite: e.target.checked })}
            className="w-4 h-4 rounded border-dash-border bg-dash-input text-gray-900 dark:text-white focus:ring-0 cursor-pointer"
          />
          <label htmlFor="send_invite" className="text-xs text-dash-text cursor-pointer flex items-center gap-2">
            <Send size={12} />
            Send invitation email immediately
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || emailExists}
            className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <User size={14} />
                Add Member
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

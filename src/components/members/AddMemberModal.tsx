'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Mail, Send, Loader2, AlertCircle, CheckCircle, UserPlus } from 'lucide-react';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (member: { id: string; email: string; first_name: string; last_name: string }) => void;
}

interface FormErrors {
  email?: string;
  first_name?: string;
  last_name?: string;
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
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [checking, setChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newMember, setNewMember] = useState<{ id: string; email: string; first_name: string; last_name: string } | null>(null);

  const inputClass = 'w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all';
  const inputErrorClass = 'border-red-500 focus:ring-red-500';

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!form.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    } else if (form.first_name.length < 2) {
      newErrors.first_name = 'First name must be at least 2 characters';
    }

    if (!form.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    } else if (form.last_name.length < 2) {
      newErrors.last_name = 'Last name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkEmail = async (email: string) => {
    if (!email || !validateEmail(email)) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/members/check-email?email=${encodeURIComponent(email)}`, {
        credentials: 'include',
      });
      const data = await res.json();
      setEmailExists(data.exists);
      if (data.exists) {
        setErrors(prev => ({ ...prev, email: 'A member with this email already exists' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    } catch {
      // Ignore errors
    } finally {
      setChecking(false);
    }
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ email: true, first_name: true, last_name: true });

    if (!validate() || emailExists) {
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
          email: form.email.toLowerCase().trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          role: form.role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create member');
      }

      const member = await res.json();

      // Send invite if requested
      if (form.send_invite) {
        await fetch('/api/members/send-invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ member_id: member.id }),
        });
      }

      setNewMember(member);
      setShowSuccess(true);
      onSuccess(member);
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
      setErrors({});
      setTouched({});
      setEmailExists(false);
      setShowSuccess(false);
      setNewMember(null);
      onClose();
    }
  };

  const handleSendInvite = async () => {
    if (!newMember) return;
    setSaving(true);
    try {
      await fetch('/api/members/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ member_id: newMember.id }),
      });
      handleClose();
    } catch {
      setError('Failed to send invite');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title={showSuccess ? '' : 'Add New Member'}>
      {showSuccess && newMember ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-dash-text mb-2">Member Added!</h3>
          <p className="text-sm text-dash-text-secondary mb-6">
            {newMember.first_name} {newMember.last_name} has been added to the organization.
          </p>

          <div className="bg-dash-input/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-dash-text-secondary font-semibold">
                {newMember.first_name[0]}{newMember.last_name[0]}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-dash-text">{newMember.first_name} {newMember.last_name}</p>
                <p className="text-xs text-dash-text-muted">{newMember.email}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {!form.send_invite && (
              <button
                onClick={handleSendInvite}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs uppercase tracking-wider font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 min-h-[44px]"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send Invite
              </button>
            )}
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-dash-border text-dash-text-secondary text-xs uppercase tracking-wider font-medium hover:border-dash-text-muted transition-all min-h-[44px]"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={14} />
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
                onBlur={() => handleBlur('first_name')}
                className={`${inputClass} ${touched.first_name && errors.first_name ? inputErrorClass : ''}`}
                placeholder="John"
              />
              {touched.first_name && errors.first_name && (
                <p className="text-[10px] text-red-500 mt-1">{errors.first_name}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                onBlur={() => handleBlur('last_name')}
                className={`${inputClass} ${touched.last_name && errors.last_name ? inputErrorClass : ''}`}
                placeholder="Doe"
              />
              {touched.last_name && errors.last_name && (
                <p className="text-[10px] text-red-500 mt-1">{errors.last_name}</p>
              )}
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
                onBlur={(e) => {
                  handleBlur('email');
                  checkEmail(e.target.value);
                }}
                className={`${inputClass} pl-9 ${(touched.email && errors.email) || emailExists ? inputErrorClass : ''}`}
                placeholder="member@email.com"
              />
              {checking && (
                <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-dash-text-muted animate-spin" />
              )}
            </div>
            {touched.email && errors.email && (
              <p className="text-[10px] text-red-500 mt-1">{errors.email}</p>
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

          <div className="flex items-center gap-3 p-4 bg-dash-input/50 rounded-lg">
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
              className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  Add Member
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all disabled:opacity-50 min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

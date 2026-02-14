'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import ChairSelector from './ChairSelector';
import { Loader2, Save, User, Mail, Phone, Instagram, MessageCircle, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import type { Member, AvailableChair, EboardPosition } from '@/lib/member-types';

interface MemberEditModalProps {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  availableChairs: AvailableChair[];
  onSuccess: (member: Member) => void;
}

export default function MemberEditModal({ open, onClose, member, availableChairs, onSuccess }: MemberEditModalProps) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    instagram: '',
    discord_id: '',
    class_year: '',
    major: '',
    role: 'active',
    membership_status: 'active' as 'active' | 'inactive',
    eboard_position: null as EboardPosition,
    chairs: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setForm({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        phone: member.phone || '',
        instagram: member.instagram || '',
        discord_id: member.discord_id || '',
        class_year: member.class_year || '',
        major: member.major || '',
        role: member.role || 'active',
        membership_status: member.membership_status || 'active',
        eboard_position: member.eboard_position || null,
        chairs: member.chairs || (member.chair_position ? [member.chair_position] : []),
      });
    }
  }, [member]);

  const inputClass = 'w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setSaving(true);
    setError('');

    try {
      // Update main member fields
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone || null,
          instagram: form.instagram || null,
          discord_id: form.discord_id || null,
          class_year: form.class_year || null,
          major: form.major || null,
          role: form.role,
          is_active: form.membership_status === 'active',
          eboard_position: form.eboard_position,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update member');
      }

      const updatedMember = await res.json();

      // Update chairs
      await fetch(`/api/members/${member.id}/chairs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ chairs: form.chairs }),
      });

      onSuccess({ ...updatedMember, chairs: form.chairs });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setError('');
      onClose();
    }
  };

  if (!member) return null;

  return (
    <Modal open={open} onClose={handleClose} title="Edit Member" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider flex items-center gap-2">
            <User size={12} />
            Personal Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">First Name</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Last Name</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Mail size={10} /> Email
            </label>
            <input
              type="email"
              value={form.email}
              disabled
              className={`${inputClass} opacity-60 cursor-not-allowed`}
            />
            <p className="text-[10px] text-dash-text-muted mt-1">Email cannot be changed</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Phone size={10} /> Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Instagram size={10} /> Instagram
              </label>
              <input
                type="text"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="@username"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <MessageCircle size={10} /> Discord ID
            </label>
            <input
              type="text"
              value={form.discord_id}
              onChange={(e) => setForm({ ...form, discord_id: e.target.value })}
              placeholder="Discord User ID"
              className={inputClass}
            />
          </div>
        </div>

        {/* Academic Info */}
        <div className="space-y-4 pt-4 border-t border-dash-border">
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider flex items-center gap-2">
            <GraduationCap size={12} />
            Academic
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={10} /> Class Year
              </label>
              <select
                value={form.class_year}
                onChange={(e) => setForm({ ...form, class_year: e.target.value })}
                className={inputClass}
              >
                <option value="">Select Year</option>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + 4 - i).map(year => (
                  <option key={year} value={year.toString()}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1">
                <BookOpen size={10} /> Major
              </label>
              <input
                type="text"
                value={form.major}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
                placeholder="Computer Science"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Organization Info */}
        <div className="space-y-4 pt-4 border-t border-dash-border">
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider">Organization</h3>

          {/* Status Toggle */}
          <div>
            <label className="block text-[10px] text-dash-text-muted mb-2 uppercase tracking-wider">Membership Status</label>
            <div className="flex rounded-lg border border-dash-border overflow-hidden">
              <button
                type="button"
                onClick={() => setForm({ ...form, membership_status: 'active' })}
                className={`flex-1 px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                  form.membership_status === 'active'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-dash-card text-dash-text-muted hover:text-dash-text'
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, membership_status: 'inactive' })}
                className={`flex-1 px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${
                  form.membership_status === 'inactive'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-dash-card text-dash-text-muted hover:text-dash-text'
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={inputClass}
              >
                <option value="active">Active</option>
                <option value="junior_active">J.A.</option>
                <option value="alumni">Alumni</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">E-Board Position</label>
              <select
                value={form.eboard_position || ''}
                onChange={(e) => setForm({ ...form, eboard_position: (e.target.value || null) as EboardPosition })}
                className={inputClass}
              >
                <option value="">None</option>
                <option value="president">President</option>
                <option value="vpi">VP Internal</option>
                <option value="vpx">VP External</option>
                <option value="treasurer">Treasurer</option>
                <option value="secretary">Secretary</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Chair Positions</label>
            <ChairSelector
              selectedChairs={form.chairs}
              availableChairs={availableChairs}
              onChange={(chairs) => setForm({ ...form, chairs })}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-dash-border">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save Changes
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

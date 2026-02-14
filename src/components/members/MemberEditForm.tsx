'use client';

import { useState, useEffect } from 'react';
import ChairSelector from './ChairSelector';
import { Loader2, Save, User, Mail, Phone, Instagram, MessageCircle, GraduationCap, BookOpen, Calendar, AlertCircle } from 'lucide-react';
import type { Member, AvailableChair, EboardPosition } from '@/lib/member-types';

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  instagram?: string;
  class_year?: string;
}

interface MemberEditFormProps {
  member: Member;
  availableChairs: AvailableChair[];
  onSubmit: (data: MemberFormData) => Promise<void>;
  onCancel: () => void;
  isSelf?: boolean;
  isExec?: boolean;
  className?: string;
}

export interface MemberFormData {
  first_name: string;
  last_name: string;
  phone: string | null;
  instagram: string | null;
  discord_id: string | null;
  class_year: string | null;
  major: string | null;
  role: string;
  membership_status: 'active' | 'inactive';
  eboard_position: EboardPosition;
  chairs: string[];
}

export default function MemberEditForm({
  member,
  availableChairs,
  onSubmit,
  onCancel,
  isSelf = false,
  isExec = false,
  className = '',
}: MemberEditFormProps) {
  const [form, setForm] = useState<MemberFormData>({
    first_name: '',
    last_name: '',
    phone: '',
    instagram: '',
    discord_id: '',
    class_year: '',
    major: '',
    role: 'active',
    membership_status: 'active',
    eboard_position: null,
    chairs: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (member) {
      setForm({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
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

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

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

    if (form.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(form.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (form.instagram && !/^@?[\w.]{1,30}$/.test(form.instagram)) {
      newErrors.instagram = 'Please enter a valid Instagram handle';
    }

    if (form.class_year && (!/^\d{4}$/.test(form.class_year) || parseInt(form.class_year) < 2000 || parseInt(form.class_year) > 2040)) {
      newErrors.class_year = 'Please enter a valid class year (2000-2040)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      first_name: true,
      last_name: true,
      phone: true,
      instagram: true,
      class_year: true,
    });

    if (!validate()) return;

    setSaving(true);
    try {
      await onSubmit({
        ...form,
        phone: form.phone || null,
        instagram: form.instagram || null,
        discord_id: form.discord_id || null,
        class_year: form.class_year || null,
        major: form.major || null,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBlur = (field: keyof FormErrors) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validate();
  };

  const inputClass = 'w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all';
  const inputErrorClass = 'border-red-500 focus:ring-red-500';

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Personal Info */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider flex items-center gap-2">
          <User size={12} />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.first_name}
              </p>
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
              <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.last_name}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <Mail size={10} /> Email
          </label>
          <input
            type="email"
            value={member.email}
            disabled
            className={`${inputClass} opacity-60 cursor-not-allowed`}
          />
          <p className="text-[10px] text-dash-text-muted mt-1">Email cannot be changed</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Phone size={10} /> Phone
            </label>
            <input
              type="tel"
              value={form.phone || ''}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              onBlur={() => handleBlur('phone')}
              placeholder="(555) 123-4567"
              className={`${inputClass} ${touched.phone && errors.phone ? inputErrorClass : ''}`}
            />
            {touched.phone && errors.phone && (
              <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.phone}
              </p>
            )}
          </div>
          <div>
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Instagram size={10} /> Instagram
            </label>
            <input
              type="text"
              value={form.instagram || ''}
              onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              onBlur={() => handleBlur('instagram')}
              placeholder="@username"
              className={`${inputClass} ${touched.instagram && errors.instagram ? inputErrorClass : ''}`}
            />
            {touched.instagram && errors.instagram && (
              <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle size={10} />
                {errors.instagram}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1">
            <MessageCircle size={10} /> Discord ID
          </label>
          <input
            type="text"
            value={form.discord_id || ''}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={10} /> Class Year
            </label>
            <select
              value={form.class_year || ''}
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
              value={form.major || ''}
              onChange={(e) => setForm({ ...form, major: e.target.value })}
              placeholder="Computer Science"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Organization Info - Only show for exec editing others */}
      {isExec && !isSelf && (
        <div className="space-y-4 pt-4 border-t border-dash-border">
          <h3 className="text-xs font-semibold text-dash-text uppercase tracking-wider">Organization</h3>

          {/* Status Toggle */}
          <div>
            <label className="block text-[10px] text-dash-text-muted mb-2 uppercase tracking-wider">Membership Status</label>
            <div className="flex rounded-lg border border-dash-border overflow-hidden">
              <button
                type="button"
                onClick={() => setForm({ ...form, membership_status: 'active' })}
                className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
                  form.membership_status === 'active'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-dash-card text-dash-text-muted hover:text-dash-text'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${form.membership_status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                  Active
                </span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, membership_status: 'inactive' })}
                className={`flex-1 px-4 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${
                  form.membership_status === 'inactive'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-dash-card text-dash-text-muted hover:text-dash-text'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${form.membership_status === 'inactive' ? 'bg-red-500' : 'bg-gray-400'}`} />
                  Inactive
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-dash-border">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
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
          onClick={onCancel}
          disabled={saving}
          className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all disabled:opacity-50 min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

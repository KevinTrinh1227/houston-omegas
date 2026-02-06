'use client';

import { useState } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';

export default function SettingsPage() {
  const { member, refresh } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    first_name: member?.first_name || '',
    last_name: member?.last_name || '',
    phone: member?.phone || '',
    class_year: member?.class_year || '',
    major: member?.major || '',
    instagram: member?.instagram || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch(`/api/members/${member?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage('Profile updated successfully.');
        await refresh();
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to update profile.');
      }
    } catch {
      setMessage('Connection error.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all text-sm';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile information</p>
      </div>

      <div className="max-w-lg">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {message && (
            <div className={`p-3 rounded-lg text-xs text-center ${message.includes('success') ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">First Name</label>
              <input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Last Name</label>
              <input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" value={member?.email || ''} disabled className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 text-sm cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="(123) 456-7890" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Class Year</label>
              <input type="text" value={form.class_year} onChange={e => setForm({ ...form, class_year: e.target.value })} placeholder="2026" className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Major</label>
              <input type="text" value={form.major} onChange={e => setForm({ ...form, major: e.target.value })} placeholder="Computer Science" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Instagram</label>
            <input type="text" value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@username" className={inputClass} />
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Account info */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Account Information</h2>
          <div className="space-y-2 text-xs text-gray-500">
            <p>Role: <span className="text-gray-700 font-medium capitalize">{member?.role}</span></p>
            <p>Member since: <span className="text-gray-700">{member?.created_at ? new Date(member.created_at + 'Z').toLocaleDateString() : '-'}</span></p>
            <p>Last login: <span className="text-gray-700">{member?.last_login_at ? new Date(member.last_login_at + 'Z').toLocaleDateString() : '-'}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function PhoneRequiredModal() {
  const { member, refresh } = useAuth();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  if (!member || member.phone) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setErr('Please enter a valid phone number.');
      return;
    }

    setSaving(true);
    setErr('');

    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone }),
      });

      if (res.ok) {
        await refresh();
      } else {
        const data = await res.json();
        setErr(data.error || 'Failed to save phone number.');
      }
    } catch {
      setErr('Connection error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Phone Number Required</h2>
        <p className="text-sm text-gray-500 mb-5">Please add your phone number to continue using the dashboard.</p>

        <form onSubmit={handleSubmit}>
          {err && (
            <div className="mb-3 p-2.5 rounded-lg text-xs text-red-600 bg-red-50 border border-red-200">{err}</div>
          )}
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="(123) 456-7890"
            required
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all text-sm mb-4"
          />
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Phone Number'}
          </button>
        </form>
      </div>
    </div>
  );
}

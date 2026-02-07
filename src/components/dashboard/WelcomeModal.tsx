'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function WelcomeModal() {
  const { member, refresh } = useAuth();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  if (!member) return null;

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
        body: JSON.stringify({ phone, has_completed_onboarding: true }),
      });

      if (res.ok) {
        await refresh();
      } else {
        const data = await res.json();
        setErr(data.error || 'Failed to save.');
      }
    } catch {
      setErr('Connection error.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
        {step === 1 ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-4">
                {member.first_name[0]}{member.last_name[0]}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome, {member.first_name}!
              </h2>
              <p className="text-sm text-gray-500">
                You&apos;ve been invited to the Houston Omegas dashboard.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase tracking-wider">Email</span>
                  <span className="text-gray-700">{member.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 uppercase tracking-wider">Role</span>
                  <span className="text-gray-700 capitalize">{member.role.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mb-6">
              Before you get started, we need your phone number for chapter communications.
            </p>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-all"
            >
              Continue
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Phone Number</h2>
            <p className="text-sm text-gray-500 mb-5">Required for chapter communications.</p>

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
                autoFocus
                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all text-sm mb-4"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Get Started'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

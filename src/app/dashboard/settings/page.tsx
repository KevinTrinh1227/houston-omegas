'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isPushSupported, isPushSubscribed, subscribeToPush, unsubscribeFromPush } from '@/lib/push';

function PushNotificationSettings() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const check = async () => {
      const sup = isPushSupported();
      setSupported(sup);
      if (sup) {
        const sub = await isPushSubscribed();
        setSubscribed(sub);
      }
      setLoading(false);
    };
    check();
  }, []);

  const handleToggle = async () => {
    setToggling(true);
    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
      } else {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const success = await subscribeToPush();
          setSubscribed(success);
        }
      }
    } catch { /* ignore */ }
    setToggling(false);
  };

  if (loading) return null;

  return (
    <div className="mt-6 bg-dash-card rounded-xl border border-dash-border p-6">
      <h2 className="text-sm font-medium text-dash-text mb-3">Push Notifications</h2>
      {!supported ? (
        <p className="text-xs text-dash-text-secondary">
          Push notifications are not supported in this browser. On iPhone, add this site to your home screen first.
        </p>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-dash-text">Receive push notifications</p>
            <p className="text-[11px] text-dash-text-muted mt-0.5">Announcements, events, and chapter updates</p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`relative w-10 h-5 rounded-full transition-colors ${subscribed ? 'bg-green-500' : 'bg-dash-border'} ${toggling ? 'opacity-50' : ''}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${subscribed ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      )}
    </div>
  );
}

function PhoneVerifyInline({ phone, onVerified }: { phone: string; onVerified: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'code'>('idle');
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [err, setErr] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    setSending(true);
    setErr('');
    try {
      const res = await fetch('/api/phone/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setPhase('code');
        setCode('');
        startCooldown();
      } else {
        setErr(data.error || 'Failed to send code.');
      }
    } catch {
      setErr('Connection error.');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    const cleaned = code.replace(/\D/g, '');
    if (cleaned.length !== 6) {
      setErr('Enter the 6-digit code.');
      return;
    }
    setVerifying(true);
    setErr('');
    try {
      const res = await fetch('/api/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, code: cleaned }),
      });
      const data = await res.json();
      if (res.ok) {
        onVerified();
      } else {
        setErr(data.error || 'Verification failed.');
      }
    } catch {
      setErr('Connection error.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="mt-2 p-3 rounded-lg bg-dash-bg border border-dash-border">
      {err && (
        <div className="mb-2 text-xs text-red-600 dark:text-red-400">{err}</div>
      )}
      {phase === 'idle' ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-dash-text-secondary">Phone not verified. Verify to continue.</p>
          <button
            onClick={handleSendCode}
            disabled={sending}
            className="text-[10px] uppercase tracking-[0.12em] font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Code'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-dash-text-secondary">Enter the 6-digit code sent to {phone}</p>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              autoFocus
              className="flex-1 px-3 py-2 bg-dash-input border border-dash-input-border rounded-lg text-dash-text placeholder-dash-text-muted focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none text-sm text-center tracking-[0.3em] font-mono"
            />
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="text-[10px] uppercase tracking-[0.12em] font-semibold bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              {verifying ? '...' : 'Verify'}
            </button>
          </div>
          <button
            onClick={handleSendCode}
            disabled={cooldown > 0 || sending}
            className="text-[10px] text-dash-text-secondary hover:text-dash-text transition-colors disabled:opacity-50"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { member, refresh } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [phoneChanged, setPhoneChanged] = useState(false);
  const [form, setForm] = useState({
    first_name: member?.first_name || '',
    last_name: member?.last_name || '',
    phone: member?.phone || '',
    class_year: member?.class_year || '',
    major: member?.major || '',
    instagram: member?.instagram || '',
    discord_id: member?.discord_id || '',
  });

  const handlePhoneChange = (value: string) => {
    setForm({ ...form, phone: value });
    if (value !== (member?.phone || '')) {
      setPhoneChanged(true);
    } else {
      setPhoneChanged(false);
    }
  };

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
        setPhoneChanged(form.phone !== (member?.phone || ''));
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

  const isPhoneVerified = member?.phone_verified && !phoneChanged;

  const inputClass = 'w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text placeholder-dash-text-muted focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all text-sm';

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-dash-text">Settings</h1>
        <p className="text-sm text-dash-text-secondary mt-1">Manage your profile information</p>
      </div>

      <div className="max-w-lg">
        {/* Avatar */}
        <div className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6">
          <div className="flex items-center gap-4">
            {member?.avatar_url ? (
              <img src={member.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-dash-badge-bg flex items-center justify-center text-dash-text-secondary text-lg font-semibold">
                {member?.first_name?.[0]}{member?.last_name?.[0]}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-dash-text mb-1">Profile Photo</p>
              <label className="cursor-pointer text-[11px] uppercase tracking-[0.15em] font-semibold text-dash-text-secondary hover:text-dash-text transition-colors">
                {uploading ? 'Uploading...' : 'Change Photo'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append('file', file);
                      const res = await fetch('/api/members/avatar', {
                        method: 'POST',
                        credentials: 'include',
                        body: fd,
                      });
                      if (res.ok) {
                        await refresh();
                        setMessage('Avatar updated.');
                      } else {
                        const data = await res.json();
                        setMessage(data.error || 'Failed to upload avatar.');
                      }
                    } catch {
                      setMessage('Upload failed.');
                    } finally {
                      setUploading(false);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-dash-card rounded-xl border border-dash-border p-6 space-y-4">
          {message && (
            <div className={`p-3 rounded-lg text-xs text-center ${message.includes('success') ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">First Name</label>
              <input type="text" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Last Name</label>
              <input type="text" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Email</label>
            <input type="email" value={member?.email || ''} disabled className="w-full px-3 py-2.5 bg-dash-bg border border-dash-border rounded-lg text-dash-text-secondary text-sm cursor-not-allowed" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <label className="block text-[10px] text-dash-text-muted uppercase tracking-wider">Phone</label>
              {member?.phone && (
                isPhoneVerified ? (
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
                    Verified
                  </span>
                ) : (
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full">
                    Not Verified
                  </span>
                )
              )}
            </div>
            <input type="tel" value={form.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="(123) 456-7890" className={inputClass} />
            {member?.phone && !isPhoneVerified && form.phone && (
              <PhoneVerifyInline
                phone={form.phone}
                onVerified={async () => {
                  setPhoneChanged(false);
                  setMessage('Phone verified successfully.');
                  await refresh();
                }}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Class Year</label>
              <input type="text" value={form.class_year} onChange={e => setForm({ ...form, class_year: e.target.value })} placeholder="2026" className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Major</label>
              <input type="text" value={form.major} onChange={e => setForm({ ...form, major: e.target.value })} placeholder="Computer Science" className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Instagram</label>
              <input type="text" value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="@username" className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Discord ID</label>
              <input type="text" value={form.discord_id} onChange={e => setForm({ ...form, discord_id: e.target.value })} placeholder="User ID" className={inputClass} />
            </div>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={saving} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Notifications */}
        <PushNotificationSettings />

        {/* Account info */}
        <div className="mt-6 bg-dash-card rounded-xl border border-dash-border p-6">
          <h2 className="text-sm font-medium text-dash-text mb-3">Account Information</h2>
          <div className="space-y-2 text-xs text-dash-text-secondary">
            <p>Role: <span className="text-dash-text font-medium capitalize">{member?.role}</span></p>
            <p>Member since: <span className="text-dash-text">{member?.created_at ? new Date(member.created_at + 'Z').toLocaleDateString() : '-'}</span></p>
            <p>Last login: <span className="text-dash-text">{member?.last_login_at ? new Date(member.last_login_at + 'Z').toLocaleDateString() : '-'}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

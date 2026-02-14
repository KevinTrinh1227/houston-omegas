'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isPushSupported, isPushSubscribed, subscribeToPush, unsubscribeFromPush } from '@/lib/push';
import { getDeviceInfo, type DeviceInfo } from '@/lib/pwa';
import { Smartphone, Monitor, Tablet, Info, User } from 'lucide-react';

interface Passkey {
  id: string;
  name: string;
  device_type: string;
  backed_up: boolean;
  created_at: string;
  last_used_at: string | null;
}

function PasskeySettings() {
  const [supported, setSupported] = useState(false);
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' &&
      window.PublicKeyCredential !== undefined &&
      typeof window.PublicKeyCredential === 'function'
    );
  }, []);

  const fetchPasskeys = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/passkey/list', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setPasskeys(data.passkeys || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supported) {
      fetchPasskeys();
    } else {
      setLoading(false);
    }
  }, [supported, fetchPasskeys]);

  const handleRegister = async () => {
    setRegistering(true);
    setError('');
    setSuccess('');

    try {
      // Get registration options
      const optionsRes = await fetch('/api/auth/passkey/register-options', {
        method: 'POST',
        credentials: 'include',
      });

      if (!optionsRes.ok) {
        const data = await optionsRes.json();
        setError(data.error || 'Failed to start registration.');
        return;
      }

      const options = await optionsRes.json();

      // Import SimpleWebAuthn
      const { startRegistration } = await import('@simplewebauthn/browser');

      // Trigger browser passkey UI
      const credential = await startRegistration({ optionsJSON: options });

      // Verify with server
      const verifyRes = await fetch('/api/auth/passkey/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credential),
      });

      if (verifyRes.ok) {
        setSuccess('Passkey added successfully!');
        fetchPasskeys();
      } else {
        const data = await verifyRes.json();
        setError(data.error || 'Failed to register passkey.');
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'NotAllowedError') {
        // User cancelled
      } else {
        setError('Failed to add passkey. Try again.');
      }
    } finally {
      setRegistering(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this passkey? You will not be able to use it to sign in.')) return;

    setDeleting(id);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/auth/passkey/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        setSuccess('Passkey removed.');
        setPasskeys(passkeys.filter(p => p.id !== id));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to remove passkey.');
      }
    } catch {
      setError('Failed to remove passkey.');
    } finally {
      setDeleting(null);
    }
  };

  if (!supported) {
    return (
      <div className="mt-6 bg-dash-card rounded-xl border border-dash-border p-6">
        <h2 className="text-sm font-medium text-dash-text mb-3">Passkeys &amp; Biometric Login</h2>
        <p className="text-xs text-dash-text-secondary">
          Passkeys are not supported in this browser. Try using Safari, Chrome, or Edge.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-dash-card rounded-xl border border-dash-border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-medium text-dash-text">Passkeys &amp; Biometric Login</h2>
          <p className="text-[11px] text-dash-text-muted mt-0.5">Use Face ID, Touch ID, or Windows Hello to sign in</p>
        </div>
        <button
          onClick={handleRegister}
          disabled={registering}
          className="text-[10px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          {registering ? 'Adding...' : 'Add Passkey'}
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2.5 rounded-lg text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 p-2.5 rounded-lg text-xs text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-dash-border border-t-dash-text rounded-full animate-spin" />
        </div>
      ) : passkeys.length === 0 ? (
        <div className="text-center py-4 text-xs text-dash-text-secondary">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-dash-text-muted">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
          <p>No passkeys registered</p>
          <p className="text-[10px] mt-1">Add a passkey to enable Face ID, Touch ID, or fingerprint login</p>
        </div>
      ) : (
        <div className="space-y-2">
          {passkeys.map((passkey) => (
            <div key={passkey.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-dash-bg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-dash-badge-bg flex items-center justify-center">
                  {passkey.device_type === 'singleDevice' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-dash-text-muted">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                      <line x1="12" y1="18" x2="12.01" y2="18"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-dash-text-muted">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-xs text-dash-text font-medium">{passkey.name}</p>
                  <p className="text-[10px] text-dash-text-muted">
                    Added {new Date(passkey.created_at).toLocaleDateString()}
                    {passkey.last_used_at && ` · Last used ${new Date(passkey.last_used_at).toLocaleDateString()}`}
                    {passkey.backed_up && ' · Synced'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(passkey.id)}
                disabled={deleting === passkey.id}
                className="text-[10px] text-red-500 hover:text-red-600 font-medium disabled:opacity-50 px-2 py-1"
              >
                {deleting === passkey.id ? '...' : 'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

export default function SettingsPage() {
  const { member, refresh } = useAuth();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
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
            <label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Phone</label>
            <input type="tel" value={form.phone} onChange={e => handlePhoneChange(e.target.value)} placeholder="(123) 456-7890" className={inputClass} />
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

        {/* Passkeys */}
        <PasskeySettings />

        {/* Notifications */}
        <PushNotificationSettings />

        {/* Account info */}
        <div className="mt-6 bg-dash-card rounded-xl border border-dash-border p-6">
          <div className="flex items-center gap-2 mb-3">
            <User size={16} className="text-dash-text-muted" />
            <h2 className="text-sm font-medium text-dash-text">Account Information</h2>
          </div>
          <div className="space-y-2 text-xs text-dash-text-secondary">
            <p>Role: <span className="text-dash-text font-medium capitalize">{member?.role}</span></p>
            <p>Member since: <span className="text-dash-text">{member?.created_at ? new Date(member.created_at + 'Z').toLocaleDateString() : '-'}</span></p>
            <p>Last login: <span className="text-dash-text">{member?.last_login_at ? new Date(member.last_login_at + 'Z').toLocaleDateString() : '-'}</span></p>
          </div>
        </div>

        {/* Device Info */}
        <DeviceInfoSection />

        {/* About */}
        <div className="mt-6 bg-dash-card rounded-xl border border-dash-border p-6">
          <div className="flex items-center gap-2 mb-3">
            <Info size={16} className="text-dash-text-muted" />
            <h2 className="text-sm font-medium text-dash-text">About</h2>
          </div>
          <div className="space-y-2 text-xs text-dash-text-secondary">
            <p>Version: <span className="text-dash-text font-medium">2.0.0</span></p>
            <p>Last updated: <span className="text-dash-text">February 2026</span></p>
            <div className="pt-2 flex gap-3">
              <a href="https://github.com/KevinTrinh1227/houston-omegas" target="_blank" rel="noopener noreferrer" className="text-dash-text-muted hover:text-dash-text transition-colors underline">
                GitHub
              </a>
              <a href="/dashboard/changelog" className="text-dash-text-muted hover:text-dash-text transition-colors underline">
                Changelog
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeviceInfoSection() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    setDeviceInfo(getDeviceInfo());
    const handleResize = () => setDeviceInfo(getDeviceInfo());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!deviceInfo) return null;

  const DeviceIcon = deviceInfo.platform === 'ios' || deviceInfo.platform === 'android'
    ? Smartphone
    : deviceInfo.screenWidth < 1024 ? Tablet : Monitor;

  return (
    <div className="mt-6 bg-dash-card rounded-xl border border-dash-border p-6">
      <div className="flex items-center gap-2 mb-3">
        <DeviceIcon size={16} className="text-dash-text-muted" />
        <h2 className="text-sm font-medium text-dash-text">Device Information</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">PWA Status</p>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${deviceInfo.isPWA ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-xs text-dash-text font-medium">
              {deviceInfo.isPWA ? 'Installed' : 'Browser'}
            </span>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Platform</p>
          <p className="text-xs text-dash-text font-medium capitalize">{deviceInfo.platform}</p>
        </div>
        <div>
          <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Browser</p>
          <p className="text-xs text-dash-text font-medium capitalize">{deviceInfo.browser}</p>
        </div>
        <div>
          <p className="text-[10px] text-dash-text-muted uppercase tracking-wider mb-1">Screen Size</p>
          <p className="text-xs text-dash-text font-medium">{deviceInfo.screenWidth} x {deviceInfo.screenHeight}</p>
        </div>
      </div>
      {!deviceInfo.isPWA && deviceInfo.platform !== 'desktop' && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-400">
            <strong>Tip:</strong> Add to Home Screen for the best app-like experience with push notifications and offline support.
          </p>
        </div>
      )}
    </div>
  );
}

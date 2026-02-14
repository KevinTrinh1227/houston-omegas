'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const TOTAL_STEPS = 2;

const INPUT_CLASS =
  'w-full px-4 py-3.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-gray-300 outline-none transition-all';

const PRIMARY_BTN =
  'bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 min-h-[48px]';

const SECONDARY_BTN =
  'text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all min-h-[48px]';

interface MemberData {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  phone: string | null;
  instagram: string | null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const [member, setMember] = useState<MemberData | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch member data on mount
  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) {
          router.replace('/login');
          return;
        }
        const data = await res.json();

        // If already completed onboarding, redirect to dashboard
        if (!data.needs_onboarding) {
          router.replace('/dashboard');
          return;
        }

        setMember(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setAvatarUrl(data.avatar_url || null);
        setAvatarPreview(data.avatar_url || null);
        setPhone(data.phone || '');
        setInstagram(data.instagram || '');
      } catch {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [router]);

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    setErr('');

    // Preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/members/avatar', {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        setAvatarUrl(data.avatar_url);
        setAvatarPreview(data.avatar_url);
      } else {
        const data = await res.json();
        setErr(data.error || 'Failed to upload photo.');
        setAvatarPreview(avatarUrl);
      }
    } catch {
      setErr('Upload failed.');
      setAvatarPreview(avatarUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    setErr('');
    if (step === 1 && !firstName.trim()) {
      setErr('Please enter your first name.');
      return;
    }
    setStep(2);
  };

  const handleFinish = async () => {
    setSaving(true);
    setErr('');

    try {
      const res = await fetch(`/api/members/${member?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim() || undefined,
          instagram: instagram.trim() || undefined,
          has_completed_onboarding: true,
        }),
      });

      if (res.ok) {
        router.replace('/dashboard');
      } else {
        const data = await res.json();
        setErr(data.error || 'Failed to save profile.');
      }
    } catch {
      setErr('Connection error.');
    } finally {
      setSaving(false);
    }
  };

  const initials = `${firstName?.[0] || '?'}${lastName?.[0] || ''}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  const ProgressDots = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all ${
            i < step ? 'bg-gray-900' : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Image src="/images/omega-logo.jpg" alt="Houston Omegas" width={48} height={48} className="rounded-full" />
        </div>

        <ProgressDots />

        {step === 1 && (
          <div>
            <h1 className="text-center text-xl mb-1 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              Welcome, {firstName || 'Brother'}!
            </h1>
            <p className="text-center text-gray-400 text-xs mb-8">
              Let&apos;s confirm your profile
            </p>

            {err && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">
                {err}
              </div>
            )}

            {/* Photo upload */}
            <div className="flex justify-center mb-6">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative group"
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 group-hover:border-gray-400 transition-colors"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-3xl font-semibold text-gray-400 group-hover:border-gray-400 transition-colors">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                {uploading && (
                  <div className="absolute inset-0 rounded-full bg-white/80 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                  e.target.value = '';
                }}
              />
            </div>
            <p className="text-center text-gray-400 text-[11px] mb-6">Tap to add a photo (optional)</p>

            {/* Name fields */}
            <div className="space-y-3 mb-6">
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First name"
                className={INPUT_CLASS}
                style={{ fontSize: '16px' }}
              />
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last name"
                className={INPUT_CLASS}
                style={{ fontSize: '16px' }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleNext}
                className={`flex-1 ${PRIMARY_BTN}`}
              >
                Continue
              </button>
            </div>

            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full mt-3 text-gray-400 text-[11px] py-2 hover:text-gray-600 transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-center text-xl mb-1 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              Stay Connected
            </h1>
            <p className="text-center text-gray-400 text-xs mb-8">
              Optional contact info for your brothers
            </p>

            {err && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">
                {err}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">Phone (for chapter updates)</label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(123) 456-7890"
                  className={INPUT_CLASS}
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1.5 uppercase tracking-wider">Instagram (optional)</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  placeholder="@yourhandle"
                  className={INPUT_CLASS}
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setErr(''); setStep(1); }}
                className={SECONDARY_BTN}
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={saving}
                className={`flex-1 ${PRIMARY_BTN}`}
              >
                {saving ? 'Saving...' : 'Enter Dashboard'}
              </button>
            </div>

            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full mt-3 text-gray-400 text-[11px] py-2 hover:text-gray-600 transition-colors"
            >
              Skip for now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

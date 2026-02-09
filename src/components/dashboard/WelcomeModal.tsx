'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Calendar, Star, FolderOpen, BookOpen, Bell, Check, Share } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/roles';

const TOTAL_STEPS = 5;

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text placeholder-dash-text-muted focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 outline-none transition-all text-sm';

const PRIMARY_BTN =
  'bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50';

const SECONDARY_BTN =
  'text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg border border-dash-border hover:border-dash-text-muted transition-all';

const FEATURES = [
  {
    icon: Calendar,
    title: 'Events',
    description: 'View upcoming events and track attendance',
  },
  {
    icon: Star,
    title: 'Points',
    description: 'Earn points for participation and engagement',
  },
  {
    icon: FolderOpen,
    title: 'Files',
    description: 'Access shared media and documents',
  },
  {
    icon: BookOpen,
    title: 'Wiki',
    description: 'Read chapter guides and resources',
  },
];

export default function WelcomeModal() {
  const { member, refresh } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const [phone, setPhone] = useState(member?.phone ?? '');
  const [major, setMajor] = useState(member?.major ?? '');
  const [classYear, setClassYear] = useState(member?.class_year ?? '');
  const [instagram, setInstagram] = useState(member?.instagram ?? '');
  const [discordId, setDiscordId] = useState(member?.discord_id ?? '');
  const [avatarUrl, setAvatarUrl] = useState(member?.avatar_url ?? '');

  if (!member) return null;

  const roleLabel = ROLE_LABELS[member.role] ?? member.role;
  const roleColor = ROLE_COLORS[member.role] ?? 'bg-dash-badge-bg text-dash-text-secondary';
  const initials = `${member.first_name[0]}${member.last_name[0]}`;

  const handleFinish = async () => {
    setSaving(true);
    setErr('');
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          major: major || undefined,
          class_year: classYear || undefined,
          instagram: instagram || undefined,
          discord_id: discordId || undefined,
          avatar_url: avatarUrl || undefined,
          has_completed_onboarding: true,
        }),
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

  const ProgressBar = () => (
    <div className="flex items-center justify-center gap-2 px-8 pt-6 pb-2">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-all ${
            i < step ? 'bg-dash-text' : 'bg-dash-border'
          }`}
        />
      ))}
    </div>
  );

  const Step1 = () => (
    <div className="px-8 pb-8 pt-4">
      <div className="text-center mb-6">
        <div className="mx-auto mb-4 w-16 h-16 relative">
          <Image src="/images/omega-logo.jpg" alt="Logo" width={64} height={64} className="rounded-full" />
        </div>
        <h2 className="text-xl font-semibold text-dash-text mb-1" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Welcome to Houston Omegas
        </h2>
        <p className="text-sm text-dash-text-secondary">
          Welcome, {member.first_name}! You&apos;ve been invited to the brotherhood dashboard.
        </p>
      </div>
      <div className="flex justify-center mb-5">
        <span className={`inline-block text-[11px] uppercase tracking-[0.1em] font-semibold px-3 py-1 rounded-full ${roleColor}`}>
          {roleLabel}
        </span>
      </div>
      <div className="bg-dash-bg rounded-lg p-4 mb-6">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-dash-text-muted uppercase tracking-wider">Email</span>
            <span className="text-dash-text">{member.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dash-text-muted uppercase tracking-wider">Role</span>
            <span className="text-dash-text">{roleLabel}</span>
          </div>
        </div>
      </div>
      <button onClick={() => setStep(2)} className={`w-full ${PRIMARY_BTN}`}>Get Started</button>
    </div>
  );

  const Step2 = () => {
    const [verifyPhase, setVerifyPhase] = useState<'input' | 'code' | 'verified'>(
      member.phone_verified ? 'verified' : 'input'
    );
    const [smsCode, setSmsCode] = useState('');
    const [sendingCode, setSendingCode] = useState(false);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [localErr, setLocalErr] = useState('');

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
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length < 10) {
        setLocalErr('Please enter a valid 10-digit phone number.');
        return;
      }
      setSendingCode(true);
      setLocalErr('');
      try {
        const res = await fetch('/api/phone/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phone }),
        });
        const data = await res.json();
        if (res.ok) {
          setVerifyPhase('code');
          setSmsCode('');
          startCooldown();
        } else {
          setLocalErr(data.error || 'Failed to send code.');
        }
      } catch {
        setLocalErr('Connection error.');
      } finally {
        setSendingCode(false);
      }
    };

    const handleVerifyCode = async () => {
      const cleaned = smsCode.replace(/\D/g, '');
      if (cleaned.length !== 6) {
        setLocalErr('Please enter the 6-digit code.');
        return;
      }
      setVerifyingCode(true);
      setLocalErr('');
      try {
        const res = await fetch('/api/phone/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phone, code: cleaned }),
        });
        const data = await res.json();
        if (res.ok) {
          setVerifyPhase('verified');
          await refresh();
        } else {
          setLocalErr(data.error || 'Verification failed.');
        }
      } catch {
        setLocalErr('Connection error.');
      } finally {
        setVerifyingCode(false);
      }
    };

    const handleResend = async () => {
      if (cooldown > 0) return;
      setSendingCode(true);
      setLocalErr('');
      try {
        const res = await fetch('/api/phone/send-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phone }),
        });
        const data = await res.json();
        if (res.ok) {
          startCooldown();
          setSmsCode('');
        } else {
          setLocalErr(data.error || 'Failed to resend.');
        }
      } catch {
        setLocalErr('Connection error.');
      } finally {
        setSendingCode(false);
      }
    };

    return (
      <div className="px-8 pb-8 pt-4">
        <h2 className="text-lg font-semibold text-dash-text mb-1">Complete Your Profile</h2>
        <p className="text-sm text-dash-text-secondary mb-5">Help your brothers know more about you.</p>
        {(localErr || err) && (
          <div className="mb-3 p-2.5 rounded-lg text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
            {localErr || err}
          </div>
        )}
        <div className="space-y-3 mb-6">
          {/* Phone with inline verification */}
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-dash-text-muted mb-1">
              Phone <span className="text-red-400">*</span>
            </label>
            {verifyPhase === 'verified' ? (
              <div className="flex items-center gap-2">
                <input type="tel" value={phone} disabled className="flex-1 px-3 py-2.5 bg-dash-bg border border-dash-border rounded-lg text-dash-text text-sm cursor-not-allowed" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full whitespace-nowrap">
                  Verified
                </span>
              </div>
            ) : verifyPhase === 'code' ? (
              <div className="space-y-2">
                <p className="text-[11px] text-dash-text-secondary">Code sent to {phone}</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={smsCode}
                  onChange={e => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  autoFocus
                  className="w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text placeholder-dash-text-muted focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all text-sm text-center tracking-[0.3em] font-mono"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleVerifyCode}
                    disabled={verifyingCode}
                    className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] uppercase tracking-[0.12em] font-semibold px-3 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
                  >
                    {verifyingCode ? 'Verifying...' : 'Verify'}
                  </button>
                  <button
                    onClick={() => { setVerifyPhase('input'); setLocalErr(''); setSmsCode(''); }}
                    className="text-[10px] text-dash-text-secondary hover:text-dash-text px-2 transition-colors"
                  >
                    Change
                  </button>
                  <button
                    onClick={handleResend}
                    disabled={cooldown > 0 || sendingCode}
                    className="text-[10px] text-dash-text-secondary hover:text-dash-text px-2 transition-colors disabled:opacity-50"
                  >
                    {cooldown > 0 ? `${cooldown}s` : 'Resend'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(123) 456-7890"
                  className={`flex-1 ${INPUT_CLASS}`}
                />
                <button
                  onClick={handleSendCode}
                  disabled={sendingCode}
                  className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] uppercase tracking-[0.12em] font-semibold px-3 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 whitespace-nowrap"
                >
                  {sendingCode ? 'Sending...' : 'Verify'}
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-dash-text-muted mb-1">Major</label>
            <input type="text" value={major} onChange={(e) => setMajor(e.target.value)} placeholder="e.g. Computer Science" className={INPUT_CLASS} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-dash-text-muted mb-1">Class Year</label>
            <input type="text" value={classYear} onChange={(e) => setClassYear(e.target.value)} placeholder="e.g. Spring 2025" className={INPUT_CLASS} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-dash-text-muted mb-1">Instagram</label>
            <input type="text" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@handle" className={INPUT_CLASS} />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-dash-text-muted mb-1">Discord ID</label>
            <input type="text" value={discordId} onChange={(e) => setDiscordId(e.target.value)} placeholder="username#1234" className={INPUT_CLASS} />
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={() => { setErr(''); setStep(1); }} className={SECONDARY_BTN}>Back</button>
          <button
            type="button"
            onClick={() => {
              if (verifyPhase !== 'verified') {
                setLocalErr('Please verify your phone number to continue.');
                return;
              }
              setErr('');
              setStep(3);
            }}
            className={`flex-1 ${PRIMARY_BTN}`}
          >
            Continue
          </button>
        </div>
      </div>
    );
  };

  const Step3 = () => (
    <div className="px-8 pb-8 pt-4">
      <h2 className="text-lg font-semibold text-dash-text mb-1">Add a Profile Photo</h2>
      <p className="text-sm text-dash-text-secondary mb-5">Optional &mdash; help brothers recognize you.</p>
      <div className="flex justify-center mb-5">
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar preview" className="w-20 h-20 rounded-full object-cover border-2 border-dash-border" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-dash-badge-bg flex items-center justify-center text-2xl font-semibold text-dash-text-muted border-2 border-dash-border">
            {initials}
          </div>
        )}
      </div>
      <div className="mb-6">
        <label className="block text-[11px] uppercase tracking-wider text-dash-text-muted mb-1">Avatar URL</label>
        <input type="text" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className={INPUT_CLASS} />
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={() => setStep(2)} className={SECONDARY_BTN}>Back</button>
        <button type="button" onClick={() => { setAvatarUrl(''); setStep(4); }} className={SECONDARY_BTN}>Skip</button>
        <button type="button" onClick={() => setStep(4)} className={`flex-1 ${PRIMARY_BTN}`}>Next</button>
      </div>
    </div>
  );

  const Step4 = () => {
    const [pushState, setPushState] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported'>('idle');
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isPWA = typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as unknown as { standalone?: boolean }).standalone === true);
    const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

    const handleEnable = async () => {
      setPushState('requesting');
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const { subscribeToPush } = await import('@/lib/push');
          const success = await subscribeToPush();
          if (success) {
            setPushState('granted');
            setTimeout(() => setStep(5), 1200);
          } else {
            setPushState('denied');
          }
        } else {
          setPushState('denied');
        }
      } catch {
        setPushState('denied');
      }
    };

    return (
      <div className="px-8 pb-8 pt-4">
        <div className="text-center mb-5">
          <div className="mx-auto w-12 h-12 rounded-full bg-dash-bg flex items-center justify-center mb-3">
            <Bell className="w-6 h-6 text-dash-text" />
          </div>
          <h2 className="text-lg font-semibold text-dash-text mb-1">Stay in the Loop</h2>
          <p className="text-sm text-dash-text-secondary">Get notified about events, announcements, and updates.</p>
        </div>

        {(!supported || (isIOS && !isPWA)) ? (
          <>
            {isIOS && !isPWA ? (
              <div className="bg-dash-bg rounded-lg p-4 mb-5 text-xs text-dash-text-secondary space-y-2">
                <p className="font-medium text-dash-text">iPhone requires an extra step:</p>
                <ol className="space-y-1 ml-3 list-decimal">
                  <li>Tap the <Share className="w-3.5 h-3.5 inline -mt-0.5" /> Share button in Safari</li>
                  <li>Tap &quot;Add to Home Screen&quot;</li>
                  <li>Open the app from your home screen</li>
                  <li>Enable notifications in Settings</li>
                </ol>
              </div>
            ) : (
              <p className="text-sm text-dash-text-secondary text-center mb-5">
                Your browser doesn&apos;t support push notifications. You can still check the dashboard for updates.
              </p>
            )}
            <button onClick={() => setStep(5)} className={`w-full ${PRIMARY_BTN}`}>Continue</button>
          </>
        ) : pushState === 'idle' ? (
          <>
            <div className="bg-dash-bg rounded-lg p-4 mb-5 text-xs text-dash-text-secondary space-y-1.5">
              <p>You&apos;ll receive notifications for:</p>
              <ul className="space-y-1 ml-3">
                <li>&bull; New announcements from exec</li>
                <li>&bull; Event reminders</li>
                <li>&bull; Important chapter updates</li>
              </ul>
            </div>
            <button onClick={handleEnable} className={`w-full ${PRIMARY_BTN}`}>Enable Notifications</button>
            <button onClick={() => setStep(5)} className="w-full mt-2 text-dash-text-muted text-[11px] py-2 hover:text-dash-text transition-colors">
              Skip for now
            </button>
          </>
        ) : pushState === 'requesting' ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin" />
          </div>
        ) : pushState === 'granted' ? (
          <div className="text-center py-4">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-dash-text">Notifications enabled!</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-dash-text-secondary text-center mb-5">
              No worries! You can enable notifications later in Settings.
            </p>
            <button onClick={() => setStep(5)} className={`w-full ${PRIMARY_BTN}`}>Continue</button>
          </>
        )}

        <div className="mt-3">
          <button type="button" onClick={() => setStep(3)} className={SECONDARY_BTN}>Back</button>
        </div>
      </div>
    );
  };

  const Step5 = () => (
    <div className="px-8 pb-8 pt-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-dash-text mb-1">You&apos;re All Set!</h2>
        <p className="text-sm text-dash-text-secondary">Here&apos;s what you can do on the dashboard.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="bg-dash-bg rounded-lg p-4 text-center">
            <Icon className="w-5 h-5 text-dash-text-muted mx-auto mb-2" />
            <p className="text-sm font-semibold text-dash-text mb-0.5">{title}</p>
            <p className="text-[11px] text-dash-text-secondary leading-tight">{description}</p>
          </div>
        ))}
      </div>
      {err && <div className="mb-3 p-2.5 rounded-lg text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">{err}</div>}
      <button onClick={handleFinish} disabled={saving} className={`w-full ${PRIMARY_BTN}`}>
        {saving ? 'Saving...' : 'Enter Dashboard'}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-dash-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-dash-border">
        <ProgressBar />
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
        {step === 5 && <Step5 />}
      </div>
    </div>
  );
}

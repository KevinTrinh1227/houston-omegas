'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const ERROR_MESSAGES: Record<string, string> = {
  not_registered: 'This email is not registered. Contact an exec board member for access.',
  oauth_denied: 'Sign in was cancelled. Please try again.',
  invalid_state: 'Security check failed. Please try again.',
  token_exchange_failed: 'Authentication failed. Please try again.',
  user_info_failed: 'Could not retrieve your account info. Please try again.',
  no_email: 'No email was found on your account. Please use an account with a verified email.',
  account_inactive: 'Your account has been deactivated. Contact an exec board member.',
};

function PhoneLogin() {
  const [phase, setPhase] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
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
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setErr('Please enter a valid 10-digit phone number.');
      return;
    }
    setSending(true);
    setErr('');
    try {
      const res = await fetch('/api/auth/login/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setErr('Please enter the 6-digit code.');
      return;
    }
    setVerifying(true);
    setErr('');
    try {
      const res = await fetch('/api/auth/login/phone-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, code: cleaned }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        setErr(data.error || 'Verification failed.');
      }
    } catch {
      setErr('Connection error.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setSending(true);
    setErr('');
    try {
      const res = await fetch('/api/auth/login/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        startCooldown();
        setCode('');
      } else {
        setErr(data.error || 'Failed to resend.');
      }
    } catch {
      setErr('Connection error.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      {err && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">
          {err}
        </div>
      )}

      {phase === 'phone' ? (
        <div className="space-y-3">
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="(123) 456-7890"
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-gray-300 outline-none transition-all"
          />
          <button
            onClick={handleSendCode}
            disabled={sending}
            className="flex items-center justify-center gap-3 w-full px-4 py-3.5 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all text-sm font-medium text-white disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
            </svg>
            {sending ? 'Sending...' : 'Continue with Phone'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-gray-400 text-xs text-center">Code sent to {phone}</p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            autoFocus
            className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-gray-300 outline-none transition-all text-center tracking-[0.3em] font-mono"
          />
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full px-4 py-3.5 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all text-sm font-medium text-white disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'Verify & Sign In'}
          </button>
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setPhase('phone'); setErr(''); setCode(''); }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Change number
            </button>
            <button
              onClick={handleResend}
              disabled={cooldown > 0 || sending}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LoginContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState('');
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    const errorCode = searchParams.get('error');
    if (errorCode) {
      setError(ERROR_MESSAGES[errorCode] || 'Something went wrong. Please try again.');
    }
  }, [searchParams]);

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-center mb-8">
        <Image src="/images/omega-logo.jpg" alt="Houston Omegas" width={48} height={48} className="rounded-full" />
      </div>

      <h1 className="text-center text-2xl mb-2 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
        Member Login
      </h1>
      <p className="text-center text-gray-400 text-xs uppercase tracking-wider mb-10">Members &amp; Alumni Only</p>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs text-center">
          {error}
        </div>
      )}

      {showPhone ? (
        <>
          <PhoneLogin />
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-gray-300 text-[10px] uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="mt-5 space-y-3">
            <a
              href="/api/auth/login/google"
              className="flex items-center justify-center gap-3 w-full px-4 py-3.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>
            <a
              href="/api/auth/login/discord"
              className="flex items-center justify-center gap-3 w-full px-4 py-3.5 bg-[#5865F2] border border-[#5865F2] rounded-lg hover:bg-[#4752C4] transition-all text-sm font-medium text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
              </svg>
              Continue with Discord
            </a>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3">
            <a
              href="/api/auth/login/google"
              className="flex items-center justify-center gap-3 w-full px-4 py-3.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </a>

            <a
              href="/api/auth/login/discord"
              className="flex items-center justify-center gap-3 w-full px-4 py-3.5 bg-[#5865F2] border border-[#5865F2] rounded-lg hover:bg-[#4752C4] transition-all text-sm font-medium text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
              </svg>
              Continue with Discord
            </a>

            <button
              onClick={() => setShowPhone(true)}
              className="flex items-center justify-center gap-3 w-full px-4 py-3.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              Continue with Phone
            </button>
          </div>
        </>
      )}

      <p className="mt-8 text-center text-gray-400 text-[11px] leading-relaxed">
        Only registered members can sign in.<br />
        Contact an exec board member for access.
      </p>

      <div className="mt-10 text-center">
        <Link href="/" className="text-gray-300 hover:text-gray-500 text-[11px] uppercase tracking-[0.2em] transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative bg-white text-gray-900 min-h-screen flex items-center justify-center px-6">
      <Suspense fallback={<div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />}>
        <LoginContent />
      </Suspense>
    </div>
  );
}

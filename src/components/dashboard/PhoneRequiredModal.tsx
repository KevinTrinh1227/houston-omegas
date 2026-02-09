'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthProvider';

export default function PhoneRequiredModal() {
  const { member, refresh } = useAuth();
  const [phase, setPhase] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState(member?.phone || '');
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

  if (!member || (member.phone && member.phone_verified)) return null;

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
      setErr('Please enter the 6-digit code.');
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
        await refresh();
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
      const res = await fetch('/api/phone/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-dash-card border border-dash-border rounded-xl shadow-xl max-w-sm w-full p-6">
        <h2 className="text-lg font-semibold text-dash-text mb-1">Verify Your Phone</h2>
        <p className="text-sm text-dash-text-secondary mb-5">
          {phase === 'phone'
            ? 'A verified phone number is required to use the dashboard.'
            : `Enter the 6-digit code sent to ${phone}.`}
        </p>

        {err && (
          <div className="mb-3 p-2.5 rounded-lg text-xs text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800">
            {err}
          </div>
        )}

        {phase === 'phone' ? (
          <>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="(123) 456-7890"
              required
              className="w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text placeholder-dash-text-muted focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all text-sm mb-4"
            />
            <button
              onClick={handleSendCode}
              disabled={sending}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Verification Code'}
            </button>
          </>
        ) : (
          <>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              autoFocus
              className="w-full px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text placeholder-dash-text-muted focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 outline-none transition-all text-sm text-center tracking-[0.3em] font-mono mb-4"
            />
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 mb-3"
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </button>
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setPhase('phone'); setErr(''); setCode(''); }}
                className="text-[11px] text-dash-text-secondary hover:text-dash-text transition-colors"
              >
                Change number
              </button>
              <button
                onClick={handleResend}
                disabled={cooldown > 0 || sending}
                className="text-[11px] text-dash-text-secondary hover:text-dash-text transition-colors disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

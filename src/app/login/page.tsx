'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMessage, setShowMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowMessage(true);
  };

  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all text-sm';

  return (
    <div className="relative bg-white text-gray-900 min-h-screen">
      <Navbar variant="light" />

      <section className="pt-28 pb-20 px-6 sm:px-10 min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image src="/images/omega-logo.jpg" alt="Houston Omegas" width={48} height={48} className="rounded-full" />
          </div>

          <h1 className="text-center text-2xl mb-2 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
            Member Login
          </h1>
          <p className="text-center text-gray-400 text-xs uppercase tracking-wider mb-10">Members &amp; Alumni Only</p>

          {showMessage ? (
            <div className="text-center border border-gray-200 rounded-2xl p-8 bg-gray-50">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-gray-400 text-sm mb-6">Member portal is currently in development. Check back soon.</p>
              <button onClick={() => setShowMessage(false)} className="text-sm text-gray-500 hover:underline">Try again</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className={inputClass}
                />
              </div>
              <button type="submit" className="w-full bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold py-3.5 rounded-lg hover:bg-gray-800 transition-all">
                Sign In
              </button>
              <div className="text-center">
                <button type="button" className="text-gray-400 hover:text-gray-500 text-xs transition-colors">
                  Forgot password?
                </button>
              </div>
            </form>
          )}

          <div className="mt-10 text-center">
            <Link href="/" className="text-gray-300 hover:text-gray-500 text-[11px] uppercase tracking-[0.2em] transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageWrapper from '@/components/PageWrapper';

const subjects = ['General Inquiry', 'Event Booking', 'Sponsorship', 'Recruitment', 'Media / Press', 'Other'];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', subject: '', message: '', website: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website) return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, eventType: formData.subject, message: formData.message }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '', website: '' });
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputClass = 'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all text-sm';

  return (
    <PageWrapper>
      <Navbar variant="light" />

      <section className="pt-28 pb-20 px-6 sm:px-10 max-w-2xl mx-auto">
        <p className="text-center text-xs text-gray-400 uppercase tracking-[0.3em] mb-3">Get in Touch</p>
        <h1 className="text-center text-3xl sm:text-4xl mb-4 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Contact Us
        </h1>
        <p className="text-center text-gray-400 text-sm mb-12 max-w-md mx-auto">
          Have a question or want to work with us? Send us a message and we&apos;ll get back to you within 24 hours.
        </p>

        {status === 'success' ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Message Sent</h3>
            <p className="text-gray-400 text-sm">We&apos;ll get back to you within 24 hours.</p>
            <button onClick={() => setStatus('idle')} className="mt-6 text-sm text-gray-500 hover:underline">Send another message</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
              </div>
            )}

            {/* Honeypot */}
            <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Full name *" className={inputClass} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email *" className={inputClass} />
            </div>
            <select name="subject" value={formData.subject} onChange={handleChange} required className={`${inputClass} ${!formData.subject ? 'text-gray-400' : ''}`}>
              <option value="">Subject *</option>
              {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea name="message" value={formData.message} onChange={handleChange} required rows={6} placeholder="Your message *" className={`${inputClass} resize-none`} />
            <button type="submit" disabled={status === 'submitting'} className="w-full bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold py-3.5 rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {status === 'submitting' ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        )}
      </section>

      <Footer variant="light" />
    </PageWrapper>
  );
}

'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function useCountdown(targetTime: number) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTime]);

  return timeLeft;
}

const faqs = [
  { q: 'What is Houston Omegas?', a: 'A brotherhood rooted in honor, service, and cultural pride. Established in 2004, we are one of the most active fraternities in the Houston area.' },
  { q: 'Do I need to be Asian to join?', a: 'No. We are an Asian-interest fraternity that celebrates Asian culture, but membership is open to all backgrounds.' },
  { q: 'Is there a GPA requirement?', a: 'Yes. You must be in good academic standing with a minimum 2.5 cumulative GPA.' },
  { q: 'What is the time commitment?', a: 'Recruitment events are spread over a week. Each event is a few hours. There is no obligation to attend every event.' },
  { q: 'How much does it cost?', a: 'Recruitment is completely free. There is no cost to attend any recruitment event.' },
  { q: 'What happens after recruitment?', a: 'If it is a mutual fit, you may receive a bid to join. Details are discussed privately at that time.' },
];

const galleryImages = [
  { src: '/images/gallery-5.jpg', alt: 'Brotherhood' },
  { src: '/images/gallery-7.jpg', alt: 'Photoshoot' },
  { src: '/images/gallery-2.jpg', alt: 'UNITY Talent Show' },
  { src: '/images/gallery-1.jpg', alt: 'Dinner' },
  { src: '/images/gallery-3.jpg', alt: 'Beach Cleanup' },
  { src: '/images/gallery-6.jpg', alt: 'Korean Festival' },
];

export default function RecruitmentPage() {
  const rushTime = useMemo(() => new Date('2026-08-17T09:00:00').getTime(), []);
  const countdown = useCountdown(rushTime);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    classification: '',
    major: '',
    instagram: '',
    heardFrom: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const isFormValid =
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.phone.trim() !== '' &&
    formData.classification !== '' &&
    formData.instagram.trim() !== '' &&
    formData.heardFrom !== '' &&
    agreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ firstName: '', lastName: '', phone: '', classification: '', major: '', instagram: '', heardFrom: '' });
        setAgreed(false);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-gray-400 transition-colors';
  const labelClass = 'block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider';
  const selectClass = 'w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-gray-400 transition-colors appearance-none';

  return (
    <div className="relative bg-white text-gray-900 min-h-screen">
      <Navbar variant="light" />

      {/* Hero */}
      <section className="pt-28 pb-16 px-6 sm:px-10 max-w-3xl mx-auto text-center">
        <p className="text-xs text-gray-400 uppercase tracking-[0.3em] mb-3">Houston Omegas</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl text-gray-900 mb-4 tracking-[0.06em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          Fall 2026 Recruitment
        </h1>
        <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">Recruitment begins Monday, August 17th. Drop your info below to stay in the loop.</p>

        {/* Compact Countdown */}
        <div className="inline-flex items-center gap-4 sm:gap-6 bg-gray-50 border border-gray-200 rounded-xl px-6 py-3">
          {[
            { value: countdown.days, label: 'Days' },
            { value: countdown.hours, label: 'Hrs' },
            { value: countdown.minutes, label: 'Min' },
            { value: countdown.seconds, label: 'Sec' },
          ].map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <span className="text-gray-900 text-lg sm:text-xl font-light tabular-nums">{String(unit.value).padStart(2, '0')}</span>
                <span className="text-gray-400 text-[9px] uppercase tracking-wider block mt-0.5">{unit.label}</span>
              </div>
              {i < 3 && <span className="text-gray-300 text-xs">:</span>}
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gray-200 mx-10" />

      {/* What is Recruitment + About */}
      <section className="py-20 px-6 sm:px-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              What is Recruitment?
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Recruitment events are designed to help us get to know potential new members, and for you to learn what Houston Omegas is all about. Come out, meet the brothers, ask questions, and see if this is the right fit for you.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 text-center">
                <h3 className="text-gray-800 text-sm font-semibold mb-1">100% Free</h3>
                <p className="text-gray-400 text-xs leading-relaxed">No cost to attend any recruitment event.</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 text-center">
                <h3 className="text-gray-800 text-sm font-semibold mb-1">No Commitment</h3>
                <p className="text-gray-400 text-xs leading-relaxed">Zero pressure. Come check us out.</p>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              About Houston Omegas
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Houston Omegas is a brotherhood built on honor, service, and cultural pride. Established in 2004, we have grown into one of the most recognized and active fraternities in the Houston area.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our members are leaders, creatives, athletes, and scholars who come together to build lifelong bonds. From philanthropy and community service to social events and professional development, Houston Omegas offers an experience that extends well beyond college.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-200 mx-10" />

      {/* Gallery */}
      <section className="py-20 px-6 sm:px-10 max-w-6xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl text-gray-900 mb-10 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          The Brotherhood
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 auto-rows-[160px] md:auto-rows-[200px]">
          {galleryImages.map((img, i) => (
            <div key={i} className="relative overflow-hidden rounded-lg">
              <Image src={img.src} alt={img.alt} fill className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gray-200 mx-10" />

      {/* Interest Form + Info */}
      <section className="py-20 px-6 sm:px-10 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Info side */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl sm:text-3xl text-gray-900 mb-6 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
              Express Interest
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Fill out the form to let us know you are interested. We will reach out with more details as recruitment approaches.
            </p>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#B2BEB5] shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                <div>
                  <p className="font-semibold text-gray-800">When</p>
                  <p className="text-gray-500">Fall 2026, starting August 17th</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#B2BEB5] shrink-0 mt-0.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                <div>
                  <p className="font-semibold text-gray-800">Who</p>
                  <p className="text-gray-500">Open to all college students in Houston</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#B2BEB5] shrink-0 mt-0.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                <div>
                  <p className="font-semibold text-gray-800">Cost</p>
                  <p className="text-gray-500">Completely free to attend</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#B2BEB5] shrink-0 mt-0.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
                <div>
                  <p className="font-semibold text-gray-800">GPA</p>
                  <p className="text-gray-500">Minimum 2.5 cumulative GPA required</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form side */}
          <div className="lg:col-span-3">
            {status === 'success' ? (
              <div className="text-center border border-[#B2BEB5]/30 rounded-xl p-10 bg-[#B2BEB5]/5">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#B2BEB5" strokeWidth="1.5" className="mx-auto mb-4"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><path d="M22 4L12 14.01l-3-3" /></svg>
                <h3 className="text-gray-900 text-lg font-semibold mb-2">You&apos;re on the list</h3>
                <p className="text-gray-500 text-sm">We received your info and will be in touch before recruitment starts.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input type="text" required className={inputClass} placeholder="First" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input type="text" required className={inputClass} placeholder="Last" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Phone Number *</label>
                  <input type="tel" required className={inputClass} placeholder="(123) 456-7890" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Classification *</label>
                    <div className="relative">
                      <select required className={selectClass} value={formData.classification} onChange={(e) => setFormData({ ...formData, classification: e.target.value })}>
                        <option value="" disabled>Select</option>
                        <option value="Freshman">Freshman</option>
                        <option value="Sophomore">Sophomore</option>
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                      </select>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><path d="M6 9l6 6 6-6" /></svg>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Major <span className="text-gray-300">(optional)</span></label>
                    <input type="text" className={inputClass} placeholder="e.g. Business" value={formData.major} onChange={(e) => setFormData({ ...formData, major: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Instagram Handle *</label>
                  <input type="text" required className={inputClass} placeholder="@handle" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} />
                </div>

                <div>
                  <label className={labelClass}>How did you hear about us? *</label>
                  <div className="relative">
                    <select required className={selectClass} value={formData.heardFrom} onChange={(e) => setFormData({ ...formData, heardFrom: e.target.value })}>
                      <option value="" disabled>Select</option>
                      <option value="A Member">A Member</option>
                      <option value="Friend / Mutual">Friend / Mutual</option>
                      <option value="Events">Events</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Other">Other</option>
                    </select>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><path d="M6 9l6 6 6-6" /></svg>
                  </div>
                </div>

                <label className="flex items-start gap-3 pt-2 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only" />
                    <div className={`w-5 h-5 rounded border ${agreed ? 'bg-[#B2BEB5] border-[#B2BEB5]' : 'border-gray-300 bg-white group-hover:border-gray-400'} transition-colors flex items-center justify-center`}>
                      {agreed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 leading-relaxed">
                    I understand that submitting this form is an expression of interest only and does not guarantee membership. I consent to being contacted by Houston Omegas regarding recruitment.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!isFormValid || status === 'submitting'}
                  className={`w-full text-[11px] uppercase tracking-[0.15em] font-semibold py-3.5 rounded-lg transition-all ${
                    isFormValid
                      ? 'bg-gray-900 text-white hover:bg-gray-800 cursor-pointer'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {status === 'submitting' ? 'Submitting...' : 'Submit'}
                </button>

                {status === 'error' && (
                  <p className="text-red-500/80 text-xs text-center">Something went wrong. Please try again or DM us on Instagram.</p>
                )}
              </form>
            )}
          </div>
        </div>
      </section>

      <div className="h-px bg-gray-200 mx-10" />

      {/* FAQ */}
      <section className="py-20 px-6 sm:px-10 max-w-5xl mx-auto">
        <h2 className="text-center text-2xl sm:text-3xl text-gray-900 mb-12 tracking-[0.04em]" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
          FAQ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
          {faqs.map((faq) => (
            <div key={faq.q} className="border-b border-gray-200 pb-6">
              <h3 className="text-gray-800 text-sm font-semibold mb-2">{faq.q}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}

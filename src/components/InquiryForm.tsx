'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const eventTypes = ['Party', 'Corporate Event', 'Wedding', 'Baby Shower', 'Student Organization', 'Other'];
const guestCounts = ['1-25', '26-50', '51-75', '76-100+'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Calendar({ selectedDate, onSelect }: { selectedDate: string; onSelect: (date: string) => void }) {
  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) {
      const [y, m] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const formatDate = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const isPast = (day: number) => new Date(year, month, day) < today;
  const isToday = (day: number) => {
    const t = new Date();
    return day === t.getDate() && month === t.getMonth() && year === t.getFullYear();
  };
  const isSelected = (day: number) => selectedDate === formatDate(day);

  const canGoPrev = () => {
    const now = new Date();
    return year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth());
  };

  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg p-5">
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => canGoPrev() && setViewDate(new Date(year, month - 1, 1))}
          className={`p-1.5 rounded transition-colors ${canGoPrev() ? 'text-[#666] hover:text-[#1a1a1a] hover:bg-[#f5f5f5]' : 'text-[#ddd] cursor-not-allowed'}`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[#1a1a1a] text-sm font-semibold tracking-wide">{monthNames[month]} {year}</span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="p-1.5 rounded text-[#666] hover:text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayLabels.map((d) => (
          <div key={d} className="text-center text-[10px] text-[#bbb] font-medium py-1.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((day, i) => (
          <button
            key={i}
            type="button"
            disabled={!day || isPast(day)}
            onClick={() => day && !isPast(day) && onSelect(formatDate(day))}
            className={`aspect-square flex items-center justify-center text-xs rounded-md transition-all
              ${!day ? '' : isPast(day) ? 'text-[#ddd] cursor-not-allowed' :
                isSelected(day) ? 'bg-[#c9a96e] text-white font-semibold' :
                isToday(day) ? 'text-[#c9a96e] font-semibold ring-1 ring-[#c9a96e]/40 hover:bg-[#faf8f4]' :
                'text-[#555] hover:bg-[#f5f5f5] hover:text-[#1a1a1a]'}`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', eventType: '', guestCount: '', date: '', message: '', website: '',
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
        body: JSON.stringify({ name: formData.name, email: formData.email, phone: formData.phone, eventType: formData.eventType, guestCount: formData.guestCount, date: formData.date, message: formData.message }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', eventType: '', guestCount: '', date: '', message: '', website: '' });
    } catch {
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputClass = 'w-full px-4 py-3 bg-white border border-[#e0e0e0] rounded-lg text-[#1a1a1a] placeholder-[#bbb] focus:ring-1 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e] outline-none transition-all text-sm';

  if (status === 'success') {
    return (
      <div className="text-center py-16">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-2">Inquiry Sent</h3>
        <p className="text-[#999] text-sm">We&apos;ll get back to you within 24 hours.</p>
        <button onClick={() => setStatus('idle')} className="mt-6 text-sm text-[#c9a96e] hover:underline">
          Send another inquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-6">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">Something went wrong. Please try again or call us directly.</p>
        </div>
      )}

      <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={formData.website} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: form fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Full name *" className={inputClass} />
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email *" className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="Phone *" className={inputClass} />
            <select name="eventType" value={formData.eventType} onChange={handleChange} required className={`${inputClass} ${!formData.eventType ? 'text-[#bbb]' : ''}`}>
              <option value="">Event type *</option>
              {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <select name="guestCount" value={formData.guestCount} onChange={handleChange} className={`${inputClass} ${!formData.guestCount ? 'text-[#bbb]' : ''}`}>
            <option value="">Estimated guest count</option>
            {guestCounts.map((c) => <option key={c} value={c}>{c} guests</option>)}
          </select>
          <textarea name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="Tell us about your event (optional)" className={`${inputClass} resize-none`} />
          <button type="submit" disabled={status === 'submitting'} className="w-full btn-primary rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {status === 'submitting' ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</>
            ) : (
              'Send Message'
            )}
          </button>
        </div>

        {/* Right: calendar */}
        <div>
          {formData.date && (
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays className="w-4 h-4 text-[#c9a96e]" />
              <span className="text-[#666] text-sm font-medium">
                {new Date(formData.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <button type="button" onClick={() => setFormData((prev) => ({ ...prev, date: '' }))} className="text-[#ccc] hover:text-[#888] text-xs ml-auto transition-colors">
                Clear
              </button>
            </div>
          )}
          <Calendar selectedDate={formData.date} onSelect={(date) => setFormData((prev) => ({ ...prev, date }))} />
        </div>
      </div>
    </form>
  );
}

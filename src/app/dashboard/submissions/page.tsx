'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface InquirySubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  event_type: string;
  guest_count: string | null;
  date: string | null;
  message: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
  is_reviewed: number;
}

function SubmissionsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [inquiries, setInquiries] = useState<InquirySubmission[]>([]);
  const [inquiryTotal, setInquiryTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const page = parseInt(searchParams.get('page') || '1');

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/dashboard/inquiries?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.submissions);
        setInquiryTotal(data.total);
      }
    } catch {}
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const totalPages = Math.ceil(inquiryTotal / 25);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Inquiries</h1>
          <p className="text-sm text-dash-text-secondary mt-1">Venue and event inquiry submissions</p>
        </div>
        <span className="text-xs text-dash-text-muted">{inquiryTotal} total</span>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); }} className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, event type..."
          className="w-full max-w-sm px-3 py-2.5 bg-dash-input border border-dash-input-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 dark:focus:ring-gray-600 focus:border-gray-300 dark:focus:border-gray-600 outline-none transition-all"
        />
      </form>

      {loading ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
          <div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin mx-auto" />
        </div>
      ) : inquiries.length === 0 ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center">
          <p className="text-dash-text-muted text-sm">No inquiries found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map(s => (
            <div key={s.id} className="bg-dash-card rounded-xl border border-dash-border overflow-hidden hover:border-gray-300 transition-colors">
              <button
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className="w-full text-left px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-dash-text">{s.name}</p>
                  <p className="text-xs text-dash-text-muted">{s.event_type} &middot; {new Date(s.created_at + 'Z').toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {s.date && <span className="text-xs text-dash-text-secondary hidden sm:inline">Event: {s.date}</span>}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${expanded === s.id ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>
              {expanded === s.id && (
                <div className="px-5 pb-4 border-t border-dash-border pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div><span className="text-dash-text-muted">Email:</span> <span className="text-dash-text">{s.email}</span></div>
                  <div><span className="text-dash-text-muted">Phone:</span> <span className="text-dash-text">{s.phone}</span></div>
                  <div><span className="text-dash-text-muted">Guests:</span> <span className="text-dash-text">{s.guest_count || '-'}</span></div>
                  <div><span className="text-dash-text-muted">Date:</span> <span className="text-dash-text">{s.date || '-'}</span></div>
                  <div><span className="text-dash-text-muted">Location:</span> <span className="text-dash-text">{[s.city, s.country].filter(Boolean).join(', ') || '-'}</span></div>
                  {s.message && (
                    <div className="col-span-full"><span className="text-dash-text-muted">Message:</span> <span className="text-dash-text">{s.message}</span></div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => router.push(`/dashboard/submissions?page=${p}`)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? 'bg-gray-900 text-white' : 'text-dash-text-secondary hover:bg-dash-badge-bg'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SubmissionsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-dash-border border-t-dash-text rounded-full animate-spin" /></div>}>
      <SubmissionsInner />
    </Suspense>
  );
}

'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Submission {
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

function InquiriesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [expanded, setExpanded] = useState<number | null>(null);

  const page = parseInt(searchParams.get('page') || '1');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/dashboard/inquiries?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
        setTotal(data.total);
      }
    } catch { /* */ }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    router.push(`/dashboard/inquiries?${params}`);
  };

  const totalPages = Math.ceil(total / 25);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Venue Inquiries</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total inquir{total !== 1 ? 'ies' : 'y'}</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, event type..."
          className="w-full max-w-sm px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all"
        />
      </form>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">No inquiries found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.event_type} &middot; {new Date(s.created_at + 'Z').toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {s.date && <span className="text-xs text-gray-500 hidden sm:inline">Event: {s.date}</span>}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" className={`transition-transform ${expanded === s.id ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </button>
              {expanded === s.id && (
                <div className="px-5 pb-4 border-t border-gray-100 pt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div><span className="text-gray-400">Email:</span> <span className="text-gray-700">{s.email}</span></div>
                  <div><span className="text-gray-400">Phone:</span> <span className="text-gray-700">{s.phone}</span></div>
                  <div><span className="text-gray-400">Guests:</span> <span className="text-gray-700">{s.guest_count || '-'}</span></div>
                  <div><span className="text-gray-400">Date:</span> <span className="text-gray-700">{s.date || '-'}</span></div>
                  <div><span className="text-gray-400">Location:</span> <span className="text-gray-700">{[s.city, s.country].filter(Boolean).join(', ') || '-'}</span></div>
                  {s.message && (
                    <div className="col-span-full"><span className="text-gray-400">Message:</span> <span className="text-gray-700">{s.message}</span></div>
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
              onClick={() => router.push(`/dashboard/inquiries?page=${p}${search ? `&search=${search}` : ''}`)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function InquiriesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>}>
      <InquiriesInner />
    </Suspense>
  );
}

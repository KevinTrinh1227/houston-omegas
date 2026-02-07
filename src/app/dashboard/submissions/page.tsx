'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface RecruitmentSubmission {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  classification: string;
  major: string | null;
  instagram: string;
  heard_from: string;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  created_at: string;
  is_reviewed: number;
}

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
  const [tab, setTab] = useState<'recruitment' | 'inquiries'>(
    (searchParams.get('tab') as 'recruitment' | 'inquiries') || 'recruitment'
  );

  // Recruitment state
  const [recruitments, setRecruitments] = useState<RecruitmentSubmission[]>([]);
  const [recruitTotal, setRecruitTotal] = useState(0);
  const [recruitLoading, setRecruitLoading] = useState(true);
  const [recruitSearch, setRecruitSearch] = useState(searchParams.get('search') || '');
  const recruitPage = parseInt(searchParams.get('page') || '1');

  // Inquiry state
  const [inquiries, setInquiries] = useState<InquirySubmission[]>([]);
  const [inquiryTotal, setInquiryTotal] = useState(0);
  const [inquiryLoading, setInquiryLoading] = useState(true);
  const [inquirySearch, setInquirySearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const inquiryPage = parseInt(searchParams.get('ipage') || '1');

  const fetchRecruitment = useCallback(async () => {
    setRecruitLoading(true);
    try {
      const params = new URLSearchParams({ page: String(recruitPage), limit: '25' });
      if (recruitSearch) params.set('search', recruitSearch);
      const res = await fetch(`/api/dashboard/recruitment?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRecruitments(data.submissions);
        setRecruitTotal(data.total);
      }
    } catch {}
    finally { setRecruitLoading(false); }
  }, [recruitPage, recruitSearch]);

  const fetchInquiries = useCallback(async () => {
    setInquiryLoading(true);
    try {
      const params = new URLSearchParams({ page: String(inquiryPage), limit: '25' });
      if (inquirySearch) params.set('search', inquirySearch);
      const res = await fetch(`/api/dashboard/inquiries?${params}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.submissions);
        setInquiryTotal(data.total);
      }
    } catch {}
    finally { setInquiryLoading(false); }
  }, [inquiryPage, inquirySearch]);

  useEffect(() => { fetchRecruitment(); }, [fetchRecruitment]);
  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  const handleTabChange = (newTab: 'recruitment' | 'inquiries') => {
    setTab(newTab);
    router.push(`/dashboard/submissions?tab=${newTab}`);
  };

  const recruitTotalPages = Math.ceil(recruitTotal / 25);
  const inquiryTotalPages = Math.ceil(inquiryTotal / 25);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">Recruitment applications and venue inquiries</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleTabChange('recruitment')}
          className={`text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg transition-all ${
            tab === 'recruitment' ? 'bg-gray-900 text-white' : 'text-gray-500 border border-gray-200 hover:border-gray-300'
          }`}
        >
          Recruitment ({recruitTotal})
        </button>
        <button
          onClick={() => handleTabChange('inquiries')}
          className={`text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg transition-all ${
            tab === 'inquiries' ? 'bg-gray-900 text-white' : 'text-gray-500 border border-gray-200 hover:border-gray-300'
          }`}
        >
          Inquiries ({inquiryTotal})
        </button>
      </div>

      {/* Recruitment Tab */}
      {tab === 'recruitment' && (
        <>
          <form onSubmit={(e) => { e.preventDefault(); router.push(`/dashboard/submissions?tab=recruitment${recruitSearch ? `&search=${recruitSearch}` : ''}`); }} className="mb-4">
            <input
              type="text"
              value={recruitSearch}
              onChange={e => setRecruitSearch(e.target.value)}
              placeholder="Search by name, Instagram, phone..."
              className="w-full max-w-sm px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all"
            />
          </form>

          {recruitLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
            </div>
          ) : recruitments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-sm">No submissions found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Name', 'Phone', 'Instagram', 'Classification', 'Major', 'Heard From', 'Location', 'Date'].map(h => (
                      <th key={h} className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recruitments.map(s => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-gray-900">{s.first_name} {s.last_name}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{s.phone}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{s.instagram}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{s.classification}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{s.major || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{s.heard_from}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{[s.city, s.country].filter(Boolean).join(', ') || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">{new Date(s.created_at + 'Z').toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {recruitTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: recruitTotalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => router.push(`/dashboard/submissions?tab=recruitment&page=${p}${recruitSearch ? `&search=${recruitSearch}` : ''}`)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === recruitPage ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Inquiries Tab */}
      {tab === 'inquiries' && (
        <>
          <form onSubmit={(e) => { e.preventDefault(); }} className="mb-4">
            <input
              type="text"
              value={inquirySearch}
              onChange={e => setInquirySearch(e.target.value)}
              placeholder="Search by name, email, event type..."
              className="w-full max-w-sm px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all"
            />
          </form>

          {inquiryLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-sm">No inquiries found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map(s => (
                <div key={s.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
                  <button
                    onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.event_type} &middot; {new Date(s.created_at + 'Z').toLocaleDateString()}</p>
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

          {inquiryTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: inquiryTotalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => router.push(`/dashboard/submissions?tab=inquiries&ipage=${p}`)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === inquiryPage ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function SubmissionsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>}>
      <SubmissionsInner />
    </Suspense>
  );
}

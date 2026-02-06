'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Submission {
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

function RecruitmentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const page = parseInt(searchParams.get('page') || '1');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/dashboard/recruitment?${params}`, { credentials: 'include' });
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
    router.push(`/dashboard/recruitment?${params}`);
  };

  const totalPages = Math.ceil(total / 25);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Recruitment Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total submission{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, Instagram, phone..."
          className="w-full max-w-sm px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all"
        />
      </form>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
        </div>
      ) : submissions.length === 0 ? (
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
              {submissions.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => router.push(`/dashboard/recruitment?page=${p}${search ? `&search=${search}` : ''}`)}
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

export default function RecruitmentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>}>
      <RecruitmentInner />
    </Suspense>
  );
}

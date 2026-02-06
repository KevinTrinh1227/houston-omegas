'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/dashboard/AuthProvider';

interface GreekOrg { id: string; name: string; letters: string; council: string; chapter: string | null; instagram: string | null; contact_name: string | null; contact_email: string | null; contact_phone: string | null; website: string | null; notes: string | null; }
interface MixerEvent { id: string; title: string; event_date: string; location: string | null; description: string | null; }

const COUNCILS = ['IFC', 'NPHC', 'MGC', 'PHC', 'LGC', 'Independent', 'Other'];

export default function GreekOrgsPage() {
  const { member } = useAuth();
  const searchParams = useSearchParams();
  const orgId = searchParams.get('id');
  const canManage = ['admin', 'president', 'vpx'].includes(member?.role || '');

  const [orgs, setOrgs] = useState<GreekOrg[]>([]);
  const [loading, setLoading] = useState(true);
  const [councilFilter, setCouncilFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState('');

  // Detail
  const [detail, setDetail] = useState<(GreekOrg & { mixers: MixerEvent[] }) | null>(null);

  // Form
  const [form, setForm] = useState({ name: '', letters: '', council: 'IFC', chapter: '', instagram: '', contact_name: '', contact_email: '', contact_phone: '', website: '', notes: '' });

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    const q = councilFilter ? `?council=${councilFilter}` : '';
    const res = await fetch(`/api/greek-orgs${q}`, { credentials: 'include' });
    if (res.ok) setOrgs(await res.json());
    setLoading(false);
  }, [councilFilter]);

  const fetchDetail = useCallback(async (id: string) => {
    const res = await fetch(`/api/greek-orgs/${id}`, { credentials: 'include' });
    if (res.ok) setDetail(await res.json());
  }, []);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);
  useEffect(() => { if (orgId) fetchDetail(orgId); }, [orgId, fetchDetail]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/greek-orgs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify(form),
    });
    if (res.ok) { setShowNew(false); setForm({ name: '', letters: '', council: 'IFC', chapter: '', instagram: '', contact_name: '', contact_email: '', contact_phone: '', website: '', notes: '' }); fetchOrgs(); }
    else { const d = await res.json(); setMessage(d.error || 'Failed'); }
  };

  const filtered = orgs.filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.letters.toLowerCase().includes(search.toLowerCase()));
  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';

  // Detail view
  if (orgId && detail) {
    return (
      <div>
        <div className="mb-6">
          <a href="/dashboard/greek-orgs" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">&larr; Back to Directory</a>
          <h1 className="text-xl font-semibold text-gray-900 mt-2">{detail.letters} - {detail.name}</h1>
          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">{detail.council}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Contact Info</h2>
            <div className="space-y-2 text-xs text-gray-600">
              {detail.chapter && <p><span className="text-gray-400">Chapter:</span> {detail.chapter}</p>}
              {detail.contact_name && <p><span className="text-gray-400">Contact:</span> {detail.contact_name}</p>}
              {detail.contact_email && <p><span className="text-gray-400">Email:</span> {detail.contact_email}</p>}
              {detail.contact_phone && <p><span className="text-gray-400">Phone:</span> {detail.contact_phone}</p>}
              {detail.instagram && <p><span className="text-gray-400">Instagram:</span> @{detail.instagram}</p>}
              {detail.website && <p><span className="text-gray-400">Website:</span> {detail.website}</p>}
              {detail.notes && <p className="mt-3 text-gray-500">{detail.notes}</p>}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-3">Mixer History</h2>
            {detail.mixers.length === 0 ? (
              <p className="text-xs text-gray-400">No mixers recorded.</p>
            ) : (
              <div className="space-y-3">
                {detail.mixers.map(mx => (
                  <div key={mx.id} className="border-l-2 border-gray-200 pl-3">
                    <p className="text-xs font-medium text-gray-900">{mx.title}</p>
                    <p className="text-[10px] text-gray-400">{new Date(mx.event_date).toLocaleDateString()}{mx.location ? ` - ${mx.location}` : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Greek Org Directory</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} organization{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        {canManage && <button onClick={() => setShowNew(true)} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Add Organization</button>}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm w-48 focus:ring-1 focus:ring-gray-300 outline-none" />
        <select value={councilFilter} onChange={e => setCouncilFilter(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
          <option value="">All Councils</option>
          {COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {message && <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 text-green-600 border border-green-200">{message}</div>}

      {showNew && canManage && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="text-sm font-medium text-gray-900">Add Organization</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Name</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className={inputClass} /></div>
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Letters</label><input type="text" value={form.letters} onChange={e => setForm({ ...form, letters: e.target.value })} required placeholder="ΑΒΓ" className={inputClass} /></div>
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Council</label><select value={form.council} onChange={e => setForm({ ...form, council: e.target.value })} className={inputClass}>{COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Contact Name</label><input type="text" value={form.contact_name} onChange={e => setForm({ ...form, contact_name: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Contact Email</label><input type="email" value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Instagram</label><input type="text" value={form.instagram} onChange={e => setForm({ ...form, instagram: e.target.value })} placeholder="username" className={inputClass} /></div>
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Website</label><input type="text" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Add</button>
            <button type="button" onClick={() => setShowNew(false)} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-gray-200">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100">
              <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Letters</th>
              <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Name</th>
              <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Council</th>
              <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3 hidden sm:table-cell">Contact</th>
            </tr></thead>
            <tbody>
              {filtered.map(org => (
                <tr key={org.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => window.location.href = `/dashboard/greek-orgs?id=${org.id}`}>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">{org.letters}</td>
                  <td className="px-5 py-3 text-xs text-gray-700">{org.name}</td>
                  <td className="px-5 py-3"><span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">{org.council}</span></td>
                  <td className="px-5 py-3 text-xs text-gray-500 hidden sm:table-cell">{org.contact_name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

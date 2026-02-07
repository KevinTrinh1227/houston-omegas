'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';

interface Semester { id: string; name: string; is_current: number; }
interface LeaderboardEntry { id: string; first_name: string; last_name: string; avatar_url: string | null; total_points: number; entries: number; }
interface Category { id: string; name: string; default_points: number; description: string | null; }
interface BrotherDate { id: string; member1_id: string; member2_id: string; m1_first: string; m1_last: string; m2_first: string; m2_last: string; date: string; description: string | null; approved: number; points_awarded: number; }
interface Member { id: string; first_name: string; last_name: string; }

export default function PointsPage() {
  const { member } = useAuth();
  const canManage = ['admin', 'president', 'vpi'].includes(member?.role || '');

  const [tab, setTab] = useState<'leaderboard' | 'dates' | 'mine'>('leaderboard');
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dates, setDates] = useState<BrotherDate[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Award form
  const [showAward, setShowAward] = useState(false);
  const [awardForm, setAwardForm] = useState({ member_id: '', category_id: '', points: '1', reason: '' });

  // Brother date form
  const [showDateForm, setShowDateForm] = useState(false);
  const [dateForm, setDateForm] = useState({ member2_id: '', date: '', description: '' });

  const fetchSemesters = useCallback(async () => {
    const res = await fetch('/api/semesters', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setSemesters(data);
      const current = data.find((s: Semester) => s.is_current);
      if (current) setSelectedSemester(current.id);
      else if (data.length) setSelectedSemester(data[0].id);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!selectedSemester) return;
    setLoading(true);
    const [lbRes, catRes, datesRes, memRes] = await Promise.all([
      fetch(`/api/points/leaderboard?semester_id=${selectedSemester}`, { credentials: 'include' }),
      fetch('/api/point-categories', { credentials: 'include' }),
      fetch(`/api/brother-dates?semester_id=${selectedSemester}`, { credentials: 'include' }),
      fetch('/api/members', { credentials: 'include' }),
    ]);
    if (lbRes.ok) setLeaderboard(await lbRes.json());
    if (catRes.ok) setCategories(await catRes.json());
    if (datesRes.ok) setDates(await datesRes.json());
    if (memRes.ok) setMembers(await memRes.json());
    setLoading(false);
  }, [selectedSemester]);

  useEffect(() => { fetchSemesters(); }, [fetchSemesters]);
  useEffect(() => { if (selectedSemester) fetchData(); }, [selectedSemester, fetchData]);

  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/points', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ ...awardForm, semester_id: selectedSemester, points: Number(awardForm.points) }),
    });
    if (res.ok) { setShowAward(false); setAwardForm({ member_id: '', category_id: '', points: '1', reason: '' }); fetchData(); setMessage('Points awarded.'); }
    else { const d = await res.json(); setMessage(d.error || 'Failed'); }
  };

  const handleSubmitDate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/brother-dates', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ ...dateForm, member1_id: member?.id, semester_id: selectedSemester }),
    });
    if (res.ok) { setShowDateForm(false); setDateForm({ member2_id: '', date: '', description: '' }); fetchData(); setMessage('Brother date submitted!'); }
    else { const d = await res.json(); setMessage(d.error || 'Failed'); }
  };

  const handleApprove = async (id: string, approved: boolean, pts: number) => {
    await fetch(`/api/brother-dates/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ approved, points_awarded: pts }),
    });
    fetchData();
  };

  const inputClass = 'w-full px-3 py-2.5 bg-dash-card border border-dash-border rounded-lg text-dash-text text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';

  const myPoints = leaderboard.find(l => l.id === member?.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-dash-text">Brotherhood Points</h1>
          {myPoints && <p className="text-sm text-dash-text-secondary mt-1">Your total: <span className="font-semibold text-dash-text">{myPoints.total_points} pts</span></p>}
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} className="px-3 py-2 bg-dash-card border border-dash-border rounded-lg text-sm">
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {canManage && <button onClick={() => setShowAward(true)} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Award Points</button>}
        </div>
      </div>

      {message && <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 text-green-600 border border-green-200">{message}<button onClick={() => setMessage('')} className="ml-2 underline">dismiss</button></div>}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-dash-badge-bg rounded-lg p-1 w-fit">
        {(['leaderboard', 'dates', 'mine'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t ? 'bg-dash-card text-dash-text shadow-sm' : 'text-dash-text-secondary hover:text-dash-text'}`}>
            {t === 'leaderboard' ? 'Leaderboard' : t === 'dates' ? 'Brother Dates' : 'My Points'}
          </button>
        ))}
      </div>

      {/* Award Points Modal */}
      {showAward && canManage && (
        <form onSubmit={handleAward} className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6 space-y-4">
          <h2 className="text-sm font-medium text-dash-text">Award Points</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Member</label><select value={awardForm.member_id} onChange={e => setAwardForm({ ...awardForm, member_id: e.target.value })} required className={inputClass}><option value="">Select...</option>{members.map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}</select></div>
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Category</label><select value={awardForm.category_id} onChange={e => setAwardForm({ ...awardForm, category_id: e.target.value })} required className={inputClass}><option value="">Select...</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c.default_points} pts)</option>)}</select></div>
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Points</label><input type="number" value={awardForm.points} onChange={e => setAwardForm({ ...awardForm, points: e.target.value })} required className={inputClass} /></div>
            <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Reason</label><input type="text" value={awardForm.reason} onChange={e => setAwardForm({ ...awardForm, reason: e.target.value })} className={inputClass} /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Award</button>
            <button type="button" onClick={() => setShowAward(false)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" /></div>
      ) : tab === 'leaderboard' ? (
        <div className="bg-dash-card rounded-xl border border-dash-border overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-dash-border">
              <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3 w-12">#</th>
              <th className="text-left text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Member</th>
              <th className="text-right text-[10px] text-dash-text-muted uppercase tracking-wider font-medium px-5 py-3">Points</th>
            </tr></thead>
            <tbody>
              {leaderboard.map((entry, i) => (
                <tr key={entry.id} className={`border-b border-dash-border/50 hover:bg-dash-card-hover transition-colors ${entry.id === member?.id ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-5 py-3 text-xs text-dash-text-muted font-medium">{i + 1}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {entry.avatar_url ? <img src={entry.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" /> : <div className="w-7 h-7 rounded-full bg-dash-badge-bg flex items-center justify-center text-dash-text-secondary text-[10px] font-semibold">{entry.first_name[0]}{entry.last_name[0]}</div>}
                      <span className="text-xs font-medium text-dash-text">{entry.first_name} {entry.last_name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-sm font-semibold text-dash-text">{entry.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : tab === 'dates' ? (
        <div>
          <div className="mb-4">
            <button onClick={() => setShowDateForm(true)} className="text-[11px] uppercase tracking-[0.15em] font-semibold text-dash-text-secondary hover:text-dash-text transition-colors">+ Submit Brother Date</button>
          </div>
          {showDateForm && (
            <form onSubmit={handleSubmitDate} className="bg-dash-card rounded-xl border border-dash-border p-6 mb-6 space-y-4">
              <h2 className="text-sm font-medium text-dash-text">Submit Brother Date</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Brother</label><select value={dateForm.member2_id} onChange={e => setDateForm({ ...dateForm, member2_id: e.target.value })} required className={inputClass}><option value="">Select...</option>{members.filter(m => m.id !== member?.id).map(m => <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>)}</select></div>
                <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Date</label><input type="date" value={dateForm.date} onChange={e => setDateForm({ ...dateForm, date: e.target.value })} required className={inputClass} /></div>
              </div>
              <div><label className="block text-[10px] text-dash-text-muted mb-1.5 uppercase tracking-wider">Description</label><input type="text" value={dateForm.description} onChange={e => setDateForm({ ...dateForm, description: e.target.value })} placeholder="What did you do?" className={inputClass} /></div>
              <div className="flex gap-3">
                <button type="submit" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Submit</button>
                <button type="button" onClick={() => setShowDateForm(false)} className="text-dash-text-secondary text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-dash-border">Cancel</button>
              </div>
            </form>
          )}
          <div className="space-y-3">
            {dates.map(d => (
              <div key={d.id} className="bg-dash-card rounded-xl border border-dash-border p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-dash-text">{d.m1_first} {d.m1_last} & {d.m2_first} {d.m2_last}</p>
                    {d.description && <p className="text-xs text-dash-text-secondary mt-1">{d.description}</p>}
                    <p className="text-[10px] text-dash-text-muted mt-1">{new Date(d.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    {d.approved ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 uppercase font-medium">Approved {d.points_awarded > 0 ? `(${d.points_awarded} pts)` : ''}</span>
                    ) : canManage ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(d.id, true, 1)} className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 hover:bg-green-200 font-medium">Approve</button>
                        <button onClick={() => handleApprove(d.id, false, 0)} className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 hover:bg-red-200 font-medium">Reject</button>
                      </div>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 uppercase font-medium">Pending</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {dates.length === 0 && <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center text-sm text-dash-text-muted">No brother dates yet.</div>}
          </div>
        </div>
      ) : (
        <div className="bg-dash-card rounded-xl border border-dash-border p-12 text-center text-sm text-dash-text-muted">
          {myPoints ? `You have ${myPoints.total_points} total points from ${myPoints.entries} entries this semester.` : 'No points yet this semester.'}
        </div>
      )}
    </div>
  );
}

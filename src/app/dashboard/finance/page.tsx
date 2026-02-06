'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';

interface Semester { id: string; name: string; start_date: string; end_date: string; dues_amount: number; is_current: number; }
interface Dues { id: string; member_id: string; semester_id: string; amount_due: number; amount_paid: number; status: string; notes: string | null; first_name: string; last_name: string; email: string; }
interface FinanceStats { total_records: number; total_due: number; total_paid: number; paid_count: number; unpaid_count: number; partial_count: number; waived_count: number; exempt_count: number; }

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  unpaid: 'bg-red-100 text-red-700',
  waived: 'bg-blue-100 text-blue-700',
  exempt: 'bg-gray-100 text-gray-500',
};

export default function FinancePage() {
  const { member } = useAuth();
  const isExec = isExecRole(member?.role || '');
  const canManage = ['admin', 'president', 'treasurer'].includes(member?.role || '');

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [dues, setDues] = useState<Dues[]>([]);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Semester form
  const [showNewSemester, setShowNewSemester] = useState(false);
  const [semesterForm, setSemesterForm] = useState({ name: '', start_date: '', end_date: '', dues_amount: '', is_current: true });

  // Payment form
  const [payingDuesId, setPayingDuesId] = useState('');
  const [payForm, setPayForm] = useState({ amount: '', method: 'venmo', notes: '' });

  const fetchSemesters = useCallback(async () => {
    try {
      const res = await fetch('/api/semesters', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSemesters(data);
        const current = data.find((s: Semester) => s.is_current);
        if (current && !selectedSemester) setSelectedSemester(current.id);
        else if (data.length > 0 && !selectedSemester) setSelectedSemester(data[0].id);
      }
    } catch { /* */ }
  }, []);

  const fetchDues = useCallback(async () => {
    if (!selectedSemester) return;
    setLoading(true);
    try {
      const [duesRes, statsRes] = await Promise.all([
        fetch(`/api/dues?semester_id=${selectedSemester}`, { credentials: 'include' }),
        isExec ? fetch(`/api/dashboard/finance-stats?semester_id=${selectedSemester}`, { credentials: 'include' }) : Promise.resolve(null),
      ]);
      if (duesRes.ok) setDues(await duesRes.json());
      if (statsRes?.ok) setStats(await statsRes.json());
    } catch { /* */ }
    finally { setLoading(false); }
  }, [selectedSemester, isExec]);

  useEffect(() => { fetchSemesters(); }, [fetchSemesters]);
  useEffect(() => { if (selectedSemester) fetchDues(); }, [selectedSemester, fetchDues]);

  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/semesters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...semesterForm, dues_amount: Math.round(parseFloat(semesterForm.dues_amount) * 100) }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowNewSemester(false);
        setSemesterForm({ name: '', start_date: '', end_date: '', dues_amount: '', is_current: true });
        await fetchSemesters();
        setSelectedSemester(data.id);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to create semester.');
      }
    } catch { setMessage('Connection error.'); }
  };

  const handleBulkCreate = async () => {
    if (!confirm('Create dues records for all active members in this semester?')) return;
    try {
      const res = await fetch('/api/dues/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ semester_id: selectedSemester }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(`Created ${data.created} dues records.`);
        fetchDues();
      }
    } catch { setMessage('Connection error.'); }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dues_id: payingDuesId, amount: Math.round(parseFloat(payForm.amount) * 100), method: payForm.method, notes: payForm.notes || null }),
      });
      if (res.ok) {
        setPayingDuesId('');
        setPayForm({ amount: '', method: 'venmo', notes: '' });
        fetchDues();
        setMessage('Payment recorded.');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to record payment.');
      }
    } catch { setMessage('Connection error.'); }
  };

  const handleStatusChange = async (duesId: string, status: string) => {
    try {
      await fetch(`/api/dues/${duesId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      fetchDues();
    } catch { /* */ }
  };

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Finance</h1>
          <p className="text-sm text-gray-500 mt-1">Dues tracking and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {canManage && (
            <button onClick={() => setShowNewSemester(true)} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">
              New Semester
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-xs text-center ${message.includes('error') || message.includes('Failed') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
          {message}
          <button onClick={() => setMessage('')} className="ml-2 underline">dismiss</button>
        </div>
      )}

      {/* New Semester Form */}
      {showNewSemester && canManage && (
        <form onSubmit={handleCreateSemester} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="text-sm font-medium text-gray-900">Create Semester</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Name</label>
              <input type="text" value={semesterForm.name} onChange={e => setSemesterForm({ ...semesterForm, name: e.target.value })} placeholder="Spring 2026" required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Dues Amount ($)</label>
              <input type="number" step="0.01" min="0" value={semesterForm.dues_amount} onChange={e => setSemesterForm({ ...semesterForm, dues_amount: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Start Date</label>
              <input type="date" value={semesterForm.start_date} onChange={e => setSemesterForm({ ...semesterForm, start_date: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">End Date</label>
              <input type="date" value={semesterForm.end_date} onChange={e => setSemesterForm({ ...semesterForm, end_date: e.target.value })} required className={inputClass} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={semesterForm.is_current} onChange={e => setSemesterForm({ ...semesterForm, is_current: e.target.checked })} />
            Set as current semester
          </label>
          <div className="flex gap-3">
            <button type="submit" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Create</button>
            <button type="button" onClick={() => setShowNewSemester(false)} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">Cancel</button>
          </div>
        </form>
      )}

      {/* Stats Cards */}
      {isExec && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total Due</p>
            <p className="text-lg font-semibold text-gray-900">{fmt(stats.total_due)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Collected</p>
            <p className="text-lg font-semibold text-green-600">{fmt(stats.total_paid)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Outstanding</p>
            <p className="text-lg font-semibold text-red-600">{fmt(stats.total_due - stats.total_paid)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">% Paid</p>
            <p className="text-lg font-semibold text-gray-900">{stats.total_records ? Math.round((stats.paid_count / stats.total_records) * 100) : 0}%</p>
          </div>
        </div>
      )}

      {/* Bulk create button */}
      {canManage && selectedSemester && (
        <div className="mb-4">
          <button onClick={handleBulkCreate} className="text-[11px] uppercase tracking-[0.15em] font-semibold text-gray-500 hover:text-gray-700 transition-colors">
            + Create dues for all active members
          </button>
        </div>
      )}

      {/* Payment modal */}
      {payingDuesId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handlePayment} className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-sm font-medium text-gray-900">Record Payment</h2>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Amount ($)</label>
              <input type="number" step="0.01" min="0.01" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} required className={inputClass} />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Method</label>
              <select value={payForm.method} onChange={e => setPayForm({ ...payForm, method: e.target.value })} className={inputClass}>
                <option value="venmo">Venmo</option>
                <option value="zelle">Zelle</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Notes</label>
              <input type="text" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} className={inputClass} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Record</button>
              <button type="button" onClick={() => setPayingDuesId('')} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Dues Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
        </div>
      ) : dues.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">
          No dues records for this semester.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Member</th>
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Due</th>
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Paid</th>
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Status</th>
                {canManage && <th className="text-right text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {dues.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-xs font-medium text-gray-900">{d.first_name} {d.last_name}</td>
                  <td className="px-5 py-3 text-xs text-gray-700">{fmt(d.amount_due)}</td>
                  <td className="px-5 py-3 text-xs text-gray-700">{fmt(d.amount_paid)}</td>
                  <td className="px-5 py-3">
                    {canManage ? (
                      <select value={d.status} onChange={e => handleStatusChange(d.id, e.target.value)} className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase border-0 cursor-pointer ${STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-500'}`}>
                        <option value="unpaid">Unpaid</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                        <option value="waived">Waived</option>
                        <option value="exempt">Exempt</option>
                      </select>
                    ) : (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${STATUS_COLORS[d.status] || 'bg-gray-100 text-gray-500'}`}>{d.status}</span>
                    )}
                  </td>
                  {canManage && (
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => { setPayingDuesId(d.id); setPayForm({ amount: ((d.amount_due - d.amount_paid) / 100).toFixed(2), method: 'venmo', notes: '' }); }} className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
                        Record Payment
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

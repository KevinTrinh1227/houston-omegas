'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/dashboard/AuthProvider';

interface Semester { id: string; name: string; is_current: number; }
interface AttendanceStat { id: string; first_name: string; last_name: string; role: string; total_events: number; present_count: number; late_count: number; excused_count: number; absent_count: number; attendance_pct: number | null; }

export default function AttendancePage() {
  const { member } = useAuth();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [stats, setStats] = useState<AttendanceStat[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchStats = useCallback(async () => {
    if (!selectedSemester) return;
    setLoading(true);
    const res = await fetch(`/api/attendance/stats?semester_id=${selectedSemester}`, { credentials: 'include' });
    if (res.ok) setStats(await res.json());
    setLoading(false);
  }, [selectedSemester]);

  useEffect(() => { fetchSemesters(); }, [fetchSemesters]);
  useEffect(() => { if (selectedSemester) fetchStats(); }, [selectedSemester, fetchStats]);

  const pctColor = (pct: number | null) => {
    if (pct === null) return 'text-gray-400';
    if (pct >= 80) return 'text-green-600';
    if (pct >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">Member attendance overview</p>
        </div>
        <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
          {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Member</th>
                <th className="text-center text-[10px] text-gray-400 uppercase tracking-wider font-medium px-3 py-3">Present</th>
                <th className="text-center text-[10px] text-gray-400 uppercase tracking-wider font-medium px-3 py-3">Late</th>
                <th className="text-center text-[10px] text-gray-400 uppercase tracking-wider font-medium px-3 py-3">Excused</th>
                <th className="text-center text-[10px] text-gray-400 uppercase tracking-wider font-medium px-3 py-3">Absent</th>
                <th className="text-center text-[10px] text-gray-400 uppercase tracking-wider font-medium px-3 py-3">%</th>
              </tr>
            </thead>
            <tbody>
              {stats.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-xs font-medium text-gray-900">{s.first_name} {s.last_name}</td>
                  <td className="px-3 py-3 text-xs text-center text-green-600">{s.present_count}</td>
                  <td className="px-3 py-3 text-xs text-center text-yellow-600">{s.late_count}</td>
                  <td className="px-3 py-3 text-xs text-center text-blue-600">{s.excused_count}</td>
                  <td className="px-3 py-3 text-xs text-center text-red-600">{s.absent_count}</td>
                  <td className={`px-3 py-3 text-xs text-center font-semibold ${pctColor(s.attendance_pct)}`}>{s.attendance_pct !== null ? `${s.attendance_pct}%` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

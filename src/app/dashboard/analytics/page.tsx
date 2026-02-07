'use client';

import { useState, useEffect, useCallback } from 'react';

interface Analytics {
  active_users_7d: number;
  active_users_30d: number;
  total_members: number;
  active_members: number;
  dues_collection_rate: number;
  dues_total_due: number;
  dues_total_paid: number;
  attendance_avg: number;
  total_points: number;
  total_events: number;
  total_meetings: number;
  total_documents: number;
  recent_activity: { action: string; page: string | null; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/dashboard/analytics', { credentials: 'include' });
      if (res.ok) {
        setData(await res.json());
      } else if (res.status === 403) {
        setErrorMsg('Executive board access only.');
      } else if (res.status === 401) {
        setErrorMsg('Please log in to view analytics.');
      } else {
        setErrorMsg('Failed to load analytics.');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (loading) {
    return (
      <div>
        <div className="mb-6"><h1 className="text-xl font-semibold text-gray-900">Analytics</h1></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-3 bg-gray-100 rounded w-24 mb-3" />
              <div className="h-7 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div>
        <div className="mb-6"><h1 className="text-xl font-semibold text-gray-900">Analytics</h1></div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-sm text-gray-500 mb-4">{errorMsg}</p>
          {errorMsg.includes('Network') && (
            <button onClick={fetchData} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const allZero = data.active_users_7d === 0 && data.active_users_30d === 0 && data.total_members === 0;

  const stats = [
    { label: 'Active Users (7d)', value: data.active_users_7d, color: 'text-blue-600' },
    { label: 'Active Users (30d)', value: data.active_users_30d, color: 'text-indigo-600' },
    { label: 'Active Members', value: data.active_members, sub: `/ ${data.total_members} total` },
    { label: 'Dues Collection', value: `${data.dues_collection_rate}%`, color: data.dues_collection_rate > 75 ? 'text-green-600' : data.dues_collection_rate > 50 ? 'text-yellow-600' : 'text-red-600' },
    { label: 'Dues Collected', value: fmt(data.dues_total_paid), sub: `of ${fmt(data.dues_total_due)}` },
    { label: 'Avg Attendance', value: `${Math.round(data.attendance_avg)}%`, color: data.attendance_avg > 75 ? 'text-green-600' : data.attendance_avg > 50 ? 'text-yellow-600' : 'text-red-600' },
    { label: 'Total Points', value: data.total_points },
    { label: 'Events', value: data.total_events },
    { label: 'Meetings', value: data.total_meetings },
    { label: 'Documents', value: data.total_documents },
  ];

  const duesBar = data.dues_total_due > 0 ? Math.round((data.dues_total_paid / data.dues_total_due) * 100) : 0;
  const attendanceBar = Math.round(data.attendance_avg);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Organization overview and metrics</p>
      </div>

      {allZero && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-xs text-blue-700">No activity data yet. Analytics will populate as members use the dashboard.</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-lg font-semibold ${s.color || 'text-gray-900'}`}>{s.value}</p>
            {s.sub && <p className="text-[10px] text-gray-400 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Visual bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Dues Collection Rate</h3>
          <div className="w-full bg-gray-100 rounded-full h-6">
            <div className={`h-6 rounded-full flex items-center justify-end pr-2 text-[10px] font-semibold text-white ${duesBar > 75 ? 'bg-green-500' : duesBar > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.max(duesBar, 5)}%` }}>
              {duesBar}%
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">{fmt(data.dues_total_paid)} collected of {fmt(data.dues_total_due)} total</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Average Attendance</h3>
          <div className="w-full bg-gray-100 rounded-full h-6">
            <div className={`h-6 rounded-full flex items-center justify-end pr-2 text-[10px] font-semibold text-white ${attendanceBar > 75 ? 'bg-green-500' : attendanceBar > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.max(attendanceBar, 5)}%` }}>
              {attendanceBar}%
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Across all events with recorded attendance</p>
        </div>
      </div>

      {/* Recent Activity */}
      {data.recent_activity.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Most Active Pages (7d)</h3>
          <div className="space-y-2">
            {data.recent_activity.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-gray-700">{a.page || a.action}</span>
                <span className="text-gray-400">{a.count} views</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

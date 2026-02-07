'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/dashboard/AuthProvider';
import { isExecRole } from '@/lib/roles';

interface Event { id: string; title: string; description: string | null; event_type: string; location: string | null; start_time: string; end_time: string | null; semester_id: string | null; is_mandatory: number; points_value: number; creator_first: string; creator_last: string; }
interface Semester { id: string; name: string; is_current: number; }
interface AttendanceRecord { id: string; member_id: string; first_name: string; last_name: string; status: string; excuse_reason: string | null; }
interface Member { id: string; first_name: string; last_name: string; }

const TYPE_LABELS: Record<string, string> = { general: 'General', chapter: 'Chapter', social: 'Social', community_service: 'Community Service', philanthropy: 'Philanthropy', brotherhood: 'Brotherhood', rush: 'Rush', other: 'Other' };
const STATUS_COLORS: Record<string, string> = { present: 'bg-green-100 text-green-700', late: 'bg-yellow-100 text-yellow-700', excused: 'bg-blue-100 text-blue-700', absent: 'bg-red-100 text-red-700' };

export default function EventsPage() {
  const { member } = useAuth();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');
  const isExec = isExecRole(member?.role || '');
  const canMark = ['admin', 'president', 'secretary'].includes(member?.role || '');

  const [events, setEvents] = useState<Event[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [message, setMessage] = useState('');

  // Event detail
  const [detail, setDetail] = useState<(Event & { attendance: AttendanceRecord[] }) | null>(null);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});

  // New event form
  const [form, setForm] = useState({ title: '', description: '', event_type: 'general', location: '', start_time: '', end_time: '', is_mandatory: false, points_value: '0', slug: '', is_public: false, flyer_url: '', cover_url: '', address: '', age_requirement: '', dress_code: '', ticket_url: '', ticket_price: '', disclaimer: '', capacity: '', parking_info: '', contact_info: '' });
  const [showPublicFields, setShowPublicFields] = useState(false);

  const fetchSemesters = useCallback(async () => {
    const res = await fetch('/api/semesters', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      setSemesters(data);
      const current = data.find((s: Semester) => s.is_current);
      if (current && !selectedSemester) setSelectedSemester(current.id);
      else if (data.length && !selectedSemester) setSelectedSemester(data[0].id);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const q = selectedSemester ? `?semester_id=${selectedSemester}` : '';
    const res = await fetch(`/api/events${q}`, { credentials: 'include' });
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }, [selectedSemester]);

  const fetchDetail = useCallback(async (id: string) => {
    const [evRes, memRes] = await Promise.all([
      fetch(`/api/events/${id}`, { credentials: 'include' }),
      fetch('/api/members', { credentials: 'include' }),
    ]);
    if (evRes.ok) {
      const data = await evRes.json();
      setDetail(data);
      const map: Record<string, string> = {};
      for (const a of data.attendance) map[a.member_id] = a.status;
      setAttendanceMap(map);
    }
    if (memRes.ok) setAllMembers(await memRes.json());
  }, []);

  useEffect(() => { fetchSemesters(); }, [fetchSemesters]);
  useEffect(() => { if (selectedSemester) fetchEvents(); }, [selectedSemester, fetchEvents]);
  useEffect(() => { if (eventId) fetchDetail(eventId); }, [eventId, fetchDetail]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/events', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ ...form, semester_id: selectedSemester, points_value: Number(form.points_value) }),
    });
    if (res.ok) { setShowNew(false); setForm({ title: '', description: '', event_type: 'general', location: '', start_time: '', end_time: '', is_mandatory: false, points_value: '0', slug: '', is_public: false, flyer_url: '', cover_url: '', address: '', age_requirement: '', dress_code: '', ticket_url: '', ticket_price: '', disclaimer: '', capacity: '', parking_info: '', contact_info: '' }); setShowPublicFields(false); fetchEvents(); }
    else { const d = await res.json(); setMessage(d.error || 'Failed'); }
  };

  const handleSaveAttendance = async () => {
    if (!eventId) return;
    const records = Object.entries(attendanceMap).map(([member_id, status]) => ({ member_id, status }));
    const res = await fetch('/api/attendance', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ event_id: eventId, records }),
    });
    if (res.ok) { setMessage('Attendance saved.'); fetchDetail(eventId); }
  };

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none transition-all';

  // Event detail view
  if (eventId && detail) {
    return (
      <div>
        <div className="mb-6">
          <a href="/dashboard/events" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">&larr; Back to Events</a>
          <h1 className="text-xl font-semibold text-gray-900 mt-2">{detail.title}</h1>
          <div className="flex gap-3 mt-1 text-xs text-gray-500">
            <span className="bg-gray-100 px-2 py-0.5 rounded-full uppercase">{TYPE_LABELS[detail.event_type]}</span>
            {detail.is_mandatory ? <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Mandatory</span> : null}
            {detail.points_value > 0 && <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">{detail.points_value} pts</span>}
          </div>
          {detail.description && <p className="text-sm text-gray-600 mt-3">{detail.description}</p>}
          <div className="text-xs text-gray-500 mt-2">
            {detail.location && <span>{detail.location} &middot; </span>}
            {new Date(detail.start_time).toLocaleString()}
          </div>
        </div>

        {message && <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 text-green-600 border border-green-200">{message}</div>}

        {/* Attendance roll call */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h2 className="text-sm font-medium text-gray-900">Attendance</h2>
            {canMark && <button onClick={handleSaveAttendance} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition-all">Save</button>}
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Member</th>
                <th className="text-left text-[10px] text-gray-400 uppercase tracking-wider font-medium px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {allMembers.filter(m => m.id !== undefined).map(m => (
                <tr key={m.id} className="border-b border-gray-50">
                  <td className="px-5 py-2.5 text-xs font-medium text-gray-900">{m.first_name} {m.last_name}</td>
                  <td className="px-5 py-2.5">
                    {canMark ? (
                      <select value={attendanceMap[m.id] || 'absent'} onChange={e => setAttendanceMap({ ...attendanceMap, [m.id]: e.target.value })} className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase border-0 cursor-pointer ${STATUS_COLORS[attendanceMap[m.id] || 'absent']}`}>
                        <option value="present">Present</option>
                        <option value="late">Late</option>
                        <option value="excused">Excused</option>
                        <option value="absent">Absent</option>
                      </select>
                    ) : (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${STATUS_COLORS[attendanceMap[m.id] || 'absent']}`}>{attendanceMap[m.id] || 'absent'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Attendance stats
  const [attendanceTab, setAttendanceTab] = useState<'events' | 'attendance'>('events');
  const [attStats, setAttStats] = useState<{ id: string; first_name: string; last_name: string; present_count: number; late_count: number; excused_count: number; absent_count: number; attendance_pct: number | null }[]>([]);
  const [attLoading, setAttLoading] = useState(false);

  const fetchAttStats = useCallback(async () => {
    if (!selectedSemester) return;
    setAttLoading(true);
    const res = await fetch(`/api/attendance/stats?semester_id=${selectedSemester}`, { credentials: 'include' });
    if (res.ok) setAttStats(await res.json());
    setAttLoading(false);
  }, [selectedSemester]);

  useEffect(() => { if (attendanceTab === 'attendance') fetchAttStats(); }, [attendanceTab, fetchAttStats]);

  const pctColor = (pct: number | null) => {
    if (pct === null) return 'text-gray-400';
    if (pct >= 80) return 'text-green-600';
    if (pct >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-1">{events.length} event{events.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
            {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {isExec && <button onClick={() => setShowNew(true)} className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all">New Event</button>}
        </div>
      </div>

      {/* Tabs */}
      {isExec && (
        <div className="flex gap-2 mb-6">
          <button onClick={() => setAttendanceTab('events')} className={`text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg transition-all ${attendanceTab === 'events' ? 'bg-gray-900 text-white' : 'text-gray-500 border border-gray-200 hover:border-gray-300'}`}>Events</button>
          <button onClick={() => setAttendanceTab('attendance')} className={`text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-lg transition-all ${attendanceTab === 'attendance' ? 'bg-gray-900 text-white' : 'text-gray-500 border border-gray-200 hover:border-gray-300'}`}>Attendance Stats</button>
        </div>
      )}

      {message && <div className="mb-4 p-3 rounded-lg text-xs text-center bg-green-50 text-green-600 border border-green-200">{message}</div>}

      {/* Attendance Stats Tab */}
      {attendanceTab === 'attendance' && isExec && (
        attLoading ? (
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
                {attStats.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
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
        )
      )}

      {attendanceTab === 'events' && showNew && isExec && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="text-sm font-medium text-gray-900">Create Event</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Title</label><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className={inputClass} /></div>
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Type</label><select value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value })} className={inputClass}>{Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Start Time</label><input type="datetime-local" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} required className={inputClass} /></div>
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">End Time</label><input type="datetime-local" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Location</label><input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className={inputClass} /></div>
            <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Points</label><input type="number" value={form.points_value} onChange={e => setForm({ ...form, points_value: e.target.value })} min="0" className={inputClass} /></div>
          </div>
          <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className={inputClass} /></div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.is_mandatory} onChange={e => setForm({ ...form, is_mandatory: e.target.checked })} /> Mandatory event</label>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.is_public} onChange={e => setForm({ ...form, is_public: e.target.checked })} /> Public event page</label>
          </div>

          {/* Public event fields toggle */}
          <button type="button" onClick={() => setShowPublicFields(!showPublicFields)} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            {showPublicFields ? '▾ Hide public page fields' : '▸ Show public page fields (flyer, address, rules, etc.)'}
          </button>

          {showPublicFields && (
            <div className="border border-gray-100 rounded-lg p-4 space-y-4 bg-gray-50/50">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Public Event Page Fields</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">URL Slug</label><input type="text" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from title" className={inputClass} /></div>
                <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Flyer Image URL</label><input type="text" value={form.flyer_url} onChange={e => setForm({ ...form, flyer_url: e.target.value })} className={inputClass} /></div>
                <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Cover Image URL</label><input type="text" value={form.cover_url} onChange={e => setForm({ ...form, cover_url: e.target.value })} className={inputClass} /></div>
                <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Full Address</label><input type="text" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className={inputClass} /></div>
                <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Age Requirement</label><input type="text" value={form.age_requirement} onChange={e => setForm({ ...form, age_requirement: e.target.value })} placeholder="e.g. 18+ to enter, 21+ to drink" className={inputClass} /></div>
                <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Dress Code</label><input type="text" value={form.dress_code} onChange={e => setForm({ ...form, dress_code: e.target.value })} className={inputClass} /></div>
                <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Ticket URL</label><input type="text" value={form.ticket_url} onChange={e => setForm({ ...form, ticket_url: e.target.value })} className={inputClass} /></div>
                <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Ticket Price</label><input type="text" value={form.ticket_price} onChange={e => setForm({ ...form, ticket_price: e.target.value })} placeholder="e.g. $15 presale / $20 door" className={inputClass} /></div>
                <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Capacity</label><input type="text" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className={inputClass} /></div>
                <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Contact Info</label><input type="text" value={form.contact_info} onChange={e => setForm({ ...form, contact_info: e.target.value })} className={inputClass} /></div>
              </div>
              <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Parking Info</label><input type="text" value={form.parking_info} onChange={e => setForm({ ...form, parking_info: e.target.value })} className={inputClass} /></div>
              <div><label className="block text-[10px] text-gray-400 mb-1.5 uppercase tracking-wider">Disclaimer / Legal</label><textarea value={form.disclaimer} onChange={e => setForm({ ...form, disclaimer: e.target.value })} rows={2} className={inputClass} /></div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" className="bg-gray-900 text-white text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-800 transition-all">Create</button>
            <button type="button" onClick={() => setShowNew(false)} className="text-gray-500 text-[11px] uppercase tracking-[0.15em] font-semibold px-6 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all">Cancel</button>
          </div>
        </form>
      )}

      {attendanceTab === 'events' && (
        loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center"><div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" /></div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">No events yet.</div>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <a key={ev.id} href={`/dashboard/events?id=${ev.id}`} className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{ev.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">{TYPE_LABELS[ev.event_type]}</span>
                      {ev.is_mandatory ? <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Mandatory</span> : null}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 text-right">
                    <p>{new Date(ev.start_time).toLocaleDateString()}</p>
                    {ev.location && <p className="mt-0.5">{ev.location}</p>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        )
      )}
    </div>
  );
}

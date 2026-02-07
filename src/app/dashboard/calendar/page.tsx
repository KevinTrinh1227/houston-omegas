'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  event_type: string;
  start_time: string;
  is_mandatory: number;
}

interface Meeting {
  id: string;
  title: string;
  meeting_date: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const fetchData = useCallback(async () => {
    // Fetch events for the current semester (the API returns all events for the selected semester)
    const evRes = await fetch('/api/events', { credentials: 'include' });
    if (evRes.ok) setEvents(await evRes.json());

    const mtRes = await fetch('/api/meetings', { credentials: 'include' });
    if (mtRes.ok) {
      const data = await mtRes.json();
      setMeetings(Array.isArray(data) ? data : data.meetings || []);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const goToToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  // Map events to days
  const eventsByDay: Record<number, { type: 'event' | 'meeting'; title: string; color: string; id: string; mandatory?: boolean }[]> = {};
  events.forEach(ev => {
    const d = new Date(ev.start_time);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push({
        type: 'event',
        title: ev.title,
        color: ev.is_mandatory ? 'bg-red-500' : 'bg-blue-500',
        id: ev.id,
        mandatory: !!ev.is_mandatory,
      });
    }
  });
  meetings.forEach(mt => {
    const d = new Date(mt.meeting_date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push({
        type: 'meeting',
        title: mt.title,
        color: 'bg-green-500',
        id: mt.id,
      });
    }
  });

  const cells = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="min-h-[80px] sm:min-h-[100px] border-b border-r border-gray-100" />);
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEvents = eventsByDay[day] || [];
    cells.push(
      <div key={day} className={`min-h-[80px] sm:min-h-[100px] border-b border-r border-gray-100 p-1.5 ${isToday(day) ? 'bg-blue-50/50' : 'hover:bg-gray-50/50'} transition-colors`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${isToday(day) ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-gray-500'}`}>
            {day}
          </span>
        </div>
        <div className="space-y-0.5">
          {dayEvents.slice(0, 3).map((ev, i) => (
            <a
              key={i}
              href={ev.type === 'event' ? `/dashboard/events?id=${ev.id}` : `/dashboard/meetings`}
              className={`block text-[9px] sm:text-[10px] text-white px-1.5 py-0.5 rounded truncate ${ev.color} hover:opacity-80 transition-opacity`}
            >
              {ev.title}
            </a>
          ))}
          {dayEvents.length > 3 && (
            <span className="text-[9px] text-gray-400">+{dayEvents.length - 3} more</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Events and meetings overview</p>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ChevronLeft size={18} /></button>
          <h2 className="text-sm font-semibold text-gray-900 min-w-[160px] text-center">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"><ChevronRight size={18} /></button>
        </div>
        <button onClick={goToToday} className="text-[11px] uppercase tracking-[0.15em] font-semibold text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:border-gray-300 transition-all">Today</button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-[10px] text-gray-500">Event</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /><span className="text-[10px] text-gray-500">Meeting</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-[10px] text-gray-500">Mandatory</span></div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-[10px] text-gray-400 uppercase tracking-wider font-semibold py-2.5 border-r border-gray-100 last:border-r-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells}
        </div>
      </div>
    </div>
  );
}

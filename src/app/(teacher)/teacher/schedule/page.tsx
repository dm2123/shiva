'use client';

import { useState, useEffect } from 'react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_COLORS = ['bg-slate-100 text-slate-600', 'bg-blue-50 text-blue-700', 'bg-purple-50 text-purple-700',
  'bg-indigo-50 text-indigo-700', 'bg-teal-50 text-teal-700', 'bg-orange-50 text-orange-700', 'bg-rose-50 text-rose-700'];

export default function TeacherSchedulePage() {
  const [data, setData] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teacher/schedule').then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading schedule...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load schedule</div>;

  const todaySchedule = data.schedules?.filter((s: any) => s.dayOfWeek === selectedDay) || [];
  const weekSchedule = DAYS.map((day, i) => ({
    day, index: i,
    classes: data.schedules?.filter((s: any) => s.dayOfWeek === i) || []
  }));

  const formatTime = (t: string) => {
    const [h, m] = t.split(':');
    const hr = parseInt(h);
    return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Schedule</h1>
        <p className="text-sm text-slate-500 mt-1">Weekly teaching timetable</p>
      </div>

      {/* Today&apos;s Classes */}
      {data.todayClasses?.length > 0 && (
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-5 text-white">
          <h3 className="text-xs font-bold uppercase tracking-wider opacity-80 mb-3">Today&apos;s Classes</h3>
          <div className="space-y-2">
            {data.todayClasses.map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl p-3">
                <div className="text-center">
                  <p className="text-lg font-black">{formatTime(c.startTime).split(' ')[0]}</p>
                  <p className="text-[10px] opacity-70">{formatTime(c.startTime).split(' ')[1]}</p>
                </div>
                <div className="flex-1">
                  <p className="font-bold">{c.title}</p>
                  <p className="text-xs opacity-70">{c.room || 'Online'} • {c.courseTitle}</p>
                </div>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded uppercase">{c.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Live Classes */}
      {data.upcomingClasses?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 mb-3">Upcoming Live Classes</h3>
          <div className="space-y-2">
            {data.upcomingClasses.map((lc: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${
                  lc.status === 'LIVE' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  {lc.status === 'LIVE' ? 'LIVE' : 'SCH'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{lc.title}</p>
                  <p className="text-xs text-slate-500">{new Date(lc.scheduledStartAt || lc.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  lc.status === 'LIVE' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                }`}>{lc.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Timetable */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex overflow-x-auto">
          {weekSchedule.map(({ day, index, classes }) => (
            <button key={index} onClick={() => setSelectedDay(index)}
              className={`flex-shrink-0 px-4 py-3 text-xs font-bold transition-all ${
                selectedDay === index
                  ? `${DAY_COLORS[index]} border-b-2 border-current`
                  : 'text-slate-400 hover:text-slate-600'
              }`}>
              {day.slice(0, 3)}
              {classes.length > 0 && (
                <span className="ml-1 w-4 h-4 inline-flex items-center justify-center bg-current/10 rounded-full text-[9px]">
                  {classes.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-5">
          <h3 className="font-bold text-slate-900 mb-4">{DAYS[selectedDay]} Schedule</h3>
          {todaySchedule.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p className="text-3xl mb-2">🎉</p>
              <p className="text-sm">No classes scheduled for {DAYS[selectedDay]}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime)).map((s: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                  <div className="text-center min-w-[60px]">
                    <p className="text-sm font-black text-slate-900">{formatTime(s.startTime)}</p>
                    <p className="text-[10px] text-slate-400">to {formatTime(s.endTime)}</p>
                  </div>
                  <div className="h-10 w-px bg-slate-200"></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{s.title}</p>
                    <p className="text-xs text-slate-500">{s.room || 'Online'} • {s.courseTitle}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                    s.type === 'LECTURE' ? 'bg-blue-100 text-blue-700' :
                    s.type === 'LIVE_CLASS' ? 'bg-red-100 text-red-700' :
                    s.type === 'DOUBT_SESSION' ? 'bg-amber-100 text-amber-700' :
                    s.type === 'TEST' ? 'bg-purple-100 text-purple-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>{s.type.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

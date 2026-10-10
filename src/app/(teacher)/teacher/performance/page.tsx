'use client';

import { useState, useEffect } from 'react';

export default function TeacherPerformancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teacher/performance').then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading performance...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load</div>;

  const s = data.summary;

  const StatCard = ({ label, value, icon, color, sub }: any) => (
    <div className={`${color} rounded-2xl p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</p>
          <p className="text-2xl font-black mt-1">{value}</p>
          {sub && <p className="text-xs mt-1 opacity-70">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Performance Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Your teaching metrics and analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Classes Conducted" value={s.totalClasses} icon="📚" color="bg-blue-50 border border-blue-100"
          sub={`${s.totalScheduled} scheduled, ${s.totalCancelled} cancelled`} />
        <StatCard label="Avg Attendance" value={`${s.attendanceRate}%`} icon="📊" color="bg-emerald-50 border border-emerald-100"
          sub={`${s.totalStudents} students enrolled`} />
        <StatCard label="Avg Rating" value={s.platformRating > 0 ? `${s.platformRating}/5` : 'N/A'} icon="⭐"
          color="bg-amber-50 border border-amber-100" sub={`${s.totalPlatformRatings} ratings`} />
        <StatCard label="Engagement Score" value={`${s.engagementScore}/100`} icon="🔥"
          color="bg-rose-50 border border-rose-100" sub="Composite score" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Live Class Hours" value={`${s.totalHours}h`} icon="⏰" color="bg-purple-50 border border-purple-100" />
        <StatCard label="Doubts Resolved" value={s.totalDoubts} icon="❓" color="bg-indigo-50 border border-indigo-100"
          sub={`${s.doubtResolutionRate}% resolution rate`} />
        <StatCard label="Students Helped" value={s.totalStudents} icon="👥" color="bg-teal-50 border border-teal-100" />
        <StatCard label="Active Live" value={s.activeLiveClasses} icon="🔴" color="bg-red-50 border border-red-100"
          sub={`${s.totalLiveClasses} total`} />
      </div>

      {/* Weekly Performance */}
      {data.weekly?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900 mb-4">Weekly Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-xs font-bold text-slate-500">Week</th>
                  <th className="text-center py-2 text-xs font-bold text-slate-500">Scheduled</th>
                  <th className="text-center py-2 text-xs font-bold text-slate-500">Conducted</th>
                  <th className="text-center py-2 text-xs font-bold text-slate-500">Attendance</th>
                  <th className="text-center py-2 text-xs font-bold text-slate-500">Rating</th>
                  <th className="text-center py-2 text-xs font-bold text-slate-500">Doubts</th>
                  <th className="text-center py-2 text-xs font-bold text-slate-500">Hours</th>
                  <th className="text-center py-2 text-xs font-bold text-slate-500">Score</th>
                </tr>
              </thead>
              <tbody>
                {data.weekly.map((w: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 font-medium text-slate-900">{new Date(w.weekStart).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                    <td className="py-3 text-center">{w.classesScheduled}</td>
                    <td className="py-3 text-center">
                      <span className={w.classesConducted === w.classesScheduled ? 'text-emerald-600 font-bold' : ''}>
                        {w.classesConducted}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${w.avgAttendancePercent}%` }}></div>
                        </div>
                        <span className="text-xs">{w.avgAttendancePercent}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                      <span className="text-amber-500">{w.avgStudentRating > 0 ? `⭐ ${w.avgStudentRating}` : '-'}</span>
                    </td>
                    <td className="py-3 text-center">{w.doubtsResolved}</td>
                    <td className="py-3 text-center">{w.liveClassHours}h</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        w.engagementScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                        w.engagementScore >= 60 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{w.engagementScore}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

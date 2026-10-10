'use client';

import { useState, useEffect } from 'react';

export default function AdminStudentSearchPage() {
  const [data, setData] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('page', String(page));
    fetch(`/api/admin/student-search?${params}`).then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
    });
  }, [query, page]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Search</h1>
        <p className="text-sm text-slate-500 mt-1">Search all students in the platform</p>
      </div>

      {data?.stats && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total', value: data.stats.totalStudents, color: 'bg-blue-50' },
            { label: 'Active', value: data.stats.activeStudents, color: 'bg-emerald-50' },
            { label: 'Avg Score', value: `${data.stats.avgScore || 0}%`, color: 'bg-amber-50' },
            { label: 'Avg XP', value: data.stats.avgXP || 0, color: 'bg-purple-50' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-2xl p-4 text-center`}>
              <p className="text-xl font-black text-slate-900">{s.value}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <input type="text" placeholder="Search by name, email, phone, exam..." value={query}
          onChange={e => { setQuery(e.target.value); setPage(1); }}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Searching...</div>
      ) : (
        <div className="space-y-3">
          {data?.students?.map((s: any) => (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {(s.name || 'S')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900">{s.name || 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{s.email}</p>
                  <div className="flex gap-2 mt-1">
                    {s.targetExam && <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">{s.targetExam}</span>}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      s.enrollmentStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>{s.enrollmentStatus || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex gap-4 text-center text-xs">
                  <div><p className="font-bold text-slate-900">{s.totalXP || 0}</p><p className="text-[10px] text-slate-400">XP</p></div>
                  <div><p className="font-bold text-slate-900">{s.avgTestScore || 0}%</p><p className="text-[10px] text-slate-400">Score</p></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

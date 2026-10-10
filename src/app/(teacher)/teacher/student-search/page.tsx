'use client';

import { useState, useEffect } from 'react';

export default function StudentSearchPage() {
  const [data, setData] = useState<any>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (statusFilter) params.set('status', statusFilter);
    params.set('page', String(page));
    fetch(`/api/teacher/student-search?${params}`).then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
    });
  }, [query, statusFilter, page]);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Student Search</h1>
        <p className="text-sm text-slate-500 mt-1">Look up students by name, email, or exam</p>
      </div>

      {/* Quick Stats */}
      {data?.stats && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: data.stats.totalStudents, icon: '👥', color: 'bg-blue-50' },
            { label: 'Active', value: data.stats.activeStudents, icon: '✅', color: 'bg-emerald-50' },
            { label: 'Avg Score', value: `${data.stats.avgScore || 0}%`, icon: '📊', color: 'bg-amber-50' },
            { label: 'Avg XP', value: data.stats.avgXP || 0, icon: '⭐', color: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-2xl p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{stat.value}</p>
                </div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input type="text" placeholder="Search by name, email, phone, or exam..."
              value={query} onChange={e => { setQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all" />
            <span className="absolute left-3 top-3.5 text-slate-400">🔍</span>
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 border border-slate-200 rounded-xl text-sm bg-white">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 animate-pulse">Searching...</div>
      ) : data?.students?.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-slate-400 font-medium">No students found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.students?.map((student: any) => (
            <div key={student.id} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {(student.name || 'S')[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{student.name || 'Unknown'}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      student.enrollmentStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      student.enrollmentStatus === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>{student.enrollmentStatus || 'N/A'}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{student.email}</p>
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                    {student.targetExam && <span className="bg-slate-100 px-2 py-0.5 rounded">{student.targetExam}</span>}
                    {student.batchName && <span>Batch: {student.batchName}</span>}
                  </div>
                </div>
                <div className="flex gap-4 flex-shrink-0 text-center">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{student.totalXP || 0}</p>
                    <p className="text-[10px] text-slate-400">XP</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{student.currentStreak || 0}</p>
                    <p className="text-[10px] text-slate-400">Streak</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{student.avgTestScore || 0}%</p>
                    <p className="text-[10px] text-slate-400">Score</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination?.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 text-sm font-bold bg-slate-100 rounded-lg disabled:opacity-50">Prev</button>
          <span className="px-4 py-2 text-sm text-slate-600">Page {page} of {data.pagination.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= data.pagination.totalPages}
            className="px-4 py-2 text-sm font-bold bg-slate-100 rounded-lg disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

export default function QuestionBankPage() {
  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState({ subjectId: '', chapterId: '', difficulty: '', type: '', tag: '', search: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set('page', String(page));
    fetch(`/api/student/question-bank?${params}`).then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
    });
  }, [filters, page]);

  if (!data && loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading questions...</div>;

  const diffColors: Record<string, string> = {
    EASY: 'bg-emerald-100 text-emerald-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HARD: 'bg-red-100 text-red-700',
    VERY_HARD: 'bg-purple-100 text-purple-700',
  };

  const typeColors: Record<string, string> = {
    MCQ: 'bg-blue-100 text-blue-700',
    MULTIPLE_CORRECT: 'bg-indigo-100 text-indigo-700',
    NUMERICAL: 'bg-teal-100 text-teal-700',
    SUBJECTIVE: 'bg-slate-100 text-slate-700',
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Question Bank</h1>
        <p className="text-sm text-slate-500 mt-1">{data?.pagination?.total || 0} questions available</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3">
          <input type="text" placeholder="Search questions..." value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 min-w-[200px] px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500" />
          <select value={filters.difficulty} onChange={e => setFilters({ ...filters, difficulty: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm">
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
            <option value="VERY_HARD">Very Hard</option>
          </select>
          <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm">
            <option value="">All Types</option>
            <option value="MCQ">MCQ</option>
            <option value="MULTIPLE_CORRECT">Multiple Correct</option>
            <option value="NUMERICAL">Numerical</option>
            <option value="SUBJECTIVE">Subjective</option>
          </select>
        </div>
        {/* Difficulty Distribution */}
        {data?.filters?.difficultyDistribution?.length > 0 && (
          <div className="flex gap-2 mt-3">
            {data.filters.difficultyDistribution.map((d: any) => (
              <button key={d.difficulty} onClick={() => setFilters({ ...filters, difficulty: filters.difficulty === d.difficulty ? '' : d.difficulty })}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  filters.difficulty === d.difficulty ? 'ring-2 ring-offset-1 ring-teal-500' : ''
                } ${diffColors[d.difficulty] || 'bg-slate-100'}`}>
                {d.difficulty} ({d.count})
              </button>
            ))}
          </div>
        )}
        {/* Tags */}
        {data?.filters?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {data.filters.tags.slice(0, 15).map((t: any) => (
              <button key={t.tag} onClick={() => setFilters({ ...filters, tag: filters.tag === t.tag ? '' : t.tag })}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                  filters.tag === t.tag ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>
                {t.tag} ({t.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Questions */}
      {loading ? (
        <div className="text-center py-8 text-slate-400 animate-pulse">Loading...</div>
      ) : (
        <div className="space-y-3">
          {data?.questions?.map((q: any, i: number) => (
            <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                  {(page - 1) * 20 + i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{q.questionText}</p>
                  {q.options?.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {q.options.map((opt: string, j: number) => (
                        <div key={j} className={`px-3 py-2 rounded-lg text-xs ${
                          opt === q.correctAnswer
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-50 text-slate-600'
                        }`}>
                          <span className="font-bold mr-1">{String.fromCharCode(65 + j)}.</span> {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${diffColors[q.difficulty] || 'bg-slate-100'}`}>
                      {q.difficulty || 'N/A'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[q.questionType] || 'bg-slate-100'}`}>
                      {q.questionType}
                    </span>
                    {q.subjectName && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{q.subjectName}</span>}
                    {q.chapterTitle && <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{q.chapterTitle}</span>}
                    {q.correctRate > 0 && (
                      <span className="text-[10px] text-slate-400">{q.correctRate}% correct • {q.totalAttempts} attempts</span>
                    )}
                  </div>
                  {q.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {q.tags.map((tag: string) => (
                        <span key={tag} className="text-[9px] bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-slate-900">{q.marks} marks</p>
                  {q.negativeMarks > 0 && <p className="text-[10px] text-red-500">-{q.negativeMarks}</p>}
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

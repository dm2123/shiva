'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const DIFF_STYLES: Record<string, string> = {
  EASY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  HARD: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  VERY_HARD: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const TYPE_STYLES: Record<string, string> = {
  MCQ: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  MULTIPLE_CORRECT: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  NUMERICAL: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  SUBJECTIVE: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const DIFF_LABELS: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  VERY_HARD: 'Very Hard',
};

export default function QuestionBankPage() {
  const [data, setData] = useState<any>(null);
  const [filters, setFilters] = useState({ subjectId: '', chapterId: '', difficulty: '', type: '', tag: '', search: '' });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    params.set('page', String(page));
    fetch(`/api/student/question-bank?${params}`).then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
      setLoading(false);
      setInitialLoad(false);
    }).catch(() => {
      setLoading(false);
      setInitialLoad(false);
    });
  }, [filters, page]);

  const totalQuestions = data?.pagination?.total || 0;
  const hasActiveFilters = Object.values(filters).some(v => v);

  const clearFilters = () => {
    setFilters({ subjectId: '', chapterId: '', difficulty: '', type: '', tag: '', search: '' });
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--student-text)] tracking-tight">
            Question Bank
          </h1>
          <p className="text-sm text-[var(--student-text-muted)] mt-1.5 max-w-xl leading-relaxed">
            Har topic ke handpicked questions — difficulty aur type ke hisaab se filter karo.
          </p>
        </div>
        {totalQuestions > 0 && (
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--student-text-muted)] bg-[var(--student-surface)] border border-[var(--student-border-light)] rounded-xl px-4 py-2.5">
            <svg className="w-4 h-4 text-[var(--student-primary)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3 2.95-1.722.375-3 1.55-3 2.95V17m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {totalQuestions} questions
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="student-card p-4 md:p-5">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--student-text-faint)]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search}
              onChange={e => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 border border-[var(--student-border)] rounded-xl text-sm bg-[var(--student-surface)] text-[var(--student-text)] placeholder:text-[var(--student-text-faint)] focus:outline-none focus:border-[var(--student-primary)]"
            />
          </div>
          <select
            value={filters.difficulty}
            onChange={e => { setFilters({ ...filters, difficulty: e.target.value }); setPage(1); }}
            className="px-3 py-2.5 border border-[var(--student-border)] rounded-xl text-sm bg-[var(--student-surface)] text-[var(--student-text)] focus:outline-none focus:border-[var(--student-primary)]"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
            <option value="VERY_HARD">Very Hard</option>
          </select>
          <select
            value={filters.type}
            onChange={e => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}
            className="px-3 py-2.5 border border-[var(--student-border)] rounded-xl text-sm bg-[var(--student-surface)] text-[var(--student-text)] focus:outline-none focus:border-[var(--student-primary)]"
          >
            <option value="">All Types</option>
            <option value="MCQ">MCQ</option>
            <option value="MULTIPLE_CORRECT">Multiple Correct</option>
            <option value="NUMERICAL">Numerical</option>
            <option value="SUBJECTIVE">Subjective</option>
          </select>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-[var(--student-border)] text-[var(--student-text-muted)] hover:bg-[var(--student-surface-hover)] transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Difficulty Distribution */}
        {data?.filters?.difficultyDistribution?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {data.filters.difficultyDistribution.map((d: any) => (
              <button
                key={d.difficulty}
                onClick={() => { setFilters({ ...filters, difficulty: filters.difficulty === d.difficulty ? '' : d.difficulty }); setPage(1); }}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                  filters.difficulty === d.difficulty
                    ? 'ring-2 ring-offset-1 ring-[var(--student-primary)]'
                    : ''
                } ${DIFF_STYLES[d.difficulty] || 'bg-slate-100 text-slate-600'}`}
              >
                {DIFF_LABELS[d.difficulty] || d.difficulty} · {d.count}
              </button>
            ))}
          </div>
        )}

        {/* Tags */}
        {data?.filters?.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {data.filters.tags.slice(0, 15).map((t: any) => (
              <button
                key={t.tag}
                onClick={() => { setFilters({ ...filters, tag: filters.tag === t.tag ? '' : t.tag }); setPage(1); }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                  filters.tag === t.tag
                    ? 'bg-[var(--student-primary)] text-white'
                    : 'bg-[var(--student-surface)] border border-[var(--student-border-light)] text-[var(--student-text-muted)] hover:border-[var(--student-border-strong)]'
                }`}
              >
                #{t.tag} ({t.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Questions */}
      {initialLoad && loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="student-card p-5 space-y-3">
              <div className="skeleton h-4 w-2/3" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-4/5" />
            </div>
          ))}
        </div>
      ) : totalQuestions === 0 && !hasActiveFilters ? (
        <div className="space-y-6">
          <div className="relative flex flex-col items-center justify-center p-12 md:p-16 text-center rounded-3xl border border-dashed border-[var(--student-border)] bg-gradient-to-b from-[var(--student-surface)] to-transparent overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3 2.95-1.722.375-3 1.55-3 2.95V17m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[var(--student-text)] tracking-tight mb-2">Question Bank jald aa raha hai</h3>
            <p className="text-sm text-[var(--student-text-muted)] max-w-sm mx-auto leading-relaxed">
              Hum har chapter ke liye curated questions taiyaar kar rahe hain — easy se lekar
              very hard tak. Tab tak Practice Zone try karo.
            </p>
          </div>
          <div className="student-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--student-text)]">Question Bank me kya milega?</h3>
                <p className="text-sm text-[var(--student-text-muted)] mt-1 leading-relaxed">
                  Difficulty-wise filtered questions, topic tags, solutions aur tumhare
                  attempt stats — sab ek jagah.
                </p>
              </div>
              <Link
                href="/app/practice"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity flex-shrink-0"
              >
                Practice Zone
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5-5 5M6 12h12" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {loading && (
            <div className="text-center py-4 text-sm text-[var(--student-text-faint)] animate-pulse">Loading questions...</div>
          )}
          {data?.questions?.map((q: any, i: number) => (
            <div key={q.id} className="student-card p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--student-surface)] border border-[var(--student-border-light)] flex items-center justify-center text-xs font-bold text-[var(--student-text-muted)] flex-shrink-0">
                  {(page - 1) * 20 + i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--student-text)] leading-relaxed">{q.questionText}</p>
                  {q.options?.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt: string, j: number) => (
                        <div key={j} className={`px-3 py-2.5 rounded-xl text-xs border ${
                          opt === q.correctAnswer
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                            : 'bg-[var(--student-surface)] text-[var(--student-text-muted)] border-[var(--student-border-light)]'
                        }`}>
                          <span className="font-bold mr-1.5">{String.fromCharCode(65 + j)}.</span> {opt}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${DIFF_STYLES[q.difficulty] || 'bg-slate-100 text-slate-600'}`}>
                      {DIFF_LABELS[q.difficulty] || q.difficulty || 'N/A'}
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${TYPE_STYLES[q.questionType] || 'bg-slate-100 text-slate-600'}`}>
                      {q.questionType?.replace('_', ' ')}
                    </span>
                    {q.subjectName && (
                      <span className="text-[10px] font-medium bg-[var(--student-surface)] border border-[var(--student-border-light)] text-[var(--student-text-muted)] px-2.5 py-1 rounded-full">
                        {q.subjectName}
                      </span>
                    )}
                    {q.chapterTitle && (
                      <span className="text-[10px] font-medium bg-[var(--student-surface)] border border-[var(--student-border-light)] text-[var(--student-text-muted)] px-2.5 py-1 rounded-full">
                        {q.chapterTitle}
                      </span>
                    )}
                    {q.correctRate > 0 && (
                      <span className="text-[10px] text-[var(--student-text-faint)]">{q.correctRate}% correct · {q.totalAttempts} attempts</span>
                    )}
                  </div>
                  {q.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {q.tags.map((tag: string) => (
                        <span key={tag} className="text-[10px] font-medium text-[var(--student-primary)] bg-[var(--student-primary-light)] px-2 py-0.5 rounded-full">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[var(--student-text)]">{q.marks}</p>
                  <p className="text-[10px] text-[var(--student-text-faint)]">marks</p>
                  {q.negativeMarks > 0 && <p className="text-[10px] text-red-500 font-semibold mt-0.5">-{q.negativeMarks}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-5 py-2.5 text-sm font-bold rounded-xl border border-[var(--student-border)] text-[var(--student-text)] hover:bg-[var(--student-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-[var(--student-text-muted)] font-medium">
            Page <span className="font-bold text-[var(--student-text)]">{page}</span> of {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= data.pagination.totalPages}
            className="px-5 py-2.5 text-sm font-bold rounded-xl border border-[var(--student-border)] text-[var(--student-text)] hover:bg-[var(--student-surface-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

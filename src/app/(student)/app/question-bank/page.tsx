'use client';

import { useState, useEffect } from 'react';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconBook } from '@/components/student/StudentIcons';

/* ------------------------------------------------------------------ */
/* THE SHIVA — Question Bank (student)                                 */
/* PW grammar: safed cards (radius 12px, patli border), violet         */
/* accent, compact rows. Options API ke `optionsList` ([{id, text}])   */
/* se aate hain — purana page `q.options.length` padhta tha jo DB ke   */
/* wrapper-object shape par undefined tha, isliye options kabhi        */
/* dikhe hi nahi. Sahi jawab attempt se pehle KABHI highlight nahi     */
/* hota — student kisi option par click kare (attempt) tabhi reveal    */
/* hota hai, PracticePlayer wale flow ki tarah, explanation ke saath.  */
/* Difficulty asal ho tabhi pill banta hai — 'N/A' kabhi print nahi.   */
/* ------------------------------------------------------------------ */

const CARD =
  'rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]';

const DIFF_STYLES: Record<string, string> = {
  EASY: 'bg-emerald-100 text-emerald-700',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HARD: 'bg-red-100 text-red-700',
  VERY_HARD: 'bg-purple-100 text-purple-700',
};

const TYPE_STYLES: Record<string, string> = {
  MCQ: 'bg-violet-100 text-violet-700',
  MULTIPLE_CORRECT: 'bg-purple-100 text-purple-700',
  NUMERICAL: 'bg-amber-100 text-amber-700',
  SUBJECTIVE: 'bg-slate-100 text-slate-700',
};

const DIFF_LABELS: Record<string, string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  VERY_HARD: 'Very Hard',
};

const SELECT_CLASSES =
  'rounded-lg border border-gray-300 bg-white px-2.5 py-2 text-[13px] font-medium text-gray-700 focus:border-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#6d28d9]/20';

interface QbOption {
  id: string;
  text: string;
}

/** API optionsList na de (purana cache) to raw options se wahi roop banao */
function clientOptions(q: any): QbOption[] {
  if (Array.isArray(q?.optionsList)) return q.optionsList;
  const raw = q?.options;
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw); } catch { return []; }
  }
  const arr = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.options) ? parsed.options : null);
  if (!arr) return [];
  return arr
    .map((o: any, i: number) => {
      if (typeof o === 'string') return { id: String.fromCharCode(97 + i), text: o };
      if (o && typeof o === 'object' && (o.text ?? o.label)) {
        return { id: String(o.id ?? String.fromCharCode(97 + i)), text: String(o.text ?? o.label) };
      }
      return null;
    })
    .filter(Boolean) as QbOption[];
}

function fmtMarks(v: any): string {
  const n = Number(v);
  if (!isFinite(n)) return String(v ?? '');
  return Number.isInteger(n) ? String(n) : String(n);
}

function QuestionRow({ q, index }: { q: any; index: number }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const options = clientOptions(q);
  const difficulty = q.difficulty ? String(q.difficulty).toUpperCase() : '';
  const isCorrect = (opt: QbOption) =>
    (q.correctAnswer != null && opt.id === String(q.correctAnswer)) ||
    (q.correctAnswer != null && opt.text === String(q.correctAnswer));
  const correctOpt = options.find(isCorrect);
  const pickedCorrect = picked != null && correctOpt ? picked === correctOpt.id || options.find((o) => o.id === picked)?.text === correctOpt.text : false;

  const attempt = (id: string) => {
    if (revealed) return;
    setPicked(id);
    setRevealed(true);
  };

  return (
    <div className={`${CARD} p-4 sm:p-5`}>
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#6d28d9]/10 text-[12px] font-extrabold text-[#6d28d9]">
          {index}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium leading-relaxed text-gray-900">{q.questionText}</p>

          {options.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {options.map((opt, j) => {
                const correct = isCorrect(opt);
                const isPicked = picked === opt.id;
                let cls = 'border-gray-200 bg-white text-gray-700 hover:border-[#6d28d9]/50 hover:bg-[#6d28d9]/5';
                if (!revealed && isPicked) cls = 'border-[#6d28d9] bg-[#6d28d9]/5 text-gray-900';
                if (revealed && correct) cls = 'border-emerald-300 bg-emerald-50 font-semibold text-emerald-800';
                else if (revealed && isPicked && !correct) cls = 'border-red-300 bg-red-50 text-red-700';
                else if (revealed) cls = 'border-gray-200 text-gray-500';
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => attempt(opt.id)}
                    disabled={revealed}
                    className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition ${cls}`}
                    aria-label={`Option ${String.fromCharCode(65 + j)}: ${opt.text}`}
                  >
                    <span className="font-extrabold">{String.fromCharCode(65 + j)}.</span>
                    <span className="min-w-0 flex-1">{opt.text}</span>
                    {revealed && correct && <span aria-hidden="true" className="font-extrabold">✓</span>}
                    {revealed && isPicked && !correct && <span aria-hidden="true" className="font-extrabold">✗</span>}
                  </button>
                );
              })}
            </div>
          )}

          {revealed && (
            <div className="mt-3">
              <p className={`text-xs font-bold ${pickedCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                {pickedCorrect
                  ? '✓ Sahi jawab! Badhai ho.'
                  : `✗ Galat jawab${correctOpt ? ` — sahi jawab: ${correctOpt.text}` : ''}`}
                <button
                  type="button"
                  onClick={() => { setPicked(null); setRevealed(false); }}
                  className="ml-3 font-bold text-[#6d28d9] hover:underline"
                >
                  Dobara try karo
                </button>
              </p>
              {q.explanation && (
                <p className="mt-2 rounded-lg bg-[#f5f3ff] px-3 py-2 text-xs leading-relaxed text-gray-600">
                  <span className="font-bold text-gray-800">Explanation: </span>
                  {q.explanation}
                </p>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            {difficulty && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${DIFF_STYLES[difficulty] || 'bg-slate-100 text-slate-600'}`}>
                {DIFF_LABELS[difficulty] || difficulty}
              </span>
            )}
            {q.questionType && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TYPE_STYLES[String(q.questionType).toUpperCase()] || 'bg-slate-100 text-slate-600'}`}>
                {String(q.questionType).replace('_', ' ')}
              </span>
            )}
            {(q.subjectName || q.chapterTitle) && (
              <span className="text-[11px] font-medium text-gray-400">
                {[q.subjectName, q.chapterTitle].filter(Boolean).join(' · ')}
              </span>
            )}
            {q.correctRate > 0 && (
              <span className="text-[11px] text-gray-400">{q.correctRate}% correct · {q.totalAttempts} attempts</span>
            )}
          </div>

          {q.tags?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {q.tags.map((tag: string) => (
                <span key={tag} className="rounded-full bg-[#6d28d9]/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#6d28d9]">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-extrabold text-gray-900">+{fmtMarks(q.marks)}</p>
          <p className="text-[10px] font-medium text-gray-400">marks</p>
          {Number(q.negativeMarks) > 0 && (
            <p className="mt-0.5 text-[11px] font-bold text-red-500">-{fmtMarks(q.negativeMarks)}</p>
          )}
        </div>
      </div>
    </div>
  );
}

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
  // Sirf asal difficulty wale buckets — bina label wala bucket (purana
  // NULL group) chip nahi banta (API bhi ab use bhejta hi nahi).
  const diffBuckets = (data?.filters?.difficultyDistribution || []).filter(
    (d: any) => d.difficulty && DIFF_LABELS[String(d.difficulty).toUpperCase()]
  );

  const clearFilters = () => {
    setFilters({ subjectId: '', chapterId: '', difficulty: '', type: '', tag: '', search: '' });
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-gray-900 md:text-2xl">
            Question Bank
          </h1>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-gray-500">
            Har topic ke handpicked questions — kisi bhi option par click karke apna jawab
            turant check karo.
          </p>
        </div>
        {totalQuestions > 0 && (
          <span className="rounded-full bg-[#6d28d9]/10 px-3 py-1.5 text-xs font-bold text-[#6d28d9]">
            {totalQuestions} questions
          </span>
        )}
      </div>

      {/* Filters — ek saaf row (wrap ke saath) */}
      <div className={`${CARD} p-4`}>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[170px] flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search}
              onChange={e => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#6d28d9] focus:outline-none focus:ring-2 focus:ring-[#6d28d9]/20"
            />
          </div>
          {/* Subject / Chapter — options API ke filters.subjects /
              filters.chapters se aate hain (sirf wahi jinke paas asal
              questions hain). List khaali ho to dropdown hi nahi banta. */}
          {data?.filters?.subjects?.length > 0 && (
            <select
              value={filters.subjectId}
              onChange={e => { setFilters({ ...filters, subjectId: e.target.value, chapterId: '' }); setPage(1); }}
              className={SELECT_CLASSES}
              aria-label="Subject se filter karo"
            >
              <option value="">All Subjects</option>
              {data.filters.subjects.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name} ({s.questionCount})</option>
              ))}
            </select>
          )}
          {data?.filters?.chapters?.length > 0 && (
            <select
              value={filters.chapterId}
              onChange={e => { setFilters({ ...filters, chapterId: e.target.value }); setPage(1); }}
              className={SELECT_CLASSES}
              aria-label="Chapter se filter karo"
            >
              <option value="">All Chapters</option>
              {data.filters.chapters
                .filter((c: any) => !filters.subjectId || c.subjectId === filters.subjectId)
                .map((c: any) => (
                  <option key={c.id} value={c.id}>{c.title} ({c.questionCount})</option>
                ))}
            </select>
          )}
          <select
            value={filters.difficulty}
            onChange={e => { setFilters({ ...filters, difficulty: e.target.value }); setPage(1); }}
            className={SELECT_CLASSES}
            aria-label="Difficulty se filter karo"
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
            className={SELECT_CLASSES}
            aria-label="Type se filter karo"
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
              className="rounded-lg border border-gray-300 px-3 py-2 text-[13px] font-bold text-gray-600 transition hover:border-red-300 hover:text-red-600"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Difficulty chips — asal buckets hi */}
        {diffBuckets.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {diffBuckets.map((d: any) => {
              const key = String(d.difficulty).toUpperCase();
              const active = filters.difficulty === key;
              return (
                <button
                  key={key}
                  onClick={() => { setFilters({ ...filters, difficulty: active ? '' : key }); setPage(1); }}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${DIFF_STYLES[key] || 'bg-slate-100 text-slate-600'} ${active ? 'ring-2 ring-[#6d28d9] ring-offset-1' : 'opacity-80 hover:opacity-100'}`}
                >
                  {DIFF_LABELS[key]} · {d.count}
                </button>
              );
            })}
          </div>
        )}

        {/* Tags */}
        {data?.filters?.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.filters.tags.slice(0, 15).map((t: any) => (
              <button
                key={t.tag}
                onClick={() => { setFilters({ ...filters, tag: filters.tag === t.tag ? '' : t.tag }); setPage(1); }}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                  filters.tag === t.tag
                    ? 'bg-[#6d28d9] text-white'
                    : 'border border-gray-200 bg-white text-gray-500 hover:border-[#6d28d9]/40 hover:text-[#6d28d9]'
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
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`${CARD} animate-pulse p-5`}>
              <div className="h-4 w-2/3 rounded bg-gray-100" />
              <div className="mt-3 h-3 w-full rounded bg-gray-100" />
              <div className="mt-2 h-3 w-4/5 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : totalQuestions === 0 && !hasActiveFilters ? (
        <StudentEmptyState
          icon={<IconBook size={22} />}
          title="Question Bank jald aa raha hai"
          description="Hum har chapter ke liye curated questions taiyaar kar rahe hain — easy se lekar very hard tak. Tab tak Practice Zone me chapter-wise questions se abhyaas karo."
          actionText="Practice Zone"
          actionHref="/app/practice"
          variant="compact"
        />
      ) : totalQuestions === 0 ? (
        <div className={`${CARD} p-8 text-center`} role="status">
          <h3 className="text-[15px] font-bold text-gray-900">Is filter me koi question nahi mila</h3>
          <p className="mx-auto mt-1 max-w-sm text-[13px] leading-relaxed text-gray-500">
            Dusra subject, chapter ya difficulty chuno — ya saare filters hata kar poora
            question bank dekho.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 rounded-full bg-[#6d28d9] px-6 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#5b21b6]"
          >
            Saare Filters Hatao
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {loading && (
            <p className="py-1 text-center text-[13px] text-gray-400 animate-pulse">Loading questions...</p>
          )}
          {data?.questions?.map((q: any, i: number) => (
            <QuestionRow key={q.id} q={q} index={(page - 1) * 20 + i + 1} />
          ))}
        </div>
      )}

      {/* Pagination — API page/limit deta hai (20 per page) */}
      {data?.pagination?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-bold text-gray-700 transition hover:border-[#6d28d9] hover:text-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-[13px] font-medium text-gray-500">
            Page <span className="font-bold text-gray-900">{page}</span> of {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= data.pagination.totalPages}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-[13px] font-bold text-gray-700 transition hover:border-[#6d28d9] hover:text-[#6d28d9] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

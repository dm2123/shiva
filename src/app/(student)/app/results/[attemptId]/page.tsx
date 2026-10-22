import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { findAssessmentAttemptDb, findTestByIdDb, listAssessmentResponsesByAttemptDb, listSubjectsByCourseDb, listChaptersBySubjectDb, listQuestionsByChapterDb } from '@/lib/db';
import { StudentPageHeader } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconArrowLeft, IconCheckCircle, IconX, IconTrendingUp, IconClock, IconTarget } from '@/components/student/StudentIcons';

export const revalidate = 0;

function normalizeOptions(raw: any): { id: string; text: string }[] {
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw); } catch { return []; }
  }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.options)) return parsed.options;
  return [];
}

function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

type Strength = { label: string; classes: string; bar: string };
function strengthOf(accuracy: number): Strength {
  if (accuracy >= 70) return { label: 'Strong', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', bar: 'bg-emerald-500' };
  if (accuracy >= 40) return { label: 'Average', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', bar: 'bg-amber-500' };
  return { label: 'Weak', classes: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', bar: 'bg-red-500' };
}

export default async function ResultDetailPage({ params }: { params: { attemptId: string } }) {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const attempt = await findAssessmentAttemptDb(params.attemptId);
  if (!attempt || attempt.studentId !== session.userId) {
    notFound();
  }

  const test = await findTestByIdDb(attempt.assessmentId);
  if (!test) notFound();

  const responses = (await listAssessmentResponsesByAttemptDb(attempt.id)) || [];

  // Question -> chapter/subject mapping ke saath (topic-wise analysis ke liye)
  const subjects = await listSubjectsByCourseDb(test.courseId);
  const questionMeta = new Map<string, { question: any; chapterTitle: string; subjectName: string }>();
  for (const subject of subjects as any[]) {
    const chapters = await listChaptersBySubjectDb(subject.id);
    for (const chapter of chapters as any[]) {
      const qs = await listQuestionsByChapterDb(chapter.id);
      for (const q of qs as any[]) {
        questionMeta.set(q.id, { question: q, chapterTitle: chapter.title, subjectName: subject.name });
      }
    }
  }

  const score = Math.max(0, Number(attempt.score || 0));
  const max = Number(test.totalMarks || 0);
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const passed = test.passingMarks != null ? score >= Number(test.passingMarks) : pct >= 35;

  const rows = (responses as any[]).map((r: any) => {
    const meta = questionMeta.get(r.questionId);
    const attempted = !!r.selectedOptionId || !!(r.answerText && String(r.answerText).trim());
    return {
      response: r,
      question: meta?.question || null,
      chapterTitle: meta?.chapterTitle || '',
      subjectName: meta?.subjectName || '',
      options: meta ? normalizeOptions(meta.question.options) : [],
      attempted,
      isCorrect: !!r.isCorrect,
    };
  });

  const totalQ = rows.length;
  const correctCount = rows.filter((r) => r.isCorrect).length;
  const attemptedCount = rows.filter((r) => r.attempted).length;
  const wrongCount = attemptedCount - correctCount;
  const skippedCount = totalQ - attemptedCount;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  // ── Time analysis (asal data se hi) ──────────────────────
  // Pehle app ka bheja timeTakenSec (jab column/value maujood ho),
  // warna startedAt -> completedAt ka asal farak (website attempts).
  const allowedSec = Number(test.durationMinutes || 0) * 60;
  let timeTakenSec: number | null = null;
  const stored = Number((attempt as any).timeTakenSec);
  if (Number.isFinite(stored) && stored > 0) {
    timeTakenSec = stored;
  } else if (attempt.startedAt && attempt.completedAt) {
    const diff = (new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000;
    if (Number.isFinite(diff) && diff > 0 && diff <= 6 * 3600) timeTakenSec = Math.round(diff);
  }
  const perQuestionSec = timeTakenSec != null && attemptedCount > 0 ? timeTakenSec / attemptedCount : null;
  const timeUsedPct = timeTakenSec != null && allowedSec > 0 ? Math.min(100, Math.round((timeTakenSec / allowedSec) * 100)) : null;

  // ── Topic-wise (subject + chapter) strong/weak ────────────
  function aggregate(keyOf: (r: (typeof rows)[number]) => string) {
    const map = new Map<string, { total: number; correct: number; attempted: number }>();
    for (const r of rows) {
      const key = keyOf(r);
      if (!key) continue;
      const e = map.get(key) || { total: 0, correct: 0, attempted: 0 };
      e.total += 1;
      if (r.attempted) e.attempted += 1;
      if (r.isCorrect) e.correct += 1;
      map.set(key, e);
    }
    return Array.from(map.entries())
      .map(([name, e]) => ({ name, ...e, accuracy: e.attempted > 0 ? Math.round((e.correct / e.attempted) * 100) : 0 }))
      .sort((a, b) => a.accuracy - b.accuracy);
  }
  const bySubject = aggregate((r) => r.subjectName);
  const byChapter = aggregate((r) => (r.chapterTitle ? `${r.chapterTitle}${r.subjectName ? ` · ${r.subjectName}` : ''}` : ''));
  const weakTopics = byChapter.filter((c) => c.attempted > 0 && c.accuracy < 40);
  const strongTopics = byChapter.filter((c) => c.attempted > 0 && c.accuracy >= 70);

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Test Analysis"
        description={test.title}
      />

      {/* ── Score card ─────────────────────────────────────── */}
      <div className="student-card overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-[#2a1650] via-[#6d28d9] to-[#f5b942]" />
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-black relative flex-shrink-0"
                style={{
                  background: `conic-gradient(#6d28d9 ${pct * 3.6}deg, var(--student-surface-hover) 0deg)`,
                  boxShadow: 'inset 0 0 0 10px var(--student-surface)',
                }}
              >
                <span className="text-[var(--student-text)]">{pct}%</span>
              </div>
              <div>
                <p className={`text-2xl font-black ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                  {score}<span className="text-sm text-[var(--student-text-faint)] font-semibold">/{max}</span>
                </p>
                <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                  {passed ? 'Passed' : 'Needs Improvement'}
                </p>
                {test.passingMarks != null && (
                  <p className="text-[11px] text-[var(--student-text-faint)] mt-1">Passing marks: {test.passingMarks}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href="/app/results"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--student-border-light)] text-sm font-semibold text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] transition-colors"
              >
                <IconArrowLeft size={14} />
                All Results
              </Link>
              <Link
                href={`/app/tests/${test.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#2a1650] text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <IconTrendingUp size={14} />
                Attempt Again
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Performance breakdown ──────────────────────────── */}
      {totalQ > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          <div className="student-card p-5">
            <p className="text-[11px] font-semibold text-[var(--student-text-faint)] uppercase tracking-widest">Accuracy</p>
            <p className="text-2xl font-black text-[#6d28d9] mt-1">{accuracy}%</p>
            <p className="text-[11px] text-[var(--student-text-muted)] mt-1">attempted sawalon par</p>
          </div>
          <div className="student-card p-5">
            <p className="text-[11px] font-semibold text-[var(--student-text-faint)] uppercase tracking-widest">Correct</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{correctCount}<span className="text-sm text-[var(--student-text-faint)] font-semibold">/{totalQ}</span></p>
            <p className="text-[11px] text-[var(--student-text-muted)] mt-1">sahi jawab</p>
          </div>
          <div className="student-card p-5">
            <p className="text-[11px] font-semibold text-[var(--student-text-faint)] uppercase tracking-widest">Wrong</p>
            <p className="text-2xl font-black text-red-500 mt-1">{wrongCount}</p>
            <p className="text-[11px] text-[var(--student-text-muted)] mt-1">galat jawab</p>
          </div>
          <div className="student-card p-5">
            <p className="text-[11px] font-semibold text-[var(--student-text-faint)] uppercase tracking-widest">Skipped</p>
            <p className="text-2xl font-black text-[var(--student-text)] mt-1">{skippedCount}</p>
            <p className="text-[11px] text-[var(--student-text-muted)] mt-1">bina jawab chhode</p>
          </div>
        </div>
      )}

      {/* ── Time analysis ──────────────────────────────────── */}
      {timeTakenSec != null && (
        <div className="student-card p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6d28d9]/10 text-[#6d28d9] flex items-center justify-center">
              <IconClock size={18} />
            </div>
            <div>
              <h2 className="font-bold text-[var(--student-text)]">Time Analysis</h2>
              <p className="text-xs text-[var(--student-text-muted)]">Kitna time liya vs kitna allowed tha.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-[var(--student-surface)] border border-[var(--student-border-light)] p-4">
              <p className="text-[11px] font-semibold text-[var(--student-text-faint)] uppercase tracking-widest">Time Taken</p>
              <p className="text-xl font-black text-[var(--student-text)] mt-1">{formatDuration(timeTakenSec)}</p>
            </div>
            <div className="rounded-2xl bg-[var(--student-surface)] border border-[var(--student-border-light)] p-4">
              <p className="text-[11px] font-semibold text-[var(--student-text-faint)] uppercase tracking-widest">Allowed Time</p>
              <p className="text-xl font-black text-[var(--student-text)] mt-1">{formatDuration(allowedSec)}</p>
            </div>
            <div className="rounded-2xl bg-[var(--student-surface)] border border-[var(--student-border-light)] p-4">
              <p className="text-[11px] font-semibold text-[var(--student-text-faint)] uppercase tracking-widest">Avg / Question</p>
              <p className="text-xl font-black text-[var(--student-text)] mt-1">
                {perQuestionSec != null ? formatDuration(perQuestionSec) : '—'}
              </p>
            </div>
          </div>
          {timeUsedPct != null && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--student-text-muted)]">
                <span>Allowed time ka {timeUsedPct}% use hua</span>
                <span>{timeTakenSec <= allowedSec ? 'Time ke andar submit kiya — badhiya!' : 'Allowed time se zyada laga'}</span>
              </div>
              <div className="h-2.5 rounded-full bg-[var(--student-surface-hover)] mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full ${timeUsedPct >= 100 ? 'bg-red-500' : timeUsedPct >= 80 ? 'bg-amber-500' : 'bg-[#6d28d9]'}`}
                  style={{ width: `${timeUsedPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Topic-wise strong / weak ───────────────────────── */}
      {bySubject.length > 0 && (
        <div className="student-card p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f5b942]/15 text-[#b8860b] dark:text-[#f5b942] flex items-center justify-center">
              <IconTarget size={18} />
            </div>
            <div>
              <h2 className="font-bold text-[var(--student-text)]">Topic-wise Analysis</h2>
              <p className="text-xs text-[var(--student-text-muted)]">Strong topics par bharosa rakho, weak topics ko practice se pakka karo.</p>
            </div>
          </div>

          {(weakTopics.length > 0 || strongTopics.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-red-200 bg-red-50/60 dark:border-red-900/30 dark:bg-red-900/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">Weak Topics — pehle inpar kaam karo</p>
                {weakTopics.length === 0 ? (
                  <p className="text-sm text-[var(--student-text-muted)] mt-2">Koi weak topic nahi — koi chapter 40% accuracy se neeche nahi gaya.</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {weakTopics.map((c) => (
                      <li key={c.name} className="text-sm text-[var(--student-text)] flex items-center justify-between gap-3">
                        <span className="truncate">{c.name}</span>
                        <span className="font-bold text-red-500 flex-shrink-0">{c.accuracy}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/30 dark:bg-emerald-900/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Strong Topics — ye tumhari taaqat hai</p>
                {strongTopics.length === 0 ? (
                  <p className="text-sm text-[var(--student-text-muted)] mt-2">Abhi koi chapter 70% accuracy tak nahi pahuncha — practice jaari rakho.</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {strongTopics.map((c) => (
                      <li key={c.name} className="text-sm text-[var(--student-text)] flex items-center justify-between gap-3">
                        <span className="truncate">{c.name}</span>
                        <span className="font-bold text-emerald-600 flex-shrink-0">{c.accuracy}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[var(--student-text)]">Subject-wise</h3>
            {bySubject.map((s) => {
              const st = strengthOf(s.accuracy);
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--student-text)] truncate">{s.name}</p>
                    <span className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[11px] text-[var(--student-text-muted)]">{s.correct}/{s.attempted} correct</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${st.classes}`}>{st.label} · {s.accuracy}%</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--student-surface-hover)] mt-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${s.accuracy}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {byChapter.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[var(--student-text)]">Chapter-wise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {byChapter.map((c) => {
                  const st = strengthOf(c.accuracy);
                  return (
                    <div key={c.name} className="rounded-2xl border border-[var(--student-border-light)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[13px] font-semibold text-[var(--student-text)] truncate">{c.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 ${st.classes}`}>{st.label}</span>
                      </div>
                      <p className="text-[11px] text-[var(--student-text-muted)] mt-1.5">
                        {c.correct}/{c.attempted} correct · {c.accuracy}% accuracy · {c.total} questions
                      </p>
                      <div className="h-1.5 rounded-full bg-[var(--student-surface-hover)] mt-2 overflow-hidden">
                        <div className={`h-full rounded-full ${st.bar}`} style={{ width: `${c.accuracy}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/app/practice"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Weak Topics Practice Karo
            </Link>
            <Link
              href="/app/dpp"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--student-border)] text-[var(--student-text)] text-sm font-semibold hover:bg-[var(--student-surface-hover)] transition-colors"
            >
              Roz ki DPP
            </Link>
          </div>
        </div>
      )}

      {/* ── Question-wise review ───────────────────────────── */}
      <div className="space-y-4" id="review">
        <h2 className="text-lg font-bold text-[var(--student-text)]">Answer Review</h2>
        {rows.length === 0 ? (
          <StudentEmptyState
            icon={<IconTarget size={22} />}
            title="Answer details available nahi hain"
            description="Is attempt ke liye detailed answer data available nahi hai."
            variant="compact"
          />
        ) : (
          rows.map(({ response, question, options, attempted, isCorrect, chapterTitle, subjectName }, index) => {
            if (!question) return null;
            const chosen = response.selectedOptionId;
            const stateBadge = !attempted
              ? 'bg-[var(--student-surface-hover)] text-[var(--student-text-muted)]'
              : isCorrect
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300';
            return (
              <div key={response.id} className="student-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-semibold text-[var(--student-text)] leading-relaxed">
                    <span className="text-[var(--student-text-faint)] font-mono mr-2">Q{index + 1}.</span>
                    {question.title}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${stateBadge}`}>
                    {!attempted ? 'Skipped' : isCorrect ? <><IconCheckCircle size={11} /> Correct</> : <><IconX size={11} /> Wrong</>}
                    <span className="normal-case tracking-normal">
                      ({Number(response.marksObtained || 0) > 0 ? `+${response.marksObtained}` : response.marksObtained})
                    </span>
                  </span>
                </div>

                {(chapterTitle || subjectName) && (
                  <p className="text-[11px] text-[var(--student-text-faint)] mt-1.5 font-medium">
                    {[subjectName, chapterTitle].filter(Boolean).join(' · ')}
                  </p>
                )}

                <div className="mt-4 space-y-1.5">
                  {options.map((opt: any) => {
                    const isChosen = chosen === opt.id;
                    const isAnswer = opt.id === question.correctAnswer;
                    const state = isAnswer
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'
                      : isChosen
                        ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200'
                        : 'border-[var(--student-border-light)] text-[var(--student-text-muted)]';
                    return (
                      <div key={opt.id} className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-[13px] ${state}`}>
                        <span className="font-mono font-bold">{String(opt.id).toUpperCase()}.</span>
                        <span className="font-medium">{opt.text}</span>
                        {isAnswer && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider">Correct</span>}
                        {isChosen && !isAnswer && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider">Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

                {response.answerText && (
                  <p className="mt-3 text-xs text-[var(--student-text-muted)] leading-relaxed">
                    <b className="text-[var(--student-text-secondary)]">Your Answer:</b> {response.answerText}
                    {question.correctAnswer ? <> · <b className="text-[var(--student-text-secondary)]">Correct Answer:</b> {question.correctAnswer}</> : null}
                  </p>
                )}

                {question.explanation && (
                  <p className="mt-3 text-xs text-[var(--student-text-muted)] leading-relaxed">
                    <b className="text-[var(--student-text-secondary)]">Explanation:</b> {question.explanation}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

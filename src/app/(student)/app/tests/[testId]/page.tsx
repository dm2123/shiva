import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool, findTestByIdDb, listSubjectsByCourseDb, listChaptersBySubjectDb, listQuestionsByChapterDb, isStudentEnrolledInCourseDb } from '@/lib/db';
import { hasTestTypeColumns } from '@/lib/ensure-test-schema';
import { StudentPageHeader } from '@/components/student/StudentShared';
import { IconArrowLeft, IconClock, IconShield, IconPlay, IconBook, IconTrendingUp, IconCheckCircle } from '@/components/student/StudentIcons';

export const revalidate = 0;

function categoryLabel(test: any): string | null {
  const raw = String(test?.type || test?.category || '').trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes('pyq') || raw.includes('previous')) return 'Previous Year Questions';
  if (raw.includes('practice') || raw.includes('dpp')) return 'Practice Test';
  if (raw.includes('mock')) return 'Mock Test';
  return String(test.category || test.type).trim();
}

export default async function TestDetailPage({ params }: { params: { testId: string } }) {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  // type/category columns self-heal (never throws) — findTestByIdDb
  // SELECT * karta hai, isliye heal ke baad asal values milengi.
  await hasTestTypeColumns();

  const test = await findTestByIdDb(params.testId);
  if (!test) notFound();

  const isEnrolled = await isStudentEnrolledInCourseDb(session.userId, test.courseId);
  if (!isEnrolled) notFound();

  const subjects = await listSubjectsByCourseDb(test.courseId);

  // Syllabus breakdown: subject -> chapters -> asal question counts
  const syllabus: { subject: any; chapters: { chapter: any; count: number }[]; total: number }[] = [];
  let totalQuestions = 0;
  for (const subject of subjects as any[]) {
    const chapters = await listChaptersBySubjectDb(subject.id);
    const chapterRows: { chapter: any; count: number }[] = [];
    let subjectTotal = 0;
    for (const chapter of chapters as any[]) {
      const qs = await listQuestionsByChapterDb(chapter.id);
      const count = (qs as any[]).length;
      if (count > 0) chapterRows.push({ chapter, count });
      subjectTotal += count;
    }
    if (subjectTotal > 0) syllabus.push({ subject, chapters: chapterRows, total: subjectTotal });
    totalQuestions += subjectTotal;
  }

  // Is student ke is test par asal attempts
  let attempts: any[] = [];
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT id, status, score, startedAt, completedAt
         FROM AssessmentAttempts
        WHERE studentId = ? AND assessmentId = ?
        ORDER BY startedAt DESC`,
      [session.userId, test.id]
    );
    attempts = rows || [];
  } catch { /* attempts best-effort */ }

  const inProgress = attempts.find((a: any) => a.status === 'STARTED');
  const completed = attempts.filter((a: any) => a.status === 'EVALUATED' || a.status === 'COMPLETED');
  const bestScore = completed.length > 0 ? Math.max(...completed.map((a: any) => Number(a.score || 0))) : null;

  const totalMarks = Number(test.totalMarks || 0);
  const passingMarks = test.passingMarks != null ? Number(test.passingMarks) : null;
  const catLabel = categoryLabel(test);

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title={test.title}
        description={test.description || 'Mock examination'}
      />

      <div className="flex flex-wrap items-center gap-2">
        {catLabel && (
          <span className="text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider bg-[#6d28d9]/10 text-[#6d28d9]">
            {catLabel}
          </span>
        )}
        {inProgress ? (
          <span className="text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            In Progress
          </span>
        ) : completed.length > 0 ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <IconCheckCircle size={12} />
            Completed · Best {bestScore}/{totalMarks}
          </span>
        ) : (
          <span className="text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider bg-[var(--student-surface-hover)] text-[var(--student-text-muted)]">
            Not Attempted
          </span>
        )}
      </div>

      <div className="student-card p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'Questions', value: String(totalQuestions) },
            { label: 'Duration', value: `${test.durationMinutes} min` },
            { label: 'Max Marks', value: String(totalMarks) },
            { label: 'Passing Marks', value: passingMarks != null ? String(passingMarks) : '—' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-2xl font-black text-[var(--student-text)]">{s.value}</span>
              <span className="text-[11px] uppercase tracking-widest text-[var(--student-text-faint)] font-semibold">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--student-border-light)] space-y-3">
          <h3 className="text-sm font-bold text-[var(--student-text)]">Instructions</h3>
          <p className="flex items-center gap-2 text-xs text-[var(--student-text-muted)]">
            <IconShield size={14} className="text-[#f5b942]" />
            Each question carries marks; wrong answers incur the configured negative marking. Ensure a stable internet connection before starting.
          </p>
          <p className="flex items-center gap-2 text-xs text-[var(--student-text-muted)]">
            <IconClock size={14} className="text-[#6d28d9]" />
            The timer starts as soon as the exam opens. The test auto-submits when time runs out.
          </p>
          <p className="flex items-center gap-2 text-xs text-[var(--student-text-muted)]">
            <IconTrendingUp size={14} className="text-emerald-500" />
            Submit ke baad full analysis milega — score, accuracy, time aur topic-wise strong/weak areas.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          {inProgress ? (
            <>
              <Link
                href={`/app/tests/${test.id}/attempt/${inProgress.id}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#2a1650] text-white text-sm font-bold hover:opacity-90 transition-opacity"
              >
                <IconPlay size={16} />
                Resume Attempt
              </Link>
              <Link
                href={`/app/tests/${test.id}/attempt`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--student-border-light)] text-sm font-semibold text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] transition-colors"
              >
                Start New Attempt
              </Link>
            </>
          ) : (
            <Link
              href={`/app/tests/${test.id}/attempt`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#2a1650] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <IconPlay size={16} />
              {completed.length > 0 ? 'Re-attempt Test' : 'Start Attempt'}
            </Link>
          )}
          <Link
            href="/app/tests"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--student-border-light)] text-sm font-semibold text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] transition-colors"
          >
            <IconArrowLeft size={14} />
            All Tests
          </Link>
        </div>
      </div>

      {syllabus.length > 0 && (
        <div className="student-card p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6d28d9]/10 text-[#6d28d9] flex items-center justify-center">
              <IconBook size={18} />
            </div>
            <div>
              <h2 className="font-bold text-[var(--student-text)]">Syllabus Coverage</h2>
              <p className="text-xs text-[var(--student-text-muted)]">Is test ke questions in subjects/chapters se aate hain.</p>
            </div>
          </div>
          <div className="space-y-4">
            {syllabus.map(({ subject, chapters, total }) => (
              <div key={subject.id} className="rounded-2xl border border-[var(--student-border-light)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-[var(--student-text)]">{subject.name}</p>
                  <span className="text-[11px] font-bold text-[var(--student-text-muted)]">{total} questions</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {chapters.map(({ chapter, count }) => (
                    <span key={chapter.id} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[var(--student-surface-hover)] text-[var(--student-text-secondary)]">
                      {chapter.title} · {count}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {attempts.length > 0 && (
        <div className="student-card p-6 md:p-8 space-y-4">
          <h2 className="font-bold text-[var(--student-text)]">Your Attempts</h2>
          <div className="space-y-3">
            {attempts.map((a: any) => {
              const done = a.status === 'EVALUATED' || a.status === 'COMPLETED';
              const date = new Date(a.completedAt || a.startedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
              return (
                <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[var(--student-border-light)] p-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--student-text)]">{date}</p>
                    <p className="text-[11px] text-[var(--student-text-faint)] mt-0.5 uppercase tracking-wider">
                      {done ? `Score ${Number(a.score || 0)}/${totalMarks}` : 'Attempt in progress'}
                    </p>
                  </div>
                  {done ? (
                    <Link
                      href={`/app/results/${a.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700"
                    >
                      <IconTrendingUp size={14} />
                      View Analysis
                    </Link>
                  ) : (
                    <Link
                      href={`/app/tests/${test.id}/attempt/${a.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-700"
                    >
                      <IconPlay size={14} />
                      Resume
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

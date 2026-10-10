import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { findTestByIdDb, listSubjectsByCourseDb, listChaptersBySubjectDb, listQuestionsByChapterDb, isStudentEnrolledInCourseDb } from '@/lib/db';
import { StudentPageHeader } from '@/components/student/StudentShared';
import { IconArrowLeft, IconClock, IconTarget, IconShield, IconPlay } from '@/components/student/StudentIcons';

export const revalidate = 0;

export default async function TestDetailPage({ params }: { params: { testId: string } }) {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const test = await findTestByIdDb(params.testId);
  if (!test) notFound();

  const isEnrolled = await isStudentEnrolledInCourseDb(session.userId, test.courseId);
  if (!isEnrolled) notFound();

  const subjects = await listSubjectsByCourseDb(test.courseId);
  const questionRows = (
    await Promise.all(
      subjects.map(async (subject: any) => {
        const chapters = await listChaptersBySubjectDb(subject.id);
        return (await Promise.all(chapters.map((chapter: any) => listQuestionsByChapterDb(chapter.id)))).flat();
      })
    )
  ).flat();

  const totalMarks = Number(test.totalMarks || 0);
  const passingMarks = test.passingMarks != null ? Number(test.passingMarks) : null;

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title={test.title}
        description={test.description || 'Mock examination'}
      />

      <div className="student-card p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: 'Questions', value: String(questionRows.length) },
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
          <p className="flex items-center gap-2 text-xs text-[var(--student-text-muted)]">
            <IconShield size={14} className="text-amber-500" />
            Each question carries marks; wrong answers incur the configured negative marking. Ensure a stable internet connection before starting.
          </p>
          <p className="flex items-center gap-2 text-xs text-[var(--student-text-muted)]">
            <IconClock size={14} className="text-[var(--student-primary)]" />
            The timer starts as soon as the exam opens. The test auto-submits when time runs out.
          </p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Link
            href={`/app/tests/${test.id}/attempt`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <IconPlay size={16} />
            Start Attempt
          </Link>
          <Link
            href="/app/tests"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--student-border-light)] text-sm font-semibold text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] transition-colors"
          >
            <IconArrowLeft size={14} />
            All Tests
          </Link>
        </div>
      </div>
    </div>
  );
}
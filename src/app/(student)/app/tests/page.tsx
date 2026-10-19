import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader, StudentStatCard } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import {
  IconClipboard, IconArrowRight, IconClock, IconTarget,
  IconCheckCircle, IconZap, IconAward,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

const DIFFICULTY_STYLES: Record<string, { label: string; classes: string }> = {
  EASY: { label: 'Easy', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  MEDIUM: { label: 'Medium', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  HARD: { label: 'Hard', classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default async function TestsListPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [rows]: any = await mysqlPool.query(
    `SELECT t.id, t.title, t.description, t.durationMinutes, t.totalMarks, t.passingMarks, t.status, t.difficulty,
            c.title AS courseTitle,
            (SELECT COUNT(*) FROM Questions q
               JOIN Chapters ch ON q.chapterId = ch.id
               JOIN Subjects s ON ch.subjectId = s.id
             WHERE s.courseId = t.courseId) AS questionCount
       FROM Tests t
       JOIN Courses c ON t.courseId = c.id
       JOIN StudentEnrollments e ON e.courseId = t.courseId AND e.studentId = ? AND e.status = 'ACTIVE'
      WHERE t.status = 'PUBLISHED'
      ORDER BY t.createdAt DESC`,
    [session.userId]
  );

  const tests = rows || [];

  const totalQuestions = tests.reduce((sum: number, t: any) => sum + Number(t.questionCount || 0), 0);
  const totalMinutes = tests.reduce((sum: number, t: any) => sum + Number(t.durationMinutes || 0), 0);

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Mock Tests"
        description="Exam-pattern mock tests. Attempt karne se pehle syllabus complete karo — har test tumhari taiyaari ka asli aaina hai."
      />

      {tests.length > 0 && (
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          <StudentStatCard
            label="Available Tests"
            value={tests.length}
            icon={<IconClipboard size={18} />}
          />
          <StudentStatCard
            label="Total Questions"
            value={totalQuestions}
            icon={<IconTarget size={18} />}
          />
          <StudentStatCard
            label="Practice Hours"
            value={`${Math.round(totalMinutes / 60 * 10) / 10}h`}
            icon={<IconClock size={18} />}
          />
        </div>
      )}

      {tests.length === 0 ? (
        <div className="space-y-6">
          <StudentEmptyState
            icon={<IconClipboard size={28} />}
            title="Abhi koi mock test nahi hai"
            description="Hum exam-pattern mock tests taiyaar kar rahe hain. Jaise hi publish honge, yahan dikhenge — tab tak Practice Zone me apne fundamentals strong karo."
            variant="large"
          />
          <div className="student-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                <IconZap size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--student-text)]">Tab tak kya karo?</h3>
                <p className="text-sm text-[var(--student-text-muted)] mt-1 leading-relaxed">
                  Practice Zone me chapter-wise questions solve karo aur PYQ section me previous year
                  questions dekho. Strong basics = high mock scores.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link
                  href="/app/practice"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Practice Zone
                  <IconArrowRight size={14} />
                </Link>
                <Link
                  href="/app/pyq"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--student-border)] text-[var(--student-text)] text-sm font-semibold hover:bg-[var(--student-surface-hover)] transition-colors"
                >
                  PYQ Dekho
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tests.map((test: any) => {
            const diff = DIFFICULTY_STYLES[String(test.difficulty || '').toUpperCase()];
            return (
              <Link
                key={test.id}
                href={`/app/tests/${test.id}`}
                className="student-card overflow-hidden flex flex-col hover:border-[var(--student-primary)] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
              >
                {/* Card top accent */}
                <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

                <div className="p-5 md:p-6 flex flex-col gap-4 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/20">
                      <IconTarget size={18} className="text-white" />
                    </div>
                    {diff && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${diff.classes}`}>
                        {diff.label}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-[var(--student-text)] leading-snug group-hover:text-[var(--student-primary)] transition-colors">
                      {test.title}
                    </h3>
                    <p className="text-[11px] text-[var(--student-text-faint)] mt-1 uppercase tracking-wider font-medium">
                      {test.courseTitle}
                    </p>
                    {test.description && (
                      <p className="text-xs text-[var(--student-text-muted)] mt-2 line-clamp-2 leading-relaxed">
                        {test.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] py-2.5 px-1">
                      <div className="flex items-center justify-center gap-1 text-[var(--student-text-muted)]">
                        <IconClock size={12} />
                      </div>
                      <p className="text-xs font-bold text-[var(--student-text)] mt-1">{test.durationMinutes}m</p>
                      <p className="text-[10px] text-[var(--student-text-faint)]">Duration</p>
                    </div>
                    <div className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] py-2.5 px-1">
                      <div className="flex items-center justify-center gap-1 text-[var(--student-text-muted)]">
                        <IconCheckCircle size={12} />
                      </div>
                      <p className="text-xs font-bold text-[var(--student-text)] mt-1">{test.questionCount}</p>
                      <p className="text-[10px] text-[var(--student-text-faint)]">Questions</p>
                    </div>
                    <div className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] py-2.5 px-1">
                      <div className="flex items-center justify-center gap-1 text-[var(--student-text-muted)]">
                        <IconAward size={12} />
                      </div>
                      <p className="text-xs font-bold text-[var(--student-text)] mt-1">{test.totalMarks}</p>
                      <p className="text-[10px] text-[var(--student-text-faint)]">Marks</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[var(--student-text-faint)]">
                      {test.passingMarks ? `Passing: ${test.passingMarks} marks` : 'Full syllabus test'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--student-primary)]">
                      Start Test
                      <IconArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

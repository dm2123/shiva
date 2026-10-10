import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconClipboard, IconArrowRight, IconClock, IconTarget } from '@/components/student/StudentIcons';

export const revalidate = 0;

export default async function TestsListPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [rows]: any = await mysqlPool.query(
    `SELECT t.id, t.title, t.description, t.durationMinutes, t.totalMarks, t.passingMarks, t.status,
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

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Tests & Examinations"
        description="Take mock tests and track your examination readiness."
      />

      {tests.length === 0 ? (
        <StudentEmptyState
          icon={<IconClipboard size={24} />}
          title="No Tests Scheduled"
          description="There are currently no published mock tests for your enrolled courses. New tests will appear here as soon as they are published."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {tests.map((test: any) => (
            <Link
              key={test.id}
              href={`/app/tests/${test.id}`}
              className="student-card p-6 flex flex-col gap-4 hover:border-[var(--student-primary)] hover:shadow-indigo transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                <IconTarget size={16} className="text-violet-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--student-text)] leading-snug">{test.title}</h3>
                <p className="text-[11px] text-[var(--student-text-faint)] mt-1 uppercase tracking-wider">{test.courseTitle}</p>
                {test.description && (
                  <p className="text-xs text-[var(--student-text-muted)] mt-2 line-clamp-2 leading-relaxed">{test.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[var(--student-text-muted)] border-t border-[var(--student-border-light)] pt-4">
                <span className="flex items-center gap-1"><IconClock size={12} /> {test.durationMinutes} min</span>
                <span className="flex items-center gap-1"><IconTarget size={12} /> {test.totalMarks} marks</span>
                <span>{test.questionCount} Qs</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold text-[var(--student-primary)]">
                Start Test
                <IconArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
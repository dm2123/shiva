import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconUsers, IconCalendar, IconUser, IconShield } from '@/components/student/StudentIcons';

export const revalidate = 0;

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  UPCOMING: 'bg-amber-50 text-amber-700 border border-amber-100',
  COMPLETED: 'bg-slate-100 text-slate-600 border border-slate-200',
};

export default async function BatchesPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [rows]: any = await mysqlPool.query(
    `SELECT b.id, b.name, b.status, b.startDate, b.endDate,
            c.title AS courseTitle,
            tp.name AS teacherName
       FROM StudentEnrollments e
       JOIN Batches b ON e.batchId = b.id
       JOIN Courses c ON e.courseId = c.id
       LEFT JOIN TeacherProfiles tp ON b.teacherId = tp.userId
      WHERE e.studentId = ? AND e.status = 'ACTIVE'
      ORDER BY b.createdAt DESC`,
    [session.userId]
  );

  const batches = rows || [];

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="My Batches"
        description="View your assigned batch schedules, mentors, and batch-specific learning cohorts."
      />

      {batches.length === 0 ? (
        <StudentEmptyState
          icon={<IconUsers size={24} />}
          title="No Batch Assigned"
          description="You have not been assigned to a specific learning batch yet. Contact your institution administrator for batch enrollment."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {batches.map((b: any) => (
            <div key={b.id} className="student-card p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-bold text-[var(--student-text)] leading-snug">{b.name}</h3>
                  <p className="text-[11px] text-[var(--student-text-faint)] mt-1 uppercase tracking-wider">{b.courseTitle}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[b.status] || STATUS_STYLES.ACTIVE}`}>
                  {b.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-[var(--student-text-muted)] border-t border-[var(--student-border-light)] pt-4">
                <p className="flex items-center gap-2">
                  <IconCalendar size={13} className="text-[var(--student-text-faint)]" />
                  {b.startDate ? new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  {b.endDate ? ` → ${new Date(b.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
                </p>
                <p className="flex items-center gap-2">
                  <IconUser size={13} className="text-[var(--student-text-faint)]" />
                  Batch Mentor: {b.teacherName || 'Not assigned yet'}
                </p>
                <p className="flex items-center gap-2">
                  <IconShield size={13} className="text-[var(--student-text-faint)]" />
                  Enrollment: Active
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
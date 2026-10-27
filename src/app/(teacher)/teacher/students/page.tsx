import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { TeacherPageHeader } from '@/components/teacher/TeacherShared';
import TeacherEmptyState from '@/components/teacher/TeacherEmptyState';
import { getTeacherAssignmentsDb, mysqlPool } from '@/lib/db';
import { ensureCoreTablesSchema } from '@/lib/ensure-core-tables-schema';
import { IconUsers } from '@/components/teacher/TeacherIcons';

export const metadata = {
  title: 'Students | The Shiva',
};

export default async function TeacherStudents() {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  // FROM StudentEnrollments + JOIN Courses/Users/StudentProfiles: purane
  // DB par core tables missing hon to page 1146 par 500 deta tha.
  await ensureCoreTablesSchema();

  const assignments = await getTeacherAssignmentsDb(session.userId);
  const courseIds = assignments.map((a: any) => a.courseId);

  let students: any[] = [];
  if (courseIds.length > 0) {
    const placeholders = courseIds.map(() => '?').join(', ');
    const [rows]: any = await mysqlPool.query(
      `SELECT sp.name, sp.targetExam, st.email, st.createdAt AS joined,
              GROUP_CONCAT(DISTINCT c.title ORDER BY c.title SEPARATOR ' · ') AS courses
         FROM StudentEnrollments e
         JOIN Courses c ON e.courseId = c.id
         JOIN StudentProfiles sp ON e.studentId = sp.userId
         JOIN Users st ON e.studentId = st.id
        WHERE e.courseId IN (${placeholders}) AND e.status = 'ACTIVE'
        GROUP BY sp.userId, sp.name, sp.targetExam, st.email, st.createdAt
        ORDER BY sp.name`,
      courseIds
    );
    students = rows || [];
  }

  return (
    <div className="relative">
      <TeacherPageHeader
        title="Student Roster"
        description="View and manage the students enrolled in your active courses."
      />

      <div className="mt-8">
        {students.length === 0 ? (
          <TeacherEmptyState
            illustrationType="students"
            title="No Active Enrollments"
            description="None of your assigned courses have generated student enrollments yet."
          />
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-[var(--teacher-text-muted)]">
              <IconUsers size={16} />
              <b className="text-[var(--teacher-text)]">{students.length} students</b> across {courseIds.length} assigned courses
            </div>
            <div className="bg-[var(--teacher-surface)] border border-[var(--teacher-border)] rounded-2xl overflow-hidden shadow-sm">
              <div className="divide-y divide-[var(--teacher-border)]">
                {students.map((s) => {
                  const initial = (s.name || 'S')[0]?.toUpperCase() || 'S';
                  return (
                    <div key={s.email} className="flex items-center gap-4 p-4 hover:bg-[var(--teacher-primary-light)] transition-colors">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black flex-shrink-0">
                        {initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[var(--teacher-text)]">{s.name}</p>
                        <p className="text-xs text-[var(--teacher-text-muted)] mt-0.5">{s.email}</p>
                        <p className="text-xs text-teal-600 mt-1 font-medium line-clamp-1">{s.courses}</p>
                      </div>
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        {s.targetExam && (
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--teacher-text-muted)]">{s.targetExam}</p>
                        )}
                        <p className="text-[11px] text-[var(--teacher-text-faint)] mt-1">
                          {new Date(s.joined).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
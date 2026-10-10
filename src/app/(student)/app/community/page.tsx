import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconMessageCircle, IconUsers } from '@/components/student/StudentIcons';

export const revalidate = 0;

export default async function CommunityPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [rows]: any = await mysqlPool.query(
    `SELECT DISTINCT sp.name, st.email,
            (SELECT GROUP_CONCAT(c2.title SEPARATOR ', ')
               FROM StudentEnrollments e2 JOIN Courses c2 ON e2.courseId = c2.id
              WHERE e2.studentId = e1.studentId AND e2.status = 'ACTIVE') AS courses
       FROM StudentEnrollments e1
       JOIN StudentEnrollments e2 ON e1.batchId = e2.batchId AND e1.batchId IS NOT NULL AND e2.studentId != ?
       JOIN StudentProfiles sp ON e2.studentId = sp.userId
       JOIN Users st ON e2.studentId = st.id
      WHERE e1.studentId = ? AND e1.status = 'ACTIVE'
      ORDER BY sp.name
      LIMIT 60`,
    [session.userId, session.userId]
  );

  const classmates = (rows || []) as any[];

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Student Community"
        description="Connect with your batch mates and collaborate on your learning journey."
      />

      {classmates.length === 0 ? (
        <StudentEmptyState
          icon={<IconMessageCircle size={24} />}
          title="No Batch Peers Yet"
          description="You are not in a shared batch yet. Once you are placed in a learning batch, your classmates will appear here."
        />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--student-surface-hover)] flex items-center justify-center">
              <IconUsers size={16} className="text-[var(--student-primary)]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--student-text)]">{classmates.length} Batch Mates</h2>
              <p className="text-[11px] text-[var(--student-text-faint)]">Learners sharing your batches</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {classmates.map((c: any) => {
              const initial = (c.name || 'S')[0]?.toUpperCase() || 'S';
              return (
                <div key={c.email} className="student-card p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black flex-shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--student-text)] truncate">{c.name}</p>
                    <p className="text-[11px] text-[var(--student-text-muted)] truncate">{c.email}</p>
                    {c.courses && <p className="text-[10px] text-[var(--student-text-faint)] truncate mt-0.5">{c.courses}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
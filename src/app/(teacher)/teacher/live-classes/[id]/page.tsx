import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import LiveClassControl from './LiveClassControl';

export const revalidate = 0;

export default async function TeacherLiveClassPage({ params }: { params: { id: string } }) {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'TEACHER') redirect('/teacher/login');

  const [rows]: any = await mysqlPool.query(
    `SELECT lc.*, c.title AS courseTitle, tp.id AS teacherProfileId
     FROM LiveClasses lc
     LEFT JOIN Courses c ON lc.courseId = c.id
     LEFT JOIN TeacherProfiles tp ON lc.teacherId = tp.id
     WHERE lc.id = ?`,
    [params.id]
  );

  if (rows.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Live Class Not Found</h1>
        <a href="/teacher/live-classes" className="text-teal-600 hover:underline mt-4 block">← Back to Live Classes</a>
      </div>
    );
  }

  const liveClass = rows[0];

  const [attendance]: any = await mysqlPool.query(
    `SELECT lca.*, u.email AS studentEmail
     FROM liveclassattendance lca
     LEFT JOIN Users u ON lca.studentId = u.id
     WHERE lca.liveClassId = ?
     ORDER BY lca.joinedAt ASC`,
    [params.id]
  );

  return (
    <LiveClassControl
      liveClass={liveClass}
      teacherId={liveClass.teacherProfileId || session.userId}
      attendance={attendance}
    />
  );
}

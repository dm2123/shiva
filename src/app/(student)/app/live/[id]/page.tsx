import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import StudentLiveView from './StudentLiveView';

export const revalidate = 0;

export default async function StudentLiveClassPage({ params }: { params: { id: string } }) {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  const [rows]: any = await mysqlPool.query(
    `SELECT lc.*, c.title AS courseTitle
     FROM LiveClasses lc
     LEFT JOIN Courses c ON lc.courseId = c.id
     WHERE lc.id = ?`,
    [params.id]
  );

  if (rows.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Live Class Not Found</h1>
        <a href="/app/live" className="text-indigo-600 hover:underline mt-4 block">
          Back to Live Classes
        </a>
      </div>
    );
  }

  const liveClass = rows[0];

  return (
    <StudentLiveView
      liveClass={liveClass}
      studentId={session.userId}
      studentEmail={session.email}
    />
  );
}

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import StudentLiveView from './StudentLiveView';
import { StudentPageHeader } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconRadio } from '@/components/student/StudentIcons';

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
      <div className="space-y-8">
        <StudentPageHeader title="Live Class" description="Class details and stream." />
        <StudentEmptyState
          icon={<IconRadio size={22} />}
          title="Live class not found"
          description="Ye class exist nahi karti ya hata di gayi hai. Live classes ki list dekho."
          actionText="Back to Live Classes"
          actionHref="/app/live"
          variant="large"
        />
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

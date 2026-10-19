import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import StudentLiveView from './StudentLiveView';
import { StudentPageHeader } from '@/components/student/StudentShared';
import { IconRadio } from '@/components/student/StudentIcons';
import Link from 'next/link';

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
        <div className="student-card p-10 md:p-14 text-center">
          <div
            className="mx-auto mb-5 w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #a855f7 100%)' }}
          >
            <IconRadio size={36} className="text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-[var(--student-text)] mb-2">
            Live class not found
          </h2>
          <p className="text-sm text-[var(--student-text-muted)] max-w-md mx-auto mb-6">
            Ye class exist nahi karti ya hata di gayi hai. Live classes ki list dekho.
          </p>
          <Link
            href="/app/live"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
          >
            Back to Live Classes
          </Link>
        </div>
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

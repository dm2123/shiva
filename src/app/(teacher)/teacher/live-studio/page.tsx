import { Suspense } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import LiveStudioClient from './page.client';
import LiveStudioSelector from './LiveStudioSelector';

export const revalidate = 0;

export default async function LiveStudioPage({ searchParams }: { searchParams: { classId?: string } }) {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'TEACHER') redirect('/teacher/login');

  const classId = searchParams.classId;

  if (!classId) {
    const [classes]: any = await mysqlPool.query(
      `SELECT lc.*, c.title AS courseTitle
       FROM LiveClasses lc
       LEFT JOIN Courses c ON lc.courseId = c.id
       WHERE lc.status IN ('SCHEDULED', 'LIVE')
       ORDER BY lc.startTime DESC`
    );
    return <LiveStudioSelector classes={classes} />;
  }

  const [rows]: any = await mysqlPool.query(
    `SELECT lc.*, c.title AS courseTitle
     FROM LiveClasses lc
     LEFT JOIN Courses c ON lc.courseId = c.id
     WHERE lc.id = ?`,
    [classId]
  );

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-6xl mb-4">📡</p>
          <h1 className="text-xl font-bold text-slate-900">Live Class Not Found</h1>
          <a href="/teacher/live-studio" className="text-teal-600 hover:underline mt-3 block text-sm font-medium">
            ← Choose a class
          </a>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-[#050508]"><div className="text-white animate-pulse font-medium">Loading studio...</div></div>}>
      <LiveStudioClient liveClass={rows[0]} />
    </Suspense>
  );
}

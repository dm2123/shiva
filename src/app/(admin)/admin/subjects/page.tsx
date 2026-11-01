import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';
import { ensureAnalyticsSchema } from '@/lib/ensure-analytics-schema';
import AdminSubjectsClient from './page.client';

export const revalidate = 0;

export default async function AdminSubjectsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  // Courses/Subjects: purane DB par koi table missing ho to page 1146 par
  // 500 deta tha. Analytics ensure dono ko banata hai (koi naya DDL nahi,
  // maujooda ensure hi reuse) — khaali par honest empty.
  await ensureAnalyticsSchema();

  const [courses]: any = await mysqlPool.query(
    'SELECT id, title FROM Courses ORDER BY title'
  );
  const [subjects]: any = await mysqlPool.query(
    `SELECT s.*, c.title AS courseTitle
       FROM Subjects s
       JOIN Courses c ON s.courseId = c.id
      ORDER BY c.title, s.sortOrder`
  );

  return <AdminSubjectsClient courses={courses || []} subjects={subjects || []} />;
}
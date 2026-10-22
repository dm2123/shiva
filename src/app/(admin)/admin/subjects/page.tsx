import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';
import AdminSubjectsClient from './page.client';

export const revalidate = 0;

export default async function AdminSubjectsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

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
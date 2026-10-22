import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';
import AdminChaptersClient from './page.client';

export const revalidate = 0;

export default async function AdminChaptersPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  const [courses]: any = await mysqlPool.query(
    'SELECT id, title FROM Courses ORDER BY title'
  );
  const [subjects]: any = await mysqlPool.query(
    `SELECT s.id, s.name, s.code, s.courseId FROM Subjects s ORDER BY s.courseId, s.sortOrder`
  );
  const [chapters]: any = await mysqlPool.query(
    `SELECT ch.*, s.name AS subjectName, s.courseId, c.title AS courseTitle
       FROM Chapters ch
       JOIN Subjects s ON ch.subjectId = s.id
       JOIN Courses c ON s.courseId = c.id
      ORDER BY c.title, s.sortOrder, ch.sortOrder`
  );

  return (
    <AdminChaptersClient
      courses={courses || []}
      subjects={subjects || []}
      chapters={chapters || []}
    />
  );
}
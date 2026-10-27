import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';
import { ensureTeacherAssignmentSchema } from '@/lib/ensure-teacher-assignment-schema';
import { ensureLiveClassSchema } from '@/lib/ensure-live-class-schema';
import { ensureCoreTablesSchema } from '@/lib/ensure-core-tables-schema';
import AdminLiveClassesClient from './page.client';

export const revalidate = 0;

export default async function AdminLiveClassesPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  // Courses query ka TCA subquery (teacherEmails) + LiveClasses main
  // table: purane DB par missing hon to page 1146 par 500 deta tha.
  await ensureTeacherAssignmentSchema();
  await ensureLiveClassSchema();
  // Courses main query + Users subqueries/teachers list: purane DB par ye
  // teen tables missing hon to page 1146 par 500 deta tha.
  await ensureCoreTablesSchema();

  const [classes]: any = await mysqlPool.query(
    `SELECT lc.*, c.title AS courseTitle,
            (SELECT u.email FROM Users u WHERE u.id = lc.teacherId) AS teacherEmail
       FROM LiveClasses lc
       LEFT JOIN Courses c ON lc.courseId = c.id
      ORDER BY lc.startTime ASC`
  );

  const [courses]: any = await mysqlPool.query(
    `SELECT c.id, c.title, c.price,
            (SELECT GROUP_CONCAT(u.email) FROM TeacherCourseAssignments tca JOIN Users u ON tca.teacherId = u.id WHERE tca.courseId = c.id) AS teacherEmails
       FROM Courses c`
  );
  const [teachers]: any = await mysqlPool.query(
    `SELECT u.id, u.email FROM Users u WHERE u.role = 'TEACHER' AND u.status = 'ACTIVE' ORDER BY u.email`
  );

  return (
    <AdminLiveClassesClient
      initialClasses={classes || []}
      courses={courses || []}
      teachers={teachers || []}
    />
  );
}
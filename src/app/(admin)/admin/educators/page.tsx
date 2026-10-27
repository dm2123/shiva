import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';
import { ensureTeacherAssignmentSchema } from '@/lib/ensure-teacher-assignment-schema';
import { ensureBatchScheduleSchema } from '@/lib/ensure-batch-schedule-schema';
import { ensureCoreTablesSchema } from '@/lib/ensure-core-tables-schema';
import AdminEducatorsClient from './page.client';

export const revalidate = 0;

export default async function AdminEducators() {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  // TCA subqueries (courseCount/studentCount/courseTitles) + TeacherProfiles
  // main table: purane DB par missing hon to page 1146 par 500 deta tha.
  await ensureTeacherAssignmentSchema();
  await ensureBatchScheduleSchema();
  // Users JOIN + Courses/StudentEnrollments subqueries: purane DB par ye
  // teen tables missing hon to page 1146 par 500 deta tha (koi ensure
  // inhe banata nahi tha — course/google ensures sirf columns jodte hain).
  await ensureCoreTablesSchema();

  const [rows]: any = await mysqlPool.query(
    `SELECT tp.userId AS id, tp.name AS educatorName, tp.slug, tp.qualification, tp.experienceYears, tp.status,
            u.email, u.createdAt,
            (SELECT COUNT(*) FROM TeacherCourseAssignments tca WHERE tca.teacherId = tp.userId) AS courseCount,
            (SELECT COUNT(*) FROM StudentEnrollments e JOIN TeacherCourseAssignments tca ON e.courseId = tca.courseId WHERE tca.teacherId = tp.userId AND e.status = 'ACTIVE') AS studentCount,
            (SELECT GROUP_CONCAT(c.title ORDER BY c.title SEPARATOR ' · ') FROM TeacherCourseAssignments tca JOIN Courses c ON tca.courseId = c.id WHERE tca.teacherId = tp.userId) AS courseTitles
       FROM TeacherProfiles tp
       JOIN Users u ON tp.userId = u.id
      ORDER BY u.createdAt DESC`
  );

  const educators = (rows || []).map((r: any) => ({
    id: r.id,
    displayName: r.educatorName,
    slug: r.slug,
    email: r.email,
    website: null,
    status: r.status === 'active' ? 'ACTIVE' : 'PENDING',
    qualification: r.qualification,
    experienceYears: r.experienceYears,
    courseCount: Number(r.courseCount || 0),
    studentCount: Number(r.studentCount || 0),
    courseTitles: r.courseTitles || '',
    joined: r.createdAt,
  }));

  return <AdminEducatorsClient initialEducators={educators} />;
}
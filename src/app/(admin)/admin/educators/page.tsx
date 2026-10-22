import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { mysqlPool } from '@/lib/db';
import AdminEducatorsClient from './page.client';

export const revalidate = 0;

export default async function AdminEducators() {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'ADMIN') {
    redirect('/admin/login');
  }

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
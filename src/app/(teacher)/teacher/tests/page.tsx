import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import TeacherTestsClient from './page.client';
import { getTeacherAssignmentsDb, findCourseByIdDb } from '@/lib/db';
import { listTestByCourse } from '@/services/test.service';

export const metadata = {
  title: 'Test Builder | The Shiva',
};

export default async function TeacherTests() {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  const assignments = await getTeacherAssignmentsDb(session.userId);
  const courses: any[] = [];
  const tests: any[] = [];

  for (const a of assignments) {
    const course = await findCourseByIdDb(a.courseId);
    if (course) {
      courses.push({ id: course.id, title: course.title });
      const courseTests = (await listTestByCourse(a.courseId)).map((t: any) => ({
        ...t,
        courseTitle: course.title,
      }));
      tests.push(...courseTests);
    }
  }

  return <TeacherTestsClient initialTests={tests} courses={courses} userEmail={session.email} />;
}

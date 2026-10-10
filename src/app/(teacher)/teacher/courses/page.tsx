import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTeacherAssignmentsDb, findCourseByIdDb } from '@/lib/db';
import TeacherCoursesClient from './page.client';

export const metadata = {
  title: 'Course Management | The Shiva',
};

export default async function TeacherCourses() {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  const assignments = await getTeacherAssignmentsDb(session.userId);
  const courses = [];
  for (const a of assignments) {
    const c = await findCourseByIdDb(a.courseId);
    if (c) courses.push(c);
  }

  return <TeacherCoursesClient courses={courses} />;
}

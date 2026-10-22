import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import TeacherQuestionsClient from './page.client';
import { getTeacherAssignmentsDb, findCourseByIdDb } from '@/lib/db';

export const metadata = {
  title: 'Question Bank | The Shiva',
};

export default async function TeacherQuestionsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  const assignments = await getTeacherAssignmentsDb(session.userId);
  const courses: any[] = [];
  for (const a of assignments) {
    const c = await findCourseByIdDb(a.courseId);
    if (c) courses.push({ id: c.id, title: c.title });
  }

  return <TeacherQuestionsClient courses={courses} />;
}
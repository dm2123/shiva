import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import TeacherSubjectsClient from './page.client';
import { getTeacherAssignmentsDb } from '@/lib/db';

export const metadata = {
  title: 'Subject Management | The Shiva',
};

export default async function TeacherSubjectsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  const assignments = await getTeacherAssignmentsDb(session.userId);
  return <TeacherSubjectsClient initialAssignments={assignments} />;
}
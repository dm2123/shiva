import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import TeacherChaptersClient from './page.client';
import { getTeacherAssignmentsDb } from '@/lib/db';

export const metadata = {
  title: 'Chapter Modules | The Shiva',
};

export default async function TeacherChaptersPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  const assignments = await getTeacherAssignmentsDb(session.userId);
  return <TeacherChaptersClient initialAssignments={assignments} />;
}
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import TeacherSubjectsClient from './page.client';
import { getTeacherAssignmentsDb } from '@/lib/db';
import { ensureTeacherAssignmentSchema } from '@/lib/ensure-teacher-assignment-schema';

export const metadata = {
  title: 'Subject Management | The Shiva',
};

export default async function TeacherSubjectsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  // getTeacherAssignmentsDb TeacherCourseAssignments poochta hai -
  // purane DB par table missing ho to helper error swallow karke []
  // deta hai (page khaali dikhta). Page-level leg: helper me wiring
  // nahi (db <-> ensure circular import hota).
  await ensureTeacherAssignmentSchema();
  const assignments = await getTeacherAssignmentsDb(session.userId);
  return <TeacherSubjectsClient initialAssignments={assignments} />;
}
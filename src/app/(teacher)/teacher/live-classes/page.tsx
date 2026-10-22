import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { TeacherPageHeader } from '@/components/teacher/TeacherShared';
import TeacherLiveClassesClient from './page.client';
import { getTeacherProfileByUserId, getTeacherAssignmentsDb } from '@/lib/db';
import { listTeacherLiveClasses } from '@/services/live-class.service';

export const metadata = {
  title: 'Live Classes | The Shiva',
};

export default async function TeacherLiveClasses() {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  const profile = await getTeacherProfileByUserId(session.userId);
  if (!profile) {
    redirect('/teacher/login');
  }

  const liveClasses = await listTeacherLiveClasses(profile.id);

  return (
    <div className="relative">
      <TeacherPageHeader
        title="Live Classes"
        description="View and manage all your scheduled, live, and ended classes."
      />
      <TeacherLiveClassesClient initialClasses={liveClasses} />
    </div>
  );
}

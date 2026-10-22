import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { TeacherPageHeader } from '@/components/teacher/TeacherShared';
import TeacherThemeSettings from './TeacherThemeSettings';
import TeacherChangePassword from './TeacherChangePassword';

export const metadata = {
  title: 'Settings | The Shiva',
};

export default async function TeacherSettings() {
  const session = await getSessionFromHeaders(headers());

  if (!session || session.role !== 'TEACHER') {
    redirect('/teacher/login');
  }

  return (
    <div className="relative space-y-8">
      <TeacherPageHeader
        title="Preferences & Settings"
        description="Configure your workspace appearance, notification rules, and application behavior."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TeacherThemeSettings />
        <TeacherChangePassword />
      </div>
    </div>
  );
}

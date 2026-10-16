import { getSessionFromHeaders } from '@/lib/rbac-server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import PWDashboard from '@/components/student/PWDashboard';

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) {
    redirect('/login');
  }

  // PW-style dashboard — batches, goals, quick links
  const userName = (session as any).name || session.email.split('@')[0];
  return (
    <PWDashboard
      userName={userName}
      userEmail={session.email}
    />
  );
}
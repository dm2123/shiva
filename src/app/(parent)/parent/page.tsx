import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import ParentDashboard from '@/components/parent/ParentDashboard';

export const revalidate = 0;

export default async function ParentHomePage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'PARENT') redirect('/login');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Parent Portal</h1>
      <p className="text-slate-500">Monitor your child&apos;s progress</p>
      <ParentDashboard />
    </div>
  );
}

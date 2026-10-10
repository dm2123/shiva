import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import ScholarshipList from '@/components/student/ScholarshipList';

export const revalidate = 0;

export default async function ScholarshipsPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Scholarship Tests</h1>
        <p className="text-slate-500 mt-1">Compete for up to 100% scholarship on course fees</p>
      </div>
      <ScholarshipList />
    </div>
  );
}

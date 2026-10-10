import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import CentersList from '@/components/centers/CentersList';

export const revalidate = 0;

export default async function CentersPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Offline Centers</h1>
        <p className="text-slate-500 mt-1">Find study centers near you</p>
      </div>
      <CentersList />
    </div>
  );
}

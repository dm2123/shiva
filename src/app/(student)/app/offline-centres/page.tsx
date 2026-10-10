import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import OfflineCentreMap from '@/components/maps/OfflineCentreMap';

export const revalidate = 0;

export default async function OfflineCentresPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Offline Centres</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Find THE SHIVA offline learning centres near you.</p>
      </div>
      <OfflineCentreMap />
    </div>
  );
}

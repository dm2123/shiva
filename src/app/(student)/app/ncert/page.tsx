import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import NCERTBrowser from '@/components/ncert/NCERTBrowser';

export const revalidate = 0;

export default async function NCERTPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">NCERT Solutions</h1>
        <p className="text-slate-500 mt-1">Browse solutions by class and subject</p>
      </div>
      <NCERTBrowser />
    </div>
  );
}

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import CounsellorChat from '@/components/counsellor/CounsellorChat';

export const revalidate = 0;

export default async function CounsellorPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Counsellor</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Chat with our career counsellors for guidance.</p>
      </div>
      <CounsellorChat />
    </div>
  );
}

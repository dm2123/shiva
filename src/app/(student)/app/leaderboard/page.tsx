import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import Leaderboard from '@/components/gamification/Leaderboard';
import XPDisplay from '@/components/gamification/XPDisplay';

export const revalidate = 0;

export default async function LeaderboardPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Leaderboard</h1>
      <XPDisplay />
      <Leaderboard />
    </div>
  );
}

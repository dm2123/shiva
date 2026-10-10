import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import WalletBalance from '@/components/wallet/WalletBalance';
import ReferralCode from '@/components/wallet/ReferralCode';

export const revalidate = 0;

export default async function WalletPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session || session.role !== 'STUDENT') redirect('/login');

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wallet & Referrals</h1>
      <WalletBalance />
      <ReferralCode />
    </div>
  );
}

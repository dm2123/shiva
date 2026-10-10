'use client';

import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
import Link from 'next/link';

export default function SubscriptionsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription</h1>
      <SubscriptionStatus />
      <Link
        href="/app/subscriptions/plans"
        className="block text-center py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
      >
        View All Plans
      </Link>
    </div>
  );
}

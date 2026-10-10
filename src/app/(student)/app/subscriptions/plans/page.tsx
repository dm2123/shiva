'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PlanList from '@/components/subscription/PlanList';

export default function PlansPage() {
  const router = useRouter();
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (planId: string) => {
    if (!confirm('Subscribe to this plan?')) return;
    setSubscribing(true);
    try {
      const res = await fetch('/api/student/subscriptions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Subscription activated!');
        router.push('/app/subscriptions');
      } else {
        alert(data.error.message);
      }
    } catch (err) {
      alert('Failed to subscribe');
    }
    setSubscribing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Choose a Plan</h1>
        <p className="text-slate-500 mt-1">Select the plan that works best for you</p>
      </div>
      <PlanList onSelect={handleSubscribe} />
    </div>
  );
}

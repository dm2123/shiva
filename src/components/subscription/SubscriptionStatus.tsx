'use client';

import { useState, useEffect } from 'react';

interface Subscription {
  id: string;
  planName: string;
  price: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: string;
}

export default function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/student/subscriptions');
      const data = await res.json();
      if (data.success) setSubscription(data.data.subscription);
    } catch (err) {
      console.error('Fetch subscription error:', err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchSubscription(); }, []);

  const cancel = async () => {
    if (!subscription || !confirm('Cancel subscription?')) return;
    try {
      await fetch(`/api/student/subscriptions/${subscription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      fetchSubscription();
    } catch (err) {
      console.error('Cancel error:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-slate-500">Loading...</div>;
  }

  if (!subscription) {
    return (
      <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-6 text-center">
        <p className="text-slate-500">No active subscription</p>
        <a href="/app/subscriptions/plans" className="text-indigo-600 hover:underline text-sm mt-2 block">
          View Plans →
        </a>
      </div>
    );
  }

  const daysLeft = Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm opacity-80">Current Plan</p>
          <p className="text-2xl font-bold">{subscription.planName}</p>
          <p className="text-sm opacity-80 mt-2">
            Valid till {new Date(subscription.endDate).toLocaleDateString('en-IN')}
          </p>
          <p className="text-sm opacity-80">{daysLeft} days left</p>
        </div>
        {subscription.status === 'ACTIVE' && (
          <button
            onClick={cancel}
            className="text-sm underline opacity-80 hover:opacity-100"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

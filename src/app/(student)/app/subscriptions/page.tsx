'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IconCheckCircle, IconShield, IconArrowRight, IconClock, IconX, IconZap,
} from '@/components/student/StudentIcons';

interface Subscription {
  id: string;
  planName: string;
  price: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: string;
}

const FREE_BENEFITS = [
  'Full Aptitude Foundation course access',
  'All recorded lectures & study material',
  'Practice questions & DPPs',
  'Doubt support from mentors',
  'No expiry — learn at your own pace',
];

export default function SubscriptionsPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchSubscription = async () => {
    try {
      const res = await fetch('/api/student/subscriptions');
      const data = await res.json();
      if (data.success && data.data?.subscription) setSubscription(data.data.subscription);
    } catch {
      /* silent — free access card always shows */
    }
    setLoading(false);
  };

  useEffect(() => { fetchSubscription(); }, []);

  const cancel = async () => {
    if (!subscription || cancelling) return;
    if (!window.confirm('Are you sure you want to cancel this subscription?')) return;
    setCancelling(true);
    try {
      await fetch(`/api/student/subscriptions/${subscription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      setSubscription(null);
    } catch {
      /* silent */
    }
    setCancelling(false);
  };

  const daysLeft = subscription
    ? Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-4 space-y-5 pb-20">
      {/* Page header */}
      <div>
        <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">My Plan</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Everything included in your learning access.</p>
      </div>

      {/* FREE ACCESS hero — the honest hero of this page */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white">
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-amber-300/20 blur-2xl"
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-[11px] font-extrabold tracking-wider">
              <IconZap size={12} /> FREE ACCESS
            </span>
          </div>
          <h2 className="text-[22px] font-extrabold mt-3 tracking-tight">Aptitude Foundation</h2>
          <p className="text-[13px] text-white/80 mt-1">Your current plan — ₹0, forever.</p>

          <ul className="mt-4 space-y-2">
            {FREE_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-[13px] text-white/90">
                <IconCheckCircle size={15} className="mt-0.5 flex-shrink-0 text-emerald-300" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/app/courses"
            className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white text-indigo-700 text-sm font-extrabold hover:bg-indigo-50 transition"
          >
            Start Learning <IconArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Paid subscription from API — only if one really exists */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      ) : subscription ? (
        <section>
          <h2 className="text-[15px] font-bold text-gray-900 mb-3">Active Subscription</h2>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Plan</p>
                <p className="text-[17px] font-extrabold text-gray-900 mt-0.5">{subscription.planName}</p>
                <div className="flex items-center gap-1.5 mt-2 text-[13px] text-gray-500">
                  <IconClock size={13} />
                  Valid till {new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  <span className="font-bold text-indigo-600">• {daysLeft} days left</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-bold">
                <IconCheckCircle size={12} /> ACTIVE
              </span>
            </div>
            {(subscription.status || '').toUpperCase() === 'ACTIVE' && (
              <button
                onClick={cancel}
                disabled={cancelling}
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <IconX size={13} /> {cancelling ? 'Cancelling…' : 'Cancel subscription'}
              </button>
            )}
          </div>
        </section>
      ) : null}

      {/* Explore more plans */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <IconShield size={20} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Want more?</p>
              <p className="text-[13px] text-gray-500 mt-0.5">See all available plans as we launch them.</p>
            </div>
          </div>
          <Link
            href="/app/subscriptions/plans"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 transition flex-shrink-0"
          >
            View Plans <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}

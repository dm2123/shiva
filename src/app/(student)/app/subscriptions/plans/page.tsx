'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import {
  IconCheckCircle, IconZap, IconShield, IconX, IconArrowRight, IconStar,
} from '@/components/student/StudentIcons';

interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: string | string[];
}

function parseFeatures(features: string | string[]): string[] {
  if (Array.isArray(features)) return features;
  try {
    const parsed = JSON.parse(features);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatINR(n: number) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

/** Confirm modal — replaces native confirm() */
function ConfirmModal({
  plan, busy, onConfirm, onClose,
}: {
  plan: Plan | null;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!plan) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
          aria-label="Close"
        >
          <IconX size={15} />
        </button>
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          <IconStar size={22} className="text-indigo-600" />
        </div>
        <h3 className="text-[17px] font-extrabold text-gray-900">Confirm subscription</h3>
        <p className="text-[13px] text-gray-500 mt-1.5 leading-relaxed">
          Subscribe to <span className="font-bold text-gray-800">{plan.name}</span> for{' '}
          <span className="font-bold text-gray-800">{formatINR(plan.price)}</span>
          {plan.durationDays > 0 ? ` / ${plan.durationDays} days` : ''}?
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={busy}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-extrabold hover:bg-indigo-700 disabled:opacity-50"
          >
            {busy ? 'Activating…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlansPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/student/subscriptions/plans');
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.plans)) setPlans(data.data.plans);
      } catch {
        /* silent — free plan always shows */
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  const handleConfirm = async () => {
    if (!selected || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch('/api/student/subscriptions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: selected.id }),
      });
      const data = await res.json();
      if (data.success) {
        setSelected(null);
        router.push('/app/subscriptions');
      } else {
        setNotice({ type: 'err', text: data.error?.message || 'Subscription failed. Please try again.' });
        setSelected(null);
      }
    } catch {
      setNotice({ type: 'err', text: 'Something went wrong. Please try again.' });
      setSelected(null);
    }
    setBusy(false);
  };

  return (
    <main className="max-w-[1200px] mx-auto px-4 py-4 space-y-5 pb-20">
      {/* Page header */}
      <div>
        <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">Choose Your Plan</h1>
        <p className="text-[13px] text-gray-500 mt-0.5">Start free. Upgrade only if you ever need more.</p>
      </div>

      {notice && (
        <div
          className={`rounded-2xl border p-4 text-[13px] font-semibold ${
            notice.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* FREE plan — always available, always honest */}
      <section>
        <div className="relative overflow-hidden rounded-3xl border-2 border-indigo-200 bg-white p-6">
          <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-extrabold tracking-wider">
            <IconZap size={12} /> MOST POPULAR
          </span>
          <h2 className="text-[18px] font-extrabold text-gray-900">Free Plan</h2>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-[34px] font-extrabold text-indigo-600">₹0</span>
            <span className="text-[13px] text-gray-500 font-medium">forever</span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {[
              'Aptitude Foundation — full course',
              'All recorded lectures & notes',
              'Practice questions & DPPs',
              'Doubt support',
            ].map((f) => (
              <li key={f} className="flex items-start gap-2 text-[13px] text-gray-700">
                <IconCheckCircle size={15} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/app/courses"
            className="mt-5 w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-xl bg-indigo-600 text-white text-sm font-extrabold hover:bg-indigo-700 transition"
          >
            Continue Learning Free <IconArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Paid plans from DB — real only */}
      <section>
        <h2 className="text-[15px] font-bold text-gray-900 mb-3">Paid Plans</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
                <div className="h-8 bg-gray-100 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <StudentEmptyState
            variant="compact"
            icon={<IconShield size={26} />}
            title="No paid plans right now"
            description="We're keeping everything free while we build. Any future paid plan will be listed here with full transparency — no hidden charges."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const features = parseFeatures(plan.features);
              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition flex flex-col"
                >
                  <h3 className="text-[16px] font-extrabold text-gray-900">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-[30px] font-extrabold text-gray-900">{formatINR(plan.price)}</span>
                    {plan.durationDays > 0 && (
                      <span className="text-[13px] text-gray-500">/ {plan.durationDays} days</span>
                    )}
                  </div>
                  <ul className="mt-4 space-y-2 flex-1">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] text-gray-600">
                        <IconCheckCircle size={14} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setSelected(plan)}
                    className="w-full mt-5 py-3 rounded-xl bg-gray-900 text-white text-sm font-extrabold hover:bg-gray-800 transition"
                  >
                    Subscribe
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Trust note */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <IconShield size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">Transparent billing, always</p>
            <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
              You&apos;ll only ever be charged for a plan you explicitly choose. Every payment appears
              in your <Link href="/app/payments" className="font-bold text-indigo-600 hover:underline">payment history</Link>.
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        plan={selected}
        busy={busy}
        onConfirm={handleConfirm}
        onClose={() => !busy && setSelected(null)}
      />
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import {
  IconClock, IconCheckCircle, IconX, IconShield, IconArrowRight, IconRefresh,
} from '@/components/student/StudentIcons';

interface Payment {
  id: string;
  orderId: string;
  courseTitle: string;
  amount: number;
  method: string;
  status: string;
  emiMonths: number;
  emiAmount: number;
  createdAt: string;
}

/** Small SVG badge for the payment method — original, no emoji */
function MethodBadge({ method }: { method: string }) {
  const m = (method || '').toUpperCase();
  let label = m || 'PAID';
  let bg = 'bg-slate-100 text-slate-600';
  if (m === 'UPI') { label = 'UPI'; bg = 'bg-emerald-100 text-emerald-700'; }
  else if (m === 'CARD') { label = 'CARD'; bg = 'bg-[#6d28d9]/10 text-[#6d28d9]'; }
  else if (m === 'NETBANKING') { label = 'NETBANKING'; bg = 'bg-amber-100 text-amber-700'; }
  else if (m === 'WALLET') { label = 'WALLET'; bg = 'bg-violet-100 text-violet-700'; }
  else if (m === 'EMI') { label = 'EMI'; bg = 'bg-sky-100 text-sky-700'; }
  else if (m === 'FREE' || m === 'NONE') { label = 'FREE'; bg = 'bg-emerald-100 text-emerald-700'; }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide ${bg}`}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toUpperCase();
  const map: Record<string, string> = {
    SUCCESS: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-amber-100 text-amber-700',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-sky-100 text-sky-700',
  };
  const cls = map[s] || 'bg-slate-100 text-slate-600';
  const icon =
    s === 'SUCCESS' ? <IconCheckCircle size={12} /> :
    s === 'PENDING' ? <IconClock size={12} /> :
    s === 'FAILED' ? <IconX size={12} /> : null;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${cls}`}>
      {icon}
      {s || 'UNKNOWN'}
    </span>
  );
}

function formatINR(n: number) {
  return '₹' + Number(n || 0).toLocaleString('en-IN');
}

type StatusTab = 'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';

const TAB_LABELS: Record<StatusTab, string> = {
  ALL: 'All Purchases',
  SUCCESS: 'Successful',
  PENDING: 'Pending',
  FAILED: 'Failed',
  REFUNDED: 'Refunded',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<StatusTab>('ALL');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/student/payments/history');
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.payments)) {
          setPayments(data.data.payments);
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const successful = payments.filter((p) => (p.status || '').toUpperCase() === 'SUCCESS');
  const totalPaid = successful.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Tabs sirf un status categories par banti hain jo asal data me
  // maujood hain — khaali category ka tab nahi dikhta.
  const presentTabs = (['SUCCESS', 'PENDING', 'FAILED', 'REFUNDED'] as StatusTab[]).filter((t) =>
    payments.some((p) => (p.status || '').toUpperCase() === t)
  );
  const visiblePayments =
    activeTab === 'ALL'
      ? payments
      : payments.filter((p) => (p.status || '').toUpperCase() === activeTab);

  return (
    <main className="space-y-5 pb-20">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--student-text)] tracking-tight">My Purchases</h1>
        <p className="text-sm text-[var(--student-text-muted)] mt-1.5">
          Tumhari saari course purchases aur payments — receipt ke saath, ek jagah.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <IconRefresh size={28} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-800">Couldn&apos;t load payments</p>
          <p className="text-[13px] text-gray-500 mt-1">Please check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2 rounded-xl bg-[#6d28d9] text-white text-sm font-bold hover:bg-[#2a1650] transition"
          >
            Retry
          </button>
        </div>
      ) : payments.length === 0 ? (
        <>
          {/* Honest empty state — StudentEmptyState standard */}
          <StudentEmptyState
            icon={<IconShield size={28} />}
            title="No Purchases Yet"
            description="Abhi tak tumne koi course ya batch nahi kharida hai. Jab tum koi purchase karoge, uski poori detail — amount, method, date aur status — yahan dikhegi."
            actionText="Explore Courses"
            actionHref="/app/courses"
          />
          {/* Trust strip */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <IconShield size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">100% Safe & Transparent</p>
                <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                  Every future payment will appear here with full details — amount, method, date and status.
                  No hidden charges, ever.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Paid</p>
              <p className="text-[22px] font-extrabold text-gray-900 mt-1">{formatINR(totalPaid)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Transactions</p>
              <p className="text-[22px] font-extrabold text-gray-900 mt-1">{payments.length}</p>
            </div>
          </div>

          {/* Status tabs — sirf asal data me maujood categories */}
          {presentTabs.length > 0 && (
            <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Purchase status">
              {(['ALL', ...presentTabs] as StatusTab[]).map((tab) => {
                const count =
                  tab === 'ALL'
                    ? payments.length
                    : payments.filter((p) => (p.status || '').toUpperCase() === tab).length;
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-[#2a1650] text-white border-transparent'
                        : 'border-[var(--student-border)] bg-[var(--student-surface)] text-[var(--student-text-secondary)] hover:border-[#6d28d9] hover:text-[#6d28d9]'
                    }`}
                  >
                    {TAB_LABELS[tab]}
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        active ? 'bg-white/20 text-white' : 'bg-[#6d28d9]/10 text-[#6d28d9]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Transaction list */}
          <section>
            <h2 className="text-[15px] font-bold text-gray-900 mb-3">
              {activeTab === 'ALL' ? 'All Transactions' : `${TAB_LABELS[activeTab]} Transactions`}
            </h2>
            {visiblePayments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
                <p className="text-sm text-gray-500">Is category me koi transaction nahi hai.</p>
              </div>
            ) : (
            <div className="space-y-3">
              {visiblePayments.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{p.courseTitle || 'Course purchase'}</h3>
                      </div>
                      <p className="text-[12px] text-gray-500 mt-1">
                        {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {p.orderId ? ` • Order ${p.orderId.slice(0, 12)}` : ''}
                      </p>
                      {Number(p.emiMonths) > 0 && (
                        <p className="text-[12px] text-gray-500 mt-0.5">
                          EMI: {p.emiMonths} months • {formatINR(Number(p.emiAmount))}/mo
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <MethodBadge method={p.method} />
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[17px] font-extrabold text-gray-900">{formatINR(p.amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </section>
        </>
      )}

      {/* Help strip */}
      <div className="student-card p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[var(--student-text)]">Payment related question?</p>
            <p className="text-[13px] text-[var(--student-text-muted)] mt-0.5">Our counsellors will help you out.</p>
          </div>
          <Link
            href="/app/counsellor"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6d28d9] text-white text-sm font-bold hover:bg-[#2a1650] transition flex-shrink-0"
          >
            Ask Us <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}

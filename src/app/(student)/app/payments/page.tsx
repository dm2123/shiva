'use client';

import PaymentHistory from '@/components/payment/PaymentHistory';

export default function PaymentsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payment History</h1>
      <PaymentHistory />
    </div>
  );
}

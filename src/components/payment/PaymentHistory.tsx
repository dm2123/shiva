'use client';

import { useState, useEffect } from 'react';

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

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch('/api/student/payments/history');
        const data = await res.json();
        if (data.success) setPayments(data.data.payments);
      } catch (err) {
        console.error('Fetch payments error:', err);
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  if (loading) return <div className="text-center py-8 text-slate-500">Loading...</div>;

  const statusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      case 'REFUNDED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const methodIcon = (method: string) => {
    switch (method) {
      case 'UPI': return '💳';
      case 'CARD': return '💳';
      case 'NETBANKING': return '🏦';
      case 'WALLET': return '👛';
      case 'EMI': return '📅';
      default: return '💰';
    }
  };

  return (
    <div className="space-y-4">
      {payments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No payment history</p>
        </div>
      ) : (
        payments.map(payment => (
          <div key={payment.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{methodIcon(payment.method)}</span>
              <div className="flex-1">
                <h3 className="font-medium text-slate-900 dark:text-white">{payment.courseTitle}</h3>
                <p className="text-xs text-slate-500">
                  {payment.method} • {new Date(payment.createdAt).toLocaleDateString('en-IN')}
                </p>
                {payment.emiMonths > 0 && (
                  <p className="text-xs text-slate-500">EMI: {payment.emiMonths} months • ₹{payment.emiAmount}/mo</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white">₹{payment.amount}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { safeFetch } from '@/lib/api-client';

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    safeFetch('/api/admin/payments').then(res => {
      if (res.success) setPayments(res.data || []);
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-slate-900 mb-6">Payment Transactions</h1>
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-3 border">Payment ID</th>
            <th className="p-3 border">Order ID</th>
            <th className="p-3 border">Amount</th>
            <th className="p-3 border">Method</th>
            <th className="p-3 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id} className="border-b">
              <td className="p-3 font-mono text-xs">{p.id}</td>
              <td className="p-3 font-mono text-xs">{p.orderId}</td>
              <td className="p-3">₹{p.amount}</td>
              <td className="p-3">{p.method}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {p.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';

export default function InvoicesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/admin/orders');
        const data = await res.json();
        if (data.success) setOrders(data.data.orders || []);
      } catch (err) {
        console.error('Fetch orders error:', err);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading invoices...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
      {orders.length === 0 ? (
        <p className="text-slate-500">No orders found</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Order ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Student</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order: any) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 text-sm font-mono">{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-sm">{order.studentName || order.studentId}</td>
                  <td className="px-4 py-3 text-sm font-medium">₹{order.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{order.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

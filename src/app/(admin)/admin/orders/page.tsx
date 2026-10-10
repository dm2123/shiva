'use client';

import { useState, useEffect } from 'react';
import { safeFetch } from '@/lib/api-client';

interface Order {
  id: string;
  studentId: string;
  courseId: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    safeFetch('/api/admin/orders').then((res) => {
      if (res.success) setOrders(res.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black text-slate-900 mb-6">Orders</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3 border">Order ID</th>
              <th className="p-3 border">Student ID</th>
              <th className="p-3 border">Amount</th>
              <th className="p-3 border">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-3">{order.id}</td>
                <td className="p-3">{order.studentId}</td>
                <td className="p-3">₹{order.amount}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

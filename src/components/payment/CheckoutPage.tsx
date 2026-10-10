'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
}

interface CheckoutPageProps {
  courseId: string;
}

export default function CheckoutPage({ courseId }: CheckoutPageProps) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('UPI');
  const [emiMonths, setEmiMonths] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/public/courses/${courseId}`);
        const data = await res.json();
        if (data.success) setCourse(data.data.course);
      } catch (err) {
        console.error('Fetch course error:', err);
      }
      setLoading(false);
    };
    fetchCourse();
  }, [courseId]);

  const handlePayment = async () => {
    if (!course) return;
    setProcessing(true);

    try {
      // Create order
      const orderRes = await fetch('/api/student/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          amount: emiMonths > 1 ? course.price : course.price,
          method,
          emiMonths: emiMonths > 0 ? emiMonths : null
        }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        alert(orderData.error.message);
        setProcessing(false);
        return;
      }

      // Mock payment delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Verify payment
      const verifyRes = await fetch('/api/student/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderData.data.orderId }),
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        alert('Payment successful! You are now enrolled.');
        router.push('/app/courses');
      } else {
        alert(verifyData.error.message);
      }
    } catch (err) {
      alert('Payment failed');
    }
    setProcessing(false);
  };

  if (loading) return <div className="text-center py-12 text-slate-500">Loading...</div>;
  if (!course) return <div className="text-center py-12 text-slate-500">Course not found</div>;

  const methods = [
    { id: 'UPI', label: 'UPI', icon: '💳' },
    { id: 'CARD', label: 'Credit/Debit Card', icon: '💳' },
    { id: 'NETBANKING', label: 'Net Banking', icon: '🏦' },
    { id: 'WALLET', label: 'Wallet', icon: '👛' },
    { id: 'EMI', label: 'EMI', icon: '📅' },
  ];

  const emiOptions = [
    { months: 3, label: '3 months' },
    { months: 6, label: '6 months' },
    { months: 9, label: '9 months' },
    { months: 12, label: '12 months' },
  ];

  const finalAmount = emiMonths > 0 ? course.price : course.price;
  const emiAmount = emiMonths > 0 ? Math.round(course.price / emiMonths) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Checkout</h1>

      {/* Course Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white">{course.title}</h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{course.description}</p>
        <div className="mt-3 text-right">
          <span className="text-2xl font-bold text-indigo-600">₹{course.price}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Payment Method</h3>
        <div className="grid grid-cols-2 gap-2">
          {methods.map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`p-3 rounded-lg border-2 text-left ${
                method === m.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <span className="text-lg">{m.icon}</span>
              <p className="text-sm font-medium mt-1">{m.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* EMI Options */}
      {method === 'EMI' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">EMI Options</h3>
          <div className="grid grid-cols-2 gap-2">
            {emiOptions.map(opt => (
              <button
                key={opt.months}
                onClick={() => setEmiMonths(opt.months)}
                className={`p-3 rounded-lg border-2 text-center ${
                  emiMonths === opt.months
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <p className="text-sm font-medium">{opt.label}</p>
                <p className="text-xs text-slate-500">₹{Math.round(course.price / opt.months)}/mo</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Course Fee</span>
            <span className="text-slate-900 dark:text-white">₹{course.price}</span>
          </div>
          {emiMonths > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">EMI ({emiMonths} months)</span>
              <span className="text-slate-900 dark:text-white">₹{emiAmount}/mo</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2">
            <span className="font-bold text-slate-900 dark:text-white">Total</span>
            <span className="font-bold text-indigo-600">₹{finalAmount}</span>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={processing}
        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
      >
        {processing ? 'Processing Payment...' : `Pay ₹${finalAmount}`}
      </button>

      <p className="text-xs text-slate-500 text-center">
        🔒 Secure payment powered by Razorpay (Demo Mode)
      </p>
    </div>
  );
}

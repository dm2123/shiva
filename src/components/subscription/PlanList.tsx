'use client';

import { useState, useEffect } from 'react';

interface Plan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  features: string;
}

interface PlanListProps {
  onSelect: (planId: string) => void;
}

export default function PlanList({ onSelect }: PlanListProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/student/subscriptions/plans');
        const data = await res.json();
        if (data.success) setPlans(data.data.plans);
      } catch (err) {
        console.error('Fetch plans error:', err);
      }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading plans...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {plans.map(plan => {
        const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features;
        return (
          <div
            key={plan.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
            <div className="mt-4">
              <span className="text-4xl font-bold text-indigo-600">₹{plan.price}</span>
              <span className="text-slate-500 text-sm"> / {plan.durationDays} days</span>
            </div>
            <ul className="mt-4 space-y-2">
              {Array.isArray(features) && features.map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => onSelect(plan.id)}
              className="w-full mt-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700"
            >
              Subscribe
            </button>
          </div>
        );
      })}
    </div>
  );
}

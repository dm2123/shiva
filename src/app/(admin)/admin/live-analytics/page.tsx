'use client';

import { useState, useEffect } from 'react';

export default function LiveAnalyticsPage() {
  const [stats, setStats] = useState({ total: 0, live: 0, completed: 0, scheduled: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/live-classes');
        const data = await res.json();
        if (data.success) {
          const classes = data.data.liveClasses || [];
          setStats({
            total: classes.length,
            live: classes.filter((c: any) => c.status === 'LIVE').length,
            completed: classes.filter((c: any) => c.status === 'COMPLETED').length,
            scheduled: classes.filter((c: any) => c.status === 'SCHEDULED').length,
          });
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Live Class Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Classes', value: stats.total, color: 'bg-blue-600' },
          { label: 'Currently Live', value: stats.live, color: 'bg-red-600' },
          { label: 'Completed', value: stats.completed, color: 'bg-green-600' },
          { label: 'Scheduled', value: stats.scheduled, color: 'bg-yellow-600' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-xl p-4 text-white`}>
            <p className="text-sm opacity-80">{stat.label}</p>
            <p className="text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

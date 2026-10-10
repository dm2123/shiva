'use client';

import { useState, useEffect } from 'react';

export default function LiveMonitoringPage() {
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await fetch('/api/admin/live-classes');
        const data = await res.json();
        if (data.success) {
          setLiveClasses(data.data.liveClasses?.filter((lc: any) => lc.status === 'LIVE') || []);
        }
      } catch (err) {
        console.error('Fetch live classes error:', err);
      }
      setLoading(false);
    };
    fetchLive();
  }, []);

  if (loading) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Live Monitoring</h1>
      {liveClasses.length === 0 ? (
        <p className="text-slate-500">No live classes currently</p>
      ) : (
        <div className="grid gap-4">
          {liveClasses.map((lc: any) => (
            <div key={lc.id} className="bg-white rounded-xl border p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold">{lc.title}</h3>
                <p className="text-sm text-slate-500">Started: {new Date(lc.startTime).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-red-600">LIVE</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

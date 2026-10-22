'use client';

import { useState, useEffect } from 'react';

interface XPData {
  totalXP: number;
  history: Array<{ id: string; points: number; source: string; description: string; createdAt: string }>;
  bySource: Array<{ source: string; total: number }>;
}

export default function XPDisplay() {
  const [data, setData] = useState<XPData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchXP = async () => {
      try {
        const res = await fetch('/api/student/xp');
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (err) {
        console.error('Fetch XP error:', err);
      }
      setLoading(false);
    };
    fetchXP();
  }, []);

  const sourceIcon = (source: string) => {
    switch (source) {
      case 'TEST': return '📝';
      case 'LECTURE': return '📚';
      case 'DPP': return '📋';
      case 'STREAK': return '🔥';
      case 'REFERRAL': return '👥';
      case 'DAILY_LOGIN': return '✅';
      case 'SCHOLARSHIP': return '🏆';
      default: return '⭐';
    }
  };

  const sourceColor = (source: string) => {
    switch (source) {
      case 'TEST': return 'bg-blue-100 text-blue-800';
      case 'LECTURE': return 'bg-purple-100 text-purple-800';
      case 'DPP': return 'bg-yellow-100 text-yellow-800';
      case 'STREAK': return 'bg-orange-100 text-orange-800';
      case 'REFERRAL': return 'bg-green-100 text-green-800';
      case 'DAILY_LOGIN': return 'bg-indigo-100 text-indigo-800';
      case 'SCHOLARSHIP': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Loading XP data...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Total XP */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white text-center">
        <p className="text-sm opacity-80">Total XP Earned</p>
        <p className="text-5xl font-bold mt-2">{data?.totalXP || 0}</p>
        <p className="text-xs opacity-70 mt-2">Keep earning to climb the leaderboard!</p>
      </div>

      {/* XP by Source */}
      {data?.bySource && data.bySource.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">XP Sources</h3>
          <div className="space-y-2">
            {data.bySource.map((item) => (
              <div key={item.source} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{sourceIcon(item.source)}</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300">{item.source}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${sourceColor(item.source)}`}>
                  +{item.total} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent History */}
      {data?.history && data.history.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-bold text-slate-900 dark:text-white mb-3">Recent Activity</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {data.history.slice(0, 20).map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                <span className="text-lg">{sourceIcon(item.source)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white truncate">
                    {item.description || item.source}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <span className="text-sm font-bold text-green-600">+{item.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
